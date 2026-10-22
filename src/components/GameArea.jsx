import React from 'react';
import { Play, RotateCcw, Sparkles, Code2, ArrowLeftRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LEVELS } from '../data/levels';

export default function GameArea({
  currentLevelIndex = 0,
  mazeContainerRef,
  toolboxRef,
  workspaceRef,
  blockCountRef,
  isRunning,
  onToggleRun,
  onStartOver,
  onShowCode,
  onClean
}) {
  const level = LEVELS[currentLevelIndex] || LEVELS[0];
  const targetMoves = level.maxBlocks ? level.maxBlocks - 1 : 2;

  // Draggable Splitter state between Maze Column and Toolbox Column
  const [mazeWidth, setMazeWidth] = React.useState(480);
  const isDraggingRef = React.useRef(false);

  const handleSplitterMouseDown = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (moveEvent) => {
      if (!isDraggingRef.current) return;
      // Clamp maze width between 260px and 480px
      const newWidth = Math.min(480, Math.max(260, moveEvent.clientX - 16));
      setMazeWidth(newWidth);
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <main className="main-stage-container w-full flex-1 min-h-0 px-4 pb-2 flex flex-col justify-between">
      <div
        className="grid gap-0 h-full items-stretch"
        style={{ gridTemplateColumns: `${mazeWidth}px 20px 310px 1fr` }}
      >
        {/* =========================================================================
            COLUMN 1: PIGGY ISLAND STAGE (MAZE & CONTROLS)
            Matches media_1792389460586_a7c99fea.png
            ========================================================================= */}
        <section className="col-wood-card col-maze flex flex-col h-full rounded-2xl border-4 border-[#3e1b04] bg-[#804212] shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="col-header-bar flex items-center justify-between px-5 py-3 border-b border-[#5a2805] shadow-[0_1px_0_rgba(255,255,255,0.08)] flex-shrink-0">
            <span className="font-black text-[#ffcc00] text-xs sm:text-[13px] tracking-wide uppercase drop-shadow-[0_2px_0_#3e1b04]">
              PIGGY ISLAND: STAGE 1-{level.id}
            </span>
            <Badge variant="outline" className=" inline-flex items-center justify-center text-[10.5px] font-black uppercase tracking-wider leading-none text-[#ffd233] bg-[#3b1a04] px-4 py-1.5 rounded-full border border-[#5a2805] shadow-inner">
              Grid: 8 x 8
            </Badge>
          </div>

          {/* Stage Body */}
          <div className="flex-1 min-h-0 px-4 pt-6 pb-4 flex flex-col items-center gap-3.5 overflow-y-auto">
            {/* Elevated 3D Maze Wrapper with Floating Status */}
            <div className="relative w-full max-w-[440px] aspect-square rounded-xl border-4 border-[#3e1b04] bg-[#234b0e] p-1.5 shadow-[inset_0_2px_6px_rgba(0,0,0,0.5),0_8px_16px_rgba(0,0,0,0.3)] flex-shrink-0 transition-all">
              {/* 8x8 Canvas Mount */}
              <div
                className="w-full h-full rounded-lg overflow-hidden bg-[#5fa721]"
                id="maze-container"
                ref={mazeContainerRef}
              />

              {/* Direction Status Strip Floating over bottom edge of maze */}
              <div className="absolute bottom-2 left-2 right-2 z-10 bg-black/75 backdrop-blur-[1px] text-[#c4e97a] border border-black/40 rounded px-2 py-0.5 text-[10.5px] font-bold text-center shadow-md pointer-events-none">
                Straight Ahead: Move {targetMoves} steps ➔ Smash Pig!
              </div>
            </div>

            {/* Separator Line */}
            <div className="w-full max-w-[440px] border-t-2 border-[#542907] shadow-[0_1px_0_rgba(255,255,255,0.08)] my-1" />

            {/* Controls Group directly below maze */}
            <div className="w-full max-w-[440px] flex flex-col gap-2 flex-shrink-0">
              {/* Lime Green 3D Launch Button */}
              <button
                className={`w-full py-2.5 px-4 rounded-xl font-black text-base uppercase tracking-wider text-white transition-all transform active:translate-y-1 shadow-[0_5px_0_#3b6d05,0_8px_16px_rgba(0,0,0,0.3)] flex items-center justify-center gap-2 cursor-pointer border-2 ${
                  isRunning
                    ? 'bg-gradient-to-b from-[#ef4444] to-[#b91c1c] border-[#f87171] shadow-[0_5px_0_#7f1d1d,0_8px_16px_rgba(0,0,0,0.3)] hover:brightness-110'
                    : 'bg-gradient-to-b from-[#9ae61e] via-[#76c011] to-[#5ba409] border-[#b7f43b] hover:brightness-110 hover:-translate-y-0.5'
                }`}
                id="btn-run"
                onClick={onToggleRun}
              >
                {isRunning ? (
                  <>
                    <RotateCcw className="w-5 h-5 animate-spin" />
                    <span>RESET</span>
                  </>
                ) : (
                  <>
                    <span className="text-xl leading-none">🚀</span>
                    <span className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] h-10 flex items-center">LAUNCH & RUN</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SPLITTER / RESIZE HANDLE
            ========================================================================= */}
        <div
          className="col-resize-splitter flex items-center justify-center cursor-col-resize select-none group h-full"
          onMouseDown={handleSplitterMouseDown}
          title="Drag left/right to adjust panel size"
        >
          <div className="flex h-9 w-5 items-center justify-center rounded-full border border-[#d6a74a] bg-[#fff4c2] text-[#78350f] shadow-sm transition group-hover:bg-[#ffd13b]">
            <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden="true" />
          </div>
        </div>

        {/* =========================================================================
            COLUMN 2: BLOCK TOOLBOX (CATEGORIZED TILES)
            ========================================================================= */}
        <section className="col-wood-card col-toolbox flex flex-col h-full rounded-2xl border-4 border-[#3e1b04] bg-[#804212] shadow-2xl overflow-hidden">
          <div className="col-header-bar flex items-center justify-between px-5 py-3 border-b border-[#5a2805] shadow-[0_1px_0_rgba(255,255,255,0.08)] flex-shrink-0">
            <span className="font-black text-[#ffcc00] text-xs sm:text-[13px] tracking-wide uppercase drop-shadow-[0_2px_0_#3e1b04] flex items-center gap-1.5 whitespace-nowrap">
              <span>☘</span> BLOCK TOOLBOX
            </span>
            <Badge variant="outline" className="h-auto border-[#86efac] bg-[#15803d] px-5 py-2 text-[10px] font-black uppercase leading-none tracking-wider text-[#dcfce7] shadow-sm hover:bg-[#15803d]">
              CODE BLOCKS
            </Badge>
          </div>

          <div className="flex-1 min-h-0 p-5 sm:p-6 flex flex-col justify-between bg-[#fbf8f2] m-3 sm:m-3.5 rounded-xl border-2 border-[#542907] overflow-hidden">
            <div
              className="toolbox-blocks-container flex-1 overflow-x-hidden overflow-y-auto px-2 py-2 flex flex-col gap-3.5 w-full"
              id="toolbox-blocks"
              ref={toolboxRef}
            >
              {/* Inserted dynamically */}
            </div>

            <div className="mt-2 pt-2 border-t-2 border-dashed border-[#e2d0ba] text-center text-[13px] font-bold text-[#854d0e] bg-[#fefce8] py-1.5 px-2 rounded-lg border border-[#fef08a] flex-shrink-0">
              💡 Drag blocks into the canvas!
            </div>
          </div>
        </section>

        {/* =========================================================================
            COLUMN 3: WORKSPACE CANVAS & NOTCHES
            ========================================================================= */}
        <section className="col-wood-card col-workspace flex flex-col h-full rounded-2xl border-4 border-[#3e1b04] bg-[#804212] shadow-2xl overflow-hidden">
          <div className="col-header-bar flex items-center justify-between px-5 py-3 border-b border-[#5a2805] shadow-[0_1px_0_rgba(255,255,255,0.08)] flex-shrink-0">
            <span
              className="font-black text-[#ffcc00] text-xs sm:text-[13px] tracking-wide uppercase drop-shadow-[0_2px_0_#3e1b04] flex items-center gap-1.5"
              id="workspace-block-count"
              ref={blockCountRef}
            >
              WORKSPACE: 3/3 BLOCKS ★ OPTIMAL
            </span>

            <div className="flex items-center gap-2">
              <button
                className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3.5 py-1.5 bg-gradient-to-b from-[#f59e0b] to-[#d97706] hover:from-[#fbbf24] hover:to-[#f59e0b] text-[#3e1b04] border-2 border-[#b45309] rounded-full font-black text-[11px] uppercase tracking-wide leading-none shadow-[0_2.5px_0_#78350f] active:translate-y-0.5 transition cursor-pointer"
                onClick={onClean}
                title="Tidy workspace"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#78350f] flex-shrink-0" />
                <span>Clean</span>
              </button>
              <button
                className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3.5 py-1.5 bg-gradient-to-b from-[#f59e0b] to-[#d97706] hover:from-[#fbbf24] hover:to-[#f59e0b] text-[#3e1b04] border-2 border-[#b45309] rounded-full font-black text-[11px] uppercase tracking-wide leading-none shadow-[0_2.5px_0_#78350f] active:translate-y-0.5 transition cursor-pointer"
                id="btn-start-over"
                onClick={onStartOver}
                title="Reset workspace"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#991b1b] shrink-0" />
                <span>Start Over</span>
              </button>
              <button
                className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3.5 py-1.5 bg-gradient-to-b from-[#f59e0b] to-[#d97706] hover:from-[#fbbf24] hover:to-[#f59e0b] text-[#3e1b04] border-2 border-[#b45309] rounded-full font-black text-[11px] uppercase tracking-wide leading-none shadow-[0_2.5px_0_#78350f] active:translate-y-0.5 transition cursor-pointer"
                id="btn-show-code"
                onClick={onShowCode}
                title="View code"
              >
                <Code2 className="w-3.5 h-3.5 text-[#1e3a8a] flex-shrink-0" />
                <span>Code</span>
              </button>
            </div>
          </div>

          <div
            className="workspace-canvas flex-1 min-h-0 relative overflow-auto p-4 m-2 rounded-xl border-2 border-[#542907] bg-[#fcf4e4]"
            id="workspace-canvas"
            ref={workspaceRef}
          >
            {/* Trash Zone Bottom Right */}
            <div
              className="trash-zone"
              id="workspace-trash"
              title="Drag blocks here to remove"
            >
              <span className="trash-icon text-lg">🗑️</span>
              <div className="trash-text flex flex-col leading-none">
                <span className="trash-title font-black text-[11px] text-[#fef08a] uppercase tracking-wider">
                  TRASH BIN
                </span>
                <span className="trash-subtitle text-[9px] text-[#fde68a]/80 font-bold">
                  Drop to remove
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Bottom Wood Footer Strip matching the screenshot */}
      
    </main>
  );
}
