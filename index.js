import { LungsAnimation } from './lungs-animation.js';
import { TextTransmute } from './text-transmute.js';
import { ShieldAnimation } from './shield-animation.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- MODALS & MAIN ELEMENTS ---
    const sessionModalEl = document.getElementById('sessionModal');
    const sessionModal = new bootstrap.Modal(sessionModalEl);
    const diagnosisModalEl = document.getElementById('diagnosisModal');
    const diagnosisModal = new bootstrap.Modal(diagnosisModalEl);

    // --- CALENDAR & PROGRESS ---
    const calendarGrid = document.getElementById('calendar-grid');
    const progressBar = document.getElementById('session-progress-bar');
    const progressText = document.getElementById('session-progress-text');

    // --- AUDIO ---
    const playPauseBtn = document.getElementById('playPauseBtn');
    const frequenciesContainer = document.getElementById('frequencies');
    let audioContext;
    let audioBuffer;
    let sourceNode;
    let isPlaying = false;
    let activeAudio = {
        element: null,
        source: null
    };

    // --- ANIMATIONS ---
    const lungsAnimation = new LungsAnimation('healingCanvas');
    const textTransmute = new TextTransmute('transmuteCanvas', 'unspoken-text');
    const shieldAnimation = new ShieldAnimation('shieldCanvas');

    // --- RITUAL & AFFIRMATIONS ---
    const ritualAffirmationEl = document.getElementById('ritual-affirmation');
    let progressInterval;
    let affirmationInterval;
    const ritualAffirmations = [
        "I breathe in pure light.",
        "My lungs are vibrant and clear.",
        "Water cleanses my every cell.",
        "My body is a temple of light.",
        "I am healed, whole, and radiant."
    ];
    
    // --- EMOTIONAL RELEASE ---
    const transmuteBtn = document.getElementById('transmuteBtn');
    const releaseAffirmationEl = document.getElementById('release-affirmation');
    
    // --- SHIELD ---
    const activateShieldBtn = document.getElementById('activateShieldBtn');

    // --- QUIZ ---
    const quizContainer = document.getElementById('quiz-container');
    const submitQuizBtn = document.getElementById('submitQuizBtn');
    const quizResultsEl = document.getElementById('quiz-results');
    const diagnosisResultTextEl = document.getElementById('diagnosis-result-text');

    // --- DATA ---
    const audioFiles = {
        '528 Hz': 'assets/freq-528.mp3',
        '639 Hz': 'assets/freq-639.mp3',
        '741 Hz': 'assets/freq-741.mp3',
        'ritual': 'assets/binaural-beats-module-2.mp3', // Re-use harmonious track
    };
    
    let userProgress = JSON.parse(localStorage.getItem('healingProgress')) || { days: [], darkness: 0.8 };

    // --- INITIALIZATION ---
    function init() {
        initCalendar();
        updateLungsAnimation();
        setupFrequencyControls();
        setupQuiz();
    }

    // --- AUDIO HANDLING ---
    function setupAudioContext() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    async function loadAudioForPlayback(url, isLooping = true) {
        setupAudioContext();
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const decodedBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            const source = audioContext.createBufferSource();
            source.buffer = decodedBuffer;
            source.loop = isLooping;
            source.connect(audioContext.destination);
            return source;
        } catch (error) {
            console.error('Error loading audio:', error);
            return null;
        }
    }

    function stopActiveAudio() {
        if(activeAudio.source) {
            activeAudio.source.stop();
            activeAudio.source.disconnect();
        }
        if(activeAudio.element) {
            activeAudio.element.textContent = 'Play';
            activeAudio.element.classList.remove('btn-danger');
            activeAudio.element.classList.add('btn-success');
        }
        activeAudio = { element: null, source: null };
    }

    // --- CALENDAR & DAILY PROGRESS ---
    function initCalendar() {
        calendarGrid.innerHTML = '';
        for (let i = 1; i <= 21; i++) {
            const dayEl = document.createElement('div');
            dayEl.classList.add('calendar-day');
            dayEl.textContent = i;
            if (userProgress.days.includes(i)) {
                dayEl.classList.add('completed');
            }
            calendarGrid.appendChild(dayEl);
        }
    }
    
    function updateLungsAnimation() {
        const progressPercentage = userProgress.days.length / 21;
        lungsAnimation.setHealingLevel(progressPercentage);
    }
    
    function markDayAsComplete() {
        const nextDay = userProgress.days.length + 1;
        if (nextDay <= 21 && !userProgress.days.includes(nextDay)) {
             userProgress.days.push(nextDay);
             localStorage.setItem('healingProgress', JSON.stringify(userProgress));
        }
        initCalendar(); // Redraw calendar
        updateLungsAnimation();
    }
    
    // --- DAILY RITUAL ---
    document.getElementById('dailyRitualBtn').addEventListener('click', async () => {
        resetSessionUI();
        audioBuffer = await loadAudioForPlayback(audioFiles['ritual'], true);
        startAffirmations(ritualAffirmations);
        sessionModal.show();
    });

    playPauseBtn.addEventListener('click', () => {
        if (isPlaying) {
            pauseAudio();
        } else {
            playAudio();
        }
    });

    function playAudio() {
        if (!audioBuffer) return;
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        sourceNode = audioBuffer; // The loaded source is the buffer
        sourceNode.start();
        isPlaying = true;
        playPauseBtn.textContent = 'Pause';
        startSessionProgress();
    }

    function pauseAudio() {
        if (sourceNode) {
            sourceNode.stop();
        }
        isPlaying = false;
        playPauseBtn.textContent = 'Play';
        clearInterval(progressInterval);
    }

    function startAffirmations(affirmations) {
        let index = 0;
        ritualAffirmationEl.textContent = affirmations[index];
        affirmationInterval = setInterval(() => {
            index = (index + 1) % affirmations.length;
            ritualAffirmationEl.textContent = affirmations[index];
        }, 5000); // 5 seconds per affirmation
    }

    function startSessionProgress() {
        const sessionDuration = 7 * 60 * 1000; // 7 minutes
        // const sessionDuration = 10000; // 10s for testing
        let elapsedTime = 0;
        
        progressInterval = setInterval(() => {
            elapsedTime += 100;
            const percentage = Math.min((elapsedTime / sessionDuration) * 100, 100);
            progressBar.style.width = `${percentage}%`;
            progressText.textContent = `${Math.round(percentage)}%`;

            if (percentage >= 100) {
                completeSession();
            }
        }, 100);
    }

    function completeSession() {
        clearInterval(progressInterval);
        if(isPlaying) pauseAudio();
        markDayAsComplete();
        setTimeout(() => {
            sessionModal.hide();
            alert("Daily ritual complete! Well done.");
        }, 500);
    }
    
    function resetSessionUI() {
        clearInterval(affirmationInterval);
        clearInterval(progressInterval);
        ritualAffirmationEl.textContent = '';
        progressBar.style.width = '0%';
        progressText.textContent = '0%';
        playPauseBtn.textContent = 'Play';
        isPlaying = false;
        if(sourceNode) {
            try { sourceNode.stop(); } catch(e) {}
            sourceNode = null;
        }
        audioBuffer = null;
    }

    sessionModalEl.addEventListener('hidden.bs.modal', resetSessionUI);

    // --- HEALING FREQUENCIES ---
    function setupFrequencyControls() {
        frequenciesContainer.innerHTML = '';
        Object.keys(audioFiles).filter(k => k !== 'ritual').forEach(name => {
            const div = document.createElement('div');
            div.className = 'frequency-control';
            div.innerHTML = `
                <span>${name}</span>
                <button class="btn btn-success btn-sm">Play</button>
            `;
            const button = div.querySelector('button');
            button.addEventListener('click', async (e) => {
                e.stopPropagation();
                setupAudioContext();

                if (activeAudio.element === button) {
                    stopActiveAudio();
                } else {
                    stopActiveAudio();
                    const source = await loadAudioForPlayback(audioFiles[name], true);
                    if(source) {
                        source.start();
                        button.textContent = 'Stop';
                        button.classList.remove('btn-success');
                        button.classList.add('btn-danger');
                        activeAudio = { element: button, source: source };
                    }
                }
            });
            frequenciesContainer.appendChild(div);
        });
    }

    // --- EMOTIONAL RELEASE ---
    transmuteBtn.addEventListener('click', () => {
        textTransmute.dissolve();
        transmuteBtn.disabled = true;
        setTimeout(() => {
            releaseAffirmationEl.textContent = "I release the burden that is not mine. I breathe my healing.";
            transmuteBtn.disabled = false;
        }, 2500);
    });

    // --- SHIELD ACTIVATION ---
    activateShieldBtn.addEventListener('click', () => {
        shieldAnimation.start();
        activateShieldBtn.disabled = true;
        setTimeout(() => {
            activateShieldBtn.disabled = false;
        }, 3000);
    });

    // --- DIAGNOSIS QUIZ ---
    const quizQuestions = [
        "On a scale of 1-5, how heavy does your chest feel? (1=light, 5=heavy)",
        "On a scale of 1-5, how restricted is your breathing? (1=free, 5=restricted)",
        "On a scale of 1-5, how much fear are you holding onto right now? (1=none, 5=a lot)",
        "On a scale of 1-5, how much sadness or grief are you experiencing? (1=none, 5=a lot)",
        "On a scale of 1-5, how would you rate your current energy levels? (1=low, 5=high)",
        "On a scale of 1-5, how much unspoken resentment are you holding? (1=none, 5=a lot)",
        "On a scale of 1-5, do you feel a sense of oppression in your daily life? (1=not at all, 5=very)",
        "On a scale of 1-5, how would you rate your air quality? (1=poor, 5=excellent)",
        "On a scale of 1-5, how often do you experience coughing or a sore throat? (1=rarely, 5=often)",
        "On a scale of 1-5, how connected do you feel to inner peace? (1=disconnected, 5=very connected)",
    ];

    function setupQuiz() {
        quizContainer.innerHTML = '';
        quizQuestions.forEach((q, i) => {
            quizContainer.innerHTML += `
                <div class="question-group">
                    <label for="q${i}" class="form-label">${q}</label>
                    <input type="range" class="form-range" min="1" max="5" id="q${i}" value="3">
                </div>
            `;
        });
        quizResultsEl.classList.add('d-none');
        diagnosisResultTextEl.textContent = 'Your initial energetic reading is complete. Your personalized healing journey will now reflect this. You can retake this diagnosis anytime.'; // Reset text
        quizContainer.classList.remove('d-none');
        submitQuizBtn.classList.remove('d-none');
    }

    submitQuizBtn.addEventListener('click', () => {
        let totalScore = 0;
        const highIsGoodIndices = [4, 7, 9]; // Indices for questions where a higher score is better

        quizQuestions.forEach((q, i) => {
            const value = parseInt(document.getElementById(`q${i}`).value);
            if (highIsGoodIndices.includes(i + 1)) {
                // Invert score for these questions (e.g., 5 -> 1, 4 -> 2, etc.)
                totalScore += (6 - value);
            } else {
                totalScore += value;
            }
        });

        const maxScore = quizQuestions.length * 5;
        // Higher score = more symptoms = higher darkness level
        const darknessLevel = totalScore / maxScore; // Normalize to 0-1
        userProgress.darkness = Math.max(0.2, darknessLevel * 0.8); // Scale to 0.2-0.8
        localStorage.setItem('healingProgress', JSON.stringify(userProgress));
        
        lungsAnimation.setInitialDarkness(userProgress.darkness);
        updateLungsAnimation();

        // Generate personalized result text
        let resultText = '';
        if (darknessLevel < 0.4) {
            resultText = "Your energy field shows minor respiratory congestion. Focus on light breathing and maintaining emotional clarity.";
        } else if (darknessLevel < 0.7) {
            resultText = "There are notable energetic blockages in your respiratory system, likely linked to suppressed emotions. The healing frequencies and emotional release will be very beneficial.";
        } else {
            resultText = "Your respiratory system is carrying a significant energetic burden. This journey is crucial for you. Be patient and gentle with yourself as you release these deep patterns.";
        }
        diagnosisResultTextEl.textContent = resultText;

        quizContainer.classList.add('d-none');
        submitQuizBtn.classList.add('d-none');
        quizResultsEl.classList.remove('d-none');
        
        setTimeout(() => {
            diagnosisModal.hide();
            setTimeout(setupQuiz, 500); // Reset for next time
        }, 3000);
    });

    // --- KICK IT OFF ---
    init();
});