from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import time
import subprocess
import whisper
from pydub import AudioSegment
from pydub.silence import split_on_silence
from pyannote.audio import Pipeline
from colorama import Fore, init
import re
from dotenv import load_dotenv
from keybert import KeyBERT
import google.generativeai as genai
from flask import send_from_directory

init(autoreset=True)
load_dotenv(dotenv_path='.env.local')

app = Flask(__name__)
CORS(app, resources={r"/upload": {"origins": "*"}, r"/extract-keypoints": {"origins": "*"}})

AUDIO_DIR = 'uploaded_audio'
os.makedirs(AUDIO_DIR, exist_ok=True)

# Load models once (faster for multiple calls)
print(Fore.CYAN + "Loading models...")
whisper_model = whisper.load_model('small')
kw_model = KeyBERT(model='all-MiniLM-L6-v2')
gemini_model = genai.GenerativeModel('models/gemini-1.5-flash')
genai.configure(api_key=os.getenv("API_KEY"))

# Load diarization pipeline once
try:
    diarization_pipeline = Pipeline.from_pretrained(
        "pyannote/speaker-diarization-3.1",
        use_auth_token=os.getenv("HUGGINGFACE_AUTH_TOKEN")
    )
except Exception as e:
    print(Fore.RED + f"Error loading diarization model: {e}")
    diarization_pipeline = None


def check_ffmpeg():
    try:
        subprocess.run(["ffmpeg", "-version"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
        return True
    except FileNotFoundError:
        print(Fore.RED + "Error: FFmpeg not found in PATH.")
        return False


def normalize(sound):
    return sound.apply_gain(-sound.dBFS)


def split_audio_into_chunks(audio_path, output_folder, min_silence_len=700, silence_thresh=-40):
    try:
        print(Fore.CYAN + "Splitting audio into chunks...")
        sound = AudioSegment.from_file(audio_path)
        sound = normalize(sound).high_pass_filter(100)

        chunks = split_on_silence(sound, min_silence_len=min_silence_len, silence_thresh=silence_thresh)

        chunk_files = []
        for i, chunk in enumerate(chunks):
            padded_chunk = AudioSegment.silent(duration=500) + chunk + AudioSegment.silent(duration=500)
            chunk_file = os.path.join(output_folder, f"chunk{i+1}.wav")
            padded_chunk.export(chunk_file, format="wav")
            chunk_files.append(chunk_file)
            print(Fore.GREEN + f"Exported chunk: {chunk_file}")

        return chunk_files
    except Exception as e:
        print(Fore.RED + f"Chunk splitting failed: {e}")
        return []


def transcribe_audio(audio_file_path):
    try:
        print(Fore.YELLOW + f"Transcribing: {audio_file_path}")
        result = whisper_model.transcribe(audio_file_path, task="translate")
        return result['text'], result['segments']
    except Exception as e:
        print(Fore.RED + f"Transcription error: {e}")
        return "", []


def diarize_chunk(audio_file_path):
    if not diarization_pipeline:
        print(Fore.RED + "Diarization pipeline not available.")
        return []
    try:
        print(Fore.YELLOW + f"Diarizing: {audio_file_path}")
        diarization = diarization_pipeline(audio_file_path)
        return [{
            "start": turn.start,
            "end": turn.end,
            "speaker": speaker
        } for turn, _, speaker in diarization.itertracks(yield_label=True)]
    except Exception as e:
        print(Fore.RED + f"Diarization error: {e}")
        return []


def get_overlap(seg1, seg2):
    return max(0, min(seg1['end'], seg2['end']) - max(seg1['start'], seg2['start']))

def merge_diarization_transcription(transcription_segments, diarization_segments):
    merged_output = []
    speaker_mapping = {}
    speaker_counter = 1

    for seg in transcription_segments:
        best_match = None
        max_overlap = 0
        for diar in diarization_segments:
            overlap = get_overlap({'start': seg['start'], 'end': seg['end']}, diar)
            if overlap > max_overlap:
                best_match = diar
                max_overlap = overlap

        if best_match:
            speaker = best_match['speaker']
            if speaker not in speaker_mapping:
                speaker_mapping[speaker] = f"Speaker {speaker_counter}"
                speaker_counter += 1
            seg['speaker'] = speaker_mapping[speaker]
        else:
            seg['speaker'] = "Unknown"

    # Group by speaker
    current_speaker = None
    current_text = []
    for seg in transcription_segments:
        if seg['speaker'] != current_speaker:
            if current_speaker and current_text:
                merged_output.append(f"{current_speaker}: {' '.join(current_text)}")
            current_speaker = seg['speaker']
            current_text = [seg['text']]
        else:
            current_text.append(seg['text'])

    if current_speaker and current_text:
        merged_output.append(f"{current_speaker}: {' '.join(current_text)}")

    return "\n".join(merged_output)



def clean_transcription_for_summary(text):
    return " ".join(line.split(":", 1)[-1].strip()
                    for line in text.splitlines() if ":" in line)


def generate_with_gemini(prompt, text):
    try:
        full_prompt = f"{prompt}\n\n{text}"
        response = gemini_model.generate_content(full_prompt)
        return response.text.strip()
    except Exception as e:
        print(Fore.RED + f"Gemini generation error: {e}")
        return None


def summarize_text_with_gemini(text):
    prompt = (
        "You are a professional transcription assistant. Provide a concise, paragraph-style summary of this meeting transcript. "
        "Highlight important decisions, discussions, and key points in a clear and formal tone."
    )
    cleaned = clean_transcription_for_summary(text)
    return generate_with_gemini(prompt, cleaned) or "Summary not available."


def extract_keypoints_with_gemini(text):
    prompt = (
        "Extract 5-7 key points from the following meeting transcript. Each point should be a short, bulleted line summarizing a main discussion or decision:"
    )
    response = generate_with_gemini(prompt, text)
    if not response:
        return []

    return [line.strip("•- ").strip()
            for line in response.splitlines()
            if line.strip().startswith(("•", "-", "*"))]


@app.route("/")
def index():
    return "Audio processing server is running."


@app.route("/upload", methods=["POST"])
def handle_audio_upload():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files['audio']
    timestamp = str(int(time.time()))
    audio_filename = f"{timestamp}.wav"
    audio_filepath = os.path.join(AUDIO_DIR, audio_filename)
    audio_file.save(audio_filepath)

    diarization_segments = diarize_chunk(audio_filepath)
    audio_chunks = split_audio_into_chunks(audio_filepath, AUDIO_DIR)

    all_transcriptions = []
    for chunk_file in audio_chunks:
        _, segments = transcribe_audio(chunk_file)
        all_transcriptions.extend(segments)

    merged_transcription = merge_diarization_transcription(all_transcriptions, diarization_segments)
    summary = summarize_text_with_gemini(merged_transcription)
    key_points = extract_keypoints_with_gemini(merged_transcription)

    # Save to file
    os.makedirs("saved_outputs", exist_ok=True)
    output_file_path = os.path.join("saved_outputs", f"{timestamp}_meeting_notes.txt")
    try:
        with open(output_file_path, "w", encoding="utf-8") as f:
            f.write("=== Meeting Summary ===\n")
            f.write(summary + "\n\n")
            f.write("=== Key Points ===\n")
            for point in key_points:
                f.write(f"- {point}\n")
            f.write("\n=== Full Transcription ===\n")
            f.write(merged_transcription)
        print(Fore.GREEN + f"Saved meeting notes to {output_file_path}")
        download_url = f"/download/{timestamp}_meeting_notes.txt"
    except Exception as e:
        print(Fore.RED + f"Failed to save file: {e}")
        download_url = None  # Set to None if file saving fails
    
    return jsonify({
        "summary": summary,
        "key_points": key_points,
        "transcription": merged_transcription,
        "download_url": download_url
    })


@app.route("/download/<filename>", methods=["GET"])
def download_file(filename):
    try:
        return send_from_directory("saved_outputs", filename, as_attachment=True)
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404

@app.route("/extract-keypoints", methods=["POST"])
def handle_keypoints():
    try:
        data = request.get_json()
        text = data.get('transcription')
        if not text:
            return jsonify({'error': 'No transcription provided'}), 400
        return jsonify({'keypoints': extract_keypoints_with_gemini(text)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == "__main__":
    if check_ffmpeg():
        app.run(debug=True)
