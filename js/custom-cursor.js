/**
 * ADRIAN SETH TABOTABO — HIGH-END LIQUID SATIN CURSOR ENGINE
 * Instant 0ms hardware dot tracking, liquid velocity-stretch trailing halo,
 * magnetic attraction to interactive targets, and contextual labels.
 */

(function () {
  'use strict';

  // Only run custom cursor on desktop non-touch devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const cursorRoot = document.getElementById('customCursor');
  const cursorDot = document.getElementById('cursorDot');
  const cursorHalo = document.getElementById('cursorHalo');
  const cursorRipple = document.getElementById('cursorRipple');
  const cursorLabel = document.getElementById('cursorLabel');

  if (!cursorRoot || !cursorDot || !cursorHalo) return;

  // Mouse coordinates (Instantaneous)
  let mouseX = -100;
  let mouseY = -100;
  let prevMouseX = -100;
  let prevMouseY = -100;

  // Halo coordinates (Smooth Spring Lerp)
  let haloX = -100;
  let haloY = -100;
  let targetHaloX = -100;
  let targetHaloY = -100;

  // Velocity and deformation
  let speed = 0;
  let angle = 0;
  let scaleX = 1;
  let scaleY = 1;

  let isHovered = false;
  let magneticTarget = null;
  let isVisible = false;

  // 1. Mouse Movement Handler
  window.addEventListener('mousemove', (e) => {
    if (!isVisible) {
      cursorRoot.style.opacity = '1';
      isVisible = true;
      haloX = e.clientX;
      haloY = e.clientY;
    }

    prevMouseX = mouseX;
    prevMouseY = mouseY;
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Pinpoint Dot: Instant 1:1 hardware translation with zero lag!
    cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;

    // Calculate instantaneous mouse velocity
    if (prevMouseX > 0) {
      const dx = mouseX - prevMouseX;
      const dy = mouseY - prevMouseY;
      const currentSpeed = Math.sqrt(dx * dx + dy * dy);
      speed = Math.min(currentSpeed, 120);
      angle = Math.atan2(dy, dx) * (180 / Math.PI);
    }

    if (!magneticTarget) {
      targetHaloX = mouseX;
      targetHaloY = mouseY;
    }
  }, { passive: true });

  // 2. Mouse Leave / Enter Window
  window.addEventListener('mouseleave', () => {
    cursorRoot.style.opacity = '0';
    isVisible = false;
  });

  window.addEventListener('mouseenter', () => {
    cursorRoot.style.opacity = '1';
    isVisible = true;
  });

  // 3. Mousedown / Mouseup Click Ripple & Squeeze
  window.addEventListener('mousedown', () => {
    cursorHalo.classList.add('cursor-press');
    cursorDot.classList.add('cursor-press');
  });

  window.addEventListener('mouseup', (e) => {
    cursorHalo.classList.remove('cursor-press');
    cursorDot.classList.remove('cursor-press');

    // Trigger ripple shockwave
    if (cursorRipple) {
      cursorRipple.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      cursorRipple.classList.remove('animate-ripple');
      void cursorRipple.offsetWidth; // Force reflow
      cursorRipple.classList.add('animate-ripple');
    }
  });

  // 4. Interactive Elements & Magnetic Attraction & Labels
  function attachInteractiveListeners() {
    // Buttons, Links, and interactive pills
    const interactiveSelector = 'a, button, [role="button"], .tag-pill, .centerpiece-pill-filled, .centerpiece-pill-outlined, .sound-toggle-btn, .floating-sound-btn';
    const buttons = document.querySelectorAll(interactiveSelector);
    buttons.forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        isHovered = true;
        magneticTarget = btn;
        cursorHalo.classList.add('cursor-hover');
      });
      btn.addEventListener('mousemove', (e) => {
        if (magneticTarget === btn) {
          const rect = btn.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          // Magnetic pull towards center (35% weight)
          targetHaloX = centerX + (e.clientX - centerX) * 0.35;
          targetHaloY = centerY + (e.clientY - centerY) * 0.35;
        }
      });
      btn.addEventListener('mouseleave', () => {
        isHovered = false;
        magneticTarget = null;
        cursorHalo.classList.remove('cursor-hover');
        targetHaloX = mouseX;
        targetHaloY = mouseY;
      });
    });

    // Masquerade Portrait: Contextual "RIPPLE" label
    const portrait = document.getElementById('emblemPhotoFrame') || document.getElementById('portraitCanvas');
    if (portrait && cursorLabel) {
      portrait.addEventListener('mouseenter', () => {
        cursorHalo.classList.add('cursor-hover');
        cursorLabel.textContent = 'RIPPLE';
        cursorLabel.classList.add('label-visible');
      });
      portrait.addEventListener('mouseleave', () => {
        cursorHalo.classList.remove('cursor-hover');
        cursorLabel.classList.remove('label-visible');
        cursorLabel.textContent = '';
      });
    }

    // Flagship Project Cards: Contextual "VIEW" label
    const projectCards = document.querySelectorAll('.flagship-card, .lab-card');
    projectCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        cursorHalo.classList.add('cursor-hover');
        if (cursorLabel) {
          cursorLabel.textContent = 'VIEW';
          cursorLabel.classList.add('label-visible');
        }
      });
      card.addEventListener('mouseleave', () => {
        cursorHalo.classList.remove('cursor-hover');
        if (cursorLabel) {
          cursorLabel.classList.remove('label-visible');
          cursorLabel.textContent = '';
        }
      });
    });
  }

  attachInteractiveListeners();
  window.addEventListener('DOMContentLoaded', attachInteractiveListeners);

  // 5. High-Performance Render Loop (60-120fps)
  function renderLoop() {
    if (isVisible) {
      // Smooth spring lerp for halo
      const ease = isHovered ? 0.22 : 0.16;
      haloX += (targetHaloX - haloX) * ease;
      haloY += (targetHaloY - haloY) * ease;

      // Velocity damping
      speed *= 0.86;

      if (!isHovered) {
        // Liquid deformation: stretch along angle of travel
        scaleX = 1 + Math.min(speed * 0.0035, 0.45);
        scaleY = 1 - Math.min(speed * 0.0025, 0.30);
        cursorHalo.style.transform = `translate3d(${haloX}px, ${haloY}px, 0) rotate(${angle.toFixed(1)}deg) scale(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)})`;
      } else {
        // Uniform circular lens on hover
        cursorHalo.style.transform = `translate3d(${haloX}px, ${haloY}px, 0) scale(1, 1)`;
      }
    }

    requestAnimationFrame(renderLoop);
  }

  requestAnimationFrame(renderLoop);
})();
