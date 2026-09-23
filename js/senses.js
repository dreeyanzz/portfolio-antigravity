/** The Listening Room: native DOM scenery and scroll-driven camera movement. */
(() => {
  'use strict';
  const track = document.getElementById('curiosities');
  if (!track) return;
  const grid = track.querySelector('.cabinet-bento');
  const cards = [...grid.children];
  const stage = track.querySelector('.curiosities-stage-container');
  const staticView = matchMedia('(max-width: 700px), (max-height: 560px), (prefers-reduced-motion: reduce)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const viewport = document.createElement('div');
  viewport.className = 'senses-viewport';
  grid.before(viewport);
  viewport.append(grid);
  const scenery = document.createElement('div');
  scenery.className = 'room-scenery';
  scenery.setAttribute('aria-hidden', 'true');
  scenery.innerHTML = '<div class="room-wall"></div><div class="room-window"><i></i><i></i><i></i></div><div class="room-floor"></div><div class="room-rug"></div><div class="room-shelf"></div><div class="room-desk"></div><div class="room-lamp"><i></i></div><span class="room-inscription">MAKE THINGS.<br>FEEL THINGS.</span><span class="room-doorplate">ADRIAN’S ROOM / 04</span>';
  grid.prepend(scenery);
  const stops = ['The whole room', 'Small worlds', 'On the workbench', 'Through the lens', 'Paper & pencil', 'The Listener'];
  const notes = ['01 / A WORLD WITHIN A WORLD', '02 / IDEAS WITH WIRES', '03 / TEACHING MACHINES TO SEE', '04 / THINKING BY HAND', '05 / ALWAYS IN ROTATION'];
  const nav = document.createElement('nav');
  nav.className = 'senses-nav';
  nav.setAttribute('aria-label', 'Around the listening room');
  const navLabel = document.createElement('span');
  navLabel.className = 'room-nav-label';
  navLabel.textContent = 'AROUND THE ROOM';
  nav.append(navLabel);
  stage.append(nav);
  const buttons = stops.map((label, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.innerHTML = `<span class="room-stop-number" aria-hidden="true">${index === 0 ? '⌂' : String(index).padStart(2, '0')}</span><span>${label}</span>`;
    button.addEventListener('click', () => navigate(index - 1));
    nav.append(button);
    return button;
  });

  // The original artist list remains the single source for both record collections.
  function makeRecords(card) {
    const rail = card.querySelector('.artist-rail');
    if (!rail) return;
    const player = document.createElement('div');
    player.className = 'room-record-player';
    player.innerHTML = '<div class="record-plinth"><div class="record-disc" aria-hidden="true"><span>AST<br>33⅓</span></div><div class="record-arm" aria-hidden="true"></div><img class="record-sleeve" alt=""><span class="record-speed" aria-hidden="true">SIDE A · PERSONAL ROTATION</span></div><p class="record-kicker">ON THE SLEEVE</p><p class="record-selection" aria-live="polite"></p><p class="record-instruction">Pick a sleeve. Get to know the rotation.</p>';
    rail.before(player);
    const items = [...rail.querySelectorAll('li')];
    items.forEach((item, index) => {
      item.style.setProperty('--record-order', index);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'record-choice';
      button.setAttribute('aria-label', `Feature ${item.textContent.trim()}`);
      while (item.firstChild) button.append(item.firstChild);
      item.append(button);
      button.addEventListener('click', () => select(index));
    });
    function select(index) {
      items.forEach((item, i) => item.querySelector('button').setAttribute('aria-pressed', String(i === index)));
      const sleeve = player.querySelector('.record-sleeve');
      sleeve.src = items[index].querySelector('img').getAttribute('src');
      sleeve.alt = items[index].textContent.trim();
      player.querySelector('.record-selection').textContent = sleeve.alt;
      if (!reducedMotion.matches) {
        sleeve.getAnimations().forEach(animation => animation.cancel());
        sleeve.animate([
          { opacity: 0.3, transform: 'translateY(12px) rotate(-4deg)' },
          { opacity: 1, transform: 'translateY(0) rotate(-9deg)' }
        ], { duration: 320, easing: 'cubic-bezier(.22,1,.36,1)' });
      }
    }
    select(0);
  }

  const panels = cards.map((card, index) => {
    card.id = `senses-card-${index}`;
    const title = card.querySelector('h3').textContent;
    const panel = card.cloneNode(true);
    panel.id = `senses-detail-${index}`;
    panel.classList.remove('cabinet-card', 'bento-tile');
    panel.classList.add('senses-detail');
    panel.hidden = true;
    panel.inert = true;
    panel.setAttribute('aria-label', title);
    const note = document.createElement('p');
    note.className = 'room-exhibit-note';
    note.textContent = notes[index];
    panel.prepend(note);
    viewport.append(panel);
    makeRecords(panel);
    makeRecords(card);
    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'senses-open';
    open.innerHTML = `<span>${stops[index + 1]}</span><span aria-hidden="true">↗</span>`;
    open.setAttribute('aria-label', `Explore ${title}`);
    open.setAttribute('aria-controls', panel.id);
    open.addEventListener('click', () => navigate(index));
    card.append(open);
    return panel;
  });
  const hint = document.createElement('p');
  hint.className = 'room-scroll-hint';
  hint.innerHTML = '<span aria-hidden="true">↓</span> Scroll to wander. Select an object to take a closer look.';
  viewport.append(hint);
  let geometry = [];
  let active = -2;
  let lastProgress = 0;
  const clamp = value => Math.max(0, Math.min(1, value));
  const ease = value => { const t = clamp(value); return t * t * (3 - 2 * t); };

  function navigate(index) {
    if (staticView.matches) {
      (cards[index] || grid).scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
      return;
    }
    const progress = index < 0 ? 0.025 : 0.12 + index * 0.17 + 0.075;
    const top = track.getBoundingClientRect().top + scrollY;
    window.scrollTo({ top: top + progress * (track.offsetHeight - innerHeight), behavior: 'instant' });
  }
  function measure() {
    geometry = cards.map(card => ({ x: card.offsetLeft + card.offsetWidth / 2, y: card.offsetTop + card.offsetHeight / 2 }));
    render(lastProgress);
  }
  function render(progress) {
    lastProgress = progress;
    const beat = (progress - 0.12) / 0.17;
    const index = !staticView.matches && beat >= 0 && beat < cards.length ? Math.floor(beat) : -1;
    const local = beat - Math.floor(beat);
    const zoom = index < 0 ? 0 : ease(local / 0.25) * (1 - ease((local - 0.84) / 0.16));
    if (active !== index) {
      if (panels.some(panel => panel.contains(document.activeElement))) buttons[index + 1].focus({ preventScroll: true });
      active = index;
      panels.forEach((panel, i) => {
        panel.hidden = i !== index;
        panel.inert = i !== index;
        if (i !== index) panel.scrollTop = 0;
      });
      buttons.forEach((button, i) => {
        if (i === index + 1) button.setAttribute('aria-current', 'step');
        else button.removeAttribute('aria-current');
      });
    }
    const expanded = index >= 0;
    if (expanded && grid.contains(document.activeElement)) buttons[index + 1].focus({ preventScroll: true });
    grid.inert = expanded;
    grid.setAttribute('aria-hidden', String(expanded));
    grid.style.opacity = String(1 - zoom * 0.96);
    grid.style.transform = `scale(${1 + zoom * 0.3})`;
    hint.style.opacity = String(1 - zoom);
    hint.setAttribute('aria-hidden', String(expanded));
    if (expanded && geometry[index]) {
      const point = geometry[index];
      grid.style.transformOrigin = `${point.x}px ${point.y}px`;
      const panel = panels[index];
      panel.style.transform = `translate(${(point.x - viewport.clientWidth / 2) * (1 - zoom) * 0.3}px, ${(1 - zoom) * 35}px) scale(${0.86 + zoom * 0.14})`;
      panel.style.opacity = String(ease((zoom - 0.15) / 0.85));
      panel.style.setProperty('--room-arrival', zoom);
    }
  }
  track.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !staticView.matches && active >= 0) {
      navigate(-1);
      buttons[0].focus({ preventScroll: true });
    }
  });
  window.renderSenses = render;
  staticView.addEventListener('change', measure);
  new ResizeObserver(measure).observe(viewport);
  track.classList.add('listening-room-ready');
  measure();
})();
