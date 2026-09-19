/**
 * ADRIAN SETH TABOTABO — AMBIENT SAKURA DRIFT
 * Falling petals rendered across three discrete depth planes.
 *
 * Depth is sold by four cues working together, not by size alone:
 *   1. Defocus   — distant planes are blurred, the near plane is sharp.
 *   2. Haze      — distant petals desaturate toward the background.
 *   3. Parallax  — scrolling displaces near petals far more than far ones.
 *   4. Motion    — near petals fall faster and swing wider.
 */

(function () {
  'use strict';

  const host = document.getElementById('sakuraLayers');
  if (!host) return;

  // Honour reduced-motion: leave the background completely still.
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches) return;

  const isCoarse = window.matchMedia('(pointer: coarse)').matches;

  // Near petals keep the saturated rose tones; far petals are hazed toward
  // the pale background so distance reads as atmosphere, not just opacity.
  const PALETTE_NEAR = [
    { r: 251, g: 113, b: 133 }, // Petal Rose
    { r: 244, g: 114, b: 182 }, // Blush Orchid
    { r: 253, g: 164, b: 175 }  // Warm Peach Blush
  ];
  const PALETTE_FAR = [
    { r: 250, g: 190, b: 205 }, // Hazed Rose
    { r: 248, g: 196, b: 222 }, // Hazed Orchid
    { r: 252, g: 225, b: 235 }  // Pale Highlight
  ];

  const LAYERS = [
    {
      name: 'far',
      blur: 3.6,
      count: isCoarse ? 16 : 30,
      size: [5, 10],
      speed: [0.14, 0.30],
      opacity: [0.30, 0.44],
      sway: [8, 18],
      parallax: 0.05,
      palette: PALETTE_FAR
    },
    {
      name: 'mid',
      blur: 1.3,
      count: isCoarse ? 11 : 20,
      size: [11, 19],
      speed: [0.36, 0.62],
      opacity: [0.34, 0.48],
      sway: [16, 30],
      parallax: 0.16,
      palette: PALETTE_NEAR
    },
    {
      name: 'near',
      blur: 0,
      count: isCoarse ? 4 : 9,
      size: [22, 36],
      speed: [0.72, 1.15],
      opacity: [0.30, 0.44],
      sway: [28, 50],
      parallax: 0.42,
      palette: PALETTE_NEAR
    }
  ];

  let width = 0;
  let height = 0;
  let dpr = 1;

  // Build one canvas per plane so the blur can be applied once by the
  // compositor, instead of per-petal through the expensive ctx.filter path.
  const planes = LAYERS.map((layer) => {
    const canvas = document.createElement('canvas');
    canvas.className = 'sakura-layer';
    canvas.dataset.depth = layer.name;
    if (layer.blur > 0) canvas.style.filter = `blur(${layer.blur}px)`;
    host.appendChild(canvas);
    return { layer, canvas, ctx: canvas.getContext('2d'), petals: [], pad: 0 };
  });

  if (planes.some((p) => !p.ctx)) return;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;

    for (const plane of planes) {
      // Overdraw the canvas past the viewport edges so a blurred petal
      // fades in and out instead of being clipped flat at the boundary.
      const pad = plane.layer.blur * 4;
      plane.pad = pad;
      plane.canvas.width = Math.round((width + pad * 2) * dpr);
      plane.canvas.height = Math.round((height + pad * 2) * dpr);
      plane.canvas.style.width = (width + pad * 2) + 'px';
      plane.canvas.style.height = (height + pad * 2) + 'px';
      plane.canvas.style.left = -pad + 'px';
      plane.canvas.style.top = -pad + 'px';
      plane.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  const rand = (range) => range[0] + Math.random() * (range[1] - range[0]);

  class Petal {
    constructor(layer, seeded) {
      this.layer = layer;
      this.reset(seeded, false);
    }

    reset(seeded, fromBottom) {
      const l = this.layer;
      this.x = Math.random() * width;
      this.originX = this.x;

      if (seeded) {
        this.y = Math.random() * height;
      } else if (fromBottom) {
        this.y = height + 20 + Math.random() * 60;
      } else {
        this.y = -20 - Math.random() * 60;
      }

      this.size = rand(l.size);
      this.fallSpeed = rand(l.speed);
      this.swayAmplitude = rand(l.sway);
      this.swaySpeed = 0.004 + Math.random() * 0.006;
      this.swayPhase = Math.random() * Math.PI * 2;
      this.rotation = Math.random() * Math.PI * 2;
      this.flipPhase = Math.random() * Math.PI * 2;
      // A second, slower rotation axis. Without it the petal only ever
      // turns about its vertical axis, which is what makes a tumble read
      // as a flat card pulsing rather than an object rolling in space.
      this.pitchPhase = Math.random() * Math.PI * 2;
      this.opacity = rand(l.opacity);
      this.color = l.palette[Math.floor(Math.random() * l.palette.length)];
      // The underside of a real petal is paler and less saturated than the
      // face, so mix the front colour toward white for the back face.
      this.backColor = {
        r: Math.round(this.color.r + (255 - this.color.r) * 0.45),
        g: Math.round(this.color.g + (255 - this.color.g) * 0.45),
        b: Math.round(this.color.b + (255 - this.color.b) * 0.45)
      };

      // Small distant petals tumble faster than the large near ones —
      // angular speed falls off as apparent size grows.
      const span = l.size[1] - l.size[0] || 1;
      const sizeRatio = (this.size - l.size[0]) / span;
      this.spin = (Math.random() - 0.5) * (0.016 - sizeRatio * 0.008);
      this.flipSpeed = (0.006 + Math.random() * 0.009) * (1.3 - sizeRatio * 0.6);
      // Deliberately not a clean multiple of flipSpeed — if the two axes
      // stay in phase the tumble repeats visibly.
      this.pitchSpeed = this.flipSpeed * (0.37 + Math.random() * 0.31);
    }

    update(delta, scrollDelta) {
      this.y += this.fallSpeed * delta;
      // Parallax: the page moving under the petal displaces near planes
      // hard and distant planes barely at all.
      this.y -= scrollDelta * this.layer.parallax;

      this.swayPhase += this.swaySpeed * delta;
      this.flipPhase += this.flipSpeed * delta;
      this.pitchPhase += this.pitchSpeed * delta;
      this.rotation += this.spin * delta;
      this.x = this.originX + Math.sin(this.swayPhase) * this.swayAmplitude;

      // Wrap in both directions — scrolling up can carry a petal off the top.
      if (this.y - this.size > height) {
        this.reset(false, false);
      } else if (this.y + this.size < -80) {
        this.reset(false, true);
      }
    }

    draw(ctx, pad) {
      const s = this.size;

      // facing is signed: its magnitude is how square-on the petal is, and
      // its sign says which face is toward the viewer. The old code took
      // Math.abs() here and threw the sign away, which is precisely why the
      // tumble read as a card pulsing instead of a surface rolling over.
      const facing = Math.cos(this.flipPhase);
      const square = Math.abs(facing);
      const showingBack = facing < 0;

      // Foreshortening on both axes. Pitch never fully flattens, so the
      // petal keeps some body while the yaw carries it through edge-on.
      const scaleX = 0.16 + square * 0.84;
      const scaleY = 0.82 + Math.abs(Math.cos(this.pitchPhase)) * 0.18;

      // A curved surface catches less light as it turns away from square-on.
      const shade = 0.58 + square * 0.42;
      const base = this.opacity * shade;
      const c = showingBack ? this.backColor : this.color;
      const { r, g, b } = c;

      ctx.save();
      ctx.translate(this.x + pad, this.y + pad);
      ctx.rotate(this.rotation);

      // Shear alongside the scale. Scaling alone keeps the silhouette
      // perfectly symmetric no matter how the petal turns, which is the
      // giveaway that it is flat; the shear leans the far edge away so the
      // outline itself changes through the roll.
      ctx.transform(scaleX, 0, facing * 0.24, scaleY, 0, 0);

      // Curvature is shaded with a gradient rather than two flat halves —
      // a hard seam down the middle reads as a crease, not a curve. The
      // bright band tracks the ridge, which slides across the petal as it
      // turns, and the edge rolling away falls off into shadow.
      const lit = base;
      const shadow = base * 0.62;
      const ridge = 0.5 + facing * 0.26;
      const gradient = ctx.createLinearGradient(-s * 0.62, 0, s * 0.62, 0);
      const stops = facing >= 0
        ? [shadow, lit, shadow * 0.92]
        : [shadow * 0.92, lit, shadow];
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${stops[0].toFixed(3)})`);
      gradient.addColorStop(Math.min(0.88, Math.max(0.12, ridge)), `rgba(${r}, ${g}, ${b}, ${stops[1].toFixed(3)})`);
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${stops[2].toFixed(3)})`);
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

  resize();
  for (const plane of planes) {
    plane.petals = Array.from(
      { length: plane.layer.count },
      () => new Petal(plane.layer, true)
    );
  }

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  }, { passive: true });

  let lastScrollY = window.scrollY || 0;
  let running = true;
  let lastTime = performance.now();
  let frameId = null;

  function loop(now) {
    // Normalise to 60fps steps so speed is frame-rate independent,
    // and clamp so a backgrounded tab doesn't teleport every petal.
    const delta = Math.min((now - lastTime) / 16.667, 3);
    lastTime = now;

    const scrollY = window.scrollY || 0;
    // Clamp the jump so anchor links and scroll restoration don't fling
    // the whole field off-screen in a single frame.
    const scrollDelta = Math.max(-120, Math.min(120, scrollY - lastScrollY));
    lastScrollY = scrollY;

    for (const plane of planes) {
      const ctx = plane.ctx;
      ctx.clearRect(0, 0, plane.canvas.width, plane.canvas.height);
      for (let i = 0; i < plane.petals.length; i++) {
        plane.petals[i].update(delta, scrollDelta);
        plane.petals[i].draw(ctx, plane.pad);
      }
    }

    frameId = requestAnimationFrame(loop);
  }

  function start() {
    // Guard on the frame handle rather than the running flag: a tab that
    // loads while hidden never gets its first frame, and keying off the
    // flag alone would leave the loop permanently unscheduled.
    if (frameId !== null) return;
    running = true;
    lastTime = performance.now();
    lastScrollY = window.scrollY || 0;
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
    if (document.hidden) stop();
    else start();
  });

  // Stop drawing if the user switches on reduced motion mid-session.
  const onMotionPreferenceChange = (event) => {
    if (event.matches) {
      stop();
      for (const plane of planes) {
        plane.ctx.clearRect(0, 0, plane.canvas.width, plane.canvas.height);
      }
    } else {
      start();
    }
  };
  if (typeof reducedMotion.addEventListener === 'function') {
    reducedMotion.addEventListener('change', onMotionPreferenceChange);
  }

  frameId = requestAnimationFrame(loop);
})();
