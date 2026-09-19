/**
 * ADRIAN SETH TABOTABO — AMBIENT SAKURA DRIFT
 * A deliberately subtle layer of falling petals behind the content.
 * Slow descent, gentle lateral sway, and a soft spin that flips each petal
 * edge-on so the fall never reads as a repeating loop.
 */

(function () {
  'use strict';

  const canvas = document.getElementById('sakuraCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Honour reduced-motion: leave the background completely still.
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches) return;

  const PALETTE = [
    { r: 251, g: 113, b: 133 }, // Petal Rose
    { r: 244, g: 114, b: 182 }, // Blush Orchid
    { r: 253, g: 164, b: 175 }, // Warm Peach Blush
    { r: 252, g: 231, b: 243 }  // Pale Highlight
  ];

  let width = 0;
  let height = 0;
  let dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  }, { passive: true });

  // Fewer petals on phones — the layer should never cost more than it adds.
  const isCoarse = window.matchMedia('(pointer: coarse)').matches;
  const PETAL_COUNT = isCoarse ? 10 : 18;

  class Petal {
    constructor(seeded) {
      this.reset(seeded);
    }

    reset(seeded) {
      this.x = Math.random() * width;
      // Seeded petals start mid-screen so the effect is already alive on load.
      this.y = seeded ? Math.random() * height : -20 - Math.random() * 60;
      this.size = 7 + Math.random() * 8;
      this.fallSpeed = 0.28 + Math.random() * 0.42;
      this.swayAmplitude = 12 + Math.random() * 26;
      this.swaySpeed = 0.004 + Math.random() * 0.006;
      this.swayPhase = Math.random() * Math.PI * 2;
      this.spin = (Math.random() - 0.5) * 0.012;
      this.rotation = Math.random() * Math.PI * 2;
      this.flipPhase = Math.random() * Math.PI * 2;
      this.flipSpeed = 0.006 + Math.random() * 0.01;
      this.opacity = 0.16 + Math.random() * 0.22;
      this.color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      this.originX = this.x;
    }

    update(delta) {
      this.y += this.fallSpeed * delta;
      this.swayPhase += this.swaySpeed * delta;
      this.flipPhase += this.flipSpeed * delta;
      this.rotation += this.spin * delta;
      this.x = this.originX + Math.sin(this.swayPhase) * this.swayAmplitude;

      if (this.y - this.size > height) {
        this.reset(false);
        this.originX = this.x;
      }
    }

    draw() {
      // Horizontal squash simulates the petal turning edge-on as it tumbles.
      const flip = Math.abs(Math.cos(this.flipPhase));
      const scaleX = 0.25 + flip * 0.75;
      const { r, g, b } = this.color;

      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.scale(scaleX, 1);

      const s = this.size;
      const gradient = ctx.createLinearGradient(0, -s * 0.5, 0, s * 0.5);
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${(this.opacity * 0.55).toFixed(3)})`);
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${this.opacity.toFixed(3)})`);
      ctx.fillStyle = gradient;

      // Classic notched sakura petal: wide base, cleft tip.
      ctx.beginPath();
      ctx.moveTo(0, s * 0.5);
      ctx.bezierCurveTo(-s * 0.62, s * 0.18, -s * 0.5, -s * 0.42, 0, -s * 0.28);
      ctx.bezierCurveTo(s * 0.5, -s * 0.42, s * 0.62, s * 0.18, 0, s * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  const petals = Array.from({ length: PETAL_COUNT }, () => new Petal(true));

  let running = true;
  let lastTime = performance.now();
  let frameId = null;

  function loop(now) {
    // Normalise to 60fps steps so speed is frame-rate independent,
    // and clamp so a backgrounded tab doesn't teleport every petal.
    const delta = Math.min((now - lastTime) / 16.667, 3);
    lastTime = now;

    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < petals.length; i++) {
      petals[i].update(delta);
      petals[i].draw();
    }

    frameId = requestAnimationFrame(loop);
  }

  function start() {
    if (running) return;
    running = true;
    lastTime = performance.now();
    frameId = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  });

  // Stop drawing if the user switches on reduced motion mid-session.
  const onMotionPreferenceChange = (event) => {
    if (event.matches) {
      stop();
      ctx.clearRect(0, 0, width, height);
    } else {
      start();
    }
  };
  if (typeof reducedMotion.addEventListener === 'function') {
    reducedMotion.addEventListener('change', onMotionPreferenceChange);
  }

  frameId = requestAnimationFrame(loop);
})();
