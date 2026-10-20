import React, { useState, useEffect } from 'react';
import { TIERS, LEVELS } from '../data/levels';

const DEEPFACE_EMOTIONS = [
  { label: 'Happy', emoji: '😊', category: 'Satisfaction / positive' },
  { label: 'Neutral', emoji: '😐', category: 'Neutral' },
  { label: 'Surprise', emoji: '😲', category: 'Satisfaction / positive' },
  { label: 'Sad', emoji: '😢', category: 'Frustration / stress' },
  { label: 'Angry', emoji: '😠', category: 'Frustration / stress' },
  { label: 'Fear', emoji: '😨', category: 'Frustration / stress' },
  { label: 'Disgust', emoji: '🤢', category: 'Frustration / stress' }
];

function getFlowState(challenge, confidence) {
  const balance = challenge - confidence;
  if (balance >= 1) return { balance, state: 'Anxiety / Frustration', color: '#e11d48' };
  if (balance <= -1) return { balance, state: 'Boredom', color: '#64748b' };
  if (challenge >= 4 && confidence >= 4) return { balance, state: 'Flow / Engagement', color: '#16a34a' };
  if (challenge <= 2 && confidence <= 2) return { balance, state: 'Apathy', color: '#94a3b8' };
  return { balance, state: 'Balanced', color: '#0284c7' };
}

export default function Modals({
  currentLevelIndex,
  participantId: currentParticipantId,
  // Welcome banner modal
  welcomeOpen,
  onCloseWelcome,
  onStartFromWelcome,
  onOpenPretestFromWelcome,
  onSetParticipantId,
  // Pre-test survey modal
  pretestOpen,
  onClosePretest,
  onSubmitPretest,
  // Check-in modal
  checkinOpen,
  checkinWindow = 1,
  onCloseCheckin,
  onSubmitCheckin,
  timerMode,
  onChangeTimerMode,
  // Post-test modal
  posttestOpen,
  onClosePosttest,
  onSubmitPosttest,
  // Certificate modal
  certOpen,
  onCloseCert,
  // Win modal
  winOpen,
  winBlockCount,
  winJsCode,
  onReplay,
  onNextLevel,
  // Feedback modal
  feedback,
  onCloseFeedback,
  // Code modal
  codeModalOpen,
  codeContent,
  onCloseCodeModal,
  // Hint modal
  hintModalOpen,
  onCloseHintModal,
  // History modal
  historyModalOpen,
  onCloseHistoryModal,
  historyData
}) {
  const currentLevel = LEVELS[currentLevelIndex] || LEVELS[0];
  const tierKey = currentLevel.tier || 'easy';
  const tierInfo = TIERS[tierKey];

  // Pre-test survey local state — mirrors the CS413.2 Google Form (Appendix B1)
  const [pretestPage, setPretestPage] = useState(0); // 0=About You, 1=Feelings, 2=Expectations
  const [consentChecked, setConsentChecked] = useState(false);
  const [participantId, setParticipantId] = useState(currentParticipantId || '');
  const [programmingSkill, setProgrammingSkill] = useState(null);   // 1-5
  const [experienceLevel, setExperienceLevel] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState('');
  const [blockExperience, setBlockExperience] = useState('');
  const [valence, setValence] = useState(null);                     // 1-5 pleasant
  const [arousal, setArousal] = useState(null);                     // 1-5 energized
  const [pretestConfidence, setPretestConfidence] = useState(null); // 1-5
  const [difficultyExpect, setDifficultyExpect] = useState(null);   // 1-5

  // Reset to page 0 each time the modal opens
  useEffect(() => {
    if (pretestOpen) setPretestPage(0);
    if (currentParticipantId) setParticipantId(currentParticipantId);
  }, [pretestOpen, currentParticipantId]);

  const page0Valid = consentChecked && participantId.trim() &&
    programmingSkill && experienceLevel && hoursPerWeek && blockExperience;
  const page1Valid = valence && arousal;
  const page2Valid = pretestConfidence && difficultyExpect;

  const handlePretestFormSubmit = (e) => {
    e.preventDefault();
    if (!page2Valid) return;
    if (onSubmitPretest) {
      onSubmitPretest({
        participantId: participantId.trim().toUpperCase(),
        programmingSkill,
        experienceLevel,
        hoursPerWeek,
        blockExperience,
        valence,
        arousal,
        pretestConfidence,
        difficultyExpect,
        submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }
  };

  // Scale widget: 1–5 radio buttons with low/high labels
  const Scale = ({ name, value, onChange, lowLabel, highLabel }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
        <span>{lowLabel}</span><span>{highLabel}</span>
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        {[1,2,3,4,5].map(n => (
          <label key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer' }}>
            <input
              type="radio" name={name} value={n}
              checked={value === n}
              onChange={() => onChange(n)}
              style={{ accentColor: '#e63232', width: '18px', height: '18px' }}
            />
            <span style={{ fontSize: '12px', fontWeight: 600, color: value === n ? '#b91c1c' : '#94a3b8' }}>{n}</span>
          </label>
        ))}
      </div>
    </div>
  );

  // Radio group helper
  const RadioGroup = ({ name, options, value, onChange }) => (
    <div className="quiz-options-group">
      {options.map((opt) => (
        <label key={opt} className="quiz-option-item">
          <input type="radio" name={name} checked={value === opt} onChange={() => onChange(opt)} />
          <span>{opt}</span>
        </label>
      ))}
    </div>
  );

  // Check-in Form Local State (Appendix B2: Participant ID, Check-in #, Emotion, Challenge, Confidence)
  const [checkinId, setCheckinId] = useState(currentParticipantId || '');
  const [checkinEmotion, setCheckinEmotion] = useState('');
  const [checkinChallenge, setCheckinChallenge] = useState(null);
  const [checkinConfidence, setCheckinConfidence] = useState(null);

  useEffect(() => {
    if (checkinOpen) {
      setCheckinId(currentParticipantId || participantId || 'P01');
      setCheckinEmotion('');
      setCheckinChallenge(null);
      setCheckinConfidence(null);
    }
  }, [checkinOpen, currentParticipantId, participantId]);

  const isCheckinValid = checkinId.trim() && checkinEmotion && checkinChallenge && checkinConfidence;

  const handleCheckinSubmit = (e) => {
    e.preventDefault();
    if (!isCheckinValid) return;

    const flow = getFlowState(checkinChallenge, checkinConfidence);
    const emotionObj = DEEPFACE_EMOTIONS.find(e => e.label === checkinEmotion);

    onSubmitCheckin({
      participantId: checkinId.trim().toUpperCase(),
      window: checkinWindow,
      emotion: checkinEmotion,
      emotionCategory: emotionObj?.category || 'Neutral',
      challenge: checkinChallenge,
      confidence: checkinConfidence,
      balance: flow.balance,
      flowState: flow.state,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      levelId: currentLevel.id,
      tier: tierInfo?.name || tierKey
    });
  };

  // Post-test Survey Local State (Appendix B3)
  const [postParticipantId, setPostParticipantId] = useState(currentParticipantId || '');
  const [postFeeling, setPostFeeling] = useState('');
  const [postDifficulty, setPostDifficulty] = useState(null);
  const [postConfidence, setPostConfidence] = useState(null);
  const [postPerformance, setPostPerformance] = useState(null);
  const [postEngagement, setPostEngagement] = useState(null);
  const [postRecordingComfort, setPostRecordingComfort] = useState(null);
  const [postComments, setPostComments] = useState('');

  useEffect(() => {
    if (posttestOpen) {
      setPostParticipantId(currentParticipantId || participantId || 'P01');
    }
  }, [posttestOpen, currentParticipantId, participantId]);

  const isPosttestValid = postParticipantId.trim() && postFeeling && postDifficulty &&
    postConfidence && postPerformance && postEngagement && postRecordingComfort;

  const handlePosttestSubmit = (e) => {
    e.preventDefault();
    if (!isPosttestValid) return;

    if (onSubmitPosttest) {
      onSubmitPosttest({
        participantId: postParticipantId.trim().toUpperCase(),
        dominantEmotion: postFeeling,
        overallDifficulty: postDifficulty,
        futureConfidence: postConfidence,
        perceivedPerformance: postPerformance,
        engagementLevel: postEngagement,
        recordingComfort: postRecordingComfort,
        comments: postComments.trim(),
        submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }
  };

  return (
    <>
      {/* 00. Game Welcome Banner Modal */}
      {welcomeOpen && (
        <div className="modal-overlay modal-active" role="dialog" aria-modal="true">
          <div className="modal-card welcome-modal-card" style={{ maxWidth: '640px', width: '92%', overflow: 'hidden', padding: 0 }}>
            {/* Banner Hero Art */}
            <div style={{
              background: 'linear-gradient(180deg, #5fc3e4 0%, #e55d87 100%)',
              position: 'relative',
              padding: '24px 20px 18px',
              textAlign: 'center',
              overflow: 'hidden'
            }}>
              {/* Sky and clouds overlay */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(180deg, #87ceeb 0%, #b0d4f1 55%, #76c043 100%)',
                zIndex: 0
              }} />
              {/* Ground hills */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '32px',
                background: '#4d8c24', borderTop: '4px solid #33691e', zIndex: 1
              }} />

              {/* Character Lineup */}
              <div style={{
                display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
                gap: '8px', position: 'relative', zIndex: 2, marginBottom: '8px'
              }}>
                <img src="/sprites/slingshot.png" alt="Slingshot" style={{ width: '42px', height: '76px', objectFit: 'contain', filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.35))' }} />
                <img src="/sprites/bird_red.png" alt="Red Bird" style={{ width: '64px', height: '64px', objectFit: 'contain', filter: 'drop-shadow(2px 5px 8px rgba(0,0,0,0.4))', animation: 'birdBob 1.2s ease-in-out infinite alternate' }} />
                <img src="/sprites/bird_yellow.png" alt="Chuck" style={{ width: '56px', height: '56px', objectFit: 'contain', filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.35))', marginBottom: '2px' }} />
                <img src="/sprites/bird_bomb.png" alt="Bomb" style={{ width: '60px', height: '60px', objectFit: 'contain', filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.35))' }} />
                <img src="/sprites/pig_minion.png" alt="Minion Pig" style={{ width: '52px', height: '52px', objectFit: 'contain', filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.35))', marginLeft: '8px' }} />
                <img src="/sprites/pig_helmet.png" alt="Helmet Pig" style={{ width: '54px', height: '54px', objectFit: 'contain', filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.35))' }} />
                <img src="/sprites/pig_mustache.png" alt="Foreman Pig" style={{ width: '56px', height: '56px', objectFit: 'contain', filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.35))' }} />
              </div>

              {/* Title Badge */}
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{
                  display: 'inline-block',
                  background: 'linear-gradient(180deg, #ffe066 0%, #f5a623 100%)',
                  padding: '6px 22px',
                  borderRadius: '24px',
                  boxShadow: '0 4px 0 #b45309, 0 6px 16px rgba(0,0,0,0.4)',
                  border: '2px solid #fff'
                }}>
                  <h2 style={{
                    margin: 0,
                    fontSize: '26px',
                    fontWeight: 900,
                    color: '#78350f',
                    textShadow: '0 1px 0 #fff',
                    letterSpacing: '1px',
                    textTransform: 'uppercase'
                  }}>
                    Angry Bird Blocks
                  </h2>
                </div>
                <div style={{
                  marginTop: '2px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  color: '#ffffff',
                  textShadow: '0 2px 4px rgba(0,0,0,0.7)',
                  letterSpacing: '0.5px'
                }}>
                  CS413 Study · Code.org Classic Maze Adventure
                </div>
              </div>

              {onCloseWelcome && (
                <button
                  type="button"
                  onClick={onCloseWelcome}
                  style={{
                    position: 'absolute', top: '10px', right: '12px', zIndex: 4,
                    background: 'rgba(0,0,0,0.35)', color: '#fff', border: 'none',
                    borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer',
                    fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                  title="Close Welcome Banner"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Banner Body Content */}
            <div style={{ padding: '18px 22px 22px', background: '#fff' }}>
              <p style={{
                textAlign: 'center',
                fontSize: '13.5px',
                color: '#475569',
                margin: '0 0 14px 0',
                lineHeight: '1.5'
              }}>
                Welcome to <strong>Angry Bird Blocks</strong>! Help the flock retrieve their eggs by programming their journey through <strong>20 progressive maze puzzles</strong> and one bonus challenge using visual code blocks.
              </p>

              {/* 3 Tier Feature Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                marginBottom: '16px'
              }}>
                <div style={{
                  background: '#f0fdf4',
                  border: '1.5px solid #86efac',
                  borderRadius: '12px',
                  padding: '8px 6px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '16px', marginBottom: '2px' }}>🌱 Levels 1–5</div>
                  <div style={{ fontWeight: 800, color: '#166534', fontSize: '11.5px' }}>Easy: Sequences</div>
                  <div style={{ fontSize: '11px', color: '#15803d', marginTop: '2px' }}>Red Bird vs Minion</div>
                </div>

                <div style={{
                  background: '#fefce8',
                  border: '1.5px solid #fde047',
                  borderRadius: '12px',
                  padding: '8px 6px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '16px', marginBottom: '2px' }}>⚡ Levels 6–13</div>
                  <div style={{ fontWeight: 800, color: '#854d0e', fontSize: '11.5px' }}>Medium: Loops</div>
                  <div style={{ fontSize: '11px', color: '#a16207', marginTop: '2px' }}>Chuck vs Helmet Pig</div>
                </div>

                <div style={{
                  background: '#fef2f2',
                  border: '1.5px solid #fca5a5',
                  borderRadius: '12px',
                  padding: '8px 6px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '16px', marginBottom: '2px' }}>💣 Levels 14–20</div>
                  <div style={{ fontWeight: 800, color: '#991b1b', fontSize: '11.5px' }}>Hard: If / Else</div>
                  <div style={{ fontSize: '11px', color: '#b91c1c', marginTop: '2px' }}>Bomb vs Foreman Pig</div>
                </div>
              </div>

              {/* Quick instructions / tips */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '9px 12px',
                marginBottom: '16px',
                fontSize: '12px',
                color: '#334155',
                lineHeight: '1.5'
              }}>
                <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '3px' }}>💡 Quick Tips:</div>
                <ul style={{ margin: 0, paddingLeft: '16px' }}>
                  <li>Snap blocks under <code>when run</code>, then hit <strong>Run</strong>.</li>
                  <li>Drag unwanted blocks to the <strong>🗑️ Trash Bin</strong> or toolbox to delete.</li>
                  <li>Every 5 minutes, an interactive check-in will prompt for reflection.</li>
                </ul>
              </div>

              {/* Participant ID Display (Locked / Authenticated) */}
              <div style={{
                background: '#fef3c7',
                border: '2px solid #f59e0b',
                borderRadius: '12px',
                padding: '10px 14px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#92400e', textTransform: 'uppercase' }}>
                    Authenticated Participant
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: '#78350f' }}>
                    🆔 {currentParticipantId || 'P01'}
                  </div>
                </div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#15803d',
                  background: '#dcfce7',
                  border: '1px solid #86efac',
                  padding: '4px 10px',
                  borderRadius: '9999px'
                }}>
                  ✓ Verified
                </span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ flex: 1, padding: '11px 16px', fontSize: '13.5px', fontWeight: 800 }}
                  onClick={onOpenPretestFromWelcome}
                >
                  📝 Pre-test Survey
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ flex: 1.5, padding: '11px 22px', fontSize: '15.5px', fontWeight: 900 }}
                  onClick={onStartFromWelcome}
                >
                  🎯 Sling into Action! ▶
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 0. Pre-Test Survey Modal */}
      {pretestOpen && (
        <div className="modal-overlay modal-active" role="dialog" aria-modal="true">
          <div className="modal-card" style={{ maxWidth: '600px' }}>
            <div className="modal-header pretest-header" style={{
              background: 'linear-gradient(135deg, #c0392b, #e74c3c, #f39c12)',
              padding: '20px 24px 16px',
              textAlign: 'center',
              flexDirection: 'column',
              gap: '6px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Sky background clouds */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #87ceeb 0%, #b0d4f1 100%)', zIndex: 0 }} />
              {/* Ground strip */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '28px', background: '#5ab82e', borderTop: '3px solid #3d8c1c', zIndex: 1 }} />
              {/* Characters row */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '8px', position: 'relative', zIndex: 2, marginBottom: '6px' }}>
                <img src="/sprites/slingshot.png" alt="Slingshot" style={{ width: '42px', height: '76px', objectFit: 'contain', filter: 'drop-shadow(2px 4px 4px rgba(0,0,0,0.3))' }} />
                <img src="/sprites/bird_red.png" alt="Red Bird" style={{ width: '56px', height: '56px', objectFit: 'contain', filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.4))', animation: 'birdBob 1.2s ease-in-out infinite alternate' }} />
                <img src="/sprites/bird_yellow.png" alt="Yellow Bird" style={{ width: '48px', height: '48px', objectFit: 'contain', filter: 'drop-shadow(2px 4px 4px rgba(0,0,0,0.3))', marginBottom: '2px' }} />
                <img src="/sprites/bird_bomb.png" alt="Bomb Bird" style={{ width: '52px', height: '52px', objectFit: 'contain', filter: 'drop-shadow(2px 4px 4px rgba(0,0,0,0.3))' }} />
                <img src="/sprites/pig_helmet.png" alt="Helmet Pig" style={{ width: '50px', height: '50px', objectFit: 'contain', filter: 'drop-shadow(2px 4px 4px rgba(0,0,0,0.3))', marginLeft: '10px' }} />
                <img src="/sprites/pig_mustache.png" alt="Foreman Pig" style={{ width: '52px', height: '52px', objectFit: 'contain', filter: 'drop-shadow(2px 4px 4px rgba(0,0,0,0.3))' }} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.4)', position: 'relative', zIndex: 2, margin: 0 }}>
                Ready to Launch? 🚀
                <span style={{ display: 'block', fontSize: '12px', fontWeight: 600, opacity: 0.9, marginTop: '2px' }}>
                  Answer a few questions before you sling into action!
                </span>
              </h3>
              {onClosePretest && (
                <button
                  type="button"
                  onClick={onClosePretest}
                  style={{
                    position: 'absolute', top: '10px', right: '12px', zIndex: 3,
                    background: 'rgba(255,255,255,0.25)',
                    border: '1px solid rgba(255,255,255,0.4)',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    borderRadius: '20px',
                    padding: '3px 10px'
                  }}
                  title="Skip survey"
                >
                  Skip ✕
                </button>
              )}
            </div>
            <form onSubmit={handlePretestFormSubmit}>
              {/* Page indicator */}
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', padding: '12px 24px 0' }}>
                {['About You', 'How You Feel', 'Expectations'].map((label, i) => (
                  <div key={i} style={{
                    flex: 1, height: '4px', borderRadius: '4px',
                    background: i <= pretestPage ? '#7c3aed' : '#e2e8f0',
                    transition: 'background 0.3s'
                  }} title={label} />
                ))}
              </div>

              <div className="modal-body" style={{ maxHeight: '460px', overflowY: 'auto' }}>

                {/* ── Page 0: About You ── */}
                {pretestPage === 0 && (<>
                  <p className="checkin-intro" style={{ background: '#f5f3ff', borderRadius: '12px', padding: '10px 14px', borderLeft: '4px solid #7c3aed', marginBottom: '16px' }}>
                    Thank you for taking part in our study on emotional engagement during gameplay.
                    This short form records your coding background. There are no right or wrong answers.<br/>
                    <strong>Do NOT write your full name</strong> — use the Participant ID on your card (e.g. P07).
                  </p>

                  {/* Consent */}
                  <div className="form-section">
                    <label className="quiz-option-item" style={{ fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={consentChecked}
                        onChange={e => setConsentChecked(e.target.checked)}
                        style={{ accentColor: '#7c3aed', width: '16px', height: '16px' }}
                      />
                      <span>I have read and signed the Informed Consent Form. <span style={{ color: '#e11d48' }}>*</span></span>
                    </label>
                  </div>

                  {/* Authenticated Participant Badge */}
                  <div style={{
                    background: '#f0fdf4',
                    border: '1.5px solid #86efac',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ fontSize: '12px', color: '#166534', fontWeight: 700 }}>
                      Logged in Participant:
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 900, color: '#15803d', background: '#dcfce7', padding: '2px 10px', borderRadius: '6px' }}>
                      🆔 {participantId || currentParticipantId || 'P01'}
                    </span>
                  </div>

                  {/* Q2: Programming skill scale */}
                  <div className="form-section">
                    <div className="form-section-title">
                      <span>2.</span> How would you rate your overall programming skill? <span style={{ color: '#e11d48' }}>*</span>
                    </div>
                    <Scale name="pt_skill" value={programmingSkill} onChange={setProgrammingSkill}
                      lowLabel="Very low" highLabel="Very high" />
                  </div>

                  {/* Q3: Experience level */}
                  <div className="form-section">
                    <div className="form-section-title">
                      <span>3.</span> Which programming experience level describes you best? <span style={{ color: '#e11d48' }}>*</span>
                    </div>
                    <RadioGroup name="pt_exp_level"
                      options={['Beginner', 'Intermediate', 'Advanced', 'Expert']}
                      value={experienceLevel} onChange={setExperienceLevel} />
                  </div>

                  {/* Q4: Hours per week */}
                  <div className="form-section">
                    <div className="form-section-title">
                      <span>4.</span> Approximately how many hours per week do you spend programming? <span style={{ color: '#e11d48' }}>*</span>
                    </div>
                    <RadioGroup name="pt_hours"
                      options={['I do not currently program','Less than 1 hour','1–5 hours','6–10 hours','More than 10 hours']}
                      value={hoursPerWeek} onChange={setHoursPerWeek} />
                  </div>

                  {/* Q5: Block-based experience */}
                  <div className="form-section">
                    <div className="form-section-title">
                      <span>5.</span> How much experience do you have with block-based coding? <span style={{ color: '#e11d48' }}>*</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '-4px 0 8px' }}>
                      Examples: Scratch, Code.org, Blockly, Lightbot.
                    </p>
                    <RadioGroup name="pt_block"
                      options={['No experience','Less than 1 month','1–6 months','7–12 months','More than 1 year']}
                      value={blockExperience} onChange={setBlockExperience} />
                  </div>
                </>)}

                {/* ── Page 1: How You Feel Right Now ── */}
                {pretestPage === 1 && (<>
                  <p className="checkin-intro" style={{ background: '#f0fdf4', borderRadius: '12px', padding: '10px 14px', borderLeft: '4px solid #16a34a', marginBottom: '16px' }}>
                    Think about how you feel <strong>at this very moment</strong>, before starting the game.
                  </p>

                  {/* Q6: Valence */}
                  <div className="form-section">
                    <div className="form-section-title">
                      <span>6.</span> Right now, how pleasant or unpleasant do you feel? <span style={{ color: '#e11d48' }}>*</span>
                    </div>
                    <Scale name="pt_valence" value={valence} onChange={setValence}
                      lowLabel="Very unpleasant" highLabel="Very pleasant" />
                  </div>

                  {/* Q7: Arousal */}
                  <div className="form-section">
                    <div className="form-section-title">
                      <span>7.</span> Right now, how calm or energized do you feel? <span style={{ color: '#e11d48' }}>*</span>
                    </div>
                    <Scale name="pt_arousal" value={arousal} onChange={setArousal}
                      lowLabel="Very calm" highLabel="Very energized" />
                  </div>
                </>)}

                {/* ── Page 2: Expectations ── */}
                {pretestPage === 2 && (<>
                  <p className="checkin-intro" style={{ background: '#fff7ed', borderRadius: '12px', padding: '10px 14px', borderLeft: '4px solid #ea580c', marginBottom: '16px' }}>
                    Tell us what you expect from today's puzzles.
                  </p>

                  {/* Q8: Confidence */}
                  <div className="form-section">
                    <div className="form-section-title">
                      <span>8.</span> How confident are you that you could solve a puzzle you have never seen before? <span style={{ color: '#e11d48' }}>*</span>
                    </div>
                    <Scale name="pt_confidence" value={pretestConfidence} onChange={setPretestConfidence}
                      lowLabel="Not at all confident" highLabel="Completely confident" />
                  </div>

                  {/* Q9: Difficulty expectation */}
                  <div className="form-section">
                    <div className="form-section-title">
                      <span>9.</span> How difficult do you expect today's puzzles to be? <span style={{ color: '#e11d48' }}>*</span>
                    </div>
                    <Scale name="pt_difficulty" value={difficultyExpect} onChange={setDifficultyExpect}
                      lowLabel="Very easy" highLabel="Very difficult" />
                  </div>
                </>)}

              </div>

              <div className="modal-footer" style={{ display: 'flex', gap: '10px' }}>
                {pretestPage > 0 && (
                  <button type="button" className="btn-secondary" onClick={() => setPretestPage(p => p - 1)}>
                    ← Back
                  </button>
                )}
                {pretestPage < 2 ? (
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ flex: 1 }}
                    disabled={pretestPage === 0 ? !page0Valid : !page1Valid}
                    onClick={() => setPretestPage(p => p + 1)}
                  >
                    Next →
                  </button>
                ) : (
                  <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={!page2Valid}>
                    Submit &amp; Start Playing 🚀
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1. In-Game 5-Minute Student Check-in Modal (Appendix B2) */}
      {checkinOpen && (
        <div className="modal-overlay checkin-modal modal-active" role="dialog" aria-modal="true">
          <div className="modal-card" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h3>
                <span>⏰</span> Check-in #{checkinWindow} of 6
              </h3>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>
                Interval:{' '}
                <select
                  value={timerMode}
                  onChange={(e) => onChangeTimerMode(e.target.value)}
                  style={{
                    background: '#1e293b',
                    color: '#fff',
                    border: '1px solid #475569',
                    borderRadius: '4px',
                    padding: '2px 4px',
                    fontSize: '12px'
                  }}
                >
                  <option value="normal">5 Minutes (Standard)</option>
                  <option value="demo">15 Seconds (Demo)</option>
                </select>
              </div>
            </div>
            <form onSubmit={handleCheckinSubmit}>
              <div className="modal-body" style={{ maxHeight: '480px', overflowY: 'auto' }}>
                <div
                  style={{
                    background: '#e0f2fe',
                    color: '#0369a1',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    marginBottom: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span>Current Puzzle: #{currentLevel.id} ({tierInfo?.name} - {tierInfo?.concept})</span>
                  <span>Participant: <strong>{checkinId || 'P01'}</strong></span>
                </div>

                <p className="checkin-intro" style={{ background: '#f5f3ff', borderRadius: '10px', padding: '8px 12px', borderLeft: '4px solid #7c3aed', fontSize: '13px' }}>
                  Please answer these quick questions about your current task. Your answers will be compared directly with facial emotion detection.
                </p>

                {/* Q2: Feeling right now (7 DeepFace basic emotions) */}
                <div className="form-section">
                  <div className="form-section-title">
                    <span>2.</span> How are you feeling right now? <span style={{ color: '#e11d48' }}>*</span>
                  </div>
                  <div className="feeling-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))' }}>
                    {DEEPFACE_EMOTIONS.map((f) => (
                      <label key={f.label} className="feeling-option">
                        <input
                          type="radio"
                          name="checkin_emotion"
                          value={f.label}
                          checked={checkinEmotion === f.label}
                          onChange={() => setCheckinEmotion(f.label)}
                        />
                        <div className="feeling-card" style={{ padding: '8px 4px' }}>
                          <span className="emoji" style={{ fontSize: '24px' }}>{f.emoji}</span>
                          <span className="label" style={{ fontSize: '11px' }}>{f.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Q3: Task Challenge (1 to 5) */}
                <div className="form-section">
                  <div className="form-section-title">
                    <span>3.</span> How difficult is the current task? <span style={{ color: '#e11d48' }}>*</span>
                  </div>
                  <Scale
                    name="checkin_challenge"
                    value={checkinChallenge}
                    onChange={setCheckinChallenge}
                    lowLabel="1 (Very easy)"
                    highLabel="5 (Very difficult)"
                  />
                </div>

                {/* Q4: Confidence / Skill Proxy (1 to 5) */}
                <div className="form-section">
                  <div className="form-section-title">
                    <span>4.</span> How confident are you that you can complete the current task? <span style={{ color: '#e11d48' }}>*</span>
                  </div>
                  <Scale
                    name="checkin_confidence"
                    value={checkinConfidence}
                    onChange={setCheckinConfidence}
                    lowLabel="1 (Not confident at all)"
                    highLabel="5 (Very confident)"
                  />
                </div>

                {/* Flow State Preview */}
                {checkinChallenge && checkinConfidence && (
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>
                      Challenge ({checkinChallenge}) − Confidence ({checkinConfidence}) = Balance (<strong>{checkinChallenge - checkinConfidence}</strong>)
                    </span>
                    <span style={{
                      fontWeight: 700,
                      color: getFlowState(checkinChallenge, checkinConfidence).color
                    }}>
                      State: {getFlowState(checkinChallenge, checkinConfidence).state}
                    </span>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={!isCheckinValid}>
                  Submit Check-in #{checkinWindow} &amp; Resume Coding 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Post-Test Survey Modal (Appendix B3) */}
      {posttestOpen && (
        <div className="modal-overlay modal-active" role="dialog" aria-modal="true">
          <div className="modal-card" style={{ maxWidth: '620px' }}>
            <div className="modal-header pretest-header" style={{
              background: 'linear-gradient(135deg, #0284c7, #2563eb, #7c3aed)',
              padding: '18px 24px',
              textAlign: 'center',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#fff', margin: 0 }}>
                🏁 Post-Test Survey (Appendix B3)
                <span style={{ display: 'block', fontSize: '12px', fontWeight: 500, opacity: 0.9, marginTop: '2px' }}>
                  CS413.2 Affective Computing Study — Final Activity Assessment
                </span>
              </h3>
              {onClosePosttest && (
                <button
                  type="button"
                  onClick={onClosePosttest}
                  style={{
                    position: 'absolute', top: '10px', right: '12px',
                    background: 'rgba(255,255,255,0.25)',
                    border: '1px solid rgba(255,255,255,0.4)',
                    color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                    borderRadius: '20px', padding: '3px 10px'
                  }}
                >
                  ✕
                </button>
              )}
            </div>
            <form onSubmit={handlePosttestSubmit}>
              <div className="modal-body" style={{ maxHeight: '460px', overflowY: 'auto' }}>
                <p className="checkin-intro" style={{ background: '#f0fdf4', borderRadius: '10px', padding: '10px 14px', borderLeft: '4px solid #16a34a', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Great job completing the session! Answer these final questions about your experience.</span>
                  <span style={{ fontWeight: 800, color: '#15803d', background: '#dcfce7', padding: '4px 10px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                    Participant: {postParticipantId || currentParticipantId || 'P01'}
                  </span>
                </p>

                {/* 2. Most frequent feeling */}
                <div className="form-section">
                  <div className="form-section-title">
                    <span>2.</span> Overall, which feeling did you experience most often during the activity? <span style={{ color: '#e11d48' }}>*</span>
                  </div>
                  <div className="feeling-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))' }}>
                    {DEEPFACE_EMOTIONS.map((f) => (
                      <label key={f.label} className="feeling-option">
                        <input
                          type="radio"
                          name="post_emotion"
                          value={f.label}
                          checked={postFeeling === f.label}
                          onChange={() => setPostFeeling(f.label)}
                        />
                        <div className="feeling-card" style={{ padding: '8px 4px' }}>
                          <span className="emoji" style={{ fontSize: '24px' }}>{f.emoji}</span>
                          <span className="label" style={{ fontSize: '11px' }}>{f.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 3. Overall difficulty */}
                <div className="form-section">
                  <div className="form-section-title">
                    <span>3.</span> Overall, how difficult was the activity? <span style={{ color: '#e11d48' }}>*</span>
                  </div>
                  <Scale name="post_diff" value={postDifficulty} onChange={setPostDifficulty} lowLabel="1 (Very easy)" highLabel="5 (Very difficult)" />
                </div>

                {/* 4. Future confidence */}
                <div className="form-section">
                  <div className="form-section-title">
                    <span>4.</span> After this activity, how confident are you that you can solve similar puzzles? <span style={{ color: '#e11d48' }}>*</span>
                  </div>
                  <Scale name="post_conf" value={postConfidence} onChange={setPostConfidence} lowLabel="1 (Not confident at all)" highLabel="5 (Very confident)" />
                </div>

                {/* 5. Performance */}
                <div className="form-section">
                  <div className="form-section-title">
                    <span>5.</span> How well do you think you performed in the activity? <span style={{ color: '#e11d48' }}>*</span>
                  </div>
                  <Scale name="post_perf" value={postPerformance} onChange={setPostPerformance} lowLabel="1 (Very poorly)" highLabel="5 (Very well)" />
                </div>

                {/* 6. Engagement */}
                <div className="form-section">
                  <div className="form-section-title">
                    <span>6.</span> How engaged or interested were you during the activity? <span style={{ color: '#e11d48' }}>*</span>
                  </div>
                  <Scale name="post_eng" value={postEngagement} onChange={setPostEngagement} lowLabel="1 (Not engaged at all)" highLabel="5 (Very engaged)" />
                </div>

                {/* 7. Recording comfort */}
                <div className="form-section">
                  <div className="form-section-title">
                    <span>7.</span> How comfortable were you with having your face and screen recorded? <span style={{ color: '#e11d48' }}>*</span>
                  </div>
                  <Scale name="post_comf" value={postRecordingComfort} onChange={setPostRecordingComfort} lowLabel="1 (Very uncomfortable)" highLabel="5 (Very comfortable)" />
                </div>

                {/* 8. Comments */}
                <div className="form-section">
                  <div className="form-section-title">
                    <span>8.</span> Any comments or suggestions? (Optional)
                  </div>
                  <textarea
                    className="form-textarea"
                    placeholder="Share your thoughts about the puzzles, game difficulty, or check-ins..."
                    value={postComments}
                    onChange={(e) => setPostComments(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={!isPosttestValid}>
                  Submit Post-Test &amp; View Certificate 🎓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2b. Certificate of Participation Modal (Appendix D) */}
      {certOpen && (
        <div className="modal-overlay modal-active" role="dialog" aria-modal="true">
          <div className="modal-card" style={{ maxWidth: '680px', padding: '24px', background: '#fffdf5', border: '6px double #b8860b' }}>
            <div style={{ textAlign: 'center', border: '2px solid #b8860b', padding: '24px 20px', borderRadius: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#5c3317', letterSpacing: '1px' }}>
                UNIVERSITY OF SCIENCE AND TECHNOLOGY OF SOUTHERN PHILIPPINES
              </div>
              <div style={{ fontSize: '11px', color: '#7a4420', margin: '4px 0 16px' }}>
                Main Campus - Alubijid · Department of Computer Science · CS413.2 Affective Computing
              </div>

              <div style={{ fontSize: '26px', fontWeight: 900, color: '#b8860b', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
                Certificate of Participation
              </div>

              <p style={{ fontSize: '13px', color: '#5c3317', margin: '8px 0' }}>
                This certificate is proudly presented to
              </p>

              <div style={{ fontSize: '24px', fontWeight: 900, color: '#c0392b', borderBottom: '2px solid #5c3317', display: 'inline-block', padding: '2px 24px', margin: '6px 0 14px' }}>
                {postParticipantId || currentParticipantId || 'Participant'}
              </div>

              <p style={{ fontSize: '12px', color: '#444', lineHeight: 1.6, maxWidth: '520px', margin: '0 auto 16px' }}>
                For actively participating and contributing as a participant in the research experiment titled:<br/>
                <strong>“Emotional Engagement During Gameplay of an Educational Game: An Affective Computing, User Modeling, and Data Mining Approach Using Code.org Hour of Code Puzzles”</strong>
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '24px', fontSize: '11px', color: '#5c3317' }}>
                <div>
                  <div style={{ fontWeight: 800 }}>Quem Krister D. Magdugo, et al.</div>
                  <div style={{ opacity: 0.8 }}>Lead Researchers (BSCS-1)</div>
                </div>
                <div>
                  <div style={{ fontWeight: 800 }}>Jonal C. Roble Jr.</div>
                  <div style={{ opacity: 0.8 }}>Faculty Adviser</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ flex: 1 }}
                onClick={() => window.print()}
              >
                🖨️ Print / Save Certificate
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{ flex: 1 }}
                onClick={onCloseCert}
              >
                Done &amp; Return to Game ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Puzzle Win / Success Modal */}
      {winOpen && (
        <div className="modal-overlay modal-active" role="dialog" aria-modal="true">
          <div className="modal-card" style={{ textAlign: 'center' }}>
            <div className="modal-header win-header" style={{ justifyContent: 'center' }}>
              <h3>🎉 Congratulations! Puzzle Solved!</h3>
            </div>
            <div className="modal-body" style={{ padding: '28px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginBottom: '12px' }} className="win-stars">
                <img
                  src={currentLevel?.tier === 'hard' ? '/sprites/bird_bomb.png' : currentLevel?.tier === 'medium' ? '/sprites/bird_yellow.png' : '/sprites/bird_red.png'}
                  alt="Bird"
                  style={{ width: '64px', height: '64px', objectFit: 'contain', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
                />
                <span style={{ fontSize: '38px' }}>⭐</span>
                <img
                  src={currentLevel?.tier === 'hard' ? '/sprites/pig_mustache.png' : currentLevel?.tier === 'medium' ? '/sprites/pig_helmet.png' : '/sprites/pig_minion.png'}
                  alt="Pig"
                  style={{ width: '56px', height: '56px', objectFit: 'contain', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
                />
              </div>
              <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>
                You caught the naughty pig!
              </h4>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
                Puzzle solved using <strong style={{ color: '#0284c7' }}>{winBlockCount} blocks</strong>.
              </p>

              <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#475569',
                    marginBottom: '6px',
                    textTransform: 'uppercase'
                  }}
                >
                  JavaScript Code Equivalent:
                </div>
                <pre className="code-preview-block">{winJsCode}</pre>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button className="btn-secondary" onClick={onReplay}>
                  Replay
                </button>
                <button className="btn-primary" onClick={onNextLevel}>
                  Continue to Next Puzzle ➔
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Feedback / Try Again Modal */}
      {feedback && feedback.open && (
        <div className="modal-overlay modal-active" role="dialog" aria-modal="true">
          <div className="modal-card" style={{ textAlign: 'center', maxWidth: '440px' }}>
            <div className="modal-header" style={{ background: '#e11d48', justifyContent: 'center' }}>
              <h3>{feedback.title}</h3>
            </div>
            <div className="modal-body" style={{ padding: '24px' }}>
              <div style={{ fontSize: '42px', marginBottom: '12px' }}>🤔</div>
              <p style={{ fontSize: '15px', color: '#334155', lineHeight: 1.5, marginBottom: '20px' }}>
                {feedback.msg}
              </p>
              <button className="btn-primary" style={{ minWidth: '140px' }} onClick={onCloseFeedback}>
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Show Code Modal */}
      {codeModalOpen && (
        <div className="modal-overlay modal-active" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-header">
              <h3>
                <span>&lt;/&gt;</span> Generated JavaScript Code
              </h3>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>
                Each block you drag is converted directly into real JavaScript code:
              </p>
              <pre className="code-preview-block">{codeContent}</pre>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={onCloseCodeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Hint Modal */}
      {hintModalOpen && (
        <div className="modal-overlay modal-active" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-header">
              <h3>
                <span>💡</span> Puzzle Walkthrough &amp; Hints
              </h3>
            </div>
            <div className="modal-body">
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '16px'
                }}
              >
                <h4 style={{ color: '#0284c7', marginBottom: '8px', fontSize: '15px' }}>Tips for this Tier:</h4>
                <ul style={{ paddingLeft: '20px', fontSize: '13px', color: '#334155', lineHeight: 1.6 }}>
                  <li>
                    <strong>Easy Tier (1–5)</strong>: Stack simple forward and turn blocks in the exact order needed.
                  </li>
                  <li>
                    <strong>Medium Tier (6–13)</strong>: Look for repeated patterns! Nest actions inside the repeat block.
                  </li>
                  <li>
                    <strong>Hard Tier (14–20)</strong>: Use <code>if path</code> sensors to let the bird make intelligent turn decisions at corners.
                  </li>
                </ul>
              </div>

              <div
                style={{
                  background: '#fffbeb',
                  border: '1px solid #fef3c7',
                  borderRadius: '8px',
                  padding: '14px'
                }}
              >
                <strong style={{ color: '#b45309', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                  Hint for this puzzle:
                </strong>
                <p style={{ fontSize: '13px', color: '#92400e', lineHeight: 1.5 }}>
                  {currentLevel.hint || 'Stack the blocks in the exact sequence you want the bird to travel!'}
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={onCloseHintModal}>
                Got It!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Check-in History Modal (Table 8 Consolidated Dataset View) */}
      {historyModalOpen && (
        <div className="modal-overlay modal-active" role="dialog" aria-modal="true">
          <div className="modal-card" style={{ maxWidth: '820px' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>
                <span>📋</span> In-Game Check-in Dataset (Table 8)
              </h3>
              {historyData.length > 0 && (
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: '12px', padding: '4px 12px' }}
                  onClick={() => {
                    const headers = ['participant_id', 'window', 'timestamp', 'puzzle', 'tier', 'self_emotion', 'self_category', 'challenge', 'confidence', 'balance', 'flow_state'];
                    const rows = historyData.map(d => [
                      d.participantId || '',
                      d.window || '',
                      d.timestamp || '',
                      d.levelId || '',
                      d.tier || '',
                      d.emotion || '',
                      d.emotionCategory || '',
                      d.challenge || '',
                      d.confidence || '',
                      d.balance !== undefined ? d.balance : '',
                      `"${d.flowState || ''}"`
                    ]);
                    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement('a');
                    link.setAttribute('href', encodedUri);
                    link.setAttribute('download', `cs413_study_checkins_${Date.now()}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  📥 Export CSV
                </button>
              )}
            </div>
            <div className="modal-body" style={{ padding: '16px', maxHeight: '420px', overflowY: 'auto' }}>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>
                All 5-minute interval check-in responses collected per CS413.2 methodology:
              </p>
              <table className="history-table" style={{ width: '100%', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>Win #</th>
                    <th>Time</th>
                    <th>ID</th>
                    <th>Puzzle</th>
                    <th>Emotion</th>
                    <th>Chal.</th>
                    <th>Conf.</th>
                    <th>Bal.</th>
                    <th>Flow State</th>
                  </tr>
                </thead>
                <tbody>
                  {historyData.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>
                        No check-in responses recorded yet. Check-ins trigger every 5 minutes during gameplay!
                      </td>
                    </tr>
                  ) : (
                    historyData.map((item, idx) => (
                      <tr key={idx}>
                        <td><strong>#{item.window || (historyData.length - idx)}</strong></td>
                        <td>{item.timestamp || item.time}</td>
                        <td><strong>{item.participantId || 'P01'}</strong></td>
                        <td>#{item.levelId || item.level} ({item.tier})</td>
                        <td>
                          <span style={{ fontWeight: 700 }}>
                            {DEEPFACE_EMOTIONS.find(e => e.label === item.emotion)?.emoji} {item.emotion}
                          </span>
                        </td>
                        <td>{item.challenge}</td>
                        <td>{item.confidence}</td>
                        <td><strong>{item.balance !== undefined ? (item.balance > 0 ? `+${item.balance}` : item.balance) : '—'}</strong></td>
                        <td>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: '#f1f5f9',
                            color: item.flowState?.includes('Flow') ? '#16a34a' :
                                   item.flowState?.includes('Frustration') ? '#e11d48' :
                                   item.flowState?.includes('Boredom') ? '#64748b' : '#0284c7'
                          }}>
                            {item.flowState || item.feeling || '—'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={onCloseHistoryModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
