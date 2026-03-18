// ================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==================
let currentUser = {
    name: 'Игрок Micim',
    email: 'player@micim.local',
    avatar: 'https://i.ibb.co/HT71Ghdd/photo-output.png',
    status: 'Онлайн'
};

let activeWindows = [];
let apps = [];
let notes = [];
let currentNote = -1;
let files = [];
let currentPath = '/';

// Музыка
let musicPlaying = false;
let currentTrack = 0;
let musicProgress = 0;
let musicInterval = null;
const tracks = [
    { title: 'Ambient Micim', artist: 'Micim Sound', duration: 225, file: '' },
    { title: 'Micim Dreams', artist: 'Micim Sound', duration: 260, file: '' },
    { title: 'Console Vibes', artist: 'Micim Sound', duration: 195, file: '' }
];

// Настройки
let wifiEnabled = true;
let bluetoothEnabled = false;
let soundEnabled = true;
let volume = 70;
let brightness = 80;

// Игры - Змейка
let snakeGame = {
    canvas: null,
    ctx: null,
    gridSize: 20,
    cellSize: 20,
    snake: [{x: 10, y: 10}],
    food: {x: 15, y: 15},
    direction: 'right',
    nextDirection: 'right',
    score: 0,
    highScore: 0,
    gamesPlayed: 0,
    gameOver: false,
    paused: false,
    interval: null,
    speed: 100
};

// Игры - Тетрис
let tetrisGame = {
    canvas: null,
    ctx: null,
    nextCanvas: null,
    nextCtx: null,
    grid: Array(20).fill().map(() => Array(10).fill(0)),
    pieces: [
        { shape: [[1,1,1,1]], color: '#00f0f0' }, // I
        { shape: [[1,1],[1,1]], color: '#f0f000' }, // O
        { shape: [[0,1,0],[1,1,1]], color: '#a0a0f0' }, // T
        { shape: [[1,0,0],[1,1,1]], color: '#f0a0a0' }, // L
        { shape: [[0,0,1],[1,1,1]], color: '#a0f0a0' }, // J
        { shape: [[0,1,1],[1,1,0]], color: '#f0a0f0' }, // S
        { shape: [[1,1,0],[0,1,1]], color: '#a0f0f0' } // Z
    ],
    currentPiece: null,
    currentX: 3,
    currentY: 0,
    nextPiece: null,
    score: 0,
    level: 1,
    highScore: 0,
    gamesPlayed: 0,
    gameOver: false,
    interval: null,
    speed: 500
};

// Игры - 2048
let game2048 = {
    grid: Array(4).fill().map(() => Array(4).fill(0)),
    score: 0,
    highScore: 0,
    gamesPlayed: 0,
    gameOver: false,
    won: false
};

// Аудио
let welcomeMusic = null;
let backgroundMusic = null;

// ================== ИНИЦИАЛИЗАЦИЯ ==================
document.addEventListener('DOMContentLoaded', function() {
    initAudio();
    initWaveCanvas();
    initBackgroundCanvas();
    loadApps();
    loadPhotos();
    loadNotes();
    loadFiles();
    initGamePreviews();
    updateTime();
    setInterval(updateTime, 1000);
    loadStats();
    
    // Прогресс-бар
    let progress = 0;
    const interval = setInterval(() => {
        progress += 2;
        if (progress <= 100) {
            document.getElementById('welcomeProgress').style.width = progress + '%';
        } else {
            clearInterval(interval);
        }
    }, 50);
    
    // Вход по любой клавише
    document.addEventListener('keydown', startSystem);
    document.addEventListener('touchstart', startSystem);
    
    // Глобальные клавиши
    document.addEventListener('keydown', handleGlobalKeys);
});

function startSystem() {
    const welcomeScreen = document.querySelector('.welcome-screen');
    const desktop = document.getElementById('desktop');
    
    welcomeScreen.style.opacity = '0';
    setTimeout(() => {
        welcomeScreen.style.display = 'none';
        desktop.classList.add('active');
        startBackgroundMusic();
        startSystemServices();
    }, 500);
}

function startSystemServices() {
    // Запуск системных сервисов
    updateBattery();
    setInterval(updateBattery, 60000);
}

// ================== АУДИО ==================
function initAudio() {
    welcomeMusic = document.getElementById('welcomeMusic');
    backgroundMusic = document.getElementById('backgroundMusic');
    
    if (welcomeMusic) {
        welcomeMusic.volume = volume / 100;
        welcomeMusic.play().catch(() => {});
    }
}

function startBackgroundMusic() {
    if (backgroundMusic && soundEnabled) {
        backgroundMusic.volume = volume / 100;
        backgroundMusic.play().catch(() => {});
        startMusicProgress();
    }
}

function playPauseMusic() {
    if (!backgroundMusic) return;
    
    if (backgroundMusic.paused) {
        backgroundMusic.play();
        document.getElementById('playPauseIcon').className = 'fas fa-pause';
        document.getElementById('playPauseBigIcon').className = 'fas fa-pause';
        startMusicProgress();
    } else {
        backgroundMusic.pause();
        document.getElementById('playPauseIcon').className = 'fas fa-play';
        document.getElementById('playPauseBigIcon').className = 'fas fa-play';
        stopMusicProgress();
    }
}

function previousTrack() {
    currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
    updateTrackInfo();
    if (!backgroundMusic.paused) {
        // Здесь нужно будет менять источник аудио
    }
}

function nextTrack() {
    currentTrack = (currentTrack + 1) % tracks.length;
    updateTrackInfo();
    if (!backgroundMusic.paused) {
        // Здесь нужно будет менять источник аудио
    }
}

function playTrack(index) {
    currentTrack = index;
    updateTrackInfo();
    if (backgroundMusic.paused) {
        playPauseMusic();
    } else {
        // Здесь нужно будет менять источник аудио
    }
}

function updateTrackInfo() {
    document.getElementById('currentTrackTitle').textContent = tracks[currentTrack].title;
    document.getElementById('currentTrackArtist').textContent = tracks[currentTrack].artist;
    document.getElementById('nowPlayingText').textContent = tracks[currentTrack].title;
    document.getElementById('totalTimeMusic').textContent = formatTime(tracks[currentTrack].duration);
    
    document.querySelectorAll('.playlist-item').forEach((item, index) => {
        if (index === currentTrack) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function startMusicProgress() {
    if (musicInterval) clearInterval(musicInterval);
    musicInterval = setInterval(() => {
        if (backgroundMusic && !backgroundMusic.paused) {
            musicProgress = (backgroundMusic.currentTime / tracks[currentTrack].duration) * 100;
            document.getElementById('musicProgress').style.width = musicProgress + '%';
            document.getElementById('currentTimeMusic').textContent = formatTime(backgroundMusic.currentTime);
        }
    }, 100);
}

function stopMusicProgress() {
    if (musicInterval) {
        clearInterval(musicInterval);
        musicInterval = null;
    }
}

function seekMusic(event) {
    if (!backgroundMusic) return;
    const bar = event.currentTarget;
    const rect = bar.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    backgroundMusic.currentTime = percent * tracks[currentTrack].duration;
}

function setMusicVolume(value) {
    volume = value;
    if (backgroundMusic) {
        backgroundMusic.volume = volume / 100;
    }
    document.getElementById('volumeSlider').value = volume;
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ================== 2D ВОЛНЫ ==================
function initWaveCanvas() {
    const canvas = document.getElementById('wavesCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let width, height;
    
    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }
    
    window.addEventListener('resize', resize);
    resize();
    
    let time = 0;
    
    function draw() {
        ctx.clearRect(0, 0, width, height);
        
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            for (let x = 0; x < width; x += 20) {
                const y = height/2 + 
                    Math.sin(x * 0.002 + time + i) * 50 +
                    Math.cos(x * 0.001 + time * 2 + i) * 30;
                
                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.strokeStyle = `rgba(255,255,255,${0.2 - i*0.05})`;
            ctx.stroke();
        }
        
        time += 0.02;
        requestAnimationFrame(draw);
    }
    
    draw();
}

function initBackgroundCanvas() {
    const canvas = document.getElementById('backgroundCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let width, height;
    
    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }
    
    window.addEventListener('resize', resize);
    resize();
    
    let particles = [];
    for (let i = 0; i < 50; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: 2 + Math.random() * 4,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5
        });
    }
    
    function draw() {
        ctx.clearRect(0, 0, width, height);
        
        // Градиент
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#f0f2f5');
        gradient.addColorStop(1, '#e6e9f0');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Частицы
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(13, 110, 253, ${0.1 + Math.random() * 0.1})`;
            ctx.fill();
            
            p.x += p.speedX;
            p.y += p.speedY;
            
            if (p.x < 0 || p.x > width) p.speedX *= -1;
            if (p.y < 0 || p.y > height) p.speedY *= -1;
        });
        
        requestAnimationFrame(draw);
    }
    
    draw();
}

// ================== ВРЕМЯ И СИСТЕМА ==================
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    const dateString = now.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long'
    });
    
    document.getElementById('currentTime').textContent = timeString;
    document.getElementById('currentDate').textContent = dateString;
    document.getElementById('bottomTime').textContent = timeString;
}

function updateBattery() {
    // Имитация батареи
    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            const level = Math.round(battery.level * 100);
            document.getElementById('batteryLevel').textContent = level + '%';
            
            const icon = document.getElementById('batteryIcon');
            if (level > 75) icon.className = 'fas fa-battery-full';
            else if (level > 50) icon.className = 'fas fa-battery-three-quarters';
            else if (level > 25) icon.className = 'fas fa-battery-half';
            else if (level > 10) icon.className = 'fas fa-battery-quarter';
            else icon.className = 'fas fa-battery-empty';
        });
    }
}

// ================== ОКНА ==================
function openApp(appId) {
    const window = document.getElementById(appId);
    if (!window) return;
    
    // Закрываем все другие окна
    document.querySelectorAll('.app-window.active').forEach(w => {
        if (w.id !== appId) {
            w.classList.remove('active');
        }
    });
    
    window.classList.add('active');
    
    if (!activeWindows.includes(appId)) {
        activeWindows.push(appId);
        addToTaskbar(appId);
    }
    
    // Специфичные действия
    if (appId === 'store') renderApps();
    if (appId === 'photos') loadPhotos();
    if (appId === 'notes') renderNotesList();
    if (appId === 'files') renderFiles();
    if (appId === 'settings') renderSettings('general');
    if (appId === 'profile') loadProfile();
    if (appId === 'gameSnake') initSnake();
    if (appId === 'gameTetris') initTetris();
    if (appId === 'game2048') init2048();
}

function closeWindow(appId) {
    const window = document.getElementById(appId);
    if (window) {
        window.classList.remove('active');
        activeWindows = activeWindows.filter(w => w !== appId);
        removeFromTaskbar(appId);
        
        // Останавливаем игры
        if (appId === 'gameSnake' && snakeGame.interval) {
            clearInterval(snakeGame.interval);
            snakeGame.interval = null;
        }
        if (appId === 'gameTetris' && tetrisGame.interval) {
            clearInterval(tetrisGame.interval);
            tetrisGame.interval = null;
        }
    }
}

function showHome() {
    document.querySelectorAll('.app-window.active').forEach(w => {
        w.classList.remove('active');
    });
}

function addToTaskbar(appId) {
    const taskbar = document.getElementById('taskbar');
    if (!taskbar) return;
    
    if (document.querySelector(`.taskbar-item[data-app="${appId}"]`)) return;
    
    const icons = {
        'store': 'fa-shopping-cart',
        'music': 'fa-music',
        'games': 'fa-gamepad',
        'photos': 'fa-images',
        'browser': 'fa-globe',
        'calculator': 'fa-calculator',
        'notes': 'fa-pen',
        'files': 'fa-folder',
        'terminal': 'fa-terminal',
        'settings': 'fa-cog',
        'profile': 'fa-user-circle',
        'gameSnake': 'fa-gamepad',
        'gameTetris': 'fa-th-large',
        'game2048': 'fa-th'
    };
    
    const names = {
        'store': 'Магазин',
        'music': 'Музыка',
        'games': 'Игры',
        'photos': 'Галерея',
        'browser': 'Браузер',
        'calculator': 'Калькулятор',
        'notes': 'Заметки',
        'files': 'Файлы',
        'terminal': 'Терминал',
        'settings': 'Настройки',
        'profile': 'Профиль',
        'gameSnake': 'Змейка',
        'gameTetris': 'Тетрис',
        'game2048': '2048'
    };
    
    const item = document.createElement('div');
    item.className = 'taskbar-item active';
    item.setAttribute('data-app', appId);
    item.setAttribute('title', names[appId]);
    item.innerHTML = `<i class="fas ${icons[appId]}"></i>`;
    item.onclick = () => {
        if (document.getElementById(appId).classList.contains('active')) {
            closeWindow(appId);
        } else {
            openApp(appId);
        }
    };
    taskbar.appendChild(item);
}

function removeFromTaskbar(appId) {
    const item = document.querySelector(`.taskbar-item[data-app="${appId}"]`);
    if (item) item.remove();
}

// ================== ЦЕНТР УПРАВЛЕНИЯ ==================
function toggleControlCenter() {
    document.getElementById('controlCenter').classList.toggle('active');
    document.getElementById('userMenu').classList.remove('active');
}

function toggleUserMenu() {
    document.getElementById('userMenu').classList.toggle('active');
    document.getElementById('controlCenter').classList.remove('active');
}

function toggleWiFi() {
    wifiEnabled = !wifiEnabled;
    document.getElementById('wifiToggle').classList.toggle('active');
    document.getElementById('wifiIcon').style.color = wifiEnabled ? '#0d6efd' : '#6c757d';
    showNotification('Wi-Fi', wifiEnabled ? 'Включен' : 'Выключен');
}

function toggleBluetooth() {
    bluetoothEnabled = !bluetoothEnabled;
    document.getElementById('bluetoothToggle').classList.toggle('active');
    document.getElementById('bluetoothIcon').style.color = bluetoothEnabled ? '#0d6efd' : '#6c757d';
    showNotification('Bluetooth', bluetoothEnabled ? 'Включен' : 'Выключен');
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    document.getElementById('soundToggle').classList.toggle('active');
    
    if (backgroundMusic) {
        backgroundMusic.muted = !soundEnabled;
    }
    
    const icon = document.getElementById('volumeIcon');
    const indicatorIcon = document.getElementById('volumeIndicatorIcon');
    if (soundEnabled) {
        icon.className = 'fas fa-volume-up';
        indicatorIcon.className = 'fas fa-volume-up';
    } else {
        icon.className = 'fas fa-volume-mute';
        indicatorIcon.className = 'fas fa-volume-mute';
    }
    
    showNotification('Звук', soundEnabled ? 'Включен' : 'Выключен');
}

function toggleMute() {
    soundEnabled = !soundEnabled;
    if (backgroundMusic) {
        backgroundMusic.muted = !soundEnabled;
    }
    document.getElementById('soundToggle').classList.toggle('active');
    
    const icon = document.getElementById('volumeIcon');
    const indicatorIcon = document.getElementById('volumeIndicatorIcon');
    if (soundEnabled) {
        icon.className = 'fas fa-volume-up';
        indicatorIcon.className = 'fas fa-volume-up';
    } else {
        icon.className = 'fas fa-volume-mute';
        indicatorIcon.className = 'fas fa-volume-mute';
    }
}

function updateVolume(value) {
    volume = value;
    if (backgroundMusic) {
        backgroundMusic.volume = volume / 100;
    }
}

function updateBrightness(value) {
    brightness = value;
    document.body.style.filter = `brightness(${brightness / 100})`;
}

// ================== УВЕДОМЛЕНИЯ ==================
function showNotification(title, message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: white;
        padding: 15px 20px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s;
        border-left: 4px solid ${type === 'success' ? '#198754' : type === 'error' ? '#dc3545' : '#0d6efd'};
    `;
    notification.innerHTML = `
        <strong>${title}</strong><br>
        <span style="color: #666;">${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ================== ПРИЛОЖЕНИЯ ==================
function loadApps() {
    apps = [
        { id: 'snake', title: 'Змейка', desc: 'Классическая игра', icon: 'fa-gamepad', category: 'games', installed: true },
        { id: 'tetris', title: 'Тетрис', desc: 'Складывай блоки', icon: 'fa-th-large', category: 'games', installed: true },
        { id: '2048', title: '2048', desc: 'Сложи плитки до 2048', icon: 'fa-th', category: 'games', installed: true },
        { id: 'calculator', title: 'Калькулятор', desc: 'Математические операции', icon: 'fa-calculator', category: 'tools', installed: true },
        { id: 'notes', title: 'Заметки', desc: 'Текстовые заметки', icon: 'fa-pen', category: 'tools', installed: true },
        { id: 'weather', title: 'Погода', desc: 'Прогноз погоды', icon: 'fa-cloud-sun', category: 'info', installed: false },
        { id: 'maps', title: 'Карты', desc: 'Навигация', icon: 'fa-map', category: 'info', installed: false }
    ];
}

function renderApps() {
    const grid = document.getElementById('appsGrid');
    if (!grid) return;
    
    let html = '';
    apps.forEach(app => {
        html += `
            <div class="app-card" onclick="installApp('${app.id}')">
                <div class="icon"><i class="fas ${app.icon}"></i></div>
                <h3>${app.title}</h3>
                <p>${app.desc}</p>
                <span class="app-category">${app.category}</span>
                <button class="install-btn" ${app.installed ? 'disabled' : ''}>
                    ${app.installed ? 'Установлено' : 'Установить'}
                </button>
            </div>
        `;
    });
    
    grid.innerHTML = html;
}

function filterApps() {
    const search = document.getElementById('storeSearch').value.toLowerCase();
    const cards = document.querySelectorAll('.app-card');
    
    cards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        if (title.includes(search)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function filterCategory(category) {
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    const cards = document.querySelectorAll('.app-card');
    cards.forEach(card => {
        const cat = card.querySelector('.app-category').textContent;
        if (category === 'all' || cat === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function installApp(appId) {
    const app = apps.find(a => a.id === appId);
    if (app && !app.installed) {
        app.installed = true;
        showNotification('Успешно', `${app.title} установлено`, 'success');
        renderApps();
    }
}

// ================== ИГРЫ ==================
function openGame(gameId) {
    const windows = {
        'snake': 'gameSnake',
        'tetris': 'gameTetris',
        '2048': 'game2048'
    };
    
    openApp(windows[gameId]);
}

function initGamePreviews() {
    // Превью змейки
    const snakePreview = document.getElementById('snakePreview');
    if (snakePreview) {
        const ctx = snakePreview.getContext('2d');
        ctx.fillStyle = '#667eea';
        ctx.fillRect(0, 0, 200, 150);
        
        // Рисуем змейку
        ctx.fillStyle = '#764ba2';
        ctx.fillRect(80, 60, 15, 15);
        ctx.fillRect(95, 60, 15, 15);
        ctx.fillRect(110, 60, 15, 15);
        
        ctx.fillStyle = '#ff6b6b';
        ctx.fillRect(140, 60, 15, 15);
    }
    
    // Превью тетриса
    const tetrisPreview = document.getElementById('tetrisPreview');
    if (tetrisPreview) {
        const ctx = tetrisPreview.getContext('2d');
        ctx.fillStyle = '#f093fb';
        ctx.fillRect(0, 0, 200, 150);
        
        const colors = ['#f5576c', '#4facfe', '#43e97b'];
        for (let i = 0; i < 4; i++) {
            ctx.fillStyle = colors[i % 3];
            ctx.fillRect(70 + i * 20, 60, 15, 15);
        }
    }
    
    // Превью 2048
    const game2048Preview = document.getElementById('game2048Preview');
    if (game2048Preview) {
        const ctx = game2048Preview.getContext('2d');
        ctx.fillStyle = '#4facfe';
        ctx.fillRect(0, 0, 200, 150);
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('2048', 50, 90);
    }
}

// ЗМЕЙКА
function initSnake() {
    snakeGame.canvas = document.getElementById('snakeCanvas');
    if (!snakeGame.canvas) return;
    
    snakeGame.ctx = snakeGame.canvas.getContext('2d');
    snakeGame.snake = [{x: 10, y: 10}];
    snakeGame.direction = 'right';
    snakeGame.nextDirection = 'right';
    snakeGame.score = 0;
    snakeGame.gameOver = false;
    snakeGame.paused = false;
    
    generateFood();
    updateSnakeScore();
    
    if (snakeGame.interval) clearInterval(snakeGame.interval);
    snakeGame.interval = setInterval(updateSnake, snakeGame.speed);
    
    document.addEventListener('keydown', handleSnakeKeys);
}

function updateSnake() {
    if (snakeGame.gameOver || snakeGame.paused) return;
    
    // Движение
    snakeGame.direction = snakeGame.nextDirection;
    const head = {...snakeGame.snake[0]};
    
    switch(snakeGame.direction) {
        case 'right': head.x++; break;
        case 'left': head.x--; break;
        case 'up': head.y--; break;
        case 'down': head.y++; break;
    }
    
    // Проверка столкновений
    if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) {
        gameOverSnake();
        return;
    }
    
    for (let segment of snakeGame.snake) {
        if (head.x === segment.x && head.y === segment.y) {
            gameOverSnake();
            return;
        }
    }
    
    snakeGame.snake.unshift(head);
    
    // Еда
    if (head.x === snakeGame.food.x && head.y === snakeGame.food.y) {
        snakeGame.score += 10;
        updateSnakeScore();
        generateFood();
    } else {
        snakeGame.snake.pop();
    }
    
    drawSnake();
}

function drawSnake() {
    const ctx = snakeGame.ctx;
    ctx.clearRect(0, 0, 400, 400);
    
    // Сетка
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 20; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 20, 0);
        ctx.lineTo(i * 20, 400);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * 20);
        ctx.lineTo(400, i * 20);
        ctx.stroke();
    }
    
    // Змейка
    snakeGame.snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#0d6efd' : '#6c757d';
        ctx.fillRect(segment.x * 20, segment.y * 20, 18, 18);
    });
    
    // Еда
    ctx.fillStyle = '#dc3545';
    ctx.beginPath();
    ctx.arc(snakeGame.food.x * 20 + 10, snakeGame.food.y * 20 + 10, 8, 0, Math.PI * 2);
    ctx.fill();
}

function generateFood() {
    do {
        snakeGame.food = {
            x: Math.floor(Math.random() * 20),
            y: Math.floor(Math.random() * 20)
        };
    } while (snakeGame.snake.some(s => s.x === snakeGame.food.x && s.y === snakeGame.food.y));
}

function snakeSetDirection(dir) {
    const opposites = {
        'right': 'left',
        'left': 'right',
        'up': 'down',
        'down': 'up'
    };
    
    if (opposites[dir] !== snakeGame.direction) {
        snakeGame.nextDirection = dir;
    }
}

function handleSnakeKeys(e) {
    if (!document.getElementById('gameSnake').classList.contains('active')) return;
    
    const keyMap = {
        'ArrowUp': 'up',
        'ArrowDown': 'down',
        'ArrowLeft': 'left',
        'ArrowRight': 'right'
    };
    
    if (keyMap[e.key]) {
        e.preventDefault();
        snakeSetDirection(keyMap[e.key]);
    }
    
    if (e.key === ' ') {
        e.preventDefault();
        toggleSnakePause();
    }
}

function toggleSnakePause() {
    snakeGame.paused = !snakeGame.paused;
    const icon = document.getElementById('snakePauseIcon');
    icon.className = snakeGame.paused ? 'fas fa-play' : 'fas fa-pause';
}

function gameOverSnake() {
    snakeGame.gameOver = true;
    clearInterval(snakeGame.interval);
    
    if (snakeGame.score > snakeGame.highScore) {
        snakeGame.highScore = snakeGame.score;
        localStorage.setItem('snakeHighScore', snakeGame.highScore);
    }
    
    snakeGame.gamesPlayed++;
    localStorage.setItem('snakeGamesPlayed', snakeGame.gamesPlayed);
    
    updateSnakeScore();
    showNotification('Игра окончена', `Счет: ${snakeGame.score}`, 'error');
}

function restartSnake() {
    initSnake();
}

function updateSnakeScore() {
    document.getElementById('snakeScore').textContent = `Счет: ${snakeGame.score}`;
    document.getElementById('snakeHighScore').textContent = snakeGame.highScore;
    document.getElementById('snakeGamesPlayed').textContent = snakeGame.gamesPlayed;
}

// ТЕТРИС
function initTetris() {
    tetrisGame.canvas = document.getElementById('tetrisCanvas');
    tetrisGame.nextCanvas = document.getElementById('nextPieceCanvas');
    
    if (!tetrisGame.canvas) return;
    
    tetrisGame.ctx = tetrisGame.canvas.getContext('2d');
    tetrisGame.nextCtx = tetrisGame.nextCanvas.getContext('2d');
    
    tetrisGame.grid = Array(20).fill().map(() => Array(10).fill(0));
    tetrisGame.score = 0;
    tetrisGame.level = 1;
    tetrisGame.gameOver = false;
    
    tetrisGame.nextPiece = getRandomPiece();
    spawnNewPiece();
    
    if (tetrisGame.interval) clearInterval(tetrisGame.interval);
    tetrisGame.interval = setInterval(updateTetris, tetrisGame.speed);
    
    document.addEventListener('keydown', handleTetrisKeys);
    
    updateTetrisScore();
    drawTetris();
}

function getRandomPiece() {
    const index = Math.floor(Math.random() * tetrisGame.pieces.length);
    return {
        shape: tetrisGame.pieces[index].shape.map(row => [...row]),
        color: tetrisGame.pieces[index].color
    };
}

function spawnNewPiece() {
    tetrisGame.currentPiece = tetrisGame.nextPiece;
    tetrisGame.nextPiece = getRandomPiece();
    tetrisGame.currentX = 3;
    tetrisGame.currentY = 0;
    
    if (collision()) {
        tetrisGame.gameOver = true;
        clearInterval(tetrisGame.interval);
        showNotification('Игра окончена', `Счет: ${tetrisGame.score}`, 'error');
    }
}

function collision() {
    for (let y = 0; y < tetrisGame.currentPiece.shape.length; y++) {
        for (let x = 0; x < tetrisGame.currentPiece.shape[y].length; x++) {
            if (tetrisGame.currentPiece.shape[y][x]) {
                const boardX = tetrisGame.currentX + x;
                const boardY = tetrisGame.currentY + y;
                
                if (boardX < 0 || boardX >= 10 || boardY >= 20 || boardY < 0) {
                    return true;
                }
                
                if (boardY >= 0 && tetrisGame.grid[boardY][boardX]) {
                    return true;
                }
            }
        }
    }
    return false;
}

function mergePiece() {
    for (let y = 0; y < tetrisGame.currentPiece.shape.length; y++) {
        for (let x = 0; x < tetrisGame.currentPiece.shape[y].length; x++) {
            if (tetrisGame.currentPiece.shape[y][x]) {
                const boardY = tetrisGame.currentY + y;
                const boardX = tetrisGame.currentX + x;
                if (boardY >= 0) {
                    tetrisGame.grid[boardY][boardX] = tetrisGame.currentPiece.color;
                }
            }
        }
    }
    
    checkLines();
    spawnNewPiece();
}

function checkLines() {
    let linesCleared = 0;
    
    for (let y = 19; y >= 0; y--) {
        if (tetrisGame.grid[y].every(cell => cell !== 0)) {
            tetrisGame.grid.splice(y, 1);
            tetrisGame.grid.unshift(Array(10).fill(0));
            y++;
            linesCleared++;
        }
    }
    
    if (linesCleared > 0) {
        tetrisGame.score += linesCleared * 100 * tetrisGame.level;
        tetrisGame.level = Math.floor(tetrisGame.score / 1000) + 1;
        tetrisGame.speed = Math.max(100, 500 - (tetrisGame.level - 1) * 50);
        
        clearInterval(tetrisGame.interval);
        tetrisGame.interval = setInterval(updateTetris, tetrisGame.speed);
        
        updateTetrisScore();
    }
}

function updateTetris() {
    if (tetrisGame.gameOver) return;
    
    tetrisGame.currentY++;
    
    if (collision()) {
        tetrisGame.currentY--;
        mergePiece();
    }
    
    drawTetris();
}

function tetrisMove(direction) {
    if (tetrisGame.gameOver) return;
    
    const oldX = tetrisGame.currentX;
    
    if (direction === 'left') tetrisGame.currentX--;
    if (direction === 'right') tetrisGame.currentX++;
    
    if (collision()) {
        tetrisGame.currentX = oldX;
    }
    
    drawTetris();
}

function tetrisRotate() {
    if (tetrisGame.gameOver) return;
    
    const rotated = tetrisGame.currentPiece.shape[0].map((_, index) =>
        tetrisGame.currentPiece.shape.map(row => row[index]).reverse()
    );
    
    const oldShape = tetrisGame.currentPiece.shape;
    tetrisGame.currentPiece.shape = rotated;
    
    if (collision()) {
        tetrisGame.currentPiece.shape = oldShape;
    }
    
    drawTetris();
}

function tetrisHardDrop() {
    if (tetrisGame.gameOver) return;
    
    while (!collision()) {
        tetrisGame.currentY++;
    }
    tetrisGame.currentY--;
    mergePiece();
    drawTetris();
}

function handleTetrisKeys(e) {
    if (!document.getElementById('gameTetris').classList.contains('active')) return;
    
    switch(e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            tetrisMove('left');
            break;
        case 'ArrowRight':
            e.preventDefault();
            tetrisMove('right');
            break;
        case 'ArrowDown':
            e.preventDefault();
            tetrisHardDrop();
            break;
        case 'ArrowUp':
            e.preventDefault();
            tetrisRotate();
            break;
    }
}

function drawTetris() {
    const ctx = tetrisGame.ctx;
    ctx.clearRect(0, 0, 300, 600);
    
    // Сетка
    for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 10; x++) {
            if (tetrisGame.grid[y][x]) {
                ctx.fillStyle = tetrisGame.grid[y][x];
                ctx.fillRect(x * 30, y * 30, 28, 28);
            } else {
                ctx.strokeStyle = '#dee2e6';
                ctx.strokeRect(x * 30, y * 30, 28, 28);
            }
        }
    }
    
    // Текущая фигура
    if (tetrisGame.currentPiece) {
        ctx.fillStyle = tetrisGame.currentPiece.color;
        for (let y = 0; y < tetrisGame.currentPiece.shape.length; y++) {
            for (let x = 0; x < tetrisGame.currentPiece.shape[y].length; x++) {
                if (tetrisGame.currentPiece.shape[y][x]) {
                    const boardX = (tetrisGame.currentX + x) * 30;
                    const boardY = (tetrisGame.currentY + y) * 30;
                    ctx.fillRect(boardX, boardY, 28, 28);
                }
            }
        }
    }
    
    // Следующая фигура
    const nextCtx = tetrisGame.nextCtx;
    nextCtx.clearRect(0, 0, 120, 120);
    if (tetrisGame.nextPiece) {
        nextCtx.fillStyle = tetrisGame.nextPiece.color;
        const offsetX = (120 - tetrisGame.nextPiece.shape[0].length * 30) / 2;
        const offsetY = (120 - tetrisGame.nextPiece.shape.length * 30) / 2;
        
        for (let y = 0; y < tetrisGame.nextPiece.shape.length; y++) {
            for (let x = 0; x < tetrisGame.nextPiece.shape[y].length; x++) {
                if (tetrisGame.nextPiece.shape[y][x]) {
                    nextCtx.fillRect(offsetX + x * 30, offsetY + y * 30, 28, 28);
                }
            }
        }
    }
}

function updateTetrisScore() {
    document.getElementById('tetrisScore').textContent = `Счет: ${tetrisGame.score}`;
    document.getElementById('tetrisLevel').textContent = `Уровень: ${tetrisGame.level}`;
    document.getElementById('tetrisHighScore').textContent = tetrisGame.highScore;
    document.getElementById('tetrisGamesPlayed').textContent = tetrisGame.gamesPlayed;
}

function restartTetris() {
    initTetris();
}

// 2048
function init2048() {
    game2048.grid = Array(4).fill().map(() => Array(4).fill(0));
    game2048.score = 0;
    game2048.gameOver = false;
    game2048.won = false;
    
    addNewTile();
    addNewTile();
    render2048();
    
    document.addEventListener('keydown', handle2048Keys);
}

function addNewTile() {
    const empty = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (game2048.grid[i][j] === 0) {
                empty.push({x: i, y: j});
            }
        }
    }
    
    if (empty.length > 0) {
        const {x, y} = empty[Math.floor(Math.random() * empty.length)];
        game2048.grid[x][y] = Math.random() < 0.9 ? 2 : 4;
    }
}

function render2048() {
    const container = document.getElementById('grid2048');
    if (!container) return;
    
    let html = '';
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const value = game2048.grid[i][j];
            html += `<div class="grid-cell" data-value="${value}">${value !== 0 ? value : ''}</div>`;
        }
    }
    
    container.innerHTML = html;
    document.getElementById('game2048Score').textContent = `Счет: ${game2048.score}`;
    
    if (game2048.score > game2048.highScore) {
        game2048.highScore = game2048.score;
        localStorage.setItem('game2048HighScore', game2048.highScore);
    }
    
    document.getElementById('game2048HighScore').textContent = game2048.highScore;
}

function game2048Move(direction) {
    if (game2048.gameOver) return;
    
    let moved = false;
    const oldGrid = JSON.parse(JSON.stringify(game2048.grid));
    
    if (direction === 'left') {
        for (let i = 0; i < 4; i++) {
            const row = game2048.grid[i].filter(val => val !== 0);
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    game2048.score += row[j];
                    row.splice(j + 1, 1);
                }
            }
            while (row.length < 4) row.push(0);
            game2048.grid[i] = row;
        }
    } else if (direction === 'right') {
        for (let i = 0; i < 4; i++) {
            let row = game2048.grid[i].filter(val => val !== 0);
            for (let j = row.length - 1; j > 0; j--) {
                if (row[j] === row[j - 1]) {
                    row[j] *= 2;
                    game2048.score += row[j];
                    row.splice(j - 1, 1);
                    j--;
                }
            }
            while (row.length < 4) row.unshift(0);
            game2048.grid[i] = row;
        }
    } else if (direction === 'up') {
        for (let j = 0; j < 4; j++) {
            const col = [];
            for (let i = 0; i < 4; i++) {
                if (game2048.grid[i][j] !== 0) col.push(game2048.grid[i][j]);
            }
            for (let i = 0; i < col.length - 1; i++) {
                if (col[i] === col[i + 1]) {
                    col[i] *= 2;
                    game2048.score += col[i];
                    col.splice(i + 1, 1);
                }
            }
            while (col.length < 4) col.push(0);
            for (let i = 0; i < 4; i++) {
                game2048.grid[i][j] = col[i];
            }
        }
    } else if (direction === 'down') {
        for (let j = 0; j < 4; j++) {
            const col = [];
            for (let i = 0; i < 4; i++) {
                if (game2048.grid[i][j] !== 0) col.push(game2048.grid[i][j]);
            }
            for (let i = col.length - 1; i > 0; i--) {
                if (col[i] === col[i - 1]) {
                    col[i] *= 2;
                    game2048.score += col[i];
                    col.splice(i - 1, 1);
                    i--;
                }
            }
            while (col.length < 4) col.unshift(0);
            for (let i = 0; i < 4; i++) {
                game2048.grid[i][j] = col[i];
            }
        }
    }
    
    // Проверка на изменения
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (oldGrid[i][j] !== game2048.grid[i][j]) {
                moved = true;
                break;
            }
        }
    }
    
    if (moved) {
        addNewTile();
        render2048();
        checkGameOver2048();
    }
}

function checkGameOver2048() {
    // Проверка на победу
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (game2048.grid[i][j] === 2048 && !game2048.won) {
                game2048.won = true;
                showNotification('Победа!', 'Вы достигли 2048!', 'success');
            }
        }
    }
    
    // Проверка на проигрыш
    let hasEmpty = false;
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (game2048.grid[i][j] === 0) hasEmpty = true;
        }
    }
    
    if (!hasEmpty) {
        // Проверка возможности ходов
        let canMove = false;
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const current = game2048.grid[i][j];
                if ((i < 3 && current === game2048.grid[i + 1][j]) ||
                    (j < 3 && current === game2048.grid[i][j + 1])) {
                    canMove = true;
                }
            }
        }
        
        if (!canMove) {
            game2048.gameOver = true;
            game2048.gamesPlayed++;
            localStorage.setItem('game2048GamesPlayed', game2048.gamesPlayed);
            showNotification('Игра окончена', `Счет: ${game2048.score}`, 'error');
        }
    }
}

function handle2048Keys(e) {
    if (!document.getElementById('game2048').classList.contains('active')) return;
    
    const keyMap = {
        'ArrowUp': 'up',
        'ArrowDown': 'down',
        'ArrowLeft': 'left',
        'ArrowRight': 'right'
    };
    
    if (keyMap[e.key]) {
        e.preventDefault();
        game2048Move(keyMap[e.key]);
    }
}

function restart2048() {
    init2048();
}

// ================== ФОТО ==================
function loadPhotos() {
    const grid = document.getElementById('photosGrid');
    if (!grid) return;
    
    const photos = [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
        'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
        'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400',
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400',
        'https://images.unsplash.com/photo-1426604966842-d7cdac1f5b9c?w=400',
        'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=400',
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400'
    ];
    
    let html = '';
    photos.forEach((photo, index) => {
        html += `
            <div class="photo-item" onclick="viewPhoto(${index})">
                <img src="${photo}" alt="photo ${index}">
            </div>
        `;
    });
    
    grid.innerHTML = html;
}

function viewPhoto(index) {
    showNotification('Галерея', `Просмотр фото ${index + 1}`);
}

function importPhotos() {
    showNotification('Галерея', 'Импорт фотографий...');
}

function createAlbum() {
    const name = prompt('Название альбома:');
    if (name) {
        showNotification('Галерея', `Альбом "${name}" создан`, 'success');
    }
}

function slideshow() {
    showNotification('Галерея', 'Запуск слайд-шоу');
}

// ================== КАЛЬКУЛЯТОР ==================
let calcValue = '0';
let calcOperator = '';
let calcPrevValue = '';

function calcInput(value) {
    const display = document.getElementById('calcDisplay');
    
    if (value === 'C') {
        calcValue = '0';
        calcOperator = '';
        calcPrevValue = '';
    } else if (value === '±') {
        calcValue = (parseFloat(calcValue) * -1).toString();
    } else if (value === '%') {
        calcValue = (parseFloat(calcValue) / 100).toString();
    } else if (['+', '-', '*', '/'].includes(value)) {
        calcOperator = value;
        calcPrevValue = calcValue;
        calcValue = '0';
    } else if (value === '=') {
        if (calcOperator && calcPrevValue) {
            const a = parseFloat(calcPrevValue);
            const b = parseFloat(calcValue);
            
            switch(calcOperator) {
                case '+': calcValue = (a + b).toString(); break;
                case '-': calcValue = (a - b).toString(); break;
                case '*': calcValue = (a * b).toString(); break;
                case '/': calcValue = (a / b).toString(); break;
            }
            
            calcOperator = '';
            calcPrevValue = '';
        }
    } else {
        if (calcValue === '0') {
            calcValue = value;
        } else {
            calcValue += value;
        }
    }
    
    display.textContent = calcValue;
}

// ================== ЗАМЕТКИ ==================
function loadNotes() {
    const saved = localStorage.getItem('micim_notes');
    if (saved) {
        notes = JSON.parse(saved);
    } else {
        notes = [
            { id: 1, title: 'Добро пожаловать', content: 'Это ваша первая заметка', date: new Date().toISOString() }
        ];
    }
}

function saveNotes() {
    localStorage.setItem('micim_notes', JSON.stringify(notes));
}

function renderNotesList() {
    const list = document.getElementById('notesList');
    if (!list) return;
    
    let html = '';
    notes.forEach(note => {
        html += `
            <div class="note-item ${currentNote === note.id ? 'active' : ''}" onclick="selectNote(${note.id})">
                <h4>${note.title}</h4>
                <p>${new Date(note.date).toLocaleDateString()}</p>
            </div>
        `;
    });
    
    list.innerHTML = html;
}

function selectNote(id) {
    currentNote = id;
    const note = notes.find(n => n.id === id);
    if (note) {
        document.getElementById('noteTitle').value = note.title;
        document.getElementById('noteContent').value = note.content;
    }
    renderNotesList();
}

function newNote() {
    const id = Date.now();
    notes.push({
        id: id,
        title: 'Новая заметка',
        content: '',
        date: new Date().toISOString()
    });
    
    currentNote = id;
    document.getElementById('noteTitle').value = 'Новая заметка';
    document.getElementById('noteContent').value = '';
    document.getElementById('noteStatus').textContent = 'Создано только что';
    
    renderNotesList();
    saveNotes();
}

function saveNote() {
    if (currentNote === -1) return;
    
    const note = notes.find(n => n.id === currentNote);
    if (note) {
        note.title = document.getElementById('noteTitle').value;
        note.content = document.getElementById('noteContent').value;
        note.date = new Date().toISOString();
        
        document.getElementById('noteStatus').textContent = 'Сохранено ' + new Date().toLocaleTimeString();
        
        saveNotes();
        renderNotesList();
    }
}

// ================== ФАЙЛЫ ==================
function loadFiles() {
    files = [
        { name: 'mods', type: 'folder', path: '/mods' },
        { name: 'config', type: 'folder', path: '/config' },
        { name: 'saves', type: 'folder', path: '/saves' },
        { name: 'settings.cfg', type: 'file', path: '/settings.cfg', size: '2.3 KB' },
        { name: 'mod_loader.jar', type: 'file', path: '/mod_loader.jar', size: '156 KB' }
    ];
}

function renderFiles() {
    const grid = document.getElementById('fileGrid');
    if (!grid) return;
    
    document.getElementById('currentPath').textContent = currentPath;
    
    let html = '';
    files.filter(f => f.path.startsWith(currentPath) && f.path !== currentPath).forEach(file => {
        html += `
            <div class="file-item" ondblclick="${file.type === 'folder' ? `navigateTo('${file.path}')` : `openFile('${file.name}')`}">
                <i class="fas fa-${file.type === 'folder' ? 'folder' : 'file'}"></i>
                <span>${file.name}</span>
                ${file.size ? `<small>${file.size}</small>` : ''}
            </div>
        `;
    });
    
    grid.innerHTML = html;
}

function navigateTo(path) {
    if (path === 'root') path = '/';
    currentPath = path;
    
    document.querySelectorAll('.file-location').forEach(el => el.classList.remove('active'));
    if (path === '/') {
        document.querySelector('.file-location').classList.add('active');
    } else {
        const loc = Array.from(document.querySelectorAll('.file-location')).find(el => 
            el.textContent.includes(path.replace('/', ''))
        );
        if (loc) loc.classList.add('active');
    }
    
    renderFiles();
}

function openFile(name) {
    showNotification('Файл', `Открыт: ${name}`);
}

// ================== ТЕРМИНАЛ ==================
function handleTerminalCommand(event) {
    if (event.key === 'Enter') {
        const input = document.getElementById('terminalInput');
        const command = input.value.trim();
        const output = document.getElementById('terminalOutput');
        
        if (command) {
            output.innerHTML += `<div><span class="prompt">$</span> ${command}</div>`;
            
            const args = command.split(' ');
            const cmd = args[0].toLowerCase();
            
            switch(cmd) {
                case 'help':
                    output.innerHTML += `
                        <div>Доступные команды:</div>
                        <div>  help - показать помощь</div>
                        <div>  clear - очистить экран</div>
                        <div>  date - показать дату</div>
                        <div>  time - показать время</div>
                        <div>  whoami - показать пользователя</div>
                        <div>  ls - список файлов</div>
                        <div>  cat [file] - показать файл</div>
                        <div>  games - список игр</div>
                        <div>  play [game] - запустить игру</div>
                        <div>  calc - открыть калькулятор</div>
                        <div>  notes - открыть заметки</div>
                    `;
                    break;
                    
                case 'clear':
                    output.innerHTML = '<div>Micim OS v2.0</div><div>Тип \'help\' для списка команд</div>';
                    break;
                    
                case 'date':
                    output.innerHTML += `<div>${new Date().toLocaleDateString()}</div>`;
                    break;
                    
                case 'time':
                    output.innerHTML += `<div>${new Date().toLocaleTimeString()}</div>`;
                    break;
                    
                case 'whoami':
                    output.innerHTML += `<div>${currentUser.name} (${currentUser.email})</div>`;
                    break;
                    
                case 'ls':
                    output.innerHTML += `<div>mods/    config/    saves/    settings.cfg    mod_loader.jar</div>`;
                    break;
                    
                case 'games':
                    output.innerHTML += `<div>Доступные игры: snake, tetris, 2048</div>`;
                    break;
                    
                case 'play':
                    if (args[1] === 'snake') openGame('snake');
                    else if (args[1] === 'tetris') openGame('tetris');
                    else if (args[1] === '2048') openGame('2048');
                    else output.innerHTML += `<div>Игра не найдена</div>`;
                    break;
                    
                case 'calc':
                    openApp('calculator');
                    break;
                    
                case 'notes':
                    openApp('notes');
                    break;
                    
                default:
                    if (command) {
                        output.innerHTML += `<div>Команда не найдена: ${cmd}</div>`;
                    }
            }
            
            input.value = '';
            output.scrollTop = output.scrollHeight;
        }
    }
}

// ================== НАСТРОЙКИ ==================
function renderSettings(tab) {
    const content = document.getElementById('settingsContent');
    let html = '';
    
    switch(tab) {
        case 'general':
            html = `
                <div class="setting-group">
                    <h3>Основные настройки</h3>
                    <div class="setting-item">
                        <span>Язык интерфейса</span>
                        <select>
                            <option>Русский</option>
                            <option>English</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <span>Автозапуск музыки</span>
                        <div class="toggle active"></div>
                    </div>
                    <div class="setting-item">
                        <span>Уведомления</span>
                        <div class="toggle active"></div>
                    </div>
                </div>
            `;
            break;
            
        case 'appearance':
            html = `
                <div class="setting-group">
                    <h3>Внешний вид</h3>
                    <div class="setting-item">
                        <span>Тема</span>
                        <select>
                            <option>Светлая</option>
                            <option>Темная</option>
                            <option>Системная</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <span>Анимации</span>
                        <div class="toggle active"></div>
                    </div>
                    <div class="setting-item">
                        <span>Размер текста</span>
                        <input type="range" min="12" max="24" value="16">
                    </div>
                </div>
            `;
            break;
            
        case 'sound':
            html = `
                <div class="setting-group">
                    <h3>Звук</h3>
                    <div class="setting-item">
                        <span>Системные звуки</span>
                        <div class="toggle active"></div>
                    </div>
                    <div class="setting-item">
                        <span>Музыка в меню</span>
                        <div class="toggle active"></div>
                    </div>
                    <div class="setting-item">
                        <span>Громкость уведомлений</span>
                        <input type="range" min="0" max="100" value="50">
                    </div>
                </div>
            `;
            break;
            
        case 'about':
            html = `
                <div class="setting-group">
                    <h3>О системе</h3>
                    <p>Micim OS v2.0</p>
                    <p>Создано для игровой консоли</p>
                    <p>Версия ядра: 5.4.0-micim</p>
                    <p>Сборка: 2024.03.17</p>
                </div>
            `;
            break;
    }
    
    content.innerHTML = html;
}

function switchSettingsTab(tab) {
    document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    renderSettings(tab);
}

// ================== ПРОФИЛЬ ==================
function loadProfile() {
    document.getElementById('profileName').value = currentUser.name;
    document.getElementById('profileEmail').value = currentUser.email;
    
    document.getElementById('totalGamesPlayed').textContent = 
        (snakeGame.gamesPlayed + tetrisGame.gamesPlayed + game2048.gamesPlayed).toString();
    document.getElementById('totalNotes').textContent = notes.length.toString();
}

function updateProfile() {
    currentUser.name = document.getElementById('profileName').value;
    currentUser.email = document.getElementById('profileEmail').value;
    currentUser.status = document.getElementById('profileStatus').value;
    
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userEmail').textContent = currentUser.email;
    
    showNotification('Профиль', 'Данные сохранены', 'success');
}

function changeAvatar() {
    showNotification('Профиль', 'Выберите новое изображение');
}

// ================== БРАУЗЕР ==================
function browserBack() {
    const frame = document.getElementById('browserFrame');
    try { frame.contentWindow.history.back(); } catch(e) {}
}

function browserForward() {
    const frame = document.getElementById('browserFrame');
    try { frame.contentWindow.history.forward(); } catch(e) {}
}

function browserRefresh() {
    const frame = document.getElementById('browserFrame');
    frame.src = frame.src;
}

function browserHome() {
    document.getElementById('browserUrl').value = 'https://micim.local';
    document.getElementById('browserFrame').src = 'about:blank';
}

function browserNavigate(event) {
    if (event.key === 'Enter') {
        const url = event.target.value;
        if (!url.startsWith('http')) {
            event.target.value = 'https://' + url;
        }
        document.getElementById('browserFrame').src = event.target.value;
    }
}

// ================== СИНХРОНИЗАЦИЯ ==================
function syncAll() {
    showNotification('Синхронизация', 'Синхронизация данных...');
    
    setTimeout(() => {
        saveNotes();
        localStorage.setItem('snakeHighScore', snakeGame.highScore);
        localStorage.setItem('tetrisHighScore', tetrisGame.highScore);
        localStorage.setItem('game2048HighScore', game2048.highScore);
        
        showNotification('Синхронизация', 'Готово', 'success');
    }, 2000);
}

function loadStats() {
    snakeGame.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
    snakeGame.gamesPlayed = parseInt(localStorage.getItem('snakeGamesPlayed')) || 0;
    
    tetrisGame.highScore = parseInt(localStorage.getItem('tetrisHighScore')) || 0;
    tetrisGame.gamesPlayed = parseInt(localStorage.getItem('tetrisGamesPlayed')) || 0;
    
    game2048.highScore = parseInt(localStorage.getItem('game2048HighScore')) || 0;
    game2048.gamesPlayed = parseInt(localStorage.getItem('game2048GamesPlayed')) || 0;
}

// ================== ПИТАНИЕ ==================
function lockScreen() {
    showNotification('Система', 'Экран заблокирован');
    document.getElementById('userMenu').classList.remove('active');
    
    // Останавливаем игры
    if (snakeGame.interval) clearInterval(snakeGame.interval);
    if (tetrisGame.interval) clearInterval(tetrisGame.interval);
    
    setTimeout(() => {
        document.getElementById('desktop').classList.remove('active');
        document.querySelector('.welcome-screen').style.display = 'flex';
        document.querySelector('.welcome-screen').style.opacity = '1';
        
        if (backgroundMusic) {
            backgroundMusic.pause();
            welcomeMusic.play();
        }
    }, 1000);
}

function showShutdownMenu() {
    if (confirm('Выключить Micim OS?')) {
        showNotification('Система', 'Выключение...');
        
        // Сохраняем все
        saveNotes();
        
        setTimeout(() => {
            document.body.style.opacity = '0';
            setTimeout(() => {
                document.body.innerHTML = '<div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-size: 48px;">До свидания!</div>';
            }, 1000);
        }, 2000);
    }
}

// ================== ГЛОБАЛЬНЫЕ КЛАВИШИ ==================
function handleGlobalKeys(e) {
    // Alt + число для открытия приложений
    if (e.altKey) {
        const apps = ['store', 'music', 'games', 'photos', 'calculator', 'notes', 'terminal', 'settings'];
        const num = parseInt(e.key);
        if (num >= 1 && num <= apps.length) {
            e.preventDefault();
            openApp(apps[num - 1]);
        }
    }
    
    // Esc для закрытия окон
    if (e.key === 'Escape') {
        if (activeWindows.length > 0) {
            closeWindow(activeWindows[activeWindows.length - 1]);
        }
    }
}

// ================== ЗАКРЫТИЕ МЕНЮ ==================
document.addEventListener('click', function(e) {
    if (!e.target.closest('.icon-btn') && !e.target.closest('.control-center')) {
        document.getElementById('controlCenter').classList.remove('active');
    }
    
    if (!e.target.closest('.user-avatar') && !e.target.closest('.icon-btn') && !e.target.closest('.user-menu')) {
        document.getElementById('userMenu').classList.remove('active');
    }
});

// ================== СТИЛИ ДЛЯ АНИМАЦИЙ ==================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
