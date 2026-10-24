import React, { useState, useEffect } from 'react';
import { TIERS, LEVELS } from '../data/levels';

import angryEmojiImg from '../../assets/angry_emoji.png';
import disgustEmojiImg from '../../assets/disgust_emoji.png';
import fearEmojiImg from '../../assets/fear_emoji.png';
import happyEmojiImg from '../../assets/happy_emoji.png';
import neutralEmojiImg from '../../assets/neutral_emoji.png';
import sadEmojiImg from '../../assets/sad_emoji.png';
import surpriseEmojiImg from '../../assets/surprise_emoji.png';

const DEEPFACE_EMOTIONS = [
  { label: 'Happy', emoji: '😊', icon: happyEmojiImg, category: 'Satisfaction / positive' },
  { label: 'Neutral', emoji: '😐', icon: neutralEmojiImg, category: 'Neutral' },
  { label: 'Surprise', emoji: '😲', icon: surpriseEmojiImg, category: 'Satisfaction / positive' },
  { label: 'Sad', emoji: '😢', icon: sadEmojiImg, category: 'Frustration / stress' },
  { label: 'Angry', emoji: '😠', icon: angryEmojiImg, category: 'Frustration / stress' },
  { label: 'Fear', emoji: '😨', icon: fearEmojiImg, category: 'Frustration / stress' },
  { label: 'Disgust', emoji: '🤢', icon: disgustEmojiImg, category: 'Frustration / stress' }
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
  pretestCompleted,
  sessionEndOpen,
  onProceedToPosttest,
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
  historyData,
  minuteLogsData = []
}) {
  const currentLevel = LEVELS[currentLevelIndex] || LEVELS[0];
  const tierKey = currentLevel.tier || 'easy';
  const tierInfo = TIERS[tierKey];

  // History modal active tab: 'minute' (30-min telemetry) or 'checkin' (Table 8 responses)
  const [historyTab, setHistoryTab] = useState('minute');

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
          <div
            className="modal-card"
            style={{
              maxWidth: '720px',
              width: '95%',
              boxSizing: 'border-box',
              padding: '8px',
              background: '#b45309',
              border: '5px solid #854d0e',
              borderRadius: '22px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.3)',
              position: 'relative'
            }}
          >
            {/* 4 Corner Brass Screws */}
            <div style={{ position: 'absolute', top: '6px', left: '6px', width: '12px', height: '12px', borderRadius: '50%', background: 'radial-gradient(circle, #fef08a 20%, #eab308 60%, #854d0e 100%)', border: '1px solid #713f12', boxShadow: '0 1px 2px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
              <div style={{ width: '7px', height: '1.5px', background: '#542907', transform: 'rotate(45deg)' }} />
            </div>
            <div style={{ position: 'absolute', top: '6px', right: '6px', width: '12px', height: '12px', borderRadius: '50%', background: 'radial-gradient(circle, #fef08a 20%, #eab308 60%, #854d0e 100%)', border: '1px solid #713f12', boxShadow: '0 1px 2px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
              <div style={{ width: '7px', height: '1.5px', background: '#542907', transform: 'rotate(-45deg)' }} />
            </div>
            <div style={{ position: 'absolute', bottom: '6px', left: '6px', width: '12px', height: '12px', borderRadius: '50%', background: 'radial-gradient(circle, #fef08a 20%, #eab308 60%, #854d0e 100%)', border: '1px solid #713f12', boxShadow: '0 1px 2px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
              <div style={{ width: '7px', height: '1.5px', background: '#542907', transform: 'rotate(-45deg)' }} />
            </div>
            <div style={{ position: 'absolute', bottom: '6px', right: '6px', width: '12px', height: '12px', borderRadius: '50%', background: 'radial-gradient(circle, #fef08a 20%, #eab308 60%, #854d0e 100%)', border: '1px solid #713f12', boxShadow: '0 1px 2px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
              <div style={{ width: '7px', height: '1.5px', background: '#542907', transform: 'rotate(45deg)' }} />
            </div>

            {/* Inner White Content Card */}
            <div
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: '#ffffff',
                borderRadius: '16px',
                padding: '18px 20px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                overflow: 'hidden'
              }}
            >
              {/* Close Button at Top Right */}
              {onCloseWelcome && (
                <button
                  type="button"
                  onClick={onCloseWelcome}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#e2e8f0',
                    border: '1.5px solid #94a3b8',
                    color: '#475569',
                    fontSize: '15px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                    transition: 'all 0.15s ease',
                    zIndex: 10
                  }}
                  title="Close Welcome Banner"
                >
                  ✕
                </button>
              )}

              {/* Character Lineup */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', marginBottom: '8px', maxWidth: '100%', flexWrap: 'wrap' }}>
                <img src="/sprites/slingshot.png" alt="Slingshot" style={{ width: '30px', height: '48px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                <img src="/sprites/bird_red.png" alt="Red Bird" style={{ width: '44px', height: '44px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                <img src="/sprites/bird_yellow.png" alt="Chuck" style={{ width: '44px', height: '44px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                <img src="/sprites/bird_bomb.png" alt="Bomb" style={{ width: '44px', height: '44px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                <img src="/sprites/pig_minion.png" alt="Minion Pig" style={{ width: '40px', height: '40px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                <img src="/sprites/pig_helmet.png" alt="Helmet Pig" style={{ width: '44px', height: '44px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                <img src="/sprites/pig_mustache.png" alt="Foreman Pig" style={{ width: '44px', height: '44px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
              </div>

              {/* Wooden Plaque Banner ("ANGRY BIRD BLOCKS") */}
              <div
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(180deg, #f59e0b 0%, #d97706 60%, #b45309 100%)',
                  border: '2px solid #78350f',
                  borderRadius: '12px',
                  padding: '8px 44px',
                  boxShadow: '0 4px 0 #78350f, 0 6px 14px rgba(0,0,0,0.2)',
                  margin: '8px 0 8px 0',
                  maxWidth: '92%',
                  textAlign: 'center'
                }}
              >
                <div style={{ position: 'absolute', left: '10px', width: '8px', height: '8px', borderRadius: '50%', background: '#78350f', border: '1px solid #451a03' }} />
                <h1
                  style={{
                    margin: 0,
                    fontFamily: "'Lilita One', 'Impact', -apple-system, sans-serif",
                    fontSize: '26px',
                    fontWeight: 900,
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    textShadow: '0 3px 0 #78350f, 0 4px 6px rgba(0,0,0,0.3)',
                    lineHeight: 1
                  }}
                >
                  Angry Bird Blocks
                </h1>
                <div style={{ position: 'absolute', right: '10px', width: '8px', height: '8px', borderRadius: '50%', background: '#78350f', border: '1px solid #451a03' }} />
              </div>

              {/* Green Subtitle Pill */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#4d7c0f',
                  color: '#ffffff',
                  borderRadius: '9999px',
                  padding: '4px 18px',
                  fontSize: '11.5px',
                  fontWeight: 800,
                  letterSpacing: '0.4px',
                  marginBottom: '14px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  textAlign: 'center'
                }}
              >
                ● CS413 Affective Computing Study ●
              </div>

              {/* Welcome Description */}
              <p
                style={{
                  textAlign: 'center',
                  fontSize: '13px',
                  color: '#334155',
                  lineHeight: '1.6',
                  maxWidth: '560px',
                  margin: '0 0 14px 0'
                }}
              >
                Welcome to <strong style={{ color: '#dc2626' }}>Angry Bird Blocks</strong>! Help the flock retrieve their stolen eggs by programming their journey through{' '}
                <span
                  style={{
                    display: 'inline-block',
                    background: '#fef3c7',
                    border: '1px solid #fde047',
                    color: '#854d0e',
                    fontWeight: 800,
                    padding: '1px 8px',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                >
                  20 progressive maze puzzles
                </span>{' '}
                and one bonus challenge using visual code blocks.
              </p>

              {/* 3 Level Tier Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  gap: '8px',
                  width: '100%',
                  boxSizing: 'border-box',
                  marginBottom: '14px'
                }}
              >
                {/* Card 1: Easy */}
                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1.5px solid #86efac',
                    borderRadius: '12px',
                    padding: '9px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    minWidth: 0,
                    boxSizing: 'border-box'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontWeight: 800, color: '#166534', fontSize: '12px', whiteSpace: 'nowrap' }}>🌱 Levels 1–5</span>
                    <span style={{ background: '#bbf7d0', color: '#166534', padding: '1px 5px', borderRadius: '5px', fontSize: '9.5px', fontWeight: 800, whiteSpace: 'nowrap' }}>★☆☆</span>
                  </div>
                  <div style={{ fontWeight: 800, color: '#15803d', fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Easy: Sequences</div>
                  <div style={{ fontSize: '11px', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>🎯 <strong>Red Bird</strong> vs Minion</div>
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1px solid #dcfce7',
                      borderRadius: '6px',
                      padding: '4px 6px',
                      fontSize: '9.5px',
                      color: '#166534',
                      fontFamily: 'monospace',
                      lineHeight: '1.25',
                      wordBreak: 'break-word',
                      minWidth: 0
                    }}
                  >
                    Blocks: moveForward(), turn()
                  </div>
                </div>

                {/* Card 2: Medium */}
                <div
                  style={{
                    background: '#fffbeb',
                    border: '1.5px solid #fde047',
                    borderRadius: '12px',
                    padding: '9px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    minWidth: 0,
                    boxSizing: 'border-box'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontWeight: 800, color: '#854d0e', fontSize: '12px', whiteSpace: 'nowrap' }}>⚡ Levels 6–13</span>
                    <span style={{ background: '#fde68a', color: '#854d0e', padding: '1px 5px', borderRadius: '5px', fontSize: '9.5px', fontWeight: 800, whiteSpace: 'nowrap' }}>★★☆</span>
                  </div>
                  <div style={{ fontWeight: 800, color: '#a16207', fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Medium: Loops</div>
                  <div style={{ fontSize: '11px', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>⚡ <strong>Chuck</strong> vs Helmet Pig</div>
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1px solid #fef3c7',
                      borderRadius: '6px',
                      padding: '4px 6px',
                      fontSize: '9.5px',
                      color: '#854d0e',
                      fontFamily: 'monospace',
                      lineHeight: '1.25',
                      wordBreak: 'break-word',
                      minWidth: 0
                    }}
                  >
                    Blocks: repeat-times, repeat-until
                  </div>
                </div>

                {/* Card 3: Hard */}
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1.5px solid #fca5a5',
                    borderRadius: '12px',
                    padding: '9px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    minWidth: 0,
                    boxSizing: 'border-box'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontWeight: 800, color: '#991b1b', fontSize: '12px', whiteSpace: 'nowrap' }}>💣 Levels 14–20</span>
                    <span style={{ background: '#fecdd3', color: '#991b1b', padding: '1px 5px', borderRadius: '5px', fontSize: '9.5px', fontWeight: 800, whiteSpace: 'nowrap' }}>★★★</span>
                  </div>
                  <div style={{ fontWeight: 800, color: '#b91c1c', fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Hard: If / Else Logic</div>
                  <div style={{ fontSize: '11px', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>💥 <strong>Bomb</strong> vs Foreman Pig</div>
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1px solid #fee2e2',
                      borderRadius: '6px',
                      padding: '4px 6px',
                      fontSize: '9.5px',
                      color: '#991b1b',
                      fontFamily: 'monospace',
                      lineHeight: '1.25',
                      wordBreak: 'break-word',
                      minWidth: 0
                    }}
                  >
                    Blocks: if pathAhead, if / else
                  </div>
                </div>
              </div>

              {/* Coders Field Guide & Quick Tips */}
              <div
                style={{
                  background: '#f0f7ff',
                  border: '1.5px dashed #93c5fd',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  width: '100%',
                  boxSizing: 'border-box',
                  marginBottom: '14px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '15px' }}>💡</span>
                  <span style={{ fontWeight: 900, color: '#1e3a8a', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    Coders Field Guide &amp; Quick Tips
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11.5px', color: '#334155', lineHeight: '1.4' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <span style={{ color: '#0d9488', fontWeight: 900, flexShrink: 0, marginTop: '1px' }}>✓</span>
                    <span>
                      Snap blocks securely under{' '}
                      <code style={{ background: '#fef08a', color: '#713f12', padding: '1px 5px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 700 }}>when run</code>
                      , then hit the big green <strong>Run</strong> button.
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <span style={{ color: '#0d9488', fontWeight: 900, flexShrink: 0, marginTop: '1px' }}>✓</span>
                    <span>
                      Drag unwanted or misbehaving blocks to the{' '}
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', background: '#e2e8f0', color: '#334155', padding: '1px 5px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 700 }}>
                        🗑️ Trash Bin
                      </span>{' '}
                      or toolbox.
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <span style={{ color: '#0d9488', fontWeight: 900, flexShrink: 0, marginTop: '1px' }}>✓</span>
                    <span>
                      Every 5 minutes, an interactive check-in will prompt you for puzzle algorithm reflection.
                    </span>
                  </div>
                </div>
              </div>

              {/* Authenticated Participant Box */}
              <div
                style={{
                  background: '#fffbeb',
                  border: '2px solid #fde047',
                  borderRadius: '12px',
                  padding: '8px 14px',
                  width: '100%',
                  boxSizing: 'border-box',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: '#7c3aed',
                      color: '#ffffff',
                      fontWeight: 900,
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(124, 58, 237, 0.3)'
                    }}
                  >
                    ID
                  </div>
                  <div>
                    <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      Authenticated Participant
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '1px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 900, color: '#1e293b' }}>
                        Participant {currentParticipantId || 'P12'}
                      </span>
                      <span
                        style={{
                          background: '#ede9fe',
                          color: '#6d28d9',
                          border: '1px solid #ddd6fe',
                          padding: '1px 7px',
                          borderRadius: '9999px',
                          fontSize: '10px',
                          fontWeight: 700
                        }}
                      >
                        Bird Cadet
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: '#dcfce7',
                    border: '1.5px solid #86efac',
                    color: '#15803d',
                    padding: '5px 12px',
                    borderRadius: '9999px',
                    fontSize: '11px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  ✓ Verified &amp; Ready
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={onStartFromWelcome}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '13px 24px',
                  fontSize: '16.5px',
                  fontWeight: 900,
                  color: '#ffffff',
                  background: 'linear-gradient(180deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
                  border: '2px solid #991b1b',
                  borderRadius: '12px',
                  boxShadow: '0 5px 0 #7f1d1d, 0 8px 18px rgba(185, 28, 28, 0.35)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.35)',
                  letterSpacing: '0.4px',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ fontSize: '18px' }}>🎯</span>
                <span>Sling into Action! ▶</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 0. Pre-Test Survey Modal */}
      {pretestOpen && (
        <div className="modal-overlay modal-active" role="dialog" aria-modal="true">
          <div
            className="modal-card"
            style={{
              maxWidth: '700px',
              width: '95%',
              boxSizing: 'border-box',
              padding: '8px',
              background: '#b45309',
              border: '5px solid #854d0e',
              borderRadius: '22px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.3)',
              position: 'relative'
            }}
          >
            {/* 4 Corner Brass Screws */}
            <div style={{ position: 'absolute', top: '6px', left: '6px', width: '12px', height: '12px', borderRadius: '50%', background: 'radial-gradient(circle, #fef08a 20%, #eab308 60%, #854d0e 100%)', border: '1px solid #713f12', boxShadow: '0 1px 2px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
              <div style={{ width: '7px', height: '1.5px', background: '#542907', transform: 'rotate(45deg)' }} />
            </div>
            <div style={{ position: 'absolute', top: '6px', right: '6px', width: '12px', height: '12px', borderRadius: '50%', background: 'radial-gradient(circle, #fef08a 20%, #eab308 60%, #854d0e 100%)', border: '1px solid #713f12', boxShadow: '0 1px 2px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
              <div style={{ width: '7px', height: '1.5px', background: '#542907', transform: 'rotate(-45deg)' }} />
            </div>
            <div style={{ position: 'absolute', bottom: '6px', left: '6px', width: '12px', height: '12px', borderRadius: '50%', background: 'radial-gradient(circle, #fef08a 20%, #eab308 60%, #854d0e 100%)', border: '1px solid #713f12', boxShadow: '0 1px 2px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
              <div style={{ width: '7px', height: '1.5px', background: '#542907', transform: 'rotate(-45deg)' }} />
            </div>
            <div style={{ position: 'absolute', bottom: '6px', right: '6px', width: '12px', height: '12px', borderRadius: '50%', background: 'radial-gradient(circle, #fef08a 20%, #eab308 60%, #854d0e 100%)', border: '1px solid #713f12', boxShadow: '0 1px 2px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
              <div style={{ width: '7px', height: '1.5px', background: '#542907', transform: 'rotate(45deg)' }} />
            </div>

            {/* Inner White Content Card */}
            <div
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: '#ffffff',
                borderRadius: '16px',
                padding: '18px 20px 16px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              {/* Skip / Close Button at Top Right */}
              {onClosePretest && (
                <button
                  type="button"
                  onClick={onClosePretest}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    borderRadius: '9999px',
                    background: '#f1f5f9',
                    border: '1.5px solid #cbd5e1',
                    color: '#64748b',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '3px 10px',
                    gap: '4px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                    transition: 'all 0.15s ease',
                    zIndex: 10
                  }}
                  title="Skip survey"
                >
                  Skip ✕
                </button>
              )}

              {/* Character Lineup */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', marginBottom: '8px', maxWidth: '100%', flexWrap: 'wrap' }}>
                <img src="/sprites/slingshot.png" alt="Slingshot" style={{ width: '30px', height: '48px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                <img src="/sprites/bird_red.png" alt="Red Bird" style={{ width: '44px', height: '44px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                <img src="/sprites/bird_yellow.png" alt="Chuck" style={{ width: '44px', height: '44px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                <img src="/sprites/bird_bomb.png" alt="Bomb" style={{ width: '44px', height: '44px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                <img src="/sprites/pig_minion.png" alt="Minion Pig" style={{ width: '40px', height: '40px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                <img src="/sprites/pig_helmet.png" alt="Helmet Pig" style={{ width: '44px', height: '44px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                <img src="/sprites/pig_mustache.png" alt="Foreman Pig" style={{ width: '44px', height: '44px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
              </div>

              {/* Wooden Plaque Banner ("PRE-TEST SURVEY") */}
              <div
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(180deg, #f59e0b 0%, #d97706 60%, #b45309 100%)',
                  border: '2px solid #78350f',
                  borderRadius: '12px',
                  padding: '7px 36px',
                  boxShadow: '0 4px 0 #78350f, 0 6px 14px rgba(0,0,0,0.2)',
                  margin: '4px 0 8px 0',
                  maxWidth: '92%',
                  textAlign: 'center'
                }}
              >
                <div style={{ position: 'absolute', left: '10px', width: '8px', height: '8px', borderRadius: '50%', background: '#78350f', border: '1px solid #451a03' }} />
                <h1
                  style={{
                    margin: 0,
                    fontFamily: "'Lilita One', 'Impact', -apple-system, sans-serif",
                    fontSize: '24px',
                    fontWeight: 900,
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    textShadow: '0 3px 0 #78350f, 0 4px 6px rgba(0,0,0,0.3)',
                    lineHeight: 1.1
                  }}
                >
                  Pre-Test Survey 🚀
                </h1>
                <div style={{ position: 'absolute', right: '10px', width: '8px', height: '8px', borderRadius: '50%', background: '#78350f', border: '1px solid #451a03' }} />
              </div>

              {/* Green Subtitle Pill */}
              {/* <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#4d7c0f',
                  color: '#ffffff',
                  borderRadius: '9999px',
                  padding: '4px 18px',
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.4px',
                  marginBottom: '12px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  textAlign: 'center'
                }}
              >
                ● CS413 Study • Pre-Test Background &amp; Readiness ●
              </div> */}

              <form onSubmit={handlePretestFormSubmit} style={{ width: '100%', boxSizing: 'border-box' }}>
                {/* 3 Step Pill Indicator */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px', width: '100%', marginBottom: '12px', boxSizing: 'border-box' }}>
                  {[
                    { label: 'About You', icon: '👤' },
                    { label: 'Feelings', icon: '❤️' },
                    { label: 'Expectations', icon: '🎯' }
                  ].map((step, i) => {
                    const isActive = i === pretestPage;
                    const isCompleted = i < pretestPage;
                    return (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '6px 4px',
                          borderRadius: '8px',
                          background: isActive ? '#fef3c7' : isCompleted ? '#dcfce7' : '#f8fafc',
                          border: isActive ? '1.5px solid #f59e0b' : isCompleted ? '1.5px solid #86efac' : '1.5px solid #e2e8f0',
                          color: isActive ? '#92400e' : isCompleted ? '#166534' : '#64748b',
                          fontSize: '11px',
                          fontWeight: 800,
                          transition: 'all 0.15s ease',
                          textAlign: 'center',
                          minWidth: 0
                        }}
                      >
                        <span>{isCompleted ? '✓' : step.icon}</span>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{step.label}</span>
                      </div>
                    );
                  })}
                </div>

                <div
                  className="modal-body"
                  style={{
                    maxHeight: '420px',
                    overflowY: 'auto',
                    padding: '2px 4px',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                >
                  {/* ── Page 0: About You ── */}
                  {pretestPage === 0 && (
                    <>
                      <div
                        style={{
                          background: '#f0f7ff',
                          border: '1.5px dashed #93c5fd',
                          borderRadius: '12px',
                          padding: '10px 14px',
                          marginBottom: '12px',
                          fontSize: '12px',
                          color: '#334155',
                          lineHeight: '1.5'
                        }}
                      >
                        Thank you for taking part in our study on emotional engagement during gameplay.
                        This short form records your coding background. There are no right or wrong answers.<br />
                      </div>

                      {/* Consent */}
                      <div
                        style={{
                          background: '#fffbeb',
                          border: '1.5px solid #fde047',
                          borderRadius: '10px',
                          padding: '8px 12px',
                          marginBottom: '12px'
                        }}
                      >
                        <label className="quiz-option-item" style={{ fontWeight: 700, fontSize: '12px', color: '#713f12', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={consentChecked}
                            onChange={(e) => setConsentChecked(e.target.checked)}
                            style={{ accentColor: '#d97706', width: '16px', height: '16px', cursor: 'pointer' }}
                          />
                          <span>I have read and signed the Informed Consent Form. <span style={{ color: '#dc2626' }}>*</span></span>
                        </label>
                      </div>

                      {/* Authenticated Participant Badge */}
                      <div
                        style={{
                          background: '#fffbeb',
                          border: '2px solid #fde047',
                          borderRadius: '12px',
                          padding: '8px 12px',
                          marginBottom: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px',
                          flexWrap: 'wrap',
                          boxSizing: 'border-box'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              background: '#7c3aed',
                              color: '#ffffff',
                              fontWeight: 900,
                              fontSize: '11px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 4px rgba(124, 58, 237, 0.3)'
                            }}
                          >
                            ID
                          </div>
                          <div>
                            <div style={{ fontSize: '9px', fontWeight: 800, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                              Authenticated Participant
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: 900, color: '#1e293b' }}>
                              Participant {participantId || currentParticipantId || 'P01'}
                            </span>
                          </div>
                        </div>

                        <div
                          style={{
                            background: '#dcfce7',
                            border: '1.5px solid #86efac',
                            color: '#15803d',
                            padding: '3px 10px',
                            borderRadius: '9999px',
                            fontSize: '10.5px',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          ✓ Verified
                        </div>
                      </div>

                      {/* Q2: Programming skill scale */}
                      <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px' }}>
                        <div className="form-section-title" style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: '1.4' }}>
                          <span>2</span>
                          <div style={{ flex: 1, minWidth: 0, color: '#0f172a' }}>
                            How would you rate your overall programming skill? <strong style={{ color: '#dc2626' }}>*</strong>
                          </div>
                        </div>
                        <Scale
                          name="pt_skill"
                          value={programmingSkill}
                          onChange={setProgrammingSkill}
                          lowLabel="Very low"
                          highLabel="Very high"
                        />
                      </div>

                      {/* Q3: Experience level */}
                      <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px' }}>
                        <div className="form-section-title" style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: '1.4' }}>
                          <span>3</span>
                          <div style={{ flex: 1, minWidth: 0, color: '#0f172a' }}>
                            Which programming experience level describes you best? <strong style={{ color: '#dc2626' }}>*</strong>
                          </div>
                        </div>
                        <RadioGroup
                          name="pt_exp_level"
                          options={['Beginner', 'Intermediate', 'Advanced', 'Expert']}
                          value={experienceLevel}
                          onChange={setExperienceLevel}
                        />
                      </div>

                      {/* Q4: Hours per week */}
                      <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px' }}>
                        <div className="form-section-title" style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: '1.4' }}>
                          <span>4</span>
                          <div style={{ flex: 1, minWidth: 0, color: '#0f172a' }}>
                            Approximately how many hours per week do you spend programming? <strong style={{ color: '#dc2626' }}>*</strong>
                          </div>
                        </div>
                        <RadioGroup
                          name="pt_hours"
                          options={['I do not currently program', 'Less than 1 hour', '1–5 hours', '6–10 hours', 'More than 10 hours']}
                          value={hoursPerWeek}
                          onChange={setHoursPerWeek}
                        />
                      </div>

                      {/* Q5: Block-based experience */}
                      <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px' }}>
                        <div className="form-section-title" style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '4px', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: '1.4' }}>
                          <span>5</span>
                          <div style={{ flex: 1, minWidth: 0, color: '#0f172a' }}>
                            How much experience do you have with block-based coding? <strong style={{ color: '#dc2626' }}>*</strong>
                          </div>
                        </div>
                        <p style={{ fontSize: '11.5px', color: '#64748b', margin: '0 0 8px 32px' }}>
                          Examples: Scratch, Code.org, Blockly, Lightbot.
                        </p>
                        <RadioGroup
                          name="pt_block"
                          options={['No experience', 'Less than 1 month', '1–6 months', '7–12 months', 'More than 1 year']}
                          value={blockExperience}
                          onChange={setBlockExperience}
                        />
                      </div>
                    </>
                  )}

                  {/* ── Page 1: How You Feel Right Now ── */}
                  {pretestPage === 1 && (
                    <>
                      <div
                        style={{
                          background: '#f0fdf4',
                          border: '1.5px dashed #86efac',
                          borderRadius: '12px',
                          padding: '10px 14px',
                          marginBottom: '12px',
                          fontSize: '12px',
                          color: '#166534',
                          lineHeight: '1.5'
                        }}
                      >
                        Think about how you feel <strong>at this very moment</strong>, before starting the game.
                      </div>

                      {/* Q6: Valence */}
                      <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px' }}>
                        <div className="form-section-title" style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: '1.4' }}>
                          <span>6</span>
                          <div style={{ flex: 1, minWidth: 0, color: '#0f172a' }}>
                            Right now, how pleasant or unpleasant do you feel? <strong style={{ color: '#dc2626' }}>*</strong>
                          </div>
                        </div>
                        <Scale
                          name="pt_valence"
                          value={valence}
                          onChange={setValence}
                          lowLabel="Very unpleasant"
                          highLabel="Very pleasant"
                        />
                      </div>

                      {/* Q7: Arousal */}
                      <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px' }}>
                        <div className="form-section-title" style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: '1.4' }}>
                          <span>7</span>
                          <div style={{ flex: 1, minWidth: 0, color: '#0f172a' }}>
                            Right now, how calm or energized do you feel? <strong style={{ color: '#dc2626' }}>*</strong>
                          </div>
                        </div>
                        <Scale
                          name="pt_arousal"
                          value={arousal}
                          onChange={setArousal}
                          lowLabel="Very calm"
                          highLabel="Very energized"
                        />
                      </div>
                    </>
                  )}

                  {/* ── Page 2: Expectations ── */}
                  {pretestPage === 2 && (
                    <>
                      <div
                        style={{
                          background: '#fff7ed',
                          border: '1.5px dashed #fdba74',
                          borderRadius: '12px',
                          padding: '10px 14px',
                          marginBottom: '12px',
                          fontSize: '12px',
                          color: '#9a3412',
                          lineHeight: '1.5'
                        }}
                      >
                        Tell us what you expect from today's puzzles.
                      </div>

                      {/* Q8: Confidence */}
                      <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px' }}>
                        <div className="form-section-title" style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: '1.4' }}>
                          <span>8</span>
                          <div style={{ flex: 1, minWidth: 0, color: '#0f172a' }}>
                            How confident are you that you could solve a puzzle you have never seen before? <strong style={{ color: '#dc2626' }}>*</strong>
                          </div>
                        </div>
                        <Scale
                          name="pt_confidence"
                          value={pretestConfidence}
                          onChange={setPretestConfidence}
                          lowLabel="Not at all confident"
                          highLabel="Completely confident"
                        />
                      </div>

                      {/* Q9: Difficulty expectation */}
                      <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px' }}>
                        <div className="form-section-title" style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: '1.4' }}>
                          <span>9</span>
                          <div style={{ flex: 1, minWidth: 0, color: '#0f172a' }}>
                            How difficult do you expect today's puzzles to be? <strong style={{ color: '#dc2626' }}>*</strong>
                          </div>
                        </div>
                        <Scale
                          name="pt_difficulty"
                          value={difficultyExpect}
                          onChange={setDifficultyExpect}
                          lowLabel="Very easy"
                          highLabel="Very difficult"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '14px', width: '100%', boxSizing: 'border-box' }}>
                  {pretestPage > 0 && (
                    <button
                      type="button"
                      onClick={() => setPretestPage((p) => p - 1)}
                      style={{
                        padding: '11px 18px',
                        fontSize: '13.5px',
                        fontWeight: 800,
                        color: '#475569',
                        background: '#f1f5f9',
                        border: '1.5px solid #cbd5e1',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 0 #94a3b8',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      ← Back
                    </button>
                  )}
                  {pretestPage < 2 ? (
                    <button
                      type="button"
                      disabled={pretestPage === 0 ? !page0Valid : !page1Valid}
                      onClick={() => setPretestPage((p) => p + 1)}
                      style={{
                        flex: 1,
                        padding: '11px 20px',
                        fontSize: '15px',
                        fontWeight: 900,
                        color: '#ffffff',
                        background: (pretestPage === 0 ? !page0Valid : !page1Valid)
                          ? '#94a3b8'
                          : 'linear-gradient(180deg, #10b981 0%, #059669 50%, #047857 100%)',
                        border: (pretestPage === 0 ? !page0Valid : !page1Valid)
                          ? '2px solid #64748b'
                          : '2px solid #065f46',
                        borderRadius: '10px',
                        boxShadow: (pretestPage === 0 ? !page0Valid : !page1Valid)
                          ? 'none'
                          : '0 4px 0 #064e3b, 0 6px 12px rgba(5, 150, 105, 0.3)',
                        cursor: (pretestPage === 0 ? !page0Valid : !page1Valid) ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>Next Section</span>
                      <span>→</span>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!page2Valid}
                      style={{
                        flex: 1,
                        padding: '11px 20px',
                        fontSize: '15.5px',
                        fontWeight: 900,
                        color: '#ffffff',
                        background: !page2Valid
                          ? '#94a3b8'
                          : 'linear-gradient(180deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
                        border: !page2Valid
                          ? '2px solid #64748b'
                          : '2px solid #991b1b',
                        borderRadius: '10px',
                        boxShadow: !page2Valid
                          ? 'none'
                          : '0 4px 0 #7f1d1d, 0 6px 14px rgba(185, 28, 28, 0.35)',
                        cursor: !page2Valid ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        textShadow: '0 1px 3px rgba(0, 0, 0, 0.35)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>🎯</span>
                      <span>Submit &amp; Sling into Action! 🚀</span>
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 1. In-Game 5-Minute Student Check-in Modal (Appendix B2) */}
      {checkinOpen && (
        <div className="modal-overlay checkin-modal modal-active" role="dialog" aria-modal="true">
          <div
            className="modal-card"
            style={{
              maxWidth: '640px',
              width: '95%',
              boxSizing: 'border-box',
              padding: '8px',
              background: '#b45309',
              border: '5px solid #854d0e',
              borderRadius: '22px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.3)',
              position: 'relative'
            }}
          >
            {/* 4 Corner Brass Screws */}
            <div style={{ position: 'absolute', top: '6px', left: '6px', width: '12px', height: '12px', borderRadius: '50%', background: 'radial-gradient(circle, #fef08a 20%, #eab308 60%, #854d0e 100%)', border: '1px solid #713f12', boxShadow: '0 1px 2px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
              <div style={{ width: '7px', height: '1.5px', background: '#542907', transform: 'rotate(45deg)' }} />
            </div>
            <div style={{ position: 'absolute', top: '6px', right: '6px', width: '12px', height: '12px', borderRadius: '50%', background: 'radial-gradient(circle, #fef08a 20%, #eab308 60%, #854d0e 100%)', border: '1px solid #713f12', boxShadow: '0 1px 2px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
              <div style={{ width: '7px', height: '1.5px', background: '#542907', transform: 'rotate(-45deg)' }} />
            </div>
            <div style={{ position: 'absolute', bottom: '6px', left: '6px', width: '12px', height: '12px', borderRadius: '50%', background: 'radial-gradient(circle, #fef08a 20%, #eab308 60%, #854d0e 100%)', border: '1px solid #713f12', boxShadow: '0 1px 2px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
              <div style={{ width: '7px', height: '1.5px', background: '#542907', transform: 'rotate(-45deg)' }} />
            </div>
            <div style={{ position: 'absolute', bottom: '6px', right: '6px', width: '12px', height: '12px', borderRadius: '50%', background: 'radial-gradient(circle, #fef08a 20%, #eab308 60%, #854d0e 100%)', border: '1px solid #713f12', boxShadow: '0 1px 2px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
              <div style={{ width: '7px', height: '1.5px', background: '#542907', transform: 'rotate(45deg)' }} />
            </div>

            {/* Inner White Content Card */}
            <div
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: '#ffffff',
                borderRadius: '16px',
                padding: '16px 18px 14px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch'
              }}
            >
              {/* Header: Left-Aligned Check-in Wooden Plaque & Right-Aligned Interval + Sprites */}
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px',
                  marginBottom: '10px',
                  paddingBottom: '8px',
                  borderBottom: '2px dashed #f1f5f9'
                }}
              >
                {/* Left Side: Clock Badge, Plaque, Subtitle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      minWidth: '42px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      border: '2px solid #b45309',
                      boxShadow: '0 3px 0 #78350f, 0 4px 8px rgba(0,0,0,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px'
                    }}
                  >
                    ⏰
                  </div>
                  <div>
                    {/* Left-Aligned Wooden Plaque Banner */}
                    <div
                      style={{
                        position: 'relative',
                        display: 'inline-flex',
                        alignItems: 'center',
                        background: 'linear-gradient(180deg, #f59e0b 0%, #d97706 60%, #b45309 100%)',
                        border: '2px solid #78350f',
                        borderRadius: '10px',
                        padding: '4px 16px',
                        boxShadow: '0 3px 0 #78350f, 0 4px 8px rgba(0,0,0,0.18)'
                      }}
                    >
                      <div style={{ position: 'absolute', left: '6px', width: '5px', height: '5px', borderRadius: '50%', background: '#78350f', border: '1px solid #451a03' }} />
                      <h2
                        style={{
                          margin: 0,
                          fontFamily: "'Lilita One', 'Impact', -apple-system, sans-serif",
                          fontSize: '19px',
                          fontWeight: 900,
                          color: '#ffffff',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          textShadow: '0 2px 0 #000000, 0 3px 5px rgba(0, 0, 0, 0.8)',
                          lineHeight: 1.1
                        }}
                      >
                        Check-in #<span style={{ color: '#f8fafc' }}>{checkinWindow} </span>of 6
                      </h2>
                      <div style={{ position: 'absolute', right: '6px', width: '5px', height: '5px', borderRadius: '50%', background: '#78350f', border: '1px solid #451a03' }} />
                    </div>

                    {/* <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          background: '#4d7c0f',
                          color: '#ffffff',
                          borderRadius: '9999px',
                          padding: '2px 9px',
                          fontSize: '10px',
                          fontWeight: 800,
                          letterSpacing: '0.3px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                        }}
                      >
                        ● 5-Min Pulse Check • Affective State ●
                      </span>
                    </div> */}
                  </div>
                </div>

                {/* Right Side: Interval Selector & Mini Character Sprites */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#f8fafc',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '10px',
                      padding: '4px 8px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                  >
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      Interval:
                    </span>
                    <select
                      value={timerMode}
                      onChange={(e) => onChangeTimerMode(e.target.value)}
                      style={{
                        background: '#0f172a',
                        color: '#ffffff',
                        border: '1px solid #334155',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="normal">5 Min (Standard)</option>
                      <option value="demo">15 Sec (Demo)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    
                    <img
                      src="/sprites/pig_minion.png"
                      alt="Pig"
                      style={{ width: '28px', height: '28px', objectFit: 'contain', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))' }}
                    />
                  </div>
                </div>
              </div>

              <form onSubmit={handleCheckinSubmit} style={{ width: '100%', boxSizing: 'border-box' }}>
                <div className="modal-body" style={{ maxHeight: '450px', overflowY: 'auto', padding: '2px 4px', width: '100%', boxSizing: 'border-box' }}>
                  {/* Authenticated Participant & Puzzle Card */}
                  <div
                    style={{
                      background: '#fef3c7',
                      border: '1.5px solid #fde047',
                      borderRadius: '12px',
                      padding: '8px 12px',
                      marginBottom: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '6px',
                          background: '#7c3aed',
                          color: '#ffffff',
                          fontWeight: 900,
                          fontSize: '11px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 4px rgba(124, 58, 237, 0.3)'
                        }}
                      >
                        ID
                      </div>
                      <div>
                        <div style={{ fontSize: '9px', fontWeight: 800, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                          Participant
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 900, color: '#1e293b' }}>
                          {checkinId || currentParticipantId || 'P01'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <div
                        style={{
                          background: '#e0f2fe',
                          border: '1.5px solid #93c5fd',
                          color: '#0369a1',
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          fontSize: '11px',
                          fontWeight: 800
                        }}
                      >
                        🧩 Puzzle #{currentLevel.id} • {tierInfo?.name} ({tierInfo?.concept})
                      </div>
                      <div
                        style={{
                          background: '#dcfce7',
                          border: '1.5px solid #86efac',
                          color: '#15803d',
                          padding: '3px 8px',
                          borderRadius: '9999px',
                          fontSize: '10.5px',
                          fontWeight: 800
                        }}
                      >
                        ✓ Active
                      </div>
                    </div>
                  </div>

                  {/* Intro Description */}
                  <div
                    style={{
                      background: '#f0fdf4',
                      border: '1.5px dashed #86efac',
                      borderRadius: '12px',
                      padding: '8px 12px',
                      marginBottom: '10px',
                      fontSize: '11.5px',
                      color: '#166534',
                      lineHeight: '1.45',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span style={{ fontSize: '15px' }}>💡</span>
                    <span>
                      Please answer these 3 quick questions about your current task. Your self-reports are linked with continuous facial emotion analysis.
                    </span>
                  </div>

                  {/* Q2: Feeling right now (7 DeepFace basic emotions) */}
                  <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '10px 12px', marginBottom: '10px' }}>
                    <div className="form-section-title" style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: '1.4' }}>
                      <span>2</span>
                      <div style={{ flex: 1, minWidth: 0, color: '#0f172a' }}>
                        How are you feeling right now? <strong style={{ color: '#dc2626' }}>*</strong>
                      </div>
                    </div>
                    <div className="feeling-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(68px, 1fr))', gap: '6px' }}>
                      {DEEPFACE_EMOTIONS.map((f) => (
                        <label key={f.label} className="feeling-option">
                          <input
                            type="radio"
                            name="checkin_emotion"
                            value={f.label}
                            checked={checkinEmotion === f.label}
                            onChange={() => setCheckinEmotion(f.label)}
                          />
                          <div className="feeling-card" style={{ padding: '8px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <img
                              src={f.icon}
                              alt={f.label}
                              style={{
                                width: '42px',
                                height: '42px',
                                objectFit: 'contain',
                                display: 'block',
                                margin: '0 auto 4px',
                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.18))'
                              }}
                            />
                            <span className="label" style={{ fontSize: '11px', fontWeight: 800 }}>{f.label}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Q3: Task Challenge (1 to 5) */}
                  <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '10px 12px', marginBottom: '10px' }}>
                    <div className="form-section-title" style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: '1.4' }}>
                      <span>3</span>
                      <div style={{ flex: 1, minWidth: 0, color: '#0f172a' }}>
                        How difficult is the current task? <strong style={{ color: '#dc2626' }}>*</strong>
                      </div>
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
                  <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '10px 12px', marginBottom: '10px' }}>
                    <div className="form-section-title" style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: '1.4' }}>
                      <span>4</span>
                      <div style={{ flex: 1, minWidth: 0, color: '#0f172a' }}>
                        How confident are you that you can complete the current task? <strong style={{ color: '#dc2626' }}>*</strong>
                      </div>
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
                      background: '#eff6ff',
                      border: '1.5px solid #bfdbfe',
                      borderRadius: '10px',
                      padding: '8px 12px',
                      fontSize: '11.5px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '10px'
                    }}>
                      <span style={{ color: '#1e3a8a', fontWeight: 700 }}>
                        Balance: Challenge ({checkinChallenge}) − Confidence ({checkinConfidence}) = <strong>{checkinChallenge - checkinConfidence > 0 ? `+${checkinChallenge - checkinConfidence}` : checkinChallenge - checkinConfidence}</strong>
                      </span>
                      <span style={{
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: '#ffffff',
                        border: `1.5px solid ${getFlowState(checkinChallenge, checkinConfidence).color}`,
                        color: getFlowState(checkinChallenge, checkinConfidence).color
                      }}>
                        State: {getFlowState(checkinChallenge, checkinConfidence).state}
                      </span>
                    </div>
                  )}
                </div>

                {/* Submit Action */}
                <div style={{ marginTop: '10px', width: '100%' }}>
                  <button
                    type="submit"
                    disabled={!isCheckinValid}
                    style={{
                      width: '100%',
                      padding: '11px 20px',
                      fontSize: '15px',
                      fontWeight: 900,
                      color: '#ffffff',
                      background: !isCheckinValid
                        ? '#94a3b8'
                        : 'linear-gradient(180deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
                      border: !isCheckinValid
                        ? '2px solid #64748b'
                        : '2px solid #991b1b',
                      borderRadius: '12px',
                      boxShadow: !isCheckinValid
                        ? 'none'
                        : '0 4px 0 #7f1d1d, 0 6px 14px rgba(185, 28, 28, 0.35)',
                      cursor: !isCheckinValid ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      textShadow: '0 1px 3px rgba(0, 0, 0, 0.35)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>🚀</span>
                    <span>Submit Check-in #{checkinWindow} &amp; Resume Coding</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 1.5 30-Minute Game Session Over Modal */}
      {sessionEndOpen && (
        <div className="modal-overlay modal-active" role="dialog" aria-modal="true" style={{ zIndex: 9998 }}>
          <div className="modal-card" style={{ maxWidth: '520px', width: '92%', textAlign: 'center', padding: 0, overflow: 'hidden', border: '3px solid #f59e0b', borderRadius: '20px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
            <div style={{
              background: 'linear-gradient(135deg, #b45309 0%, #d97706 50%, #f59e0b 100%)',
              padding: '28px 24px 20px',
              color: '#fff',
              position: 'relative'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>⏰</div>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}>
                30-Minute Gameplay Over!
              </h2>
              <div style={{ fontSize: '13px', color: '#fef3c7', marginTop: '4px', fontWeight: 600 }}>
                CS413 Affective Computing Study
              </div>
            </div>

            <div style={{ padding: '24px 28px', background: '#fff' }}>
              <p style={{ fontSize: '15px', color: '#334155', lineHeight: '1.6', margin: '0 0 20px 0' }}>
                Thank you for participating in this experiment! Your 30 minutes of gameplay is now complete.
              </p>

              <div style={{
                background: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px 18px',
                marginBottom: '22px',
                fontSize: '13.5px',
                color: '#475569',
                lineHeight: '1.5'
              }}>
                To finalize the study, please answer the short <strong>Post-Test Survey</strong> about your overall gameplay and emotional experience.
              </div>

              <button
                type="button"
                className="btn-primary"
                onClick={onProceedToPosttest}
                style={{
                  width: '100%',
                  padding: '13px 24px',
                  fontSize: '16px',
                  fontWeight: 900,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  background: 'linear-gradient(180deg, #dc2626 0%, #b91c1c 100%)',
                  border: '2px solid #7f1d1d',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)'
                }}
              >
                Proceed to Post-Test Survey 🏁
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Post-Test Survey Modal (Appendix B3) */}
      {posttestOpen && (
        <div className="modal-overlay modal-active" role="dialog" aria-modal="true">
          <div
            className="modal-card"
            style={{
              maxWidth: '700px',
              width: '95%',
              boxSizing: 'border-box',
              padding: '8px',
              background: '#b45309',
              border: '5px solid #854d0e',
              borderRadius: '22px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.3)',
              position: 'relative'
            }}
          >
            {/* 4 Corner Brass Screws */}
            <div style={{ position: 'absolute', top: '6px', left: '6px', width: '12px', height: '12px', borderRadius: '50%', background: 'radial-gradient(circle, #fef08a 20%, #eab308 60%, #854d0e 100%)', border: '1px solid #713f12', boxShadow: '0 1px 2px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
              <div style={{ width: '7px', height: '1.5px', background: '#542907', transform: 'rotate(45deg)' }} />
            </div>
            <div style={{ position: 'absolute', top: '6px', right: '6px', width: '12px', height: '12px', borderRadius: '50%', background: 'radial-gradient(circle, #fef08a 20%, #eab308 60%, #854d0e 100%)', border: '1px solid #713f12', boxShadow: '0 1px 2px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
              <div style={{ width: '7px', height: '1.5px', background: '#542907', transform: 'rotate(-45deg)' }} />
            </div>
            <div style={{ position: 'absolute', bottom: '6px', left: '6px', width: '12px', height: '12px', borderRadius: '50%', background: 'radial-gradient(circle, #fef08a 20%, #eab308 60%, #854d0e 100%)', border: '1px solid #713f12', boxShadow: '0 1px 2px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
              <div style={{ width: '7px', height: '1.5px', background: '#542907', transform: 'rotate(-45deg)' }} />
            </div>
            <div style={{ position: 'absolute', bottom: '6px', right: '6px', width: '12px', height: '12px', borderRadius: '50%', background: 'radial-gradient(circle, #fef08a 20%, #eab308 60%, #854d0e 100%)', border: '1px solid #713f12', boxShadow: '0 1px 2px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
              <div style={{ width: '7px', height: '1.5px', background: '#542907', transform: 'rotate(45deg)' }} />
            </div>

            {/* Inner White Content Card */}
            <div
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: '#ffffff',
                borderRadius: '16px',
                padding: '18px 20px 16px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              {/* Close Button at Top Right */}
              {onClosePosttest && (
                <button
                  type="button"
                  onClick={onClosePosttest}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    borderRadius: '9999px',
                    background: '#f1f5f9',
                    border: '1.5px solid #cbd5e1',
                    color: '#64748b',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '3px 10px',
                    gap: '4px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                    transition: 'all 0.15s ease',
                    zIndex: 10
                  }}
                  title="Close survey"
                >
                  ✕ Close
                </button>
              )}

              {/* Character Lineup */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', marginBottom: '8px', maxWidth: '100%', flexWrap: 'wrap' }}>
                <img src="/sprites/slingshot.png" alt="Slingshot" style={{ width: '30px', height: '48px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                <img src="/sprites/bird_red.png" alt="Red Bird" style={{ width: '44px', height: '44px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                <img src="/sprites/bird_yellow.png" alt="Chuck" style={{ width: '44px', height: '44px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                <img src="/sprites/bird_bomb.png" alt="Bomb" style={{ width: '44px', height: '44px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                <img src="/sprites/pig_minion.png" alt="Minion Pig" style={{ width: '40px', height: '40px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                <img src="/sprites/pig_helmet.png" alt="Helmet Pig" style={{ width: '44px', height: '44px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                <img src="/sprites/pig_mustache.png" alt="Foreman Pig" style={{ width: '44px', height: '44px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
              </div>

              {/* Wooden Plaque Banner ("POST-TEST SURVEY") */}
              <div
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(180deg, #f59e0b 0%, #d97706 60%, #b45309 100%)',
                  border: '2px solid #78350f',
                  borderRadius: '12px',
                  padding: '7px 40px',
                  boxShadow: '0 4px 0 #78350f, 0 6px 14px rgba(0,0,0,0.2)',
                  margin: '4px 0 8px 0',
                  maxWidth: '92%',
                  textAlign: 'center'
                }}
              >
                <div style={{ position: 'absolute', left: '10px', width: '8px', height: '8px', borderRadius: '50%', background: '#78350f', border: '1px solid #451a03' }} />
                <h1
                  style={{
                    margin: 0,
                    fontFamily: "'Lilita One', 'Impact', -apple-system, sans-serif",
                    fontSize: '24px',
                    fontWeight: 900,
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    textShadow: '0 3px 0 #78350f, 0 4px 6px rgba(0,0,0,0.3)',
                    lineHeight: 1.1
                  }}
                >
                  Post-Test Survey 🏆
                </h1>
                <div style={{ position: 'absolute', right: '10px', width: '8px', height: '8px', borderRadius: '50%', background: '#78350f', border: '1px solid #451a03' }} />
              </div>

              {/* Green Subtitle Pill */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#4d7c0f',
                  color: '#ffffff',
                  borderRadius: '9999px',
                  padding: '4px 18px',
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.4px',
                  marginBottom: '12px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  textAlign: 'center'
                }}
              >
                ● CS413 Study • Final Experience &amp; Affective Assessment ●
              </div>

              <form onSubmit={handlePosttestSubmit} style={{ width: '100%', boxSizing: 'border-box' }}>
                <div
                  className="modal-body"
                  style={{
                    maxHeight: '440px',
                    overflowY: 'auto',
                    padding: '2px 4px',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                >
                  {/* Intro description */}
                  <div
                    style={{
                      background: '#f0fdf4',
                      border: '1.5px dashed #86efac',
                      borderRadius: '12px',
                      padding: '10px 14px',
                      marginBottom: '12px',
                      fontSize: '12px',
                      color: '#166534',
                      lineHeight: '1.5'
                    }}
                  >
                    Great job completing the gameplay session! Please answer these final questions about your puzzle-solving experience and feelings.
                  </div>

                  {/* Authenticated Participant Box */}
                  <div
                    style={{
                      background: '#fffbeb',
                      border: '2px solid #fde047',
                      borderRadius: '12px',
                      padding: '8px 12px',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                      flexWrap: 'wrap',
                      boxSizing: 'border-box'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          background: '#7c3aed',
                          color: '#ffffff',
                          fontWeight: 900,
                          fontSize: '11px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 4px rgba(124, 58, 237, 0.3)'
                        }}
                      >
                        ID
                      </div>
                      <div>
                        <div style={{ fontSize: '9px', fontWeight: 800, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                          Authenticated Participant
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 900, color: '#1e293b' }}>
                          Participant {postParticipantId || currentParticipantId || 'P01'}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        background: '#dcfce7',
                        border: '1.5px solid #86efac',
                        color: '#15803d',
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        fontSize: '10.5px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      ✓ Verified
                    </div>
                  </div>

                  {/* 2. Most frequent feeling */}
                  <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px' }}>
                    <div className="form-section-title" style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: '1.4' }}>
                      <span>2</span>
                      <div style={{ flex: 1, minWidth: 0, color: '#0f172a' }}>
                        Overall, which feeling did you experience most often during the activity? <strong style={{ color: '#dc2626' }}>*</strong>
                      </div>
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
                          <div className="feeling-card" style={{ padding: '8px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <img
                              src={f.icon}
                              alt={f.label}
                              style={{
                                width: '42px',
                                height: '42px',
                                objectFit: 'contain',
                                display: 'block',
                                margin: '0 auto 4px',
                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.18))'
                              }}
                            />
                            <span className="label" style={{ fontSize: '11px', fontWeight: 800 }}>{f.label}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 3. Overall difficulty */}
                  <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px' }}>
                    <div className="form-section-title" style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: '1.4' }}>
                      <span>3</span>
                      <div style={{ flex: 1, minWidth: 0, color: '#0f172a' }}>
                        Overall, how difficult was the activity? <strong style={{ color: '#dc2626' }}>*</strong>
                      </div>
                    </div>
                    <Scale name="post_diff" value={postDifficulty} onChange={setPostDifficulty} lowLabel="1 (Very easy)" highLabel="5 (Very difficult)" />
                  </div>

                  {/* 4. Future confidence */}
                  <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px' }}>
                    <div className="form-section-title" style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: '1.4' }}>
                      <span>4</span>
                      <div style={{ flex: 1, minWidth: 0, color: '#0f172a' }}>
                        After this activity, how confident are you that you can solve similar puzzles? <strong style={{ color: '#dc2626' }}>*</strong>
                      </div>
                    </div>
                    <Scale name="post_conf" value={postConfidence} onChange={setPostConfidence} lowLabel="1 (Not confident at all)" highLabel="5 (Very confident)" />
                  </div>

                  {/* 5. Performance */}
                  <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px' }}>
                    <div className="form-section-title" style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: '1.4' }}>
                      <span>5</span>
                      <div style={{ flex: 1, minWidth: 0, color: '#0f172a' }}>
                        How well do you think you performed in the activity? <strong style={{ color: '#dc2626' }}>*</strong>
                      </div>
                    </div>
                    <Scale name="post_perf" value={postPerformance} onChange={setPostPerformance} lowLabel="1 (Very poorly)" highLabel="5 (Very well)" />
                  </div>

                  {/* 6. Engagement */}
                  <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px' }}>
                    <div className="form-section-title" style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: '1.4' }}>
                      <span>6</span>
                      <div style={{ flex: 1, minWidth: 0, color: '#0f172a' }}>
                        How engaged or interested were you during the activity? <strong style={{ color: '#dc2626' }}>*</strong>
                      </div>
                    </div>
                    <Scale name="post_eng" value={postEngagement} onChange={setPostEngagement} lowLabel="1 (Not engaged at all)" highLabel="5 (Very engaged)" />
                  </div>

                  {/* 7. Recording comfort */}
                  <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px' }}>
                    <div className="form-section-title" style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: '1.4' }}>
                      <span>7</span>
                      <div style={{ flex: 1, minWidth: 0, color: '#0f172a' }}>
                        How comfortable were you with having your face and screen recorded? <strong style={{ color: '#dc2626' }}>*</strong>
                      </div>
                    </div>
                    <Scale name="post_comf" value={postRecordingComfort} onChange={setPostRecordingComfort} lowLabel="1 (Very uncomfortable)" highLabel="5 (Very comfortable)" />
                  </div>

                  {/* 8. Comments */}
                  <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px' }}>
                    <div className="form-section-title" style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: '1.4' }}>
                      <span>8</span>
                      <div style={{ flex: 1, minWidth: 0, color: '#0f172a' }}>
                        Any comments or suggestions? (Optional)
                      </div>
                    </div>
                    <textarea
                      className="form-textarea"
                      placeholder="Share your thoughts about the puzzles, game difficulty, or check-ins..."
                      value={postComments}
                      onChange={(e) => setPostComments(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '14px', width: '100%', boxSizing: 'border-box' }}>
                  <button
                    type="submit"
                    disabled={!isPosttestValid}
                    style={{
                      width: '100%',
                      padding: '12px 24px',
                      fontSize: '15.5px',
                      fontWeight: 900,
                      color: '#ffffff',
                      background: !isPosttestValid
                        ? '#94a3b8'
                        : 'linear-gradient(180deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
                      border: !isPosttestValid
                        ? '2px solid #64748b'
                        : '2px solid #991b1b',
                      borderRadius: '12px',
                      boxShadow: !isPosttestValid
                        ? 'none'
                        : '0 4px 0 #7f1d1d, 0 6px 14px rgba(185, 28, 28, 0.35)',
                      cursor: !isPosttestValid ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      textShadow: '0 1px 3px rgba(0, 0, 0, 0.35)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>🏆</span>
                    <span>Submit Post-Test Survey 🚀</span>
                  </button>
                </div>
              </form>
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

      {/* 7. Check-in & Minute Telemetry History Modal */}
      {historyModalOpen && (
        <div className="modal-overlay modal-active" role="dialog" aria-modal="true">
          <div className="modal-card" style={{ maxWidth: '840px', width: '95%' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '18px' }}>
                  <span>📊</span> Research Dataset
                </h3>
                {/* Segmented Tab Switcher */}
                <div style={{ display: 'flex', background: '#0f172a', borderRadius: '8px', padding: '3px', border: '1px solid #334155' }}>
                  <button
                    type="button"
                    onClick={() => setHistoryTab('minute')}
                    style={{
                      background: historyTab === 'minute' ? '#0284c7' : 'transparent',
                      color: historyTab === 'minute' ? '#fff' : '#94a3b8',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 12px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    ⏱️ Minute Log (1–30)
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryTab('checkin')}
                    style={{
                      background: historyTab === 'checkin' ? '#0284c7' : 'transparent',
                      color: historyTab === 'checkin' ? '#fff' : '#94a3b8',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 12px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    📋 Check-ins (Table 8)
                  </button>
                </div>
              </div>

              {/* CSV Export Button */}
              {historyTab === 'minute' ? (
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: '12px', padding: '5px 14px', background: '#0284c7', color: '#fff', border: '1px solid #0369a1' }}
                  onClick={() => {
                    const headers = ['Minute', 'Puzzle no.', 'Tier', 'Attempts', 'Resets', 'Idle (s)', 'Solved (0/1)'];
                    const rows = [];
                    for (let m = 1; m <= 30; m++) {
                      const log = (minuteLogsData || []).find((r) => r.minute_number === m);
                      rows.push([
                        m,
                        `"${log?.puzzle_no || ''}"`,
                        `"${log?.tier || ''}"`,
                        log !== undefined ? log.attempts : '',
                        log !== undefined ? log.resets : '',
                        log !== undefined ? log.idle_seconds : '',
                        log !== undefined ? log.solved : ''
                      ]);
                      if (m % 5 === 0 && m <= 30) {
                        rows.push([`Check-in ${m / 5}`, '', '', '', '', '', '']);
                      }
                    }
                    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement('a');
                    link.setAttribute('href', encodedUri);
                    link.setAttribute('download', `minute_logs_${currentParticipantId || 'P01'}_${Date.now()}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  📥 Export Minute CSV
                </button>
              ) : (
                historyData.length > 0 && (
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: '12px', padding: '5px 14px' }}
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
                    📥 Export Check-ins CSV
                  </button>
                )
              )}
            </div>

            <div className="modal-body" style={{ padding: '16px', maxHeight: '440px', overflowY: 'auto' }}>
              {historyTab === 'minute' ? (
                <div>
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
                    Minute-by-minute telemetry recorded across the 30-minute gameplay session (Participant: <strong>{currentParticipantId || 'P01'}</strong>):
                  </p>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '12px', border: '1px solid #cbd5e1' }}>
                    <thead>
                      <tr style={{ background: '#dbeafe', color: '#1e3a8a', fontWeight: 800 }}>
                        <th style={{ padding: '7px 8px', border: '1px solid #93c5fd' }}>Minute</th>
                        <th style={{ padding: '7px 8px', border: '1px solid #93c5fd' }}>Puzzle no.</th>
                        <th style={{ padding: '7px 8px', border: '1px solid #93c5fd' }}>Tier</th>
                        <th style={{ padding: '7px 8px', border: '1px solid #93c5fd' }}>Attempts</th>
                        <th style={{ padding: '7px 8px', border: '1px solid #93c5fd' }}>Resets</th>
                        <th style={{ padding: '7px 8px', border: '1px solid #93c5fd' }}>Idle (s)</th>
                        <th style={{ padding: '7px 8px', border: '1px solid #93c5fd' }}>Solved (0/1)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...Array(30)].map((_, i) => {
                        const minNum = i + 1;
                        const log = (minuteLogsData || []).find((r) => r.minute_number === minNum);
                        const isDivider = minNum % 5 === 0 && minNum <= 30;
                        const checkinNum = minNum / 5;
                        return (
                          <React.Fragment key={minNum}>
                            <tr style={{ background: log ? '#ffffff' : '#f8fafc', color: log ? '#0f172a' : '#94a3b8' }}>
                              <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', fontWeight: 700 }}>{minNum}</td>
                              <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1' }}>{log?.puzzle_no || '—'}</td>
                              <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1' }}>{log?.tier || '—'}</td>
                              <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1' }}>{log !== undefined ? log.attempts : '—'}</td>
                              <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1' }}>{log !== undefined ? log.resets : '—'}</td>
                              <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1' }}>{log !== undefined ? log.idle_seconds : '—'}</td>
                              <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', fontWeight: log?.solved ? 700 : 400, color: log?.solved ? '#16a34a' : 'inherit' }}>
                                {log !== undefined ? log.solved : '—'}
                              </td>
                            </tr>
                            {isDivider && (
                              <tr style={{ background: '#dbeafe', color: '#1e40af', fontWeight: 800 }}>
                                <td colSpan="7" style={{ padding: '6px 8px', border: '1px solid #93c5fd', textAlign: 'center', letterSpacing: '0.5px' }}>
                                  Check-in {checkinNum}
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div>
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
                              <span style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                {DEEPFACE_EMOTIONS.find(e => e.label === item.emotion)?.icon ? (
                                  <img
                                    src={DEEPFACE_EMOTIONS.find(e => e.label === item.emotion)?.icon}
                                    alt={item.emotion}
                                    style={{ width: '22px', height: '22px', objectFit: 'contain' }}
                                  />
                                ) : (
                                  DEEPFACE_EMOTIONS.find(e => e.label === item.emotion)?.emoji
                                )}
                                <span>{item.emotion}</span>
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
              )}
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
