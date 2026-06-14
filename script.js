// Музыкальная база данных с обновленными жанрами (pop, rock, club, rap)
const songs = [
    {
        title: 'Улыбнись мне снова',
        artist: 'Алина Кей',
        genre: 'pop',
        audioSrc: 'https://github.com/91ndsl-blip/NDSL124/commit/6cc39f28f3e3726defd4591b64c8457a86e32335#diff-e06e2d2253bb2c7efb0b51cb3bf70e1cc1d88e44e8350cf75684c68c666b18f6',
        coverSrc: 'https://unsplash.com'
    },
    {
        title: 'Разбитый Усилитель',
        artist: 'Черный Квадрат',
        genre: 'rock',
        audioSrc: 'https://soundhelix.com',
        coverSrc: 'https://unsplash.com'
    },
    {
        title: 'Deep Techno Drop',
        artist: 'Oliver Groove',
        genre: 'club',
        audioSrc: 'https://soundhelix.com',
        coverSrc: 'https://unsplash.com'
    },
    {
        title: 'Ночной Городной Уличный',
        artist: 'MC Стрит',
        genre: 'rap',
        audioSrc: 'https://soundhelix.com',
        coverSrc: 'https://unsplash.com'
    },
    {
        title: 'Танцуй до утра',
        artist: 'DJ Ibiza',
        genre: 'club',
        audioSrc: 'https://soundhelix.com',
        coverSrc: 'https://unsplash.com'
    },
    {
        title: 'Вспышка Света',
        artist: 'Поп-Проект X',
        genre: 'pop',
        audioSrc: 'https://soundhelix.com',
        coverSrc: 'https://unsplash.com'
    }
];

const audio = document.getElementById('audio');
audio.crossOrigin = "anonymous"; 

const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const title = document.getElementById('title');
const artist = document.getElementById('artist');
const cover = document.getElementById('cover');
const progress = document.getElementById('progress');
const progressContainer = document.getElementById('progress-container');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const tracksGrid = document.getElementById('tracks-grid');
const volumeSlider = document.getElementById('volume-slider');
const genreTitle = document.getElementById('current-genre-title');
const categoryCards = document.querySelectorAll('.category-card');
const eqBars = document.querySelectorAll('.eq-bar');

let currentSongsList = [...songs];
let songIndex = 0;

let audioContext;
let analyser;
let dataArray;
let isAudioContextInitialized = false;

// Подключение Web Audio API анализатора
function initAudioAnalyzer() {
    if (isAudioContextInitialized) return;

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaElementSource(audio);
    
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 32; 
    
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    
    isAudioContextInitialized = true;
    renderEqualizer();
}

// Запуск рендеринга реальных частот трека под эквалайзер
function renderEqualizer() {
    requestAnimationFrame(renderEqualizer);
    
    if (!analyser || audio.paused) {
        eqBars.forEach(bar => bar.style.height = '3px');
        return;
    }
    
    analyser.getByteFrequencyData(dataArray);
    
    eqBars.forEach((bar, index) => {
        const frequencyValue = dataArray[index]; 
        const minHeight = 3;
        const maxHeight = 30;
        const calculatedHeight = minHeight + (frequencyValue / 255) * (maxHeight - minHeight);
        bar.style.height = `${calculatedHeight}px`;
    });
}

// Показ треков в сетке контента
function displayTracks(tracks) {
    tracksGrid.innerHTML = '';
    
    if (tracks.length === 0) {
        tracksGrid.innerHTML = '<p style="color: var(--text-muted); padding: 10px;">В этом жанре пока нет треков...</p>';
        return;
    }

    tracks.forEach((song, index) => {
        const card = document.createElement('div');
        card.classList.add('track-card');
        card.setAttribute('data-index', index);
        
        const isCurrentPlaying = (audio.src === song.audioSrc);
        if (isCurrentPlaying) card.classList.add('active');

        card.innerHTML = `
            <div class="card-cover-wrapper">
                <img src="${song.coverSrc}" alt="${song.title}" class="card-cover">
                <button class="card-play-btn">${isCurrentPlaying && !audio.paused ? '⏸' : '▶'}</button>
            </div>
            <p class="card-title">${song.title}</p>
            <p class="card-artist">${song.artist}</p>
        `;

        card.addEventListener('click', () => {
            initAudioAnalyzer(); 
            if (audio.src === song.audioSrc) {
                togglePlay();
            } else {
                songIndex = index;
                loadSong(song);
                playSong();
            }
        });
        tracksGrid.appendChild(card);
    });
}

function updateGridActiveState() {
    const cards = document.querySelectorAll('.track-card');
    cards.forEach((card, index) => {
        const track = currentSongsList[index];
        const isCurrent = track && audio.src === track.audioSrc;
        const playBtnInner = card.querySelector('.card-play-btn');
        if (isCurrent) {
            card.classList.add('active');
            playBtnInner.innerText = audio.paused ? '▶' : '⏸';
        } else {
            card.classList.remove('active');
            playBtnInner.innerText = '▶';
        }
    });
}

function loadSong(song) {
    title.innerText = song.title;
    artist.innerText = song.artist;
    audio.src = song.audioSrc;
    cover.src = song.coverSrc;
    updateGridActiveState();
}

function playSong() {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
    audio.play();
    playBtn.innerText = '⏸';
    updateGridActiveState();
}

function pauseSong() {
    audio.pause();
    playBtn.innerText = '▶';
    updateGridActiveState();
}

function togglePlay() {
    initAudioAnalyzer();
    if (audio.paused) { playSong(); } else { pauseSong(); }
}

function changeSong(direction) {
    if (currentSongsList.length === 0) return;
    songIndex = (songIndex + direction + currentSongsList.length) % currentSongsList.length;
    loadSong(currentSongsList[songIndex]);
    playSong();
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function updateProgress(e) {
    const { duration, currentTime } = e.srcElement;
    if (duration) {
        const progressPercent = (currentTime / duration) * 100;
        progress.style.width = `${progressPercent}%`;
    }
    currentTimeEl.innerText = formatTime(currentTime);
}

function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    if (duration) {
        audio.currentTime = (clickX / width) * duration;
    }
}

// Клик по новым карточкам жанров
categoryCards.forEach(card => {
    card.addEventListener('click', () => {
        categoryCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        
        const genre = card.getAttribute('data-genre');
        genreTitle.innerText = card.querySelector('span').innerText;

        if (genre === 'all') {
            currentSongsList = [...songs];
        } else {
            // Фильтруем массив по новому признаку (pop, rock, club, rap)
            currentSongsList = songs.filter(song => song.genre === genre);
        }

        songIndex = 0;
        displayTracks(currentSongsList);
    });
});

playBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', () => changeSong(-1));
nextBtn.addEventListener('click', () => changeSong(1));
audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('loadedmetadata', () => { durationEl.innerText = formatTime(audio.duration); });
audio.addEventListener('ended', () => changeSong(1));
progressContainer.addEventListener('click', setProgress);

volumeSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value;
});

audio.volume = volumeSlider.value;
displayTracks(currentSongsList);
loadSong(currentSongsList[songIndex]);
