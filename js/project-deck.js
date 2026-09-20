/**
 * ADRIAN SETH TABOTABO — PROJECT DECK RENDERER
 * Builds the showcase cards from PORTFOLIO_DATA.flagships.
 *
 * Runs before scrollytelling.js and interactions.js so the cards exist in the
 * DOM by the time those scripts query for them and bind their handlers.
 *
 * Each card is a full-bleed image with a top-to-bottom scrim and the copy
 * sitting in the lower half. When a project has no screenshot on disk yet the
 * card falls back to a gradient derived from the project id — deterministic,
 * so a given project always gets the same artwork.
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
  // without a screenshot still belongs to the palette. Runs dark at the
  // bottom because that is where the copy sits.
  function gradientFor(id) {
    const h = hashId(id);
    const hue = 324 + (h % 5) * 8;
    const angle = 150 + (h % 4) * 12;
    return (
      `linear-gradient(${angle}deg, ` +
      `hsl(${hue}, 86%, 87%) 0%, ` +
      `hsl(${hue - 4}, 72%, 63%) 46%, ` +
      `hsl(${hue - 14}, 60%, 22%) 100%)`
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

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  const total = String(projects.length).padStart(2, '0');

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
      const probe = new Image();
      probe.onload = () => {
        media.style.backgroundImage = `url("${project.image}")`;
        card.classList.add('has-photo');
      };
      // No onerror handling needed beyond leaving the gradient in place.
      probe.src = project.image;
    }

    const scrim = el('div', 'project-card-scrim');
    scrim.setAttribute('aria-hidden', 'true');

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
    if (project.desc) {
      body.appendChild(el('p', 'project-card-desc', project.desc));
    }

    if (Array.isArray(project.stack) && project.stack.length) {
      const stack = el('div', 'project-card-stack');
      // Capped at four so a long stack cannot push the actions off the card.
      project.stack.slice(0, 4).forEach((tech) => {
        stack.appendChild(el('span', 'tag-pill', tech));
      });
      if (project.stack.length > 4) {
        stack.appendChild(el('span', 'tag-pill is-overflow', `+${project.stack.length - 4}`));
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
    card.appendChild(scrim);
    card.appendChild(body);
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

    const scrim = el('div', 'project-card-scrim');
    scrim.setAttribute('aria-hidden', 'true');

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
    card.appendChild(scrim);
    card.appendChild(body);
    deck.appendChild(card);

    labels.push('The Engineering Archive');
  }

  // Labels for the status pill, derived here so the deck and the pill can
  // never disagree about how many cards there are.
  window.PROJECT_DECK_LABELS = labels;
})();
