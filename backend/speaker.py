# import os
# import torch
# from pyannote.audio import Pipeline
# from pydub import AudioSegment
# from huggingface_hub import login

# # Define your Hugging Face token (make sure it's the correct token)
# hf_token = "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"

# # Function to log into Hugging Face using the token
# def hf_login():
#     try:
#         # Use the token to log in (it should already be cached)
#         login(token=hf_token)
#         print("Hugging Face login successful!")
#     except Exception as e:
#         print(f"Error logging into Hugging Face: {e}")

# # Initialize the pyannote.audio pipeline for speaker diarization
# def load_diarization_pipeline():
#     try:
#         hf_login()  # Ensure that you are logged into Hugging Face
        
#         # Load the speaker diarization pipeline from pyannote.audio
#         print("Loading pyannote.audio diarization pipeline...")
#         pipeline = Pipeline.from_pretrained("pyannote/speaker-diarization", use_auth_token=hf_token)
#         return pipeline
#     except Exception as e:
#         print(f"Error loading diarization pipeline: {str(e)}")
#         return None

# # Perform diarization and return the diarized text with time segments and speaker labels
# def diarize_speakers(audio_file):
#     print(f"Performing speaker diarization on: {audio_file}")
#     try:
#         # Load the diarization pipeline
#         pipeline = load_diarization_pipeline()

#         # If the pipeline is not loaded, return an error
#         if pipeline is None:
#             return {"diarization_text": "Error: Diarization pipeline not loaded."}

#         # Convert the audio file to wav format if it's not already in wav
#         if not audio_file.endswith(".wav"):
#             sound = AudioSegment.from_file(audio_file)
#             audio_file_wav = audio_file.replace(audio_file.split(".")[-1], "wav")
#             sound.export(audio_file_wav, format="wav")
#             audio_file = audio_file_wav

#         # Apply diarization pipeline to the audio file
#         diarization = pipeline(audio_file) 

#         # Create a string to store the diarized result
#         diarized_text = ""
#         for turn, _, speaker in diarization.itertracks(yield_label=True):
#             diarized_text += f"Speaker {speaker} from {turn.start:.1f}s to {turn.end:.1f}s\n"

#         return {"diarization_text": diarized_text}
#     except Exception as e:
#         print(f"Error during speaker diarization: {str(e)}")
#         return {"diarization_text": f"Error performing speaker diarization: {str(e)}"}