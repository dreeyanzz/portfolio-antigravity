/**
 * ADRIAN SETH TABOTABO — PROJECT DECK RENDERER
 * Builds the showcase cards from PORTFOLIO_DATA.flagships.
 *
 * Runs before scrollytelling.js and interactions.js so the cards exist in the
 * DOM by the time those scripts query for them and bind their handlers.
 *
 * Each card is an artwork band above an opaque panel of copy. When a project
 * has no page-one frame on disk yet the band falls back to a gradient derived
 * from the project id — deterministic, so a given project always gets the
 * same artwork.
 *
 * The card deliberately does not print `desc`: the panel is a fixed height and
 * the deep dive already carries the full blurb.
 */

(function () {
  'use strict';

  const deck = document.getElementById('projectDeck');
  const data = window.PORTFOLIO_DATA;
  if (!deck || !data || !Array.isArray(data.flagships)) return;

  const projects = data.flagships;

  const SVG_NS = 'http://www.w3.org/2000/svg';

  // FNV-1a. Any stable string hash works here; this one is short and has a
  // good enough avalanche that neighbouring ids do not land on similar hues.
  function hashId(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return Math.abs(h);
  }

  // Fallback artwork, kept inside the site's rose/orchid band so a card
  // without a frame still belongs to the palette. Stays light throughout —
  // the band sits above the copy now rather than behind it, so there is
  // nothing to darken for.
  function gradientFor(id) {
    const h = hashId(id);
    const hue = 324 + (h % 5) * 8;
    const angle = 150 + (h % 4) * 12;
    return (
      `linear-gradient(${angle}deg, ` +
      `hsl(${hue}, 92%, 96%) 0%, ` +
      `hsl(${hue - 4}, 80%, 89%) 52%, ` +
      `hsl(${hue - 14}, 64%, 80%) 100%)`
    );
  }

  function externalLinkIcon() {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('width', '14');
    svg.setAttribute('height', '14');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');

    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6');
    const poly = document.createElementNS(SVG_NS, 'polyline');
    poly.setAttribute('points', '15 3 21 3 21 9');
    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', '10');
    line.setAttribute('y1', '14');
    line.setAttribute('x2', '21');
    line.setAttribute('y2', '3');

    svg.appendChild(path);
    svg.appendChild(poly);
    svg.appendChild(line);
    return svg;
  }

  // Five notched Somei-Yoshino petals around a small core — the same blossom
  // the canvas tree paints, reduced to a flat emblem for the card reverse.
  function sakuraMark() {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '-34 -34 68 68');
    svg.setAttribute('class', 'project-card-back-mark');
    svg.setAttribute('aria-hidden', 'true');

    for (let i = 0; i < 5; i++) {
      const petal = document.createElementNS(SVG_NS, 'path');
      petal.setAttribute('d', 'M0 0 C 8 -8 12 -19 2.6 -24 L 0 -28 L -2.6 -24 C -12 -19 -8 -8 0 0 Z');
      petal.setAttribute('transform', `rotate(${i * 72})`);
      petal.setAttribute('class', 'project-card-back-petal');
      svg.appendChild(petal);
    }

    const core = document.createElementNS(SVG_NS, 'circle');
    core.setAttribute('r', '4.2');
    core.setAttribute('class', 'project-card-back-core');
    svg.appendChild(core);

    return svg;
  }

  // The reverse of the panel. Purely decorative: it repeats the front's
  // identifying copy so a card turned away from the camera still reads as that
  // project, and it is hidden from assistive tech because the front already
  // carries the real content.
  function cardBack(index, title, subtitle) {
    const back = el('div', 'project-card-back');
    back.setAttribute('aria-hidden', 'true');

    back.appendChild(el('span', 'project-card-back-index', index));
    back.appendChild(sakuraMark());
    back.appendChild(el('span', 'project-card-back-title', title));
    if (subtitle) back.appendChild(el('span', 'project-card-back-subtitle', subtitle));

    return back;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  const total = String(projects.length).padStart(2, '0');

  // Deferred artwork loads, drained by loadArtwork() at the bottom of the
  // file. Each card paints its gradient immediately, so the deck is complete
  // and readable whether or not the frames have arrived.
  const artworkQueue = [];

  projects.forEach((project, idx) => {
    const card = el('article', 'project-card');
    card.dataset.projectIdx = String(idx);
    card.dataset.projectId = project.id;
    // Painted back to front: card 0 sits on top of the stack.
    card.style.zIndex = String(projects.length - idx);

    // --- Media plane -------------------------------------------------------
    const media = el('div', 'project-card-media');
    media.setAttribute('aria-hidden', 'true');
    // Seed with the gradient so there is never a blank frame, then swap in
    // the screenshot only once it has actually decoded.
    media.style.backgroundImage = gradientFor(project.id);

    if (project.image) {
      // Queued rather than fetched: the showcase is four chapters down, and
      // the seven frames together are over a megabyte. loadArtwork() below
      // releases the queue once the section is within reach.
      artworkQueue.push(() => {
        const probe = new Image();
        probe.onload = () => {
          media.style.backgroundImage = `url("${project.image}")`;
        };
        // No onerror handling needed beyond leaving the gradient in place.
        probe.src = project.image;
      });
    }

    // --- Copy --------------------------------------------------------------
    const body = el('div', 'project-card-body');

    const meta = el('div', 'project-card-meta');
    meta.appendChild(el('span', 'project-card-index', `${String(idx + 1).padStart(2, '0')} / ${total}`));
    if (project.category) {
      meta.appendChild(el('span', 'project-card-category', project.category));
    }
    body.appendChild(meta);

    body.appendChild(el('h3', 'project-card-title', project.title));
    if (project.tagline) {
      body.appendChild(el('p', 'project-card-tagline', project.tagline));
    }

    if (Array.isArray(project.stack) && project.stack.length) {
      const stack = el('div', 'project-card-stack');
      // Capped at three so the row stays on one line and cannot push the
      // actions out of the panel.
      project.stack.slice(0, 3).forEach((tech) => {
        stack.appendChild(el('span', 'tag-pill', tech));
      });
      if (project.stack.length > 3) {
        stack.appendChild(el('span', 'tag-pill is-overflow', `+${project.stack.length - 3}`));
      }
      body.appendChild(stack);
    }

    const actions = el('div', 'project-card-actions');

    const deepDive = el('button', 'btn btn-primary');
    deepDive.type = 'button';
    deepDive.setAttribute('data-deep-dive', project.id);
    deepDive.appendChild(el('span', null, 'Deep Dive'));
    actions.appendChild(deepDive);

    if (project.githubUrl) {
      const gh = el('a', 'btn btn-secondary');
      gh.href = project.githubUrl;
      gh.target = '_blank';
      gh.rel = 'noopener noreferrer';
      gh.appendChild(el('span', null, 'GitHub'));
      gh.appendChild(externalLinkIcon());
      actions.appendChild(gh);
    }

    if (project.liveUrl) {
      const live = el('a', 'btn btn-secondary');
      live.href = project.liveUrl;
      live.target = '_blank';
      live.rel = 'noopener noreferrer';
      live.appendChild(el('span', null, 'Live'));
      live.appendChild(externalLinkIcon());
      actions.appendChild(live);
    }

    body.appendChild(actions);

    card.appendChild(media);
    card.appendChild(body);
    card.appendChild(
      cardBack(`${String(idx + 1).padStart(2, '0')} / ${total}`, project.title, project.category)
    );
    deck.appendChild(card);
  });

  const labels = projects.map(
    (p, i) => `Project ${String(i + 1).padStart(2, '0')} / ${total}: ${p.title}`
  );

  // --- Archive card ---------------------------------------------------------
  // Final card in the deck: the smaller builds that did not earn a card of
  // their own. Anything already promoted to a flagship is filtered out by
  // repo URL, so an entry appearing in both lists cannot show up twice.
  const promotedRepos = new Set(
    projects.map((p) => (p.githubUrl || '').toLowerCase()).filter(Boolean)
  );
  const archive = Array.isArray(data.labArchive)
    ? data.labArchive.filter((item) => !promotedRepos.has((item.githubUrl || '').toLowerCase()))
    : [];

  if (archive.length) {
    const card = el('article', 'project-card project-card-archive');
    card.dataset.projectIdx = String(projects.length);
    card.dataset.projectId = 'archive';
    card.style.zIndex = '0';

    const media = el('div', 'project-card-media');
    media.setAttribute('aria-hidden', 'true');
    media.style.backgroundImage = gradientFor('the-engineering-archive');

    const body = el('div', 'project-card-body');

    const meta = el('div', 'project-card-meta');
    meta.appendChild(el('span', 'project-card-index', 'ARCHIVE'));
    meta.appendChild(el('span', 'project-card-category', `${archive.length} more builds`));
    body.appendChild(meta);

    body.appendChild(el('h3', 'project-card-title', 'The Engineering Archive'));
    body.appendChild(
      el('p', 'project-card-tagline', 'Smaller builds, coursework and browser tools')
    );

    const grid = el('div', 'archive-grid');
    archive.forEach((item) => {
      // Each tile is the link itself, so the whole tile is a hit target
      // rather than just a word inside it.
      const tile = item.githubUrl ? el('a', 'archive-item') : el('div', 'archive-item');
      if (item.githubUrl) {
        tile.href = item.githubUrl;
        tile.target = '_blank';
        tile.rel = 'noopener noreferrer';
      }
      tile.appendChild(el('span', 'archive-item-title', item.title));
      if (item.desc) {
        tile.appendChild(el('span', 'archive-item-desc', item.desc));
      }
      grid.appendChild(tile);
    });
    body.appendChild(grid);

    const actions = el('div', 'project-card-actions');
    const profile = el('a', 'btn btn-secondary');
    profile.href = (data.profile && data.profile.githubUrl) || 'https://github.com/dreeyanzz';
    profile.target = '_blank';
    profile.rel = 'noopener noreferrer';
    profile.appendChild(el('span', null, 'All repositories'));
    profile.appendChild(externalLinkIcon());
    actions.appendChild(profile);
    body.appendChild(actions);

    card.appendChild(media);
    card.appendChild(body);
    card.appendChild(
      cardBack('ARCHIVE', 'The Engineering Archive', `${archive.length} more builds`)
    );
    deck.appendChild(card);

    labels.push('The Engineering Archive');
  }

  // Labels for the status pill, derived here so the deck and the pill can
  // never disagree about how many cards there are.
  window.PROJECT_DECK_LABELS = labels;

  // --- Artwork loading ------------------------------------------------------
  // The showcase sits about five screens into the scroll, so its frames have
  // no business competing with the opening chapter for bandwidth. They are
  // fetched once the section is within a screen of the viewport, and
  // unconditionally if the browser cannot tell us when that is.
  (function loadArtwork() {
    if (!artworkQueue.length) return;

    const drain = () => {
      artworkQueue.splice(0).forEach((load) => load());
    };

    const section = document.getElementById('showcase');
    if (!section || typeof IntersectionObserver !== 'function') {
      drain();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        drain();
      },
      { rootMargin: '100% 0px' }
    );
    observer.observe(section);
  })();
})();
