// BEAUTIFUL ALARM CLOCK WITH BRUTAL AUDIO + DAILY GOALS
class BeautifulBrutalAlarmClock {
    constructor() {
        this.alarmActive = false;
        this.alarmTime = null;
        this.audioContext = null;
        this.sounds = [];
        this.oscillators = [];
        this.intervalIds = [];
        this.backendSounds = [];
        this.dismissAttempts = 0;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateCurrentTime();
        this.createAudioContext();
        this.loadBackendSounds();
        this.setupGoalsHandlers();
        this.setDefaultTime();
        
        // Update time every second
        setInterval(() => this.updateCurrentTime(), 1000);
        
        // Check for alarm every second
        setInterval(() => this.checkAlarm(), 1000);
    }
    
    setupEventListeners() {
        document.getElementById('setAlarmBtn').addEventListener('click', () => this.setAlarm());
        document.getElementById('testAlarmBtn').addEventListener('click', () => this.testAlarm());
        document.getElementById('realDismissBtn').addEventListener('click', () => this.dismissAlarm());
        document.getElementById('addGoalBtn').addEventListener('click', () => this.addCustomGoal());
        
        // Prevent some escape keys during alarm (but not as aggressively)
        document.addEventListener('keydown', (e) => {
            if (this.alarmActive && (e.key === 'Escape' || e.key === 'F11')) {
                e.preventDefault();
                // Don't punish them, just prevent easy escape
            }
        });
    }
    
    loadBackendSounds() {
        // Load the actual sound files from the sounds folder
        const soundFiles = [
            'sounds/149891__abbbrvalg__anxiety-sound-1-tanya_v.wav',
            'sounds/169665__menvafaan__gastly-sounds.mp3',
            'sounds/320662__vumseplutten1709__nosoundstoday.wav',
            'sounds/418765__aceinet__the-wrong-chords.wav',
            'sounds/418769__aceinet__some-terrible-shred.wav',
            'sounds/447801__mosesbrambila__time-of-foreboding-in-an-old-video-game.wav'
        ];
        
        soundFiles.forEach((soundFile, index) => {
            const audio = document.getElementById(`sound${index + 1}`);
            if (audio) {
                audio.src = soundFile;
                audio.volume = 1.0; // MAXED OUT - Your sounds dominate!
                
                // Better error handling for local vs deployed
                audio.addEventListener('loadeddata', () => {
                    console.log(`✅ Loaded backend sound ${index + 1}: ${soundFile.split('/').pop()}`);
                });
                
                audio.addEventListener('canplaythrough', () => {
                    console.log(`🎵 Ready to play: ${soundFile.split('/').pop()}`);
                });
                
                audio.addEventListener('error', (e) => {
                    console.warn(`⚠️ Sound ${index + 1} load failed: ${soundFile.split('/').pop()} (${audio.error ? audio.error.code : 'unknown error'})`);
                    if (location.protocol === 'file:') {
                        console.log('📝 Note: Sound files will work when deployed to GitHub Pages!');
                    }
                });
                
                // Try to load the audio
                try {
                    audio.load();
                    this.backendSounds.push(audio);
                } catch (e) {
                    console.warn(`Failed to load sound ${index + 1}:`, e);
                }
            }
        });
    }
    
    setupGoalsHandlers() {
        this.attachGoalEventListeners();
        this.loadGoals();
    }
    
    attachGoalEventListeners() {
        // Handle goal checkbox changes (for both preset and dynamic goals)
        document.querySelectorAll('.goal-checkbox').forEach(checkbox => {
            // Remove existing listeners to prevent duplicates
            checkbox.removeEventListener('change', this.handleGoalChange);
            checkbox.addEventListener('change', (e) => this.handleGoalChange(e));
        });
        
        // Handle custom goal inputs
        document.querySelectorAll('.custom-goal-input').forEach(input => {
            input.removeEventListener('blur', this.handleGoalInputBlur);
            input.removeEventListener('keydown', this.handleGoalInputKeydown);
            input.addEventListener('blur', () => this.saveGoals());
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    input.blur();
                }
            });
        });
    }
    
    handleGoalChange(e) {
        const goalItem = e.target.closest('.goal-item');
        if (e.target.checked) {
            goalItem.style.background = 'rgba(102, 126, 234, 0.1)';
        } else {
            goalItem.style.background = 'rgba(255, 255, 255, 0.7)';
        }
        this.saveGoals();
    }
    
    addCustomGoal() {
        this.customGoalCounter++;
        const container = document.getElementById('customGoalsContainer');
        
        const goalItem = document.createElement('div');
        goalItem.className = 'goal-item';
        goalItem.innerHTML = `
            <input type="checkbox" id="customGoal${this.customGoalCounter}" class="goal-checkbox">
            <input type="text" id="customGoalText${this.customGoalCounter}" class="custom-goal-input" placeholder="Enter your custom goal...">
            <button class="remove-goal-btn" onclick="this.parentElement.remove(); window.alarmClock.saveGoals();">❌</button>
        `;
        
        container.appendChild(goalItem);
        
        // Attach event listeners to the new goal
        this.attachGoalEventListeners();
        
        // Focus on the new input
        const newInput = goalItem.querySelector('.custom-goal-input');
        newInput.focus();
        
        this.saveGoals();
    }
    
    addCustomGoal() {
        this.customGoalCounter++;
        const container = document.getElementById('customGoalsContainer');
        
        const goalItem = document.createElement('div');
        goalItem.className = 'goal-item';
        goalItem.innerHTML = `
            <input type="checkbox" id="customGoal${this.customGoalCounter}" class="goal-checkbox">
            <input type="text" id="customGoalText${this.customGoalCounter}" class="custom-goal-input" placeholder="Enter your custom goal...">
            <button class="remove-goal-btn" onclick="this.parentElement.remove(); window.alarmClock.saveGoals();">❌</button>
        `;
        
        container.appendChild(goalItem);
        
        // Attach event listeners to the new goal
        this.attachGoalEventListeners();
        
        // Focus on the new input
        const newInput = goalItem.querySelector('.custom-goal-input');
        newInput.focus();
        
        this.saveGoals();
    }
    
    saveGoals() {
        const goals = [];
        
        // Save preset goals
        document.querySelectorAll('.goal-checkbox:not([id^="customGoal"])').forEach(checkbox => {
            const label = checkbox.nextElementSibling;
            if (label && label.classList.contains('goal-label')) {
                goals.push({
                    id: checkbox.id,
                    text: label.textContent,
                    checked: checkbox.checked,
                    type: 'preset'
                });
            }
        });
        
        // Save custom goals
        document.querySelectorAll('.custom-goal-input').forEach(input => {
            const checkbox = input.previousElementSibling;
            if (input.value.trim() && checkbox && checkbox.classList.contains('goal-checkbox')) {
                goals.push({
                    id: checkbox.id,
                    text: input.value,
                    checked: checkbox.checked,
                    type: 'custom'
                });
            }
        });
        
        localStorage.setItem('alarmClockGoals', JSON.stringify(goals));
    }
    
    setDefaultTime() {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 1); // Set to 1 minute from now
        
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const timeString = `${hours}:${minutes}`;
        
        const timeInput = document.querySelector('input[type="time"]');
        if (timeInput) {
            timeInput.value = timeString;
        }
    }

    loadGoals() {
        const savedGoals = localStorage.getItem('alarmClockGoals');
        if (!savedGoals) return;
        
        try {
            const goals = JSON.parse(savedGoals);
            
            // Clear existing custom goals
            const customContainer = document.getElementById('customGoalsContainer');
            customContainer.innerHTML = '';
            this.customGoalCounter = 0;
            
            goals.forEach(goal => {
                if (goal.type === 'preset') {
                    const checkbox = document.getElementById(goal.id);
                    if (checkbox) {
                        checkbox.checked = goal.checked;
                        if (goal.checked) {
                            checkbox.closest('.goal-item').style.background = 'rgba(102, 126, 234, 0.1)';
                        }
                    }
                } else if (goal.type === 'custom') {
                    // Recreate custom goals
                    this.customGoalCounter++;
                    const container = document.getElementById('customGoalsContainer');
                    
                    const goalItem = document.createElement('div');
                    goalItem.className = 'goal-item';
                    goalItem.innerHTML = `
                        <input type="checkbox" id="customGoal${this.customGoalCounter}" class="goal-checkbox" ${goal.checked ? 'checked' : ''}>
                        <input type="text" id="customGoalText${this.customGoalCounter}" class="custom-goal-input" value="${goal.text}">
                        <button class="remove-goal-btn" onclick="this.parentElement.remove(); window.alarmClock.saveGoals();">❌</button>
                    `;
                    
                    if (goal.checked) {
                        goalItem.style.background = 'rgba(102, 126, 234, 0.1)';
                    }
                    
                    container.appendChild(goalItem);
                }
            });
            
            // Reattach event listeners after loading
            this.attachGoalEventListeners();
        } catch (e) {
            console.warn('Could not load saved goals:', e);
        }
    }
    
    createAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }
    
    updateCurrentTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
        document.getElementById('currentTime').textContent = timeString;
        
        if (this.alarmActive) {
            document.getElementById('alarmTimeDisplay').textContent = timeString;
        }
    }
    
    setAlarm() {
        const alarmTimeInput = document.getElementById('alarmTime').value;
        if (!alarmTimeInput) {
            alert('Please set an alarm time first!');
            return;
        }
        
        this.alarmTime = alarmTimeInput;
        document.getElementById('alarmStatus').innerHTML = 
            `🌟 Beautiful alarm set for: ${alarmTimeInput} ⏰<br>💪 Your goals are waiting! 🎯`;
    }
    
    checkAlarm() {
        if (!this.alarmTime || this.alarmActive) return;
        
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        if (currentTime === this.alarmTime) {
            this.triggerAlarm();
        }
    }
    
    testAlarm() {
        this.triggerAlarm();
    }
    
    async triggerAlarm() {
        this.alarmActive = true;
        this.dismissAttempts = 0;
        
        // Switch to beautiful alarm screen immediately
        document.getElementById('setupScreen').classList.remove('active');
        document.getElementById('alarmScreen').classList.add('active');
        
        // Show dismiss button immediately
        document.getElementById('realDismissBtn').classList.remove('hidden');
        
        // Start the BRUTAL audio (but keep visuals beautiful)
        this.startAudioChaos();
        
        // Start beautiful visual effects
        this.startBeautifulEffects();
        
        // Try fullscreen (but don't let it block anything)
        try {
            await document.documentElement.requestFullscreen();
        } catch (e) {
            console.warn('Fullscreen not available');
        }
    }
    
    startAudioChaos() {
        // First, play backend sound files
        this.playBackendSounds();
        
        // Then add generated brutal sounds
        if (!this.audioContext) {
            this.createAudioContext();
        }
        
        // Resume audio context if suspended
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        // Create multiple layers of ANNOYING sounds
        this.createSirenSound();
        this.createBuzzSound();
        this.createScreamSound();
        this.createRandomNoiseSound();
        this.createAlarmBeeps();
        this.createAirHornSound();
        this.createNailsOnChalkboardSound();
    }
    
    playBackendSounds() {
        // Play all available backend sound files simultaneously
        let soundsPlayed = 0;
        
        this.backendSounds.forEach((audio, index) => {
            if (audio.src && audio.readyState >= 2) { // HAVE_CURRENT_DATA or better
                audio.volume = 1.0; // MAXED OUT - Your sounds dominate!
                audio.loop = true;
                
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        soundsPlayed++;
                        console.log(`🔊 Playing sound ${index + 1}: ${audio.src.split('/').pop()}`);
                    }).catch(e => {
                        console.warn(`⚠️ Sound ${index + 1} failed to play:`, e.name || e);
                        // Retry once after short delay
                        setTimeout(() => {
                            if (this.alarmActive) {
                                audio.play().catch(e2 => console.warn(`Retry failed for sound ${index + 1}`));
                            }
                        }, 200);
                    });
                }
            } else {
                console.warn(`⚠️ Sound ${index + 1} not ready (readyState: ${audio.readyState})`);
                // Try to load and play if not ready
                if (audio.src) {
                    audio.load();
                    setTimeout(() => {
                        if (this.alarmActive && audio.readyState >= 2) {
                            audio.volume = 1.0; // MAXED OUT
                            audio.loop = true;
                            audio.play().catch(e => console.warn(`Delayed play failed for sound ${index + 1}`));
                        }
                    }, 500);
                }
            }
        });
        
        // Show status
        setTimeout(() => {
            if (soundsPlayed === 0 && location.protocol === 'file:') {
                console.log('📝 Backend sounds will work when deployed! Using generated sounds for now.');
            } else if (soundsPlayed > 0) {
                console.log(`🎵 ${soundsPlayed}/${this.backendSounds.length} backend sounds playing`);
            }
        }, 1000);
    }
    
    // BRUTAL AUDIO GENERATION METHODS (unchanged from original)
    createSirenSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime); // Dialed DOWN - Your sounds lead!
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Create siren effect
        let increasing = true;
        const sirenInterval = setInterval(() => {
            if (!this.alarmActive) {
                clearInterval(sirenInterval);
                return;
            }
            
            const currentFreq = oscillator.frequency.value;
            if (increasing) {
                oscillator.frequency.setValueAtTime(currentFreq + 60, this.audioContext.currentTime);
                if (currentFreq >= 1000) increasing = false;
            } else {
                oscillator.frequency.setValueAtTime(currentFreq - 60, this.audioContext.currentTime);
                if (currentFreq <= 200) increasing = true;
            }
        }, 80); // Faster modulation
        
        oscillator.start();
        this.oscillators.push(oscillator);
        this.intervalIds.push(sirenInterval);
    }
    
    createBuzzSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(1200, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.08, this.audioContext.currentTime); // Dialed DOWN
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // More aggressive mosquito-like buzz
        const buzzInterval = setInterval(() => {
            if (!this.alarmActive) {
                clearInterval(buzzInterval);
                return;
            }
            
            oscillator.frequency.setValueAtTime(
                1000 + Math.random() * 800, 
                this.audioContext.currentTime
            );
        }, 30); // Even faster
        
        oscillator.start();
        this.oscillators.push(oscillator);
        this.intervalIds.push(buzzInterval);
    }
    
    createScreamSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(3500, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime); // Dialed DOWN
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // More erratic scream-like sound
        const screamInterval = setInterval(() => {
            if (!this.alarmActive) {
                clearInterval(screamInterval);
                return;
            }
            
            oscillator.frequency.setValueAtTime(
                2500 + Math.random() * 3000, 
                this.audioContext.currentTime
            );
        }, 150);
        
        oscillator.start();
        this.oscillators.push(oscillator);
        this.intervalIds.push(screamInterval);
    }
    
    createRandomNoiseSound() {
        const bufferSize = this.audioContext.sampleRate * 2;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        
        // Generate more aggressive white noise
        for (let i = 0; i < bufferSize; i++) {
            output[i] = (Math.random() * 2 - 1) * 0.5; // Louder noise
        }
        
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = buffer;
        source.loop = true;
        gainNode.gain.setValueAtTime(0.03, this.audioContext.currentTime); // Dialed DOWN
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        source.start();
        this.sounds.push(source);
    }
    
    createAlarmBeeps() {
        const beepInterval = setInterval(() => {
            if (!this.alarmActive) {
                clearInterval(beepInterval);
                return;
            }
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(1800, this.audioContext.currentTime); // Higher pitch
            
            gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime); // Dialed DOWN
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.2);
        }, 300); // Faster beeps
        
        this.intervalIds.push(beepInterval);
    }
    
    // NEW BRUTAL SOUNDS
    createAirHornSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.08, this.audioContext.currentTime); // Dialed DOWN
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Air horn blasts
        const hornInterval = setInterval(() => {
            if (!this.alarmActive) {
                clearInterval(hornInterval);
                return;
            }
            
            // Random horn blasts
            if (Math.random() < 0.3) {
                gainNode.gain.setValueAtTime(0.12, this.audioContext.currentTime); // Dialed DOWN
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8);
            }
        }, 1000);
        
        oscillator.start();
        this.oscillators.push(oscillator);
        this.intervalIds.push(hornInterval);
    }
    
    createNailsOnChalkboardSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(2000, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.02, this.audioContext.currentTime); // Dialed WAY DOWN
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Nails on chalkboard simulation
        const chalkInterval = setInterval(() => {
            if (!this.alarmActive) {
                clearInterval(chalkInterval);
                return;
            }
            
            oscillator.frequency.setValueAtTime(
                1800 + Math.sin(Date.now() * 0.01) * 400, 
                this.audioContext.currentTime
            );
        }, 50);
        
        oscillator.start();
        this.oscillators.push(oscillator);
        this.intervalIds.push(chalkInterval);
    }
    
    startBeautifulEffects() {
        // Beautiful visual effects (no chaos, just energy)
        // The CSS animations handle most of the beauty
        // Just add some gentle interactions
        
        const motivationalTexts = document.querySelectorAll('.motivational-text');
        motivationalTexts.forEach((text, index) => {
            setTimeout(() => {
                text.style.opacity = '1';
                text.style.transform = 'translateY(0) scale(1)';
            }, index * 1000);
        });
        
        // EVIL BUTTON TAUNTING - Make it mock the user!
        this.startEvilButtonTaunts();
    }
    
    startEvilButtonTaunts() {
        const dismissBtn = document.getElementById('realDismissBtn');
        const tauntMessages = [
            "Turn Off Alarm",
            "Catch Me! 😈",
            "Too Slow! 🏃‍♂️",
            "Almost There! 😏",
            "Keep Trying! 😂",
            "I'm Over Here! 👋",
            "Can't Catch Me! 🏃",
            "Getting Warmer! 🔥",
            "So Close! 😈",
            "Wake Up First! ☕",
            "Chase Me! 🏃‍♀️",
            "Over Here! 👈",
            "Nope! Try Again! 😝",
            "Wrong Direction! ➡️",
            "Still Sleepy? 😴"
        ];
        
        let tauntIndex = 0;
        const tauntInterval = setInterval(() => {
            if (!this.alarmActive) {
                clearInterval(tauntInterval);
                return;
            }
            
            tauntIndex = (tauntIndex + 1) % tauntMessages.length;
            dismissBtn.textContent = tauntMessages[tauntIndex];
        }, 2000); // Change message every 2 seconds
        
        // Store the interval so we can clear it later
        this.intervalIds.push(tauntInterval);
    }
    
    dismissAlarm() {
        if (!this.alarmActive) return;
        
        // Simple dismiss - just click once!
        this.stopAllAudio();
        
        // Exit fullscreen
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
        
        // Switch back to setup screen with celebration
        document.getElementById('alarmScreen').classList.remove('active');
        document.getElementById('setupScreen').classList.add('active');
        
        // Reset UI with motivational message about goals
        const completedGoals = document.querySelectorAll('.goal-checkbox:checked').length;
        let statusMessage = '🎉 Good morning! Time to conquer the day! 🌟';
        
        if (completedGoals > 0) {
            statusMessage += `<br>💪 You have ${completedGoals} goal${completedGoals > 1 ? 's' : ''} to complete today!`;
        } else {
            statusMessage += '<br>🎯 Don\'t forget to check off your daily goals!';
        }
        
        document.getElementById('alarmStatus').innerHTML = statusMessage;
        document.getElementById('realDismissBtn').textContent = 'Turn Off Alarm';
        
        // Reset alarm time
        this.alarmTime = null;
        document.getElementById('alarmTime').value = '';
        
        // Beautiful success effect
        document.body.style.animation = 'gentleGradientShift 3s ease-in-out';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 3000);
    }
    
    stopAllAudio() {
        this.alarmActive = false;
        
        // Stop all backend sounds
        this.backendSounds.forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
        
        // Stop all oscillators
        this.oscillators.forEach(osc => {
            try {
                osc.stop();
            } catch (e) {
                // Oscillator already stopped
            }
        });
        
        // Stop all buffer sources
        this.sounds.forEach(sound => {
            try {
                sound.stop();
            } catch (e) {
                // Source already stopped
            }
        });
        
        // Clear all intervals
        this.intervalIds.forEach(id => clearInterval(id));
        
        // Reset arrays
        this.oscillators = [];
        this.sounds = [];
        this.intervalIds = [];
    }
}

// Initialize the beautiful but brutal alarm when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.alarmClock = new BeautifulBrutalAlarmClock();
    
    // Friendly warning popup
    setTimeout(() => {
        const proceed = confirm('🌟 Welcome to the Beautiful Alarm Clock! 🌟\n\n✨ VISUAL EXPERIENCE: Gorgeous, energizing, and motivational\n🎵 AUDIO EXPERIENCE: Absolutely brutal and guaranteed to wake you\n💪 GOALS SYSTEM: Set daily intentions and track progress\n\nDrop your own brutal sound files in the sounds/ folder!\n\nReady to experience the perfect balance of beauty and audio chaos?');
        
        if (!proceed) {
            document.body.innerHTML = `
                <div style="display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;font-size:1.5rem;color:#667eea;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);text-align:center;">
                    <h1>✨ Maybe next time! ✨</h1>
                    <p>Sweet dreams! 😴</p>
                </div>
            `;
        }
    }, 1000);
});

console.log('🌟 Beautiful Brutal Alarm Clock loaded! 🌟');
console.log('Visual reward + Audio punishment = Perfect wake-up combo!');