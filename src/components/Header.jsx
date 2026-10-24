import React, { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { TIERS, LEVELS } from '../data/levels';

export default function Header({
  currentLevelIndex,
  maxUnlockedIndex = 0,
  onSelectLevel,
  isRunning,
  timerSeconds,
  timerTotal,
  onOpenWelcome,
  onOpenLogin,
  onOpenPretest,
  onOpenPosttest,
  onTestCheckin,
  onViewHistory,
  isMuted,
  onToggleSound,
  participantId
}) {
  const currentLevel = LEVELS[currentLevelIndex] || LEVELS[0];
  const tierInfo = TIERS[currentLevel.tier] || TIERS.easy;

  // Active Tier tab for level bubble display (Easy 1-5, Medium 6-13, Hard 14-20)
  const [activeTier, setActiveTier] = useState(currentLevel.tier || 'easy');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Sync tier when level changes
  useEffect(() => {
    if (currentLevel?.tier) {
      setActiveTier(currentLevel.tier);
    }
  }, [currentLevel?.tier]);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const progressPercent = Math.min(100, Math.max(0, ((timerTotal - timerSeconds) / timerTotal) * 100));

  // Filter levels for the active tier so at most 8 bubbles are displayed at once
  const tierLevels = LEVELS.filter((lvl) => lvl.tier === activeTier);

  return (
    <header className="site-header">
      {/* 1. Left: Slingshot Badge, Title & Level Subtitle */}
      <div className="header-left">
        <div
          className="brand-badge-container"
          style={{ cursor: 'pointer' }}
          title="Click to view Angry Bird Blocks welcome banner"
          onClick={onOpenWelcome}
        >
          
          <div className="brand-text-column">
            <div className="brand-title-row">
              <span className="brand-text-gold">ANGRY BIRDS</span>
              <span className="brand-pill-badge">CODE LAB</span>
            </div>
            <div className="brand-subtext">
              Level {currentLevel.id}: {currentLevel.title.replace(/^Puzzle \d+:\s*/, '')} • {tierInfo?.name}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Center: Tier Switcher + Clean Level Bubbles (5 to 8 bubbles max) */}
      <div className="header-center">
        {/* Tier Tabs: Easy, Medium, Hard */}
        {(() => {
          const firstEasy = LEVELS.findIndex((l) => l.tier === 'easy');
          const firstMed = LEVELS.findIndex((l) => l.tier === 'medium');
          const firstHard = LEVELS.findIndex((l) => l.tier === 'hard');
          const isMedLocked = firstMed !== -1 && maxUnlockedIndex < firstMed;
          const isHardLocked = firstHard !== -1 && maxUnlockedIndex < firstHard;

          return (
            <div className="tier-pills-bar">
              <button
                className={`tier-pill-opt ${activeTier === 'easy' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTier('easy');
                  if (firstEasy !== -1 && currentLevel.tier !== 'easy') onSelectLevel(firstEasy);
                }}
              >
                Easy (1-5)
              </button>
              <button
                className={`tier-pill-opt ${activeTier === 'medium' ? 'active' : ''} ${isMedLocked ? 'locked' : ''}`}
                disabled={isMedLocked}
                title={isMedLocked ? '🔒 Locked — Complete all Easy (1–5) puzzles first!' : 'Medium Tier (Puzzles 6–13)'}
                onClick={() => {
                  if (isMedLocked) return;
                  setActiveTier('medium');
                  if (firstMed !== -1 && currentLevel.tier !== 'medium') onSelectLevel(firstMed);
                }}
              >
                {isMedLocked ? '🔒 ' : ''}Medium (6-13)
              </button>
              <button
                className={`tier-pill-opt ${activeTier === 'hard' ? 'active' : ''} ${isHardLocked ? 'locked' : ''}`}
                disabled={isHardLocked}
                title={isHardLocked ? '🔒 Locked — Complete all Medium (6–13) puzzles first!' : 'Hard Tier (Puzzles 14–20)'}
                onClick={() => {
                  if (isHardLocked) return;
                  setActiveTier('hard');
                  if (firstHard !== -1 && currentLevel.tier !== 'hard') onSelectLevel(firstHard);
                }}
              >
                {isHardLocked ? '🔒 ' : ''}Hard (14-20)
              </button>
            </div>
          );
        })()}

        {/* Level navigation */}
        <nav className="level-nav-container" id="level-bubbles" aria-label="Puzzle Navigation">
          {tierLevels.map((lvl) => {
            const levelIndex = LEVELS.indexOf(lvl);
            const isActive = levelIndex === currentLevelIndex;
            const isCompleted = levelIndex < maxUnlockedIndex;
            const isLocked = levelIndex > maxUnlockedIndex;

            return (
              <div key={lvl.id} className="level-bubble-cell">
                <button
                  className={`level-bubble tier-bubble-${lvl.tier} ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
                  disabled={isLocked}
                  title={
                    isLocked
                      ? `🔒 Locked — Solve Puzzle ${lvl.id - 1} first!`
                      : `${lvl.title} (${TIERS[lvl.tier]?.name})`
                  }
                  onClick={() => {
                    if (!isRunning && !isLocked) onSelectLevel(levelIndex);
                  }}
                >
                  {lvl.id}
                </button>
              </div>
            );
          })}
        </nav>
      </div>

      {/* 3. Right: Timer, SFX, Cadet Avatar & Compact Study Menu */}
      <div className="header-right">
        {/* Check-in Timer */}
        <div
          className="timer-pill-container"
          title="Check-in reflection timer"
        >
          <span className="timer-label">⏱️</span>
          <span className="timer-clock" id="timer-display">
            {formatTime(timerSeconds)}
          </span>
          <div className="timer-progress-track">
            <div
              className="timer-progress-fill"
              id="timer-progress-bar"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* SFX Audio Toggle Button */}
        <button
          className={`header-sfx-btn ${isMuted ? 'muted' : 'active'}`}
          id="btn-toggle-sound"
          title="Toggle Angry Birds Sound Effects"
          onClick={onToggleSound}
        >
          <span className="sfx-icon">{isMuted ? '🔇' : '🔊'}</span>
          <span className="sfx-text">{isMuted ? 'SFX OFF' : 'SFX ON'}</span>
        </button>

        {/* Cadet User Profile Pill */}
        <div
          className="cadet-profile-pill"
          title={`Active Player: ${participantId || 'Cadet Red'}`}
        >
          <div className="cadet-avatar-circle">
            <img src="/sprites/bird_red.png" alt="Cadet Avatar" />
          </div>
          <span className="cadet-name">{participantId || 'Cadet Red'}</span>
        </div>

        {/* Study Menu Dropdown (Clean, spacious, uncrowded) */}
        <div className="relative" ref={menuRef}>
          <Badge
            variant="outline"
            render={
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                title="Study Survey & Tools Menu"
              />
            }
            className="bg-[#5a2805] hover:bg-[#78350f] text-[#ffd13b] border-[1.5px] border-[#92400e] font-extrabold text-xs shadow-[0_2px_0_#3e1b04] active:translate-y-0.5 transition cursor-pointer"
          >
            <span>📋</span>
            <span>Menu</span>
            <span className="text-[10px]">{menuOpen ? '▲' : '▼'}</span>
          </Badge>

          {menuOpen && (
            <div className="header-menu-dropdown absolute right-0 top-full mt-1.5 w-48 bg-[#2b1404] border-2 border-[#b45309] rounded-xl shadow-2xl z-50 flex flex-col gap-1 backdrop-blur-md">
              <button
                className="header-menu-item w-full text-left text-xs font-bold text-[#fef08a] hover:bg-[#5a2805] flex items-center gap-2 transition"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenLogin();
                }}
              >
                <span>🔑</span>
                <span>Switch / Login ID</span>
              </button>
              <button
                className="header-menu-item w-full text-left text-xs font-bold text-[#fef08a] hover:bg-[#5a2805] flex items-center gap-2 transition"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenWelcome();
                }}
              >
                <span>🏰</span>
                <span>Welcome Banner</span>
              </button>
              <button
                className="header-menu-item w-full text-left text-xs font-bold text-[#fef08a] hover:bg-[#5a2805] flex items-center gap-2 transition"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenPretest();
                }}
              >
                <span>📝</span>
                <span>Pre-test Survey</span>
              </button>
              <button
                className="header-menu-item w-full text-left text-xs font-bold text-[#fef08a] hover:bg-[#5a2805] flex items-center gap-2 transition"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenPosttest();
                }}
              >
                <span>🏁</span>
                <span>Post-test Survey</span>
              </button>
              <button
                className="header-menu-item w-full text-left text-xs font-bold text-[#fbbf24] hover:bg-[#5a2805] flex items-center gap-2 transition"
                onClick={() => {
                  setMenuOpen(false);
                  onTestCheckin();
                }}
              >
                <span>⚡</span>
                <span>Trigger Check-in</span>
              </button>
              <button
                className="header-menu-item w-full text-left text-xs font-bold text-[#fef08a] hover:bg-[#5a2805] flex items-center gap-2 transition"
                onClick={() => {
                  setMenuOpen(false);
                  onViewHistory();
                }}
              >
                <span>📋</span>
                <span>Check-in History</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
