const fileInput = document.getElementById("audio-file");
const audioElement = document.createElement("audio");
document.body.appendChild(audioElement); // Adding audio element to the body
const errorMessage = document.getElementById("errorMessage");
const transcriptionResult = document.getElementById("transcription-result");
const diarizationResult = document.getElementById("diarization-result"); // Element to show speaker diarization

// File input handler (When user selects an audio file to upload)
fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        const audioUrl = URL.createObjectURL(file);
        audioElement.src = audioUrl;
        audioElement.style.display = "block";
        uploadAudio(file); // Upload the selected file
    } else {
        showError("No audio file selected.");
    }
});

// Function to upload audio to the server
async function uploadAudio(audioFile) {
    const formData = new FormData();
    formData.append("audio", audioFile);

    try {
        const response = await fetch("http://127.0.0.1:5000/upload", {
            method: "POST",
            body: formData,
        });

        // Check if response is OK
        if (!response.ok) {
            const errorText = await response.text(); // Get error page text
            throw new Error(`Error uploading audio: ${response.status} - ${errorText}`);
        }

        // Try to parse the response as JSON
        let result;
        try {
            result = await response.json();
        } catch (jsonError) {
            console.error("Failed to parse JSON response", jsonError);
            showError("Unexpected server response. Please try again.");
            return;
        }

        console.log("Audio uploaded successfully", result);

        // Show transcription result
        if (result.transcription) {
            transcriptionResult.textContent = result.transcription; // Display transcription result
        } else {
            showError("No transcription result returned.");
        }

        // Show diarization result (speaker segments)
        if (result.diarization && Array.isArray(result.diarization)) {
            diarizationResult.innerHTML = ""; // Clear previous results

            // Loop through each speaker segment and display it
            result.diarization.forEach((segment) => {
                const segmentDiv = document.createElement("div");
                segmentDiv.innerHTML = `<p><strong>Speaker ${segment.speaker}:</strong> ${segment.text}</p>`;
                diarizationResult.appendChild(segmentDiv);
            });
        } else {
            showError("No diarization result returned.");
        }
    } catch (error) {
        console.error("Error uploading audio", error);
        showError("Error uploading audio. Please try again.");
    }
}

// Function to show error messages
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
}
