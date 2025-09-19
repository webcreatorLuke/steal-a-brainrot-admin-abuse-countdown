// Global variables
let eventState = 'waiting'; // 'waiting' or 'active'
let targetTime = null;
let eventDuration = 10; // minutes
let waitTime = 30; // minutes
let randomVariation = 5; // minutes
let stats = {
    eventsToday: 0,
    totalEvents: 0,
    currentStreak: 0,
    lastEventDate: null
};

// Statistics Management
function loadStats() {
    const saved = JSON.parse(localStorage.getItem('adminAbuseStats') || '{}');
    stats = { ...stats, ...saved };
    
    // Reset daily counter if it's a new day
    const today = new Date().toDateString();
    if (stats.lastEventDate !== today) {
        stats.eventsToday = 0;
    }
    
    updateStatsDisplay();
}

function saveStats() {
    localStorage.setItem('adminAbuseStats', JSON.stringify(stats));
}

function updateStatsDisplay() {
    document.getElementById('eventsToday').textContent = stats.eventsToday;
    document.getElementById('totalEvents').textContent = stats.totalEvents;
    document.getElementById('currentStreak').textContent = stats.currentStreak;
}

// Time Calculation
function getRandomTime(baseMinutes, variation) {
    const randomOffset = (Math.random() - 0.5) * 2 * variation;
    return (baseMinutes + randomOffset) * 60 * 1000; // Convert to milliseconds
}

// Event Scheduling
function scheduleNextEvent() {
    const now = new Date().getTime();
    
    if (eventState === 'waiting') {
        // Schedule next admin abuse event
        const waitMs = getRandomTime(waitTime, randomVariation);
        targetTime = now + waitMs;
        eventState = 'waiting';
        updateStatus('🔮 Next Admin Abuse in:', 'waiting');
    } else {
        // Event is active, schedule when it ends
        const eventMs = getRandomTime(eventDuration, randomVariation / 2);
        targetTime = now + eventMs;
        eventState = 'active';
        updateStatus('🚨 Admin Abuse Active!', 'active');
        
        // Update stats
        stats.eventsToday++;
        stats.totalEvents++;
        stats.currentStreak++;
        stats.lastEventDate = new Date().toDateString();
        saveStats();
        updateStatsDisplay();
    }
}

// UI Updates
function updateStatus(message, state) {
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
    statusEl.className = `status ${state}`;
}

function updateCountdown() {
    if (!targetTime) {
        scheduleNextEvent();
        return;
    }

    const now = new Date().getTime();
    const timeLeft = targetTime - now;

    if (timeLeft <= 0) {
        // Time's up! Switch states
        if (eventState === 'waiting') {
            eventState = 'active';
            scheduleNextEvent();
        } else {
            eventState = 'waiting';
            scheduleNextEvent();
        }
        return;
    }

    // Calculate time units
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    const milliseconds = Math.floor(timeLeft % 1000);

    // Update display elements
    updateTimeDisplay(hours, minutes, seconds, milliseconds);
}

function updateTimeDisplay(hours, minutes, seconds, milliseconds) {
    // Update individual time units
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    document.getElementById('milliseconds').textContent = String(milliseconds).padStart(3, '0');

    // Update main countdown
    document.getElementById('countdown').textContent = 
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Settings Management
function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    panel.classList.toggle('show');
}

function applySettings() {
    eventDuration = parseInt(document.getElementById('eventDuration').value) || 10;
    waitTime = parseInt(document.getElementById('waitTime').value) || 30;
    randomVariation = parseInt(document.getElementById('randomVariation').value) || 5;
    
    // Reschedule with new settings
    scheduleNextEvent();
    
    // Hide settings panel
    document.getElementById('settingsPanel').classList.remove('show');
}

function resetStats() {
    stats = {
        eventsToday: 0,
        totalEvents: 0,
        currentStreak: 0,
        lastEventDate: null
    };
    saveStats();
    updateStatsDisplay();
}

// Audio Effects
function createNotificationSound(frequency = 400, duration = 0.5, volume = 0.1) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
        console.log('Audio not supported or blocked');
    }
}

function playEventSound() {
    const frequency = eventState === 'active' ? 800 : 400;
    createNotificationSound(frequency, 0.5, 0.1);
}

// Enhanced Features
function addVisualEffects() {
    // Add particle effects or other visual enhancements here
    if (eventState === 'active') {
        document.body.style.filter = 'hue-rotate(20deg) saturate(1.2)';
    } else {
        document.body.style.filter = 'none';
    }
}

// Initialization and Main Loop
function initializeApp() {
    loadStats();
    scheduleNextEvent();
    
    // Main update loop - runs every 50ms for smooth animation
    setInterval(() => {
        updateCountdown();
        addVisualEffects();
    }, 50);
    
    // Optional: Add sound notifications
    let lastState = eventState;
    setInterval(() => {
        if (eventState !== lastState) {
            playEventSound();
            lastState = eventState;
        }
    }, 100);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', initializeApp);

// Export functions for global access
window.toggleSettings = toggleSettings;
window.applySettings = applySettings;
window.resetStats = resetStats;
