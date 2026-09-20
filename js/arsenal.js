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
  // 4. RENDER
  // ==========================================================================

  let mounted = new Set();
  // Last value written to each card, so a frame only touches what changed.
  const writes = entries.map(() => ({ tf: '', op: '', zi: '', nr: '', lg: '', far: null }));
  let lastFocus = -1;
  let isStatic = null;
  let stageW = 0;
  let stageH = 0;

  function measure() {
    const stage = root.parentElement;
    stageW = stage.clientWidth || window.innerWidth;
    stageH = stage.clientHeight || window.innerHeight;
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
  // 5. STATIC FALLBACK — reduced motion, small screens, short viewports
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

  window.ArsenalRibbon = { render };

  // Paint once on load so the chapter is never blank before the first scroll.
  measure();
  render(0);
})();
