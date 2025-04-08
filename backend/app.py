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

init(autoreset=True)

# Load environment variables
load_dotenv(dotenv_path='.env.local')

app = Flask(__name__)
CORS(app, resources={r"/upload": {"origins": "*"}, r"/extract-keypoints": {"origins": "*"}})

# Directory setup
AUDIO_DIR = 'uploaded_audio'
os.makedirs(AUDIO_DIR, exist_ok=True)

# Model initialization
whisper_model = whisper.load_model('small')
kw_model = KeyBERT(model='all-MiniLM-L6-v2')
genai.configure(api_key=os.getenv("API_KEY"))
gemini_model = genai.GenerativeModel('models/gemini-1.5-flash')

def check_ffmpeg():
    try:
        subprocess.run(["ffmpeg", "-version"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
        return True
    except FileNotFoundError:
        print(Fore.RED + "Error: FFmpeg is not installed or not in PATH.")
        return False

def split_audio_into_chunks(audio_path, output_folder, min_silence_len=700, silence_thresh=-40):
    """Split audio into chunks based on silence detection."""
    print(Fore.CYAN + "Splitting audio into chunks...")
    try:
        sound = AudioSegment.from_file(audio_path)
        chunks = split_on_silence(sound, min_silence_len=min_silence_len, silence_thresh=silence_thresh)
        
        chunk_files = []
        for i, chunk in enumerate(chunks):
            chunk_file = os.path.join(output_folder, f"chunk{i + 1}.wav")
            chunk.export(chunk_file, format="wav")
            chunk_files.append(chunk_file)
            print(Fore.GREEN + f"Exported chunk: {chunk_file}")

        return chunk_files
    except Exception as e:
        print(Fore.RED + f"Audio splitting error: {e}")
        return []

def transcribe_audio(audio_file_path):
    """Transcribe audio using Whisper."""
    try:
        print(Fore.YELLOW + f"Transcribing: {audio_file_path}")
        result = whisper_model.transcribe(audio_file_path, task="translate")
        return result['text'], result['segments']
    except Exception as e:
        print(Fore.RED + f"Transcription error: {e}")
        return f"Error: {e}", []

def diarize_chunk(audio_file_path):
    """Identify speakers using Pyannote."""
    print(Fore.YELLOW + f"Diarizing: {audio_file_path}")
    try:
        pipeline = Pipeline.from_pretrained(
            "pyannote/speaker-diarization-3.1",
            use_auth_token=os.getenv("HUGGINGFACE_AUTH_TOKEN")
        )
        diarization = pipeline(audio_file_path)
        return [{
            "start": turn.start,
            "end": turn.end,
            "speaker": speaker
        } for turn, _, speaker in diarization.itertracks(yield_label=True)]
    except Exception as e:
        print(Fore.RED + f"Diarization error: {e}")
        return []

def merge_diarization_transcription(transcription_segments, diarization_segments):
    """Merge transcription with speaker diarization."""
    merged_output = []
    current_speaker = None
    current_text = []
    speaker_mapping = {}
    speaker_counter = 1

    for segment in transcription_segments:
        segment_start = segment['start']
        speaker_label = None
        
        for diar in diarization_segments:
            if diar['start'] <= segment_start <= diar['end']:
                diarized_speaker = diar['speaker']
                if diarized_speaker not in speaker_mapping:
                    speaker_mapping[diarized_speaker] = f"Speaker {speaker_counter}"
                    speaker_counter += 1
                speaker_label = speaker_mapping[diarized_speaker]
                break

        speaker_label = speaker_label or (current_speaker if current_speaker else "Speaker 1")
        
        if speaker_label != current_speaker:
            if current_speaker and current_text:
                merged_output.append(f"{current_speaker}: {' '.join(current_text)}")
            current_speaker = speaker_label
            current_text = [segment['text']]
        else:
            current_text.append(segment['text'])

    if current_speaker and current_text:
        merged_output.append(f"{current_speaker}: {' '.join(current_text)}")
    
    return "\n".join(merged_output)

def clean_transcription_for_summary(text):
    """Clean transcription by removing speaker labels and filler words."""
    lines = text.splitlines()
    cleaned_lines = []
    for line in lines:
        if ":" in line:
            _, content = line.split(":", 1)
            cleaned_line = content.strip()
            if cleaned_line and not cleaned_line.lower().startswith(("um", "uh", "like")):
                cleaned_lines.append(cleaned_line)
    return " ".join(cleaned_lines)

def generate_with_gemini(prompt, text):
    """Generic function for Gemini interactions."""
    try:
        full_prompt = f"{prompt}\n\n{text}"
        response = gemini_model.generate_content(full_prompt)
        return response.text.strip()
    except Exception as e:
        print(Fore.RED + f"Gemini error: {e}")
        return None

def summarize_text_with_gemini(text):
    """Generate summary using Gemini."""
    cleaned_text = clean_transcription_for_summary(text)
    prompt = (
        "You are an expert audio transcription assistant. Summarize the following audio transcript in a professional tone. "
        "Focus on the main points discussed, key actions, and important information. "
        "Present the summary in a coherent and concise paragraph:\n"
    )
    return generate_with_gemini(prompt, cleaned_text) or "Could not generate summary"

def extract_keypoints_with_gemini(text):
    """Extract key points using Gemini and return only the bulleted lines."""
    prompt = (
        "Extract the 5-7 most important key points from this transcript. "
        "Format as a bulleted list focusing on decisions, actions, and main ideas:\n"
    )
    response = generate_with_gemini(prompt, text)
    if not response:
        return []

    # Keep only bullet points and clean them
    keypoints = [
        line.strip("•- ").strip()
        for line in response.splitlines()
        if line.strip().startswith(("•", "-", "*"))
    ]
    return keypoints



@app.route("/")
def index():
    return "Audio processing server is running."

@app.route("/upload", methods=["POST"])
def handle_audio_upload():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files['audio']
    audio_filename = f"{time.time()}.wav"
    audio_filepath = os.path.join(AUDIO_DIR, audio_filename)
    audio_file.save(audio_filepath)
    
    # Process audio
    audio_chunks = split_audio_into_chunks(audio_filepath, AUDIO_DIR)
    
    all_transcriptions = []
    all_diarizations = []
    for chunk_file in audio_chunks:
        _, segments = transcribe_audio(chunk_file)
        all_transcriptions.extend(segments)
        all_diarizations.extend(diarize_chunk(chunk_file))
    
    merged_transcription = merge_diarization_transcription(all_transcriptions, all_diarizations)
    
    return jsonify({
        "summary": summarize_text_with_gemini(merged_transcription),
        "key_points": extract_keypoints_with_gemini(merged_transcription),
        "transcription": merged_transcription
    })

@app.route("/extract-keypoints", methods=["POST"])
def handle_keypoints():
    try:
        data = request.get_json()
        if not (text := data.get('transcription')):
            return jsonify({'error': 'No transcription provided'}), 400
        return jsonify({'keypoints': extract_keypoints_with_gemini(text)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    if check_ffmpeg():
        app.run(debug=True)