import React from 'react';
import { TIERS, LEVELS } from '../data/levels';

export default function InstructionBanner({ currentLevelIndex, onSpeak }) {
  const level = LEVELS[currentLevelIndex] || LEVELS[0];
  const tierInfo = TIERS[level.tier] || TIERS.easy;

  const birdAvatar = level.tier === 'hard'
    ? '/sprites/bird_bomb.png'
    : level.tier === 'medium'
    ? '/sprites/bird_yellow.png'
    : '/sprites/bird_red.png';

  const missionNum = String(level.id).padStart(2, '0');
  const targetMoves = level.maxBlocks ? level.maxBlocks - 1 : 2;
  const missionTitle = (level.title.replace(/^Puzzle \d+:\s*/i, '') || 'SQUAWK THE BAD PIG').toUpperCase();

  // Format instruction text to display inline code block chips matching the reference
  const renderFormattedInstruction = (rawText) => {
    if (!rawText) return null;

    // Split and highlight keywords
    const parts = rawText.split(/(move forward|when run|turn left|turn right|repeat until|repeat)/gi);

    return parts.map((part, index) => {
      const lower = part.toLowerCase();
      if (lower === 'move forward') {
        return (
          <span key={index} className="inline-block-chip chip-blue">
            ➔ move forward
          </span>
        );
      }
      if (lower === 'when run') {
        return (
          <span key={index} className="inline-block-chip chip-orange">
            ▶ when run
          </span>
        );
      }
      if (lower === 'turn left') {
        return (
          <span key={index} className="inline-block-chip chip-blue">
            ↺ turn left
          </span>
        );
      }
      if (lower === 'turn right') {
        return (
          <span key={index} className="inline-block-chip chip-blue">
            ↻ turn right
          </span>
        );
      }
      if (lower === 'repeat until') {
        return (
          <span key={index} className="inline-block-chip chip-pink">
            🔁 repeat until 🐷
          </span>
        );
      }
      if (lower === 'repeat') {
        return (
          <span key={index} className="inline-block-chip chip-pink">
            🔁 repeat
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <section className="instruction-banner-card">
      {/* Left Avatar with LVL Badge */}
      <div className="instruction-avatar-wrap">
        <div className="avatar-circle">
          <img
            src={birdAvatar}
            alt={tierInfo?.name || 'Angry Bird'}
          />
        </div>
        <div className="avatar-lvl-badge">LVL {level.id}</div>
      </div>

      {/* Middle: Mission Badges & Speech Instruction */}
      <div className="instruction-body">
        <div className="mission-pill-row">
          <span className="pill-badge pill-mission">
            MISSION {missionNum}: {missionTitle}
          </span>
          <span className="pill-badge pill-target">
            🎯 Target: {targetMoves} Moves • {tierInfo.name}
          </span>
          <span className="pill-badge pill-mastery">
            ★ 3-Star Mastery
          </span>
        </div>

        <div className="instruction-message-row">
          <div className="instruction-speech-bubble">
            <p className="instruction-text-styled">
              {renderFormattedInstruction(level.instruction)}
            </p>
          </div>
          <button
            className="btn-banner-action btn-read-aloud"
            id="btn-tts"
            title="Read instructions aloud (Text-to-speech)"
            onClick={onSpeak}
          >
            <span>🔊</span>
            <span>Read Again</span>
          </button>
        </div>
      </div>
    </section>
  );
}
