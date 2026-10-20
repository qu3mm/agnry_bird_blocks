import React from 'react';
import { TIERS, LEVELS } from '../data/levels';

const TIER_BUTTONS = [
  { id: 'all', label: 'All Puzzles (1–21)' },
  { id: 'easy', label: 'Easy (1–5) - Sequencing' },
  { id: 'medium', label: 'Medium (6–13) - Repeat Loops' },
  { id: 'hard', label: 'Hard (14–20) - If/Then & Nested' }
];

export default function TierBar({ currentTierFilter, onSelectTier, currentLevelIndex }) {
  const currentLevel = LEVELS[currentLevelIndex];
  const tierInfo = currentLevel ? TIERS[currentLevel.tier] : null;

  return (
    <div className="tier-bar">
      <div className="tier-tabs-group" id="tier-tabs-container">
        {TIER_BUTTONS.map((t) => (
          <button
            key={t.id}
            className={`tier-tab-btn ${t.id === currentTierFilter ? 'active' : ''}`}
            onClick={() => onSelectTier(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div style={{ fontSize: '12px', color: '#94a3b8' }}>
        <strong id="current-level-title" style={{ color: '#ffffff' }}>
          {currentLevel ? `${currentLevel.title} (${currentLevel.bonus ? 'Bonus' : tierInfo?.range})` : ''}
        </strong>
      </div>
    </div>
  );
}
