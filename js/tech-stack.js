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

  // ---- petal faces, drawn once per whorl -----------------------------------
  // Every petal in a whorl carries the same two faces; only the badge on the
  // front differs, and that sits on top as its own element. Held as live SVG,
  // all 72 faces were re-rasterised from their paths and gradients on every
  // frame the bloom moved -- roughly 650 gradient-filled beziers, measured as
  // the single largest cost in the chapter. Drawn once per whorl and handed
  // over as an image, the same flower costs 12 decoded bitmaps that the
  // compositor only resamples.
  const VEINS_FRONT =
    '<g opacity="0.30">' +
      '<path d="M 50 10 Q 50 135 50 258" stroke="rgba(255,255,255,0.80)" stroke-width="0.9" fill="none"/>' +
      '<path d="M 50 258 Q 36 175 36 95 Q 38 42 50 10" stroke="rgba(255,255,255,0.55)" stroke-width="0.6" fill="none"/>' +
      '<path d="M 50 258 Q 64 175 64 95 Q 62 42 50 10" stroke="rgba(255,255,255,0.55)" stroke-width="0.6" fill="none"/>' +
      '<path d="M 50 258 Q 22 185 18 115 Q 20 58 48 14" stroke="rgba(255,255,255,0.42)" stroke-width="0.5" fill="none"/>' +
      '<path d="M 50 258 Q 78 185 82 115 Q 80 58 52 14" stroke="rgba(255,255,255,0.42)" stroke-width="0.5" fill="none"/>' +
      '<path d="M 50 258 Q 12 195 10 135 Q 12 75 46 22" stroke="rgba(255,230,240,0.30)" stroke-width="0.38" fill="none"/>' +
      '<path d="M 50 258 Q 88 195 90 135 Q 88 75 54 22" stroke="rgba(255,230,240,0.30)" stroke-width="0.38" fill="none"/>' +
    '</g>';

  const SVG_OPEN =
    '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="264" ' +
    'viewBox="0 0 100 264" preserveAspectRatio="none">';

  // FRONT FACE — inner velvety surface, fine veins, delicate blush
  function frontFaceSvg(pal) {
    return SVG_OPEN +
      '<defs>' +
        '<linearGradient id="g" x1="0" y1="1" x2="0" y2="0">' +
          '<stop offset="0%" stop-color="' + pal.claw + '"/>' +
          '<stop offset="14%" stop-color="' + pal.clawMid + '"/>' +
          '<stop offset="36%" stop-color="' + pal.body + '"/>' +
          '<stop offset="64%" stop-color="' + pal.blush + '"/>' +
          '<stop offset="85%" stop-color="' + pal.rose + '"/>' +
          '<stop offset="100%" stop-color="' + pal.apex + '"/>' +
        '</linearGradient>' +
        '<radialGradient id="s" cx="50%" cy="52%" r="56%">' +
          '<stop offset="0%" stop-color="rgba(255,255,255,0.28)"/>' +
          '<stop offset="58%" stop-color="rgba(255,255,255,0.0)"/>' +
          '<stop offset="85%" stop-color="rgba(244,114,182,0.10)"/>' +
          '<stop offset="100%" stop-color="rgba(225,29,72,0.08)"/>' +
        '</radialGradient>' +
      '</defs>' +
      '<path d="' + PETAL_PATH + '" fill="url(#g)" stroke="' + pal.stroke + '" stroke-width="0.85"/>' +
      '<path d="' + PETAL_PATH + '" fill="url(#s)"/>' +
      VEINS_FRONT +
    '</svg>';
  }

  // BACK FACE — outer convex surface with a central keel spine, no sticker
  function backFaceSvg(pal) {
    return SVG_OPEN +
      '<defs>' +
        '<linearGradient id="g" x1="0" y1="1" x2="0" y2="0">' +
          '<stop offset="0%" stop-color="' + pal.backCalyx + '"/>' +
          '<stop offset="15%" stop-color="' + pal.backMid + '"/>' +
          '<stop offset="38%" stop-color="#FFFDF9"/>' +
          '<stop offset="65%" stop-color="' + pal.backBlush + '"/>' +
          '<stop offset="86%" stop-color="' + pal.backRose + '"/>' +
          '<stop offset="100%" stop-color="' + pal.backApex + '"/>' +
        '</linearGradient>' +
        '<linearGradient id="s" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0%" stop-color="rgba(190,18,60,0.04)"/>' +
          '<stop offset="30%" stop-color="rgba(255,255,255,0.0)"/>' +
          '<stop offset="50%" stop-color="rgba(255,255,255,0.22)"/>' +
          '<stop offset="70%" stop-color="rgba(255,255,255,0.0)"/>' +
          '<stop offset="100%" stop-color="rgba(190,18,60,0.04)"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<path d="' + PETAL_PATH + '" fill="url(#g)" stroke="rgba(255,255,255,0.75)" stroke-width="0.85"/>' +
      '<path d="' + PETAL_PATH + '" fill="url(#s)"/>' +
      '<path d="M 50 8 Q 50 135 50 260" stroke="' + pal.backKeel + '" stroke-width="1.8" stroke-linecap="round" fill="none"/>' +
      '<path d="M 50 8 Q 50 135 50 260" stroke="#FFFFFF" stroke-width="1.0" stroke-linecap="round" fill="none" opacity="0.60"/>' +
      '<g opacity="0.22">' +
        '<path d="M 50 258 Q 30 185 28 105 Q 32 50 50 12" stroke="#FFFFFF" stroke-width="0.6" fill="none"/>' +
        '<path d="M 50 258 Q 70 185 72 105 Q 68 50 50 12" stroke="#FFFFFF" stroke-width="0.6" fill="none"/>' +
      '</g>' +
    '</svg>';
  }

  // One entry per whorl, shared by every petal in it.
  const faceArt = [];
  function whorlFaceArt(wi, pal) {
    if (!faceArt[wi]) {
      faceArt[wi] = {
        front: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(frontFaceSvg(pal)),
        back: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(backFaceSvg(pal))
      };
    }
    return faceArt[wi];
  }
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

  // Smooth, silky coloration progression across whorls: 0 (outer calyx) to 5 (tender core)
  function lotusPalette(wi) {
    const t = wi / (N - 1);
    return {
      // Front (adaxial) inner velvety face
      claw:     lerpColor('#DCEDD8', '#FFFDF9', t), // soft celadon pearl gently warming to ivory
      clawMid:  lerpColor('#EFF8ED', '#FFFEFA', t), // seamless creamy silk transition
      body:     '#FFF9FB',                          // luminous warm porcelain white
      blush:    lerpColor('#FCE7F3', '#FDF2F8', t), // tender diffuse blush
      rose:     lerpColor('#F472B6', '#FB7185', t), // glowing petal rose
      apex:     lerpColor('#E11D48', '#F43F5E', t), // luminous warm rose kiss (no muddy dark maroon)
      stroke:   'rgba(244, 114, 182, 0.26)',        // delicate petal edge

      // Back (abaxial) outer face
      backCalyx: lerpColor('#CFE5CB', '#F4FAF1', t), // gentle outer calyx base
      backMid:   lerpColor('#EFF8ED', '#FFFEFA', t),
      backBlush: lerpColor('#FCE7F3', '#FDF2F8', t),
      backRose:  lerpColor('#F472B6', '#FB7185', t),
      backApex:  lerpColor('#E11D48', '#F43F5E', t),
      backKeel:  'rgba(225, 29, 72, 0.16)'
    };
  }

  // --------------------------------------------------------------------------
  // 4. CAMERA RIG — simplified serene tilt progression across bloom
  //    tilt: smooth monotonic pitch down into the flower (14° bud -> 28° bloom)
  //    yaw:  subtle, serene spin across bloom (-14° bud -> 0° mid -> +14° bloom)
  //    dist: rock-solid distance (1.00), eliminating zoom-in/out oscillation
  //    lift: centered vertically (0), eliminating bobbing
  //    roll: level horizon (0°), eliminating banking
  // --------------------------------------------------------------------------
  const CAM = [
    { at: 0.00, tilt: 14, yaw: -14, dist: 1.00, lift: 0, roll: 0 },
    { at: 0.50, tilt: 21, yaw:   0, dist: 1.00, lift: 0, roll: 0 },
    { at: 1.00, tilt: 28, yaw:  14, dist: 1.00, lift: 0, roll: 0 }
  ];

  function camAt(b) {
    let i = 0;
    while (i < CAM.length - 2 && b > CAM[i + 1].at) i++;
    const a = CAM[i];
    const c = CAM[i + 1];
    const t = clamp((b - a.at) / (c.at - a.at), 0, 1);
    // Shared tangents keep velocity continuous across keyframes with zero
    // velocity boundary conditions at bud (b=0) and full bloom (b=1).
    function slope(index, key) {
      if (index === 0 || index === CAM.length - 1) return 0;
      const left = CAM[index - 1];
      const point = CAM[index];
      const right = CAM[index + 1];
      const before = (point[key] - left[key]) / (point.at - left.at);
      const after = (right[key] - point[key]) / (right.at - point.at);
      return before * after <= 0 ? 0 : 2 * before * after / (before + after);
    }
    function curve(key) {
      const span = c.at - a.at;
      const t2 = t * t, t3 = t2 * t;
      return (2 * t3 - 3 * t2 + 1) * a[key]
        + (t3 - 2 * t2 + t) * span * slope(i, key)
        + (-2 * t3 + 3 * t2) * c[key]
        + (t3 - t2) * span * slope(i + 1, key);
    }
    return {
      tilt: curve('tilt'),
      yaw: curve('yaw'),
      dist: curve('dist'),
      lift: curve('lift'),
      roll: curve('roll')
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

  pond.append(field, wordmark, scaler, readout, idleHint, veil);

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

  // --------------------------------------------------------------------------
  // 5b. OVERFLOW SCATTER — NON-CURATED TOOLS
  //     The 56 tools not on petals are "spit out" as tiny glassmorphic pills
  //     scattered beautifully around the lotus. They appear as bloom opens.
  // --------------------------------------------------------------------------
  const stapleNames = new Set();
  REALMS.forEach(r => r.staples.forEach(s => stapleNames.add(s.name)));
  const overflowTools = allTools.filter(t => !stapleNames.has(t.name));

  const scatterContainer = el('div', 'atelier-scatter');
  scatterContainer.setAttribute('aria-hidden', 'true');

  const scatterPills = [];

  // A stable pseudo-random seed gives us an organic layout without doing any
  // random work during scroll. Positions are generated once, then kept in
  // four narrow perimeter bands so the lotus always owns the centre.
  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0) / 4294967295;
  }

  // Map each overflow tool to its whorl index (0–5) for progressive reveal
  const realmOrder = REALMS.map(r => r.id);

  overflowTools.forEach((tool, i) => {
    const pill = el('div', 'scatter-pill');
    pill.title = tool.name;

    // Brand icon or monogram
    const iconBox = el('span', 'scatter-pill-icon');
    const resolved = resolveBrand(tool.name, tool.mark);
    if (resolved?.asset) {
      const img = el('img');
      img.src = resolved.asset;
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      iconBox.appendChild(img);
    } else {
      iconBox.appendChild(el('span', 'scatter-pill-mono', initials(tool.name)));
    }

    const label = el('span', '', tool.name);
    pill.append(iconBox, label);

    // Which whorl does this tool belong to? That determines when it appears.
    const wi = Math.max(0, realmOrder.indexOf(tool.realmId));

    // Position is assigned by layoutScatter() once the pill has been measured;
    // its label width is not knowable until it is in the document.
    scatterContainer.appendChild(pill);
    scatterPills.push({ el: pill, whorl: wi, revealIndex: i });
  });

  pond.appendChild(scatterContainer);

  // --------------------------------------------------------------------------
  // 5c. SCATTER PLACEMENT
  //
  // Pills are placed from their measured boxes, not from percentages. The
  // labels run from "C" to "axe-playwright (A11y)", so any scheme that spaces
  // them in percent overlaps the long ones and strands the short ones — which
  // is exactly what the old four-band perimeter did. It also only ever
  // compared a pill against others on its own band, so the corners collided,
  // and it knew nothing about the chapter's own furniture.
  //
  // Each pill now takes a preferred bearing from a stable hash and is pushed
  // outward ring by ring until it finds a box that touches nothing already
  // placed, nor the flower, nor the HUD, nor the edge of the stage. Same seed
  // every load, so the arrangement is stable, and no pair can overlap because
  // every candidate is tested against every box already taken.
  // --------------------------------------------------------------------------
  const SCATTER_PAD = 14;   // clearance from the edge of the stage
  const SCATTER_GAP = 10;   // clearance between two pills
  const SCATTER_STEPS = 24; // bearings tried per ring

  function rectsOverlap(a, b, gap) {
    return a.x - gap < b.x + b.w && a.x + a.w + gap > b.x &&
           a.y - gap < b.y + b.h && a.y + a.h + gap > b.y;
  }

  function rectHitsCircle(r, cx, cy, rad) {
    const nx = Math.max(r.x, Math.min(cx, r.x + r.w));
    const ny = Math.max(r.y, Math.min(cy, r.y + r.h));
    const dx = nx - cx, dy = ny - cy;
    return dx * dx + dy * dy < rad * rad;
  }

  // Boxes owned by the chapter's furniture, measured live so they track their
  // own clamp()ed positions rather than being guessed at.
  function scatterKeepOuts(W, H) {
    const pr = pond.getBoundingClientRect();
    const out = [];

    ['#atelierProgressPill', '.atelier-stage-rail'].forEach(sel => {
      const node = document.querySelector(sel);
      if (!node) return;
      const r = node.getBoundingClientRect();
      if (!r.width || !r.height) return;
      out.push({ x: r.left - pr.left, y: r.top - pr.top, w: r.width, h: r.height });
    });

    // The chapter rail is position:fixed, so its offset from the pond depends
    // on where the page happens to be scrolled. Only its width is stable —
    // reserve that as a full-height column instead of a box that would land
    // somewhere arbitrary when this runs with the chapter off screen.
    const hud = document.querySelector('.scrolly-hud');
    if (hud) {
      const hr = hud.getBoundingClientRect();
      if (hr.width) out.push({ x: W - hr.width - 26, y: 0, w: hr.width + 26, h: H });
    }
    return out;
  }

  function layoutScatter() {
    const W = pond.clientWidth, H = pond.clientHeight;
    if (!W || !H || !scatterPills.length) return;
    // Hidden below 720px, where the lotus owns the whole frame.
    if (!scatterPills[0].el.offsetWidth) return;

    const cx = W / 2, cy = H / 2;
    // The open flower reaches ~300px from its axis before fitScale shrinks it.
    // Reusing that formula keeps the keep-out honest on every viewport.
    const s = clamp(Math.min(H / 640, W / 740), 0.42, 1.0);
    const bloomR = 300 * s + 52;

    const keepOuts = scatterKeepOuts(W, H);
    const placed = [];

    for (const sp of scatterPills) {
      const node = sp.el;
      node.style.display = '';
      const w = node.offsetWidth, h = node.offsetHeight;
      if (!w || !h) continue;

      const bearing = hashStr(`${sp.revealIndex}:${node.title}:bearing`) * Math.PI * 2;
      let seated = false;

      for (let ring = 0; ring < 30 && !seated; ring++) {
        const rad = bloomR + ring * 24;
        for (let k = 0; k < SCATTER_STEPS && !seated; k++) {
          // Sweep out from the preferred bearing, alternating sides, so a pill
          // keeps roughly the direction its hash asked for but will take the
          // whole ring rather than fail.
          const step = k === 0 ? 0
            : (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (Math.PI * 2 / SCATTER_STEPS);
          const a = bearing + step;
          // Stages are landscape and the room either side of the flower is
          // where the pills actually fit, so the ring is wider than it is tall.
          const x = cx + Math.cos(a) * rad * 1.22 - w / 2;
          const y = cy + Math.sin(a) * rad - h / 2;
          const rect = { x, y, w, h };

          if (x < SCATTER_PAD || y < SCATTER_PAD ||
              x + w > W - SCATTER_PAD || y + h > H - SCATTER_PAD) continue;
          if (rectHitsCircle(rect, cx, cy, bloomR)) continue;
          if (keepOuts.some(b => rectsOverlap(rect, b, 8))) continue;
          if (placed.some(b => rectsOverlap(rect, b, SCATTER_GAP))) continue;

          node.style.left = x.toFixed(1) + 'px';
          node.style.top = y.toFixed(1) + 'px';
          node.style.setProperty('--scatter-x', '0px');
          node.style.setProperty('--scatter-y', '0px');
          placed.push(rect);
          seated = true;
        }
      }

      // Nowhere clear on this viewport. Absent reads better than overlapping.
      if (!seated) node.style.display = 'none';
    }
  }

  layoutScatter();
  if (document.fonts && document.fonts.ready) {
    // Label widths depend on the mono face; placing before it lands would pack
    // against the fallback's metrics and leave gaps or overlaps behind.
    document.fonts.ready.then(layoutScatter);
  }

  // Drive scatter visibility from bloom progress — each pill appears
  // when its whorl's bloom window is active, creating a progressive reveal
  // that tracks the opening of the flower.
  let lastScatterV = -1;
  function updateScatter(bloom) {
    if (Math.abs(bloom - lastScatterV) < 0.003) return;
    lastScatterV = bloom;
    for (const sp of scatterPills) {
      // Each whorl owns a longer reveal window. The small rank offset means
      // its entries breathe in one at a time instead of arriving as a wall of
      // labels, while the flower is still the only thing in the centre.
      const whorlStart = 0.06 + sp.whorl * 0.105;
      const whorlSpan = 0.28;
      const whorlProgress = clamp((bloom - whorlStart) / whorlSpan, 0, 1);
      const rankOffset = (sp.revealIndex % 10) / 10 * 0.58;
      const pillV = clamp((whorlProgress - rankOffset) / 0.42, 0, 1);
      const visible = pillV > 0.01;
      sp.el.classList.toggle('is-visible', visible);
      sp.el.style.setProperty('--scatter-in', smoothstep(pillV).toFixed(3));
    }
  }

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

      const art = whorlFaceArt(wi, pal);

      const front = el('div', 'petal-face petal-front');
      front.style.backgroundImage = 'url("' + art.front + '")';

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

      const back = el('div', 'petal-face petal-back');
      back.style.backgroundImage = 'url("' + art.back + '")';

      petal.append(front, back);

      petal.addEventListener('pointerenter', () => {
        petal.classList.add('is-hot');
        readoutWhorl.textContent = `WHORL ${realm.seq}`;
        readoutName.textContent = staple.name;
        readout.classList.add('on');
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

  // An SVG image is still vector art: the compositor re-runs its paths and
  // gradients whenever the petal lands on a scale it has not drawn before, and
  // the dive walks the flower through every scale between 1x and 13x. Baking
  // each whorl's two faces down to a bitmap once turns the rest of the chapter
  // into texture resampling. 2x covers the flower at its largest resting size
  // on a retina display; past that it is under the dive's white wash anyway.
  function bakeFaceArt() {
    // Enough resolution to stay crisp at the flower's largest resting size on
    // the display it is actually on. Past that the dive is magnifying it under
    // an opaque white wash, where softness cannot be seen.
    const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 1), 2);
    const RASTER = Math.min(3, 2 * dpr);

    faceArt.forEach((art, wi) => {
      if (!art) return;
      const g = geom(wi);
      const w = Math.max(1, Math.round(g.w * RASTER));
      const h = Math.max(1, Math.round(g.h * RASTER));

      ['front', 'back'].forEach(side => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
          const cv = document.createElement('canvas');
          cv.width = w;
          cv.height = h;
          const c2 = cv.getContext('2d');
          if (!c2 || typeof cv.toBlob !== 'function') return;
          c2.drawImage(img, 0, 0, w, h);
          // A blob URL rather than a data URL: twelve baked faces as base64
          // would be several megabytes of string held for the page's life.
          cv.toBlob(blob => {
            if (!blob) return;                       // refused draw: the vector art stays
            const css = 'url("' + URL.createObjectURL(blob) + '")';
            for (const petalRef of petals) {
              if (petalRef.wi !== wi) continue;
              const face = petalRef.el.querySelector('.petal-' + side);
              if (face) face.style.backgroundImage = css;
            }
          }, 'image/png');
        };
        img.src = art[side];
      });
    });
  }

  bakeFaceArt();

  // ---- golden stamen crown: 56 filaments with pale anthers -----------------
  const stamenCrown = el('div', 'stamen-crown');
  const stamens = [];
  const STAMEN_COUNT = 56;

  for (let si = 0; si < STAMEN_COUNT; si++) {
    const sa = si * (360 / STAMEN_COUNT);
    const slen = 28 + (si % 3) * 3;
    const srad = 48 + (si % 2) * 3;

    const stamenEl = el('div', 'stamen');
    // Only the length is a variable; position and tilt are written straight
    // into the transform each frame, which is one style write instead of three.
    stamenEl.style.setProperty('--slen', `${slen}px`);
    stamenEl.style.transform = `rotateZ(${sa.toFixed(1)}deg) translateY(${-srad}px) rotateX(16deg)`;
    stamenEl.append(el('span', 'stamen-filament'), el('span', 'stamen-anther'));

    stamenCrown.appendChild(stamenEl);
    stamens.push({
      el: stamenEl,
      head: `rotateZ(${sa.toFixed(1)}deg) translateY(${-srad}px) rotateX(`,
      phase: (si * 1.3) % 6.28,
      last: 16
    });
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
  const BLOOM_IN = 0.24;
  // Let the opening breathe across most of the pinned chapter, then hold the
  // completed flower before the dive begins.
  const BLOOM_OUT = 0.78;

  // ---- Intro phase: consumes the dead zone before bloom begins ----
  // Phase 1: the wordmark "The Lotus of my Tech Stack" appears prominently
  // Phase 2: wordmark retreats to its resting watermark opacity
  // Phase 3: the closed bud fades in, ready to bloom
  const INTRO_WORD_IN    = 0.005;  // wordmark starts fading in
  const INTRO_WORD_PEAK  = 0.08;   // wordmark reaches full prominence
  const INTRO_WORD_HOLD  = 0.16;   // longer cinematic hold for the title
  const INTRO_WORD_OUT   = 0.22;   // wordmark settles to watermark
  const INTRO_BUD_IN     = 0.17;   // bud starts appearing as the title recedes
  const INTRO_BUD_DONE   = BLOOM_IN; // bud fully present = bloom begins

  // The dive: the camera falls into the open receptacle and the chapter goes
  // with it, which is the handoff into the next one. It has to finish inside
  // the pinned phase — once the track runs out, the sticky stage slides away
  // on its own, and anything still visible then reads as the page scrolling
  // rather than as the camera travelling.
  const DIVE_IN = 0.88;
  const DIVE_COVERED = 0.93; // The opaque wash completely covers the 3D flower.
  const DIVE_END = 0.98; // Fully transparent; no more flower frames are needed.

  // How far into the flower the camera gets. A few multiples only enlarge it;
  // passing through it means the petals have to leave the frame entirely, so
  // the receptacle alone fills the screen at the end.
  const DIVE_ZOOM = 26;

  let targetBloom = 0;
  let targetProgress = 0;
  let motionProgress = 0;
  let bloom = 0;
  let dive = 0;               // 0 = flower held, 1 = fully inside it
  let diving = false;
  let departed = false;
  let inView = false;
  let cachedPodDy = -30;
  let cachedPodDx = 0;
  let podRestMeasured = false;
  let idle = 0;               // 0 = actively scrolling, 1 = fully settled
  let lastInput = performance.now();
  let activeWhorl = -1;
  let podIsReachable = null;

  function whorlProgress(p, b) {
    return clamp((b - (p.wi * WHORL_STEP + p.delay)) / WHORL_SPAN, 0, 1);
  }

  function measurePodRest() {
    if (!pod || !pond) return;
    const box = pod.getBoundingClientRect();
    const pBox = pond.getBoundingClientRect();
    if (box.height && pBox.height) {
      cachedPodDy = (box.top + box.height / 2) - (pBox.top + pBox.height / 2);
      cachedPodDx = (box.left + box.width / 2) - (pBox.left + pBox.width / 2);
      podRestMeasured = true;
    }
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
    if (!podRestMeasured) {
      cachedPodDy = -29.1 * scale - 0.003 * h;
      cachedPodDx = 0;
    }
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
  let paintedDive = 0;
  let fitDist = 1, fitDistTarget = 1;
  let fitLift = 0, fitLiftTarget = 0;
  let fitPrimed = false;
  let nextMeasure = 0;

  function measureFrame(now) {
    // Stable camera framing: fitDist remains 1.0 and fitLift remains 0 to
    // eliminate post-scroll zooming and drift.
    fitDist = 1;
    fitLift = 0;
    fitDistTarget = 1;
    fitLiftTarget = 0;
  }

  // Chapter 3 Progress Indicator elements
  const progressPill = document.getElementById('atelierProgressPill');
  const progressLabel = document.getElementById('atelierProgressLabel');
  const progressFill = document.getElementById('atelierProgressFill');
  const progressVal = document.getElementById('atelierProgressVal');
  const stageRailFill = document.getElementById('atelierStageRailFill');

  let lastReportedPercent = -1;
  let lastReportedLabel = '';

  function updateProgressIndicator(prog, b, d) {
    if (!progressPill) return;
    const percent = Math.min(100, Math.max(0, Math.round(prog * 100)));
    if (percent !== lastReportedPercent) {
      lastReportedPercent = percent;
      if (progressVal) progressVal.textContent = `${percent}%`;
      const fillScale = (percent / 100).toFixed(4);
      if (progressFill) progressFill.style.transform = `scaleX(${fillScale})`;
      if (stageRailFill) stageRailFill.style.transform = `scaleX(${fillScale})`;
      progressPill.setAttribute('aria-valuenow', String(percent));
    }

    let label = '';
    if (d > 0.15) {
      label = 'The Dive · Transcendence';
    } else if (b >= 0.88) {
      label = 'Full Bloom · Archive';
    } else if (b < 0.04) {
      label = 'The Bud · Whorl 01';
    } else {
      const activeIdx = clamp(Math.floor(b * REALMS.length), 0, REALMS.length - 1);
      const realm = REALMS[activeIdx] || REALMS[0];
      const shortName = realm.categoryChipLabel || realm.discipline;
      label = `Whorl ${realm.seq} / 06 · ${shortName}`;
    }

    if (label !== lastReportedLabel) {
      lastReportedLabel = label;
      if (progressLabel) progressLabel.textContent = label;
    }
  }

  // The engine calls this from the shared scroll rAF. Scroll is the whole
  // input: one number in, the entire chapter out.
  function render(progress) {
    targetProgress = clamp(progress, 0, 1);

    // ---- the intro: wordmark reveal → hold → retreat → bud arrives ----
    let introWordRaw;
    if (progress < INTRO_WORD_IN) {
      introWordRaw = 0;
    } else if (progress < INTRO_WORD_PEAK) {
      introWordRaw = clamp((progress - INTRO_WORD_IN) / (INTRO_WORD_PEAK - INTRO_WORD_IN), 0, 1);
    } else if (progress < INTRO_WORD_HOLD) {
      introWordRaw = 1; // hold at peak
    } else if (progress < INTRO_WORD_OUT) {
      introWordRaw = 1 - clamp((progress - INTRO_WORD_HOLD) / (INTRO_WORD_OUT - INTRO_WORD_HOLD), 0, 1);
    } else {
      introWordRaw = 0;
    }
    const introWord = reduced ? 0 : smoothstep(introWordRaw);
    const introBudRaw = clamp((progress - INTRO_BUD_IN) / (INTRO_BUD_DONE - INTRO_BUD_IN), 0, 1);
    const introBud = reduced ? 1 : smoothstep(introBudRaw);

    stage.style.setProperty('--intro-word', introWord.toFixed(3));
    stage.style.setProperty('--intro-bud', introBud.toFixed(3));

    const nextBloom = clamp((progress - BLOOM_IN) / (BLOOM_OUT - BLOOM_IN), 0, 1);

    // Scatter pills: tied to bloom so they appear progressively as each whorl opens
    updateScatter(reduced ? 1 : nextBloom);

    const nextDive = clamp((progress - DIVE_IN) / (1 - DIVE_IN), 0, 1);

    updateProgressIndicator(targetProgress, nextBloom, nextDive);

    if (Math.abs(nextBloom - targetBloom) > 0.0005 || Math.abs(nextDive - dive) > 0.0005) {
      lastInput = performance.now();
    }
    targetBloom = nextBloom;
    // Re-enter at the current position rather than replaying unseen travel.
    // While visible, bloom and dive share one short, bounded follower.
    if (!running || reduced || !inView) {
      motionProgress = targetProgress;
      bloom = targetBloom;
      dive = nextDive;
    }

    if (!reduced) {
      // Driven off state rather than off a crossing, so it cannot be left
      // running by anything else that pokes the loop — a tab regaining focus,
      // say. Both calls no-op when they are already in the right state.
      const wasRunning = running;
      syncLoop();
      // One last frame on the way out, so the chapter settles fully gone
      if (dive >= DIVE_COVERED || (wasRunning && !running)) {
        paint(performance.now() / 1000, targetBloom);
      }
    }

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

  // ---- paint one frame at a given bloom ------------------------------------
  function paint(t, b) {
    paintedBloom = b;
    paintedDive = dive;
    const cam = camAt(b);

    // Compound aquatic wave kinematics (buoyancy heave, pitch, roll, yaw drift)
    const waveHeave = Math.sin(t * 0.72) * 1.8 * idle;
    const wavePitch = Math.sin(t * 0.58 + 0.9) * 1.4 * idle;
    const waveRoll = Math.cos(t * 0.44 + 1.7) * 1.2 * idle;
    const waveYaw = Math.sin(t * 0.31) * 3.4 * idle;

    const totalRoll = cam.roll + waveRoll;
    const totalTilt = clamp(cam.tilt + wavePitch, 10, 32);
    const totalYaw = cam.yaw + waveYaw;
    const totalDist = cam.dist * fitDist;

    // The dive scales the rig's parent, so the rig's own vertical offset gets
    // magnified along with everything else and the flower slides off the top
    // of the screen instead of the camera going into it. Dividing the offset
    // by the same factor keeps its on-screen position fixed, so the dive is
    // anchored on the centre of the flower.
    const diveScale = 1 + dive * dive * dive * DIVE_ZOOM;
    const totalLift = (cam.lift + fitLift + waveHeave * 0.4) / diveScale;

    rig.style.transform =
      `translate3d(0, ${totalLift.toFixed(3)}%, 0) ` +
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
    //
    // Travelling toward something at a steady rate makes it grow ever faster,
    // so the scale is exponential rather than a ramp: the approach reads as
    // constant speed instead of decelerating into a ceiling.
    const rush = dive * dive * dive;
    const veil = 1 - smoothstep(clamp((dive - 0.38) / 0.40, 0, 1));

    // The chapter is fully gone well before the track runs out, so the sticky
    // stage does its slide with nothing on it to give the slide away. The
    // margin also absorbs the scroll engine's easing, which means the dive
    // lags the wheel slightly and would otherwise still be fading at handoff.
    const alpha = 1 - smoothstep(clamp((dive - 0.78) / (DIVE_END - 0.78), 0, 1));

    stage.style.setProperty('--dive-bloom', diveScale.toFixed(4));
    stage.style.setProperty('--dive-field', (1 + rush * 3.4).toFixed(4));
    stage.style.setProperty('--dive-mark', (1 + rush * 1.15).toFixed(4));
    stage.style.setProperty('--dive-veil', veil.toFixed(3));
    // The header clears out first: once the pond stops clipping, the flower
    // grows up through where the title was sitting.
    stage.style.setProperty('--dive-head',
      (1 - smoothstep(clamp(dive / 0.3, 0, 1))).toFixed(3));
    stage.style.setProperty('--stage-opacity', alpha.toFixed(3));

    // Gone means gone: stop compositing the flower and stop intercepting the
    // pointer while this stage still hangs over the next chapter.
    const gone = alpha < 0.02;
    if (gone !== departed) {
      departed = gone;
      section.classList.toggle('is-departed', gone);
    }

    // Deterministic camera alignment for dive transition:
    // The receptacle rides slightly above the stage center (lifted on stalk, tilted 28°).
    // Scaling by diveScale amplifies this resting offset upward. Counteracting it smoothly
    // holds the receptacle dead center in the viewport without any layout thrashing or feedback oscillation.
    const isDiving = dive > 0.001;
    if (isDiving !== diving) {
      diving = isDiving;
      pond.classList.toggle('is-diving', diving);
      if (diving && !podRestMeasured && b >= 0.70) {
        measurePodRest();
      }
    }

    if (diving) {
      const ease = smoothstep(clamp(dive / 0.35, 0, 1));
      const ty = -cachedPodDy * (diveScale - (1 - ease));
      const tx = -cachedPodDx * (diveScale - (1 - ease));
      stage.style.setProperty('--dive-tx', `${tx.toFixed(1)}px`);
      stage.style.setProperty('--dive-ty', `${ty.toFixed(1)}px`);
    } else {
      stage.style.setProperty('--dive-tx', '0px');
      stage.style.setProperty('--dive-ty', '0px');
    }

    // During the crossfade only the opaque wash is visible. Do not rasterize
    // a huge 3D flower behind it or run camera feedback against hidden content.
    scaler.style.visibility = dive >= DIVE_COVERED ? 'hidden' : 'visible';
    if (dive >= DIVE_COVERED) return;

    // ---- petals ----
    let active = 0;
    for (const p of petals) {
      const raw = whorlProgress(p, b);
      const prog = easeOutBack(raw);

      // Idle flutter: a petal that has opened sways a little on its own
      const flut = Math.sin(t * 0.85 + p.phase) * 1.7 * idle * raw;
      const twist = Math.sin(t * 0.61 + p.phase * 1.3) * 1.2 * idle * raw;

      // One composed transform rather than four custom properties: a custom
      // property write invalidates style for the element and everything that
      // inherits it, and four of them per petal per frame is most of the cost
      // of this chapter.
      p.el.style.transform =
        `translateZ(${p.g.lift.toFixed(1)}px) ` +
        `rotateZ(${(p.baseAngle + twist).toFixed(2)}deg) ` +
        `translateY(${(-lerp(p.g.radClosed, p.g.radOpen, prog)).toFixed(2)}px) ` +
        `rotateX(${(lerp(p.g.closed, p.g.open, prog) + flut).toFixed(2)}deg) ` +
        `rotateY(${lerp(p.g.shingle, 0, prog).toFixed(2)}deg)`;
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

    // 56 filaments are the densest thing on the stage and the least visible.
    // While the page is being scrolled `idle` is ~0, so their sway is ~0 and
    // the tilt barely moves: skip the write unless it actually changed.
    for (const s of stamens) {
      const sWave = Math.sin(t * 1.3 + s.phase) * 2.4 * idle * stamenProg;
      const tilt = sTilt + sWave;
      if (Math.abs(tilt - s.last) > 0.15) {
        s.last = tilt;
        s.el.style.transform = `${s.head}${tilt.toFixed(1)}deg)`;
      }
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

  // Critically damped exponential decay follower (smooth scrub momentum)
  function followProgress(current, target, dt) {
    const next = current + (target - current) * (1 - Math.exp(-16.0 * dt));
    return Math.abs(target - next) < 0.00005 ? target : next;
  }

  let rafId = 0;
  let running = false;
  let prevNow = performance.now();

  function frame(now) {
    const t = now / 1000;
    const dt = Math.min((now - prevNow) / 1000, 0.1);   // clamp after a tab-switch stall
    prevNow = now;

    // Smooth critically damped exponential follower (~0.6s settle) gives the
    // blooming lotus fluid momentum without accumulating spring overshoot.
    motionProgress = followProgress(motionProgress, targetProgress, dt);
    bloom = clamp((motionProgress - BLOOM_IN) / (BLOOM_OUT - BLOOM_IN), 0, 1);
    dive = clamp((motionProgress - DIVE_IN) / (1 - DIVE_IN), 0, 1);

    // Magnifying breathing and sway during a dive makes the camera chase a
    // moving target, especially when the flower resumes from its hidden state.
    // Quick, smooth transition back into breathing when scrolling pauses (100ms delay, ~0.4s settle).
    const wantIdle = (dive === 0 && now - lastInput > 100) ? 1 : 0;
    idle = dive > 0 ? 0 : idle + (wantIdle - idle) * damp(wantIdle ? 0.08 : 0.12, dt);

    if (dive === 0 && paintedDive === 0) {
      fitDist = 1;
      fitLift = 0;
    }

    // Everything time-driven in paint() -- the wave, the flutter, the twist,
    // the pod's pulse -- is multiplied by idle, and idle is held at 0 for the
    // whole dive. So once the follower has caught its target, every frame
    // writes byte-identical transforms to 36 petals and 56 filaments, and each
    // of those writes invalidates the 3D subtree and costs a full re-raster of
    // it. That is what kept the chapter at ~5fps for more than a second after
    // the scrolling had already stopped.
    const nothingMoves =
      motionProgress === targetProgress && idle === 0;

    if (!nothingMoves) {
      // Read the previous frame before writing this one, so fitting does not
      // force a second style/layout pass immediately after all the petal writes.
      measureFrame(now);
      // Idle breathing nudges the bloom itself, so the petals keep living
      paint(t, clamp(bloom + Math.sin(t * 0.55) * 0.014 * idle, 0, 1));
    }

    syncLoop();
    if (running) rafId = requestAnimationFrame(frame);
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

  // The flower animates while its stage intersects the viewport and has not yet
  // finished leaving. The second half matters as much as the first: after the
  // dive this stage still covers the next chapter for a viewport of scroll,
  // and that is precisely when the spiral behind it wants every frame it can
  // get, so there is nothing to gain by going on painting an invisible flower.
  function syncLoop() {
    if (inView && !document.hidden && dive < DIVE_COVERED) startLoop();
    else stopLoop();
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      inView = entries.some(entry => entry.isIntersecting);
      syncLoop();
    }, { rootMargin: '0px' }).observe(stage);
  } else {
    inView = true;
    startLoop();
  }

  window.addEventListener('resize', () => {
    podRestMeasured = false;
    fitScale();
    // The keep-out, the ring radii and the available edges all move with the
    // stage box, so the whole arrangement is re-derived rather than rescaled.
    layoutScatter();
    // Re-acquire the framing against the new stage box on the next paint
    nextMeasure = 0;
    fitPrimed = false;
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopLoop();
    } else {
      lastInput = performance.now();
      syncLoop();
    }
  });

  fitScale();
  paint(performance.now() / 1000, 0);
  updateProgressIndicator(0, 0, 0);

  // Set initial intro state: wordmark hidden, bud hidden
  // (reduced-motion users skip intro — bud is immediately visible)
  stage.style.setProperty('--intro-word', '0');
  stage.style.setProperty('--intro-bud', reduced ? '1' : '0');
  updateScatter(reduced ? 1 : 0);

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
