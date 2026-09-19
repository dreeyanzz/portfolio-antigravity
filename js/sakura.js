/**
 * ADRIAN SETH TABOTABO — 3D SAKURA BACKGROUND ENGINE
 * Ambient 3D cherry blossom petals drifting serenely behind content.
 * Features realistic 3D pitch/roll/yaw tumbling, aerodynamic air-drag,
 * smooth multi-tone pink gradients, and gentle scroll updraft dynamics.
 * Non-intrusive: purely in the background with zero cursor interference.
 */

(function () {
  'use strict';

  const canvas = document.getElementById('sakuraCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  // ---------------------------------------------------------------------------
  // 1. COLOR PALETTES (Natural Smooth Blossom Pinks & Dual-Sided Shading)
  // ---------------------------------------------------------------------------
  const COLOR_PALETTES = [
    // 0: Yoshino Blossom (Classic Blossom Pink)
    {
      name: 'Yoshino',
      front: {
        base: '#F472B6',      // Warm blossom rose
        mid: '#FBCFE8',       // Creamy baby blush
        body: '#FFF0F5',      // Smooth petal ivory
        tip: '#FFF8FA',       // Soft pearl highlight
        vein: 'rgba(244, 114, 182, 0.22)'
      },
      back: {
        base: '#E11D48',      // Rich crimson rose base
        mid: '#FB7185',       // Satin petal rose
        body: '#FCE7F3',      // Dusty blossom pink
        tip: '#FDF2F8',
        vein: 'rgba(225, 29, 72, 0.28)'
      }
    },
    // 1: Yaezakura (Deep Petal Rose)
    {
      name: 'Yaezakura',
      front: {
        base: '#FB7185',      // Warm coral rose
        mid: '#F472B6',       // Vibrant blush
        body: '#FCE7F3',      // Soft blossom pink
        tip: '#FFF0F5',
        vein: 'rgba(251, 113, 133, 0.25)'
      },
      back: {
        base: '#BE185D',      // Deep velvet magenta
        mid: '#E11D48',
        body: '#F472B6',
        tip: '#FCE7F3',
        vein: 'rgba(190, 24, 93, 0.30)'
      }
    },
    // 2: Kanzan Whisper (Pale Translucent Satin)
    {
      name: 'Kanzan',
      front: {
        base: '#FDA4AF',      // Warm peach blush
        mid: '#FFE4E6',       // Pale rose petal
        body: '#FFF5F7',      // Frosted white ivory
        tip: '#FFFFFF',
        vein: 'rgba(253, 164, 175, 0.20)'
      },
      back: {
        base: '#F43F5E',      // Bold rose
        mid: '#FDA4AF',
        body: '#FFF1F2',
        tip: '#FFFFFF',
        vein: 'rgba(244, 63, 94, 0.25)'
      }
    }
  ];

  // ---------------------------------------------------------------------------
  // 2. SIMULATION STATE
  // ---------------------------------------------------------------------------
  let width = 0;
  let height = 0;
  let dpr = 1;
  let animFrameId = 0;
  let lastTime = 0;
  let elapsed = 0;

  const petals = [];

  // Scroll dynamics (smooth vertical draft)
  let scrollUpdraft = 0;
  let lastScrollY = window.scrollY;

  const random = (min, max) => min + Math.random() * (max - min);

  // ---------------------------------------------------------------------------
  // 3. PETAL FACTORY (Multi-Tier Depth Architecture Behind Content)
  // ---------------------------------------------------------------------------
  /**
   * Generates a single sakura petal with 3D depth, aerodynamic properties, and color.
   * @param {boolean} initialSpawn - If true, randomizes initial Y across the viewport.
   * @param {string} depthCategory - 'distant' | 'midground' | 'near'
   */
  function createPetal(initialSpawn = false, depthCategory = 'midground') {
    let z, baseWidth, opacity;

    if (depthCategory === 'distant') {
      // Deep background atmosphere: small, slow, delicate
      z = random(0.20, 0.45);
      baseWidth = random(11, 19);
      opacity = random(0.35, 0.55);
    } else if (depthCategory === 'midground') {
      // Main drifting stratum: crisp, tumbling, medium size
      z = random(0.50, 0.85);
      baseWidth = random(24, 42);
      opacity = random(0.65, 0.85);
    } else {
      // Near background layer: larger, richly shaded, floating right behind cards
      z = random(0.90, 1.25);
      baseWidth = random(48, 76);
      opacity = random(0.60, 0.82);
    }

    // Responsive scale
    const screenScale = width < 640 ? 0.75 : width < 1024 ? 0.9 : 1.0;
    const actualWidth = baseWidth * screenScale;
    const actualHeight = actualWidth * 1.38;

    const palette = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];

    return {
      x: random(-40, width + 40),
      y: initialSpawn ? random(-60, height + 40) : random(-140, -40),
      z: z,
      category: depthCategory,

      // Dimensions & Visuals
      width: actualWidth,
      height: actualHeight,
      opacity: opacity,
      palette: palette,

      // 3D Angles (Radians)
      pitch: random(0, Math.PI * 2), // Rocking forward/back
      roll: random(0, Math.PI * 2),  // Flipping sideways
      yaw: random(0, Math.PI * 2),   // Compass heading in wind

      // Angular Velocities (Natural aerodynamic oscillations)
      pitchSpeed: random(1.1, 2.2),
      rollSpeed: random(0.7, 1.6),
      yawSpeed: random(-0.35, 0.35),
      phase: random(0, Math.PI * 2),

      // Physics & Aerodynamics
      baseSpeedY: random(28, 48) * z, // Natural terminal velocity
      swayAmplitude: random(14, 26) * z,
      swayFrequency: random(0.8, 1.3)
    };
  }

  // ---------------------------------------------------------------------------
  // 4. PETAL RENDERING (Vector Path with 3D Affine Projection)
  // ---------------------------------------------------------------------------
  function renderPetal(p) {
    const w = p.width;
    const h = p.height;

    // Calculate 3D orientation factors
    const cosRoll = Math.cos(p.roll);
    const cosPitch = Math.cos(p.pitch);

    // Normal Z: positive = front face visible, negative = back face visible
    const isFront = (cosRoll * cosPitch) >= 0;

    // Minimum visible thickness so petal doesn't become a 0px invisible line
    const scaleX = Math.sign(cosRoll) * Math.max(Math.abs(cosRoll), 0.08);
    const scaleY = Math.sign(cosPitch) * Math.max(Math.abs(cosPitch), 0.12);

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.yaw);
    ctx.scale(scaleX, scaleY);
    ctx.globalAlpha = p.opacity;

    // -------------------------------------------------------------------------
    // Petal Outline (Natural Sakura Petal with Signature Notched Apex)
    // -------------------------------------------------------------------------
    ctx.beginPath();
    ctx.moveTo(0, h * 0.46);
    // Left curve toward widest lobe
    ctx.bezierCurveTo(-w * 0.28, h * 0.40, -w * 0.52, h * 0.12, -w * 0.48, -h * 0.08);
    // Left upper contour toward left apex peak
    ctx.bezierCurveTo(-w * 0.44, -h * 0.28, -w * 0.32, -h * 0.45, -w * 0.18, -h * 0.48);
    // Apex notch cleft
    ctx.quadraticCurveTo(-w * 0.06, -h * 0.43, 0, -h * 0.37);
    ctx.quadraticCurveTo(w * 0.06, -h * 0.43, w * 0.18, -h * 0.48);
    // Right upper contour
    ctx.bezierCurveTo(w * 0.32, -h * 0.45, w * 0.44, -h * 0.28, w * 0.48, -h * 0.08);
    // Right curve back to base
    ctx.bezierCurveTo(w * 0.52, h * 0.12, w * 0.28, h * 0.40, 0, h * 0.46);
    ctx.closePath();

    // -------------------------------------------------------------------------
    // Dual-Sided Gradient Fills
    // -------------------------------------------------------------------------
    const colors = isFront ? p.palette.front : p.palette.back;
    const grad = ctx.createLinearGradient(0, h * 0.46, 0, -h * 0.48);
    grad.addColorStop(0.00, colors.base);
    grad.addColorStop(0.35, colors.mid);
    grad.addColorStop(0.82, colors.body);
    grad.addColorStop(1.00, colors.tip);

    ctx.fillStyle = grad;
    ctx.fill();

    // -------------------------------------------------------------------------
    // Delicate Central Vein / Translucent Rib
    // -------------------------------------------------------------------------
    ctx.beginPath();
    ctx.moveTo(0, h * 0.42);
    ctx.quadraticCurveTo(-w * 0.03, 0, 0, -h * 0.26);
    ctx.strokeStyle = colors.vein;
    ctx.lineWidth = Math.max(0.7, w * 0.024);
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // 5. ANIMATION TICK & PHYSICS INTEGRATION
  // ---------------------------------------------------------------------------
  function updateAndDraw(now) {
    animFrameId = 0;

    const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 0.016;
    lastTime = now;
    elapsed += dt;

    // Scroll Updraft Damping
    const updraftDecay = Math.exp(-4.5 * dt);
    scrollUpdraft *= updraftDecay;

    // Ambient Wind Wave (Gently undulates over time, drift from left to right)
    const ambientBreezeX = 22 + Math.sin(elapsed * 0.25) * 14 + Math.cos(elapsed * 0.6) * 7;

    // Clear background canvas
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < petals.length; i++) {
      const p = petals[i];

      // 1. 3D Angular Tumbling & Aerodynamic Flutter
      p.roll += (p.rollSpeed + Math.sin(elapsed * 1.5 + p.phase) * 0.35) * dt;
      p.pitch += (p.pitchSpeed * Math.cos(elapsed * 2.0 + p.phase)) * dt;
      p.yaw += (p.yawSpeed + Math.sin(elapsed * 0.5) * 0.12) * dt;

      // 2. Aerodynamic Falling Speed
      // When flat, air drag slows descent. When tilted, petal drops faster.
      const cosRoll = Math.cos(p.roll);
      const cosPitch = Math.cos(p.pitch);
      const aerodynamicDrag = 0.65 + 0.35 * Math.abs(cosRoll * cosPitch);

      const effectiveSpeedY = (p.baseSpeedY * aerodynamicDrag) * dt;
      const effectiveUpdraft = scrollUpdraft * p.z * 0.35 * dt;
      p.y += effectiveSpeedY - effectiveUpdraft;

      // 3. Horizontal Drift & Sway
      const sway = Math.sin(elapsed * p.swayFrequency + p.phase) * p.swayAmplitude;
      const effectiveSpeedX = (ambientBreezeX * p.z + sway) * dt;
      p.x += effectiveSpeedX;

      // 4. Viewport Boundary Recycle
      if (p.y > height + 100) {
        p.y = random(-140, -40);
        p.x = random(-80, width + 80);
      } else if (p.y < -180) {
        p.y = height + 80;
      }

      if (p.x > width + 120) {
        p.x = -90;
      } else if (p.x < -120) {
        p.x = width + 90;
      }

      // Draw petal
      renderPetal(p);
    }

    if (!reducedMotionQuery.matches && !document.hidden) {
      animFrameId = requestAnimationFrame(updateAndDraw);
    }
  }

  // ---------------------------------------------------------------------------
  // 6. POPULATION & RESIZE MANAGEMENT
  // ---------------------------------------------------------------------------
  function buildPetals() {
    petals.length = 0;

    const isMobile = width < 640;
    const isTablet = width < 1024;
    const isReducedMotion = reducedMotionQuery.matches;

    // Elegant, peaceful counts
    let distantCount = isMobile ? 6 : isTablet ? 10 : 13;
    let midgroundCount = isMobile ? 8 : isTablet ? 12 : 16;
    let nearCount = isMobile ? 4 : isTablet ? 6 : 8;

    if (isReducedMotion) {
      distantCount = 4;
      midgroundCount = 6;
      nearCount = 3;
    }

    for (let i = 0; i < distantCount; i++) {
      petals.push(createPetal(true, 'distant'));
    }
    for (let i = 0; i < midgroundCount; i++) {
      petals.push(createPetal(true, 'midground'));
    }
    for (let i = 0; i < nearCount; i++) {
      petals.push(createPetal(true, 'near'));
    }

    // Sort by depth so distant petals draw behind nearer petals
    petals.sort((a, b) => a.z - b.z);
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    buildPetals();

    cancelAnimationFrame(animFrameId);
    animFrameId = 0;
    lastTime = 0;
    scrollUpdraft = 0;

    updateAndDraw(performance.now());
  }

  // ---------------------------------------------------------------------------
  // 7. EVENT LISTENERS (Scroll Updraft, Visibility, Resize)
  // Zero pointer/cursor event listeners — petals never react to mouse movement
  // ---------------------------------------------------------------------------
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const deltaY = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;

    if (reducedMotionQuery.matches || document.hidden) return;

    // Subtle upward air displacement on scroll
    scrollUpdraft = Math.max(-180, Math.min(180, scrollUpdraft + deltaY * 1.5));
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animFrameId);
      animFrameId = 0;
      lastTime = 0;
    } else {
      lastTime = performance.now();
      if (!reducedMotionQuery.matches && !animFrameId) {
        animFrameId = requestAnimationFrame(updateAndDraw);
      }
    }
  });

  reducedMotionQuery.addEventListener('change', () => {
    resize();
  });

  window.addEventListener('resize', resize);

  // Initialize
  resize();
})();
