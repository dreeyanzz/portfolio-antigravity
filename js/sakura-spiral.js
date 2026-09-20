/** Scroll-driven camera, procedural sakura and DOM cards share one 3D projection. */
(function () {
  'use strict';
  const section = document.getElementById('showcase');
  const host = document.getElementById('sakuraSpiral');
  const canvas = document.getElementById('sakuraTree');
  const cards = [...document.querySelectorAll('#projectDeck .project-card')];
  if (!host || !canvas || !cards.length) return;
  const ctx = canvas.getContext('2d');
  const status = document.getElementById('creationStatusText');
  const stops = document.getElementById('spiralStops');
  const prev = document.getElementById('spiralPrev');
  const next = document.getElementById('spiralNext');
  const staticQuery = matchMedia('(prefers-reduced-motion: reduce), (max-height: 540px)');
  const STEP_ANGLE = Math.PI * .72;
  const STEP_HEIGHT = 260;
  const RADIUS = 590;
  const DISTANCE = 1500;
  const FOCAL = 910;
  const bottom = (cards.length - 1) * STEP_HEIGHT + 420;
  const branches = [];
  const blooms = [];
  const cloudSprites = [];
  // Rasterize the five-petal blossoms once; scrolling only composites sprites.
  const blossomSprites = ['#e49bb5', '#efb1c8', '#f6c4d6', '#ffdeea', '#fff0f5'].map(color => {
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 48;
    const paint = sprite.getContext('2d');
    if (!paint) return sprite;
    paint.translate(24, 24);
    paint.fillStyle = color;
    for (let petal = 0; petal < 5; petal++) {
      paint.rotate(Math.PI * 2 / 5);
      paint.beginPath(); paint.ellipse(0, -10, 8, 12, 0, 0, Math.PI * 2); paint.fill();
    }
    paint.fillStyle = '#d8799a';
    paint.beginPath(); paint.arc(0, 0, 3, 0, Math.PI * 2); paint.fill();
    return sprite;
  });
  let width = 0, height = 0, zoom = 1, active = -1, lastProgress = -1;
  let seed = 709;
  // Seeded geometry stays fixed while the camera moves, including after resize.
  const random = () => ((seed = Math.imul(seed, 1664525) + 1013904223 >>> 0) / 4294967296);
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const ease = t => t * t * (3 - 2 * t);
  const trunk = y => ({ x: Math.sin(y * .003) * 42, y, z: Math.cos(y * .0025) * 32 });

  function branch(a, b, thickness) { branches.push({ a, b, thickness }); }
  for (let y = -330; y < bottom; y += 45) {
    branch(trunk(y), trunk(Math.min(y + 45, bottom)), 9 + (y + 330) / (bottom + 330) * 39);
  }
  function blossomCloud(center, spread, count) {
    // Cache small flowering boughs, rather than repaint thousands of petals per frame.
    if (cloudSprites.length < 8) {
      const sprite = document.createElement('canvas');
      sprite.width = 256; sprite.height = 160;
      const paint = sprite.getContext('2d');
      if (paint) {
        for (let n = 0; n < count; n++) {
          const angle = random() * Math.PI * 2;
          const radius = Math.sqrt(random());
          const x = 128 + Math.cos(angle) * radius * 110;
          const y = 80 + Math.sin(angle) * radius * 58;
          const size = 11 + random() * 18;
          paint.drawImage(blossomSprites[Math.floor(random() * 5)], x - size / 2, y - size / 2, size, size);
        }
      }
      cloudSprites.push(sprite);
    }
    blooms.push({ ...center, spread, sprite: cloudSprites[Math.floor(random() * cloudSprites.length)] });
  }
  // Radial limbs with forked ends make the changing silhouette reveal the orbit.
  for (let tier = 0; tier < cards.length + 2; tier++) {
    const y = -190 + tier * 255;
    const limbs = tier < 3 ? 7 : 5;
    for (let j = 0; j < limbs; j++) {
      const angle = j / limbs * Math.PI * 2 + tier * 1.7;
      const reach = (tier < 3 ? 400 : 300) + random() * 100;
      const base = trunk(y + 110);
      const elbow = { x: base.x + Math.cos(angle) * reach * .52, y: y - 15, z: base.z + Math.sin(angle) * reach * .52 };
      const tip = { x: base.x + Math.cos(angle + .15) * reach, y: y - 140 - random() * 60, z: base.z + Math.sin(angle + .15) * reach };
      branch(base, elbow, 12 + random() * 5);
      branch(elbow, tip, 6);
      for (let fork = 0; fork < 3; fork++) {
        const end = { x: tip.x + Math.cos(angle + fork - 1) * 85, y: tip.y - random() * 85, z: tip.z + Math.sin(angle + fork - 1) * 85 };
        branch(elbow, end, 2.5);
        blossomCloud(end, 92, 45);
      }
      blossomCloud(tip, 95, 60);
    }
  }
  for (let j = 0; j < 9; j++) {
    const angle = j / 9 * Math.PI * 2;
    branch(trunk(bottom - 70), { x: Math.cos(angle) * 220, y: bottom + 15, z: Math.sin(angle) * 220 }, 19);
  }

  const buttons = cards.map((card, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'spiral-stop';
    button.setAttribute('aria-label', `Show ${card.querySelector('h3').textContent}`);
    card.id = `spiral-project-${i}`;
    button.setAttribute('aria-controls', card.id);
    button.addEventListener('click', () => navigate(i));
    stops.appendChild(button);
    return button;
  });
  section.style.setProperty('--spiral-track-height', `${(cards.length + 1) * 90}vh`);

  function navigate(index) {
    index = clamp(index, 0, cards.length - 1);
    const top = section.getBoundingClientRect().top + window.scrollY;
    // The half-step lands in the middle of the project's reading pause.
    window.scrollTo({ top: top + ((index + .5) / cards.length) * (section.offsetHeight - innerHeight), behavior: 'smooth' });
  }
  prev.addEventListener('click', () => navigate(active - 1));
  next.addEventListener('click', () => navigate(active + 1));
  stops.addEventListener('keydown', event => {
    const index = buttons.indexOf(document.activeElement);
    if (index < 0) return;
    const targets = { ArrowRight: index + 1, ArrowDown: index + 1, ArrowLeft: index - 1, ArrowUp: index - 1, Home: 0, End: cards.length - 1 };
    if (!(event.key in targets)) return;
    event.preventDefault();
    const target = clamp(targets[event.key], 0, cards.length - 1);
    buttons[target].focus({ preventScroll: true });
    navigate(target);
  });

  function resize() {
    width = host.clientWidth;
    height = host.clientHeight;
    zoom = Math.min(width / (width <= 768 ? 680 : 1180), height / 780, 1.15);
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    lastProgress = -1;
    render(0);
  }

  function render(progress) {
    if (staticQuery.matches) {
      cards.forEach(card => { card.inert = false; card.removeAttribute('aria-hidden'); });
      return;
    }
    if (progress === lastProgress) return;
    lastProgress = progress;
    const travel = clamp(progress * cards.length - .5, 0, cards.length - 1);
    const step = Math.floor(travel);
    // Hold each project at the exact center, then smoothly fly to the next.
    const position = step + ease(clamp((travel - step - .22) / .56));
    const cameraAngle = position * STEP_ANGLE;
    const cameraY = position * STEP_HEIGHT;
    const sine = Math.sin(cameraAngle), cosine = Math.cos(cameraAngle);
    const current = Math.round(position);
    function project(point) {
      const x = point.x * cosine - point.z * sine;
      const z = point.x * sine + point.z * cosine;
      const scale = FOCAL / (DISTANCE - z);
      return { x: width / 2 + x * scale * zoom, y: height / 2 + (point.y - cameraY) * scale * zoom, z, scale };
    }

    if (ctx) {
      ctx.clearRect(0, 0, width, height);
      // The continuous helix makes the connection between the separate projects visible.
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(172, 84, 119, .23)';
      ctx.beginPath();
      const samples = (cards.length - 1) * 70;
      for (let k = 0; k <= samples; k++) {
        const t = samples ? k / samples * (cards.length - 1) : 0;
        const p = project({ x: Math.sin(t * STEP_ANGLE) * RADIUS, y: t * STEP_HEIGHT, z: Math.cos(t * STEP_ANGLE) * RADIUS });
        if (k === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
      branches.map(b => ({ ...b, a: project(b.a), b: project(b.b) }))
        .sort((a, b) => a.a.z - b.a.z).forEach(b => {
          if (Math.max(b.a.y, b.b.y) < -30 || Math.min(b.a.y, b.b.y) > height + 30) return;
          ctx.lineCap = 'round';
          ctx.lineWidth = Math.max(.7, b.thickness * b.a.scale * zoom);
          ctx.strokeStyle = '#815a65';
          ctx.beginPath(); ctx.moveTo(b.a.x, b.a.y); ctx.lineTo(b.b.x, b.b.y); ctx.stroke();
          ctx.lineWidth *= .28;
          ctx.strokeStyle = '#b08787';
          ctx.stroke();
        });
      ctx.globalAlpha = .88;
      blooms.map(b => ({ b, p: project(b) })).filter(({ p }) => p.y > -160 && p.y < height + 160 && p.x > -160 && p.x < width + 160)
        .sort((a, b) => a.p.z - b.p.z).forEach(({ b, p }) => {
          const r = b.spread * p.scale * zoom;
          ctx.drawImage(b.sprite, p.x - r, p.y - r * .625, r * 2, r * 1.25);
        });
      ctx.globalAlpha = 1;
    }

    cards.forEach((card, i) => {
      const a = i * STEP_ANGLE;
      const p = project({ x: Math.sin(a) * RADIUS, y: i * STEP_HEIGHT, z: Math.cos(a) * RADIUS });
      const distance = Math.abs(i - position);
      const visible = distance < 2.6;
      const scale = p.scale;
      card.style.transform = `translate(-50%, -50%) translate3d(${(p.x - width / 2).toFixed(2)}px, ${(p.y - height / 2).toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
      card.style.opacity = visible ? (i === current ? 1 : Math.max(.2, .58 - distance * .12)).toFixed(3) : '0';
      card.style.visibility = visible ? 'visible' : 'hidden';
      card.style.zIndex = p.z > 80 ? String(10 + Math.round(p.z / 50)) : '2';
    });
    if (current !== active) {
      const focusInCard = cards.some(card => card.contains(document.activeElement));
      // Move focus before making its previous card inert; modal focus is unaffected.
      if (focusInCard) buttons[current].focus({ preventScroll: true });
      active = current;
      cards.forEach((card, i) => {
        card.classList.toggle('is-active-project', i === active);
        card.inert = i !== active;
        card.setAttribute('aria-hidden', String(i !== active));
        buttons[i].setAttribute('aria-current', String(i === active));
      });
      status.textContent = (window.PROJECT_DECK_LABELS || [])[active] || '';
      prev.disabled = active === 0;
      next.disabled = active === cards.length - 1;
    }
  }
  window.SakuraSpiral = { render };
  window.addEventListener('resize', resize, { passive: true });
  staticQuery.addEventListener('change', () => { active = -1; resize(); window.dispatchEvent(new Event('scroll')); });
  resize();
})();
