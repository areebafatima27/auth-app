# from transformers import pipeline

# # Load the summarization pipeline
# summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

# def summarize_text(text, max_chunk_size=1024):
#     """
#     Summarizes the given text using the BART model.
    
#     Args:
#         text (str): The text to summarize.
#         max_chunk_size (int): Maximum size of each chunk for summarization.
    
#     Returns:
#         str: The summarized text.
#     """
#     # Split text into chunks that fit within the model's max token length
#     if len(text) <= max_chunk_size:
#         print("Text is small enough to summarize directly...")
#         chunks = [text]  # No need to split
#     else:
#         print("Text is too large, splitting into chunks for summarization...")
#         chunks = [text[i:i+max_chunk_size] for i in range(0, len(text), max_chunk_size)]
    
#     summary = []
#     for chunk in chunks:
#         # Dynamically set the max_length based on input length, ensuring it's less than the input
#         input_length = len(chunk.split())
#         max_length = min(300, max(50, int(input_length * 0.5)))  # 50% of input length or at least 50 tokens
        
#         # Summarize each chunk
#         summarized_chunk = summarizer(chunk, max_length=max_length, min_length=50, do_sample=False)[0]['summary_text']
#         summary.append(summarized_chunk)
    
#     # Combine all summarized chunks into one text
#     summary_text = ' '.join(summary)
#     return summary_text