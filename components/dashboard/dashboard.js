const toggleButton = document.getElementById('toggle-btn');
    let isPlaying = false;

    toggleButton.addEventListener('click', () => {
        isPlaying = !isPlaying;

        if (isPlaying) {
            toggleButton.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            toggleButton.innerHTML = '<i class="fas fa-play"></i>';
        }
    });