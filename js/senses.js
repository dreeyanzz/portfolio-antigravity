/**
 * SENSES & SOUL — THE CORKBOARD
 * The interests are pinned in a stack. js/scrollytelling.js hands us the
 * chapter's pinned progress through window.renderSenses, split into one beat
 * per card plus a final holding beat; each beat brings one card to the front.
 * Moving forward pulls the front card's pin and tucks it behind the pile;
 * moving back pulls cards out from behind.
 */
(() => {
  'use strict';

  const track = document.getElementById('curiosities');
  if (!track) return;
  const board = track.querySelector('.board');
  const cork = track.querySelector('.cork');
  const holes = track.querySelector('.holes');
  const area = track.querySelector('.stack-area');
  const stack = track.querySelector('.stack');
  const tagList = track.querySelector('.tags');
  const announcer = track.querySelector('.senses-announcer');
  const cards = [...stack.querySelectorAll('.pin-card')];
  const N = cards.length;
  // Extra beats the last card holds before the board leaves. Without one, the
  // last card's beat ran straight into the exit: the card lands a little after
  // its beat starts (the scroll engine smooths the scroll it hands us, and the
  // flight takes ~0.9s), while the board unpins on the raw scroll, so the last
  // card got far less time on screen than the gap between any two cards.
  // The chapter's track height in styles.css must allow for these beats.
  const HOLD = 1;
  const BEATS = N + HOLD;
  // Must match the flow rules at the end of styles.css.
  const FLOW_QUERY = matchMedia('(max-width: 760px), (max-height: 560px), (prefers-reduced-motion: reduce)');
  // Below this the cards reflow in CSS instead of being scaled down.
  const REFLOW_QUERY = matchMedia('(max-width: 600px)');

  /* ------------------------------------------------------------------
     Procedural textures: cork granules and oak grain, drawn once.
     ------------------------------------------------------------------ */
  function rng(seed) {
    return () => {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function corkTexture() {
    const S = 768, c = document.createElement('canvas');
    c.width = c.height = S;
    const g = c.getContext('2d'), rnd = rng(11);
    // Anything crossing an edge is drawn again on the far side so the tile repeats seamlessly.
    const wrap = (x, y, r, draw) => {
      for (const dx of [-S, 0, S]) for (const dy of [-S, 0, S]) {
        const X = x + dx, Y = y + dy;
        if (X > -r && X < S + r && Y > -r && Y < S + r) draw(X, Y);
      }
    };
    g.fillStyle = '#4e301a';
    g.fillRect(0, 0, S, S);

    // Granules: a shadowed underside, the body, and a lit top-left facet.
    for (let i = 0; i < 14000; i++) {
      const x = rnd() * S, y = rnd() * S, r = 1.8 + rnd() * rnd() * 6.5;
      const roll = rnd();
      const l = roll < .06 ? 20 + rnd() * 10 : roll > .96 ? 68 + rnd() * 8 : 38 + rnd() * 26;
      const col = `hsl(${24 + rnd() * 12} ${36 + rnd() * 22}% ${l}%)`;
      const pts = [], k = 5 + (rnd() * 3 | 0);
      for (let j = 0; j < k; j++) {
        const a = j / k * Math.PI * 2 + rnd() * .5, rr = r * (.62 + rnd() * .4);
        pts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
      }
      const poly = (X, Y, s, ox, oy) => {
        g.beginPath();
        pts.forEach(([px, py], j) => g[j ? 'lineTo' : 'moveTo'](X + ox + px * s, Y + oy + py * s));
        g.closePath(); g.fill();
      };
      wrap(x, y, r * 1.6, (X, Y) => {
        g.fillStyle = 'rgba(30, 14, 4, .35)'; poly(X, Y, 1, r * .3, r * .32);
        g.fillStyle = col; poly(X, Y, 1, 0, 0);
        g.fillStyle = 'rgba(255, 228, 186, .16)'; poly(X, Y, .55, -r * .22, -r * .24);
      });
    }

    // Broad mottling, so the board is not one flat tone.
    for (let i = 0; i < 70; i++) {
      const x = rnd() * S, y = rnd() * S, r = 50 + rnd() * 140, light = rnd() < .5;
      wrap(x, y, r, (X, Y) => {
        const gr = g.createRadialGradient(X, Y, 0, X, Y, r);
        gr.addColorStop(0, light ? 'rgba(226,178,120,.10)' : 'rgba(60,32,12,.13)');
        gr.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = gr; g.fillRect(X - r, Y - r, r * 2, r * 2);
      });
    }

    const img = g.getImageData(0, 0, S, S), d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (rnd() - .5) * 20;
      d[i] += n; d[i + 1] += n * .9; d[i + 2] += n * .8;
    }
    g.putImageData(img, 0, 0);
    return c;
  }

  function woodTexture() {
    const W = 1400, H = 64, c = document.createElement('canvas');
    c.width = W; c.height = H;
    const g = c.getContext('2d'), rnd = rng(5), img = g.createImageData(W, H), d = img.data;
    const light = [226, 192, 150], dark = [168, 120, 76];
    const phase = Array.from({ length: H }, () => rnd() * 6);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const warp = Math.sin(x * .0042 + y * .045) * 7 + Math.sin(x * .017 + phase[y] * .1) * 1.6;
      let v = .5 + .5 * Math.sin((y + warp) * .55 + Math.sin(y * .21) * 2);
      v = Math.pow(v, 4) * .7 + (rnd() * .12) + Math.sin(x * .9 + phase[y]) * .015;
      const i = (y * W + x) * 4;
      for (let k = 0; k < 3; k++) d[i + k] = light[k] + (dark[k] - light[k]) * Math.min(1, v);
      d[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    // The side rails run the grain vertically.
    const v = document.createElement('canvas');
    v.width = H; v.height = W;
    const gv = v.getContext('2d');
    gv.translate(H, 0); gv.rotate(Math.PI / 2); gv.drawImage(c, 0, 0);
    return [c, v];
  }

  // Fine paper grain, the same warm speckle the cards, tags and stubs share.
  function grainTexture() {
    const S = 240, c = document.createElement('canvas');
    c.width = c.height = S;
    const g = c.getContext('2d'), rnd = rng(7), img = g.createImageData(S, S), d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      d[i] = 82; d[i + 1] = 61; d[i + 2] = 46;
      d[i + 3] = rnd() * rnd() * 34;
    }
    g.putImageData(img, 0, 0);
    return c;
  }

  // Textures are handed to CSS as short blob: URLs, never data: URLs. They
  // live in inherited custom properties, and a data: URL is hundreds of KB of
  // text that every element on the board carried through each style recalc:
  // the recalc at the start of every card flight took ~100ms because of it.
  function useTexture(el, prop, canvas, type, quality) {
    canvas.toBlob(blob => el.style.setProperty(prop, `url(${URL.createObjectURL(blob)})`), type, quality);
  }
  useTexture(track, '--grain', grainTexture(), 'image/png');
  useTexture(cork, '--cork-tex', corkTexture(), 'image/jpeg', .86);
  const [woodH, woodV] = woodTexture();
  useTexture(board, '--wood-h', woodH, 'image/jpeg', .9);
  useTexture(board, '--wood-v', woodV, 'image/jpeg', .9);

  // A ragged left edge where the notebook page left its spiral binding.
  const torn = cards.find(c => c.hasAttribute('data-torn'));
  if (torn) {
    const r = rng(3), pts = ['100% 0', '100% 100%'];
    for (let y = 100; y >= 0; y -= 2.5) pts.push(`${(3 + r() * 5.5).toFixed(1)}px ${y}%`);
    torn.style.setProperty('--clip', `polygon(${pts.join(',')})`);
  }

  /* ------------------------------------------------------------------
     Navigation tags, and the Listener's ticket stubs.
     ------------------------------------------------------------------ */
  const tags = cards.map((card, i) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tag';
    b.innerHTML = `<span>${String(i + 1).padStart(2, '0')}</span>${card.dataset.tag}<em class="pin pin--sm" aria-hidden="true"><i></i></em>`;
    b.addEventListener('click', () => jump(i));
    b.addEventListener('keydown', e => {
      const k = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (!k) return;
      e.preventDefault();
      const j = Math.max(0, Math.min(N - 1, i + k));
      jump(j);
      tags[j].focus({ preventScroll: true });
    });
    li.append(b);
    tagList.append(li);
    return b;
  });

  const STUB_COLOURS = ['#f9d3df', '#f6ecd2', '#d7ecdf', '#e3dcf3'];
  const STUB_TILT = [-2.5, 1.5, -1, 2.2, 1.2, -2, 2.6, -1.4, -1.8, 1, -2.4, 1.9];
  const spinImg = track.querySelector('.spin-img');
  const spinName = track.querySelector('.spin-name');
  const stubs = [...track.querySelectorAll('.stubs li')].map((li, i) => {
    const name = li.textContent.trim(), src = `assets/artists/${li.dataset.artist}.jpg`;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'stub';
    b.style.setProperty('--stub', STUB_COLOURS[i % STUB_COLOURS.length]);
    b.style.setProperty('--sr', STUB_TILT[i % STUB_TILT.length] + 'deg');
    b.setAttribute('aria-pressed', String(i === 0));
    b.innerHTML = `<img src="${src}" alt="" loading="lazy" decoding="async"><span><small>ADMIT ONE</small><b></b></span><i class="stub-no" aria-hidden="true">№${String(i + 1).padStart(2, '0')}</i>`;
    b.querySelector('b').textContent = name;
    b.addEventListener('click', () => {
      stubs.forEach(s => s.setAttribute('aria-pressed', String(s === b)));
      spinImg.src = src;
      spinName.textContent = name;
    });
    li.textContent = '';
    li.append(b);
    return b;
  });

  /* ------------------------------------------------------------------
     The stack. Depth 0 is the card in front; unpinned cards are tucked
     behind the pile, so the order is always a rotation of the list.
     ------------------------------------------------------------------ */
  const POSES = [
    { x: 0, y: 0, r: 0 },
    { x: -84, y: -38, r: -4.6 },
    { x: 92, y: -46, r: 4.2 },
    { x: -100, y: 34, r: 6.4 },
    { x: 104, y: 40, r: -5.6 },
  ];
  const JITTER = [.8, -1.1, 1.4, -.7, 1];
  const FLIGHT = 900, STAGGER = 110;
  let current = 0, target = 0, busy = false, flow = false;

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const depth = (i, active) => (i - active + N) % N;
  const pose = (i, active) => {
    const d = depth(i, active), p = POSES[d];
    return { x: p.x, y: p.y, r: d === 0 ? 0 : p.r + JITTER[i] };
  };
  const tf = (p, s = 1, lift = 0) => `translate(-50%, -50%) translate(${p.x}px, ${p.y}px) rotate(${p.r}deg) translateY(${lift}px) scale(${s})`;
  const pinOf = card => card.querySelector(':scope > .pin');

  function setPose(card, p) {
    card.style.setProperty('--card-x', p.x + 'px');
    card.style.setProperty('--card-y', p.y + 'px');
    card.style.setProperty('--card-r', p.r + 'deg');
  }

  // Only the front card is readable and focusable; the rest are scenery that
  // can be clicked to bring them forward.
  function markFront(active) {
    cards.forEach((card, i) => {
      const front = i === active;
      const paper = card.querySelector('.paper');
      if (!front && !flow && paper.contains(document.activeElement)) tags[active].focus({ preventScroll: true });
      card.classList.toggle('is-front', front);
      paper.inert = !front && !flow;
    });
    tags.forEach((t, i) => t.setAttribute('aria-current', String(i === active)));
  }

  function layout(active) {
    cards.forEach((card, i) => {
      setPose(card, pose(i, active));
      card.style.zIndex = N - depth(i, active);
    });
    markFront(active);
  }

  function leaveHole(card) {
    const a = pinOf(card).getBoundingClientRect(), b = cork.getBoundingClientRect();
    const x = a.left + a.width / 2 - b.left, y = a.top + a.height / 2 - b.top;
    if ([...holes.children].some(h => Math.hypot(h._x - x, h._y - y) < 4)) return;
    const h = document.createElement('span');
    h.className = 'hole'; h._x = x; h._y = y;
    h.style.left = x + 'px'; h.style.top = y + 'px';
    holes.append(h);
    if (holes.children.length > 40) holes.firstChild.remove();
  }

  function popPin(card, dur) {
    pinOf(card).animate([
      { transform: 'translate(-50%, -50%)', opacity: 1 },
      { transform: 'translate(-50%, -50%) translate(10px, -30px) rotate(24deg) scale(1.3)', opacity: 1, offset: .55 },
      { transform: 'translate(-50%, -50%) translate(16px, -44px) rotate(40deg) scale(1.3)', opacity: 0 },
    ], { duration: dur, easing: 'cubic-bezier(.3,.7,.4,1)', fill: 'forwards' });
  }

  function pressPin(card, dur) {
    return pinOf(card).animate([
      { transform: 'translate(-50%, -50%) translate(4px, -22px) scale(1.5)', opacity: 0 },
      { transform: 'translate(-50%, -50%) scale(.9)', opacity: 1, offset: .7 },
      { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
    ], { duration: dur, easing: 'cubic-bezier(.3,.7,.4,1)' }).finished;
  }

  // Pull the pin, lift the card, swing it out past the pile, and drop it
  // behind (or pull it from behind and bring it to the front). zStart holds it
  // above or below the pile until the top of its swing, where it takes zLand.
  async function fly(card, from, to, { delay, order, zStart, zLand }) {
    const w = parseFloat(getComputedStyle(card).getPropertyValue('--w'));
    const side = { x: from.x + w * .56 + 30 + order * 18, y: Math.min(from.y, to.y) - 34 - order * 22, r: 9 - order * 2.5 };
    card.style.zIndex = zStart;
    if (delay) await sleep(delay);
    card.classList.add('is-flying', 'is-lifted');
    popPin(card, FLIGHT * .3);
    leaveHole(card);
    setPose(card, to);
    const anim = card.animate([
      { transform: tf(from), offset: 0 },
      { transform: tf(from, 1.025, -10), offset: .2 },
      { transform: tf(side, 1.035), offset: .5 },
      { transform: tf(to, 1.01, -4), offset: .86 },
      { transform: tf(to), offset: 1 },
    ], { duration: FLIGHT, easing: 'cubic-bezier(.45,.05,.3,1)' });
    setTimeout(() => { card.style.zIndex = zLand; }, FLIGHT * .5);
    await anim.finished;
    card.classList.remove('is-flying', 'is-lifted');
    pinOf(card).getAnimations().forEach(a => a.cancel());
    await pressPin(card, 300);
  }

  // Every card between here and the destination flies at once, each at full
  // speed and a beat apart, so 1 → 5 takes about as long as 1 → 2.
  async function transition(to) {
    const from = current, forward = to > from;
    const moving = [];
    for (let i = Math.min(from, to); i < Math.max(from, to); i++) moving.push(i);
    const k = moving.length;
    cards.forEach((card, i) => {
      if (moving.includes(i)) return;
      setPose(card, pose(i, to));
      card.style.zIndex = N - depth(i, to);
    });
    markFront(to);
    announcer.textContent = `Now showing: ${cards[to].dataset.tag}`;
    await Promise.all(moving.map(i => {
      // Forward, the front card leaves first. Backward, the card that lands
      // deepest is pulled first, so the new front card arrives last, on top.
      // Nothing ever ties on z-index: a tie falls back to DOM order.
      const order = forward ? i - from : from - 1 - i;
      return fly(cards[i], pose(i, from), pose(i, to), {
        delay: order * STAGGER,
        order,
        zStart: forward ? N + 1 + k - order : -depth(i, from),
        zLand: N - depth(i, to),
      });
    }));
    current = to;
  }

  async function run() {
    if (busy || flow) return;
    busy = true;
    // A target set mid-flight (scrolling back, another tag) is picked up as
    // soon as the current flight lands.
    while (current !== target) await transition(target);
    busy = false;
  }

  // Tags and peeking cards move the scroll position to that card's beat, so
  // scrolling on from there carries on from the card you picked.
  function jump(i) {
    if (flow) {
      cards[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    target = i;
    const top = track.getBoundingClientRect().top + scrollY;
    scrollTo({ top: top + (track.offsetHeight - innerHeight) * ((i + .5) / BEATS), behavior: 'instant' });
    run();
  }

  function render(progress) {
    if (flow) return;
    const idx = Math.min(N - 1, Math.floor(progress * BEATS));
    if (idx !== target) {
      target = idx;
      run();
    }
  }

  /* ------------------------------------------------------------------
     Fit and mode switching.
     ------------------------------------------------------------------ */
  function fit() {
    if (flow) {
      const avail = cork.clientWidth - 24;
      cards.forEach(c => {
        c.style.zoom = REFLOW_QUERY.matches ? '' : Math.min(1, avail / parseFloat(getComputedStyle(c).getPropertyValue('--w')));
      });
      return;
    }
    cards.forEach(c => { c.style.zoom = ''; });
    stack.style.setProperty('--fit', Math.min(1.08, (area.clientWidth - 30) / 950, (area.clientHeight - 30) / 730).toFixed(3));
  }

  function setMode() {
    flow = FLOW_QUERY.matches;
    board.classList.toggle('is-flow', flow);
    track.classList.toggle('is-flow-track', flow);
    stack.classList.add('no-anim');
    if (flow) {
      cards.forEach(c => {
        c.style.zIndex = '';
        ['--card-x', '--card-y', '--card-r'].forEach(v => c.style.removeProperty(v));
      });
      markFront(-1);
    } else {
      layout(current);
    }
    fit();
    requestAnimationFrame(() => requestAnimationFrame(() => stack.classList.remove('no-anim')));
  }

  cards.forEach((card, i) => card.addEventListener('click', () => {
    if (!flow && i !== current) jump(i);
  }));
  FLOW_QUERY.addEventListener('change', () => {
    setMode();
    // The track's height just changed, possibly after the scroll engine
    // measured it for this resize; have it measure again.
    window.dispatchEvent(new Event('resize'));
  });
  REFLOW_QUERY.addEventListener('change', fit);
  new ResizeObserver(fit).observe(area);
  window.renderSenses = render;
  setMode();
})();
