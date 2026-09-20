/**
 * ADRIAN SETH TABOTABO — ENGINEERING ARSENAL RIBBON
 *
 * Every tool in the arsenal, flattened into one continuous scroll-driven
 * stream. Depth grows with the SQUARE of a card's distance from the one being
 * read, so the ribbon is nearest the lens in the middle and tapers to a
 * vanishing thread in both directions at once. That is what separates it from
 * the sakura spiral one chapter down: this stream flows past a fixed camera
 * and recedes at both ends, where the spiral orbits a single axis. Two orbits
 * in a row would have rhymed.
 *
 * The <ul> in the markup is the real list: ordered, screen-readable, and the
 * only copy of the arsenal in the DOM. What follows is purely a projection of
 * it, and it collapses back to a plain grid whenever motion is unwelcome.
 */

(function () {
  'use strict';

  const root = document.getElementById('engineeringArsenal');
  const focusName = document.getElementById('arsenalFocusName');
  const focusCat = document.getElementById('arsenalFocusCat');
  const focusCount = document.getElementById('arsenalFocusCount');
  const groups = window.PORTFOLIO_DATA?.tools?.groups;
  if (!root || !Array.isArray(groups) || !groups.length) return;

  const staticQuery = matchMedia('(prefers-reduced-motion: reduce), (max-width: 860px), (max-height: 560px)');

  // ==========================================================================
  // 1. FLATTEN — one stream, categories demoted to a micro-label
  // ==========================================================================

  const entries = [];
  groups.forEach(group => {
    group.items.forEach(item => {
      entries.push({ name: item.name, mark: item.mark, category: group.label });
    });
  });
  const N = entries.length;

  // ==========================================================================
  // 2. RIBBON GEOMETRY
  // ==========================================================================

  // Depth is a parabola in `s`, the signed distance from the card currently
  // being read. That is the whole trick: the stream is nearest the lens at the
  // card in hand and recedes in BOTH directions, so the ribbon tapers to a
  // vanishing thread at each end instead of one end ballooning past the
  // camera. Lateral travel is linear, so once the taper outruns it the ribbon
  // folds back on itself and picks up the curl the reference has.
  const SWEEP_X = 178;           // world units of lateral travel per card
  const SWEEP_Y = -62;           // climb per card — the diagonal's slope
  const WAVE_AMP = 205;          // undulation across the ribbon
  const WAVE_FREQ = 0.34;         // radians of wave per card
  // The taper, and the single most sensitive number here. Too steep and the
  // whole stream collapses into a sausage around the focus; this value puts
  // the fold — where the taper starts outrunning the lateral sweep — at
  // sqrt(DISTANCE / CURVE_Z) ≈ 12 cards out, near the edge of the frame.
  const CURVE_Z = 8;
  const FOCAL = 910;             // shared with sakura-spiral.js — one lens
  const DISTANCE = 1180;

  // The read position: where the card in focus sits, as a fraction of the
  // stage, measured from its centre. Nudged right of centre so the ribbon
  // crosses the frame off-axis rather than splitting it in half.
  const ORIGIN_X = 0.1;
  const ORIGIN_Y = 0.04;

  // Live cards either side of the head; everything beyond is dropped out of
  // layout entirely. Each live card is a composited layer the browser has to
  // transform every frame, so WINDOW is effectively the frame budget. Past FAR
  // a plate is too small to read and gives up its type and its shadow.
  const WINDOW = 22;
  const FAR = 9;

  // Blank scroll on both ends so the first card arrives and the last card
  // leaves instead of snapping into and out of focus at the chapter edges.
  const LEAD = 3.2;

  const RAD_TO_DEG = 180 / Math.PI;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const smootherstep = t => t * t * t * (t * (t * 6 - 15) + 10);

  /** Screen position of a card sitting `s` cards from the one in focus. */
  function place(s) {
    const z = CURVE_Z * s * s;
    const scale = FOCAL / (DISTANCE + z);
    return {
      x: s * SWEEP_X * scale,
      y: (s * SWEEP_Y + Math.sin(s * WAVE_FREQ) * WAVE_AMP) * scale,
      z,
      scale
    };
  }

  // ==========================================================================
  // 3. BUILD THE CARDS
  // ==========================================================================

  root.innerHTML = '';
  const cards = entries.map((entry, i) => {
    const li = document.createElement('li');
    li.className = 'arsenal-card';
    li.dataset.index = String(i);

    const mark = document.createElement('span');
    if (entry.mark) {
      mark.className = 'arsenal-card__mark';
      // Masked rather than <img>, so a single-path brand SVG inherits the
      // card's colour and can warm from slate to ink as it reaches centre.
      // Resolved against the document rather than left relative: a url() that
      // travels through a custom property is resolved against the stylesheet
      // that consumes it, which would look for these under css/.
      const href = new URL(`assets/tech/${entry.mark}.svg`, document.baseURI).href;
      mark.style.setProperty('--mark', `url("${href}")`);
    } else {
      // No brand mark exists for this one. A monogram plate in the same frame
      // and the same ink keeps it a deliberate member of the set rather than
      // a hole in the ribbon.
      mark.className = 'arsenal-card__mark arsenal-card__mark--mono';
      mark.textContent = monogram(entry.name);
    }
    mark.setAttribute('aria-hidden', 'true');

    const name = document.createElement('span');
    name.className = 'arsenal-card__name';
    name.textContent = entry.name;

    const cat = document.createElement('span');
    cat.className = 'arsenal-card__cat';
    cat.textContent = entry.category;

    li.append(mark, name, cat);
    root.appendChild(li);
    return li;
  });

  /** Up to two initials, skipping punctuation and version noise. */
  function monogram(name) {
    const words = name
      .replace(/\(.*?\)/g, ' ')
      .split(/[\s/&.-]+/)
      .filter(w => /[A-Za-z0-9]/.test(w));
    if (!words.length) return name.slice(0, 2).toUpperCase();
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  // ==========================================================================
  // 4. THE CURRENT — rose stream, bloom, and hanafubuki
  // ==========================================================================

  const canvas = document.getElementById('arsenalCurrent');
  const ctx = canvas ? canvas.getContext('2d') : null;

  /**
   * A single Somei-Yoshino petal, pre-rendered once. Same construction as the
   * spiral's: notched cleft tip, carmine core bleeding out to near-white.
   */
  function createPetalSprite() {
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 44;
    const paint = sprite.getContext('2d');
    if (!paint) return sprite;
    paint.translate(22, 22);

    const grad = paint.createRadialGradient(0, 0, 2, 0, -9, 19);
    grad.addColorStop(0, 'rgba(215, 45, 102, 0.85)');
    grad.addColorStop(0.32, 'rgba(255, 176, 202, 0.82)');
    grad.addColorStop(0.82, 'rgba(255, 244, 248, 0.88)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0.9)');
    paint.fillStyle = grad;

    paint.beginPath();
    paint.moveTo(0, 0);
    paint.bezierCurveTo(-8, -4, -10, -14, -7, -18);
    paint.quadraticCurveTo(-2, -17.2, 0, -15);
    paint.quadraticCurveTo(2, -17.2, 7, -18);
    paint.bezierCurveTo(10, -14, 8, -4, 0, 0);
    paint.closePath();
    paint.fill();
    return sprite;
  }

  const petalSprite = ctx ? createPetalSprite() : null;

  // Petals ride the same path the cards do, each parked at its own offset
  // along it, drifting slowly downstream and bobbing across it. Deterministic
  // so the stream looks the same on every visit.
  const PETALS = 64;
  const petals = Array.from({ length: PETALS }, (_, i) => {
    const r = Math.sin(i * 12.9898) * 43758.5453;
    const f = r - Math.floor(r);
    const r2 = Math.sin(i * 78.233) * 12345.6789;
    const f2 = r2 - Math.floor(r2);
    return {
      offset: -WINDOW + f * WINDOW * 2,  // where along the ribbon it sits
      drift: 0.35 + f2 * 0.9,            // how fast it slides downstream
      across: (f2 - 0.5) * 1.15,         // lateral bias off the ribbon spine
      size: 13 + f * 20,
      spin: f2 * Math.PI * 2,
      spinRate: (f - 0.5) * 0.7
    };
  });

  let dpr = 1;

  function sizeCanvas() {
    if (!canvas) return;
    // In static mode the stage is as tall as all 92 cards stacked, and sizing
    // the canvas to it allocated a ~6 megapixel bitmap for something that is
    // cleared and never drawn — worst of all on the phones that path exists
    // for. Collapse it to nothing instead.
    if (staticQuery.matches) {
      canvas.width = canvas.height = 0;
      return;
    }
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(stageW * dpr);
    canvas.height = Math.round(stageH * dpr);
    canvas.style.width = stageW + 'px';
    canvas.style.height = stageH + 'px';
  }

  /**
   * Paints the current behind the cards: a rose ribbon tracing the exact path
   * the cards ride, a bloom of light where the card in focus sits, and petals
   * drifting down the stream. The cards were floating on nothing before this;
   * now they are being carried.
   */
  function paintCurrent(head, ox, oy, time) {
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, stageW, stageH);
    // The cards are positioned inside a <ul> pinned at top:50%/left:50%, so
    // everything place() returns is relative to the stage CENTRE. The canvas
    // origin is its top-left corner, so the centre has to be added back or the
    // whole current paints into the corner.
    ctx.translate(stageW / 2 + ox, stageH / 2 + oy);

    // --- 1. The bloom. The soft centre of the whole chapter: the light the
    // stream is flowing through, sitting exactly where the card is read.
    const bloom = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.min(stageW, stageH) * 0.52);
    bloom.addColorStop(0, 'rgba(251, 113, 133, 0.34)');
    bloom.addColorStop(0.28, 'rgba(249, 138, 168, 0.17)');
    bloom.addColorStop(0.62, 'rgba(253, 164, 175, 0.06)');
    bloom.addColorStop(1, 'rgba(255, 250, 247, 0)');
    ctx.fillStyle = bloom;
    ctx.fillRect(-stageW, -stageH, stageW * 2, stageH * 2);

    // --- 2. The stream. Walk the path, collecting a spine point and a
    // half-width that follows the card scale, so the ribbon is broad and warm
    // where the plates are big and thins to a thread as they recede.
    const STEP = 0.5;
    const spine = [];
    for (let s = -WINDOW; s <= WINDOW; s += STEP) {
      const p = place(s);
      const taper = 1 - smootherstep(clamp(Math.abs(s) / WINDOW));
      spine.push({ x: p.x, y: p.y, w: (14 + 74 * p.scale) * taper, a: taper });
    }

    // One closed shape: down one edge, back along the other.
    ctx.beginPath();
    for (let i = 0; i < spine.length; i++) {
      const c = spine[i];
      const n = spine[Math.min(i + 1, spine.length - 1)];
      const pv = spine[Math.max(i - 1, 0)];
      const tx = n.x - pv.x, ty = n.y - pv.y;
      const len = Math.hypot(tx, ty) || 1;
      c.nx = -ty / len; c.ny = tx / len;   // unit normal, kept for the petals
      const px = c.x + c.nx * c.w, py = c.y + c.ny * c.w;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    for (let i = spine.length - 1; i >= 0; i--) {
      const c = spine[i];
      ctx.lineTo(c.x - c.nx * c.w, c.y - c.ny * c.w);
    }
    ctx.closePath();

    const first = spine[0], last = spine[spine.length - 1];
    const flow = ctx.createLinearGradient(first.x, first.y, last.x, last.y);
    flow.addColorStop(0, 'rgba(252, 231, 243, 0)');
    flow.addColorStop(0.20, 'rgba(250, 200, 224, 0.26)');
    flow.addColorStop(0.5, 'rgba(251, 113, 133, 0.22)');
    flow.addColorStop(0.80, 'rgba(250, 200, 224, 0.26)');
    flow.addColorStop(1, 'rgba(252, 231, 243, 0)');
    ctx.fillStyle = flow;
    ctx.fill();

    // Two strokes down the spine rather than one: a wide soft halo, then a
    // tight bright core inside it. That contrast is what makes the stream read
    // as light being carried along a path instead of a flat pink smear — the
    // single wide wash it replaced covered most of the frame at alpha 40.
    ctx.beginPath();
    for (let i = 0; i < spine.length; i++) {
      const c = spine[i];
      i === 0 ? ctx.moveTo(c.x, c.y) : ctx.lineTo(c.x, c.y);
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.strokeStyle = flow;
    ctx.lineWidth = 34;
    ctx.globalAlpha = 0.42;
    ctx.stroke();

    const core = ctx.createLinearGradient(first.x, first.y, last.x, last.y);
    core.addColorStop(0, 'rgba(255, 255, 255, 0)');
    core.addColorStop(0.3, 'rgba(255, 240, 246, 0.75)');
    core.addColorStop(0.5, 'rgba(255, 225, 236, 0.95)');
    core.addColorStop(0.7, 'rgba(255, 240, 246, 0.75)');
    core.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.strokeStyle = core;
    ctx.lineWidth = 6;
    ctx.globalAlpha = 0.85;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // --- 3. Hanafubuki. Petals carried along the current, sized and faded by
    // the same perspective the cards obey so they sit in the same space.
    if (petalSprite) {
      for (let i = 0; i < petals.length; i++) {
        const pt = petals[i];
        // Drift downstream, wrapping through the window.
        let s = pt.offset + (time * 0.00022 * pt.drift * 14) % (WINDOW * 2);
        s = ((s + WINDOW) % (WINDOW * 2)) - WINDOW;

        const p = place(s);
        const taper = 1 - smootherstep(clamp(Math.abs(s) / WINDOW));
        if (taper < 0.02) continue;

        // Bob across the ribbon, riding its normal.
        const idx = Math.round((s + WINDOW) / STEP);
        const c = spine[Math.min(Math.max(idx, 0), spine.length - 1)];
        const sway = Math.sin(time * 0.0009 + i * 1.7) * 0.5 + pt.across;
        const off = sway * (c.w + 26);

        const size = pt.size * p.scale;
        ctx.save();
        ctx.translate(p.x + (c.nx || 0) * off, p.y + (c.ny || 0) * off);
        ctx.rotate(pt.spin + time * 0.0006 * pt.spinRate);
        // Roll the petal about its own axis so it flashes edge-on and flat,
        // the way a falling petal actually turns.
        const roll = Math.cos(time * 0.0011 + i);
        ctx.transform(0.25 + Math.abs(roll) * 0.75, 0, roll * 0.2, 1, 0, 0);
        ctx.globalAlpha = taper * 0.95;
        ctx.drawImage(petalSprite, -size * 0.5, -size * 0.5, size, size);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }
  }

  // ==========================================================================
  // 5. RENDER
  // ==========================================================================

  let mounted = new Set();
  // Last value written to each card, so a frame only touches what changed.
  const writes = entries.map(() => ({ tf: '', op: '', zi: '', nr: '', lg: '', far: null }));
  let lastFocus = -1;
  let isStatic = null;
  let stageW = 0;
  let stageH = 0;
  // The petals drift under their own clock, so the current owes a frame even
  // when the scroll has not moved. lastHead remembers where the stream was so
  // an ambient repaint lands in the same place the scroll left it.
  let animTime = 0;
  let lastHead = -LEAD;
  let onScreen = false;
  let rafId = 0;

  function measure() {
    const stage = root.parentElement;
    stageW = stage.clientWidth || window.innerWidth;
    stageH = stage.clientHeight || window.innerHeight;
    sizeCanvas();
  }

  function render(progress) {
    if (staticQuery.matches) {
      if (isStatic !== true) enterStatic();
      return;
    }
    if (isStatic !== false) exitStatic();

    const head = -LEAD + clamp(progress) * (N - 1 + LEAD * 2);
    const focus = clamp(Math.round(head), 0, N - 1);
    const next = new Set();

    const ox = stageW * ORIGIN_X;
    const oy = stageH * ORIGIN_Y;

    lastHead = head;
    paintCurrent(head, ox, oy, animTime);

    for (let i = Math.max(0, Math.ceil(head - WINDOW)); i <= Math.min(N - 1, Math.floor(head + WINDOW)); i++) {
      next.add(i);
      const card = cards[i];
      const s = i - head;
      const p = place(s);

      // Bank the card along the ribbon. The tangent is taken from the
      // projected path itself rather than from the world curve, so the plate
      // leans along what the viewer actually sees — including through the
      // fold, where the world tangent and the screen tangent disagree.
      const ahead = place(s + 0.35);
      const roll = Math.atan2(ahead.y - p.y, ahead.x - p.x) * RAD_TO_DEG;

      // Partial facing: the card twists with the wave but is never allowed to
      // go fully edge-on, which would drop a tool out of the stream entirely.
      const yaw = Math.sin(s * WAVE_FREQ) * 38;

      const dist = Math.abs(s);
      const fade = 1 - smootherstep(clamp((dist - 2.2) / (WINDOW - 2.2)));
      const near = 1 - smootherstep(clamp(dist / 5));

      if (!mounted.has(i)) card.classList.add('is-live');

      // Every one of these writes is guarded against a no-op. Transform moves
      // on essentially every frame, but opacity, stacking order and --near
      // settle for long stretches, and --near is the expensive one: it feeds
      // three color-mix() calls per card, so re-declaring it costs a style
      // recalc across the whole card subtree. Quantising it to 5% steps means
      // that recalc happens a handful of times per card per chapter instead of
      // sixty times a second.
      const st = writes[i];

      const tf =
        `translate(-50%, -50%) ` +
        `translate3d(${(ox + p.x).toFixed(2)}px, ${(oy + p.y).toFixed(2)}px, 0) ` +
        `scale(${p.scale.toFixed(4)}) ` +
        `rotate(${(roll * 0.34).toFixed(2)}deg) ` +
        `perspective(${(FOCAL * p.scale).toFixed(1)}px) ` +
        `rotateY(${yaw.toFixed(2)}deg)`;
      if (st.tf !== tf) { card.style.transform = tf; st.tf = tf; }

      const op = (0.16 + fade * 0.84).toFixed(2);
      if (st.op !== op) { card.style.opacity = op; st.op = op; }

      // Nearest to the lens paints last.
      const zi = String(600 - Math.round(p.z / 12));
      if (st.zi !== zi) { card.style.zIndex = zi; st.zi = zi; }

      const nr = (Math.round(near * 20) / 20).toFixed(2);
      if (st.nr !== nr) { card.style.setProperty('--near', nr); st.nr = nr; }

      // Type fades to nothing exactly as the card crosses into `is-far`, so
      // dropping it from the render there is a no-op to the eye rather than a
      // pop. --near stays on its own tighter curve because it drives the
      // colour warming, which should resolve well before the type gives up.
      const lg = (Math.round((1 - smootherstep(clamp(dist / FAR))) * 20) / 20).toFixed(2);
      if (st.lg !== lg) { card.style.setProperty('--legible', lg); st.lg = lg; }

      const far = dist > FAR;
      if (st.far !== far) { card.classList.toggle('is-far', far); st.far = far; }
    }

    // Unmount everything that left the window.
    mounted.forEach(i => {
      if (!next.has(i)) {
        cards[i].classList.remove('is-live', 'is-focus', 'is-far');
        cards[i].style.transform = '';
        writes[i].tf = '';
        writes[i].far = null;
      }
    });
    mounted = next;

    if (focus !== lastFocus) {
      // Swap the focus class on exactly two cards rather than asking all
      // ninety-two whether they are the one.
      if (lastFocus >= 0) cards[lastFocus].classList.remove('is-focus');
      cards[focus].classList.add('is-focus');
      lastFocus = focus;
      const entry = entries[focus];
      if (focusName) focusName.textContent = entry.name;
      if (focusCat) focusCat.textContent = entry.category;
      if (focusCount) {
        focusCount.textContent =
          `${String(focus + 1).padStart(3, '0')} / ${String(N).padStart(3, '0')}`;
      }
    }
  }

  // ==========================================================================
  // 6. STATIC FALLBACK — reduced motion, small screens, short viewports
  // ==========================================================================

  function enterStatic() {
    isStatic = true;
    root.classList.add('is-static');
    cards.forEach(card => {
      card.classList.remove('is-live', 'is-focus', 'is-far');
      card.style.transform = '';
      card.style.opacity = '';
      card.style.zIndex = '';
      card.style.removeProperty('--near');
      card.style.removeProperty('--legible');
    });
    writes.forEach(w => { w.tf = ''; w.op = ''; w.zi = ''; w.nr = ''; w.lg = ''; w.far = null; });
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    sizeCanvas();
    if (focusName) focusName.textContent = 'The full arsenal';
    if (focusCat) focusCat.textContent = `${groups.length} disciplines`;
    if (focusCount) focusCount.textContent = `${String(N).padStart(3, '0')} tools`;
  }

  function exitStatic() {
    isStatic = false;
    root.classList.remove('is-static');
    lastFocus = -1;
  }

  staticQuery.addEventListener('change', () => {
    isStatic = null;
    mounted = new Set();
    measure();
    window.dispatchEvent(new Event('scroll'));
  });

  window.addEventListener('resize', () => {
    measure();
    window.dispatchEvent(new Event('scroll'));
  }, { passive: true });

  // The current keeps flowing while the chapter is on screen; off screen it
  // costs nothing at all. Matches how the sakura spiral idles.
  function ambientLoop(now) {
    if (onScreen && !staticQuery.matches && !document.hidden) {
      animTime = now;
      paintCurrent(lastHead, stageW * ORIGIN_X, stageH * ORIGIN_Y, animTime);
    }
    rafId = requestAnimationFrame(ambientLoop);
  }

  if ('IntersectionObserver' in window) {
    const section = document.getElementById('studio');
    if (section) {
      new IntersectionObserver(es => { onScreen = es.some(e => e.isIntersecting); },
        { threshold: 0.02 }).observe(section);
    }
  } else {
    onScreen = true;
  }

  rafId = requestAnimationFrame(ambientLoop);

  window.ArsenalRibbon = { render };

  // Paint once on load so the chapter is never blank before the first scroll.
  measure();
  render(0);
})();
