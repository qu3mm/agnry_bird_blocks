// timer.js - 5-Minute Interval Check-in Form Controller supporting Difficulty Tiers

class CheckinTimer {
    constructor(options = {}) {
        this.defaultDuration = 300; // 5 minutes in seconds
        this.timeRemaining = this.defaultDuration;
        this.timerInterval = null;
        this.isRunning = false;
        this.isFormOpen = false;
        this.currentMode = "normal"; // "normal" (5m) or "demo" (15s)

        // UI Element IDs
        this.displayId = options.displayId || "timer-display";
        this.progressId = options.progressId || "timer-progress";
        this.modalId = options.modalId || "checkin-modal";
        this.historyModalId = options.historyModalId || "history-modal";
        this.historyTableId = options.historyTableId || "history-table-body";

        this.onTimerExpired = options.onTimerExpired || null;
        this.onCheckinComplete = options.onCheckinComplete || null;

        // Quiz questions across Tiers
        this.tierQuizzes = {
            easy: [
                {
                    q: "If the Red Bird turns left twice (180°), what direction is it facing compared to its start?",
                    options: ["The opposite direction", "The same direction", "Upwards towards the sky"],
                    correct: 0
                },
                {
                    q: "Why do we place blocks in a specific sequence?",
                    options: ["Computers execute instructions in exact order", "Color looks prettier that way", "Order does not matter"],
                    correct: 0
                }
            ],
            medium: [
                {
                    q: "Why is a 'repeat 5 times' loop better than stacking 5 'move forward' blocks?",
                    options: ["It keeps code shorter, cleaner, and uses fewer blocks", "It moves the bird 10 times faster", "It changes the bird color"],
                    correct: 0
                },
                {
                    q: "What makes 'repeat until 🐷' stop repeating?",
                    options: ["When the bird reaches the target pig", "After exactly 3 seconds", "When the spacebar is pressed"],
                    correct: 0
                }
            ],
            hard: [
                {
                    q: "When does an 'if path to the left' block run its inner actions?",
                    options: ["Only when there is a walkable path to the left", "Every single step regardless of walls", "Only when the pig is sleeping"],
                    correct: 0
                },
                {
                    q: "What is a 'nested loop'?",
                    options: ["A loop placed inside another loop", "A loop that has bird feathers", "A loop that crashes immediately"],
                    correct: 0
                }
            ]
        };

        this.init();
    }

    init() {
        this.updateDisplay();
        this.setupFormListeners();
        this.startTimer();
    }

    setMode(mode) {
        this.currentMode = mode;
        if (mode === "demo") {
            this.defaultDuration = 15; // 15 seconds for testing
        } else {
            this.defaultDuration = 300; // 5 minutes
        }
        this.resetTimer();
    }

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.isRunning = true;

        this.timerInterval = setInterval(() => {
            if (this.isFormOpen) return;

            if (this.timeRemaining > 0) {
                this.timeRemaining--;
                this.updateDisplay();
            } else {
                this.triggerCheckin();
            }
        }, 1000);
    }

    pauseTimer() {
        this.isRunning = false;
    }

    resumeTimer() {
        this.isRunning = true;
    }

    resetTimer() {
        this.timeRemaining = this.defaultDuration;
        this.updateDisplay();
        this.startTimer();
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

        const displayEl = document.getElementById(this.displayId);
        if (displayEl) {
            displayEl.textContent = formatted;
            if (this.timeRemaining <= 30) {
                displayEl.classList.add("timer-urgent");
            } else {
                displayEl.classList.remove("timer-urgent");
            }
        }

        const progressEl = document.getElementById(this.progressId);
        if (progressEl) {
            const pct = ((this.defaultDuration - this.timeRemaining) / this.defaultDuration) * 100;
            progressEl.style.width = `${pct}%`;
        }
    }

    triggerCheckin(isManual = false) {
        this.isFormOpen = true;
        window.soundFX?.playTimerChime();

        if (this.onTimerExpired) {
            this.onTimerExpired();
        }

        this.showCheckinModal(isManual);
    }

    showCheckinModal(isManual = false) {
        const modal = document.getElementById(this.modalId);
        if (!modal) return;

        // Current level & tier
        const currentLevel = window.LEVELS[window.app ? window.app.currentLevelIndex : 0];
        const tierKey = currentLevel ? currentLevel.tier : "easy";
        const tierQuizzes = this.tierQuizzes[tierKey] || this.tierQuizzes.easy;
        const quiz = tierQuizzes[Math.floor(Math.random() * tierQuizzes.length)];

        // Update tier tag in check-in modal
        const tierTagEl = document.getElementById("checkin-modal-tier-tag");
        if (tierTagEl && currentLevel) {
            tierTagEl.textContent = `Current Puzzle: #${currentLevel.id} (${window.TIERS[tierKey]?.name} - ${window.TIERS[tierKey]?.concept})`;
        }

        // Populate quiz question
        const quizContainer = document.getElementById("checkin-quiz-container");
        if (quizContainer) {
            quizContainer.innerHTML = `
                <div class="quiz-question-title">${quiz.q}</div>
                <div class="quiz-options-group">
                    ${quiz.options.map((opt, i) => `
                        <label class="quiz-option-item">
                            <input type="radio" name="checkin_quiz" value="${i}" ${i === 0 ? "checked" : ""}>
                            <span>${opt}</span>
                        </label>
                    `).join("")}
                </div>
            `;
            this.activeQuizCorrect = quiz.correct;
        }

        modal.classList.add("modal-active");
        modal.setAttribute("aria-hidden", "false");
    }

    setupFormListeners() {
        const form = document.getElementById("checkin-form");
        if (form) {
            form.addEventListener("submit", (e) => {
                e.preventDefault();
                this.handleSubmitForm(form);
            });
        }

        // Fast demo button
        const demoBtn = document.getElementById("btn-test-checkin");
        if (demoBtn) {
            demoBtn.addEventListener("click", () => {
                this.triggerCheckin(true);
            });
        }

        // Timer interval selector
        const modeSelect = document.getElementById("timer-mode-select");
        if (modeSelect) {
            modeSelect.addEventListener("change", (e) => {
                this.setMode(e.target.value);
            });
        }

        // View history button
        const historyBtn = document.getElementById("btn-view-history");
        if (historyBtn) {
            historyBtn.addEventListener("click", () => {
                this.showHistoryModal();
            });
        }

        const closeHistoryBtn = document.getElementById("btn-close-history");
        if (closeHistoryBtn) {
            closeHistoryBtn.addEventListener("click", () => {
                this.hideHistoryModal();
            });
        }
    }

    handleSubmitForm(form) {
        const feelingEl = form.querySelector('input[name="student_feeling"]:checked');
        const feeling = feelingEl ? feelingEl.value : "Good";

        const conceptEls = form.querySelectorAll('input[name="student_concept"]:checked');
        const concepts = Array.from(conceptEls).map(el => el.value);

        const quizChoiceEl = form.querySelector('input[name="checkin_quiz"]:checked');
        const quizIndex = quizChoiceEl ? parseInt(quizChoiceEl.value, 10) : 0;
        const isQuizCorrect = quizIndex === this.activeQuizCorrect;

        const reflectionEl = form.querySelector('#checkin-reflection');
        const reflection = reflectionEl ? reflectionEl.value.trim() : "";

        const currentLvl = window.app ? window.app.currentLevelIndex + 1 : 1;
        const currentTier = window.LEVELS[currentLvl - 1]?.tier || "easy";

        const record = {
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            date: new Date().toLocaleDateString(),
            feeling: feeling,
            tier: window.TIERS[currentTier]?.name || currentTier,
            concepts: concepts.length > 0 ? concepts.join(", ") : "Logic",
            quizCorrect: isQuizCorrect,
            reflection: reflection || "Progressing steadily!",
            level: currentLvl
        };

        this.saveRecord(record);
        window.soundFX?.playWin();

        const modal = document.getElementById(this.modalId);
        if (modal) {
            modal.classList.remove("modal-active");
            modal.setAttribute("aria-hidden", "true");
        }

        this.isFormOpen = false;
        this.resetTimer();

        this.showToast(`Check-in recorded! Great reflection. Next check-in in ${this.currentMode === "demo" ? "15s" : "5 mins"}.`);

        if (this.onCheckinComplete) {
            this.onCheckinComplete(record);
        }
    }

    saveRecord(record) {
        try {
            const history = this.getHistory();
            history.unshift(record);
            localStorage.setItem("hoc_checkin_history", JSON.stringify(history));
        } catch (e) {
            console.error("Failed to save checkin:", e);
        }
    }

    getHistory() {
        try {
            const data = localStorage.getItem("hoc_checkin_history");
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    showHistoryModal() {
        const modal = document.getElementById(this.historyModalId);
        const tbody = document.getElementById(this.historyTableId);
        if (!modal || !tbody) return;

        const history = this.getHistory();
        if (history.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px; color: #888;">No check-ins submitted yet. The 5-minute timer is running!</td></tr>`;
        } else {
            tbody.innerHTML = history.map(item => `
                <tr>
                    <td><strong>${item.timestamp}</strong></td>
                    <td>Puzzle ${item.level} <span class="badge" style="background:#e2e8f0; font-size:11px;">${item.tier || ""}</span></td>
                    <td><span class="badge badge-feeling">${item.feeling}</span></td>
                    <td>${item.concepts}</td>
                    <td><em>"${item.reflection}"</em></td>
                </tr>
            `).join("");
        }

        modal.classList.add("modal-active");
    }

    hideHistoryModal() {
        const modal = document.getElementById(this.historyModalId);
        if (modal) modal.classList.remove("modal-active");
    }

    showToast(msg) {
        const toast = document.createElement("div");
        toast.className = "game-toast";
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add("toast-visible"), 50);
        setTimeout(() => {
            toast.classList.remove("toast-visible");
            setTimeout(() => toast.remove(), 400);
        }, 3800);
    }
}

if (typeof window !== "undefined") {
    window.CheckinTimer = CheckinTimer;
}
