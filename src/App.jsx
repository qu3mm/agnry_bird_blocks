import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import TierBar from './components/TierBar';
import InstructionBanner from './components/InstructionBanner';
import GameArea from './components/GameArea';
import Modals from './components/Modals';
import LoginModal from './components/LoginModal';
import { TIERS, LEVELS, STUDY_LEVEL_COUNT } from './data/levels';
import { MazeRenderer } from './utils/maze';
import { BlockWorkspace } from './utils/blocks'; // interactive block workspace
import { soundFX } from './utils/audio';
import { dbInsert, supabase } from './utils/supabase';
import confetti from 'canvas-confetti';

// Helper to determine if a participant's 30-minute gameplay or study has ended
function isGameEnded(pid) {
  if (!pid) return false;
  try {
    if (localStorage.getItem(`hoc_posttest_${pid}`)) return true;
    if (localStorage.getItem(`hoc_session_finished_${pid}`)) return true;
    const start = localStorage.getItem(`hoc_session_start_${pid}`);
    if (start && Date.now() - parseInt(start, 10) >= 1800 * 1000) {
      localStorage.setItem(`hoc_session_finished_${pid}`, 'true');
      return true;
    }
    const win = localStorage.getItem(`hoc_checkin_win_${pid}`);
    if (win && parseInt(win, 10) > 6) {
      localStorage.setItem(`hoc_session_finished_${pid}`, 'true');
      return true;
    }
    const min = localStorage.getItem(`hoc_minute_num_${pid}`);
    if (min && parseInt(min, 10) > 30) {
      localStorage.setItem(`hoc_session_finished_${pid}`, 'true');
      return true;
    }
  } catch {}
  return false;
}

export default function App() {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [currentTierFilter, setCurrentTierFilter] = useState('all');
  const [studyComplete, setStudyComplete] = useState(() => {
    try {
      const pid = localStorage.getItem('hoc_participant_id');
      if (!pid) return false;
      return !!localStorage.getItem(`hoc_posttest_${pid}`);
    } catch {
      return false;
    }
  });

  // Confetti celebration when study is complete (including on refresh)
  useEffect(() => {
    if (studyComplete) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}
    }
  }, [studyComplete]);
  const [isRunning, setIsRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // 30-Minute Overall Experiment Timer Persistence
  const [sessionStartTime, setSessionStartTime] = useState(() => {
    try {
      const pid = localStorage.getItem('hoc_participant_id');
      const saved = localStorage.getItem(`hoc_session_start_${pid || 'default'}`);
      return saved ? parseInt(saved, 10) : null;
    } catch {
      return null;
    }
  });

  // Timer State (5-minute interval timer)
  const [timerMode, setTimerMode] = useState('normal'); // 'normal' (300s) or 'demo' (15s)
  const [timerTotal, setTimerTotal] = useState(300);
  const [timerSeconds, setTimerSeconds] = useState(() => {
    try {
      const pid = localStorage.getItem('hoc_participant_id');
      const isFinished = !!localStorage.getItem(`hoc_session_finished_${pid || 'default'}`);
      if (isFinished) return 0;
      const saved = localStorage.getItem(`hoc_timer_secs_${pid || 'default'}`);
      const val = saved ? parseInt(saved, 10) : 300;
      return val <= 0 ? 300 : val;
    } catch {
      return 300;
    }
  });
  const [isTimerRunning, setIsTimerRunning] = useState(() => {
    try {
      const pid = localStorage.getItem('hoc_participant_id');
      if (!pid) return false;
      if (localStorage.getItem(`hoc_posttest_${pid}`)) return false;
      if (localStorage.getItem(`hoc_session_finished_${pid}`)) return false;
      if (isGameEnded(pid)) return false;
      return true;
    } catch {
      return false;
    }
  });

  // Participant ID State
  const [participantId, setParticipantId] = useState(() => {
    try {
      return localStorage.getItem('hoc_participant_id') || '';
    } catch {
      return '';
    }
  });

  // Login Modal State (opens if no participantId is set)
  const [loginOpen, setLoginOpen] = useState(!participantId);

  // Welcome Banner State (only shown after participant is logged in)
  const [welcomeOpen, setWelcomeOpen] = useState(false);

  // Pre-test Survey State (opens after welcome or when explicitly requested)
  const [pretestOpen, setPretestOpen] = useState(false);
  const [pretestCompleted, setPretestCompleted] = useState(() => {
    try {
      const pid = localStorage.getItem('hoc_participant_id');
      return !!localStorage.getItem(`hoc_pretest_${pid || 'default'}`) || !!localStorage.getItem('hoc_pretest_survey');
    } catch {
      return false;
    }
  });

  const handleStartFromWelcome = () => {
    setWelcomeOpen(false);
    if (!pretestCompleted) {
      setPretestOpen(true);
    }
  };

  const handleOpenPretestFromWelcome = () => {
    setWelcomeOpen(false);
    setPretestOpen(true);
  };

  const handleLogin = async (id) => {
    setParticipantId(id);
    try {
      localStorage.setItem('hoc_participant_id', id);
    } catch {}
    setLoginOpen(false);
    showToast(`👋 Logged in as ${id}!`);

    // Check localStorage first
    let isDone = !!localStorage.getItem(`hoc_pretest_${id}`);

    // Check Supabase for pre-test if not found locally
    if (!isDone) {
      try {
        const { data } = await supabase
          .from('pre_test')
          .select('id')
          .eq('participant_id', id)
          .limit(1);
        if (data && data.length > 0) {
          isDone = true;
          localStorage.setItem(`hoc_pretest_${id}`, 'true');
        }
      } catch (e) {
        console.warn('[pretest check error]', e);
      }
    }

    setPretestCompleted(isDone);

    // Check if post-test was already completed
    let isPostDone = !!localStorage.getItem(`hoc_posttest_${id}`);
    if (!isPostDone) {
      try {
        const { data: postData } = await supabase
          .from('post_test')
          .select('id')
          .eq('participant_id', id)
          .limit(1);
        if (postData && postData.length > 0) {
          isPostDone = true;
          localStorage.setItem(`hoc_posttest_${id}`, 'true');
        }
      } catch (e) {
        console.warn('[posttest check error]', e);
      }
    }
    setStudyComplete(isPostDone);
    if (isPostDone) {
      setSessionEndOpen(false);
      setIsTimerRunning(false);
    } else if (isGameEnded(id)) {
      setSessionEndOpen(true);
      setIsTimerRunning(false);
    }

    if (!isDone) {
      setWelcomeOpen(true);
    }
  };

  // Check-in window tracking (Window 1 through 6 per 30-min session)
  const [checkinWindow, setCheckinWindow] = useState(() => {
    try {
      const pid = localStorage.getItem('hoc_participant_id');
      const saved = localStorage.getItem(`hoc_checkin_win_${pid || 'default'}`);
      return saved ? parseInt(saved, 10) : 1;
    } catch {
      return 1;
    }
  });

  // Modals State
  const [sessionEndOpen, setSessionEndOpen] = useState(() => {
    try {
      const pid = localStorage.getItem('hoc_participant_id');
      const isPostDone = !!localStorage.getItem(`hoc_posttest_${pid || 'default'}`);
      // If post-test is already completed, do NOT show the 30-min prompt again
      if (isPostDone) return false;
      return !!localStorage.getItem(`hoc_session_finished_${pid || 'default'}`);
    } catch {
      return false;
    }
  });
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [posttestOpen, setPosttestOpen] = useState(false);
  const [certOpen, setCertOpen] = useState(false);
  const [winOpen, setWinOpen] = useState(false);
  const [winBlockCount, setWinBlockCount] = useState(0);
  const [winJsCode, setWinJsCode] = useState('');
  const [feedback, setFeedback] = useState({ open: false, title: '', msg: '' });
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [codeContent, setCodeContent] = useState('');
  const [hintModalOpen, setHintModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [minuteLogsData, setMinuteLogsData] = useState(() => {
    try {
      const pid = localStorage.getItem('hoc_participant_id');
      if (!pid) return [];
      return JSON.parse(localStorage.getItem(`hoc_minute_logs_${pid}`) || '[]');
    } catch {
      return [];
    }
  });
  const [toast, setToast] = useState(null);

  // Keep track of current level without triggering timer re-runs
  const currentLevelIndexRef = useRef(currentLevelIndex);
  useEffect(() => {
    currentLevelIndexRef.current = currentLevelIndex;
  }, [currentLevelIndex]);

  // Set of already logged minute numbers (prevents duplicates)
  const loggedMinutesRef = useRef(new Set());
  useEffect(() => {
    if (participantId) {
      try {
        const stored = JSON.parse(localStorage.getItem(`hoc_minute_logs_${participantId}`) || '[]');
        stored.forEach((r) => loggedMinutesRef.current.add(r.minute_number));
        setMinuteLogsData(stored);
      } catch {}
    }
  }, [participantId]);

  // DOM Refs
  const mazeContainerRef = useRef(null);
  const toolboxRef = useRef(null);
  const workspaceRef = useRef(null);
  const blockCountRef = useRef(null);

  // Class Engine Instances
  const mazeRendererRef = useRef(null);
  const workspaceInstanceRef = useRef(null);
  const runCanceledRef = useRef(false);

  // Toast Notification helper
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  // ── Minute-by-Minute Telemetry Tracker ─────────────────────────────────────
  const minuteStatsRef = useRef({
    puzzles: new Set(),
    attempts: 0,
    resets: 0,
    solved: 0,
    idleSeconds: 0
  });
  const lastActivityTimeRef = useRef(Date.now());

  // ── Per-Puzzle Telemetry Tracker ──────────────────────────────────────────
  const puzzleStartTimeRef = useRef(Date.now());
  const puzzleStatsRef = useRef({
    attempts: 0,
    resets: 0,
    crashes: 0
  });

  // Track user activity to measure idle time
  useEffect(() => {
    const markActive = () => {
      lastActivityTimeRef.current = Date.now();
    };
    window.addEventListener('mousemove', markActive);
    window.addEventListener('keydown', markActive);
    window.addEventListener('click', markActive);
    window.addEventListener('touchstart', markActive);
    return () => {
      window.removeEventListener('mousemove', markActive);
      window.removeEventListener('keydown', markActive);
      window.removeEventListener('click', markActive);
      window.removeEventListener('touchstart', markActive);
    };
  }, []);

  // Initialize Engines & Load Level 0
  useEffect(() => {
    // Load check-in history from localStorage
    try {
      const stored = localStorage.getItem('hoc_checkin_history');
      if (stored) setHistoryData(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }

    if (mazeContainerRef.current && toolboxRef.current && workspaceRef.current && blockCountRef.current) {
      const renderer = new MazeRenderer('maze-container');
      renderer.container = mazeContainerRef.current;
      mazeRendererRef.current = renderer;

      const ws = new BlockWorkspace('toolbox-blocks', 'workspace-canvas', 'workspace-block-count');
      ws.toolboxEl = toolboxRef.current;
      ws.workspaceEl = workspaceRef.current;
      ws.blockCountEl = blockCountRef.current;
      ws.init();
      workspaceInstanceRef.current = ws;

      const level = LEVELS[0];
      renderer.init(level);
      ws.loadLevel(level);
    }

    return () => {
      if (workspaceInstanceRef.current) {
        workspaceInstanceRef.current.destroy();
      }
    };
  }, []);

  // Handle Level Selection
  const loadLevel = useCallback(
    (index) => {
      if (index < 0 || index >= LEVELS.length) return;
      const pid = localStorage.getItem('hoc_participant_id');
      if (isGameEnded(pid)) return;
      runCanceledRef.current = true;
      setIsRunning(false);
      setCurrentLevelIndex(index);

      const level = LEVELS[index];
      // Reset per-puzzle timer and telemetry counters
      puzzleStartTimeRef.current = Date.now();
      puzzleStatsRef.current = {
        attempts: 0,
        resets: 0,
        crashes: 0
      };
      if (mazeRendererRef.current) {
        mazeRendererRef.current.init(level);
      }
      if (workspaceInstanceRef.current) {
        workspaceInstanceRef.current.loadLevel(level);
      }
    },
    []
  );

  // Handle Tier Selection
  const handleSelectTier = (tierId) => {
    const pid = localStorage.getItem('hoc_participant_id');
    if (isGameEnded(pid)) return;
    setCurrentTierFilter(tierId);
    if (tierId !== 'all') {
      const firstOfTier = LEVELS.findIndex((l) => l.tier === tierId);
      if (firstOfTier !== -1 && LEVELS[currentLevelIndex].tier !== tierId) {
        loadLevel(firstOfTier);
      }
    }
  };

  // Timer Tick Interval & Minute Telemetry (Unified 1-Second Master Clock)
  useEffect(() => {
    if (
      !participantId ||
      !isTimerRunning ||
      checkinOpen ||
      pretestOpen ||
      loginOpen ||
      !pretestCompleted ||
      sessionEndOpen ||
      studyComplete ||
      isGameEnded(participantId)
    ) {
      return;
    }

    // Initialize session start time if not yet started
    if (!sessionStartTime) {
      const now = Date.now();
      setSessionStartTime(now);
      try {
        localStorage.setItem(`hoc_session_start_${participantId}`, String(now));
      } catch {}
    }

    const interval = setInterval(() => {
      // 1. Check if session has ended
      if (isGameEnded(participantId)) {
        clearInterval(interval);
        setIsTimerRunning(false);
        if (!studyComplete) {
          setSessionEndOpen(true);
        }
        return;
      }

      // Track idle seconds (>3s of inactivity)
      if (Date.now() - lastActivityTimeRef.current > 3000) {
        minuteStatsRef.current.idleSeconds += 1;
      }

      // Track active puzzle level
      const curLvl = LEVELS[currentLevelIndexRef.current];
      if (curLvl) {
        minuteStatsRef.current.puzzles.add(curLvl.id);
      }

      // 2. Decrement countdown and trigger minute telemetry & check-ins
      setTimerSeconds((prev) => {
        const next = prev <= 1 ? 0 : prev - 1;
        try {
          localStorage.setItem(`hoc_timer_secs_${participantId}`, String(next));
        } catch {}

        // Each 5-minute window consists of 5 minutes:
        // Normal mode: timerTotal = 300, secsPerMin = 60
        // Demo mode: timerTotal = 15, secsPerMin = 3
        const secsPerMin = timerMode === 'demo' ? 3 : 60;
        const elapsedInWindow = timerTotal - next;

        // When a full minute has elapsed in this window:
        if (elapsedInWindow > 0 && elapsedInWindow % secsPerMin === 0) {
          const minInWin = Math.round(elapsedInWindow / secsPerMin);
          const currentMin = (checkinWindow - 1) * 5 + minInWin;

          if (currentMin <= 30 && !loggedMinutesRef.current.has(currentMin) && !isGameEnded(participantId)) {
            loggedMinutesRef.current.add(currentMin);
            try {
              localStorage.setItem(`hoc_minute_num_${participantId}`, String(currentMin + 1));
            } catch {}

            const stats = minuteStatsRef.current;
            const puzzleList = Array.from(stats.puzzles).sort((a, b) => a - b).join(', ') || String(curLvl?.id || 1);
            const tierName = curLvl?.tier ? (TIERS[curLvl.tier]?.name || curLvl.tier) : 'Easy';

            const logRecord = {
              participant_id: participantId,
              minute_number: currentMin,
              puzzle_no: puzzleList,
              tier: tierName,
              attempts: stats.attempts,
              resets: stats.resets,
              idle_seconds: Math.min(secsPerMin, stats.idleSeconds),
              solved: stats.solved > 0 ? 1 : 0
            };

            dbInsert('minute_logs', logRecord);

            try {
              const existing = JSON.parse(localStorage.getItem(`hoc_minute_logs_${participantId}`) || '[]');
              const updated = [...existing.filter((r) => r.minute_number !== currentMin), logRecord].sort((a, b) => a.minute_number - b.minute_number);
              localStorage.setItem(`hoc_minute_logs_${participantId}`, JSON.stringify(updated));
              setMinuteLogsData(updated);
            } catch {}

            // Reset stats for the upcoming minute
            minuteStatsRef.current = {
              puzzles: new Set([curLvl?.id || 1]),
              attempts: 0,
              resets: 0,
              solved: 0,
              idleSeconds: 0
            };
          }
        }

        // 3. Check window completion
        if (next <= 0) {
          // If all 6 check-in windows (30 minutes) are complete:
          if (checkinWindow >= 6) {
            setIsTimerRunning(false);
            try {
              localStorage.setItem(`hoc_session_finished_${participantId}`, 'true');
            } catch {}
            if (!studyComplete) {
              setSessionEndOpen(true);
            }
            return 0;
          }

          // Otherwise, 5-minute interval reached -> trigger check-in
          soundFX.playTimerChime();
          setCheckinOpen(true);
          return 0;
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [
    isTimerRunning,
    checkinOpen,
    pretestOpen,
    loginOpen,
    pretestCompleted,
    participantId,
    sessionStartTime,
    sessionEndOpen,
    studyComplete,
    checkinWindow,
    timerTotal,
    timerMode
  ]);

  // Pre-test Submission
  const handlePretestSubmit = (data) => {
    try {
      localStorage.setItem('hoc_pretest_survey', JSON.stringify(data));
      if (data.participantId) {
        localStorage.setItem(`hoc_pretest_${data.participantId}`, JSON.stringify(data));
        localStorage.setItem('hoc_participant_id', data.participantId);
        setParticipantId(data.participantId);
      }
    } catch (e) {
      console.error(e);
    }
    dbInsert('pre_test', {
      participant_id:     data.participantId,
      programming_skill:  data.programmingSkill,
      experience_level:   data.experienceLevel,
      hours_per_week:     data.hoursPerWeek,
      block_experience:   data.blockExperience,
      valence:            data.valence,
      arousal:            data.arousal,
      pretest_confidence: data.pretestConfidence,
      difficulty_expect:  data.difficultyExpect,
      submitted_at:       data.submittedAt,
    });
    setPretestOpen(false);
    setPretestCompleted(true);
    showToast(`✨ Pre-test submitted! Participant: ${data.participantId || 'P01'}`);
    soundFX.playWin();
  };

  // Timer Mode Switch
  const handleChangeTimerMode = (mode) => {
    setTimerMode(mode);
    const secs = mode === 'demo' ? 15 : 300;
    setTimerTotal(secs);
    setTimerSeconds(secs);
  };

  // Manual Trigger Check-in
  const handleTestCheckin = () => {
    if (sessionEndOpen || checkinWindow > 6 || isGameEnded(participantId) || studyComplete) {
      showToast('⚠️ 30-Minute session is completed.');
      return;
    }
    soundFX.playTimerChime();
    setCheckinOpen(true);
  };

  // Check-in Submission (Appendix B2)
  const handleSubmitCheckin = (data) => {
    const updated = [data, ...historyData];
    setHistoryData(updated);
    try {
      localStorage.setItem('hoc_checkin_history', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    dbInsert('check_in', {
      participant_id:   data.participantId,
      checkin_window:   data.window,
      emotion:          data.emotion,
      emotion_category: data.emotionCategory,
      challenge:        data.challenge,
      confidence:       data.confidence,
      balance:          data.balance,
      flow_state:       data.flowState,
      level_id:         data.levelId,
      tier:             data.tier,
      timestamp:        data.timestamp,
    });

    setCheckinOpen(false);
    showToast(`✨ Check-in #${data.window} recorded! State: ${data.flowState}`);
    soundFX.playWin();

    // Advance window counter (up to 6)
    setCheckinWindow((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem(`hoc_checkin_win_${data.participantId}`, String(next));
      } catch {}
      return next;
    });

    // If 6 check-ins completed (30-min gameplay session complete), show Session Over modal!
    if (data.window >= 6) {
      try {
        localStorage.setItem(`hoc_session_finished_${data.participantId}`, 'true');
      } catch {}
      setTimeout(() => {
        setIsTimerRunning(false);
        setSessionEndOpen(true);
      }, 800);
      return;
    }

    // Reset and resume timer
    const resetSecs = timerMode === 'demo' ? 15 : 300;
    setTimerSeconds(resetSecs);
    try {
      localStorage.setItem(`hoc_timer_secs_${data.participantId}`, String(resetSecs));
    } catch {}
    setIsTimerRunning(true);
  };

  // Post-Test Submission (Appendix B3)
  const handlePosttestSubmit = (data) => {
    const pid = data.participantId || participantId;
    if (!pid || localStorage.getItem(`hoc_posttest_${pid}`)) {
      showToast('✓ You have already submitted the Post-test survey.');
      setPosttestOpen(false);
      setStudyComplete(true);
      return;
    }

    try {
      localStorage.setItem('hoc_posttest_survey', JSON.stringify(data));
      localStorage.setItem(`hoc_posttest_${pid}`, 'true');
      localStorage.setItem(`hoc_session_finished_${pid}`, 'true');
    } catch (e) {
      console.error(e);
    }
    dbInsert('post_test', {
      participant_id:        pid,
      dominant_emotion:      data.dominantEmotion,
      overall_difficulty:    data.overallDifficulty,
      future_confidence:     data.futureConfidence,
      perceived_performance: data.perceivedPerformance,
      engagement_level:      data.engagementLevel,
      recording_comfort:     data.recordingComfort,
      comments:              data.comments,
      submitted_at:          data.submittedAt,
    });
    setStudyComplete(true);
    setPosttestOpen(false);
    setIsTimerRunning(false);

    // Fire celebratory confetti for completing the research study!
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 300);
    } catch {}

    showToast('🎉 Thank you! Your participation in the study is complete.');
    soundFX.playWin();
  };

  // Sound Toggle
  const handleToggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundFX.setMuted(nextMuted);
  };

  // Execution Speed (1x or 2x)
  const [speed, setSpeed] = useState(1);

  // Single Step Execution
  const handleStep = async () => {
    if (!participantId) {
      setLoginOpen(true);
      return;
    }
    if (studyComplete) {
      showToast('🏆 Study completed! Gameplay is closed.');
      return;
    }
    if (!pretestCompleted) {
      setPretestOpen(true);
      return;
    }
    if (sessionEndOpen || isGameEnded(participantId)) {
      setSessionEndOpen(true);
      showToast('⚠️ 30-Minute gameplay has ended.');
      return;
    }
    if (isRunning || !workspaceInstanceRef.current || !mazeRendererRef.current) return;
    const ws = workspaceInstanceRef.current;
    const renderer = mazeRendererRef.current;
    const tree = ws.getExecutionTree();
    if (tree.length === 0) return;

    soundFX.playClick();
    const node = tree[0];
    if (node) {
      ws.highlightBlock(node.id);
      if (node.type === 'move_forward' || node.type === 'jump') {
        const res = await renderer.moveForward();
        if (res.reachedPig) soundFX.playWin();
      } else if (node.type === 'turn_left') {
        await renderer.turnLeft();
      } else if (node.type === 'turn_right') {
        await renderer.turnRight();
      } else if (node.type === 'slingshot_launch') {
        soundFX.playLaunch();
        await renderer.moveForward();
        await renderer.moveForward();
      } else if (node.type === 'smash_pig') {
        soundFX.playWin();
      }
    }
  };

  // Reset Run
  const resetRun = () => {
    minuteStatsRef.current.resets += 1;
    puzzleStatsRef.current.resets += 1;
    runCanceledRef.current = true;
    setIsRunning(false);
    const level = LEVELS[currentLevelIndex];
    if (mazeRendererRef.current) {
      mazeRendererRef.current.init(level);
    }
    if (workspaceInstanceRef.current) {
      workspaceInstanceRef.current.highlightBlock(null);
    }
  };

  // Toggle Run / Reset
  const handleToggleRun = () => {
    if (isRunning) {
      resetRun();
    } else {
      runProgram();
    }
  };

  // Start Over Workspace Blocks
  const handleStartOver = () => {
    if (studyComplete || sessionEndOpen || isGameEnded(participantId)) return;
    if (window.confirm('Reset blocks back to the start of this puzzle?')) {
      minuteStatsRef.current.resets += 1;
      loadLevel(currentLevelIndex);
      soundFX.playTrash();
    }
  };

  // Show Code Modal
  const handleShowCode = () => {
    if (workspaceInstanceRef.current) {
      setCodeContent(workspaceInstanceRef.current.getJavaScriptCode());
    }
    setCodeModalOpen(true);
  };

  // Speak Instruction (TTS)
  const handleSpeakInstruction = () => {
    const level = LEVELS[currentLevelIndex];
    if (!level || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const spokenText = `Level ${level.id}. ${level.title.replace(/^Puzzle \d+:\s*/, '')}. ${level.instruction}`;
    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
    soundFX.playClick();
  };

  // =========================================================================
  // Program Execution Engine (Supports Loops, Nested Loops & Conditionals)
  // =========================================================================
  const runProgram = async () => {
    if (!participantId) {
      setLoginOpen(true);
      return;
    }
    if (studyComplete) {
      showToast('🏆 Study completed! Gameplay is closed.');
      return;
    }
    if (!pretestCompleted) {
      setPretestOpen(true);
      return;
    }
    if (sessionEndOpen || isGameEnded(participantId)) {
      setSessionEndOpen(true);
      showToast('⚠️ 30-Minute gameplay has ended.');
      return;
    }
    if (isRunning || !workspaceInstanceRef.current || !mazeRendererRef.current) return;

    setIsRunning(true);
    minuteStatsRef.current.attempts += 1;
    puzzleStatsRef.current.attempts += 1;
    runCanceledRef.current = false;

    const ws = workspaceInstanceRef.current;
    const renderer = mazeRendererRef.current;
    const tree = ws.getExecutionTree();

    if (tree.length === 0) {
      setFeedback({
        open: true,
        title: 'No blocks attached!',
        msg: "Snap some action or loop blocks under 'when run' to make the bird move."
      });
      setIsRunning(false);
      return;
    }

    soundFX.playLaunch();

    let executionStepCount = 0;
    const maxSafetySteps = 150;

    const executeNodeList = async (nodes) => {
      for (const node of nodes) {
        if (runCanceledRef.current) return { stopped: true };
        if (renderer.hasReachedPig()) return { reachedPig: true };

        executionStepCount++;
        if (executionStepCount > maxSafetySteps) {
          return { crashed: false, timeout: true };
        }

        const res = await executeSingleNode(node);
        if (res.crashed || res.reachedPig || res.stopped || res.timeout) {
          return res;
        }
      }
      return { completedList: true };
    };

    const executeSingleNode = async (node) => {
      ws.highlightBlock(node.id);

      switch (node.type) {
        case 'move_forward': {
          const res = await renderer.moveForward();
          if (!res.success) return { crashed: true, reason: res.reason };
          if (res.reachedPig) return { reachedPig: true };
          return { ok: true };
        }

        case 'turn_left': {
          await renderer.turnLeft();
          return { ok: true };
        }

        case 'turn_right': {
          await renderer.turnRight();
          return { ok: true };
        }

        case 'jump': {
          const res = await renderer.moveForward();
          if (!res.success) return { crashed: true, reason: res.reason };
          if (res.reachedPig) return { reachedPig: true };
          return { ok: true };
        }

        case 'slingshot_launch': {
          soundFX.playLaunch();
          const r1 = await renderer.moveForward();
          if (!r1.success) return { crashed: true, reason: r1.reason };
          if (r1.reachedPig) return { reachedPig: true };
          const r2 = await renderer.moveForward();
          if (!r2.success) return { crashed: true, reason: r2.reason };
          if (r2.reachedPig) return { reachedPig: true };
          return { ok: true };
        }

        case 'smash_pig': {
          soundFX.playWin();
          return { reachedPig: true };
        }

        case 'repeat_times': {
          const count = node.params.times || 5;
          for (let i = 0; i < count; i++) {
            if (runCanceledRef.current) return { stopped: true };
            if (renderer.hasReachedPig()) return { reachedPig: true };

            ws.highlightBlock(node.id);
            await new Promise((r) => setTimeout(r, 80));

            const subRes = await executeNodeList(node.body || []);
            if (subRes.crashed || subRes.reachedPig || subRes.stopped || subRes.timeout) {
              return subRes;
            }
          }
          return { ok: true };
        }

        case 'repeat_until': {
          let iterations = 0;
          while (!renderer.hasReachedPig() && iterations < 80) {
            if (runCanceledRef.current) return { stopped: true };
            iterations++;

            ws.highlightBlock(node.id);
            await new Promise((r) => setTimeout(r, 80));

            const subRes = await executeNodeList(node.body || []);
            if (subRes.crashed || subRes.reachedPig || subRes.stopped || subRes.timeout) {
              return subRes;
            }
          }
          return { ok: true, reachedPig: renderer.hasReachedPig() };
        }

        case 'if_path': {
          const cond = node.params.condition || 'ahead';
          let conditionMet = false;

          if (cond === 'ahead') conditionMet = renderer.hasPathAhead();
          else if (cond === 'left') conditionMet = renderer.hasPathLeft();
          else if (cond === 'right') conditionMet = renderer.hasPathRight();

          await new Promise((r) => setTimeout(r, 120));

          if (conditionMet && node.body) {
            const subRes = await executeNodeList(node.body);
            if (subRes.crashed || subRes.reachedPig || subRes.stopped || subRes.timeout) {
              return subRes;
            }
          }
          return { ok: true };
        }

        case 'if_else': {
          const cond = node.params.condition || 'ahead';
          let conditionMet = false;

          if (cond === 'ahead') conditionMet = renderer.hasPathAhead();
          else if (cond === 'left') conditionMet = renderer.hasPathLeft();
          else if (cond === 'right') conditionMet = renderer.hasPathRight();

          await new Promise((r) => setTimeout(r, 120));

          if (conditionMet && node.body) {
            const subRes = await executeNodeList(node.body);
            if (subRes.crashed || subRes.reachedPig || subRes.stopped || subRes.timeout) {
              return subRes;
            }
          } else if (!conditionMet && node.elseBody) {
            const subRes = await executeNodeList(node.elseBody);
            if (subRes.crashed || subRes.reachedPig || subRes.stopped || subRes.timeout) {
              return subRes;
            }
          }
          return { ok: true };
        }

        default:
          return { ok: true };
      }
    };

    const outcome = await executeNodeList(tree);
    ws.highlightBlock(null);

    if (outcome.reachedPig || renderer.hasReachedPig()) {
      minuteStatsRef.current.solved += 1;

      // ── Record Puzzle Completion Log ──
      const solvedLevel = LEVELS[currentLevelIndex];
      const timeSpentSec = Math.max(1, Math.round((Date.now() - puzzleStartTimeRef.current) / 1000));
      const treeBlocks = tree.length;
      const maxAllowed = solvedLevel?.maxBlocks || 0;
      dbInsert('puzzle_logs', {
        participant_id: participantId,
        level_id: solvedLevel.id,
        tier: solvedLevel.tier ? (TIERS[solvedLevel.tier]?.name || solvedLevel.tier) : 'Easy',
        time_seconds: timeSpentSec,
        attempts: puzzleStatsRef.current.attempts,
        resets: puzzleStatsRef.current.resets,
        crashes: puzzleStatsRef.current.crashes,
        blocks_used: treeBlocks,
        optimal_blocks: maxAllowed
      });

      soundFX.playWin();
      setIsRunning(false);
      const nextIndex = currentLevelIndex + 1;

      if (nextIndex < STUDY_LEVEL_COUNT) {
        showToast(`🎉 Puzzle #${solvedLevel.id} Solved! Jumping to Puzzle #${LEVELS[nextIndex].id}...`);
        setTimeout(() => {
          loadLevel(nextIndex);
        }, 1200);
      } else if (currentLevelIndex < STUDY_LEVEL_COUNT) {
        showToast(`🏆 All ${STUDY_LEVEL_COUNT} study puzzles completed! Opening Post-Test Survey...`);
        setTimeout(() => {
          setStudyComplete(true);
          setPosttestOpen(true);
        }, 1500);
      } else {
        showToast('🏆 Bonus puzzle complete! You finished all 21 puzzles.');
      }
    } else if (outcome.crashed) {
      puzzleStatsRef.current.crashes += 1;
      if (outcome.reason === 'tnt') {
        setFeedback({
          open: true,
          title: 'Kaboom! 💥',
          msg: 'You hit the TNT! Plan a safe path around the danger.'
        });
      } else {
        setFeedback({
          open: true,
          title: 'Keep coding!',
          msg: 'You hit a wall or obstacle. Check your turns and steps!'
        });
      }
    } else {
      soundFX.playFailure();
      setFeedback({
        open: true,
        title: 'Not quite there yet!',
        msg: 'You ran out of blocks or loop iterations before reaching the pig. Add or adjust your blocks!'
      });
    }
  };

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toast && <div className="game-toast toast-visible">{toast}</div>}

      {/* Site Header */}
      <Header
        currentLevelIndex={currentLevelIndex}
        currentTierFilter={currentTierFilter}
        studyComplete={studyComplete}
        onSelectLevel={loadLevel}
        isRunning={isRunning}
        timerSeconds={timerSeconds}
        timerTotal={timerTotal}
        onOpenWelcome={() => setWelcomeOpen(true)}
        onOpenLogin={() => setLoginOpen(true)}
        onOpenPretest={() => {
          if (pretestCompleted) {
            showToast('✓ You have already completed the Pre-test survey.');
          } else {
            setPretestOpen(true);
          }
        }}
        onOpenPosttest={() => {
          if (studyComplete) {
            showToast('✓ You have already submitted the Post-test survey.');
          } else {
            setPosttestOpen(true);
          }
        }}
        onTestCheckin={handleTestCheckin}
        onViewHistory={() => setHistoryModalOpen(true)}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        participantId={participantId}
      />

      {/* Instructions Banner */}
      <InstructionBanner
        currentLevelIndex={currentLevelIndex}
        onSpeak={handleSpeakInstruction}
      />

      {/* Main Game Stage (3 Columns) */}
      <GameArea
        currentLevelIndex={currentLevelIndex}
        mazeContainerRef={mazeContainerRef}
        toolboxRef={toolboxRef}
        workspaceRef={workspaceRef}
        blockCountRef={blockCountRef}
        isRunning={isRunning}
        onToggleRun={handleToggleRun}
        onStartOver={handleStartOver}
        onShowCode={handleShowCode}
        onShowHint={() => setHintModalOpen(true)}
        onClean={() => workspaceInstanceRef.current?.cleanWorkspace()}
        onStep={handleStep}
        onReset={resetRun}
        speed={speed}
        onToggleSpeed={(s) => setSpeed(s)}
      />

      {/* Study Completed Screen if Post-Test is already submitted */}
      {participantId && studyComplete && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(10px)',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          textAlign: 'center',
          padding: '24px'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '14px', animation: 'birdBob 1.2s ease-in-out infinite alternate' }}>🏆</div>
          <h2 style={{ fontSize: '28px', fontWeight: 900, margin: '0 0 10px 0', textShadow: '0 2px 6px rgba(0,0,0,0.6)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Study Participation Complete!
          </h2>
          <p style={{ fontSize: '15.5px', color: '#cbd5e1', maxWidth: '460px', margin: '0 0 20px 0', lineHeight: '1.6' }}>
            Thank you, <strong>{participantId}</strong>! You have successfully completed the 30-minute gameplay session and submitted all required surveys (Pre-Test and Post-Test). Your data is safely stored.
          </p>
          <div style={{
            background: '#1e293b',
            border: '1.5px solid #334155',
            borderRadius: '12px',
            padding: '12px 24px',
            fontSize: '13.5px',
            color: '#94a3b8',
            marginBottom: '16px'
          }}>
            Please notify the research proctor that you are done.
          </div>
          <div style={{
            fontSize: '13px',
            fontWeight: 800,
            color: '#fbbf24',
            background: 'rgba(251, 191, 36, 0.1)',
            border: '1px solid #d97706',
            padding: '8px 20px',
            borderRadius: '9999px',
            letterSpacing: '0.3px',
            boxShadow: '0 2px 8px rgba(217, 119, 6, 0.2)'
          }}>
            🎮 Developed by Quem Krister
          </div>
        </div>
      )}
      {!participantId && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 8000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          textAlign: 'center',
          padding: '20px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔒</div>
          <h2 style={{ fontSize: '24px', fontWeight: 900, margin: '0 0 8px 0', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            Session Locked
          </h2>
          <p style={{ fontSize: '14px', color: '#cbd5e1', maxWidth: '380px', margin: '0 0 18px 0' }}>
            Please authenticate with your assigned Participant ID and passcode to access the study and play.
          </p>
          <button
            onClick={() => setLoginOpen(true)}
            className="btn-primary"
            style={{
              padding: '10px 24px',
              fontSize: '14px',
              fontWeight: 800,
              background: '#f59e0b',
              border: '2px solid #b45309',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Open Login Form 🔑
          </button>
        </div>
      )}

      {/* Lock Overlay if Pre-Test is not completed yet */}
      {participantId && !pretestCompleted && !welcomeOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 7999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          textAlign: 'center',
          padding: '20px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📝</div>
          <h2 style={{ fontSize: '24px', fontWeight: 900, margin: '0 0 8px 0', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            Pre-Test Survey Required
          </h2>
          <p style={{ fontSize: '14px', color: '#cbd5e1', maxWidth: '420px', margin: '0 0 18px 0', lineHeight: '1.5' }}>
            Before launching into the puzzles, you must complete the short Pre-Test Survey so we can record your background.
          </p>
          <button
            onClick={() => setPretestOpen(true)}
            className="btn-primary"
            style={{
              padding: '12px 28px',
              fontSize: '15px',
              fontWeight: 900,
              background: '#dc2626',
              border: '2px solid #991b1b',
              borderRadius: '10px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)'
            }}
          >
            Complete Pre-Test Survey Now 🚀
          </button>
        </div>
      )}

      {/* All Dialogs & Modals */}
      <Modals
        currentLevelIndex={currentLevelIndex}
        participantId={participantId}
        pretestCompleted={pretestCompleted}
        sessionEndOpen={sessionEndOpen && !studyComplete}
        onProceedToPosttest={() => {
          setSessionEndOpen(false);
          if (studyComplete || (participantId && localStorage.getItem(`hoc_posttest_${participantId}`))) {
            showToast('✓ You have already submitted the Post-test survey.');
          } else {
            setPosttestOpen(true);
          }
        }}
        // Welcome banner modal
        welcomeOpen={welcomeOpen && !studyComplete}
        onCloseWelcome={() => setWelcomeOpen(false)}
        onStartFromWelcome={handleStartFromWelcome}
        onOpenPretestFromWelcome={handleOpenPretestFromWelcome}
        onSetParticipantId={setParticipantId}
        // Pre-test survey modal
        pretestOpen={pretestOpen && !studyComplete}
        onClosePretest={null}
        onSubmitPretest={handlePretestSubmit}
        // Check-in modal (Appendix B2)
        checkinOpen={checkinOpen && !studyComplete && !isGameEnded(participantId)}
        checkinWindow={checkinWindow}
        onCloseCheckin={() => setCheckinOpen(false)}
        onSubmitCheckin={handleSubmitCheckin}
        timerMode={timerMode}
        onChangeTimerMode={handleChangeTimerMode}
        // Post-test modal (Appendix B3)
        posttestOpen={posttestOpen && !studyComplete && !(participantId && localStorage.getItem(`hoc_posttest_${participantId}`))}
        onClosePosttest={() => setPosttestOpen(false)}
        onSubmitPosttest={handlePosttestSubmit}
        // Certificate modal (Appendix D)
        certOpen={certOpen}
        onCloseCert={() => setCertOpen(false)}
        // Win modal
        winOpen={winOpen}
        winBlockCount={winBlockCount}
        winJsCode={winJsCode}
        onReplay={() => {
          setWinOpen(false);
          resetRun();
        }}
        onNextLevel={() => {
          setWinOpen(false);
          if (currentLevelIndex + 1 < STUDY_LEVEL_COUNT) {
            loadLevel(currentLevelIndex + 1);
          } else if (currentLevelIndex < STUDY_LEVEL_COUNT) {
            setPosttestOpen(true);
          } else {
            showToast('🏆 Bonus puzzle complete! You finished all 21 puzzles.');
          }
        }}
        // Feedback modal
        feedback={feedback}
        onCloseFeedback={() => {
          setFeedback({ open: false, title: '', msg: '' });
          resetRun();
        }}
        // Code modal
        codeModalOpen={codeModalOpen}
        codeContent={codeContent}
        onCloseCodeModal={() => setCodeModalOpen(false)}
        // Hint modal
        hintModalOpen={hintModalOpen}
        onCloseHintModal={() => setHintModalOpen(false)}
        // History modal
        historyModalOpen={historyModalOpen}
        onCloseHistoryModal={() => setHistoryModalOpen(false)}
        historyData={historyData}
        minuteLogsData={minuteLogsData}
      />

      {/* Participant Login Modal */}
      <LoginModal
        isOpen={loginOpen}
        onLogin={handleLogin}
        currentParticipantId={participantId}
      />
    </div>
  );
}
