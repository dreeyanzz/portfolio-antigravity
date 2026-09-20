/**
 * ADRIAN SETH TABOTABO — THE ATELIER (THE CRAFT & MEDIUMS)
 * Chapter 3: Scroll-Driven 3D Lotus — Six Whorls, Ninety-Two Seeds
 *
 * Scroll is the only input. The chapter's pinned progress drives two values:
 * `bloom`, which opens the flower, and `dive`, which falls into the open
 * receptacle and carries the chapter out into the next one. The camera
 * flight, the petal unfurl, the stamen crown and the seed pod are all pure
 * functions of those two — nothing here answers to the cursor.
 *
 * Pure vanilla HTML5, CSS 3D transforms, and the serene botanical archive
 * modal.
 */

(function () {
  'use strict';

  const root = document.getElementById('techStack');
  const section = document.getElementById('studio');
  const groups = window.PORTFOLIO_DATA?.tools?.groups;
  if (!root || !groups || !section) return;

  // The dive's CSS variables live here so the header inherits them too
  const stage = root.closest('.studio-stage-container') || root;

  const brands = window.TECH_BRANDS || {};
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Helper DOM creator
  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  };

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smoothstep = t => t * t * (3 - 2 * t);
  // Gentle overshoot so a petal settles instead of stopping dead
  const easeOutBack = t => {
    const c1 = 0.9;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  };

  // --------------------------------------------------------------------------
  // 1. REALM DEFINITIONS (6 THEMATIC CRAFT REALMS)
  //    Ordered outermost whorl first: the flower opens from the substrate the
  //    work stands on (silicon) inward to what it is refined into (agents).
  // --------------------------------------------------------------------------
  const REALMS = [
    {
      id: "silicon",
      seq: "01",
      title: "Silicon, Sensors & Hardware",
      discipline: "Physical Computing",
      philosophy: "Connecting physical circuitry with embedded protocols.",
      categoryChipId: "silicon",
      categoryChipLabel: "Silicon & Hardware",
      filterGroupIds: ["hardware"],
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
      id: "workflow",
      seq: "02",
      title: "Craft Environment & Workflow",
      discipline: "Tooling & Distros",
      philosophy: "Frictionless developer ergonomics, containers, and deployment.",
      categoryChipId: "workflow",
      categoryChipLabel: "Workflow & Systems",
      filterGroupIds: ["devops-qa", "systems-os"],
      staples: [
        { name: "Docker & Compose", mark: "docker" },
        { name: "Git / GitHub", mark: "git" },
        { name: "VS Code", mark: "visualstudiocode" },
        { name: "Cloudflare Workers", mark: "cloudflareworkers" },
        { name: "Vite", mark: "vite" },
        { name: "GitHub Actions", mark: "githubactions" }
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
      id: "languages",
      seq: "04",
      title: "Languages of Thought",
      discipline: "Core Syntax",
      philosophy: "Expressive syntax, memory safety, and systems programming.",
      categoryChipId: "languages",
      categoryChipLabel: "Languages",
      filterGroupIds: ["languages"],
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
      seq: "05",
      title: "Tactile Interfaces & Web",
      discipline: "Human Interface",
      philosophy: "Soft, accessible, and reactive user experiences.",
      categoryChipId: "interfaces",
      categoryChipLabel: "Interfaces",
      filterGroupIds: ["frontend"],
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
      id: "intelligence",
      seq: "06",
      title: "Intelligent Agents & Vision",
      discipline: "Cognitive Systems",
      philosophy: "Applied agent architectures and computer vision pipelines.",
      categoryChipId: "intelligence",
      categoryChipLabel: "Intelligence & Vision",
      filterGroupIds: ["ai"],
      staples: [
        { name: "Google Gemini", mark: "googlegemini" },
        { name: "Claude Code CLI", mark: "claude" },
        { name: "MCP Protocol", mark: "modelcontextprotocol" },
        { name: "OpenCV", mark: "opencv" },
        { name: "YOLOv8", mark: "ultralytics" },
        { name: "Google Antigravity", mark: null }
      ]
    }
  ];

  const N = REALMS.length;

  // --------------------------------------------------------------------------
  // 2. COMPILE FLAT INDEX OF ALL 92 INSTRUMENTS
  // --------------------------------------------------------------------------
  const allTools = [];

  groups.forEach(group => {
    group.items.forEach(item => {
      // Vite is curated as a core staple of the Craft Environment & Workflow whorl
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

  // Brand icon or monogram tile for an archive card
  function createBrandElement(name, mark, iconSize = 18) {
    const resolved = resolveBrand(name, mark);
    const box = el('div', 'botanical-tool-icon-box');

    if (resolved?.asset) {
      const img = el('img');
      img.src = resolved.asset;
      img.alt = '';
      img.width = iconSize;
      img.height = iconSize;
      img.loading = 'lazy';
      img.decoding = 'async';
      box.appendChild(img);
    } else {
      const clean = name.replace(/[^a-z0-9]/gi, '').slice(0, 2).toUpperCase() || '★';
      const mono = el('span', 'botanical-tool-monogram', clean);
      mono.setAttribute('aria-hidden', 'true');
      box.appendChild(mono);
    }

    return { box, resolved };
  }

  function initials(name) {
    return name.replace(/[^A-Za-z0-9 ]/g, ' ').trim().split(/\s+/).slice(0, 2)
      .map(s => s[0]).join('').toUpperCase() || '★';
  }

  // --------------------------------------------------------------------------
  // 3. BOTANICAL GEOMETRY & COLORATION
  // --------------------------------------------------------------------------
  // Pink Lotus (Nelumbo nucifera): obovate-cymbiform contour, widest in the
  // upper-mid third, with an elegant claw base and a pointed apex cusp.
  const PETAL_PATH = 'M 50 6 C 47 7, 34 18, 22 42 C 11 66, 5 95, 6 122 C 7 156, 17 195, 29 228 C 37 248, 44 260, 50 262 C 56 260, 63 248, 71 228 C 83 195, 93 156, 94 122 C 95 95, 89 66, 78 42 C 66 18, 53 7, 50 6 Z';

  // Geometry per whorl (0 = outermost calyx/corolla)
  function geom(i) {
    const t = i / (N - 1);
    return {
      w: lerp(106, 62, t),
      h: lerp(264, 142, t),
      open: lerp(-2, -34, t),        // outer lays flat (-2deg), inner stays cupped (-34deg)
      closed: lerp(-91.5, -88.5, t), // converges inward to a closed apex
      radOpen: lerp(34, 12, t),      // expanded base in full bloom
      radClosed: lerp(9, 3.5, t),    // compact base in the closed bud
      lift: lerp(0, 24, t),
      shingle: lerp(9, 4, t),        // spiral imbrication cant: prevents edge collisions
      badgeT: lerp(32, 18, t) + '%',
      badgeS: lerp(36, 26, t) + 'px',
      offset: (i % 2) * 30           // half-slot stagger for packing
    };
  }

  function hexToRgb(hex) {
    const num = parseInt(hex.replace('#', ''), 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }
  function rgbToHex(rgb) {
    return '#' + rgb.map(x => {
      const s = Math.round(clamp(x, 0, 255)).toString(16);
      return s.length === 1 ? '0' + s : s;
    }).join('');
  }
  function lerpColor(c1, c2, t) {
    const a = hexToRgb(c1);
    const b = hexToRgb(c2);
    return rgbToHex([lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]);
  }

  // Coloration progression across whorls: 0 (outer calyx sepals) to 5 (tender core)
  function lotusPalette(wi) {
    const t = wi / (N - 1);
    const isOuter = wi <= 1;
    return {
      // Front (adaxial) inner velvety face
      claw:     isOuter ? '#D8EED5' : lerpColor('#E5F5E2', '#FFFDF8', t), // pale jade celadon claw base
      clawMid:  isOuter ? '#EEF8EC' : '#FFFDF9',                          // creamy ivory transition
      body:     '#FFF7FA',                                                // luminous white belly
      blush:    lerpColor('#FBCFE8', '#FCE7F3', t),                       // soft tender rose blush
      rose:     lerpColor('#F43F5E', '#FB7185', t),                       // glowing lotus petal rose
      apex:     lerpColor('#9F1239', '#BE123C', t),                       // deep carmine apex tip
      stroke:   'rgba(244, 114, 182, 0.42)',                              // delicate petal edge

      // Back (abaxial) outer face
      backCalyx: isOuter ? '#C0E2BD' : lerpColor('#D2EBD0', '#F2FAF0', t),
      backMid:   isOuter ? '#EDF8EA' : '#FFFDF9',
      backBlush: '#FCE7F3',
      backRose:  lerpColor('#E11D48', '#FB7185', t),
      backApex:  lerpColor('#881337', '#9F1239', t),
      backKeel:  'rgba(190, 18, 60, 0.32)'
    };
  }

  // --------------------------------------------------------------------------
  // 4. CAMERA RIG — keyframed against bloom, interpolated with smoothstep
  //    tilt: how far we look down into the flower
  //    yaw:  orbit around the vertical axis (sweeps 124deg across the bloom)
  //    dist: dolly push-in and pull-back (scale)
  //    lift: vertical pan, as a share of the rig height
  //    roll: banking along the flight trajectory curve
  // --------------------------------------------------------------------------
  const CAM = [
    { at: 0.00, tilt: 10, yaw: -48, dist: 1.06, lift:  6, roll: -2.5 },
    { at: 0.16, tilt: 15, yaw: -30, dist: 1.02, lift:  3, roll: -1.4 },
    { at: 0.35, tilt: 20, yaw:  -8, dist: 0.98, lift:  0, roll:  0.4 },
    { at: 0.55, tilt: 25, yaw:  18, dist: 1.05, lift: -3, roll:  2.2 },
    { at: 0.72, tilt: 28, yaw:  44, dist: 1.01, lift: -5, roll:  1.6 },
    { at: 0.88, tilt: 31, yaw:  62, dist: 0.96, lift: -6, roll:  0.8 },
    { at: 1.00, tilt: 32, yaw:  76, dist: 0.92, lift: -4, roll:  0.0 }
  ];

  function camAt(b) {
    let i = 0;
    while (i < CAM.length - 2 && b > CAM[i + 1].at) i++;
    const a = CAM[i];
    const c = CAM[i + 1];
    const t = smoothstep(clamp((b - a.at) / (c.at - a.at), 0, 1));
    return {
      tilt: lerp(a.tilt, c.tilt, t),
      yaw:  lerp(a.yaw,  c.yaw,  t),
      dist: lerp(a.dist, c.dist, t),
      lift: lerp(a.lift, c.lift, t),
      roll: lerp(a.roll, c.roll, t)
    };
  }

  // Whorl wi occupies bloom [wi * 0.13, wi * 0.13 + 0.42]
  const WHORL_STEP = 0.13;
  const WHORL_SPAN = 0.42;

  // --------------------------------------------------------------------------
  // 5. BUILD THE POND
  // --------------------------------------------------------------------------
  root.innerHTML = '';

  const pond = el('div', 'atelier-pond');
  pond.id = 'atelierPond';

  // A soft field of rose light rather than a banded waterline — the flower
  // should sit in an atmosphere, not on top of a rectangle.
  const field = el('div', 'pond-field');
  field.setAttribute('aria-hidden', 'true');

  // Background typography: the chapter's own sentence, held so faint it reads
  // as texture and never competes with the bloom in front of it.
  const wordmark = el('div', 'atelier-wordmark');
  wordmark.setAttribute('aria-hidden', 'true');
  wordmark.append(
    el('span', 'wordmark-line wordmark-line-1', 'The Lotus'),
    el('span', 'wordmark-line wordmark-line-2', 'of my Tech Stack')
  );


  const canvas = el('canvas', 'pond-ripples');
  canvas.setAttribute('aria-hidden', 'true');

  const veil = el('div', 'pond-veil');
  veil.setAttribute('aria-hidden', 'true');

  const scaler = el('div', 'lotus-scaler');
  const rig = el('div', 'lotus-rig');
  const world = el('div', 'lotus-world');
  rig.appendChild(world);
  scaler.appendChild(rig);

  const readout = el('div', 'petal-readout');
  readout.setAttribute('aria-hidden', 'true');
  const readoutWhorl = el('span', 'readout-whorl', '');
  const readoutName = el('span', 'readout-name', '');
  readout.append(readoutWhorl, readoutName);

  const idleHint = el('p', 'atelier-idle-hint', 'keep scrolling to open further');
  idleHint.setAttribute('aria-hidden', 'true');

  pond.append(field, wordmark, canvas, scaler, readout, idleHint, veil);

  // Screen-reader roster: the same six whorls and their staples in reading order
  const roster = el('div', 'atelier-sr-roster');
  const rosterList = el('ul');
  REALMS.forEach(realm => {
    const realmTools = allTools.filter(t => t.realmId === realm.id);
    const li = el('li');
    li.appendChild(el('span', '', `Whorl ${realm.seq} — ${realm.title} (${realm.discipline}). ${realm.philosophy} ${realmTools.length} instruments in the archive. Curated: `));
    li.appendChild(el('span', '', realm.staples.map(s => s.name).join(', ') + '.'));
    rosterList.appendChild(li);
  });
  roster.appendChild(rosterList);
  pond.appendChild(roster);

  root.appendChild(pond);

  // ---- the petals: one per curated staple, six per whorl -------------------
  const petals = [];

  REALMS.forEach((realm, wi) => {
    const g = geom(wi);
    const pal = lotusPalette(wi);

    realm.staples.forEach((staple, pi) => {
      const resolved = resolveBrand(staple.name, staple.mark);
      const angle = g.offset + pi * (360 / realm.staples.length);

      const petal = el('div', 'petal');
      petal.title = `${staple.name} — ${realm.title}`;
      // A petal is a pointer affordance: the roster below carries its content
      // for screen readers, and the archive modal carries its function.
      petal.setAttribute('aria-hidden', 'true');
      petal.style.setProperty('--w', `${g.w}px`);
      petal.style.setProperty('--h', `${g.h}px`);
      petal.style.setProperty('--a', `${angle}deg`);
      petal.style.setProperty('--lift', `${g.lift}px`);
      petal.style.setProperty('--rad', `${g.radClosed}px`);
      petal.style.setProperty('--shingle', `${g.shingle}deg`);
      petal.style.setProperty('--unfurl', `${g.closed}deg`);
      petal.style.setProperty('--badge-t', g.badgeT);
      petal.style.setProperty('--badge-s', g.badgeS);

      const gid = `pg-${wi}-${pi}`;
      const shid = `psh-${wi}-${pi}`;
      const bgid = `pbg-${wi}-${pi}`;
      const bsh = `pbsh-${wi}-${pi}`;

      // 1. FRONT FACE — inner velvety surface, fine veins, delicate blush, sticker
      const front = el('div', 'petal-face petal-front');
      front.innerHTML =
        '<svg viewBox="0 0 100 264" preserveAspectRatio="none" aria-hidden="true">' +
          '<defs>' +
            `<linearGradient id="${gid}" x1="0" y1="1" x2="0" y2="0">` +
              `<stop offset="0%" stop-color="${pal.claw}"/>` +
              `<stop offset="12%" stop-color="${pal.clawMid}"/>` +
              `<stop offset="34%" stop-color="${pal.body}"/>` +
              `<stop offset="62%" stop-color="${pal.blush}"/>` +
              `<stop offset="84%" stop-color="${pal.rose}"/>` +
              `<stop offset="100%" stop-color="${pal.apex}"/>` +
            '</linearGradient>' +
            `<radialGradient id="${shid}" cx="50%" cy="54%" r="52%">` +
              '<stop offset="0%" stop-color="rgba(255,255,255,0.48)"/>' +
              '<stop offset="55%" stop-color="rgba(255,255,255,0.0)"/>' +
              '<stop offset="82%" stop-color="rgba(244,114,182,0.16)"/>' +
              '<stop offset="100%" stop-color="rgba(190,18,60,0.22)"/>' +
            '</radialGradient>' +
          '</defs>' +
          `<path class="petal-shape" d="${PETAL_PATH}" fill="url(#${gid})" stroke="${pal.stroke}" stroke-width="1.1"/>` +
          `<path d="${PETAL_PATH}" fill="url(#${shid})"/>` +
          '<g class="petal-veins" opacity="0.44">' +
            '<path d="M 50 10 Q 50 135 50 258" stroke="rgba(255,255,255,0.85)" stroke-width="1.1" fill="none"/>' +
            '<path d="M 50 258 Q 36 175 36 95 Q 38 42 50 10" stroke="rgba(255,255,255,0.65)" stroke-width="0.75" fill="none"/>' +
            '<path d="M 50 258 Q 64 175 64 95 Q 62 42 50 10" stroke="rgba(255,255,255,0.65)" stroke-width="0.75" fill="none"/>' +
            '<path d="M 50 258 Q 22 185 18 115 Q 20 58 48 14" stroke="rgba(255,255,255,0.5)" stroke-width="0.6" fill="none"/>' +
            '<path d="M 50 258 Q 78 185 82 115 Q 80 58 52 14" stroke="rgba(255,255,255,0.5)" stroke-width="0.6" fill="none"/>' +
            '<path d="M 50 258 Q 12 195 10 135 Q 12 75 46 22" stroke="rgba(255,230,240,0.38)" stroke-width="0.45" fill="none"/>' +
            '<path d="M 50 258 Q 88 195 90 135 Q 88 75 54 22" stroke="rgba(255,230,240,0.38)" stroke-width="0.45" fill="none"/>' +
          '</g>' +
        '</svg>';

      const badge = el('span', 'petal-badge');
      if (resolved?.isDarkSurface) {
        badge.dataset.logoSurface = 'dark';
      }
      if (resolved?.asset) {
        const img = el('img');
        img.src = resolved.asset;
        img.alt = '';
        img.loading = 'lazy';
        img.decoding = 'async';
        img.addEventListener('error', () => {
          badge.textContent = '';
          badge.appendChild(el('span', 'petal-initials', initials(staple.name)));
        });
        badge.appendChild(img);
      } else {
        badge.appendChild(el('span', 'petal-initials', initials(staple.name)));
      }
      front.appendChild(badge);

      // 2. BACK FACE — outer convex surface with a central keel spine, no sticker
      const back = el('div', 'petal-face petal-back');
      back.innerHTML =
        '<svg viewBox="0 0 100 264" preserveAspectRatio="none" aria-hidden="true">' +
          '<defs>' +
            `<linearGradient id="${bgid}" x1="0" y1="1" x2="0" y2="0">` +
              `<stop offset="0%" stop-color="${pal.backCalyx}"/>` +
              `<stop offset="15%" stop-color="${pal.backMid}"/>` +
              '<stop offset="38%" stop-color="#FFFDF9"/>' +
              `<stop offset="65%" stop-color="${pal.backBlush}"/>` +
              `<stop offset="86%" stop-color="${pal.backRose}"/>` +
              `<stop offset="100%" stop-color="${pal.backApex}"/>` +
            '</linearGradient>' +
            `<linearGradient id="${bsh}" x1="0" y1="0" x2="1" y2="0">` +
              '<stop offset="0%" stop-color="rgba(0,0,0,0.12)"/>' +
              '<stop offset="28%" stop-color="rgba(255,255,255,0.0)"/>' +
              '<stop offset="50%" stop-color="rgba(255,255,255,0.40)"/>' +
              '<stop offset="72%" stop-color="rgba(255,255,255,0.0)"/>' +
              '<stop offset="100%" stop-color="rgba(0,0,0,0.12)"/>' +
            '</linearGradient>' +
          '</defs>' +
          `<path class="petal-shape" d="${PETAL_PATH}" fill="url(#${bgid})" stroke="rgba(255,255,255,0.9)" stroke-width="1.1"/>` +
          `<path d="${PETAL_PATH}" fill="url(#${bsh})"/>` +
          `<path d="M 50 8 Q 50 135 50 260" stroke="${pal.backKeel}" stroke-width="3.2" stroke-linecap="round" fill="none"/>` +
          '<path d="M 50 8 Q 50 135 50 260" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" fill="none" opacity="0.80"/>' +
          '<g opacity="0.28">' +
            '<path d="M 50 258 Q 30 185 28 105 Q 32 50 50 12" stroke="#FFFFFF" stroke-width="0.8" fill="none"/>' +
            '<path d="M 50 258 Q 70 185 72 105 Q 68 50 50 12" stroke="#FFFFFF" stroke-width="0.8" fill="none"/>' +
          '</g>' +
        '</svg>';

      petal.append(front, back);

      petal.addEventListener('pointerenter', () => {
        petal.classList.add('is-hot');
        readoutWhorl.textContent = `WHORL ${realm.seq}`;
        readoutName.textContent = staple.name;
        readout.classList.add('on');
        splash(petal);
      });
      petal.addEventListener('pointerleave', () => {
        petal.classList.remove('is-hot');
        readout.classList.remove('on');
      });
      petal.addEventListener('click', () => {
        openModal(realm.categoryChipId, petal);
      });

      world.appendChild(petal);
      petals.push({
        el: petal,
        wi,
        g,
        baseAngle: angle,
        delay: (pi % 2) * 0.008,              // alternating breathing offset without scissoring
        phase: (wi * 1.7 + pi * 0.9) % 6.283  // per-petal idle flutter offset
      });
    });
  });

  // ---- golden stamen crown: 56 filaments with pale anthers -----------------
  const stamenCrown = el('div', 'stamen-crown');
  const stamens = [];
  const STAMEN_COUNT = 56;

  for (let si = 0; si < STAMEN_COUNT; si++) {
    const sa = si * (360 / STAMEN_COUNT);
    const slen = 28 + (si % 3) * 3;
    const srad = 48 + (si % 2) * 3;

    const stamenEl = el('div', 'stamen');
    stamenEl.style.setProperty('--sa', `${sa.toFixed(1)}deg`);
    stamenEl.style.setProperty('--slen', `${slen}px`);
    stamenEl.style.setProperty('--srad', `${srad}px`);
    stamenEl.style.setProperty('--stilt', '16deg');
    stamenEl.append(el('span', 'stamen-filament'), el('span', 'stamen-anther'));

    stamenCrown.appendChild(stamenEl);
    stamens.push({ el: stamenEl, phase: (si * 1.3) % 6.28 });
  }
  world.appendChild(stamenCrown);

  // ---- the seed receptacle: the door into the archive ----------------------
  const pod = el('button', 'lotus-pod');
  pod.type = 'button';
  pod.setAttribute('aria-label', `Open the full archive — ${allTools.length} instruments`);

  const LOCULE_RINGS = [
    { count: 1, radius: 0 },
    { count: 6, radius: 11 },
    { count: 12, radius: 23 },
    { count: 16, radius: 35 }
  ];

  LOCULE_RINGS.forEach((ring, ringIdx) => {
    for (let li = 0; li < ring.count; li++) {
      const la = (li / ring.count) * Math.PI * 2 + (ringIdx * 0.4);
      const locule = el('span', 'seed-locule');
      locule.style.left = `${(48 + ring.radius * Math.cos(la)).toFixed(1)}px`;
      locule.style.top = `${(48 + ring.radius * Math.sin(la)).toFixed(1)}px`;
      pod.appendChild(locule);
    }
  });

  const podLabel = el('span', 'pod-label', `${allTools.length} INSTRUMENTS · OPEN ARCHIVE`);
  world.append(pod, podLabel);

  const archiveTotalPill = document.getElementById('archiveTotalPill');
  if (archiveTotalPill) {
    archiveTotalPill.textContent = `${allTools.length} Instruments`;
  }

  // --------------------------------------------------------------------------
  // 6. THE BLOOM CONTROLLER
  //    Scroll is the only thing that moves this camera. The chapter's pinned
  //    progress sets the target; a local rAF eases toward it and layers on the
  //    idle breathing and the water. The cursor never steers the flower.
  // --------------------------------------------------------------------------
  // Progress [0, 1] maps onto bloom with a beat of stillness on arrival, then
  // hands the last stretch of the chapter over to the dive into the flower.
  const BLOOM_IN = 0.04;
  const BLOOM_OUT = 0.80;

  // The dive: the camera falls into the open receptacle and the chapter goes
  // with it, which is the handoff into the next one.
  const DIVE_IN = 0.84;

  let targetBloom = 0;
  let bloom = 0;
  let dive = 0;               // 0 = flower held, 1 = fully inside it
  let idle = 0;               // 0 = actively scrolling, 1 = fully settled
  let lastInput = performance.now();
  let activeWhorl = -1;
  let podIsReachable = null;

  function whorlProgress(p, b) {
    return clamp((b - (p.wi * WHORL_STEP + p.delay)) / WHORL_SPAN, 0, 1);
  }

  // Coarse fit: the petals are laid out in px, so this brings the whole
  // sculpture into the right order of magnitude for the pinned stage's box.
  // An open flower reaches ~298px from its axis (outer petal 264 + base 34).
  function fitScale() {
    const h = pond.clientHeight;
    const w = pond.clientWidth;
    if (!h || !w) return;
    const scale = clamp(Math.min(h / 640, w / 740), 0.42, 1.0);
    scaler.style.setProperty('--atelier-scale', scale.toFixed(3));
  }

  // ---- auto-dolly ----------------------------------------------------------
  // A closed bud and an open flower differ threefold in size, and the stage's
  // height depends on the viewport, so the camera corrects itself against what
  // the petals actually cover instead of against numbers tuned for one screen.
  // The prototype's dist/lift keyframes stay: this only trims the residual.
  // Every whorl is measured, not just the outer one — mid-bloom the outer ring
  // has already tipped outward while the inner ones are still standing tall.
  const FIT_NODES = petals.map(p => p.el);

  // The flower is still meant to feel like it is growing, so the share of the
  // stage it is allowed to claim opens with it — a bud sits small in the pond,
  // a full bloom nearly fills it — while never being let over the edge.
  const FILL_BUD = 0.54;
  const FILL_OPEN = 0.88;
  let paintedBloom = 0;
  let fitDist = 1, fitDistTarget = 1;
  let fitLift = 0, fitLiftTarget = 0;
  let fitPrimed = false;
  let nextMeasure = 0;

  function measureFrame(now) {
    // The dive deliberately blows the flower past the edges of the stage. The
    // fit reads those same rects, so leaving it running would have it quietly
    // shrinking the bloom back down against the very motion it is there for.
    if (dive > 0) return;
    if (now < nextMeasure) return;
    nextMeasure = now + 120;

    const pr = pond.getBoundingClientRect();
    if (!pr.height) return;

    let top = Infinity;
    let bottom = -Infinity;
    let left = Infinity;
    let right = -Infinity;
    for (const node of FIT_NODES) {
      const r = node.getBoundingClientRect();
      if (r.top < top) top = r.top;
      if (r.bottom > bottom) bottom = r.bottom;
      if (r.left < left) left = r.left;
      if (r.right > right) right = r.right;
    }
    const spreadY = bottom - top;
    const spreadX = right - left;
    if (!(spreadY > 1) || !(spreadX > 1)) return;

    // An open flower is wider than it is tall, so on a narrow stage width is
    // the binding constraint; whichever axis is tighter sets the dolly.
    const fill = lerp(FILL_BUD, FILL_OPEN, smoothstep(clamp(paintedBloom / 0.45, 0, 1)));
    const room = Math.min(pr.height * fill / spreadY, pr.width * (fill + 0.06) / spreadX);
    fitDistTarget = clamp(fitDist * room, 0.55, 3.4);
    // Residual vertical centring, carried as a share of the rig height
    const drift = ((top + bottom) / 2 - (pr.top + pr.height / 2)) / rig.offsetHeight;
    fitLiftTarget = clamp(fitLift - drift * 100, -22, 22);

    // The very first reading is an acquisition, not a correction: land on it
    // so the chapter is never seen zooming itself into frame.
    if (!fitPrimed) {
      fitPrimed = true;
      fitDist = fitDistTarget;
      fitLift = fitLiftTarget;
    }
  }

  // The engine calls this from the shared scroll rAF. Scroll is the whole
  // input: one number in, the entire chapter out.
  function render(progress) {
    const nextBloom = clamp((progress - BLOOM_IN) / (BLOOM_OUT - BLOOM_IN), 0, 1);
    const nextDive = clamp((progress - DIVE_IN) / (1 - DIVE_IN), 0, 1);

    if (Math.abs(nextBloom - targetBloom) > 0.0005 || Math.abs(nextDive - dive) > 0.0005) {
      lastInput = performance.now();
    }
    targetBloom = nextBloom;
    dive = nextDive;

    if (reduced) {
      // No loop is running, so the bloom lands on the new value directly and
      // the auto-dolly resolves over the two paints it takes to converge.
      bloom = targetBloom;
      const now = performance.now();
      paint(now / 1000, bloom);
      nextMeasure = 0;
      fitPrimed = false;
      measureFrame(now);
      paint(now / 1000, bloom);
    }
  }

  pod.addEventListener('click', () => {
    openModal('all', pod);
  });

  // ---- the water -----------------------------------------------------------
  const ctx = canvas.getContext('2d');
  let rings = [];
  let nextAmbient = 0;

  function fitCanvas() {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(r.width * dpr));
    canvas.height = Math.max(1, Math.round(r.height * dpr));
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function pushRing(x, y, r) {
    rings.push({ x, y, r, life: 1 });
    if (rings.length > 16) rings.shift();
  }

  function splash(node) {
    if (reduced) return;
    const pr = pond.getBoundingClientRect();
    const br = node.getBoundingClientRect();
    pushRing(br.left + br.width / 2 - pr.left, br.top + br.height / 2 - pr.top, 6);
  }

  function drawRipples(t) {
    if (!ctx) return;
    // While idle, the pond rings on its own every few seconds
    if (idle > 0.5 && t > nextAmbient) {
      const pr = pond.getBoundingClientRect();
      pushRing(pr.width * (0.3 + Math.random() * 0.4), pr.height * (0.55 + Math.random() * 0.3), 3);
      nextAmbient = t + 2.2 + Math.random() * 2.4;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    rings = rings.filter(r => r.life > 0);
    for (const r of rings) {
      r.r += 1.7;
      r.life -= 0.012;
      ctx.beginPath();
      ctx.ellipse(r.x, r.y, r.r, r.r * 0.34, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(251,113,133,${(r.life * 0.32).toFixed(3)})`;
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
  }

  // ---- paint one frame at a given bloom ------------------------------------
  function paint(t, b) {
    paintedBloom = b;
    const cam = camAt(b);

    // Compound aquatic wave kinematics (buoyancy heave, pitch, roll, yaw drift)
    const waveHeave = Math.sin(t * 0.72) * 1.8 * idle;
    const wavePitch = Math.sin(t * 0.58 + 0.9) * 1.4 * idle;
    const waveRoll = Math.cos(t * 0.44 + 1.7) * 1.2 * idle;
    const waveYaw = Math.sin(t * 0.31) * 3.4 * idle;

    const totalRoll = cam.roll + waveRoll;
    const totalTilt = clamp(cam.tilt + wavePitch, 10, 32);
    const totalYaw = cam.yaw + waveYaw;
    const totalDist = cam.dist * fitDist * (1 + 0.006 * Math.sin(t * 0.27) * idle);
    const totalLift = cam.lift + fitLift + waveHeave * 0.4;

    rig.style.transform =
      `translate3d(0, ${totalLift.toFixed(2)}%, 0) ` +
      `scale(${totalDist.toFixed(4)}) rotateZ(${totalRoll.toFixed(2)}deg)`;

    world.style.transform =
      `rotateX(${totalTilt.toFixed(2)}deg) rotateZ(${totalYaw.toFixed(2)}deg)`;
    world.style.setProperty('--tilt-undo', `${(-totalTilt).toFixed(2)}deg`);
    world.style.setProperty('--yaw-undo', `${(-totalYaw).toFixed(2)}deg`);

    // ---- the dive out of the chapter ----
    // The camera falls into the open receptacle: each layer swells at its own
    // rate, so the flower rushes at the camera while the wordmark barely
    // drifts, and the scene dissolves as the stage unpins into the next one.
    // Set on the stage, not the pond, so the header goes with the flower
    // instead of hanging there while the chapter falls away beneath it.
    const rush = dive * dive;                       // accelerating, not linear
    const veil = 1 - smoothstep(clamp((dive - 0.18) / 0.72, 0, 1));
    stage.style.setProperty('--dive-bloom', (1 + rush * 3.4).toFixed(4));
    stage.style.setProperty('--dive-field', (1 + rush * 1.5).toFixed(4));
    stage.style.setProperty('--dive-mark', (1 + rush * 0.55).toFixed(4));
    stage.style.setProperty('--dive-veil', veil.toFixed(3));

    // ---- petals ----
    let active = 0;
    for (const p of petals) {
      const raw = whorlProgress(p, b);
      const prog = easeOutBack(raw);

      // Idle flutter: a petal that has opened sways a little on its own
      const flut = Math.sin(t * 0.85 + p.phase) * 1.7 * idle * raw;
      const twist = Math.sin(t * 0.61 + p.phase * 1.3) * 1.2 * idle * raw;

      p.el.style.setProperty('--unfurl', `${(lerp(p.g.closed, p.g.open, prog) + flut).toFixed(2)}deg`);
      p.el.style.setProperty('--rad', `${lerp(p.g.radClosed, p.g.radOpen, prog).toFixed(2)}px`);
      p.el.style.setProperty('--shingle', `${lerp(p.g.shingle, 0, prog).toFixed(2)}deg`);
      p.el.style.setProperty('--a', `${(p.baseAngle + twist).toFixed(2)}deg`);
      if (raw > 0.25) active = p.wi;
    }

    if (active !== activeWhorl) {
      activeWhorl = active;
      for (const p of petals) {
        p.el.classList.toggle('is-live', p.wi === active);
      }
    }

    // ---- stamens & seed receptacle ----
    const lastProg = whorlProgress(petals[petals.length - 1], b);
    const podReveal = clamp((b - 0.24) / 0.32, 0, 1);
    const stamenProg = clamp((b - 0.18) / 0.44, 0, 1);

    const sTilt = lerp(12, 52, easeOutBack(stamenProg));
    stamenCrown.style.setProperty('--stamen-lift', lerp(12, 24 + 42 * lastProg, stamenProg).toFixed(1) + 'px');
    stamenCrown.style.opacity = clamp((b - 0.12) / 0.22, 0, 1).toFixed(3);

    for (const s of stamens) {
      const sWave = Math.sin(t * 1.3 + s.phase) * 2.4 * idle * stamenProg;
      s.el.style.setProperty('--stilt', `${(sTilt + sWave).toFixed(1)}deg`);
    }

    pod.style.setProperty('--pod-lift', `${(16 + 46 * lastProg).toFixed(1)}px`);
    pod.style.setProperty('--pod-scale',
      ((0.45 + 0.55 * podReveal) * (1 + 0.035 * Math.sin(t * 1.1) * idle)).toFixed(4));
    pod.style.opacity = podReveal.toFixed(3);

    // The receptacle only becomes clickable and tabbable once it has actually
    // risen out of the flower; flipped on the edge, not written every frame.
    const podOpen = podReveal > 0.5;
    if (podOpen !== podIsReachable) {
      podIsReachable = podOpen;
      pod.style.pointerEvents = podOpen ? 'auto' : 'none';
      pod.tabIndex = podOpen ? 0 : -1;
    }

    // The whisper only appears mid-bloom, where there is still something to open
    idleHint.classList.toggle('on', idle > 0.6 && b > 0.08 && b < 0.92);
  }

  // ---- render loop ---------------------------------------------------------
  // Per-frame lerp factors are written for 60fps, then corrected for the real
  // frame time — otherwise the piece runs at a different speed on a 120Hz
  // display than it does in a throttled tab.
  const damp = (rate, dt) => 1 - Math.pow(1 - rate, dt * 60);

  let rafId = 0;
  let running = false;
  let prevNow = performance.now();

  function frame(now) {
    const t = now / 1000;
    const dt = Math.min((now - prevNow) / 1000, 0.1);   // clamp after a tab-switch stall
    prevNow = now;

    bloom += (targetBloom - bloom) * damp(0.16, dt);

    // Idle ramps in over ~1.5s after the last input, and out fast when it resumes
    const wantIdle = (now - lastInput > 700) ? 1 : 0;
    idle += (wantIdle - idle) * damp(wantIdle ? 0.018 : 0.12, dt);

    fitDist += (fitDistTarget - fitDist) * damp(0.22, dt);
    fitLift += (fitLiftTarget - fitLift) * damp(0.22, dt);

    // Idle breathing nudges the bloom itself, so the petals keep living
    paint(t, clamp(bloom + Math.sin(t * 0.55) * 0.014 * idle, 0, 1));
    measureFrame(now);
    drawRipples(t);

    rafId = requestAnimationFrame(frame);
  }

  function startLoop() {
    if (running || reduced) return;
    running = true;
    prevNow = performance.now();
    rafId = requestAnimationFrame(frame);
  }

  function stopLoop() {
    if (!running) return;
    running = false;
    cancelAnimationFrame(rafId);
  }

  // The flower only animates while its chapter is anywhere near the viewport
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      entries.forEach(entry => (entry.isIntersecting ? startLoop() : stopLoop()));
    }, { rootMargin: '25% 0px' }).observe(section);
  } else {
    startLoop();
  }

  window.addEventListener('resize', () => {
    fitCanvas();
    fitScale();
    // Re-acquire the framing against the new stage box on the next paint
    nextMeasure = 0;
    fitPrimed = false;
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopLoop();
    } else {
      lastInput = performance.now();
      startLoop();
    }
  });

  fitCanvas();
  fitScale();
  paint(performance.now() / 1000, 0);

  // Expose to the scrollytelling engine
  window.LotusAtelier = { render };

  // --------------------------------------------------------------------------
  // 8. SERENE BOTANICAL ARCHIVE MODAL ENGINE
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

  let activeCategory = 'all';
  let searchQuery = '';
  let lastFocusedElement = null;
  let isClosing = false;

  function openModal(presetCategory = 'all', triggerElement = null) {
    if (!modalBackdrop || isClosing) return;
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
    if (!modalBackdrop || !modalBackdrop.classList.contains('active') || isClosing) return;
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

  if (!modalBackdrop) return;

  const filterChips = [
    { id: 'all', label: 'All', count: allTools.length }
  ];

  REALMS.forEach(r => {
    filterChips.push({
      id: r.categoryChipId,
      label: r.categoryChipLabel,
      count: allTools.filter(t => t.realmCategoryChipId === r.categoryChipId).length
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
    filterChipsContainer.querySelectorAll('.botanical-chip').forEach(btn => {
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

      const { box, resolved } = createBrandElement(item.name, item.mark, 18);
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

  if (openArchiveBtn) {
    openArchiveBtn.addEventListener('click', () => openModal('all', openArchiveBtn));
  }

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
