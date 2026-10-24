// blocks.js - Visual Drag-and-Drop Block Engine with Interlocking Stacks & C-Blocks

class BlockWorkspace {
    constructor(toolboxId, workspaceId, blockCountId) {
        this.toolboxEl = document.getElementById(toolboxId);
        this.workspaceEl = document.getElementById(workspaceId);
        this.blockCountEl = document.getElementById(blockCountId);
        this.trashZoneEl = this.workspaceEl ? (this.workspaceEl.querySelector(".trash-zone") || document.getElementById("workspace-trash")) : null;
        this.blockIdCounter = 1;
        this.activeDrag = null;
        this.dropIndicator = null;
        this.maxBlocks = 3;
        this.onWorkspaceChange = null;
        this.userHasDropped = false;

        this.init();
    }

    init() {
        this.setupDropIndicator();
        this.setupGlobalDragEvents();
        if (!this.trashZoneEl && this.workspaceEl) {
            this.trashZoneEl = this.workspaceEl.querySelector(".trash-zone") || document.getElementById("workspace-trash");
        }
    }

    setupDropIndicator() {
        this.dropIndicator = document.createElement("div");
        this.dropIndicator.className = "block-snap-indicator";
        this.dropIndicator.style.display = "none";
        this.workspaceEl.appendChild(this.dropIndicator);
    }

    loadLevel(level) {
        this.userHasDropped = false;
        this.maxBlocks = level.maxBlocks;
        this.clear();
        this.renderToolbox(level.availableBlocks);
        this.loadInitialBlocks(level.initialWorkspace);
        this.updateBlockCount();
    }

    clear() {
        this.userHasDropped = false;
        this.workspaceEl.querySelectorAll(".block-stack").forEach(el => el.remove());
        this.updateBlockCount();
    }

    loadInitialBlocks(initialWorkspace) {
        const rootStack = document.createElement("div");
        rootStack.className = "block-stack block-stack-root";
        rootStack.style.left = "30px";
        rootStack.style.top = "30px";
        this.workspaceEl.appendChild(rootStack);

        if (!initialWorkspace || initialWorkspace.length === 0) {
            const root = this.createBlock("when_run");
            rootStack.appendChild(root.element);
        } else {
            const whenRunSpec = initialWorkspace.find(b => b.type === "when_run") || { type: "when_run", children: [] };
            const rootBlock = this.createBlock("when_run");
            rootStack.appendChild(rootBlock.element);

            if (whenRunSpec.children && whenRunSpec.children.length > 0) {
                whenRunSpec.children.forEach(childSpec => {
                    const child = this.createBlockHierarchy(childSpec);
                    rootStack.appendChild(child.element);
                });
            }
        }

        this.updateBlockCount();
    }

    createBlockHierarchy(spec) {
        const block = this.createBlock(spec.type, spec.params || {});

        // Attached inner body (inside C-blocks)
        if (spec.body && spec.body.length > 0) {
            const slot = block.element.querySelector(".block-c-slot-body");
            if (slot) {
                spec.body.forEach(childSpec => {
                    const child = this.createBlockHierarchy(childSpec);
                    slot.appendChild(child.element);
                });
            }
        }

        // Attached else body
        if (spec.elseBody && spec.elseBody.length > 0) {
            const slot = block.element.querySelector(".block-c-slot-else");
            if (slot) {
                spec.elseBody.forEach(childSpec => {
                    const child = this.createBlockHierarchy(childSpec);
                    slot.appendChild(child.element);
                });
            }
        }

        return block;
    }

    renderToolbox(blockTypes = ["move_forward", "turn_left", "turn_right"]) {
        if (!this.toolboxEl) return;
        this.toolboxEl.innerHTML = "";

        const availableSet = new Set(blockTypes);
        // Ensure core movement blocks are available
        availableSet.add("move_forward");
        availableSet.add("turn");

        const categories = [
            {
                id: "movement",
                title: "● MOVEMENT BLOCKS",
                colorClass: "cat-movement",
                blocks: ["move_forward", "turn"]
            },
            {
                id: "logic",
                title: "● LOOPS & LOGIC",
                colorClass: "cat-logic",
                blocks: ["repeat_times", "repeat_until", "if_path", "if_else"]
            }
        ];

        categories.forEach(cat => {
            const matching = cat.blocks.filter(b => availableSet.has(b));
            if (matching.length === 0) return;

            const sectionEl = document.createElement("div");
            sectionEl.className = `toolbox-category-section ${cat.colorClass}`;

            const headerEl = document.createElement("div");
            headerEl.className = "toolbox-category-header";
            headerEl.textContent = cat.title;
            sectionEl.appendChild(headerEl);

            const listEl = document.createElement("div");
            listEl.className = "toolbox-category-list";

            matching.forEach(type => {
                const proto = this.createToolboxBlockElement(type);
                listEl.appendChild(proto);
            });

            sectionEl.appendChild(listEl);
            this.toolboxEl.appendChild(sectionEl);
        });
    }

    createToolboxBlockElement(type) {
        const item = document.createElement("div");
        item.className = `block-prototype block-proto-${type}`;
        item.dataset.blockType = type;
        item.innerHTML = this.getBlockHtml(type, this.getDefaultParams(type));

        item.addEventListener("mousedown", (e) => this.startDraggingFromToolbox(e, type));
        item.addEventListener("touchstart", (e) => this.startDraggingFromToolbox(e, type), { passive: false });

        return item;
    }

    getDefaultParams(type) {
        if (type === "repeat_times") return { times: 5 };
        if (type === "if_path" || type === "if_else") return { condition: "ahead" };
        if (type === "turn") return { direction: "left" };
        if (type === "turn_left") return { direction: "left" };
        if (type === "turn_right") return { direction: "right" };
        return {};
    }

    getBlockHtml(type, params = {}) {
        switch (type) {
            case "when_run":
                return `
                    <div class="block-shape block-when-run">
                        <div class="block-content">
                            <span class="block-icon">▶</span>
                            <span class="block-label">when run</span>
                        </div>
                        <div class="block-notch-bottom"></div>
                    </div>
                `;

            case "move_forward":
                return `
                    <div class="block-shape block-action block-blue">
                        <div class="block-notch-top"></div>
                        <div class="block-content">
                            <span class="block-icon">➔</span>
                            <span class="block-label">move forward</span>
                            <span class="block-tag-tile">[ 1 tile ]</span>
                        </div>
                        <div class="block-notch-bottom"></div>
                    </div>
                `;

            case "turn_left":
                return `
                    <div class="block-shape block-action block-blue">
                        <div class="block-notch-top"></div>
                        <div class="block-content">
                            <span class="block-icon">↺</span>
                            <span class="block-label">turn left 90°</span>
                        </div>
                        <div class="block-notch-bottom"></div>
                    </div>
                `;

            case "turn_right":
                return `
                    <div class="block-shape block-action block-blue">
                        <div class="block-notch-top"></div>
                        <div class="block-content">
                            <span class="block-icon">↻</span>
                            <span class="block-label">turn right 90°</span>
                        </div>
                        <div class="block-notch-bottom"></div>
                    </div>
                `;

            case "turn":
                const direction = params.direction || "left";
                return `
                    <div class="block-shape block-action block-blue">
                        <div class="block-notch-top"></div>
                        <div class="block-content">
                            <span class="block-icon">↺</span>
                            <span class="block-label">turn</span>
                            <span class="block-select-wrap">
                                <select class="block-select block-param-turn" aria-label="Turn direction" onclick="event.stopPropagation()">
                                    <option value="left" ${direction === "left" ? "selected" : ""}>left ↺</option>
                                    <option value="right" ${direction === "right" ? "selected" : ""}>right ↻</option>
                                </select>
                            </span>
                        </div>
                        <div class="block-notch-bottom"></div>
                    </div>
                `;

            case "jump":
                return `
                    <div class="block-shape block-action block-blue">
                        <div class="block-notch-top"></div>
                        <div class="block-content">
                            <span class="block-icon">⤴</span>
                            <span class="block-label">jump obstacle</span>
                            <span class="block-tag-pro">[ PRO ]</span>
                        </div>
                        <div class="block-notch-bottom"></div>
                    </div>
                `;

            case "slingshot_launch":
                return `
                    <div class="block-shape block-action block-combat">
                        <div class="block-notch-top"></div>
                        <div class="block-content">
                            <span class="block-icon">🏹</span>
                            <span class="block-label">slingshot launch!</span>
                        </div>
                        <div class="block-notch-bottom"></div>
                    </div>
                `;

            case "smash_pig":
                return `
                    <div class="block-shape block-action block-combat">
                        <div class="block-notch-top"></div>
                        <div class="block-content">
                            <span class="block-icon">💥</span>
                            <span class="block-label">smash & pop pig</span>
                        </div>
                        <div class="block-notch-bottom"></div>
                    </div>
                `;

            case "repeat_times":
                return `
                    <div class="block-shape block-c-container block-c-loop">
                        <div class="block-c-header">
                            <div class="block-notch-top"></div>
                            <span class="block-icon">🔁</span>
                            <span>repeat</span>
                            <select class="block-select block-param-times" onclick="event.stopPropagation()">
                                ${[2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `
                                    <option value="${n}" ${n === (params.times || 5) ? "selected" : ""}>${n}</option>
                                `).join("")}
                            </select>
                            <span>times do ⤵</span>
                            <div class="block-notch-inner-top"></div>
                        </div>
                        <div class="block-c-body-arm">
                            <div class="block-c-left-bar"></div>
                            <div class="block-c-slot block-c-slot-body" data-slot-type="body"></div>
                        </div>
                        <div class="block-c-footer">
                            <div class="block-notch-bottom"></div>
                        </div>
                    </div>
                `;

            case "repeat_until":
                return `
                    <div class="block-shape block-c-container block-c-loop">
                        <div class="block-c-header">
                            <div class="block-notch-top"></div>
                            <span class="block-icon">🔁</span>
                            <span>repeat until</span>
                            <span class="block-badge-pig">🐷</span>
                            <span>do ⤵</span>
                            <div class="block-notch-inner-top"></div>
                        </div>
                        <div class="block-c-body-arm">
                            <div class="block-c-left-bar"></div>
                            <div class="block-c-slot block-c-slot-body" data-slot-type="body"></div>
                        </div>
                        <div class="block-c-footer">
                            <div class="block-notch-bottom"></div>
                        </div>
                    </div>
                `;

            case "if_path":
                return `
                    <div class="block-shape block-c-container block-c-condition">
                        <div class="block-c-header">
                            <div class="block-notch-top"></div>
                            <span class="block-icon">❓</span>
                            <span>if path</span>
                            <select class="block-select block-param-condition" onclick="event.stopPropagation()">
                                <option value="ahead" ${params.condition === "ahead" ? "selected" : ""}>ahead ▾</option>
                                <option value="left" ${params.condition === "left" ? "selected" : ""}>to the left ↺</option>
                                <option value="right" ${params.condition === "right" ? "selected" : ""}>to the right ↻</option>
                            </select>
                            <span>do ⤵</span>
                            <div class="block-notch-inner-top"></div>
                        </div>
                        <div class="block-c-body-arm">
                            <div class="block-c-left-bar"></div>
                            <div class="block-c-slot block-c-slot-body" data-slot-type="body"></div>
                        </div>
                        <div class="block-c-footer">
                            <div class="block-notch-bottom"></div>
                        </div>
                    </div>
                `;

            case "if_else":
                return `
                    <div class="block-shape block-c-container block-c-condition">
                        <div class="block-c-header">
                            <div class="block-notch-top"></div>
                            <span class="block-icon">❓</span>
                            <span>if path</span>
                            <select class="block-select block-param-condition" onclick="event.stopPropagation()">
                                <option value="ahead" ${params.condition === "ahead" ? "selected" : ""}>ahead ▾</option>
                                <option value="left" ${params.condition === "left" ? "selected" : ""}>to the left ↺</option>
                                <option value="right" ${params.condition === "right" ? "selected" : ""}>to the right ↻</option>
                            </select>
                            <span>do ⤵</span>
                            <div class="block-notch-inner-top"></div>
                        </div>
                        <div class="block-c-body-arm">
                            <div class="block-c-left-bar"></div>
                            <div class="block-c-slot block-c-slot-body" data-slot-type="body"></div>
                        </div>
                        <div class="block-c-else-header">
                            <span>else ⤵</span>
                        </div>
                        <div class="block-c-body-arm">
                            <div class="block-c-left-bar"></div>
                            <div class="block-c-slot block-c-slot-else" data-slot-type="elseBody"></div>
                        </div>
                        <div class="block-c-footer">
                            <div class="block-notch-bottom"></div>
                        </div>
                    </div>
                `;

            default:
                return `<div class="block-shape">${type}</div>`;
        }
    }

    createBlock(type, initialParams = {}) {
        const id = `block_${this.blockIdCounter++}`;
        const el = document.createElement("div");
        el.className = `block-node block-node-${type}`;
        el.id = id;
        el.dataset.id = id;
        el.dataset.type = type;

        const params = { ...this.getDefaultParams(type), ...initialParams };
        el.innerHTML = this.getBlockHtml(type, params);

        // Bind dropdown change listeners
        const selectTimes = el.querySelector(".block-param-times");
        if (selectTimes) {
            selectTimes.addEventListener("change", (e) => {
                params.times = parseInt(e.target.value, 10);
            });
        }

        const selectCond = el.querySelector(".block-param-condition");
        if (selectCond) {
            selectCond.addEventListener("change", (e) => {
                params.condition = e.target.value;
            });
        }

        const selectTurn = el.querySelector(".block-param-turn");
        if (selectTurn) {
            selectTurn.addEventListener("change", (e) => {
                params.direction = e.target.value;
            });
        }

        el.addEventListener("mousedown", (e) => {
            if (e.target.tagName === "SELECT") return;
            this.startDraggingExistingBlock(e, el);
        });

        el.addEventListener("touchstart", (e) => {
            if (e.target.tagName === "SELECT") return;
            this.startDraggingExistingBlock(e, el);
        }, { passive: false });

        return { id, type, params, element: el };
    }

    startDraggingFromToolbox(e, type) {
        if (e.target.tagName === "SELECT") return;
        if (e.type === "touchstart") e.preventDefault();
        window.soundFX?.playClick();

        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);

        const newStack = document.createElement("div");
        newStack.className = "block-stack block-stack-dragging";
        newStack.style.position = "fixed";
        newStack.style.zIndex = "99999";
        document.body.appendChild(newStack);

        const direction = e.currentTarget.querySelector(".block-param-turn")?.value;
        const newBlock = this.createBlock(type, direction ? { direction } : {});
        newStack.appendChild(newBlock.element);

        const wsRect = this.workspaceEl.getBoundingClientRect();
        const offsetX = 30;
        const offsetY = 16;

        newStack.style.left = `${clientX - offsetX}px`;
        newStack.style.top = `${clientY - offsetY}px`;

        this.workspaceEl.classList.add("workspace-dragging-active");
        if (this.toolboxEl) this.toolboxEl.classList.add("workspace-dragging-active");

        this.activeDrag = {
            stack: newStack,
            isRoot: false,
            isNew: true,
            hasEnteredWorkspace: clientX >= wsRect.left + 20,
            offsetX: offsetX,
            offsetY: offsetY
        };
    }

    startDraggingExistingBlock(e, blockEl) {
        e.stopPropagation();
        if (e.type === "touchstart") e.preventDefault();

        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);

        const bRect = blockEl.getBoundingClientRect();
        const offsetX = clientX - bRect.left;
        const offsetY = clientY - bRect.top;

        window.soundFX?.playClick();

        // If dragging when_run: drag the entire root stack
        if (blockEl.dataset.type === "when_run") {
            const rootStack = blockEl.closest(".block-stack");
            rootStack.classList.add("block-stack-dragging");
            this.activeDrag = {
                stack: rootStack,
                isRoot: true,
                isNew: false,
                hasEnteredWorkspace: true,
                offsetX: offsetX,
                offsetY: offsetY
            };
            return;
        }

        // If dragging any child block: detach it and any subsequent siblings into a new stack!
        const newStack = document.createElement("div");
        newStack.className = "block-stack block-stack-dragging";
        newStack.style.position = "fixed";
        newStack.style.zIndex = "99999";
        newStack.style.left = `${bRect.left}px`;
        newStack.style.top = `${bRect.top}px`;
        document.body.appendChild(newStack);

        this.workspaceEl.classList.add("workspace-dragging-active");
        if (this.toolboxEl) this.toolboxEl.classList.add("workspace-dragging-active");

        // Move blockEl and any following siblings in the same container into newStack
        let curr = blockEl;
        while (curr) {
            const next = curr.nextElementSibling;
            newStack.appendChild(curr);
            curr = next;
        }

        this.activeDrag = {
            stack: newStack,
            isRoot: false,
            isNew: false,
            hasEnteredWorkspace: true,
            offsetX: offsetX,
            offsetY: offsetY
        };
    }

    setupGlobalDragEvents() {
        const onMove = (e) => {
            if (!this.activeDrag) return;
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);

            const wsRect = this.workspaceEl.getBoundingClientRect();
            if (this.activeDrag.isRoot) {
                const posX = clientX - wsRect.left - this.activeDrag.offsetX;
                const posY = clientY - wsRect.top - this.activeDrag.offsetY;
                this.activeDrag.stack.style.left = `${posX}px`;
                this.activeDrag.stack.style.top = `${posY}px`;
            } else {
                this.activeDrag.stack.style.left = `${clientX - this.activeDrag.offsetX}px`;
                this.activeDrag.stack.style.top = `${clientY - this.activeDrag.offsetY}px`;
                if (!this.activeDrag.hasEnteredWorkspace && clientX >= wsRect.left + 20) {
                    this.activeDrag.hasEnteredWorkspace = true;
                }
            }

            // Trash targets: .trash-zone, toolbox, or dragged to left of workspace
            const trEl = this.trashZoneEl || this.workspaceEl.querySelector(".trash-zone") || document.getElementById("workspace-trash");
            const trRect = trEl ? trEl.getBoundingClientRect() : null;
            const isOverTrash = trRect ? (
                clientX >= trRect.left - 25 &&
                clientX <= trRect.right + 25 &&
                clientY >= trRect.top - 25 &&
                clientY <= trRect.bottom + 25
            ) : false;

            const tbRect = this.toolboxEl ? this.toolboxEl.getBoundingClientRect() : null;
            const isOverToolbox = tbRect ? (
                clientX <= tbRect.right + 15 &&
                clientY >= tbRect.top - 20 &&
                clientY <= tbRect.bottom + 20
            ) : false;

            const isLeftOfWorkspace = clientX < wsRect.left + 15;
            const isOutsideTrash = (isOverToolbox || isLeftOfWorkspace) && this.activeDrag.hasEnteredWorkspace;
            const isTrashHover = (isOverTrash || isOutsideTrash) && !this.activeDrag.isRoot;

            if (isTrashHover) {
                if (trEl) trEl.classList.add("trash-active");
                if (this.toolboxEl && isOutsideTrash) {
                    this.toolboxEl.classList.add("toolbox-trash-active");
                } else if (this.toolboxEl) {
                    this.toolboxEl.classList.remove("toolbox-trash-active");
                }
                this.activeDrag.stack.classList.add("drag-over-trash");
                this.dropIndicator.style.display = "none";
                this.currentSnapTarget = null;
            } else {
                if (trEl) trEl.classList.remove("trash-active");
                if (this.toolboxEl) this.toolboxEl.classList.remove("toolbox-trash-active");
                this.activeDrag.stack.classList.remove("drag-over-trash");
                this.checkForSnapTarget(clientX, clientY, this.activeDrag.stack);
            }
        };

        const onEnd = (e) => {
            if (!this.activeDrag) return;

            const clientX = e.clientX || (e.changedTouches && e.changedTouches[0].clientX);
            const clientY = e.clientY || (e.changedTouches && e.changedTouches[0].clientY);

            const stack = this.activeDrag.stack;
            stack.classList.remove("block-stack-dragging");
            stack.classList.remove("drag-over-trash");

            const wsRect = this.workspaceEl.getBoundingClientRect();
            const trEl = this.trashZoneEl || this.workspaceEl.querySelector(".trash-zone") || document.getElementById("workspace-trash");
            const trRect = trEl ? trEl.getBoundingClientRect() : null;
            const isOverTrash = trRect ? (
                clientX >= trRect.left - 25 &&
                clientX <= trRect.right + 25 &&
                clientY >= trRect.top - 25 &&
                clientY <= trRect.bottom + 25
            ) : false;

            const tbRect = this.toolboxEl ? this.toolboxEl.getBoundingClientRect() : null;
            const isOverToolbox = tbRect ? (
                clientX <= tbRect.right + 15 &&
                clientY >= tbRect.top - 20 &&
                clientY <= tbRect.bottom + 20
            ) : false;

            const isLeftOfWorkspace = clientX < wsRect.left + 15;
            const isTrash = (isOverTrash || isOverToolbox || isLeftOfWorkspace) && !this.activeDrag.isRoot;

            if (isTrash) {
                const playTrashSound = this.activeDrag.hasEnteredWorkspace || isOverTrash;
                stack.remove();
                if (playTrashSound) window.soundFX?.playTrash();
                this.finishDrag();
                return;
            }

            // Snap or leave as floating stack
            if (this.currentSnapTarget && !this.activeDrag.isRoot) {
                this.executeSnap(this.currentSnapTarget, stack);
                window.soundFX?.playSnap();
                this.userHasDropped = true;
            } else if (!this.activeDrag.isRoot) {
                stack.style.position = "";
                stack.style.zIndex = "";
                stack.style.left = `${clientX - wsRect.left + this.workspaceEl.scrollLeft - this.activeDrag.offsetX}px`;
                stack.style.top = `${clientY - wsRect.top + this.workspaceEl.scrollTop - this.activeDrag.offsetY}px`;
                this.workspaceEl.appendChild(stack);
                this.userHasDropped = true;
            }

            this.finishDrag();
        };

        this._onMove = onMove;
        this._onEnd = onEnd;

        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onEnd);
        window.addEventListener("touchmove", onMove, { passive: false });
        window.addEventListener("touchend", onEnd);
    }

    destroy() {
        if (this._onMove) {
            window.removeEventListener("mousemove", this._onMove);
            window.removeEventListener("touchmove", this._onMove);
        }
        if (this._onEnd) {
            window.removeEventListener("mouseup", this._onEnd);
            window.removeEventListener("touchend", this._onEnd);
        }
    }

    checkForSnapTarget(cursorX, cursorY, draggedStack) {
        this.currentSnapTarget = null;
        this.dropIndicator.style.display = "none";

        // 'when_run' stack cannot snap into another stack
        if (this.activeDrag?.isRoot) return;

        // Search among all existing block-nodes outside of the dragged stack
        const candidateBlocks = Array.from(this.workspaceEl.querySelectorAll(".block-node"))
            .filter(el => !draggedStack.contains(el));

        let closest = null;
        let minDistance = 45; // snap attraction threshold

        for (const el of candidateBlocks) {
            const rect = el.getBoundingClientRect();

            // 1. Target: Bottom of block (snap underneath)
            const bottomX = rect.left + 32;
            const bottomY = rect.bottom;
            const distBottom = Math.hypot(cursorX - bottomX, cursorY - bottomY);

            if (distBottom < minDistance) {
                minDistance = distBottom;
                closest = {
                    type: "bottom",
                    targetEl: el,
                    rect: { left: rect.left, top: rect.bottom - 5, width: Math.min(rect.width, 160) }
                };
            }

            // 2. Target: Inside C-block mouth slot
            const slots = el.querySelectorAll(".block-c-slot");
            slots.forEach(slot => {
                if (draggedStack.contains(slot)) return;
                const sRect = slot.getBoundingClientRect();
                const slotX = sRect.left + 30;
                const slotY = sRect.top + 16;
                const distSlot = Math.hypot(cursorX - slotX, cursorY - slotY);

                if (distSlot < minDistance) {
                    minDistance = distSlot;
                    closest = {
                        type: "slot",
                        targetEl: el,
                        slotEl: slot,
                        rect: { left: sRect.left + 4, top: sRect.top + 2, width: Math.min(sRect.width - 8, 140) }
                    };
                }
            });
        }

        if (closest) {
            this.currentSnapTarget = closest;
            const wsRect = this.workspaceEl.getBoundingClientRect();
            this.dropIndicator.style.display = "block";
            this.dropIndicator.style.left = `${closest.rect.left - wsRect.left}px`;
            this.dropIndicator.style.top = `${closest.rect.top - wsRect.top}px`;
            this.dropIndicator.style.width = `${closest.rect.width}px`;
        }
    }

    executeSnap(target, draggedStack) {
        // Collect all block nodes inside draggedStack
        const blocksToAttach = Array.from(draggedStack.children).filter(el => el.classList.contains("block-node"));

        if (target.type === "slot") {
            // Append blocks inside the C-block mouth slot
            blocksToAttach.forEach(node => {
                target.slotEl.appendChild(node);
            });
        } else if (target.type === "bottom") {
            // Insert blocks immediately after targetEl inside the same container
            let anchor = target.targetEl;
            blocksToAttach.forEach(node => {
                anchor.after(node);
                anchor = node;
            });
        }

        // Clean up empty dragging stack wrapper
        draggedStack.remove();
        this.updateBlockCount();
    }

    finishDrag() {
        const trEl = this.trashZoneEl || this.workspaceEl?.querySelector(".trash-zone") || document.getElementById("workspace-trash");
        if (trEl) trEl.classList.remove("trash-active");
        if (this.toolboxEl) {
            this.toolboxEl.classList.remove("toolbox-trash-active");
            this.toolboxEl.classList.remove("workspace-dragging-active");
        }
        if (this.workspaceEl) {
            this.workspaceEl.classList.remove("workspace-dragging-active");
        }
        if (this.activeDrag?.stack) {
            this.activeDrag.stack.classList.remove("drag-over-trash");
            this.activeDrag.stack.classList.remove("block-stack-dragging");
        }
        this.activeDrag = null;
        this.currentSnapTarget = null;
        if (this.dropIndicator) this.dropIndicator.style.display = "none";
        this.updateBlockCount();
        if (this.onWorkspaceChange) this.onWorkspaceChange();
    }

    getAllBlocksFlat() {
        return Array.from(this.workspaceEl.querySelectorAll(".block-node"));
    }

    updateBlockCount() {
        const total = this.getAllBlocksFlat().length;
        if (this.blockCountEl) {
            const isOptimal = total <= this.maxBlocks;
            this.blockCountEl.innerHTML = `WORKSPACE: ${total}/${this.maxBlocks} BLOCKS <span style="color: ${isOptimal ? '#facc15' : '#ef4444'}; font-weight: 900; margin-left: 6px;">${isOptimal ? '★ OPTIMAL' : '⚠️ LIMIT EXCEEDED'}</span>`;
        }
        this.updateDropPlaceholder();
    }

    updateDropPlaceholder() {
        if (!this.workspaceEl) return;
        const ph = this.workspaceEl.querySelector(".block-drop-placeholder");
        const rootStack = this.workspaceEl.querySelector(".block-stack-root");

        // When the user drops any block, the placeholder is gone
        if (this.userHasDropped) {
            if (ph) ph.remove();
            return;
        }

        // On first / default: show placeholder at the end of the root stack
        if (!ph) {
            const newPh = document.createElement("div");
            newPh.className = "block-drop-placeholder";
            newPh.innerHTML = "+ Drop next block here 🌿";
            if (rootStack) {
                rootStack.appendChild(newPh);
            }
        } else if (rootStack && ph.parentElement !== rootStack) {
            rootStack.appendChild(ph);
        }
    }

    cleanWorkspace() {
        const rootStack = this.workspaceEl.querySelector(".block-stack-root");
        if (rootStack) {
            rootStack.style.left = "30px";
            rootStack.style.top = "30px";
        }
        this.workspaceEl.querySelectorAll(".block-stack:not(.block-stack-root)").forEach(s => s.remove());
        this.updateBlockCount();
    }

    // =========================================================================
    // Execution AST Tree Generator
    // =========================================================================
    getExecutionTree() {
        const rootStack = this.workspaceEl.querySelector(".block-stack-root");
        if (!rootStack) return [];

        const whenRun = rootStack.querySelector(".block-node-when_run");
        if (!whenRun) return [];

        return this.parseNodeSequence(whenRun.nextElementSibling);
    }

    parseNodeSequence(startEl) {
        const list = [];
        let curr = startEl;

        while (curr && curr.classList.contains("block-node")) {
            const node = this.parseSingleBlock(curr);
            list.push(node);
            curr = curr.nextElementSibling;
        }

        return list;
    }

    parseSingleBlock(el) {
        const type = el.dataset.type;
        const id = el.id;

        const node = {
            id: id,
            type: type,
            element: el,
            params: {}
        };

        if (type === "turn" || type === "turn_left" || type === "turn_right") {
            const select = el.querySelector(".block-param-turn");
            node.type = select?.value === "right" ? "turn_right" : "turn_left";
        } else if (type === "repeat_times") {
            const sel = el.querySelector(".block-param-times");
            node.params.times = sel ? parseInt(sel.value, 10) : 5;
            const slot = el.querySelector(".block-c-slot-body");
            node.body = this.parseNodeSequence(slot ? slot.firstElementChild : null);
        } else if (type === "repeat_until") {
            const slot = el.querySelector(".block-c-slot-body");
            node.body = this.parseNodeSequence(slot ? slot.firstElementChild : null);
        } else if (type === "if_path") {
            const sel = el.querySelector(".block-param-condition");
            node.params.condition = sel ? sel.value : "ahead";
            const slot = el.querySelector(".block-c-slot-body");
            node.body = this.parseNodeSequence(slot ? slot.firstElementChild : null);
        } else if (type === "if_else") {
            const sel = el.querySelector(".block-param-condition");
            node.params.condition = sel ? sel.value : "ahead";
            const slotBody = el.querySelector(".block-c-slot-body");
            const slotElse = el.querySelector(".block-c-slot-else");
            node.body = this.parseNodeSequence(slotBody ? slotBody.firstElementChild : null);
            node.elseBody = this.parseNodeSequence(slotElse ? slotElse.firstElementChild : null);
        }

        return node;
    }

    highlightBlock(blockId) {
        this.workspaceEl.querySelectorAll(".block-node, .block-shape").forEach(el => {
            el.classList.remove("block-highlight");
        });
        if (blockId) {
            const target = document.getElementById(blockId);
            if (target) {
                const shape = target.querySelector(".block-shape") || target;
                shape.classList.add("block-highlight");
            }
        }
    }

    getJavaScriptCode() {
        const tree = this.getExecutionTree();
        if (tree.length === 0) return "// No action blocks attached under 'when run'!";

        const formatTree = (nodes, indent = "") => {
            return nodes.map(node => {
                switch (node.type) {
                    case "move_forward":
                        return `${indent}moveForward();`;
                    case "turn_left":
                        return `${indent}turnLeft();`;
                    case "turn_right":
                        return `${indent}turnRight();`;
                    case "jump":
                        return `${indent}jumpObstacle();`;
                    case "slingshot_launch":
                        return `${indent}slingshotLaunch();`;
                    case "smash_pig":
                        return `${indent}smashPig();`;
                    case "repeat_times":
                        return `${indent}for (var count = 0; count < ${node.params.times}; count++) {\n${formatTree(node.body || [], indent + "  ")}\n${indent}}`;
                    case "repeat_until":
                        return `${indent}while (!reachedPig()) {\n${formatTree(node.body || [], indent + "  ")}\n${indent}}`;
                    case "if_path":
                        return `${indent}if (isPath("${node.params.condition}")) {\n${formatTree(node.body || [], indent + "  ")}\n${indent}}`;
                    case "if_else":
                        return `${indent}if (isPath("${node.params.condition}")) {\n${formatTree(node.body || [], indent + "  ")}\n${indent}} else {\n${formatTree(node.elseBody || [], indent + "  ")}\n${indent}}`;
                    default:
                        return `${indent}// ${node.type}`;
                }
            }).join("\n");
        };

        return formatTree(tree);
    }
}

if (typeof window !== "undefined") {
    window.BlockWorkspace = BlockWorkspace;
}

export { BlockWorkspace };
