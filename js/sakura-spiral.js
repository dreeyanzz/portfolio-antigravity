/**
 * ADRIAN SETH TABOTABO — BOTANICAL SAKURA SPIRAL & TREE ENGINE
 * Procedural Japanese Cherry Tree (Prunus serrulata / Somei-Yoshino)
 * rendered in 3D perspective alongside the scroll-driven spiral camera.
 *
 * Botanical Realism Architecture:
 *   1. Sinuous, gnarled ancient trunk rendered as a seamless 3D volumetric ribbon (no segmented joints).
 *   2. Bell-shaped nebari root flare with buttress roots flowing into a grounded mossy base.
 *   3. Graceful continuous bowed scaffold boughs with downward arches and upturned sunlit tips.
 *   4. Prunus bark shading: charcoal-chestnut umber with continuous cylindrical highlights and organic lenticels.
 *   5. Handcrafted botanical blossom sprites: 5 notched cleft petals, translucent gradient,
 *      carmine floral core, golden-amber anthers on stamen filaments, calyx cups, and buds.
 *   6. Volumetric "Sakura no Kumo" (cloud of flowers) enveloping branches in lush billowing masses.
 *   7. Subtle bronze-copper nascent leaf buds (wakamidori) preventing synthetic uniformity.
 *   8. Living micro-breeze sway and 3D drifting petals (hanafubuki) in true parallax.
 */

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

  // 3D Spiral Projection Geometry
  const STEP_ANGLE = Math.PI * 0.72;
  const STEP_HEIGHT = 260;
  const RADIUS = 590;
  const DISTANCE = 1500;
  const FOCAL = 910;
  const bottom = (cards.length - 1) * STEP_HEIGHT + 420;

  // Deterministic PRNG for stable, reproducible tree architecture
  let seed = 718392;
  function random() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  const randRange = (min, max) => min + random() * (max - min);
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const ease = t => t * t * (3 - 2 * t);

  // ==========================================================================
  // 1. PROCEDURAL BOTANICAL SPRITES (Pre-rendered for 60fps compositor performance)
  // ==========================================================================

  /**
   * Draws a botanically accurate 5-petal Somei-Yoshino blossom.
   * Petals have the characteristic notched/cleft tips and translucent pink-to-white blush.
   */
  function drawBotanicalFlower(paint, cx, cy, radius, rotation, options = {}) {
    paint.save();
    paint.translate(cx, cy);
    paint.rotate(rotation);

    const petalLength = radius * 0.94;
    const petalWidth = radius * 0.64;

    if (options.showCalyx) {
      paint.fillStyle = '#651b2b';
      for (let s = 0; s < 5; s++) {
        paint.save();
        paint.rotate(s * (Math.PI * 2 / 5) + 0.3);
        paint.beginPath();
        paint.moveTo(0, 0);
        paint.lineTo(-radius * 0.16, -radius * 0.38);
        paint.lineTo(0, -radius * 0.44);
        paint.lineTo(radius * 0.16, -radius * 0.38);
        paint.closePath();
        paint.fill();
        paint.restore();
      }
    }

    // 5 notched petals with soft radial blush gradient
    for (let p = 0; p < 5; p++) {
      paint.save();
      paint.rotate(p * (Math.PI * 2 / 5));

      const grad = paint.createRadialGradient(0, 0, petalLength * 0.08, 0, -petalLength * 0.50, petalLength * 1.05);
      grad.addColorStop(0, options.coreColor || 'rgba(215, 34, 94, 0.95)');
      grad.addColorStop(0.24, options.midColor || 'rgba(255, 170, 196, 0.92)');
      grad.addColorStop(0.78, options.edgeColor || 'rgba(255, 244, 248, 0.95)');
      grad.addColorStop(1, options.rimColor || 'rgba(255, 255, 255, 0.98)');

      paint.fillStyle = grad;

      // Authentic notched sakura petal contour with cleft apex
      paint.beginPath();
      paint.moveTo(0, 0);
      paint.bezierCurveTo(-petalWidth * 0.54, -petalLength * 0.25, -petalWidth * 0.70, -petalLength * 0.74, -petalWidth * 0.44, -petalLength);
      paint.quadraticCurveTo(-petalWidth * 0.12, -petalLength * 0.94, 0, -petalLength * 0.80);
      paint.quadraticCurveTo(petalWidth * 0.12, -petalLength * 0.94, petalWidth * 0.44, -petalLength);
      paint.bezierCurveTo(petalWidth * 0.70, -petalLength * 0.74, petalWidth * 0.54, -petalLength * 0.25, 0, 0);
      paint.closePath();
      paint.fill();

      // Delicate translucent petal crease
      paint.strokeStyle = 'rgba(215, 60, 110, 0.15)';
      paint.lineWidth = Math.max(0.5, radius * 0.03);
      paint.beginPath();
      paint.moveTo(0, -petalLength * 0.10);
      paint.lineTo(0, -petalLength * 0.74);
      paint.stroke();

      paint.restore();
    }

    // Receptacle / inner crimson ring
    paint.fillStyle = '#a61b47';
    paint.beginPath();
    paint.arc(0, 0, radius * 0.19, 0, Math.PI * 2);
    paint.fill();

    // 16 radiating stamen filaments with golden-amber anthers
    const stamenCount = 16;
    paint.lineWidth = Math.max(0.5, radius * 0.028);
    for (let s = 0; s < stamenCount; s++) {
      const angle = (s / stamenCount) * Math.PI * 2 + (s % 2) * 0.11;
      const len = radius * (0.28 + (s % 3) * 0.07);
      const tipX = Math.cos(angle) * len;
      const tipY = Math.sin(angle) * len;

      paint.strokeStyle = 'rgba(255, 240, 245, 0.88)';
      paint.beginPath();
      paint.moveTo(0, 0);
      paint.lineTo(tipX, tipY);
      paint.stroke();

      paint.fillStyle = '#e59620';
      paint.beginPath();
      paint.arc(tipX, tipY, Math.max(0.8, radius * 0.07), 0, Math.PI * 2);
      paint.fill();

      paint.fillStyle = '#ffe774';
      paint.beginPath();
      paint.arc(tipX - 0.25, tipY - 0.25, Math.max(0.4, radius * 0.03), 0, Math.PI * 2);
      paint.fill();
    }

    // Central pale chartreuse pistil
    paint.fillStyle = '#8ca84e';
    paint.beginPath();
    paint.arc(0, 0, Math.max(0.7, radius * 0.055), 0, Math.PI * 2);
    paint.fill();

    paint.restore();
  }

  function createPetalSprite() {
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 44;
    const paint = sprite.getContext('2d');
    if (!paint) return sprite;
    paint.translate(22, 22);

    const grad = paint.createRadialGradient(0, 0, 2, 0, -9, 19);
    grad.addColorStop(0, 'rgba(215, 45, 102, 0.95)');
    grad.addColorStop(0.32, 'rgba(255, 176, 202, 0.92)');
    grad.addColorStop(0.82, 'rgba(255, 244, 248, 0.96)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0.98)');
    paint.fillStyle = grad;

    paint.beginPath();
    paint.moveTo(0, 0);
    paint.bezierCurveTo(-8, -4, -10, -14, -7, -18);
    paint.quadraticCurveTo(-2, -17.2, 0, -15);
    paint.quadraticCurveTo(2, -17.2, 7, -18);
    paint.bezierCurveTo(10, -14, 8, -4, 0, 0);
    paint.closePath();
    paint.fill();

    return sprite;
  }

  const singlePetalSprite = createPetalSprite();

  const cloudSprites = [];
  const CLOUD_COUNT = 8;
  const SPRITE_W = 360;
  const SPRITE_H = 240;

  for (let c = 0; c < CLOUD_COUNT; c++) {
    const sprite = document.createElement('canvas');
    sprite.width = SPRITE_W;
    sprite.height = SPRITE_H;
    const paint = sprite.getContext('2d');
    if (!paint) { cloudSprites.push(sprite); continue; }

    const cx = SPRITE_W / 2;
    const cy = SPRITE_H / 2;

    // --- Pass 1: Volumetric Cloud Body (Soft Pillowy Floral Mass) ---
    for (let puff = 0; puff < 20; puff++) {
      const puffAngle = random() * Math.PI * 2;
      const puffDist = Math.sqrt(random()) * 95;
      const px = cx + Math.cos(puffAngle) * puffDist * 1.45;
      const py = cy + Math.sin(puffAngle) * puffDist * 0.82;
      const puffRadius = 40 + random() * 48;

      const pGrad = paint.createRadialGradient(px, py, 0, px, py, puffRadius);
      pGrad.addColorStop(0, 'rgba(230, 142, 174, 0.44)');
      pGrad.addColorStop(0.50, 'rgba(248, 182, 208, 0.32)');
      pGrad.addColorStop(0.85, 'rgba(255, 226, 238, 0.16)');
      pGrad.addColorStop(1, 'rgba(255, 245, 250, 0)');
      paint.fillStyle = pGrad;
      paint.beginPath();
      paint.arc(px, py, puffRadius, 0, Math.PI * 2);
      paint.fill();
    }

    // --- Pass 2: Hanging Underside Sprays ---
    const hangingCount = 14 + Math.floor(random() * 8);
    for (let h = 0; h < hangingCount; h++) {
      const hx = cx + randRange(-125, 125);
      const hy = cy + randRange(10, 68);
      const stemLen = 14 + random() * 24;
      const stemEndX = hx + randRange(-7, 7);
      const stemEndY = hy + stemLen;

      paint.strokeStyle = 'rgba(122, 40, 58, 0.72)';
      paint.lineWidth = 1.0;
      paint.beginPath();
      paint.moveTo(hx, hy);
      paint.quadraticCurveTo(hx + randRange(-4, 4), hy + stemLen * 0.5, stemEndX, stemEndY);
      paint.stroke();

      if (random() > 0.45) {
        drawBotanicalFlower(paint, stemEndX, stemEndY, 12 + random() * 7, randRange(-0.35, 0.35), {
          showCalyx: true,
          coreColor: 'rgba(180, 24, 72, 0.95)',
          midColor: 'rgba(255, 156, 188, 0.92)'
        });
      } else {
        paint.save();
        paint.translate(stemEndX, stemEndY);
        paint.fillStyle = '#651a2a';
        paint.beginPath(); paint.arc(0, -2, 2.7, 0, Math.PI * 2); paint.fill();
        paint.fillStyle = '#b81a52';
        paint.beginPath(); paint.ellipse(0, 4, 3.2, 5.8, 0, 0, Math.PI * 2); paint.fill();
        paint.restore();
      }
    }

    // --- Pass 3: Dense Mid-Canopy Blossoms ---
    const flowerCount = 44 + Math.floor(random() * 18);
    for (let f = 0; f < flowerCount; f++) {
      const angle = random() * Math.PI * 2;
      const dist = Math.sqrt(random());
      const fx = cx + Math.cos(angle) * dist * 148;
      const fy = cy + Math.sin(angle) * dist * 84;
      const fRadius = 13 + random() * 15;
      const fRot = random() * Math.PI * 2;

      drawBotanicalFlower(paint, fx, fy, fRadius, fRot);
    }

    // --- Pass 4: Prominent Sunlit Blossoms & Highlights ---
    const focalCount = 9 + Math.floor(random() * 6);
    for (let fc = 0; fc < focalCount; fc++) {
      const fx = cx + randRange(-115, 115);
      const fy = cy + randRange(-65, 35);
      const fRadius = 17 + random() * 12;
      const fRot = random() * Math.PI * 2;

      drawBotanicalFlower(paint, fx, fy, fRadius, fRot, {
        rimColor: 'rgba(255, 255, 255, 1)',
        edgeColor: 'rgba(255, 248, 252, 0.98)'
      });
    }

    // --- Pass 5: Emerging Bronze/Copper Leaf Buds ---
    const leafCount = 4 + Math.floor(random() * 4);
    for (let l = 0; l < leafCount; l++) {
      const lx = cx + randRange(-130, 130);
      const ly = cy + randRange(-68, 45);
      const lRot = random() * Math.PI * 2;
      const lSize = 9 + random() * 9;

      paint.save();
      paint.translate(lx, ly);
      paint.rotate(lRot);

      const leafGrad = paint.createLinearGradient(0, 0, 0, -lSize);
      leafGrad.addColorStop(0, '#753b22');
      leafGrad.addColorStop(0.5, '#995932');
      leafGrad.addColorStop(1, '#829141');
      paint.fillStyle = leafGrad;

      paint.beginPath();
      paint.moveTo(0, 0);
      paint.quadraticCurveTo(-lSize * 0.28, -lSize * 0.55, 0, -lSize);
      paint.quadraticCurveTo(lSize * 0.28, -lSize * 0.55, 0, 0);
      paint.closePath();
      paint.fill();
      paint.restore();
    }

    cloudSprites.push(sprite);
  }

  const spraySprites = [];
  const SPRAY_COUNT = 4;
  for (let s = 0; s < SPRAY_COUNT; s++) {
    const sprite = document.createElement('canvas');
    sprite.width = 190;
    sprite.height = 150;
    const paint = sprite.getContext('2d');
    if (!paint) { spraySprites.push(sprite); continue; }

    const cx = 95, cy = 75;
    for (let puff = 0; puff < 8; puff++) {
      const px = cx + randRange(-40, 40);
      const py = cy + randRange(-25, 25);
      const rad = 24 + random() * 26;
      const grad = paint.createRadialGradient(px, py, 0, px, py, rad);
      grad.addColorStop(0, 'rgba(232, 145, 174, 0.40)');
      grad.addColorStop(1, 'rgba(255, 235, 242, 0)');
      paint.fillStyle = grad;
      paint.beginPath(); paint.arc(px, py, rad, 0, Math.PI * 2); paint.fill();
    }
    const fCount = 11 + Math.floor(random() * 6);
    for (let f = 0; f < fCount; f++) {
      const fx = cx + randRange(-50, 50);
      const fy = cy + randRange(-35, 35);
      drawBotanicalFlower(paint, fx, fy, 12 + random() * 10, random() * Math.PI * 2);
    }
    spraySprites.push(sprite);
  }

  // ==========================================================================
  // 2. BOTANICAL TREE ARCHITECTURE (Trunk Ribbon, Sinuous Splines & Nebari)
  // ==========================================================================

  const trunkPoints = [];
  function trunk(y) {
    return {
      x: Math.sin(y * 0.0020 + 0.38) * 50 + Math.cos(y * 0.0044) * 15,
      y,
      z: Math.cos(y * 0.0016 - 0.22) * 42 + Math.sin(y * 0.0036) * 12
    };
  }

  function trunkThickness(y) {
    const norm = clamp((y + 320) / (bottom + 320));
    let th = 16 + norm * 26;
    if (y > bottom - 180) {
      const flareT = (y - (bottom - 180)) / 180;
      th += flareT * flareT * 34; // Bell flare for grounded nebari
    }
    return th;
  }

  // Sample smooth trunk spine
  for (let y = -310; y <= bottom + 15; y += 22) {
    const pt = trunk(y);
    trunkPoints.push({
      ...pt,
      w: trunkThickness(y),
      flex: 0.03 * (1 - clamp((y + 310) / (bottom + 310)))
    });
  }

  const branchChains = [];
  const blooms = [];

  function addCurvedChain(p0, p1, p2, p3, thickStart, thickEnd, segments = 5, flexStart = 0.1, flexEnd = 0.5, options = {}) {
    const chain = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const invT = 1 - t;
      const pt = {
        x: invT * invT * invT * p0.x + 3 * invT * invT * t * p1.x + 3 * invT * t * t * p2.x + t * t * t * p3.x,
        y: invT * invT * invT * p0.y + 3 * invT * invT * t * p1.y + 3 * invT * t * t * p2.y + t * t * t * p3.y,
        z: invT * invT * invT * p0.z + 3 * invT * invT * t * p1.z + 3 * invT * t * t * p2.z + t * t * t * p3.z,
        w: thickStart + (thickEnd - thickStart) * t,
        flex: flexStart + (flexEnd - flexStart) * t
      };
      chain.push(pt);
    }
    branchChains.push({ points: chain, options });
  }

  // --- Grounded Nebari (Root Flare & Buttress Roots) ---
  const rootCount = 7;
  for (let r = 0; r < rootCount; r++) {
    const angle = (r / rootCount) * Math.PI * 2 + randRange(-0.15, 0.15);
    const startY = bottom - 100 + (r % 3) * 22;
    const base = trunk(startY);
    const baseDirX = Math.cos(angle);
    const baseDirZ = Math.sin(angle);

    const p0 = {
      x: base.x + baseDirX * (trunkThickness(startY) * 0.38),
      y: startY,
      z: base.z + baseDirZ * (trunkThickness(startY) * 0.38)
    };
    const p1 = {
      x: p0.x + baseDirX * 65,
      y: bottom - 10,
      z: p0.z + baseDirZ * 65
    };
    const p2 = {
      x: p0.x + baseDirX * 150 + randRange(-12, 12),
      y: bottom + 14,
      z: p0.z + baseDirZ * 150 + randRange(-12, 12)
    };
    const tip = {
      x: p0.x + baseDirX * 250 + randRange(-18, 18),
      y: bottom + 25 + randRange(0, 12),
      z: p0.z + baseDirZ * 250 + randRange(-18, 18)
    };
    addCurvedChain(p0, p1, p2, tip, 22, 3.5, 5, 0, 0, { isRoot: true });

    // Lateral anchoring rootlet
    const subAngle = angle + (r % 2 === 0 ? 0.36 : -0.36);
    const subTip = {
      x: p2.x + Math.cos(subAngle) * 80,
      y: bottom + 28,
      z: p2.z + Math.sin(subAngle) * 80,
      w: 2.0,
      flex: 0
    };
    branchChains.push({
      points: [
        { ...p2, w: 5.5, flex: 0 },
        subTip
      ],
      options: { isRoot: true }
    });
  }

  // Grounded Fallen Petals
  const fallenPetals = [];
  for (let fp = 0; fp < 45; fp++) {
    const fAngle = random() * Math.PI * 2;
    const fDist = 35 + Math.sqrt(random()) * 260;
    const rootCenter = trunk(bottom);
    fallenPetals.push({
      x: rootCenter.x + Math.cos(fAngle) * fDist,
      y: bottom + 24 + randRange(-4, 16),
      z: rootCenter.z + Math.sin(fAngle) * fDist,
      size: randRange(8, 15),
      rotation: random() * Math.PI * 2,
      opacity: randRange(0.45, 0.85)
    });
  }

  // --- Sinuous Scaffold Limbs (Daishi) & Canopy Architecture ---
  const scaffoldConfigs = [
    { y: -270, angle: 0.25, reach: 400, dip: 55, rise: 45, thick: 20 },
    { y: -230, angle: 2.15, reach: 430, dip: 65, rise: 50, thick: 21 },
    { y: -185, angle: 4.30, reach: 410, dip: 65, rise: 48, thick: 20 },
    { y: -135, angle: 1.10, reach: 460, dip: 75, rise: 55, thick: 22 },
    { y: -85,  angle: 3.25, reach: 480, dip: 85, rise: 60, thick: 23 },
    { y: -30,  angle: 5.45, reach: 450, dip: 80, rise: 55, thick: 22 },
    { y: 45,   angle: 0.85, reach: 500, dip: 105, rise: 65, thick: 24 },
    { y: 145,  angle: 2.80, reach: 490, dip: 110, rise: 68, thick: 25 },
    { y: 265,  angle: 4.90, reach: 470, dip: 115, rise: 65, thick: 25 },
    { y: 425,  angle: 1.65, reach: 440, dip: 125, rise: 60, thick: 26 },
    { y: 605,  angle: 3.85, reach: 400, dip: 130, rise: 55, thick: 26 },
    { y: 805,  angle: 5.95, reach: 360, dip: 130, rise: 50, thick: 27 }
  ];

  scaffoldConfigs.forEach((cfg, idx) => {
    const baseSpine = trunk(cfg.y);
    const ang = cfg.angle + randRange(-0.08, 0.08);
    const reach = cfg.reach * randRange(0.94, 1.06);
    const trunkW = trunkThickness(cfg.y);

    // Emerge organically from the trunk bark surface
    const p0 = {
      x: baseSpine.x + Math.cos(ang) * (trunkW * 0.38),
      y: cfg.y,
      z: baseSpine.z + Math.sin(ang) * (trunkW * 0.38)
    };
    const p1 = {
      x: baseSpine.x + Math.cos(ang) * reach * 0.25,
      y: cfg.y - randRange(8, 22),
      z: baseSpine.z + Math.sin(ang) * reach * 0.25
    };
    const p2 = {
      x: baseSpine.x + Math.cos(ang + 0.10) * reach * 0.68,
      y: cfg.y + cfg.dip * 0.48,
      z: baseSpine.z + Math.sin(ang + 0.10) * reach * 0.68
    };
    const p3 = {
      x: baseSpine.x + Math.cos(ang + 0.22) * reach,
      y: p2.y - cfg.rise,
      z: baseSpine.z + Math.sin(ang + 0.22) * reach
    };

    addCurvedChain(p0, p1, p2, p3, cfg.thick, cfg.thick * 0.32, 6, 0.10, 0.52);

    // Tip bough blossom cloud
    blooms.push({
      ...p3,
      spread: 130,
      sprite: cloudSprites[idx % CLOUD_COUNT],
      flex: 0.65
    });

    // Mid-elbow blossom cloud
    blooms.push({
      ...p2,
      spread: 115,
      sprite: cloudSprites[(idx + 3) % CLOUD_COUNT],
      flex: 0.38
    });

    // Secondary branches (Chuushi)
    const secOrigins = [
      { pt: p1, parentAng: ang, len: reach * 0.48, thick: cfg.thick * 0.50 },
      { pt: p2, parentAng: ang + 0.10, len: reach * 0.42, thick: cfg.thick * 0.42 }
    ];

    secOrigins.forEach(sec => {
      for (let s = -1; s <= 1; s += 2) {
        const secAng = sec.parentAng + s * randRange(0.42, 0.68);
        const secP1 = {
          x: sec.pt.x + Math.cos(secAng) * sec.len * 0.35,
          y: sec.pt.y + randRange(4, 16),
          z: sec.pt.z + Math.sin(secAng) * sec.len * 0.35
        };
        const secP2 = {
          x: sec.pt.x + Math.cos(secAng + s * 0.08) * sec.len * 0.70,
          y: sec.pt.y + randRange(12, 28),
          z: sec.pt.z + Math.sin(secAng + s * 0.08) * sec.len * 0.70
        };
        const secTip = {
          x: sec.pt.x + Math.cos(secAng + s * 0.15) * sec.len,
          y: secP2.y - randRange(16, 36),
          z: sec.pt.z + Math.sin(secAng + s * 0.15) * sec.len
        };

        addCurvedChain(sec.pt, secP1, secP2, secTip, sec.thick, 3.4, 4, 0.32, 0.65);

        blooms.push({
          ...secTip,
          spread: 110,
          sprite: cloudSprites[(idx + s + CLOUD_COUNT) % CLOUD_COUNT],
          flex: 0.75
        });

        // Tertiary fine twigs
        for (let t = -1; t <= 1; t += 2) {
          const twAng = secAng + t * randRange(0.38, 0.62);
          const twLen = randRange(65, 100);
          const twMid = {
            x: secTip.x + Math.cos(twAng) * twLen * 0.5,
            y: secTip.y - randRange(-4, 18),
            z: secTip.z + Math.sin(twAng) * twLen * 0.5,
            w: 2.4,
            flex: 0.82
          };
          const twTip = {
            x: secTip.x + Math.cos(twAng + t * 0.08) * twLen,
            y: secTip.y - randRange(-6, 36),
            z: secTip.z + Math.sin(twAng + t * 0.08) * twLen,
            w: 1.5,
            flex: 0.96
          };

          branchChains.push({
            points: [
              { ...secTip, w: 3.2, flex: 0.65 },
              twMid,
              twTip
            ],
            options: { isTwig: true }
          });

          blooms.push({
            ...twTip,
            spread: 88,
            sprite: spraySprites[(idx + t + 8) % SPRAY_COUNT],
            flex: 1.0
          });
        }
      }
    });
  });

  // --- Crown Dome Blanketing Clusters ("Sakura no Kumo") ---
  for (let d = 0; d < 24; d++) {
    const dAngle = random() * Math.PI * 2;
    const dDist = 85 + Math.sqrt(random()) * 280;
    const dY = -300 + random() * 270;
    const dTrunk = trunk(dY);
    blooms.push({
      x: dTrunk.x + Math.cos(dAngle) * dDist,
      y: dY + randRange(-40, 32),
      z: dTrunk.z + Math.sin(dAngle) * dDist,
      spread: randRange(112, 140),
      sprite: cloudSprites[d % CLOUD_COUNT],
      flex: 0.55
    });
  }

  // --- Trunk Blossoms (Dobuki) ---
  for (let b = 0; b < 10; b++) {
    const by = 320 + b * 125;
    const bTrunk = trunk(by);
    const bAng = b * 1.85;
    blooms.push({
      x: bTrunk.x + Math.cos(bAng) * 34,
      y: by + randRange(-10, 10),
      z: bTrunk.z + Math.sin(bAng) * 34,
      spread: 68,
      sprite: spraySprites[b % SPRAY_COUNT],
      flex: 0.08
    });
  }

  // ==========================================================================
  // 3. 3D DRIFTING PETALS (Hanafubuki in Parallax Space)
  // ==========================================================================

  const PETAL_COUNT = 38;
  const driftingPetals = Array.from({ length: PETAL_COUNT }, () => ({
    x: randRange(-460, 460),
    y: randRange(-310, bottom),
    z: randRange(-460, 460),
    size: randRange(14, 25),
    speedY: randRange(0.7, 1.8),
    orbitSpeed: randRange(0.0018, 0.0048),
    swayAmp: randRange(14, 32),
    swayFreq: randRange(0.016, 0.034),
    phase: randRange(0, Math.PI * 2),
    pitchPhase: randRange(0, Math.PI * 2),
    pitchSpeed: randRange(0.018, 0.046),
    rollPhase: randRange(0, Math.PI * 2),
    rollSpeed: randRange(0.024, 0.065),
    rotation: randRange(0, Math.PI * 2),
    spin: randRange(-0.018, 0.018),
    opacity: randRange(0.55, 0.88)
  }));

  // ==========================================================================
  // 4. NAVIGATION & SPIRAL PROGRESSION CONTROLS
  // ==========================================================================

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
    window.scrollTo({
      top: top + ((index + 0.5) / cards.length) * (section.offsetHeight - innerHeight),
      behavior: 'smooth'
    });
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

  // ==========================================================================
  // 5. RENDERING & 3D PERSPECTIVE COMPOSITOR
  // ==========================================================================

  let width = 0, height = 0, zoom = 1, active = -1;
  let currentScrollProgress = 0;
  let animTime = 0;
  let rafId = null;
  let isIntersecting = true;

  function resize() {
    width = host.clientWidth;
    height = host.clientHeight;
    zoom = Math.min(width / (width <= 768 ? 680 : 1180), height / 780, 1.15);
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    render(currentScrollProgress, performance.now());
  }

  function render(progress, now = performance.now()) {
    if (staticQuery.matches) {
      cards.forEach(card => { card.inert = false; card.removeAttribute('aria-hidden'); });
      return;
    }

    currentScrollProgress = progress;
    animTime = now;

    const travel = clamp(progress * cards.length - 0.5, 0, cards.length - 1);
    const step = Math.floor(travel);
    const position = step + ease(clamp((travel - step - 0.22) / 0.56));
    const cameraAngle = position * STEP_ANGLE;
    const cameraY = position * STEP_HEIGHT;
    const sine = Math.sin(cameraAngle), cosine = Math.cos(cameraAngle);
    const current = Math.round(position);

    const breezeT = now * 0.0012;

    function project(point, flex = 0) {
      let px = point.x;
      let py = point.y;
      let pz = point.z;

      if (flex > 0) {
        const sway = Math.sin(breezeT + py * 0.004 + pz * 0.003) * 11 * flex;
        const swayY = Math.cos(breezeT * 0.85 + px * 0.004) * 4.5 * flex;
        px += sway;
        py += swayY;
      }

      const x = px * cosine - pz * sine;
      const z = px * sine + pz * cosine;
      const scale = FOCAL / (DISTANCE - z);
      return {
        x: width / 2 + x * scale * zoom,
        y: height / 2 + (py - cameraY) * scale * zoom,
        z,
        scale
      };
    }

    if (ctx) {
      ctx.clearRect(0, 0, width, height);

      // Subtle rose-gold orbit helix connects projects
      ctx.lineWidth = 1.1;
      ctx.strokeStyle = 'rgba(195, 95, 135, 0.20)';
      ctx.beginPath();
      const samples = (cards.length - 1) * 75;
      for (let k = 0; k <= samples; k++) {
        const t = samples ? k / samples * (cards.length - 1) : 0;
        const p = project({
          x: Math.sin(t * STEP_ANGLE) * RADIUS,
          y: t * STEP_HEIGHT,
          z: Math.cos(t * STEP_ANGLE) * RADIUS
        });
        if (k === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();

      // --- Grounded Fallen Petals (on root mound) ---
      fallenPetals.forEach(fp => {
        const p = project(fp);
        if (p.y < -30 || p.y > height + 30 || p.x < -30 || p.x > width + 30) return;
        const s = fp.size * p.scale * zoom;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(fp.rotation);
        ctx.globalAlpha = fp.opacity * clamp((1200 - p.z) / 1200, 0.3, 1);
        ctx.drawImage(singlePetalSprite, -s * 0.5, -s * 0.5, s, s);
        ctx.restore();
      });

      // --- Project Trunk Ribbon Points ---
      const projTrunk = trunkPoints.map(tp => {
        const p = project(tp, tp.flex);
        return {
          x: p.x,
          y: p.y,
          z: p.z,
          scale: p.scale,
          w: Math.max(1, tp.w * p.scale * zoom)
        };
      });

      const trunkDepth = projTrunk.reduce((acc, p) => acc + p.z, 0) / projTrunk.length;

      // Project Branch Chains
      const projectedChains = branchChains.map(chain => {
        const projPts = chain.points.map(pt => {
          const p = project(pt, pt.flex);
          return {
            x: p.x,
            y: p.y,
            z: p.z,
            scale: p.scale,
            w: Math.max(0.75, pt.w * p.scale * zoom)
          };
        });
        const avgDepth = projPts.reduce((acc, p) => acc + p.z, 0) / projPts.length;
        return {
          type: 'chain',
          points: projPts,
          options: chain.options,
          depth: avgDepth
        };
      }).filter(c => {
        const minY = Math.min(...c.points.map(p => p.y));
        const maxY = Math.max(...c.points.map(p => p.y));
        return maxY > -60 && minY < height + 60;
      });

      // Project Bloom Clusters
      const projectedBlooms = blooms.map(b => {
        const p = project(b, b.flex);
        return {
          type: 'bloom',
          b,
          p,
          depth: p.z + 18
        };
      }).filter(pb => pb.p.y > -180 && pb.p.y < height + 180 && pb.p.x > -180 && pb.p.x < width + 180);

      // Project Drifting Petals
      const projectedPetals = driftingPetals.map(dp => {
        const rad = Math.hypot(dp.x, dp.z);
        const ang = Math.atan2(dp.z, dp.x) + dp.orbitSpeed;
        dp.x = Math.cos(ang) * rad + Math.sin(dp.phase) * 0.45;
        dp.z = Math.sin(ang) * rad + Math.cos(dp.phase) * 0.45;
        dp.y += dp.speedY;

        if (dp.y > bottom + 70) {
          dp.y = -300 - randRange(0, 100);
          dp.x = randRange(-450, 450);
          dp.z = randRange(-450, 450);
        }

        dp.phase += dp.swayFreq;
        dp.pitchPhase += dp.pitchSpeed;
        dp.rollPhase += dp.rollSpeed;
        dp.rotation += dp.spin;

        const p = project(dp);
        return {
          type: 'petal',
          dp,
          p,
          depth: p.z
        };
      }).filter(pp => pp.p.y > -40 && pp.p.y < height + 40 && pp.p.x > -40 && pp.p.x < width + 40);

      // Combine Renderables & Sort Back to Front
      const trunkItem = {
        type: 'trunk_ribbon',
        points: projTrunk,
        depth: trunkDepth
      };

      const renderables = [trunkItem, ...projectedChains, ...projectedBlooms, ...projectedPetals]
        .sort((a, b) => a.depth - b.depth);

      renderables.forEach(item => {
        if (item.type === 'trunk_ribbon') {
          const pts = item.points;
          if (pts.length < 2) return;

          const leftEdges = [];
          const rightEdges = [];

          for (let i = 0; i < pts.length; i++) {
            const prev = pts[Math.max(0, i - 1)];
            const next = pts[Math.min(pts.length - 1, i + 1)];
            const dx = next.x - prev.x;
            const dy = next.y - prev.y;
            const len = Math.hypot(dx, dy) || 1;
            const nx = -dy / len;
            const ny = dx / len;
            const halfW = pts[i].w * 0.5;

            leftEdges.push({ x: pts[i].x - nx * halfW, y: pts[i].y - ny * halfW });
            rightEdges.push({ x: pts[i].x + nx * halfW, y: pts[i].y + ny * halfW });
          }

          const haze = clamp((item.depth + 500) / 1800, 0, 0.40);
          ctx.globalAlpha = 1 - haze * 0.58;

          // Draw seamless filled volumetric trunk ribbon
          for (let i = 0; i < pts.length - 1; i++) {
            const l0 = leftEdges[i], l1 = leftEdges[i + 1];
            const r0 = rightEdges[i], r1 = rightEdges[i + 1];

            const midX = (pts[i].x + pts[i + 1].x) * 0.5;
            const midY = (pts[i].y + pts[i + 1].y) * 0.5;
            const grad = ctx.createLinearGradient(l0.x, l0.y, r0.x, r0.y);
            grad.addColorStop(0, '#15080c');     // Deep shadow edge
            grad.addColorStop(0.32, '#2b171e');  // Charcoal mahogany core
            grad.addColorStop(0.72, '#482a32');  // Warm sepia midtone
            grad.addColorStop(1, '#6f4a54');     // Sunlit cork highlight edge

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(l0.x, l0.y);
            ctx.lineTo(l1.x, l1.y);
            ctx.lineTo(r1.x, r1.y);
            ctx.lineTo(r0.x, r0.y);
            ctx.closePath();
            ctx.fill();

            // Subtle staggered lenticels
            if (pts[i].w > 12.0 && i % 3 === 0) {
              const dx = pts[i + 1].x - pts[i].x;
              const dy = pts[i + 1].y - pts[i].y;
              const len = Math.hypot(dx, dy) || 1;
              const nx = -dy / len;
              const ny = dx / len;
              const dashLen = pts[i].w * 0.22;
              const dashOffset = (Math.sin(i * 9.3) * 0.25) * pts[i].w;

              ctx.lineWidth = 1.1;
              ctx.strokeStyle = 'rgba(185, 138, 150, 0.38)';
              ctx.beginPath();
              ctx.moveTo(midX - nx * dashLen + nx * dashOffset, midY - ny * dashLen + ny * dashOffset);
              ctx.lineTo(midX + nx * dashLen + nx * dashOffset, midY + ny * dashLen + ny * dashOffset);
              ctx.stroke();
            }
          }

          ctx.globalAlpha = 1;

        } else if (item.type === 'chain') {
          const { points, options, depth } = item;
          if (points.length < 2) return;

          const haze = clamp((depth + 500) / 1800, 0, 0.42);
          ctx.globalAlpha = 1 - haze * 0.60;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          const avgW = points.reduce((acc, p) => acc + p.w, 0) / points.length;

          // Continuous base stroke (no segment seams)
          ctx.lineWidth = avgW;
          ctx.strokeStyle = options.isRoot ? '#251518' : (options.isTwig ? '#3c222a' : '#301a21');
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
          }
          ctx.stroke();

          // Continuous soft sunlit highlight ridge along top edge
          if (avgW > 2.8) {
            ctx.lineWidth = Math.max(0.6, avgW * 0.24);
            ctx.strokeStyle = options.isRoot ? 'rgba(92, 58, 54, 0.65)' : 'rgba(125, 84, 96, 0.58)';
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y - avgW * 0.12);
            for (let i = 1; i < points.length; i++) {
              ctx.lineTo(points[i].x, points[i].y - points[i].w * 0.12);
            }
            ctx.stroke();
          }

          ctx.globalAlpha = 1;

        } else if (item.type === 'bloom') {
          const { b, p, depth } = item;
          const r = b.spread * p.scale * zoom;

          const haze = clamp((depth + 400) / 1800, 0, 0.38);
          ctx.globalAlpha = (1 - haze * 0.42) * 0.95;

          ctx.drawImage(b.sprite, p.x - r, p.y - r * 0.65, r * 2, r * 1.3);
          ctx.globalAlpha = 1;

        } else if (item.type === 'petal') {
          const { dp, p } = item;
          const s = dp.size * p.scale * zoom;
          const facing = Math.cos(dp.rollPhase);
          const square = Math.abs(facing);
          const scaleX = 0.22 + square * 0.78;
          const scaleY = 0.85 + Math.abs(Math.cos(dp.pitchPhase)) * 0.15;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(dp.rotation);
          ctx.transform(scaleX, 0, facing * 0.22, scaleY, 0, 0);
          ctx.globalAlpha = dp.opacity * (0.65 + square * 0.35);
          ctx.drawImage(singlePetalSprite, -s * 0.5, -s * 0.5, s, s);
          ctx.restore();
        }
      });
    }

    // --- Synchronize DOM Project Cards in Shared 3D Spiral ---
    cards.forEach((card, i) => {
      const a = i * STEP_ANGLE;
      const p = project({ x: Math.sin(a) * RADIUS, y: i * STEP_HEIGHT, z: Math.cos(a) * RADIUS });
      const distance = Math.abs(i - position);
      const visible = distance < 2.6;
      const scale = p.scale;
      card.style.transform = `translate(-50%, -50%) translate3d(${(p.x - width / 2).toFixed(2)}px, ${(p.y - height / 2).toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
      card.style.opacity = visible ? (i === current ? 1 : Math.max(0.2, 0.58 - distance * 0.12)).toFixed(3) : '0';
      card.style.visibility = visible ? 'visible' : 'hidden';
      card.style.zIndex = p.z > 80 ? String(10 + Math.round(p.z / 50)) : '2';
    });

    if (current !== active) {
      const focusInCard = cards.some(card => card.contains(document.activeElement));
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

  // ==========================================================================
  // 6. AMBIENT ANIMATION LOOP (Paused when out of viewport for 0% CPU overhead)
  // ==========================================================================

  function ambientLoop(now) {
    if (isIntersecting && !staticQuery.matches && !document.hidden) {
      render(currentScrollProgress, now);
    }
    rafId = requestAnimationFrame(ambientLoop);
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      isIntersecting = entries.some(e => e.isIntersecting);
    }, { threshold: 0.05 });
    observer.observe(section);
  }

  window.SakuraSpiral = { render };
  window.addEventListener('resize', resize, { passive: true });
  staticQuery.addEventListener('change', () => { active = -1; resize(); window.dispatchEvent(new Event('scroll')); });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && isIntersecting && !staticQuery.matches) {
      render(currentScrollProgress, performance.now());
    }
  });

  resize();
  rafId = requestAnimationFrame(ambientLoop);
})();
