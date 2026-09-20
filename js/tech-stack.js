/**
 * ADRIAN SETH TABOTABO — THE ATELIER (THE CRAFT & MEDIUMS)
 * Chapter 3: Scroll-Driven 3D Origami Flamingo & Unfolding Plumage Fan
 * Pure Vanilla HTML5, CSS 3D Transforms, and Serene Botanical Archive Modal
 */

(function () {
  'use strict';

  const root = document.getElementById('techStack');
  const section = document.getElementById('studio');
  const groups = window.PORTFOLIO_DATA?.tools?.groups;
  if (!root || !groups || !section) return;

  const brands = window.TECH_BRANDS || {};

  // Helper DOM creator
  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  };

  // --------------------------------------------------------------------------
  // 1. REALM DEFINITIONS (6 THEMATIC CRAFT REALMS)
  // --------------------------------------------------------------------------
  const REALMS = [
    {
      id: "languages",
      seq: "01",
      title: "Languages of Thought",
      discipline: "Core Syntax",
      philosophy: "Expressive syntax, memory safety, and systems programming.",
      categoryChipId: "languages",
      categoryChipLabel: "Languages",
      filterGroupIds: ["languages"],
      baseAngle: -48,
      fanArc: 14,
      distX: 42,
      distY: -65,
      bladeZ: 18,
      staples: [
        { name: "TypeScript", mark: "typescript" },
        { name: "C++", mark: "cplusplus" },
        { name: "Python", mark: "python" },
        { name: "Dart", mark: "dart" },
        { name: "C#", mark: "csharp" },
        { name: "JavaScript", mark: "javascript" }
      ]
    },
    {
      id: "interfaces",
      seq: "02",
      title: "Tactile Interfaces & Web",
      discipline: "Human Interface",
      philosophy: "Soft, accessible, and reactive user experiences.",
      categoryChipId: "interfaces",
      categoryChipLabel: "Interfaces",
      filterGroupIds: ["frontend"],
      baseAngle: -28,
      fanArc: 18,
      distX: 68,
      distY: -42,
      bladeZ: 14,
      staples: [
        { name: "React 19", mark: "react" },
        { name: "Next.js (15/16)", mark: "nextdotjs" },
        { name: "Tailwind CSS v4", mark: "tailwindcss" },
        { name: "Three.js", mark: "threedotjs" },
        { name: "GSAP", mark: "greensock" },
        { name: "Radix UI", mark: "radixui" }
      ]
    },
    {
      id: "backends",
      seq: "03",
      title: "Resilient Backends & Data",
      discipline: "Distributed State",
      philosophy: "High-throughput APIs, persistent storage, and real-time state.",
      categoryChipId: "backends",
      categoryChipLabel: "Backends & Data",
      filterGroupIds: ["backend", "database"],
      baseAngle: -8,
      fanArc: 22,
      distX: 82,
      distY: -12,
      bladeZ: 10,
      staples: [
        { name: "Node.js", mark: "nodedotjs" },
        { name: "PostgreSQL", mark: "postgresql" },
        { name: "Redis / Upstash", mark: "redis" },
        { name: "FastAPI", mark: "fastapi" },
        { name: "Supabase", mark: "supabase" },
        { name: "Express.js", mark: "express" }
      ]
    },
    {
      id: "silicon",
      seq: "04",
      title: "Silicon, Sensors & Hardware",
      discipline: "Physical Computing",
      philosophy: "Connecting physical circuitry with embedded protocols.",
      categoryChipId: "silicon",
      categoryChipLabel: "Silicon & Hardware",
      filterGroupIds: ["hardware"],
      baseAngle: 12,
      fanArc: 24,
      distX: 74,
      distY: 18,
      bladeZ: 6,
      staples: [
        { name: "ESP32 (ESP-NOW)", mark: "espressif" },
        { name: "Arduino", mark: "arduino" },
        { name: "PlatformIO", mark: "platformio" },
        { name: "INA219 Power Sensors", mark: null },
        { name: "RC522 RFID", mark: null },
        { name: "Unity 3D", mark: "unity" }
      ]
    },
    {
      id: "intelligence",
      seq: "05",
      title: "Intelligent Agents & Vision",
      discipline: "Cognitive Systems",
      philosophy: "Applied agent architectures and computer vision pipelines.",
      categoryChipId: "intelligence",
      categoryChipLabel: "Intelligence & Vision",
      filterGroupIds: ["ai"],
      baseAngle: 32,
      fanArc: 26,
      distX: 56,
      distY: 48,
      bladeZ: 2,
      staples: [
        { name: "Google Gemini", mark: "googlegemini" },
        { name: "Claude Code CLI", mark: "claude" },
        { name: "MCP Protocol", mark: "modelcontextprotocol" },
        { name: "OpenCV", mark: "opencv" },
        { name: "YOLOv8", mark: "ultralytics" },
        { name: "Google Antigravity", mark: null }
      ]
    },
    {
      id: "workflow",
      seq: "06",
      title: "Craft Environment & Workflow",
      discipline: "Tooling & Distros",
      philosophy: "Frictionless developer ergonomics, containers, and deployment.",
      categoryChipId: "workflow",
      categoryChipLabel: "Workflow & Systems",
      filterGroupIds: ["devops-qa", "systems-os"],
      baseAngle: 52,
      fanArc: 28,
      distX: 32,
      distY: 74,
      bladeZ: -2,
      staples: [
        { name: "Docker & Compose", mark: "docker" },
        { name: "Git / GitHub", mark: "git" },
        { name: "VS Code", mark: "visualstudiocode" },
        { name: "Cloudflare Workers", mark: "cloudflareworkers" },
        { name: "Vite", mark: "vite" },
        { name: "GitHub Actions", mark: "githubactions" }
      ]
    }
  ];

  // --------------------------------------------------------------------------
  // 2. COMPILE FLAT INDEX OF ALL 92 INSTRUMENTS
  // --------------------------------------------------------------------------
  const allTools = [];

  groups.forEach(group => {
    group.items.forEach(item => {
      // Vite is curated as a core staple of Realm 6 (Craft Environment & Workflow)
      const realm = (item.name === 'Vite')
        ? REALMS.find(r => r.id === 'workflow')
        : REALMS.find(r => r.filterGroupIds.includes(group.id));

      allTools.push({
        name: item.name,
        mark: item.mark,
        groupId: group.id,
        groupLabel: group.label,
        realmId: realm ? realm.id : 'misc',
        realmCategoryChipId: realm ? realm.categoryChipId : 'misc',
        realmTitle: realm ? realm.title : group.label
      });
    });
  });

  // Brand lookup & contrast analyzer
  function resolveBrand(name, mark) {
    const brand = brands[name] || (mark ? brands[mark] : null);
    if (!brand) return null;

    let isDarkSurface = false;
    // Unity 3D has a dark gray/black SVG mark on disk, giving it sharp contrast on soft blush wafers
    if (name !== 'Unity 3D' && brand.color && brand.color.startsWith('#')) {
      const hex = brand.color.slice(1);
      const full = hex.length === 3 ? [...hex].map(c => c + c).join('') : hex;
      if (full.length === 6) {
        const [r, g, b] = full.match(/.{2}/g).map(c => parseInt(c, 16));
        if (r * 0.2126 + g * 0.7152 + b * 0.0722 > 224) {
          isDarkSurface = true;
        }
      }
    }

    return {
      asset: brand.asset || null,
      color: brand.color || null,
      isDarkSurface
    };
  }

  // Create brand icon or monogram node
  function createBrandElement(name, mark, iconSize = 16, monogramClass = 'staple-monogram') {
    const resolved = resolveBrand(name, mark);
    const box = el('div', 'staple-icon-box');

    if (resolved?.isDarkSurface) {
      box.dataset.logoSurface = 'dark';
    }

    if (resolved?.asset) {
      const img = el('img', 'staple-icon');
      img.src = resolved.asset;
      img.alt = '';
      img.width = iconSize;
      img.height = iconSize;
      img.loading = 'lazy';
      img.decoding = 'async';
      box.appendChild(img);
    } else {
      const clean = name.replace(/[^a-z0-9]/gi, '').slice(0, 2).toUpperCase() || '★';
      const mono = el('span', monogramClass, clean);
      mono.setAttribute('aria-hidden', 'true');
      box.appendChild(mono);
    }

    return { box, resolved };
  }

  // --------------------------------------------------------------------------
  // 3. BUILD THE 3D ORIGAMI ARENA & FLAMINGO SCULPTURE
  // --------------------------------------------------------------------------
  root.innerHTML = '';

  const arena = el('div', 'origami-arena');

  // Left/Center 3D Viewport
  const viewport = el('div', 'origami-viewport');
  const world = el('div', 'origami-world');

  // Pedestal (Water ripples)
  const pedestal = el('div', 'flamingo-pedestal');
  const rip1 = el('div', 'pedestal-ripple');
  const rip2 = el('div', 'pedestal-ripple-2');
  pedestal.append(rip1, rip2);

  // The 3D Origami Flamingo
  const flamingo = el('div', 'origami-flamingo');

  // Legs
  const legs = el('div', 'flamingo-legs');
  const legStanding = el('div', 'leg-standing');
  const legBent = el('div', 'leg-bent');
  legs.append(legStanding, legBent);

  // Body facets
  const body = el('div', 'flamingo-body');
  const facetBreast = el('div', 'facet-breast');
  const facetBelly = el('div', 'facet-belly');
  const facetTail = el('div', 'facet-tail');
  body.append(facetBreast, facetBelly, facetTail);

  // Neck chain
  const neckChain = el('div', 'flamingo-neck-chain');
  const neck1 = el('div', 'neck-segment-1');
  const neck2 = el('div', 'neck-segment-2');
  const neck3 = el('div', 'neck-segment-3');
  const head = el('div', 'origami-head');
  const eye = el('div', 'origami-eye');
  const beak = el('div', 'origami-beak');
  head.append(eye, beak);
  neck3.appendChild(head);
  neck2.appendChild(neck3);
  neck1.appendChild(neck2);
  neckChain.appendChild(neck1);

  // The Unfolding Wing Fan (6 Plumage Blades)
  const wingFan = el('div', 'flamingo-wing-fan');
  const bladeElements = [];

  REALMS.forEach((realm, index) => {
    const realmTools = allTools.filter(t => t.realmId === realm.id);
    const blade = el('div', 'plumage-blade');
    blade.setAttribute('data-realm-id', realm.id);
    blade.setAttribute('data-index', String(index));
    blade.setAttribute('role', 'button');
    blade.setAttribute('tabindex', '0');
    blade.setAttribute('aria-label', `Plumage Tier ${realm.seq}: ${realm.title}`);

    blade.style.setProperty('--base-angle', `${realm.baseAngle}deg`);
    blade.style.setProperty('--fan-arc', `${realm.fanArc}deg`);
    blade.style.setProperty('--dist-x', `${realm.distX}px`);
    blade.style.setProperty('--dist-y', `${realm.distY}px`);
    blade.style.setProperty('--blade-z', `${realm.bladeZ}`);
    blade.style.setProperty('--unfurl-ratio', '0');

    // Blade Header
    const bHeader = el('div', 'blade-header');
    const bSeq = el('span', 'blade-seq', `${realm.seq} / Plume`);
    const bCount = el('span', 'blade-count', `${realmTools.length}`);
    bHeader.append(bSeq, bCount);

    const bTitle = el('div', 'blade-title', realm.title);

    // Mini staple preview
    const bPreview = el('div', 'blade-staple-preview');
    const stapleLead = realm.staples[0];
    if (stapleLead) {
      const resolved = resolveBrand(stapleLead.name, stapleLead.mark);
      if (resolved?.asset) {
        const miniIcon = el('img', 'blade-mini-icon');
        miniIcon.src = resolved.asset;
        miniIcon.alt = '';
        miniIcon.width = 14;
        miniIcon.height = 14;
        bPreview.appendChild(miniIcon);
      }
      const miniName = el('span', 'blade-mini-name', stapleLead.name);
      bPreview.appendChild(miniName);
    }

    blade.append(bHeader, bTitle, bPreview);

    blade.addEventListener('click', () => {
      openModal(realm.categoryChipId, blade);
    });

    blade.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(realm.categoryChipId, blade);
      }
    });

    wingFan.appendChild(blade);
    bladeElements.push(blade);
  });

  flamingo.append(pedestal, legs, body, neckChain, wingFan);
  world.appendChild(flamingo);
  viewport.appendChild(world);

  // Right Side: The Active Craft Realm Spotlight Deck
  const spotlightDeck = el('div', 'origami-spotlight-deck');
  const cardWrapper = el('div', 'spotlight-card-wrapper');
  const cardElements = [];

  REALMS.forEach((realm, index) => {
    const realmTools = allTools.filter(t => t.realmId === realm.id);
    const totalCount = realmTools.length;
    const stapleCount = realm.staples.length;
    const moreInArchive = Math.max(0, totalCount - stapleCount);

    const card = el('div', `spotlight-card ${index === 0 ? 'active' : ''}`);
    card.setAttribute('data-realm-id', realm.id);
    card.setAttribute('data-index', String(index));

    // Header
    const sHeader = el('div', 'spotlight-header');
    const seqRow = el('div', 'spotlight-seq-row');
    const seq = el('span', 'spotlight-seq', `${realm.seq} / Plumage Tier`);
    const pill = el('span', 'spotlight-discipline-pill', realm.discipline);
    seqRow.append(seq, pill);

    const title = el('h3', 'spotlight-title', realm.title);
    const phil = el('p', 'spotlight-philosophy', `“${realm.philosophy}”`);
    sHeader.append(seqRow, title, phil);

    // Staples list
    const staplesList = el('ul', 'spotlight-staples');
    staplesList.setAttribute('aria-label', `Featured tools for ${realm.title}`);

    realm.staples.forEach(st => {
      const stapleLi = el('li', 'staple-pill');
      const { box, resolved } = createBrandElement(st.name, st.mark, 15, 'staple-monogram');
      if (resolved?.isDarkSurface) {
        stapleLi.dataset.logoSurface = 'dark';
      }
      const nameSpan = el('span', 'staple-name', st.name);
      stapleLi.append(box, nameSpan);
      staplesList.appendChild(stapleLi);
    });

    // Footer
    const sFooter = el('div', 'spotlight-footer');
    const triggerBtn = el('button', 'spotlight-archive-trigger');
    triggerBtn.type = 'button';
    triggerBtn.setAttribute('data-realm-chip', realm.categoryChipId);
    triggerBtn.setAttribute('aria-label', `View all ${totalCount} instruments in ${realm.title}`);

    const labelText = el('span', '', `+${moreInArchive} more in archive`);
    const arrowSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    arrowSvg.setAttribute('width', '12');
    arrowSvg.setAttribute('height', '12');
    arrowSvg.setAttribute('viewBox', '0 0 24 24');
    arrowSvg.setAttribute('fill', 'none');
    arrowSvg.setAttribute('stroke', 'currentColor');
    arrowSvg.setAttribute('stroke-width', '2.5');
    arrowSvg.setAttribute('stroke-linecap', 'round');
    arrowSvg.setAttribute('stroke-linejoin', 'round');
    arrowSvg.setAttribute('aria-hidden', 'true');
    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    poly.setAttribute('points', '9 18 15 12 9 6');
    arrowSvg.appendChild(poly);

    triggerBtn.append(labelText, arrowSvg);

    const totalBadge = el('span', 'spotlight-total-badge', `${stapleCount} curated · ${totalCount} total`);
    sFooter.append(triggerBtn, totalBadge);

    card.append(sHeader, staplesList, sFooter);
    cardWrapper.appendChild(card);
    cardElements.push(card);
  });

  spotlightDeck.appendChild(cardWrapper);
  arena.append(viewport, spotlightDeck);
  root.appendChild(arena);

  // --------------------------------------------------------------------------
  // 4. STAGE HEADER STOPS & SUMMARY
  // --------------------------------------------------------------------------
  const stopsRail = document.getElementById('origamiStops');
  const stopButtons = [];

  if (stopsRail) {
    stopsRail.innerHTML = '';
    REALMS.forEach((r, idx) => {
      const btn = el('button', `origami-stop-btn ${idx === 0 ? 'active' : ''}`);
      btn.type = 'button';
      btn.setAttribute('aria-label', `Jump to Tier ${r.seq}: ${r.title}`);
      btn.setAttribute('data-index', String(idx));

      const dot = el('span', 'origami-stop-dot');
      const label = el('span', '', r.seq);
      btn.append(dot, label);

      btn.addEventListener('click', () => {
        goToStop(idx);
      });

      stopsRail.appendChild(btn);
      stopButtons.push(btn);
    });
  }

  const captionEl = document.getElementById('origamiCaption');
  const updateCaption = (realmIndex) => {
    if (!captionEl) return;
    const r = REALMS[realmIndex] || REALMS[0];
    captionEl.innerHTML = `
      <span class="caption-beat-tag">Tier ${r.seq}</span>
      <span class="caption-beat-text">${r.title}: ${r.philosophy}</span>
    `;
  };

  const archiveTotalPill = document.getElementById('archiveTotalPill');
  if (archiveTotalPill) {
    archiveTotalPill.textContent = `${allTools.length} Instruments`;
  }

  // --------------------------------------------------------------------------
  // 5. SCROLL-DRIVEN SCROLLYTELLING CONTROLLER
  // --------------------------------------------------------------------------
  let currentActiveIndex = 0;
  let targetProgress = 0;
  let smoothProgress = 0;
  let isRafActive = false;

  // Smooth quintic Hermite
  const smootherstep = t => {
    const c = Math.max(0, Math.min(1, t));
    return c * c * c * (c * (c * 6 - 15) + 10);
  };

  function renderOrigami(progress) {
    targetProgress = Math.max(0, Math.min(1, progress));

    // Immediate calculation of active beat
    // progress: [0.0, 0.15] -> Prologue
    // progress: [0.15, 0.90] -> 6 Tiers mapped across the distance
    // progress: [0.90, 1.00] -> Full wingspan tableau
    let activeIdx = 0;
    if (targetProgress < 0.15) {
      activeIdx = 0;
    } else if (targetProgress >= 0.90) {
      activeIdx = 5;
    } else {
      const span = (targetProgress - 0.15) / 0.75;
      activeIdx = Math.min(5, Math.max(0, Math.floor(span * 6)));
    }

    if (activeIdx !== currentActiveIndex) {
      currentActiveIndex = activeIdx;
      // Update spotlight cards
      cardElements.forEach((card, i) => {
        card.classList.toggle('active', i === currentActiveIndex);
      });
      // Update plumage blades
      bladeElements.forEach((blade, i) => {
        blade.classList.toggle('active', i === currentActiveIndex);
      });
      // Update stops
      stopButtons.forEach((btn, i) => {
        btn.classList.toggle('active', i === currentActiveIndex);
      });
      // Update caption
      updateCaption(currentActiveIndex);
    }

    // Dynamic 3D transforms
    // Bird Rotation: -28deg profile view to +14deg three-quarter view, returning to 0deg in finale
    const rotY = -28 + smootherstep(targetProgress) * 42 - (targetProgress > 0.85 ? (targetProgress - 0.85) * 40 : 0);
    const tiltX = 6 + Math.sin(targetProgress * Math.PI) * 5;
    world.style.setProperty('--bird-rot-y', `${rotY.toFixed(2)}deg`);
    world.style.setProperty('--bird-tilt-x', `${tiltX.toFixed(2)}deg`);

    // S-Neck dynamic stretch
    const neck1Rot = -18 + Math.sin(targetProgress * Math.PI * 1.5) * 8;
    const neck2Rot = 38 - Math.sin(targetProgress * Math.PI) * 12;
    const headTilt = 15 + Math.cos(targetProgress * Math.PI * 2) * 6;
    world.style.setProperty('--neck-arch-1', `${neck1Rot.toFixed(2)}deg`);
    world.style.setProperty('--neck-arch-2', `${neck2Rot.toFixed(2)}deg`);
    world.style.setProperty('--head-tilt', `${headTilt.toFixed(2)}deg`);

    // Wing Fan Unfurling: each blade opens progressively
    bladeElements.forEach((blade, i) => {
      // Each blade has an arrival threshold
      const startAt = 0.12 + (i / 6) * 0.72;
      const bladeProgress = Math.max(0, Math.min(1, (targetProgress - startAt) / 0.14));
      const unfurlRatio = smootherstep(bladeProgress);
      blade.style.setProperty('--unfurl-ratio', unfurlRatio.toFixed(3));
    });
  }

  // Scroll to a specific stop index
  function goToStop(index) {
    if (!section) return;
    const trackTop = section.offsetTop;
    const trackHeight = section.offsetHeight;
    const vh = window.innerHeight;
    const scrollableDistance = Math.max(trackHeight - vh, 1);

    // Map index to progress
    const p = 0.16 + (index / 5) * 0.72;
    const targetScrollY = trackTop + p * scrollableDistance;

    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth'
    });
  }

  // Mouse Parallax Effect across the 3D stage
  let mouseTiltX = 0;
  let mouseTiltY = 0;

  viewport.addEventListener('mousemove', (e) => {
    const rect = viewport.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseTiltY = x * 14;
    mouseTiltX = -y * 10;
    world.style.setProperty('--bird-tilt-z', `${(x * -4).toFixed(2)}deg`);
  }, { passive: true });

  viewport.addEventListener('mouseleave', () => {
    mouseTiltX = 0;
    mouseTiltY = 0;
    world.style.setProperty('--bird-tilt-z', '0deg');
  }, { passive: true });

  // Expose to Scrollytelling Engine
  window.OrigamiFlamingo = {
    render: renderOrigami,
    goToStop
  };

  // Initial render at progress 0
  renderOrigami(0);

  // --------------------------------------------------------------------------
  // 6. SERENE BOTANICAL ARCHIVE MODAL ENGINE
  // --------------------------------------------------------------------------
  const modalBackdrop = document.getElementById('atelierArchiveModal');
  const openArchiveBtn = document.getElementById('openArchiveBtn');
  const closeArchiveBtn = document.getElementById('closeArchiveBtn');
  const searchInput = document.getElementById('archiveSearchInput');
  const searchClear = document.getElementById('archiveSearchClear');
  const filterChipsContainer = document.getElementById('archiveFilterChips');
  const archiveGrid = document.getElementById('archiveGrid');
  const emptyState = document.getElementById('archiveEmptyState');
  const resetBtn = document.getElementById('archiveResetBtn');
  const filterCount = document.getElementById('archiveFilterCount');

  if (!modalBackdrop) return;

  let activeCategory = 'all';
  let searchQuery = '';
  let lastFocusedElement = null;
  let isClosing = false;

  const filterChips = [
    { id: 'all', label: 'All', count: allTools.length }
  ];

  REALMS.forEach(r => {
    const realmTools = allTools.filter(t => t.realmCategoryChipId === r.categoryChipId);
    filterChips.push({
      id: r.categoryChipId,
      label: r.categoryChipLabel,
      count: realmTools.length
    });
  });

  function initFilterChips() {
    if (!filterChipsContainer) return;
    filterChipsContainer.innerHTML = '';

    filterChips.forEach(chip => {
      const btn = el('button', `botanical-chip ${chip.id === activeCategory ? 'active' : ''}`);
      btn.type = 'button';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', chip.id === activeCategory ? 'true' : 'false');
      btn.setAttribute('data-category', chip.id);
      btn.setAttribute('id', `chip-${chip.id}`);
      btn.textContent = `${chip.label} (${chip.count})`;

      btn.addEventListener('click', () => {
        if (activeCategory === chip.id) return;
        activeCategory = chip.id;
        updateActiveChip();
        renderArchiveGrid();
      });

      // WAI-ARIA tablist arrow key navigation
      btn.addEventListener('keydown', (e) => {
        const buttons = Array.from(filterChipsContainer.querySelectorAll('.botanical-chip'));
        const currIndex = buttons.indexOf(btn);
        let nextIndex = -1;

        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          nextIndex = (currIndex + 1) % buttons.length;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          nextIndex = (currIndex - 1 + buttons.length) % buttons.length;
        } else if (e.key === 'Home') {
          e.preventDefault();
          nextIndex = 0;
        } else if (e.key === 'End') {
          e.preventDefault();
          nextIndex = buttons.length - 1;
        }

        if (nextIndex >= 0) {
          const nextBtn = buttons[nextIndex];
          nextBtn.focus();
          nextBtn.click();
        }
      });

      filterChipsContainer.appendChild(btn);
    });
  }

  function updateActiveChip() {
    if (!filterChipsContainer) return;
    const buttons = filterChipsContainer.querySelectorAll('.botanical-chip');
    buttons.forEach(btn => {
      const isSelected = btn.getAttribute('data-category') === activeCategory;
      btn.classList.toggle('active', isSelected);
      btn.setAttribute('aria-selected', isSelected ? 'true' : 'false');
    });
  }

  function renderArchiveGrid() {
    if (!archiveGrid) return;
    archiveGrid.innerHTML = '';

    const normalizedQuery = searchQuery.trim().toLowerCase();
    const cleanQuery = normalizedQuery.replace(/[^a-z0-9]/g, '');

    const filtered = allTools.filter(item => {
      const categoryMatches = (activeCategory === 'all') || (item.realmCategoryChipId === activeCategory);
      if (!categoryMatches) return false;

      if (!normalizedQuery) return true;

      const nameMatch = item.name.toLowerCase().includes(normalizedQuery);
      const groupMatch = item.groupLabel.toLowerCase().includes(normalizedQuery);
      const realmMatch = item.realmTitle.toLowerCase().includes(normalizedQuery);
      const markMatch = item.mark ? item.mark.toLowerCase().includes(normalizedQuery) : false;

      const cleanName = item.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanMark = (item.mark || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanMatch = (cleanQuery.length >= 2) && (cleanName.includes(cleanQuery) || cleanMark.includes(cleanQuery));

      return nameMatch || groupMatch || realmMatch || markMatch || cleanMatch;
    });

    if (filterCount) {
      filterCount.textContent = `Showing ${filtered.length} of ${allTools.length} instruments`;
    }

    if (filtered.length === 0) {
      archiveGrid.style.display = 'none';
      if (emptyState) emptyState.style.display = 'flex';
      return;
    }

    archiveGrid.style.display = 'grid';
    if (emptyState) emptyState.style.display = 'none';

    const frag = document.createDocumentFragment();

    filtered.forEach(item => {
      const card = el('div', 'botanical-tool-card');
      card.setAttribute('role', 'listitem');

      const { box, resolved } = createBrandElement(item.name, item.mark, 18, 'botanical-tool-monogram');
      box.className = 'botanical-tool-icon-box';
      if (resolved?.isDarkSurface) {
        card.dataset.logoSurface = 'dark';
      }

      const info = el('div', 'botanical-tool-info');
      const nameSpan = el('span', 'botanical-tool-name', item.name);
      nameSpan.title = item.name;
      const catSpan = el('span', 'botanical-tool-category', item.groupLabel);

      info.append(nameSpan, catSpan);
      card.append(box, info);
      frag.appendChild(card);
    });

    archiveGrid.appendChild(frag);
  }

  function openModal(presetCategory = 'all', triggerElement = null) {
    if (isClosing) return;
    lastFocusedElement = triggerElement || document.activeElement;
    activeCategory = presetCategory;
    searchQuery = '';
    if (searchInput) searchInput.value = '';
    if (searchClear) searchClear.style.display = 'none';

    updateActiveChip();
    renderArchiveGrid();

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    modalBackdrop.classList.remove('closing');
    modalBackdrop.classList.add('active');
    modalBackdrop.setAttribute('aria-hidden', 'false');

    if (searchInput) {
      setTimeout(() => searchInput.focus(), 30);
    }
  }

  function closeModal() {
    if (!modalBackdrop.classList.contains('active') || isClosing) return;
    isClosing = true;

    modalBackdrop.classList.add('closing');
    modalBackdrop.setAttribute('aria-hidden', 'true');

    setTimeout(() => {
      modalBackdrop.classList.remove('active', 'closing');
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      isClosing = false;

      if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
      }
    }, 220);
  }

  if (openArchiveBtn) {
    openArchiveBtn.addEventListener('click', () => openModal('all', openArchiveBtn));
  }

  root.addEventListener('click', (e) => {
    const trigger = e.target.closest('.spotlight-archive-trigger');
    if (trigger) {
      const realmChip = trigger.getAttribute('data-realm-chip');
      openModal(realmChip || 'all', trigger);
    }
  });

  if (closeArchiveBtn) {
    closeArchiveBtn.addEventListener('click', closeModal);
  }

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!modalBackdrop.classList.contains('active')) return;

    if (e.key === 'Escape' || e.key === 'Esc') {
      e.preventDefault();
      closeModal();
      return;
    }

    if (e.key === 'Tab') {
      const isVisible = (elem) => {
        return typeof elem.checkVisibility === 'function'
          ? elem.checkVisibility()
          : !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
      };

      const focusables = Array.from(modalBackdrop.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )).filter(isVisible);

      if (focusables.length === 0) return;

      const firstElement = focusables[0];
      const lastElement = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement || !modalBackdrop.contains(document.activeElement)) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement || !modalBackdrop.contains(document.activeElement)) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  });

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchQuery = searchInput.value;
      if (searchClear) {
        searchClear.style.display = searchQuery ? 'grid' : 'none';
      }
      renderArchiveGrid();
    });
  }

  if (searchClear) {
    searchClear.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchQuery = '';
        searchClear.style.display = 'none';
        searchInput.focus();
        renderArchiveGrid();
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      activeCategory = 'all';
      searchQuery = '';
      if (searchInput) searchInput.value = '';
      if (searchClear) searchClear.style.display = 'none';
      updateActiveChip();
      renderArchiveGrid();
      if (searchInput) searchInput.focus();
    });
  }

  initFilterChips();

})();
