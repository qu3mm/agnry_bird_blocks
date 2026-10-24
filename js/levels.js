// levels.js - 20 Puzzles categorized across 3 Difficulty Tiers
// Tier Easy (E): Puzzles 1-5   -> Sequencing and simple turns
// Tier Medium (M): Puzzles 6-13  -> Repeat loops
// Tier Hard (H): Puzzles 14-20 -> Nested loops and if/then conditions

// Tile types:
// 0: Border stone
// 1: Grass
// 2: Wood crate / Wall
// 3: Dirt path (walkable)
// 4: TNT obstacle (hazard)

const TIERS = {
    easy: {
        id: "easy",
        name: "Easy (E)",
        range: "Puzzles 1–5",
        concept: "Sequencing and simple turns",
        color: "#16a34a",
        badgeClass: "tier-easy"
    },
    medium: {
        id: "medium",
        name: "Medium (M)",
        range: "Puzzles 6–13",
        concept: "Repeat loops",
        color: "#d97706",
        badgeClass: "tier-medium"
    },
    hard: {
        id: "hard",
        name: "Hard (H)",
        range: "Puzzles 14–20",
        concept: "Nested loops and if/then conditions",
        color: "#9333ea",
        badgeClass: "tier-hard"
    }
};

const LEVELS = [
    // =========================================================================
    // TIER: EASY (E) - Puzzles 1 to 5 (Sequencing and simple turns)
    // =========================================================================
    {
        id: 1,
        tier: "easy",
        title: "Puzzle 1: First Steps",
        instruction: "Can you help me to catch the naughty pig? Stack a couple of \"move forward\" blocks together and press \"Run\" to help me get there.",
        maxBlocks: 3,
        startPos: { x: 3, y: 3 },
        startDir: "E",
        targetPos: { x: 5, y: 3 },
        grid: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 2, 2, 2, 2, 1, 0],
            [0, 1, 2, 3, 3, 3, 2, 0], // (3,3) -> (4,3) -> Pig at (5,3)
            [0, 1, 2, 2, 2, 2, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ],
        availableBlocks: ["move_forward", "turn_left", "turn_right"],
        initialWorkspace: [
            { type: "when_run", children: [
                { type: "move_forward" }
            ]}
        ],
        hint: "Add another 'move forward' block right beneath the first one to make the bird move 2 steps!"
    },
    {
        id: 2,
        tier: "easy",
        title: "Puzzle 2: Three Steps Forward",
        instruction: "This pig is ruffling my feathers. There are three steps between me and the pig. Add three \"move forward\" blocks and press \"Run\"!",
        maxBlocks: 4,
        startPos: { x: 2, y: 3 },
        startDir: "E",
        targetPos: { x: 5, y: 3 },
        grid: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 2, 2, 2, 2, 1, 0],
            [0, 2, 3, 3, 3, 3, 2, 0], // Bird at (2,3), steps to (3,3), (4,3), Pig at (5,3)
            [0, 1, 2, 2, 2, 2, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ],
        availableBlocks: ["move_forward", "turn_left", "turn_right"],
        initialWorkspace: [
            { type: "when_run", children: [
                { type: "move_forward" }
            ]}
        ],
        hint: "Count the squares between the bird and pig. You need three 'move forward' blocks in total."
    },
    {
        id: 3,
        tier: "easy",
        title: "Puzzle 3: Taking a Turn",
        instruction: "Trace the path and lead me to the silly pig. Move forward, then turn right and move to reach him!",
        maxBlocks: 5,
        startPos: { x: 3, y: 2 },
        startDir: "E",
        targetPos: { x: 4, y: 4 },
        grid: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 1, 2, 2, 2, 2, 1, 0],
            [0, 1, 2, 3, 3, 2, 1, 0], // (3,2) -> (4,2)
            [0, 1, 2, 2, 3, 2, 1, 0], // -> (4,3)
            [0, 1, 2, 2, 3, 2, 1, 0], // Pig at (4,4)
            [0, 1, 2, 2, 2, 2, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ],
        availableBlocks: ["move_forward", "turn_left", "turn_right"],
        initialWorkspace: [
            { type: "when_run", children: [] }
        ],
        hint: "Move forward 1 step, turn right, then move forward 2 steps down to reach the pig!"
    },
    {
        id: 4,
        tier: "easy",
        title: "Puzzle 4: Zigzag Path",
        instruction: "Navigate around the wooden crates! Move forward 2 times, turn left, move forward 2 times, turn right, and move forward.",
        maxBlocks: 8,
        startPos: { x: 2, y: 4 },
        startDir: "E",
        targetPos: { x: 5, y: 2 },
        grid: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 1, 1, 2, 2, 2, 1, 0],
            [0, 1, 2, 2, 3, 3, 2, 0], // Path at (4,2), Pig at (5,2)
            [0, 1, 2, 2, 3, 2, 1, 0], // Path at (4,3)
            [0, 1, 3, 3, 3, 2, 1, 0], // Bird at (2,4) -> (3,4) -> (4,4)
            [0, 1, 2, 2, 2, 2, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ],
        availableBlocks: ["move_forward", "turn_left", "turn_right"],
        initialWorkspace: [
            { type: "when_run", children: [] }
        ],
        hint: "Follow the turns: move forward 2 times, turn left, move forward 2 times, turn right, move forward 1 time."
    },
    {
        id: 5,
        tier: "easy",
        title: "Puzzle 5: The Stone Corridor",
        instruction: "The path winds around the stone walls in a U-turn! Move forward 2 times, turn right, move forward 2 times, turn right, and move forward to catch the pig.",
        maxBlocks: 8,
        startPos: { x: 2, y: 2 },
        startDir: "E",
        targetPos: { x: 3, y: 4 },
        grid: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 2, 2, 2, 2, 2, 2, 0],
            [0, 2, 3, 3, 3, 2, 2, 0], // (2,2) -> (3,2) -> (4,2)
            [0, 2, 2, 2, 3, 2, 2, 0], // (4,3)
            [0, 2, 2, 3, 3, 2, 2, 0], // (3,4) Pig, (4,4)
            [0, 2, 2, 2, 2, 2, 2, 0],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ],
        availableBlocks: ["move_forward", "turn_left", "turn_right"],
        initialWorkspace: [
            { type: "when_run", children: [] }
        ],
        hint: "Move forward 2 times, turn right, move forward 2 times, turn right, move forward 1 time."
    },

    // =========================================================================
    // TIER: MEDIUM (M) - Puzzles 6 to 13 (Repeat loops)
    // =========================================================================
    {
        id: 6,
        tier: "medium",
        title: "Puzzle 6: Bridge & Hook Loop",
        instruction: "Cross the narrow bridge over the TNT crates using a \"repeat\" loop, then turn right and step into the pig's hideout!",
        maxBlocks: 5,
        startPos: { x: 1, y: 2 },
        startDir: "E",
        targetPos: { x: 5, y: 3 },
        grid: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 2, 4, 2, 4, 2, 2, 0],
            [0, 3, 3, 3, 3, 3, 4, 0], // (1,2) -> (5,2), TNT at (6,2)
            [0, 2, 2, 4, 2, 3, 2, 0], // Pig at (5,3)
            [0, 1, 2, 2, 2, 2, 2, 0],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ],
        availableBlocks: ["move_forward", "repeat_times", "turn_left", "turn_right"],
        initialWorkspace: [
            { type: "when_run", children: [] }
        ],
        hint: "Use 'repeat 4 times [move forward]' to reach the corner, then attach 'turn right' and 'move forward' underneath the loop!"
    },
    {
        id: 7,
        tier: "medium",
        title: "Puzzle 7: The Deep TNT Staircase",
        instruction: "Descend all 4 steps of the TNT-lined staircase! Repeat the stair pattern (move forward, turn right, move forward, turn left) 4 times.",
        maxBlocks: 6,
        startPos: { x: 1, y: 1 },
        startDir: "E",
        targetPos: { x: 5, y: 5 },
        grid: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 3, 3, 4, 2, 2, 1, 0], // (1,1) -> (2,1)
            [0, 2, 3, 3, 4, 2, 1, 0], // (2,2) -> (3,2)
            [0, 2, 4, 3, 3, 4, 2, 0], // (3,3) -> (4,3)
            [0, 1, 2, 4, 3, 3, 2, 0], // (4,4) -> (5,4)
            [0, 1, 1, 2, 4, 3, 2, 0], // (5,5) Pig!
            [0, 1, 1, 1, 2, 2, 2, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ],
        availableBlocks: ["move_forward", "repeat_times", "turn_left", "turn_right"],
        initialWorkspace: [
            { type: "when_run", children: [] }
        ],
        hint: "Put 4 actions inside 'repeat 4 times': move forward, turn right, move forward, turn left."
    },
    {
        id: 8,
        tier: "medium",
        title: "Puzzle 8: Sawtooth Ridge (Repeat Until 🐷)",
        instruction: "Climb the jagged ridge using \"repeat until 🐷\"! Pack the upward zigzag step pattern inside the loop so it repeats automatically until you catch the pig.",
        maxBlocks: 6,
        startPos: { x: 1, y: 5 },
        startDir: "E",
        targetPos: { x: 5, y: 1 },
        grid: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 1, 2, 2, 4, 3, 2, 0], // (5,1) Pig
            [0, 1, 2, 4, 3, 3, 2, 0], // (4,2) -> (5,2)
            [0, 2, 4, 3, 3, 4, 2, 0], // (3,3) -> (4,3)
            [0, 2, 3, 3, 4, 2, 1, 0], // (2,4) -> (3,4)
            [0, 3, 3, 4, 2, 1, 1, 0], // (1,5) -> (2,5)
            [0, 2, 2, 2, 1, 1, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ],
        availableBlocks: ["move_forward", "repeat_until", "turn_left", "turn_right"],
        initialWorkspace: [
            { type: "when_run", children: [] }
        ],
        hint: "Inside 'repeat until 🐷', stack: move forward, turn left, move forward, turn right!"
    },
    {
        id: 9,
        tier: "medium",
        title: "Puzzle 9: The Castle Perimeter",
        instruction: "March around 3 walls of the TNT fortress! Each wall is 3 tiles long followed by a right turn.",
        maxBlocks: 6,
        startPos: { x: 1, y: 2 },
        startDir: "E",
        targetPos: { x: 1, y: 5 },
        grid: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 2, 2, 2, 2, 2, 1, 0],
            [0, 3, 3, 3, 3, 4, 2, 0], // (1,2) -> (4,2)
            [0, 2, 4, 4, 3, 2, 2, 0], // (4,3)
            [0, 2, 4, 4, 3, 2, 2, 0], // (4,4)
            [0, 3, 3, 3, 3, 4, 2, 0], // (1,5) Pig <- (4,5)
            [0, 2, 2, 2, 2, 2, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ],
        availableBlocks: ["move_forward", "repeat_times", "turn_left", "turn_right"],
        initialWorkspace: [
            { type: "when_run", children: [] }
        ],
        hint: "Use 'repeat 3 times' containing three 'move forward' blocks and one 'turn right' block."
    },
    {
        id: 10,
        tier: "medium",
        title: "Puzzle 10: Twin-Corridor Switchback",
        instruction: "One loop isn't enough when the corridors have different lengths! Chain two separate \"repeat\" loops with a turn in between.",
        maxBlocks: 6,
        startPos: { x: 1, y: 1 },
        startDir: "S",
        targetPos: { x: 6, y: 5 },
        grid: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 3, 2, 1, 1, 1, 1, 0], // (1,1) Bird facing S
            [0, 3, 2, 1, 1, 1, 1, 0], // (1,2)
            [0, 3, 4, 2, 2, 2, 1, 0], // (1,3)
            [0, 3, 2, 4, 2, 4, 2, 0], // (1,4)
            [0, 3, 3, 3, 3, 3, 3, 0], // (1,5) -> (6,5) Pig
            [0, 4, 2, 2, 2, 2, 2, 0], // TNT at (1,6)
            [0, 0, 0, 0, 0, 0, 0, 0]
        ],
        availableBlocks: ["move_forward", "repeat_times", "turn_left", "turn_right"],
        initialWorkspace: [
            { type: "when_run", children: [] }
        ],
        hint: "First 'repeat 4 times [move forward]', then 'turn left', then 'repeat 5 times [move forward]'!"
    },
    {
        id: 11,
        tier: "medium",
        title: "Puzzle 11: Knight's L-Step Loop",
        instruction: "The path advances in L-shaped leaps (2 steps East, 1 step South). Loop this 5-block pattern to leap across the TNT traps!",
        maxBlocks: 7,
        startPos: { x: 1, y: 1 },
        startDir: "E",
        targetPos: { x: 6, y: 3 },
        grid: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 3, 3, 3, 4, 2, 1, 0], // (1,1) -> (3,1), TNT at (4,1)
            [0, 2, 4, 3, 3, 3, 4, 0], // (3,2) -> (5,2), TNT at (2,2), (6,2)
            [0, 1, 2, 4, 2, 3, 3, 0], // (5,3) -> (6,3) Pig
            [0, 1, 1, 2, 2, 4, 2, 0],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ],
        availableBlocks: ["move_forward", "repeat_times", "repeat_until", "turn_left", "turn_right"],
        initialWorkspace: [
            { type: "when_run", children: [] }
        ],
        hint: "Inside 'repeat until 🐷' (or 'repeat 3 times'): move forward, move forward, turn right, move forward, turn left."
    },
    {
        id: 12,
        tier: "medium",
        title: "Puzzle 12: TNT Minefield Slalom",
        instruction: "Weave through the heavy TNT minefield! Each wide wave takes 2 steps East, a right turn, 2 steps South, and a left turn.",
        maxBlocks: 8,
        startPos: { x: 1, y: 1 },
        startDir: "E",
        targetPos: { x: 5, y: 5 },
        grid: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 3, 3, 3, 4, 2, 1, 0], // (1,1) -> (3,1)
            [0, 2, 4, 3, 2, 2, 1, 0], // (3,2)
            [0, 1, 4, 3, 3, 3, 4, 0], // (3,3) -> (5,3)
            [0, 1, 2, 4, 4, 3, 2, 0], // (5,4)
            [0, 1, 1, 2, 4, 3, 2, 0], // (5,5) Pig
            [0, 1, 1, 1, 2, 2, 2, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ],
        availableBlocks: ["move_forward", "repeat_times", "repeat_until", "turn_left", "turn_right"],
        initialWorkspace: [
            { type: "when_run", children: [] }
        ],
        hint: "Repeat 2 times (or repeat until 🐷): move forward, move forward, turn right, move forward, move forward, turn left."
    },
    {
        id: 13,
        tier: "medium",
        title: "Puzzle 13: Bunker Breach Finale",
        instruction: "Climb 3 zigzag steps up the ridge, then sprint 2 extra steps straight East to breach the pig's bunker before hitting the upper TNT!",
        maxBlocks: 8,
        startPos: { x: 1, y: 6 },
        startDir: "E",
        targetPos: { x: 6, y: 3 },
        grid: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 1, 1, 2, 2, 2, 2, 0],
            [0, 1, 2, 2, 4, 4, 2, 0], // TNT at (4,2), (5,2) blocks a 4th stair climb!
            [0, 1, 2, 4, 3, 3, 3, 0], // (4,3) -> (5,3) -> (6,3) Pig
            [0, 2, 4, 3, 3, 2, 2, 0], // (3,4) -> (4,4)
            [0, 4, 3, 3, 2, 1, 1, 0], // (2,5) -> (3,5)
            [0, 3, 3, 2, 1, 1, 1, 0], // (1,6) -> (2,6)
            [0, 0, 0, 0, 0, 0, 0, 0]
        ],
        availableBlocks: ["move_forward", "repeat_times", "turn_left", "turn_right"],
        initialWorkspace: [
            { type: "when_run", children: [] }
        ],
        hint: "First run 'repeat 3 times [move forward, turn left, move forward, turn right]', then attach two 'move forward' blocks after the loop!"
    },

    // =========================================================================
    // TIER: HARD (H) - Puzzles 14 to 20 (Nested loops and if/then conditions)
    // =========================================================================
    {
        id: 14,
        tier: "hard",
        title: "Puzzle 14: Counter-Clockwise Spiral (If Path Left)",
        instruction: "Navigate a 4-corner inward spiral using only 5 blocks! Inside \"repeat until 🐷\", move forward and check \"if path to the left do [turn left]\".",
        maxBlocks: 5,
        startPos: { x: 1, y: 6 },
        startDir: "E",
        targetPos: { x: 4, y: 4 },
        grid: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 4, 3, 3, 3, 3, 3, 0], // (2,1) <- (6,1), TNT at (1,1)
            [0, 2, 3, 2, 2, 2, 3, 0], // (2,2), (6,2)
            [0, 2, 3, 4, 4, 2, 3, 0], // (2,3), (6,3)
            [0, 2, 3, 3, 3, 2, 3, 0], // (2,4) -> (4,4) Pig, (6,4)
            [0, 2, 2, 2, 2, 2, 3, 0], // (6,5)
            [0, 3, 3, 3, 3, 3, 3, 0], // (1,6) -> (6,6)
            [0, 0, 0, 0, 0, 0, 0, 0]
        ],
        availableBlocks: ["move_forward", "repeat_until", "if_path", "turn_left", "turn_right"],
        initialWorkspace: [
            { type: "when_run", children: [] }
        ],
        hint: "Inside 'repeat until 🐷': place 'move forward' followed by 'if path to the left do [turn left]'."
    },
    {
        id: 15,
        tier: "hard",
        title: "Puzzle 15: Clockwise TNT Vortex (If Path Right)",
        instruction: "Every corner in this clockwise vortex is booby-trapped with TNT straight ahead! Use \"if path to the right do [turn right]\" after moving forward to turn before hitting the TNT.",
        maxBlocks: 5,
        startPos: { x: 1, y: 1 },
        startDir: "E",
        targetPos: { x: 4, y: 3 },
        grid: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 3, 3, 3, 3, 3, 3, 4], // (1,1) -> (6,1), TNT at (7,1)
            [0, 2, 4, 2, 2, 2, 3, 0], // TNT at (2,2), path at (6,2)
            [0, 2, 3, 3, 3, 2, 3, 0], // (2,3) -> (4,3) Pig, path at (6,3)
            [0, 2, 3, 4, 2, 2, 3, 0], // (2,4), (6,4)
            [0, 2, 3, 2, 2, 2, 3, 0], // (2,5), (6,5)
            [0, 4, 3, 3, 3, 3, 3, 0], // TNT at (1,6), (2,6) <- (6,6)
            [0, 0, 0, 0, 0, 0, 4, 0]  // TNT at (6,7)
        ],
        availableBlocks: ["move_forward", "repeat_until", "if_path", "turn_left", "turn_right"],
        initialWorkspace: [
            { type: "when_run", children: [] }
        ],
        hint: "Inside 'repeat until 🐷': place 'move forward' followed by 'if path to the right do [turn right]'."
    },
    {
        id: 16,
        tier: "hard",
        title: "Puzzle 16: Dual-Sensor Canyon",
        instruction: "This canyon twists both LEFT and RIGHT! Stack two \"if path\" sensors (one for left, one for right) inside your \"repeat until 🐷\" loop.",
        maxBlocks: 7,
        startPos: { x: 1, y: 6 },
        startDir: "E",
        targetPos: { x: 6, y: 1 },
        grid: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 1, 2, 2, 4, 3, 3, 0], // (5,1) -> (6,1) Pig
            [0, 1, 2, 2, 2, 3, 2, 0], // (5,2)
            [0, 1, 2, 4, 2, 3, 2, 0], // (5,3)
            [0, 2, 2, 3, 3, 3, 4, 0], // (3,4) -> (5,4)
            [0, 2, 2, 3, 2, 2, 1, 0], // (3,5)
            [0, 3, 3, 3, 4, 2, 1, 0], // (1,6) -> (3,6)
            [0, 0, 0, 0, 0, 0, 0, 0]
        ],
        availableBlocks: ["move_forward", "repeat_until", "if_path", "turn_left", "turn_right"],
        initialWorkspace: [
            { type: "when_run", children: [] }
        ],
        hint: "Inside 'repeat until 🐷': move forward, if path to the left [turn left], and if path to the right [turn right]!"
    },
    {
        id: 17,
        tier: "hard",
        title: "Puzzle 17: Nested Loops Fortress Vault",
        instruction: "March along 3 outer walls of the fortress using a nested loop (repeat 3 times [repeat 4 times move forward, turn right]), then step forward, turn right, and breach the inner TNT vault!",
        maxBlocks: 8,
        startPos: { x: 1, y: 1 },
        startDir: "E",
        targetPos: { x: 2, y: 4 },
        grid: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 3, 3, 3, 3, 3, 2, 0], // (1,1) -> (5,1)
            [0, 4, 4, 4, 4, 3, 2, 0], // TNT at (1,2)..(4,2), path at (5,2)
            [0, 2, 4, 4, 4, 3, 2, 0], // TNT at (2,3)..(4,3), path at (5,3)
            [0, 3, 3, 4, 4, 3, 2, 0], // (1,4) -> (2,4) Pig in vault, path at (5,4)
            [0, 3, 3, 3, 3, 3, 2, 0], // (1,5) <- (5,5)
            [0, 2, 2, 2, 2, 2, 2, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ],
        availableBlocks: ["move_forward", "repeat_times", "turn_left", "turn_right"],
        initialWorkspace: [
            { type: "when_run", children: [] }
        ],
        hint: "Outer loop: repeat 3 times [inner loop: repeat 4 times move forward, then turn right]. After the outer loop: move forward, turn right, move forward!"
    },
    {
        id: 18,
        tier: "hard",
        title: "Puzzle 18: Contracting Wall-Sensor Spiral",
        instruction: "Use \"if path ahead do [move forward] else [turn right]\" inside \"repeat until 🐷\"! Your sensor detects both walls and TNT crates to spiral into the center.",
        maxBlocks: 5,
        startPos: { x: 1, y: 1 },
        startDir: "E",
        targetPos: { x: 4, y: 4 },
        grid: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 3, 3, 3, 3, 3, 3, 0], // (1,1) -> (6,1)
            [0, 4, 2, 2, 2, 2, 3, 0], // TNT at (1,2), path at (6,2)
            [0, 3, 3, 3, 3, 4, 3, 0], // (1,3) -> (4,3), TNT at (5,3), path at (6,3)
            [0, 3, 2, 2, 3, 2, 3, 0], // (1,4), Pig at (4,4), path at (6,4)
            [0, 3, 2, 2, 2, 2, 3, 0], // (1,5), (6,5)
            [0, 3, 3, 3, 3, 3, 3, 0], // (1,6) <- (6,6)
            [0, 0, 0, 0, 0, 0, 0, 0]
        ],
        availableBlocks: ["move_forward", "repeat_until", "if_else", "turn_left", "turn_right"],
        initialWorkspace: [
            { type: "when_run", children: [] }
        ],
        hint: "Inside 'repeat until 🐷': place 'if path ahead do [move forward] else [turn right]'."
    },
    {
        id: 19,
        tier: "hard",
        title: "Puzzle 19: The Great S-Labyrinth",
        instruction: "Navigate the 5-turn S-Labyrinth! Inside \"repeat until 🐷\", check for left turns with \"if path to the left\", and handle straightaways and right turns with \"if path ahead / else\".",
        maxBlocks: 7,
        startPos: { x: 1, y: 1 },
        startDir: "E",
        targetPos: { x: 6, y: 6 },
        grid: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 3, 3, 3, 3, 3, 4, 0], // (1,1) -> (5,1), TNT at (6,1)
            [0, 2, 2, 2, 2, 3, 2, 0], // (5,2)
            [0, 4, 3, 3, 3, 3, 4, 0], // TNT at (1,3), (2,3) <- (5,3), TNT at (6,3)
            [0, 2, 3, 2, 2, 2, 2, 0], // (2,4)
            [0, 2, 3, 3, 3, 3, 3, 0], // (2,5) -> (6,5)
            [0, 2, 2, 2, 2, 4, 3, 0], // TNT at (5,6), Pig at (6,6)
            [0, 0, 0, 0, 0, 0, 0, 0]
        ],
        availableBlocks: ["move_forward", "repeat_until", "if_path", "if_else", "turn_left", "turn_right"],
        initialWorkspace: [
            { type: "when_run", children: [] }
        ],
        hint: "Inside 'repeat until 🐷': first check 'if path to the left do [turn left]', then 'if path ahead do [move forward] else [turn right]'."
    },
    {
        id: 20,
        tier: "hard",
        title: "Puzzle 20: Master Coder Finale",
        instruction: "The ultimate 6-turn fortress gauntlet! Combine a side-path sensor and an if/else wall-and-TNT sensor inside your loop to guide Bomb across the entire castle.",
        maxBlocks: 7,
        startPos: { x: 1, y: 6 },
        startDir: "N",
        targetPos: { x: 6, y: 6 },
        grid: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 2, 4, 3, 3, 3, 4, 0], // TNT at (2,1), (3,1)->(5,1), TNT at (6,1)
            [0, 4, 2, 3, 2, 3, 2, 0], // TNT at (1,2), (3,2), (5,2)
            [0, 3, 3, 3, 2, 3, 2, 0], // (1,3) -> (3,3), (5,3)
            [0, 3, 2, 2, 2, 3, 4, 0], // (1,4), (5,4), TNT at (6,4)
            [0, 3, 2, 4, 2, 3, 3, 0], // (1,5), (5,5) -> (6,5)
            [0, 3, 2, 2, 2, 4, 3, 0], // (1,6) Bird, TNT at (5,6), Pig at (6,6)
            [0, 0, 0, 0, 0, 0, 0, 0]
        ],
        availableBlocks: ["move_forward", "repeat_times", "repeat_until", "if_path", "if_else", "turn_left", "turn_right"],
        initialWorkspace: [
            { type: "when_run", children: [] }
        ],
        hint: "Inside 'repeat until 🐷': use 'if path to the left do [turn left]' and 'if path ahead do [move forward] else [turn right]'!"
    },
    {
        id: 21,
        tier: "hard",
        bonus: true,
        title: "Bonus Puzzle 21: Deep Left Vortex",
        instruction: "Bonus challenge! Traverse the 21-tile counter-clockwise vortex from the top-right corner into the central chamber using only 5 blocks.",
        maxBlocks: 5,
        startPos: { x: 6, y: 1 },
        startDir: "W",
        targetPos: { x: 3, y: 3 },
        grid: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 3, 3, 3, 3, 3, 3, 0], // (1,1) <- (6,1) Bird facing W
            [0, 3, 2, 2, 2, 2, 4, 0], // (1,2), TNT at (6,2)
            [0, 3, 2, 3, 3, 3, 3, 0], // (1,3), (3,3) Pig <- (6,3)
            [0, 3, 2, 2, 4, 2, 3, 0], // (1,4), (6,4)
            [0, 3, 4, 2, 2, 2, 3, 0], // (1,5), (6,5)
            [0, 3, 3, 3, 3, 3, 3, 0], // (1,6) -> (6,6)
            [0, 0, 0, 0, 0, 0, 0, 0]
        ],
        availableBlocks: ["move_forward", "repeat_until", "if_path", "turn"],
        initialWorkspace: [
            { type: "when_run", children: [] }
        ],
        hint: "Inside 'repeat until 🐷': move forward, then check 'if path to the left do [turn left]'."
    }
];

if (typeof window !== "undefined") {
    window.TIERS = TIERS;
    window.LEVELS = LEVELS;
}
