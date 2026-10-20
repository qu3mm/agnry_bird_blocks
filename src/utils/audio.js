// src/utils/audio.js - Authentic Angry Birds Audio Engine for React
class SoundFX {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.initialized = false;
        this.audioClips = {};

        this.soundSources = {
            launch: '/sounds/launch.mp3',
            win: '/sounds/win.mp3',
            failure: '/sounds/failure.mp3',
            wall: '/sounds/wall.mp3',
            tnt: '/sounds/tnt.mp3',
            click: '/sounds/click.mp3',
            delete: '/sounds/delete.mp3'
        };
    }

    init() {
        if (typeof window === "undefined") return;

        // Preload real Angry Birds audio files
        if (!this.initialized) {
            Object.entries(this.soundSources).forEach(([key, src]) => {
                const audio = new Audio();
                audio.src = src;
                audio.preload = 'auto';
                this.audioClips[key] = audio;
            });
            this.initialized = true;
        }

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext && !this.ctx) {
            this.ctx = new AudioContext();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setMuted(muted) {
        this.muted = muted;
    }

    playFile(key, volume = 0.8) {
        if (this.muted) return false;
        this.init();
        try {
            const clip = this.audioClips[key];
            if (clip) {
                clip.currentTime = 0;
                clip.volume = Math.max(0, Math.min(1, volume));
                const p = clip.play();
                if (p && p.catch) p.catch(() => {});
                return true;
            }
        } catch {
            return false;
        }
        return false;
    }

    // Angry Birds Launch Battle Cry (wee-hee / haaaa-he-ha)
    playLaunch() {
        if (!this.playFile('launch', 0.85)) {
            this.playClick();
        }
    }

    // Victory cheers & celebratory fanfare
    playWin() {
        if (!this.playFile('win', 0.9)) {
            this.playSynthesizedWin();
        }
    }

    // Bad Piggies laughing / failure
    playFailure() {
        if (!this.playFile('failure', 0.85)) {
            this.playHitWall();
        }
    }

    // Wall collision / bonk
    playHitWall() {
        if (!this.playFile('wall', 0.85)) {
            this.playSynthesizedHitWall();
        }
    }

    // TNT crate blast
    playTnt() {
        if (!this.playFile('tnt', 0.9)) {
            this.playHitWall();
        }
    }

    // Block trash / poof delete
    playTrash() {
        if (!this.playFile('delete', 0.75)) {
            this.playSynthesizedTrash();
        }
    }

    // Block pick-up / click
    playClick() {
        if (!this.playFile('click', 0.65)) {
            this.playSynthesizedClick();
        }
    }

    // Block notch snap
    playSnap() {
        if (!this.playFile('click', 0.75)) {
            this.playSynthesizedSnap();
        }
    }

    // Step sound
    playStep() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(360, now + 0.08);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.1);
    }

    // Turn sound
    playTurn() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.06);
        osc.frequency.exponentialRampToValueAtTime(250, now + 0.12);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.13);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.13);
    }

    // Reflection timer notification chime
    playTimerChime() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const playTone = (freq, delay) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + delay);
            gain.gain.setValueAtTime(0.35, now + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.8);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + delay);
            osc.stop(now + delay + 0.8);
        };

        playTone(587.33, 0);
        playTone(880.00, 0.25);
        playTone(1174.66, 0.55);
    }

    // Synthesized fallbacks
    playSynthesizedHitWall() {
        if (this.muted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.2);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.22);
    }

    playSynthesizedWin() {
        if (this.muted || !this.ctx) return;
        const notes = [
            { f: 523.25, d: 0.12, pause: 0 },
            { f: 659.25, d: 0.12, pause: 0.13 },
            { f: 783.99, d: 0.12, pause: 0.26 },
            { f: 1046.50, d: 0.35, pause: 0.39 }
        ];

        const start = this.ctx.currentTime;
        notes.forEach(note => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(note.f, start + note.pause);

            gain.gain.setValueAtTime(0.3, start + note.pause);
            gain.gain.exponentialRampToValueAtTime(0.01, start + note.pause + note.d);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(start + note.pause);
            osc.stop(start + note.pause + note.d);
        });
    }

    playSynthesizedClick() {
        if (this.muted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.05);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.06);
    }

    playSynthesizedSnap() {
        if (this.muted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.04);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.09);
    }

    playSynthesizedTrash() {
        if (this.muted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.16);
    }
}

export const soundFX = new SoundFX();
if (typeof window !== "undefined") {
    window.soundFX = soundFX;
}
