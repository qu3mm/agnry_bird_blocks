// blocks.js - Visual Drag-and-Drop Block Engine with Interlocking Stacks & C-Blocks

class BlockWorkspace {
    constructor(toolboxId, workspaceId, blockCountId) {
        this.toolboxEl = document.getElementById(toolboxId);
        this.workspaceEl = document.getElementById(workspaceId);
        this.blockCountEl = document.getElementById(blockCountId);
        this.blockIdCounter = 1;
        this.activeDrag = null;
        this.dropIndicator = null;
        this.maxBlocks = 3;
        this.onWorkspaceChange = null;

        this.init();
    }

    init() {
        this.setupDropIndicator();
        this.setupGlobalDragEvents();
    }

    setupDropIndicator() {
        this.dropIndicator = document.createElement("div");
        this.dropIndicator.className = "block-snap-indicator";
        this.dropIndicator.style.display = "none";
        this.workspaceEl.appendChild(this.dropIndicator);
    }

    loadLevel(level) {
        this.maxBlocks = level.maxBlocks;
        this.clear();
        this.renderToolbox(level.availableBlocks);
        this.loadInitialBlocks(level.initialWorkspace);
        this.updateBlockCount();
    }

    clear() {
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

        blockTypes.forEach(type => {
            const proto = this.createToolboxBlockElement(type);
            this.toolboxEl.appendChild(proto);
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
                    <div class="block-shape block-action">
                        <div class="block-notch-top"></div>
                        <div class="block-content">
                            <span class="block-label">move forward</span>
                        </div>
                        <div class="block-notch-bottom"></div>
                    </div>
                `;

            case "turn_left":
                return `
                    <div class="block-shape block-action">
                        <div class="block-notch-top"></div>
                        <div class="block-content">
                            <span class="block-label">turn left ↺</span>
                        </div>
                        <div class="block-notch-bottom"></div>
                    </div>
                `;

            case "turn_right":
                return `
                    <div class="block-shape block-action">
                        <div class="block-notch-top"></div>
                        <div class="block-content">
                            <span class="block-label">turn right ↻</span>
                        </div>
                        <div class="block-notch-bottom"></div>
                    </div>
                `;

            case "repeat_times":
                return `
                    <div class="block-shape block-c-container block-c-loop">
                        <div class="block-c-header">
                            <div class="block-notch-top"></div>
                            <span>repeat</span>
                            <select class="block-select block-param-times" onclick="event.stopPropagation()">
                                ${[2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `
                                    <option value="${n}" ${n === (params.times || 5) ? "selected" : ""}>${n}</option>
                                `).join("")}
                            </select>
                            <span>times</span>
                            <span style="opacity: 0.8; margin-left: 4px;">do</span>
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
                            <span>repeat until</span>
                            <span style="background: rgba(255,255,255,0.22); padding: 1px 6px; border-radius: 4px; font-size: 13px;">🐷</span>
                            <span style="opacity: 0.8; margin-left: 4px;">do</span>
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
                            <span>if path</span>
                            <select class="block-select block-param-condition" onclick="event.stopPropagation()">
                                <option value="ahead" ${params.condition === "ahead" ? "selected" : ""}>ahead</option>
                                <option value="left" ${params.condition === "left" ? "selected" : ""}>to the left ↺</option>
                                <option value="right" ${params.condition === "right" ? "selected" : ""}>to the right ↻</option>
                            </select>
                            <span style="opacity: 0.8; margin-left: 4px;">do</span>
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
                            <span>if path</span>
                            <select class="block-select block-param-condition" onclick="event.stopPropagation()">
                                <option value="ahead" ${params.condition === "ahead" ? "selected" : ""}>ahead</option>
                                <option value="left" ${params.condition === "left" ? "selected" : ""}>to the left ↺</option>
                                <option value="right" ${params.condition === "right" ? "selected" : ""}>to the right ↻</option>
                            </select>
                            <span style="opacity: 0.8; margin-left: 4px;">do</span>
                            <div class="block-notch-inner-top"></div>
                        </div>
                        <div class="block-c-body-arm">
                            <div class="block-c-left-bar"></div>
                            <div class="block-c-slot block-c-slot-body" data-slot-type="body"></div>
                        </div>
                        <div class="block-c-else-header">
                            <span>else</span>
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
        if (e.type === "touchstart") e.preventDefault();
        window.soundFX?.playClick();

        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);

        const newStack = document.createElement("div");
        newStack.className = "block-stack block-stack-dragging";
        this.workspaceEl.appendChild(newStack);

        const newBlock = this.createBlock(type);
        newStack.appendChild(newBlock.element);

        const wsRect = this.workspaceEl.getBoundingClientRect();
        const offsetX = 30;
        const offsetY = 16;

        newStack.style.left = `${clientX - wsRect.left - offsetX}px`;
        newStack.style.top = `${clientY - wsRect.top - offsetY}px`;

        this.activeDrag = {
            stack: newStack,
            isNew: true,
            offsetX: offsetX,
            offsetY: offsetY
        };
    }

    startDraggingExistingBlock(e, blockEl) {
        e.stopPropagation();
        if (e.type === "touchstart") e.preventDefault();

        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);

        const wsRect = this.workspaceEl.getBoundingClientRect();
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
                offsetX: offsetX,
                offsetY: offsetY
            };
            return;
        }

        // If dragging any child block: detach it and any subsequent siblings into a new stack!
        const newStack = document.createElement("div");
        newStack.className = "block-stack block-stack-dragging";
        newStack.style.left = `${bRect.left - wsRect.left}px`;
        newStack.style.top = `${bRect.top - wsRect.top}px`;
        this.workspaceEl.appendChild(newStack);

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
            const posX = clientX - wsRect.left - this.activeDrag.offsetX;
            const posY = clientY - wsRect.top - this.activeDrag.offsetY;

            this.activeDrag.stack.style.left = `${posX}px`;
            this.activeDrag.stack.style.top = `${posY}px`;

            this.checkForSnapTarget(clientX, clientY, this.activeDrag.stack);
        };

        const onEnd = (e) => {
            if (!this.activeDrag) return;

            const clientX = e.clientX || (e.changedTouches && e.changedTouches[0].clientX);
            const clientY = e.clientY || (e.changedTouches && e.changedTouches[0].clientY);

            const stack = this.activeDrag.stack;
            stack.classList.remove("block-stack-dragging");

            // Check if dropped onto toolbox / trash to delete
            const tbRect = this.toolboxEl.getBoundingClientRect();
            const isTrash = (clientX >= tbRect.left && clientX <= tbRect.right && clientY >= tbRect.top && clientY <= tbRect.bottom);

            if (isTrash && !this.activeDrag.isRoot) {
                stack.remove();
                window.soundFX?.playTrash();
                this.finishDrag();
                return;
            }

            // Snap or leave as floating stack
            if (this.currentSnapTarget && !this.activeDrag.isRoot) {
                this.executeSnap(this.currentSnapTarget, stack);
                window.soundFX?.playSnap();
            }

            this.finishDrag();
        };

        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onEnd);
        window.addEventListener("touchmove", onMove, { passive: false });
        window.addEventListener("touchend", onEnd);
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
        this.activeDrag = null;
        this.currentSnapTarget = null;
        this.dropIndicator.style.display = "none";
        this.updateBlockCount();
        if (this.onWorkspaceChange) this.onWorkspaceChange();
    }

    getAllBlocksFlat() {
        return Array.from(this.workspaceEl.querySelectorAll(".block-node"));
    }

    updateBlockCount() {
        const total = this.getAllBlocksFlat().length;
        if (this.blockCountEl) {
            this.blockCountEl.textContent = `Workspace - ${total} / ${this.maxBlocks} blocks`;
            if (total > this.maxBlocks) {
                this.blockCountEl.classList.add("block-count-over");
            } else {
                this.blockCountEl.classList.remove("block-count-over");
            }
        }
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

        if (type === "repeat_times") {
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
