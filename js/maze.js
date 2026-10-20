// maze.js - 8x8 Grid Canvas & SVG Rendering Engine

class MazeRenderer {
    constructor(canvasContainerId) {
        this.container = document.getElementById(canvasContainerId);
        this.gridSize = 8;
        this.cellSize = 48; // dynamically resized in init
        this.birdPos = { x: 0, y: 0 };
        this.birdDir = "E"; // N, E, S, W
        this.currentLevel = null;
        this.isAnimating = false;
        this.elements = {};
    }

    init(level) {
        this.currentLevel = level;
        this.birdPos = { ...level.startPos };
        this.birdDir = level.startDir;
        this.isAnimating = false;
        this.renderBoard();
    }

    renderBoard() {
        if (!this.container) return;
        this.container.innerHTML = "";

        const board = document.createElement("div");
        board.className = "maze-board";
        board.style.position = "relative";
        board.style.width = "100%";
        board.style.aspectRatio = "1 / 1";
        board.style.maxWidth = "400px";
        board.style.maxHeight = "400px";
        board.style.margin = "0 auto";
        board.style.display = "grid";
        board.style.gridTemplateColumns = "repeat(8, 1fr)";
        board.style.gridTemplateRows = "repeat(8, 1fr)";
        board.style.boxShadow = "0 8px 24px rgba(0,0,0,0.3)";
        board.style.borderRadius = "8px";
        board.style.overflow = "hidden";
        board.style.backgroundColor = "#5c9e31";

        const grid = this.currentLevel.grid;

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const cellType = grid[r][c];
                const cell = document.createElement("div");
                cell.className = `maze-cell cell-type-${cellType}`;
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.innerHTML = this.getTileSvg(cellType, c, r);
                board.appendChild(cell);
            }
        }

        // Target (Pig)
        const pigElem = document.createElement("div");
        pigElem.className = "maze-entity entity-pig";
        pigElem.id = "maze-pig";
        pigElem.style.position = "absolute";
        pigElem.style.width = "12.5%";
        pigElem.style.height = "12.5%";
        pigElem.style.left = `${this.currentLevel.targetPos.x * 12.5}%`;
        pigElem.style.top = `${this.currentLevel.targetPos.y * 12.5}%`;
        pigElem.style.zIndex = "5";
        pigElem.style.transition = "all 0.3s ease";
        pigElem.innerHTML = this.getPigSvg();
        board.appendChild(pigElem);
        this.elements.pig = pigElem;

        // Character (Bird)
        const birdElem = document.createElement("div");
        birdElem.className = "maze-entity entity-bird";
        birdElem.id = "maze-bird";
        birdElem.style.position = "absolute";
        birdElem.style.width = "12.5%";
        birdElem.style.height = "12.5%";
        birdElem.style.left = `${this.birdPos.x * 12.5}%`;
        birdElem.style.top = `${this.birdPos.y * 12.5}%`;
        birdElem.style.zIndex = "10";
        birdElem.style.transition = "left 0.32s cubic-bezier(0.2, 0.8, 0.2, 1), top 0.32s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.28s ease";
        birdElem.innerHTML = this.getBirdSvg();
        board.appendChild(birdElem);
        this.elements.bird = birdElem;

        // FX Overlay
        const fxOverlay = document.createElement("div");
        fxOverlay.id = "maze-fx";
        fxOverlay.style.position = "absolute";
        fxOverlay.style.inset = "0";
        fxOverlay.style.pointerEvents = "none";
        fxOverlay.style.zIndex = "20";
        board.appendChild(fxOverlay);
        this.elements.fx = fxOverlay;

        this.container.appendChild(board);
        this.updateBirdVisual(false);
    }

    getTileSvg(type, col, row) {
        // 0: stone wall, 1: grass, 2: wood crate, 3: path, 4: TNT
        switch (type) {
            case 0: // Stone border
                return `
                    <svg viewBox="0 0 50 50" class="tile-svg">
                        <rect width="50" height="50" fill="#757575"/>
                        <rect x="2" y="2" width="46" height="46" fill="#9e9e9e" rx="4"/>
                        <rect x="6" y="6" width="38" height="38" fill="#8d8d8d" rx="2"/>
                        <path d="M 12 12 L 38 12 L 38 38 L 12 38 Z" stroke="#616161" stroke-width="2" fill="none"/>
                    </svg>
                `;
            case 1: // Grass
                return `
                    <svg viewBox="0 0 50 50" class="tile-svg">
                        <rect width="50" height="50" fill="#4d8c24"/>
                        <circle cx="15" cy="18" r="8" fill="#5aa12a" opacity="0.6"/>
                        <circle cx="35" cy="32" r="10" fill="#5aa12a" opacity="0.5"/>
                        <path d="M 22 25 L 26 15 L 30 25 Z" fill="#66b530"/>
                    </svg>
                `;
            case 2: // Wood Crate
                return `
                    <svg viewBox="0 0 50 50" class="tile-svg">
                        <rect width="50" height="50" fill="#8d5b2d"/>
                        <rect x="3" y="3" width="44" height="44" fill="#a6713e" rx="3"/>
                        <line x1="5" y1="5" x2="45" y2="45" stroke="#75471d" stroke-width="4"/>
                        <line x1="45" y1="5" x2="5" y2="45" stroke="#75471d" stroke-width="4"/>
                        <rect x="3" y="3" width="44" height="44" fill="none" stroke="#683d16" stroke-width="3"/>
                        <circle cx="7" cy="7" r="2" fill="#3e240e"/>
                        <circle cx="43" cy="7" r="2" fill="#3e240e"/>
                        <circle cx="7" cy="43" r="2" fill="#3e240e"/>
                        <circle cx="43" cy="43" r="2" fill="#3e240e"/>
                    </svg>
                `;
            case 3: // Dirt Path (Walkable)
                return `
                    <svg viewBox="0 0 50 50" class="tile-svg">
                        <rect width="50" height="50" fill="#d9ad73"/>
                        <rect x="2" y="2" width="46" height="46" fill="#e5be85" rx="2"/>
                        <circle cx="14" cy="16" r="3" fill="#cba068" opacity="0.7"/>
                        <circle cx="36" cy="34" r="4" fill="#cba068" opacity="0.7"/>
                        <circle cx="28" cy="20" r="2" fill="#cba068" opacity="0.6"/>
                    </svg>
                `;
            case 4: // TNT Box
                return `
                    <svg viewBox="0 0 50 50" class="tile-svg">
                        <rect width="50" height="50" fill="#b71c1c"/>
                        <rect x="3" y="3" width="44" height="44" fill="#d32f2f" rx="3"/>
                        <rect x="6" y="16" width="38" height="18" fill="#fff" opacity="0.9"/>
                        <text x="25" y="30" font-family="Arial, sans-serif" font-weight="900" font-size="12" fill="#d32f2f" text-anchor="middle">TNT</text>
                        <!-- Fuse -->
                        <path d="M 25 3 Q 28 -4 35 2" stroke="#424242" stroke-width="2.5" fill="none"/>
                        <circle cx="35" cy="2" r="3" fill="#ffeb3b"/>
                        <circle cx="35" cy="2" r="1.5" fill="#ff5722"/>
                    </svg>
                `;
            default:
                return `<div class="cell-blank"></div>`;
        }
    }

    getBirdSvg() {
        return `
            <svg viewBox="0 0 60 60" class="character-svg bird-svg" style="width: 100%; height: 100%; filter: drop-shadow(0 4px 4px rgba(0,0,0,0.3));">
                <!-- Shadow -->
                <ellipse cx="30" cy="52" rx="18" ry="5" fill="rgba(0,0,0,0.25)"/>
                <!-- Feathers on top -->
                <path d="M 27 12 C 22 2, 12 6, 22 18 Z" fill="#b71c1c"/>
                <path d="M 33 12 C 38 2, 48 6, 38 18 Z" fill="#c62828"/>
                <!-- Body -->
                <circle cx="30" cy="32" r="21" fill="#e53935"/>
                <!-- Belly / Chest -->
                <path d="M 17 38 C 22 47, 38 47, 43 38 C 39 49, 21 49, 17 38 Z" fill="#d7ccc8"/>
                <!-- Tail feathers (at back) -->
                <rect x="7" y="30" width="6" height="4" fill="#212121" rx="1"/>
                <!-- Brows -->
                <path d="M 25 24 L 38 29 L 36 32 L 24 27 Z" fill="#212121"/>
                <path d="M 38 29 L 51 24 L 52 27 L 40 32 Z" fill="#212121"/>
                <!-- Eyes -->
                <circle cx="32" cy="30" r="5" fill="#ffffff"/>
                <circle cx="44" cy="30" r="5" fill="#ffffff"/>
                <circle cx="34" cy="30" r="2.2" fill="#212121"/>
                <circle cx="46" cy="30" r="2.2" fill="#212121"/>
                <circle cx="35" cy="29" r="0.8" fill="#ffffff"/>
                <circle cx="47" cy="29" r="0.8" fill="#ffffff"/>
                <!-- Beak -->
                <path d="M 38 32 L 54 36 L 38 41 Z" fill="#fbc02d" stroke="#f57f17" stroke-width="1"/>
            </svg>
        `;
    }

    getPigSvg() {
        return `
            <svg viewBox="0 0 60 60" class="character-svg pig-svg" style="width: 100%; height: 100%; filter: drop-shadow(0 4px 4px rgba(0,0,0,0.3));">
                <!-- Shadow -->
                <ellipse cx="30" cy="52" rx="18" ry="5" fill="rgba(0,0,0,0.25)"/>
                <!-- Ears -->
                <circle cx="16" cy="16" r="6" fill="#7cb342"/>
                <circle cx="16" cy="16" r="3.5" fill="#558b2f"/>
                <circle cx="44" cy="16" r="6" fill="#7cb342"/>
                <circle cx="44" cy="16" r="3.5" fill="#558b2f"/>
                <!-- Body -->
                <circle cx="30" cy="32" r="20" fill="#8bc34a"/>
                <!-- Eyes -->
                <circle cx="21" cy="28" r="6" fill="#ffffff"/>
                <circle cx="39" cy="28" r="6" fill="#ffffff"/>
                <circle cx="23" cy="28" r="2.5" fill="#212121"/>
                <circle cx="37" cy="28" r="2.5" fill="#212121"/>
                <circle cx="24" cy="27" r="0.9" fill="#ffffff"/>
                <circle cx="38" cy="27" r="0.9" fill="#ffffff"/>
                <!-- Eyebrows -->
                <path d="M 16 20 Q 22 22 27 20" stroke="#33691e" stroke-width="2.5" stroke-linecap="round" fill="none"/>
                <path d="M 33 20 Q 38 22 44 20" stroke="#33691e" stroke-width="2.5" stroke-linecap="round" fill="none"/>
                <!-- Snout -->
                <ellipse cx="30" cy="38" rx="11" ry="8" fill="#9ccc65" stroke="#689f38" stroke-width="1.5"/>
                <!-- Nostrils -->
                <circle cx="26" cy="38" r="2.2" fill="#33691e"/>
                <circle cx="34" cy="38" r="2.2" fill="#33691e"/>
            </svg>
        `;
    }

    getRotationDeg(dir) {
        switch (dir) {
            case "N": return -90;
            case "E": return 0;
            case "S": return 90;
            case "W": return 180;
            default: return 0;
        }
    }

    updateBirdVisual(animate = true) {
        if (!this.elements.bird) return;
        this.elements.bird.style.left = `${this.birdPos.x * 12.5}%`;
        this.elements.bird.style.top = `${this.birdPos.y * 12.5}%`;
        
        const deg = this.getRotationDeg(this.birdDir);
        this.elements.bird.style.transform = `rotate(${deg}deg)`;
    }

    reset() {
        if (!this.currentLevel) return;
        this.birdPos = { ...this.currentLevel.startPos };
        this.birdDir = this.currentLevel.startDir;
        this.isAnimating = false;
        this.updateBirdVisual(false);

        // Reset pig visibility
        if (this.elements.pig) {
            this.elements.pig.style.transform = "scale(1)";
            this.elements.pig.style.opacity = "1";
        }
    }

    // Step Forward
    async moveForward() {
        const deltas = {
            N: { x: 0, y: -1 },
            E: { x: 1, y: 0 },
            S: { x: 0, y: 1 },
            W: { x: -1, y: 0 }
        };

        const delta = deltas[this.birdDir];
        const nextX = this.birdPos.x + delta.x;
        const nextY = this.birdPos.y + delta.y;

        // Check bounds
        if (nextX < 0 || nextX >= 8 || nextY < 0 || nextY >= 8) {
            await this.animateBonk();
            return { success: false, reason: "wall" };
        }

        const tileType = this.currentLevel.grid[nextY][nextX];

        // If tile is Wall/Border/Crate (0, 1, 2)
        if (tileType === 0 || tileType === 1 || tileType === 2) {
            await this.animateBonk();
            return { success: false, reason: "wall" };
        }

        // If TNT (4)
        if (tileType === 4) {
            this.birdPos.x = nextX;
            this.birdPos.y = nextY;
            this.updateBirdVisual(true);
            await this.animateTntExplosion();
            return { success: false, reason: "tnt" };
        }

        // Valid step (path or target)
        this.birdPos.x = nextX;
        this.birdPos.y = nextY;
        window.soundFX?.playStep();
        this.updateBirdVisual(true);

        // Hop animation
        if (this.elements.bird) {
            this.elements.bird.classList.add("bird-hopping");
            setTimeout(() => this.elements.bird.classList.remove("bird-hopping"), 250);
        }

        await new Promise(r => setTimeout(r, 380));

        // Check if reached pig
        if (this.birdPos.x === this.currentLevel.targetPos.x && this.birdPos.y === this.currentLevel.targetPos.y) {
            await this.animateWin();
            return { success: true, reachedPig: true };
        }

        return { success: true, reachedPig: false };
    }

    // Turn Left (counter-clockwise)
    async turnLeft() {
        const turns = { N: "W", W: "S", S: "E", E: "N" };
        this.birdDir = turns[this.birdDir];
        window.soundFX?.playTurn();
        this.updateBirdVisual(true);
        await new Promise(r => setTimeout(r, 320));
        return { success: true };
    }

    // Turn Right (clockwise)
    async turnRight() {
        const turns = { N: "E", E: "S", S: "W", W: "N" };
        this.birdDir = turns[this.birdDir];
        window.soundFX?.playTurn();
        this.updateBirdVisual(true);
        await new Promise(r => setTimeout(r, 320));
        return { success: true };
    }

    // Wall bonk animation
    async animateBonk() {
        window.soundFX?.playHitWall();
        if (this.elements.bird) {
            this.elements.bird.classList.add("bird-bonk");
            setTimeout(() => this.elements.bird.classList.remove("bird-bonk"), 400);
        }
        await new Promise(r => setTimeout(r, 450));
    }

    // TNT explosion
    async animateTntExplosion() {
        window.soundFX?.playHitWall();
        if (this.elements.fx) {
            this.elements.fx.innerHTML = `
                <div class="explosion-flash"></div>
                <div class="explosion-text">💥 BOOM!</div>
            `;
            setTimeout(() => {
                if (this.elements.fx) this.elements.fx.innerHTML = "";
            }, 700);
        }
        await new Promise(r => setTimeout(r, 700));
    }

    // Reached Pig Celebration
    async animateWin() {
        window.soundFX?.playWin();
        if (this.elements.pig) {
            this.elements.pig.style.transform = "scale(1.4) rotate(20deg)";
            setTimeout(() => {
                this.elements.pig.style.transform = "scale(0) rotate(180deg)";
                this.elements.pig.style.opacity = "0";
            }, 250);
        }

        if (this.elements.bird) {
            this.elements.bird.classList.add("bird-dance");
        }

        this.spawnConfetti();
        await new Promise(r => setTimeout(r, 800));
    }

    // Condition Checkers for If / Then Blocks
    getRelativeCoords(offsetDir) {
        // offsetDir: 'ahead', 'left', 'right', 'back'
        const dirOrder = ["N", "E", "S", "W"];
        let dirIdx = dirOrder.indexOf(this.birdDir);

        if (offsetDir === "left") dirIdx = (dirIdx + 3) % 4;
        else if (offsetDir === "right") dirIdx = (dirIdx + 1) % 4;
        else if (offsetDir === "back") dirIdx = (dirIdx + 2) % 4;

        const targetDir = dirOrder[dirIdx];
        const deltas = {
            N: { x: 0, y: -1 },
            E: { x: 1, y: 0 },
            S: { x: 0, y: 1 },
            W: { x: -1, y: 0 }
        };

        const delta = deltas[targetDir];
        return {
            x: this.birdPos.x + delta.x,
            y: this.birdPos.y + delta.y
        };
    }

    isWalkable(x, y) {
        if (x < 0 || x >= 8 || y < 0 || y >= 8) return false;
        const tileType = this.currentLevel.grid[y][x];
        // 3: path, or target pig pos
        if (tileType === 3) return true;
        if (x === this.currentLevel.targetPos.x && y === this.currentLevel.targetPos.y) return true;
        return false;
    }

    hasPathAhead() {
        const coords = this.getRelativeCoords("ahead");
        return this.isWalkable(coords.x, coords.y);
    }

    hasPathLeft() {
        const coords = this.getRelativeCoords("left");
        return this.isWalkable(coords.x, coords.y);
    }

    hasPathRight() {
        const coords = this.getRelativeCoords("right");
        return this.isWalkable(coords.x, coords.y);
    }

    hasReachedPig() {
        return this.birdPos.x === this.currentLevel.targetPos.x && this.birdPos.y === this.currentLevel.targetPos.y;
    }

    spawnConfetti() {
        if (!this.elements.fx) return;
        const colors = ["#ff5722", "#ffeb3b", "#4caf50", "#2196f3", "#9c27b0"];
        for (let i = 0; i < 25; i++) {
            const particle = document.createElement("div");
            particle.className = "confetti-particle";
            particle.style.left = `${this.birdPos.x * 12.5 + 6 + (Math.random() * 10 - 5)}%`;
            particle.style.top = `${this.birdPos.y * 12.5 + 6 + (Math.random() * 10 - 5)}%`;
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.setProperty("--vx", `${(Math.random() - 0.5) * 120}px`);
            particle.style.setProperty("--vy", `${-Math.random() * 100 - 30}px`);
            this.elements.fx.appendChild(particle);
            setTimeout(() => particle.remove(), 1000);
        }
    }
}

if (typeof window !== "undefined") {
    window.MazeRenderer = MazeRenderer;
}
