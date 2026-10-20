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
        instruction: "Navigate around the wooden crates! Step forward, turn left, step forward 2 times, turn right, and step forward.",
        maxBlocks: 7,
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
        instruction: "The path winds around stone walls. Plan all 3 turns carefully to catch the pig!",
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
        title: "Puzzle 6: Intro to Repeat Loops",
        instruction: "Instead of stacking 5 \"move forward\" blocks, use the pink \"repeat\" block to do it with only 2 blocks!",
        maxBlocks: 3,
        startPos: { x: 1, y: 3 },
        startDir: "E",
        targetPos: { x: 6, y: 3 },
        grid: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 2, 2, 2, 2, 2, 2, 0],
            [0, 3, 3, 3, 3, 3, 3, 0], // (1,3) to (6,3) = 5 steps!
            [0, 2, 2, 2, 2, 2, 2, 0],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ],
        availableBlocks: ["move_forward", "repeat_times", "turn_left", "turn_right"],
        initialWorkspace: [
            { type: "when_run", children: [
                { type: "repeat_times", params: { times: 5 }, body: [] }
            ]}
        ],
        hint: "Place a 'move forward' block inside the mouth of the 'repeat 5 times' block!"
    },
    {
        id: 7,
        tier: "medium",
        title: "Puzzle 7: The Staircase Loop",
        instruction: "Notice the repeating pattern in the stairs? Move forward, turn right, move forward, turn left. Repeat this pattern 3 times!",
        maxBlocks: 6,
        startPos: { x: 2, y: 1 },
        startDir: "E",
        targetPos: { x: 5, y: 4 },
        grid: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 2, 3, 3, 2, 2, 2, 0], // (2,1) -> (3,1)
            [0, 2, 2, 3, 3, 2, 2, 0], // (3,2) -> (4,2)
            [0, 2, 2, 2, 3, 3, 2, 0], // (4,3) -> (5,3)
            [0, 2, 2, 2, 2, 3, 2, 0], // (5,4) Pig!
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ],
        availableBlocks: ["move_forward", "repeat_times", "turn_left", "turn_right"],
        initialWorkspace: [
            { type: "when_run", children: [] }
        ],
        hint: "Put the 4 actions inside 'repeat 3 times': move forward, turn right, move forward, turn left."
    },
    {
        id: 8,
        tier: "medium",
        title: "Puzzle 8: Repeat Until Pig",
        instruction: "Use the \"repeat until 🐷\" block! It keeps repeating whatever is inside until you reach the pig.",
        maxBlocks: 3,
        startPos: { x: 1, y: 4 },
        startDir: "E",
        targetPos: { x: 6, y: 4 },
        grid: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 2, 2, 2, 2, 2, 2, 0],
            [0, 2, 2, 2, 2, 2, 2, 0],
            [0, 3, 3, 3, 3, 3, 3, 0], // 5 steps
            [0, 2, 2, 2, 2, 2, 2, 0],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ],
        availableBlocks: ["move_forward", "repeat_until", "turn_left", "turn_right"],
        initialWorkspace: [
            { type: "when_run", children: [
                { type: "repeat_until", body: [] }
            ]}
        ],
        hint: "Put a single 'move forward' block inside the 'repeat until 🐷' block!"
    },
    {
        id: 9,
        tier: "medium",
        title: "Puzzle 9: The Castle Perimeter",
        instruction: "The bird needs to walk along 3 sides of a square. Repeat (move forward 2, turn right) 3 times!",
        maxBlocks: 5,
        startPos: { x: 2, y: 2 },
        startDir: "E",
        targetPos: { x: 2, y: 4 },
        grid: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 2, 2, 2, 2, 2, 2, 0],
            [0, 2, 3, 3, 3, 2, 2, 0], // (2,2) -> (4,2)
            [0, 2, 2, 2, 3, 2, 2, 0], // (4,3)
            [0, 2, 3, 3, 3, 2, 2, 0], // (4,4) -> (2,4) Pig
            [0, 2, 2, 2, 2, 2, 2, 0],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ],
        availableBlocks: ["move_forward", "repeat_times", "turn_left", "turn_right"],
        initialWorkspace: [
            { type: "when_run", children: [] }
        ],
        hint: "Set repeat to 3 times: move forward 2 times, then turn right."
    },
    {
        id: 10,
        tier: "medium",
        title: "Puzzle 10: U-Turn Run",
        instruction: "Use \"repeat until 🐷\" to navigate the long winding corridor with repeating turns!",
        maxBlocks: 6,
        startPos: { x: 2, y: 1 },
        startDir: "S",
        targetPos: { x: 4, y: 5 },
        grid: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 2, 3, 2, 2, 2, 2, 0], // (2,1)
            [0, 2, 3, 2, 2, 2, 2, 0], // (2,2)
            [0, 2, 3, 3, 3, 2, 2, 0], // (2,3) -> (4,3)
            [0, 2, 2, 2, 3, 2, 2, 0], // (4,4)
            [0, 2, 2, 2, 3, 2, 2, 0], // (4,5) Pig
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ],
        availableBlocks: ["move_forward", "repeat_times", "repeat_until", "turn_left", "turn_right"],
        initialWorkspace: [
            { type: "when_run", children: [] }
        ],
        hint: "Move forward 2 times, turn left, move forward 2 times, turn right, move forward 2 times."
    },
    {
        id: 11,
        tier: "medium",
        title: "Puzzle 11: Spiral Step",
        instruction: "The path spirals into the center! Notice how each leg has 2 steps and a right turn. Loop it!",
        maxBlocks: 5,
        startPos: { x: 1, y: 1 },
        startDir: "E",
        targetPos: { x: 3, y: 3 },
        grid: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 3, 3, 3, 3, 3, 2, 0], // (1,1) -> (5,1)
            [0, 2, 2, 2, 2, 3, 2, 0], // (5,2)
            [0, 2, 3, 3, 2, 3, 2, 0], // Pig at (3,3), (5,3)
            [0, 2, 3, 3, 3, 3, 2, 0], // (2,4) -> (5,4)
            [0, 2, 2, 2, 2, 2, 2, 0],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ],
        availableBlocks: ["move_forward", "repeat_times", "repeat_until", "turn_left", "turn_right"],
        initialWorkspace: [
            { type: "when_run", children: [] }
        ],
        hint: "Use repeat until pig with: move forward, and turn right when you hit a corner!"
    },
    {
        id: 12,
        tier: "medium",
        title: "Puzzle 12: TNT Minefield Slalom",
        instruction: "Dodge the TNT crates! The path weaves back and forth through explosive hazards. Repeat the step-and-turn pattern to navigate through!",
        maxBlocks: 6,
        startPos: { x: 1, y: 2 },
        startDir: "E",
        targetPos: { x: 5, y: 5 },
        grid: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 2, 2, 2, 2, 2, 2, 0],
            [0, 2, 3, 3, 4, 2, 2, 0], // (1,2) Bird -> (2,2), TNT at (3,2)
            [0, 2, 4, 3, 3, 4, 2, 0], // TNT at (1,3), path at (2,3)->(3,3), TNT at (4,3)
            [0, 2, 2, 4, 3, 3, 2, 0], // TNT at (2,4), path at (3,4)->(4,4)
            [0, 2, 2, 2, 4, 3, 2, 0], // TNT at (3,5), path at (4,5)->(5,5) Pig
            [0, 2, 2, 2, 2, 2, 2, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ],
        availableBlocks: ["move_forward", "repeat_times", "repeat_until", "turn_left", "turn_right"],
        initialWorkspace: [
            { type: "when_run", children: [] }
        ],
        hint: "Notice the repeat pattern: move forward, turn right, move forward, turn left. Repeat 3 times to weave through the TNT!"
    },
    {
        id: 13,
        tier: "medium",
        title: "Puzzle 13: Zigzag Repeat Challenge",
        instruction: "Master of loops! Repeat the zigzag pattern (move forward, turn left, move forward, turn right) 3 times to reach the pig.",
        maxBlocks: 6,
        startPos: { x: 1, y: 4 },
        startDir: "E",
        targetPos: { x: 4, y: 1 },
        grid: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 2, 2, 2, 3, 2, 2, 0], // Pig at (4,1)
            [0, 2, 2, 3, 3, 2, 2, 0], // (3,2) -> (4,2)
            [0, 2, 3, 3, 2, 2, 2, 0], // (2,3) -> (3,3)
            [0, 3, 3, 2, 2, 2, 2, 0], // (1,4) -> (2,4)
            [0, 2, 2, 2, 2, 2, 2, 0],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ],
        availableBlocks: ["move_forward", "repeat_times", "repeat_until", "turn_left", "turn_right"],
        initialWorkspace: [
            { type: "when_run", children: [] }
        ],
        hint: "Inside 'repeat 3 times': move forward, turn left, move forward, turn right."
    },

    // =========================================================================
    // TIER: HARD (H) - Puzzles 14 to 20 (Nested loops and if/then conditions)
    // =========================================================================
    {
        id: 14,
        tier: "hard",
        title: "Puzzle 14: Intro to If (Path to Left)",
        instruction: "The path turns left unexpectedly! Put an \"if path to the left do [turn left]\" block inside your \"repeat until 🐷\" loop.",
        maxBlocks: 5,
        startPos: { x: 2, y: 5 },
        startDir: "E",
        targetPos: { x: 5, y: 2 },
        grid: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 2, 2, 2, 2, 2, 2, 0],
            [0, 2, 2, 2, 2, 3, 2, 0], // (5,2) Pig
            [0, 2, 2, 2, 2, 3, 2, 0], // (5,3)
            [0, 2, 2, 2, 2, 3, 2, 0], // (5,4)
            [0, 2, 3, 3, 3, 3, 2, 0], // (2,5) -> (5,5)
            [0, 2, 2, 2, 2, 2, 2, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ],
        availableBlocks: ["move_forward", "repeat_until", "if_path", "turn_left", "turn_right"],
        initialWorkspace: [
            { type: "when_run", children: [] }
        ],
        hint: "Inside repeat until pig: move forward, and if path to the left: turn left!"
    },
    {
        id: 15,
        tier: "hard",
        title: "Puzzle 15: If Path to the Right",
        instruction: "Now test for paths to the right! Inside your loop, check \"if path to the right do [turn right]\" as you move forward.",
        maxBlocks: 5,
        startPos: { x: 2, y: 2 },
        startDir: "E",
        targetPos: { x: 5, y: 5 },
        grid: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 2, 2, 2, 2, 2, 2, 0],
            [0, 2, 3, 3, 3, 3, 2, 0], // (2,2) -> (5,2)
            [0, 2, 2, 2, 2, 3, 2, 0], // (5,3)
            [0, 2, 2, 2, 2, 3, 2, 0], // (5,4)
            [0, 2, 2, 2, 2, 3, 2, 0], // (5,5) Pig
            [0, 2, 2, 2, 2, 2, 2, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ],
        availableBlocks: ["move_forward", "repeat_until", "if_path", "turn_left", "turn_right"],
        initialWorkspace: [
            { type: "when_run", children: [] }
        ],
        hint: "Inside repeat until pig: move forward, and if path to the right: turn right."
    },
    {
        id: 16,
        tier: "hard",
        title: "Puzzle 16: Dynamic Winding Maze",
        instruction: "The path has multiple turns! Combine \"move forward\" with an \"if path to the left\" check inside \"repeat until 🐷\".",
        maxBlocks: 5,
        startPos: { x: 1, y: 5 },
        startDir: "E",
        targetPos: { x: 4, y: 2 },
        grid: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 2, 2, 2, 2, 2, 2, 0],
            [0, 2, 2, 3, 3, 2, 2, 0], // (3,2) -> (4,2) Pig
            [0, 2, 2, 3, 2, 2, 2, 0], // (3,3)
            [0, 2, 2, 3, 2, 2, 2, 0], // (3,4)
            [0, 3, 3, 3, 2, 2, 2, 0], // (1,5) -> (3,5)
            [0, 2, 2, 2, 2, 2, 2, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ],
        availableBlocks: ["move_forward", "repeat_until", "if_path", "turn_left", "turn_right"],
        initialWorkspace: [
            { type: "when_run", children: [] }
        ],
        hint: "Notice that both corners turn LEFT! One if-block can handle both turns!"
    },
    {
        id: 17,
        tier: "hard",
        title: "Puzzle 17: Nested Loops Castle Courtyard",
        instruction: "Walk the perimeter of the fortress! Nest a \"repeat 4 times [move forward]\" loop inside an outer \"repeat 4 times\" loop with a turn right to navigate the four walls around the TNT!",
        maxBlocks: 5,
        startPos: { x: 1, y: 1 },
        startDir: "E",
        targetPos: { x: 1, y: 2 },
        grid: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 3, 3, 3, 3, 3, 2, 0], // (1,1) Bird -> (5,1)
            [0, 3, 4, 4, 4, 3, 2, 0], // Pig at (1,2), TNT center
            [0, 3, 4, 4, 4, 3, 2, 0], // TNT center
            [0, 3, 4, 4, 4, 3, 2, 0], // TNT center
            [0, 3, 3, 3, 3, 3, 2, 0], // (1,5) -> (5,5)
            [0, 2, 2, 2, 2, 2, 2, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ],
        availableBlocks: ["move_forward", "repeat_times", "turn_left", "turn_right"],
        initialWorkspace: [
            { type: "when_run", children: [] }
        ],
        hint: "Outer loop: repeat 4 times [inner loop: repeat 4 times move forward, then turn right]. Do not step into the TNT courtyard!"
    },
    {
        id: 18,
        tier: "hard",
        title: "Puzzle 18: If-Else Wall Sensor",
        instruction: "Use \"if path ahead do [move forward] else [turn right]\" inside a \"repeat until 🐷\" loop! When hitting a wall, it automatically turns.",
        maxBlocks: 5,
        startPos: { x: 2, y: 1 },
        startDir: "E",
        targetPos: { x: 3, y: 4 },
        grid: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 2, 3, 3, 3, 2, 2, 0], // (2,1) -> (4,1)
            [0, 2, 2, 2, 3, 2, 2, 0], // (4,2)
            [0, 2, 2, 2, 3, 2, 2, 0], // (4,3)
            [0, 2, 2, 3, 3, 2, 2, 0], // (3,4) Pig <- (4,4)
            [0, 2, 2, 2, 2, 2, 2, 0],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ],
        availableBlocks: ["move_forward", "repeat_until", "if_else", "turn_left", "turn_right"],
        initialWorkspace: [
            { type: "when_run", children: [] }
        ],
        hint: "Inside repeat until pig: if path ahead do move forward, else turn right!"
    },
    {
        id: 19,
        tier: "hard",
        title: "Puzzle 19: The Great Labyrinth",
        instruction: "A challenging maze! Inside \"repeat until 🐷\", check if there's a path to the left (turn left). If path ahead, move forward!",
        maxBlocks: 6,
        startPos: { x: 1, y: 1 },
        startDir: "E",
        targetPos: { x: 5, y: 5 },
        grid: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 3, 3, 3, 3, 4, 2, 0], // (1,1) -> (4,1), TNT at (5,1)
            [0, 2, 2, 2, 3, 2, 2, 0], // (4,2)
            [0, 4, 3, 3, 3, 4, 2, 0], // TNT at (1,3), (2,3)->(4,3), TNT at (5,3)
            [0, 2, 3, 2, 2, 2, 2, 0], // (2,4)
            [0, 2, 3, 3, 3, 3, 2, 0], // (2,5) -> (5,5) Pig
            [0, 2, 2, 2, 2, 2, 2, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ],
        availableBlocks: ["move_forward", "repeat_until", "if_path", "if_else", "turn_left", "turn_right"],
        initialWorkspace: [
            { type: "when_run", children: [] }
        ],
        hint: "Inside repeat until pig: if path to the left: turn left. Also: if path ahead: move forward, else turn right."
    },
    {
        id: 20,
        tier: "hard",
        title: "Puzzle 20: Master Coder Finale",
        instruction: "The ultimate maze! Guide the bird past all obstacles using nested loops and smart condition checks to capture the elusive pig!",
        maxBlocks: 7,
        startPos: { x: 1, y: 6 },
        startDir: "N",
        targetPos: { x: 6, y: 1 },
        grid: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 2, 2, 2, 3, 3, 3, 0], // (4,1) -> (6,1) Pig
            [0, 2, 3, 3, 3, 2, 2, 0], // (2,2) -> (4,2)
            [0, 2, 3, 4, 2, 2, 2, 0], // TNT at (3,3)
            [0, 2, 3, 3, 3, 2, 2, 0], // (2,4) -> (4,4)
            [0, 3, 3, 2, 3, 2, 2, 0], // (1,5) -> (2,5), (4,5)
            [0, 3, 2, 2, 3, 3, 3, 0], // (1,6) Bird, (4,6) -> (6,6)
            [0, 0, 0, 0, 0, 0, 0, 0]
        ],
        availableBlocks: ["move_forward", "repeat_times", "repeat_until", "if_path", "if_else", "turn_left", "turn_right"],
        initialWorkspace: [
            { type: "when_run", children: [] }
        ],
        hint: "Combine your knowledge of repeat loops and if/else conditions to conquer the final castle!"
    },
    {
        id: 21,
        tier: "hard",
        bonus: true,
        title: "Bonus Puzzle 21: The Winding Passage",
        instruction: "Bonus challenge! Inside \"repeat until 🐷\", turn left whenever there is a path to the left, then move forward through the winding passage.",
        maxBlocks: 5,
        startPos: { x: 1, y: 5 },
        startDir: "E",
        targetPos: { x: 1, y: 1 },
        grid: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 3, 3, 3, 3, 2, 2, 0],
            [0, 2, 2, 2, 3, 2, 2, 0],
            [0, 2, 2, 2, 3, 2, 2, 0],
            [0, 2, 2, 2, 3, 2, 2, 0],
            [0, 3, 3, 3, 3, 2, 2, 0],
            [0, 2, 2, 2, 2, 2, 2, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ],
        availableBlocks: ["move_forward", "repeat_until", "if_path", "turn"],
        initialWorkspace: [
            { type: "when_run", children: [] }
        ],
        hint: "Use repeat until pig with if path to the left → turn left, followed by move forward."
    }
];

const STUDY_LEVEL_COUNT = LEVELS.filter(level => !level.bonus).length;

if (typeof window !== "undefined") {
    window.TIERS = TIERS;
    window.LEVELS = LEVELS;
}

export { TIERS, LEVELS, STUDY_LEVEL_COUNT };
