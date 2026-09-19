/**
 * ADRIAN SETH TABOTABO — WEB AUDIO CHIME & SENSORY SOUND ENGINE
 * Pure Web Audio API synthesis (Zero audio assets to download, 100% procedural sound design).
 */

(function () {
  'use strict';

  let audioCtx = null;
  let isSoundEnabled = false;

  // Harmonic Pentatonic Scale in Hz (Soft glass/water notes)
  const NOTES = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Synthesize soft water droplet / glass chime
  window.playHarmonicChime = function (freqIndex = -1, volume = 0.08) {
    if (!isSoundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Pick note frequency
      const freq = freqIndex >= 0 && freqIndex < NOTES.length 
        ? NOTES[freqIndex] 
        : NOTES[Math.floor(Math.random() * NOTES.length)];

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      // Subtle pitch drop creates a playful liquid droplet feel
      osc.frequency.exponentialRampToValueAtTime(freq * 0.95, now + 0.35);

      // Low pass filter for soft satin warmth
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);

      // Smooth decay envelope
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch (err) {
      // Graceful fallback
    }
  };

  // Sound toggle state button
  const soundToggleBtn = document.getElementById('soundToggleBtn');

  function updateSoundButtonUI() {
    if (!soundToggleBtn) return;
    if (isSoundEnabled) {
      soundToggleBtn.innerHTML = `
        <span style="color: var(--rose-primary);">🔊</span>
        <span>Sound: On</span>
      `;
      soundToggleBtn.classList.add('sound-active');
    } else {
      soundToggleBtn.innerHTML = `
        <span style="opacity: 0.6;">🔇</span>
        <span>Sound: Off</span>
      `;
      soundToggleBtn.classList.remove('sound-active');
    }
  }

  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isSoundEnabled = !isSoundEnabled;
      localStorage.setItem('ast_sound_enabled', isSoundEnabled ? '1' : '0');
      updateSoundButtonUI();

      if (isSoundEnabled) {
        getAudioContext();
        window.playHarmonicChime(2, 0.12);
      }
    });
  }

  // Restore saved sound state if allowed
  if (localStorage.getItem('ast_sound_enabled') === '1') {
    isSoundEnabled = true;
    updateSoundButtonUI();
  }

  // Hook sound into interactive elements
  window.addEventListener('pointerdown', (e) => {
    // Only chime on clicks not inside native inputs
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      window.playHarmonicChime(-1, 0.07);
    }
  });

  document.querySelectorAll('a, button, .glass-card-interactive, .route-pill').forEach(el => {
    el.addEventListener('mouseenter', () => {
      window.playHarmonicChime(Math.floor(Math.random() * 3) + 2, 0.03);
    });
  });

})();
