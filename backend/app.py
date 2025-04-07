from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import time
import subprocess
import whisper  # OpenAI Whisper for transcription
from pydub import AudioSegment
from pydub.silence import split_on_silence
from pyannote.audio import Pipeline  # Pyannote for diarization
from colorama import Fore, init
import json
from transformers import pipeline
import re
from dotenv import load_dotenv  # Import dotenv to load environment variables
import yake

init(autoreset=True)

# Load environment variables from .env.local
load_dotenv(dotenv_path='.env.local')

app = Flask(__name__)
CORS(app, resources={r"/upload": {"origins": "*"}, r"/extract-keypoints": {"origins": "*"}})  # Allow CORS for frontend requests

# Create a directory for uploaded audio files
AUDIO_DIR = 'uploaded_audio'
if not os.path.exists(AUDIO_DIR):
    os.makedirs(AUDIO_DIR)

# Load Whisper model once globally when the app starts
whisper_model = whisper.load_model('small')
# Load the Hugging Face summarization pipeline globally
summarizer = pipeline("summarization", model="t5-small")

# Function to check if FFmpeg is installed
def check_ffmpeg():
    try:
        subprocess.run(["ffmpeg", "-version"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
        return True
    except FileNotFoundError:
        print(Fore.RED + "Error: FFmpeg is not installed or not in PATH.")
        return False

# Function to split audio into chunks based on silence
def split_audio_into_chunks(audio_path, output_folder, min_silence_len=700, silence_thresh=-40):
    """Splits audio into chunks based on silence detection."""
    print(Fore.CYAN + "Splitting audio into chunks...")
    try:
        sound = AudioSegment.from_file(audio_path)
        chunks = split_on_silence(sound, min_silence_len=min_silence_len, silence_thresh=silence_thresh)
        
        if not os.path.exists(output_folder):
            os.makedirs(output_folder)

        chunk_files = []
        for i, chunk in enumerate(chunks):
            chunk_file = os.path.join(output_folder, f"chunk{i + 1}.wav")
            chunk.export(chunk_file, format="wav")
            chunk_files.append(chunk_file)
            print(Fore.GREEN + f"Exported chunk: {chunk_file}")

        print(Fore.CYAN + f"Total {len(chunk_files)} chunks created.")
        return chunk_files
    except Exception as e:
        print(Fore.RED + f"Error during audio splitting: {e}")
        return []

def clean_summary(summary):
    """Remove any remaining speaker labels or redundant information from the summary."""
    cleaned_summary = re.sub(r'speaker \d+:\s*', '', summary, flags=re.IGNORECASE)
    return cleaned_summary

def summarize_text(text, max_chunk_size=1024):
    # Split text into chunks that fit within the model's max token length
    if len(text) <= max_chunk_size:
        print("Text is small enough to summarize directly...")
        chunks = [text]  # No need to split
    else:
        print("Text is too large, splitting into chunks for summarization...")
        chunks = [text[i:i+max_chunk_size] for i in range(0, len(text), max_chunk_size)]
    
    summary = []
    for chunk in chunks:
        # Dynamically set the max_length based on input length, ensuring it's less than the input
        input_length = len(chunk.split())
        max_length = min(300, max(50, int(input_length * 0.3)))  # 30% of input length or at least 50 tokens
        
        # Summarize each chunk
        summarized_chunk = summarizer(chunk, max_length=max_length, min_length=25, do_sample=False)[0]['summary_text']
        summary.append(summarized_chunk)
    
    # Combine all summarized chunks into one text
    summary_text = ' '.join(summary)
    return summary_text


# Function to transcribe an audio file using Whisper
def transcribe_audio(audio_file_path):
    """Transcribes an audio file using the preloaded Whisper model."""
    try:
        print(Fore.YELLOW + f"Transcribing: {audio_file_path}")
        result = whisper_model.transcribe(audio_file_path, task="translate")  # Translate to English
        return result['text'], result['segments']
    except Exception as e:
        print(Fore.RED + f"Error during transcription: {str(e)}")
        return f"Error transcribing audio: {str(e)}", []

def remove_diarization(transcription):
    """Remove speaker labels from transcription text."""
    # Regex pattern to remove speaker labels (e.g., 'speaker 1:')
    cleaned_text = re.sub(r'speaker \d+:\s*', '', transcription, flags=re.IGNORECASE)
    return cleaned_text

# Function to diarize an audio chunk using Pyannote on CPU
def diarize_chunk(audio_file_path):
    """Diarizes an audio chunk to identify speakers."""
    print(Fore.YELLOW + f"Diarizing: {audio_file_path}")
    try:
        # Get the Hugging Face token from environment variable
        hf_token = os.getenv("HUGGINGFACE_AUTH_TOKEN")

        pipeline = Pipeline.from_pretrained(
            "pyannote/speaker-diarization-3.1",
            use_auth_token=hf_token  # Use the token from .env.local
        )

        diarization = pipeline(audio_file_path)
        result = []
        for turn, _, speaker in diarization.itertracks(yield_label=True):
            result.append({
                "start": turn.start,
                "end": turn.end,
                "speaker": speaker
            })
            print(f"start={turn.start:.1f}s stop={turn.end:.1f}s speaker_{speaker}")

        return result

    except Exception as e:
        print(Fore.RED + f"Error during diarization: {str(e)}")
        return []


# Function to extract key points from text using YAKE
def extract_keypoints(text):
    """Extracts key phrases from the transcription using YAKE."""
    try:
        # Set up YAKE parameters
        language = "en"  # Set the language to English
        max_ngram_size = 3  # Extract phrases of 1 to 3 words
        num_keywords = 5  # Number of key phrases to extract
        yake_model = yake.KeywordExtractor(lan=language, n=1, dedupLim=0.9, top=num_keywords, features=None)

        # Extract keywords
        keywords = yake_model.extract_keywords(text)
        keypoints = [keyword[0] for keyword in keywords]  # Extract only the phrases (not the scores)
        print(Fore.GREEN + "Extracted Key Points: ", keypoints)

        return keypoints
    except Exception as e:
        print(Fore.RED + f"Error during key point extraction: {e}")
        return []


# Function to merge diarization and transcription
def merge_diarization_transcription(transcription_segments, diarization_segments):
    """Combines transcription and diarization into a single block with proper speaker labeling."""
    merged_output = []
    current_speaker = None
    current_text = []
    
    # Normalize speaker labels (e.g., convert 'SPEAKER_00' to 'Speaker 1')
    speaker_mapping = {}
    speaker_counter = 1  # To assign sequential speaker numbers
    
    for segment in transcription_segments:
        segment_start = segment['start']
        segment_text = segment['text']

        # Find the corresponding speaker for this transcription segment
        speaker_label = None
        for diarization in diarization_segments:
            if diarization['start'] <= segment_start <= diarization['end']:
                diarized_speaker = diarization['speaker']

                # Map the diarization speaker label to a consistent label like "Speaker 1", "Speaker 2", etc.
                if diarized_speaker not in speaker_mapping:
                    speaker_mapping[diarized_speaker] = f"Speaker {speaker_counter}"
                    speaker_counter += 1
                
                speaker_label = speaker_mapping[diarized_speaker]
                break

        # If no diarization info is found, assume it's the same speaker as the previous one
        if not speaker_label:
            speaker_label = current_speaker if current_speaker else "Speaker 1"
        
        # If the speaker changes, finalize the previous speaker's block and start a new one
        if speaker_label != current_speaker:
            if current_speaker is not None:
                merged_output.append(f"{current_speaker}: {' '.join(current_text)}")
            current_speaker = speaker_label
            current_text = [segment_text]
        else:
            # Continue adding to the same speaker's block
            current_text.append(segment_text)

    # Append the last speaker's block
    if current_speaker:
        merged_output.append(f"{current_speaker}: {' '.join(current_text)}")

    return "\n".join(merged_output)


@app.route('/')
def index():
    return 'Audio upload, recording, transcription, and diarization server is running.'

@app.route('/extract-keypoints', methods=['POST'])
def handle_keypoints():
    try:
        data = request.get_json()
        transcription = data.get('transcription', '')

        if not transcription:
            return jsonify({'error': 'No transcription provided'}), 400

        keypoints = extract_keypoints(transcription)
        return jsonify({'keypoints': keypoints})  # Ensure lowercase 'keypoints'

    except Exception as e:
        return jsonify({'error': str(e)}), 500



@app.route('/upload', methods=['POST'])
def upload_audio():
    """Handles audio file uploads and processes transcription, diarization, summarization, and key points extraction."""
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file found"}), 400

    audio_file = request.files['audio']
    custom_filename = request.form.get('filename', 'recording')
    timestamp = int(time.time())

    # Save the uploaded file in .webm format
    webm_file_path = os.path.join(AUDIO_DIR, f'{custom_filename}_{timestamp}.webm')
    audio_file.save(webm_file_path)

    # Convert .webm to .mp3 using FFmpeg
    mp3_file_path = os.path.join(AUDIO_DIR, f'{custom_filename}_{timestamp}.mp3')

    if not check_ffmpeg():
        return jsonify({"error": "FFmpeg is not installed"}), 500

    try:
        subprocess.run(['ffmpeg', '-i', webm_file_path, '-vn', '-ar', '44100', '-ac', '2', '-b:a', '192k', mp3_file_path],
                       check=True)
        print(Fore.GREEN + f"Converted {webm_file_path} to {mp3_file_path}")
    except subprocess.CalledProcessError as e:
        print(Fore.RED + f"FFmpeg conversion error: {e}")
        return jsonify({"error": "Error converting audio file"}), 500

    # Split the MP3 file into chunks
    chunk_folder = os.path.join(AUDIO_DIR, f'{custom_filename}_chunks')
    audio_chunks = split_audio_into_chunks(mp3_file_path, chunk_folder)

    if not audio_chunks:
        return jsonify({"error": "No audio chunks created"}), 500

    # Process each chunk
    merged_transcription = []
    for i, chunk_path in enumerate(audio_chunks):
        transcription_text, transcription_segments = transcribe_audio(chunk_path)
        diarization_segments = diarize_chunk(chunk_path)
        merged_text = merge_diarization_transcription(transcription_segments, diarization_segments)
        merged_transcription.append(merged_text)

    full_transcription = "\n".join(merged_transcription)

    # Summarize the merged transcription
    cleaned_transcription = remove_diarization(full_transcription)
    summary_text = summarize_text(cleaned_transcription)

    # Extract key points using YAKE
    keypoints = extract_keypoints(summary_text)

    return jsonify({
        "transcription": full_transcription,
        "summary": summary_text,
        "keypoints": keypoints  # Include key points in the response
    })


# Running the Flask app
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
