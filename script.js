document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('button').addEventListener('click', downloadVideo);
    document.getElementById('video-url').addEventListener('input', fetchFormats);
});

function fetchFormats() {
    const videoUrl = document.getElementById('video-url').value;
    const messageDiv = document.getElementById('message');
    const formatSelectionDiv = document.getElementById('format-selection');
    const formatSelect = document.getElementById('format');

    messageDiv.innerHTML = '';
    formatSelectionDiv.style.display = 'none';
    formatSelect.innerHTML = '';

    if (!videoUrl) {
        return;
    }

    messageDiv.innerHTML = '<p>Fetching formats... <span class="spinner"></span></p>';

    fetch(`/formats?url=${encodeURIComponent(videoUrl)}`)
        .then(response => response.json())
        .then(formats => {
            messageDiv.innerHTML = '';

            // Filter formats to only include MP4 with audio in 360p, 480p, 720p, 1080p, and MP3
            const filteredFormats = formats.filter(format => {
                return (format.container === 'mp4' && ['360p', '480p', '720p', '1080p'].includes(format.qualityLabel) && format.audioBitrate) ||
                       (format.container === 'mp3');
            });

            if (filteredFormats.length === 0) {
                messageDiv.innerHTML = '<p style="color: red;">No suitable formats available.</p>';
                return;
            }

            filteredFormats.forEach(format => {
                const option = document.createElement('option');
                option.value = format.itag;
                option.textContent = `${format.qualityLabel || 'Unknown Quality'} - ${format.container} - ${format.audioBitrate ? format.audioBitrate + ' kbps' : 'no audio'}`;
                formatSelect.appendChild(option);
            });
            formatSelectionDiv.style.display = 'block';
        })
        .catch(error => {
            messageDiv.innerHTML = `<p style="color: red;">There was a problem fetching formats: ${error.message}</p>`;
        });
}

function downloadVideo() {
    const videoUrl = document.getElementById('video-url').value;
    const format = document.getElementById('format').value;
    const messageDiv = document.getElementById('message');

    messageDiv.innerHTML = ''; // Clear previous messages

    if (!videoUrl) {
        messageDiv.innerHTML = '<p style="color: red;">Please enter a YouTube URL.</p>';
        return;
    }

    messageDiv.innerHTML = '<p>Downloading... <span class="spinner"></span></p>';

    fetch(`/download?url=${encodeURIComponent(videoUrl)}&format=${format}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'video.mp4'; // Adjust the filename and extension as needed
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            messageDiv.innerHTML = '<p style="color: green;">Your file has been downloaded!</p>';
        })
        .catch(error => {
            messageDiv.innerHTML = `<p style="color: red;">There was a problem with your download: ${error.message}</p>`;
        });
}
