# Hour of Code: Classic Maze - 20 Puzzles & 3 Difficulty Tiers

An interactive visual block-coding game inspired by **Code.org Hour of Code: Classic Maze** (`https://studio.code.org/hoc/1`) with a **built-in 5-Minute Student Check-in Form** that prompts students to reflect on their learning at regular intervals.

---

## 🎯 Proposed Difficulty Tiers (20 Puzzles)

The game is structured according to the proposed difficulty progression:

| Tier | Proposed Puzzles | Concepts Involved | Blocks Introduced |
| :--- | :--- | :--- | :--- |
| **Easy (E)** | **Puzzles 1–5** | Sequencing and simple turns | `when run`, `move forward`, `turn left ↺`, `turn right ↻` |
| **Medium (M)** | **Puzzles 6–13** | Repeat loops | `repeat [N] times do`, `repeat until 🐷 do` |
| **Hard (H)** | **Puzzles 14–20** | Nested loops and if/then conditions | `if path [ahead / left / right] do`, `if / else`, nested loops |

---

## 🌟 Key Features

### 1. Authentic Blockly C-Blocks & Loops
- **Pink Repeat Blocks**:
  - `repeat [N] times do`: Configurable repeat counter (2 to 10) with an indented body slot.
  - `repeat until 🐷 do`: Repeats inner actions until the bird reaches the target pig.
- **Teal / Navy Condition Blocks**:
  - `if path [ahead / to the left ↺ / to the right ↻] do`: Senses obstacles and wall boundaries in real time.
  - `if ... do ... else ...`: Dynamic branching when encountering turns.
- **Nested Loops**:
  - Supports nesting loops within loops (`repeat` inside `repeat`), or conditions inside loops.

### 2. 20 Progressive Puzzles
- **Easy (1–5)**:
  - 1: First Steps (2 steps forward)
  - 2: Three Steps Forward (3 steps)
  - 3: Taking a Turn (Navigate corner)
  - 4: Zigzag Path (Turns and stepping)
  - 5: The Stone Corridor (Multi-turn corridor)
- **Medium (6–13)**:
  - 6: Intro to Repeat Loops (Compressing 5 steps into 1 loop)
  - 7: The Staircase Loop (Pattern repeating 3 times)
  - 8: Repeat Until Pig (Dynamic distance until target)
  - 9: The Castle Perimeter (Navigating square sides with repeat)
  - 10: U-Turn Run (Long winding paths with repeat)
  - 11: Spiral Step (Inward spiral maze)
  - 12: TNT Trench (Navigating flanked explosive crates)
  - 13: Zigzag Repeat Challenge (Alternating turns loop)
- **Hard (14–20)**:
  - 14: Intro to If (Testing `if path to the left` inside `repeat until pig`)
  - 15: If Path to the Right (Right-hand sensor navigation)
  - 16: Dynamic Winding Maze (Handling variable corner lengths)
  - 17: Nested Loops (Loop inside a loop)
  - 18: If-Else Wall Sensor (Automated obstacle collision avoidance)
  - 19: The Great Labyrinth (Multi-conditional pathfinding)
  - 20: Master Coder Finale (Nested loops and dynamic sensing castle)

### 3. 5-Minute Student Pulse Check-in System
- Persistent top-bar timer (`⏱️ Check-in: 05:00`).
- Automatically pauses the game when the timer expires.
- 4 reflection sections:
  1. **Emotion / Sentiment Check** (🤩 Confident, 😊 Doing Good, 🤔 Thinking Hard, 🤯 A Bit Stuck).
  2. **Concept Selection** (Sequencing, Repeat Loops, Nested Loops, If/Then Conditions, Debugging).
  3. **Tier-Adaptive Comprehension Question**: Dynamically tests questions relevant to the current difficulty tier (e.g. why loops are used, how if-conditions evaluate).
  4. **Self-Reflection Notes**: Open input for students to log breakthroughs or obstacles.
- **`⚡ Test Check-in`** button for instant testing without waiting 5 minutes.
- **`📋 History`** viewer displaying saved submissions in `localStorage`.

---

## 🚀 Running the Game

### Development Server (Vite + React):
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build:
```bash
npm run build
npm run preview
```

### shadcn/ui Components:
This project is initialized with shadcn/ui and Tailwind CSS v4. Add components as needed:
```bash
npx shadcn@latest add button
```
