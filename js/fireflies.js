/**
 * ADRIAN SETH TABOTABO — CELESTIAL STARLIGHT TRAIL & AMBIENT MOTES
 * Ethereal starlight dust that gracefully trails cursor movement,
 * paired with 6 wide-orbiting ambient motes that never clutter the pointer.
 */

(function () {
  'use strict';

  // Only run on desktop/fine pointer devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const canvas = document.getElementById('firefliesCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const mouse = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    prevX: window.innerWidth / 2,
    prevY: window.innerHeight / 2,
    speed: 0
  };

  // Trail sparkles pool (sparkles emitted on movement)
  const MAX_TRAIL_SPARKLES = 28;
  const trailSparkles = [];

  const PALETTE = [
    'rgba(251, 113, 133, ', // Petal Rose
    'rgba(253, 186, 116, ', // Warm Peach Gold
    'rgba(244, 114, 182, ', // Orchid Pink
    'rgba(255, 255, 255, '  // Pure Starlight
  ];

  class TrailSparkle {
    constructor(x, y, vx, vy) {
      this.x = x + (Math.random() - 0.5) * 10;
      this.y = y + (Math.random() - 0.5) * 10;
      this.vx = vx * 0.15 + (Math.random() - 0.5) * 0.8;
      this.vy = vy * 0.15 + (Math.random() - 0.5) * 0.8;
      this.size = 1.0 + Math.random() * 1.8;
      this.colorBase = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      this.maxLife = 35 + Math.random() * 25;
      this.life = this.maxLife;
      this.twinkle = Math.random() * Math.PI * 2;
    }

    update() {
      this.life--;
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.94;
      this.vy *= 0.94;
      this.twinkle += 0.15;
      return this.life > 0;
    }

    draw() {
      const progress = this.life / this.maxLife;
      const opacity = Math.sin(progress * Math.PI) * (0.5 + Math.sin(this.twinkle) * 0.25) * 0.65;
      if (opacity <= 0.01) return;

      ctx.save();
      // Soft glow
      const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3.0);
      glow.addColorStop(0, `${this.colorBase}${opacity.toFixed(2)})`);
      glow.addColorStop(0.5, `${this.colorBase}${(opacity * 0.35).toFixed(2)})`);
      glow.addColorStop(1, `${this.colorBase}0)`);

      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 3.0, 0, Math.PI * 2);
      ctx.fill();

      // Sharp micro star core
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity.toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // 6 Wide-Orbiting Ambient Motes (drift gently far from pointer)
  class AmbientMote {
    constructor(index) {
      this.index = index;
      this.reset();
      this.x = mouse.x + Math.cos(this.angle) * this.orbitRadius;
      this.y = mouse.y + Math.sin(this.angle) * this.orbitRadius;
    }

    reset() {
      // Wide relaxing perimeter (110px to 190px away so it never clutters pointer)
      this.orbitRadius = 110 + Math.random() * 80;
      this.orbitSpeed = (0.008 + Math.random() * 0.014) * (this.index % 2 === 0 ? 1 : -1);
      this.angle = (this.index / 6) * Math.PI * 2 + Math.random() * 0.5;
      this.size = 1.2 + Math.random() * 1.6;
      this.colorBase = PALETTE[this.index % PALETTE.length];
      this.baseOpacity = 0.18 + Math.random() * 0.22;
      this.pulseSpeed = 0.02 + Math.random() * 0.03;
      this.pulse = Math.random() * Math.PI;
      this.vx = 0;
      this.vy = 0;
      this.scattered = false;
    }

    scatter(intensity = 1.0) {
      const angle = Math.random() * Math.PI * 2;
      const force = (8 + Math.random() * 10) * intensity;
      this.vx = Math.cos(angle) * force;
      this.vy = Math.sin(angle) * force;
      this.scattered = true;
    }

    update() {
      this.pulse += this.pulseSpeed;
      const opacity = this.baseOpacity * (0.7 + Math.sin(this.pulse) * 0.3);

      if (this.scattered) {
        this.vx *= 0.92;
        this.vy *= 0.92;
        this.x += this.vx;
        this.y += this.vy;
        if (Math.abs(this.vx) < 0.2 && Math.abs(this.vy) < 0.2) {
          this.scattered = false;
        }
      } else {
        this.angle += this.orbitSpeed;
        const targetX = mouse.x + Math.cos(this.angle) * this.orbitRadius;
        const targetY = mouse.y + Math.sin(this.angle) * this.orbitRadius;
        const ease = 0.04;
        this.x += (targetX - this.x) * ease;
        this.y += (targetY - this.y) * ease;
      }

      return opacity;
    }

    draw(opacity) {
      ctx.save();
      const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3.5);
      glow.addColorStop(0, `${this.colorBase}${opacity.toFixed(2)})`);
      glow.addColorStop(0.5, `${this.colorBase}${(opacity * 0.4).toFixed(2)})`);
      glow.addColorStop(1, `${this.colorBase}0)`);

      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(255, 255, 255, ${opacity.toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  const ambientMotes = Array.from({ length: 6 }, (_, i) => new AmbientMote(i));

  // Mouse Movement & Trail Emission
  let spawnCounter = 0;
  window.addEventListener('mousemove', (e) => {
    mouse.prevX = mouse.x;
    mouse.prevY = mouse.y;
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    const dx = mouse.x - mouse.prevX;
    const dy = mouse.y - mouse.prevY;
    mouse.speed = Math.sqrt(dx * dx + dy * dy);

    // Emit celestial starlight sparkles when moving
    if (mouse.speed > 2.0) {
      spawnCounter++;
      if (spawnCounter % 2 === 0 && trailSparkles.length < MAX_TRAIL_SPARKLES) {
        trailSparkles.push(new TrailSparkle(mouse.x, mouse.y, -dx * 0.3, -dy * 0.3));
      }
    }
  }, { passive: true });

  // Click Starburst Scattering
  window.addEventListener('pointerdown', (e) => {
    ambientMotes.forEach(m => m.scatter(1.2));
    // Spawn 6 immediate burst sparks on click
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + (Math.random() - 0.5);
      const force = 3 + Math.random() * 4;
      trailSparkles.push(new TrailSparkle(e.clientX, e.clientY, Math.cos(angle) * force, Math.sin(angle) * force));
    }
  });

  // Render Loop
  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw trail sparkles
    for (let i = trailSparkles.length - 1; i >= 0; i--) {
      const s = trailSparkles[i];
      if (s.update()) {
        s.draw();
      } else {
        trailSparkles.splice(i, 1);
      }
    }

    // 2. Draw 6 wide ambient motes
    for (let i = 0; i < ambientMotes.length; i++) {
      const m = ambientMotes[i];
      const opacity = m.update();
      m.draw(opacity);
    }

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();
