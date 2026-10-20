// app.js - Main Application Coordinator supporting 20 Puzzles across 3 Tiers

class HourOfCodeApp {
    constructor() {
        this.currentLevelIndex = 0;
        this.currentTierFilter = "all"; // 'all', 'easy', 'medium', 'hard'
        this.mazeRenderer = null;
        this.workspace = null;
        this.timer = null;
        this.isRunning = false;
        this.runCanceled = false;

        this.init();
    }

    init() {
        this.mazeRenderer = new MazeRenderer("maze-container");
        this.workspace = new BlockWorkspace("toolbox-blocks", "workspace-canvas", "workspace-block-count");
        this.timer = new CheckinTimer({
            displayId: "timer-display",
            progressId: "timer-progress-bar",
            modalId: "checkin-modal",
            historyModalId: "history-modal",
            historyTableId: "history-table-body",
            onTimerExpired: () => this.handleTimerPause(),
            onCheckinComplete: () => this.handleTimerResume()
        });

        this.setupEventListeners();
        this.renderTierTabs();
        this.loadLevel(0);
        this.renderLevelPagination();
    }

    renderTierTabs() {
        const container = document.getElementById("tier-tabs-container");
        if (!container) return;

        const tiers = [
            { id: "all", label: "All Puzzles (1–20)" },
            { id: "easy", label: "Easy (1–5) - Sequencing" },
            { id: "medium", label: "Medium (6–13) - Repeat Loops" },
            { id: "hard", label: "Hard (14–20) - If/Then & Nested" }
        ];

        container.innerHTML = tiers.map(t => `
            <button class="tier-tab-btn ${t.id === this.currentTierFilter ? "active" : ""}" data-tier="${t.id}">
                ${t.label}
            </button>
        `).join("");

        container.querySelectorAll(".tier-tab-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const tierId = btn.dataset.tier;
                this.setTierFilter(tierId);
            });
        });
    }

    setTierFilter(tierId) {
        this.currentTierFilter = tierId;
        document.querySelectorAll(".tier-tab-btn").forEach(b => {
            b.classList.toggle("active", b.dataset.tier === tierId);
        });

        // Jump to first level of that tier if current level is not in it
        if (tierId !== "all") {
            const firstOfTier = window.LEVELS.findIndex(l => l.tier === tierId);
            if (firstOfTier !== -1 && window.LEVELS[this.currentLevelIndex].tier !== tierId) {
                this.loadLevel(firstOfTier);
            }
        }
        this.renderLevelPagination();
    }

    renderLevelPagination() {
        const container = document.getElementById("level-bubbles");
        if (!container) return;
        container.innerHTML = "";

        window.LEVELS.forEach((level, idx) => {
            // If filtered by tier
            if (this.currentTierFilter !== "all" && level.tier !== this.currentTierFilter) {
                return;
            }

            const bubble = document.createElement("button");
            bubble.className = `level-bubble tier-bubble-${level.tier} ${idx === this.currentLevelIndex ? "active" : ""}`;
            bubble.textContent = idx + 1;
            bubble.title = `${level.title} (${window.TIERS[level.tier]?.name})`;

            bubble.addEventListener("click", () => {
                if (!this.isRunning) {
                    this.loadLevel(idx);
                }
            });
            container.appendChild(bubble);
        });
    }

    updatePaginationUI() {
        const bubbles = document.querySelectorAll(".level-bubble");
        bubbles.forEach((b) => {
            const num = parseInt(b.textContent, 10) - 1;
            if (num === this.currentLevelIndex) {
                b.classList.add("active");
            } else {
                b.classList.remove("active");
            }
        });
    }

    loadLevel(index) {
        if (index < 0 || index >= window.LEVELS.length) return;
        this.currentLevelIndex = index;
        const level = window.LEVELS[index];
        const tierInfo = window.TIERS[level.tier];

        // Update Tier & Concepts Banner Badge
        const tierBadge = document.getElementById("level-tier-badge");
        if (tierBadge && tierInfo) {
            tierBadge.textContent = `${tierInfo.name}: ${tierInfo.concept}`;
            tierBadge.className = `tier-pill-badge ${tierInfo.badgeClass}`;
        }

        // Update instruction text
        const instructionText = document.getElementById("instruction-text");
        if (instructionText) {
            instructionText.textContent = level.instruction;
        }

        // Update level title
        const levelTitle = document.getElementById("current-level-title");
        if (levelTitle) {
            levelTitle.textContent = `${level.title} (${tierInfo?.range})`;
        }

        // Render maze and workspace
        this.mazeRenderer.init(level);
        this.workspace.loadLevel(level);

        this.setRunState(false);
        this.updatePaginationUI();
    }

    setupEventListeners() {
        // Run / Reset Button
        const runBtn = document.getElementById("btn-run");
        if (runBtn) {
            runBtn.addEventListener("click", () => {
                if (this.isRunning) {
                    this.resetRun();
                } else {
                    this.runProgram();
                }
            });
        }

        // Reset Workspace
        const startOverBtn = document.getElementById("btn-start-over");
        if (startOverBtn) {
            startOverBtn.addEventListener("click", () => {
                if (confirm("Reset blocks back to the start of this puzzle?")) {
                    this.loadLevel(this.currentLevelIndex);
                    window.soundFX?.playTrash();
                }
            });
        }

        // Show Code Button
        const showCodeBtn = document.getElementById("btn-show-code");
        if (showCodeBtn) {
            showCodeBtn.addEventListener("click", () => {
                this.showCodeModal();
            });
        }

        const closeCodeBtn = document.getElementById("btn-close-code");
        if (closeCodeBtn) {
            closeCodeBtn.addEventListener("click", () => {
                document.getElementById("code-modal")?.classList.remove("modal-active");
            });
        }

        // Text to Speech
        const ttsBtn = document.getElementById("btn-tts");
        if (ttsBtn) {
            ttsBtn.addEventListener("click", () => {
                this.speakInstructions();
            });
        }

        // Hint Button
        const hintBtn = document.getElementById("btn-show-hint");
        if (hintBtn) {
            hintBtn.addEventListener("click", () => {
                this.showHintModal();
            });
        }

        const closeHintBtn = document.getElementById("btn-close-hint");
        if (closeHintBtn) {
            closeHintBtn.addEventListener("click", () => {
                document.getElementById("hint-modal")?.classList.remove("modal-active");
            });
        }

        // Victory Modal Buttons
        const nextPuzzleBtn = document.getElementById("btn-next-puzzle");
        if (nextPuzzleBtn) {
            nextPuzzleBtn.addEventListener("click", () => {
                document.getElementById("win-modal")?.classList.remove("modal-active");
                if (this.currentLevelIndex + 1 < window.LEVELS.length) {
                    this.loadLevel(this.currentLevelIndex + 1);
                } else {
                    alert("🏆 Outstanding! You have mastered all 20 puzzles in the Hour of Code!");
                }
            });
        }

        const replayBtn = document.getElementById("btn-replay-puzzle");
        if (replayBtn) {
            replayBtn.addEventListener("click", () => {
                document.getElementById("win-modal")?.classList.remove("modal-active");
                this.resetRun();
            });
        }

        // Sound Toggle
        const soundToggle = document.getElementById("btn-toggle-sound");
        if (soundToggle) {
            soundToggle.addEventListener("click", () => {
                const isMuted = soundToggle.classList.toggle("sound-muted");
                window.soundFX?.setMuted(isMuted);
                soundToggle.textContent = isMuted ? "🔇 Sound Off" : "🔊 Sound On";
            });
        }
    }

    setRunState(running) {
        this.isRunning = running;
        const runBtn = document.getElementById("btn-run");
        if (runBtn) {
            if (running) {
                runBtn.textContent = "🔄 Reset";
                runBtn.classList.add("btn-reset");
            } else {
                runBtn.innerHTML = `<span>▶</span> Run`;
                runBtn.classList.remove("btn-reset");
            }
        }
    }

    // =========================================================================
    // Program Execution Engine (Supports Loops, Nested Loops & Conditionals)
    // =========================================================================
    async runProgram() {
        if (this.isRunning) return;
        this.setRunState(true);
        this.runCanceled = false;

        const tree = this.workspace.getExecutionTree();

        if (tree.length === 0) {
            this.showFeedbackModal("No blocks attached!", "Snap some action or loop blocks under 'when run' to make the bird move.");
            this.setRunState(false);
            return;
        }

        this.executionStepCount = 0;
        const maxSafetySteps = 150; // prevents infinite while loops

        const outcome = await this.executeNodeList(tree, maxSafetySteps);
        this.workspace.highlightBlock(null);

        if (this.runCanceled) return;

        if (outcome.reachedPig || this.mazeRenderer.hasReachedPig()) {
            this.showWinModal();
        } else if (outcome.crashed) {
            if (outcome.reason === "tnt") {
                this.showFeedbackModal("Kaboom! 💥", "You hit the TNT! Plan a safe path around the danger.");
            } else {
                this.showFeedbackModal("Keep coding!", "You hit a wall or obstacle. Check your turns and steps!");
            }
        } else {
            this.showFeedbackModal("Not quite there yet!", "You ran out of blocks or loop iterations before reaching the pig. Add or adjust your blocks!");
        }
    }

    async executeNodeList(nodes, maxSteps) {
        for (const node of nodes) {
            if (this.runCanceled) return { stopped: true };
            if (this.mazeRenderer.hasReachedPig()) return { reachedPig: true };

            this.executionStepCount++;
            if (this.executionStepCount > maxSteps) {
                return { crashed: false, timeout: true };
            }

            const res = await this.executeSingleNode(node, maxSteps);
            if (res.crashed || res.reachedPig || res.stopped || res.timeout) {
                return res;
            }
        }
        return { completedList: true };
    }

    async executeSingleNode(node, maxSteps) {
        this.workspace.highlightBlock(node.id);

        switch (node.type) {
            case "move_forward": {
                const res = await this.mazeRenderer.moveForward();
                if (!res.success) return { crashed: true, reason: res.reason };
                if (res.reachedPig) return { reachedPig: true };
                return { ok: true };
            }

            case "turn_left": {
                await this.mazeRenderer.turnLeft();
                return { ok: true };
            }

            case "turn_right": {
                await this.mazeRenderer.turnRight();
                return { ok: true };
            }

            case "repeat_times": {
                const count = node.params.times || 5;
                for (let i = 0; i < count; i++) {
                    if (this.runCanceled) return { stopped: true };
                    if (this.mazeRenderer.hasReachedPig()) return { reachedPig: true };

                    this.workspace.highlightBlock(node.id);
                    await new Promise(r => setTimeout(r, 80));

                    const subRes = await this.executeNodeList(node.body || [], maxSteps);
                    if (subRes.crashed || subRes.reachedPig || subRes.stopped || subRes.timeout) {
                        return subRes;
                    }
                }
                return { ok: true };
            }

            case "repeat_until": {
                let iterations = 0;
                while (!this.mazeRenderer.hasReachedPig() && iterations < 80) {
                    if (this.runCanceled) return { stopped: true };
                    iterations++;

                    this.workspace.highlightBlock(node.id);
                    await new Promise(r => setTimeout(r, 80));

                    const subRes = await this.executeNodeList(node.body || [], maxSteps);
                    if (subRes.crashed || subRes.reachedPig || subRes.stopped || subRes.timeout) {
                        return subRes;
                    }
                }
                return { ok: true, reachedPig: this.mazeRenderer.hasReachedPig() };
            }

            case "if_path": {
                const cond = node.params.condition || "ahead";
                let conditionMet = false;

                if (cond === "ahead") conditionMet = this.mazeRenderer.hasPathAhead();
                else if (cond === "left") conditionMet = this.mazeRenderer.hasPathLeft();
                else if (cond === "right") conditionMet = this.mazeRenderer.hasPathRight();

                await new Promise(r => setTimeout(r, 120));

                if (conditionMet && node.body) {
                    const subRes = await this.executeNodeList(node.body, maxSteps);
                    if (subRes.crashed || subRes.reachedPig || subRes.stopped || subRes.timeout) {
                        return subRes;
                    }
                }
                return { ok: true };
            }

            case "if_else": {
                const cond = node.params.condition || "ahead";
                let conditionMet = false;

                if (cond === "ahead") conditionMet = this.mazeRenderer.hasPathAhead();
                else if (cond === "left") conditionMet = this.mazeRenderer.hasPathLeft();
                else if (cond === "right") conditionMet = this.mazeRenderer.hasPathRight();

                await new Promise(r => setTimeout(r, 120));

                if (conditionMet && node.body) {
                    const subRes = await this.executeNodeList(node.body, maxSteps);
                    if (subRes.crashed || subRes.reachedPig || subRes.stopped || subRes.timeout) {
                        return subRes;
                    }
                } else if (!conditionMet && node.elseBody) {
                    const subRes = await this.executeNodeList(node.elseBody, maxSteps);
                    if (subRes.crashed || subRes.reachedPig || subRes.stopped || subRes.timeout) {
                        return subRes;
                    }
                }
                return { ok: true };
            }

            default:
                return { ok: true };
        }
    }

    resetRun() {
        this.runCanceled = true;
        this.mazeRenderer.reset();
        this.workspace.highlightBlock(null);
        this.setRunState(false);
    }

    handleTimerPause() {
        if (this.isRunning) {
            this.resetRun();
        }
    }

    handleTimerResume() {
        // Ready for user to continue coding
    }

    showWinModal() {
        const modal = document.getElementById("win-modal");
        const linesCode = document.getElementById("win-code-lines");
        const jsPreview = document.getElementById("win-js-preview");

        const jsCode = this.workspace.getJavaScriptCode();
        const lineCount = this.workspace.getAllBlocksFlat().length;

        if (linesCode) linesCode.textContent = `${lineCount} blocks used`;
        if (jsPreview) jsPreview.textContent = jsCode;

        if (modal) modal.classList.add("modal-active");
    }

    showFeedbackModal(title, msg) {
        const modal = document.getElementById("feedback-modal");
        const titleEl = document.getElementById("feedback-title");
        const msgEl = document.getElementById("feedback-msg");

        if (titleEl) titleEl.textContent = title;
        if (msgEl) msgEl.textContent = msg;

        if (modal) {
            modal.classList.add("modal-active");
            const tryAgainBtn = document.getElementById("btn-feedback-retry");
            if (tryAgainBtn) {
                tryAgainBtn.onclick = () => {
                    modal.classList.remove("modal-active");
                    this.resetRun();
                };
            }
        }
    }

    showCodeModal() {
        const modal = document.getElementById("code-modal");
        const codeEl = document.getElementById("generated-code-display");
        if (codeEl) {
            codeEl.textContent = this.workspace.getJavaScriptCode();
        }
        if (modal) modal.classList.add("modal-active");
    }

    showHintModal() {
        const modal = document.getElementById("hint-modal");
        const textEl = document.getElementById("hint-text-display");
        const currentLevel = window.LEVELS[this.currentLevelIndex];

        if (textEl && currentLevel) {
            textEl.textContent = currentLevel.hint || "Try breaking the puzzle into smaller steps!";
        }
        if (modal) modal.classList.add("modal-active");
    }

    speakInstructions() {
        const text = window.LEVELS[this.currentLevelIndex]?.instruction;
        if (!text || !window.speechSynthesis) return;

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
    }
}

window.addEventListener("DOMContentLoaded", () => {
    window.app = new HourOfCodeApp();
});
