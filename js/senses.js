/** Bento overview → full-size curiosities, driven by the chapter scroll. */
(() => {
  'use strict';
  const track = document.getElementById('curiosities');
  if (!track) return;
  const grid = track.querySelector('.cabinet-bento');
  const cards = [...grid.children];
  const stage = track.querySelector('.curiosities-stage-container');
  const staticView = matchMedia('(max-width: 700px), (max-height: 560px), (prefers-reduced-motion: reduce)');
  const viewport = document.createElement('div');
  viewport.className = 'senses-viewport';
  grid.before(viewport);
  viewport.append(grid);
  const nav = document.createElement('nav');
  nav.className = 'senses-nav';
  nav.setAttribute('aria-label', 'Explore the curiosity cabinet');
  stage.append(nav);
  const labels = ['All curiosities', ...cards.map(card => card.querySelector('h3').textContent)];
  const buttons = labels.map((label, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', () => navigate(index - 1));
    nav.append(button);
    return button;
  });
  const panels = cards.map((card, index) => {
    card.querySelector('.bento-index').textContent = String(index + 1).padStart(2, '0');
    card.id = `senses-card-${index}`;
    const panel = card.cloneNode(true);
    panel.id = `senses-detail-${index}`;
    panel.classList.remove('cabinet-card', 'bento-tile');
    panel.classList.add('senses-detail');
    panel.hidden = true;
    panel.inert = true;
    panel.setAttribute('aria-label', labels[index + 1]);
    viewport.append(panel);
    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'senses-open';
    open.innerHTML = '<span>Explore</span><span aria-hidden="true">↗</span>';
    open.setAttribute('aria-label', `Explore ${labels[index + 1]}`);
    open.setAttribute('aria-controls', panel.id);
    open.addEventListener('click', () => navigate(index));
    card.append(open);
    return panel;
  });
  let geometry = [];
  let active = -2;
  let lastProgress = 0;
  const clamp = value => Math.max(0, Math.min(1, value));
  const ease = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
  function navigate(index) {
    if (staticView.matches) {
      (cards[index] || grid).scrollIntoView({ behavior: 'instant', block: 'start' });
      return;
    }
    // Land after the expansion, in the reading portion of each beat.
    const progress = index < 0 ? 0.025 : 0.12 + index * 0.17 + 0.075;
    const top = track.getBoundingClientRect().top + scrollY;
    window.scrollTo({ top: top + progress * (track.offsetHeight - innerHeight), behavior: 'instant' });
  }
  function measure() {
    geometry = cards.map(card => ({
      x: card.offsetLeft, y: card.offsetTop,
      sx: card.offsetWidth / viewport.clientWidth,
      sy: card.offsetHeight / viewport.clientHeight
    }));
    render(lastProgress);
  }
  function render(progress) {
    lastProgress = progress;
    // Open from the source cell, hold for reading, then return to the grid.
    const beat = (progress - 0.12) / 0.17;
    const index = !staticView.matches && beat >= 0 && beat < cards.length ? Math.floor(beat) : -1;
    const local = beat - Math.floor(beat);
    const zoom = index < 0 ? 0 : ease(local / 0.22) * (1 - ease((local - 0.82) / 0.18));
    if (active !== index) {
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
    grid.style.opacity = String(1 - zoom * 0.88);
    if (expanded && geometry[index]) {
      const rect = geometry[index];
      const panel = panels[index];
      panel.style.transform = `translate(${rect.x * (1 - zoom)}px, ${rect.y * (1 - zoom)}px) scale(${rect.sx + (1 - rect.sx) * zoom}, ${rect.sy + (1 - rect.sy) * zoom})`;
      panel.style.opacity = String(clamp(zoom * 5));
    }
  }
  window.renderSenses = render;
  staticView.addEventListener('change', measure);
  new ResizeObserver(measure).observe(viewport);
  measure();
})();
