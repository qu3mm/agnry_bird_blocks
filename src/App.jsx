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
import { dbInsert } from './utils/supabase';

export default function App() {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [currentTierFilter, setCurrentTierFilter] = useState('all');
  const [studyComplete, setStudyComplete] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Timer State
  const [timerMode, setTimerMode] = useState('normal'); // 'normal' (300s) or 'demo' (15s)
  const [timerTotal, setTimerTotal] = useState(300);
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

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

  // Welcome Banner State
  const [welcomeOpen, setWelcomeOpen] = useState(true);

  // Pre-test Survey State (opens after welcome or when explicitly requested)
  const [pretestOpen, setPretestOpen] = useState(false);

  const handleStartFromWelcome = () => {
    setWelcomeOpen(false);
    const pretestDone = localStorage.getItem('hoc_pretest_survey');
    if (!pretestDone) {
      setPretestOpen(true);
    }
  };

  const handleOpenPretestFromWelcome = () => {
    setWelcomeOpen(false);
    setPretestOpen(true);
  };

  const handleLogin = (id) => {
    setParticipantId(id);
    try {
      localStorage.setItem('hoc_participant_id', id);
    } catch {}
    setLoginOpen(false);
    showToast(`👋 Logged in as ${id}!`);
  };

  // Check-in window tracking (Window 1 through 6 per 30-min session)
  const [checkinWindow, setCheckinWindow] = useState(1);

  // Modals State
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
  const [toast, setToast] = useState(null);

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
      runCanceledRef.current = true;
      setIsRunning(false);
      setCurrentLevelIndex(index);

      const level = LEVELS[index];
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
    setCurrentTierFilter(tierId);
    if (tierId !== 'all') {
      const firstOfTier = LEVELS.findIndex((l) => l.tier === tierId);
      if (firstOfTier !== -1 && LEVELS[currentLevelIndex].tier !== tierId) {
        loadLevel(firstOfTier);
      }
    }
  };

  // Timer Tick Interval
  useEffect(() => {
    if (!isTimerRunning || checkinOpen || pretestOpen) return;

    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          // Timer expired -> Pause and prompt check-in
          soundFX.playTimerChime();
          setCheckinOpen(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, checkinOpen, pretestOpen]);

  // Pre-test Submission
  const handlePretestSubmit = (data) => {
    try {
      localStorage.setItem('hoc_pretest_survey', JSON.stringify(data));
      if (data.participantId) {
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
    setCheckinWindow((prev) => prev + 1);

    // If 6 check-ins completed (30-min gameplay session complete per Section 2.2 Phase 4), open Post-test!
    if (data.window >= 6) {
      setTimeout(() => {
        setPosttestOpen(true);
      }, 1000);
    }

    // Reset and resume timer
    const resetSecs = timerMode === 'demo' ? 15 : 300;
    setTimerSeconds(resetSecs);
    setIsTimerRunning(true);
  };

  // Post-Test Submission (Appendix B3)
  const handlePosttestSubmit = (data) => {
    try {
      localStorage.setItem('hoc_posttest_survey', JSON.stringify(data));
    } catch (e) {
      console.error(e);
    }
    dbInsert('post_test', {
      participant_id:        data.participantId,
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
    setCertOpen(true);
    showToast('🎓 Post-test complete! Viewing Certificate of Participation.');
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
    if (window.confirm('Reset blocks back to the start of this puzzle?')) {
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
    if (isRunning || !workspaceInstanceRef.current || !mazeRendererRef.current) return;

    setIsRunning(true);
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
      soundFX.playWin();
      setIsRunning(false);
      const nextIndex = currentLevelIndex + 1;
      const solvedLevel = LEVELS[currentLevelIndex];

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
        onOpenPretest={() => setPretestOpen(true)}
        onOpenPosttest={() => setPosttestOpen(true)}
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

      {/* All Dialogs & Modals */}
      <Modals
        currentLevelIndex={currentLevelIndex}
        participantId={participantId}
        // Welcome banner modal
        welcomeOpen={welcomeOpen}
        onCloseWelcome={() => setWelcomeOpen(false)}
        onStartFromWelcome={handleStartFromWelcome}
        onOpenPretestFromWelcome={handleOpenPretestFromWelcome}
        onSetParticipantId={setParticipantId}
        // Pre-test survey modal
        pretestOpen={pretestOpen}
        onClosePretest={() => setPretestOpen(false)}
        onSubmitPretest={handlePretestSubmit}
        // Check-in modal (Appendix B2)
        checkinOpen={checkinOpen}
        checkinWindow={checkinWindow}
        onCloseCheckin={() => setCheckinOpen(false)}
        onSubmitCheckin={handleSubmitCheckin}
        timerMode={timerMode}
        onChangeTimerMode={handleChangeTimerMode}
        // Post-test modal (Appendix B3)
        posttestOpen={posttestOpen}
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
