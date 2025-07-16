// Timer state
let timerState = {
    minutes: 25,
    seconds: 0,
    isRunning: false,
    isWorkSession: true,
    completedPomodoros: 0
};

// Timer settings
let settings = {
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4
};

// Motivational quotes
const motivationalQuotes = [
    "Every small step forward is progress worth celebrating.",
    "You're stronger than you think, keep pushing forward.",
    "Great things never come from comfort zones.",
    "The only impossible journey is the one you never begin.",
    "Basics are you bread and butter.",
    "Don't watch the clock; do what it does. Keep going.",
    "You are capable of amazing things.",
    "A life full of failures is better than a life full of regrets",
    "Every expert was once a beginner.",
    "Your future self will thank you for not giving up today.",
    "Difficult roads often lead to beautiful destinations.",
    "The pain you feel today will be the strength you feel tomorrow.",
    "We show up even on the days we dont feel like.",
    "Believe you can and you're halfway there.",
    "Champions keep playing until they get it right.",
    "Focus on progress, not perfection.",
    "Small steps daily lead to big changes yearly.",
    "Your only limit is your mind.",
    "Dream it. Believe it. Build it.",
    "My hardwork will make me lucky."
];

// Timer interval
let timerInterval = null;

// DOM elements
const timeDisplay = document.getElementById('time-display');
const progressText = document.getElementById('progress-text');
const sessionType = document.getElementById('session-type');
const playBtn = document.getElementById('play-btn');
const pauseBtn = document.getElementById('pause-btn');
const stopBtn = document.getElementById('stop-btn');
const resetBtn = document.getElementById('reset-btn');
const settingsBtn = document.getElementById('settings-btn');
const progressCircle = document.getElementById('progress-circle');
const pomodorosDisplay = document.getElementById('pomodoros-display');
const quoteDisplay = document.getElementById('quote-display');

// Settings modal elements
const settingsModal = document.getElementById('settings-modal');
const closeSettings = document.getElementById('close-settings');
const cancelSettings = document.getElementById('cancel-settings');
const saveSettings = document.getElementById('save-settings');
const workDurationInput = document.getElementById('work-duration');
const breakDurationInput = document.getElementById('break-duration');
const longBreakDurationInput = document.getElementById('long-break-duration');
const longBreakIntervalInput = document.getElementById('long-break-interval');

// Initialize the app
function init() {
    createBackgroundTomatoes();
    updateDisplay();
    updatePomodorosDisplay();
    setupEventListeners();
}

// Create animated background tomatoes
function createBackgroundTomatoes() {
    const container = document.getElementById('background-tomatoes');
    
    for (let i = 0; i < 15; i++) {
        const tomato = document.createElement('div');
        tomato.className = 'tomato';
        tomato.textContent = '🍅';
        
        // Random positioning
        tomato.style.left = Math.random() * 100 + '%';
        tomato.style.top = Math.random() * 100 + '%';
        
        // Random animation properties
        tomato.style.animationDelay = Math.random() * 5 + 's';
        tomato.style.animationDuration = (3 + Math.random() * 4) + 's';
        tomato.style.fontSize = (20 + Math.random() * 30) + 'px';
        tomato.style.transform = `rotate(${Math.random() * 360}deg)`;
        
        container.appendChild(tomato);
    }
}

// Setup event listeners
function setupEventListeners() {
    playBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    stopBtn.addEventListener('click', stopTimer);
    resetBtn.addEventListener('click', resetTimer);
    settingsBtn.addEventListener('click', openSettings);
    
    // Settings modal
    closeSettings.addEventListener('click', closeSettingsModal);
    cancelSettings.addEventListener('click', closeSettingsModal);
    saveSettings.addEventListener('click', saveSettingsHandler);
    
    // Quote display on hover
    pauseBtn.addEventListener('mouseenter', showQuote);
    pauseBtn.addEventListener('mouseleave', hideQuote);
    stopBtn.addEventListener('mouseenter', showQuote);
    stopBtn.addEventListener('mouseleave', hideQuote);
    
    // Close modal on outside click
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            closeSettingsModal();
        }
    });
}

// Timer functions
function startTimer() {
    timerState.isRunning = true;
    playBtn.style.display = 'none';
    pauseBtn.style.display = 'flex';
    
    timerInterval = setInterval(() => {
        if (timerState.seconds > 0) {
            timerState.seconds--;
        } else if (timerState.minutes > 0) {
            timerState.minutes--;
            timerState.seconds = 59;
        } else {
            // Timer finished
            timerFinished();
        }
        updateDisplay();
    }, 1000);
}

function pauseTimer() {
    timerState.isRunning = false;
    playBtn.style.display = 'flex';
    pauseBtn.style.display = 'none';
    clearInterval(timerInterval);
}

function stopTimer() {
    timerState.isRunning = false;
    playBtn.style.display = 'flex';
    pauseBtn.style.display = 'none';
    clearInterval(timerInterval);
    
    const currentDuration = getCurrentSessionDuration();
    timerState.minutes = currentDuration;
    timerState.seconds = 0;
    updateDisplay();
}

function resetTimer() {
    timerState = {
        minutes: settings.workDuration,
        seconds: 0,
        isRunning: false,
        isWorkSession: true,
        completedPomodoros: 0
    };
    
    playBtn.style.display = 'flex';
    pauseBtn.style.display = 'none';
    clearInterval(timerInterval);
    updateDisplay();
    updatePomodorosDisplay();
}

function timerFinished() {
    timerState.isRunning = false;
    playBtn.style.display = 'flex';
    pauseBtn.style.display = 'none';
    clearInterval(timerInterval);
    
    // Switch session type
    timerState.isWorkSession = !timerState.isWorkSession;
    if (!timerState.isWorkSession) {
        timerState.completedPomodoros++;
    }
    
    // Set new duration
    const newDuration = getCurrentSessionDuration();
    timerState.minutes = newDuration;
    timerState.seconds = 0;
    
    updateDisplay();
    updatePomodorosDisplay();
    
    // Play notification sound (you can add audio here)
    console.log('Timer finished!');
}

// Helper functions
function getCurrentSessionDuration() {
    if (timerState.isWorkSession) {
        return settings.workDuration;
    } else {
        const isLongBreak = timerState.completedPomodoros > 0 && 
                           timerState.completedPomodoros % settings.longBreakInterval === 0;
        return isLongBreak ? settings.longBreakDuration : settings.breakDuration;
    }
}

function getSessionType() {
    if (timerState.isWorkSession) {
        return 'Focus Time';
    } else {
        const isLongBreak = timerState.completedPomodoros > 0 && 
                           timerState.completedPomodoros % settings.longBreakInterval === 0;
        return isLongBreak ? 'Long Break' : 'Short Break';
    }
}

function formatTime(minutes, seconds) {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateDisplay() {
    timeDisplay.textContent = formatTime(timerState.minutes, timerState.seconds);
    sessionType.textContent = getSessionType();
    
    // Update progress
    const totalSeconds = getCurrentSessionDuration() * 60;
    const currentSeconds = timerState.minutes * 60 + timerState.seconds;
    const progress = ((totalSeconds - currentSeconds) / totalSeconds) * 100;
    
    progressText.textContent = `${Math.round(progress)}% Complete`;
    
    // Update progress circle
    const circumference = 2 * Math.PI * 120;
    const offset = circumference - (progress / 100) * circumference;
    progressCircle.style.strokeDashoffset = offset;
}

function updatePomodorosDisplay() {
    pomodorosDisplay.innerHTML = '';
    
    const maxDots = 8;
    const dotsToShow = Math.min(timerState.completedPomodoros, maxDots);
    
    for (let i = 0; i < dotsToShow; i++) {
        const dot = document.createElement('div');
        dot.className = 'pomodoro-dot';
        pomodorosDisplay.appendChild(dot);
    }
    
    if (timerState.completedPomodoros > maxDots) {
        const countSpan = document.createElement('span');
        countSpan.className = 'pomodoro-count';
        countSpan.textContent = `+${timerState.completedPomodoros - maxDots} more`;
        pomodorosDisplay.appendChild(countSpan);
    }
}

// Quote functions
function showQuote() {
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    quoteDisplay.innerHTML = `<p>"${randomQuote}"</p>`;
    quoteDisplay.classList.add('show');
}

function hideQuote() {
    quoteDisplay.classList.remove('show');
}

// Settings functions
function openSettings() {
    workDurationInput.value = settings.workDuration;
    breakDurationInput.value = settings.breakDuration;
    longBreakDurationInput.value = settings.longBreakDuration;
    longBreakIntervalInput.value = settings.longBreakInterval;
    
    settingsModal.classList.add('show');
}

function closeSettingsModal() {
    settingsModal.classList.remove('show');
}

function saveSettingsHandler() {
    settings.workDuration = parseInt(workDurationInput.value) || 25;
    settings.breakDuration = parseInt(breakDurationInput.value) || 5;
    settings.longBreakDuration = parseInt(longBreakDurationInput.value) || 15;
    settings.longBreakInterval = parseInt(longBreakIntervalInput.value) || 4;
    
    // Update current timer if not running
    if (!timerState.isRunning) {
        const newDuration = getCurrentSessionDuration();
        timerState.minutes = newDuration;
        timerState.seconds = 0;
        updateDisplay();
    }
    
    closeSettingsModal();
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
