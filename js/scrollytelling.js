/**
 * ADRIAN SETH TABOTABO — CINEMATIC SCROLLYTELLING CONTROLLER
 * Continuous smooth RAF physics & momentum engine, centered luxury folio unfolding,
 * horizontal showcase glide, HUD rail synchronization, and sensory triggers.
 */

(function () {
  'use strict';

  // Check reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // DOM Elements
  const tracks = document.querySelectorAll('.scroll-track');
  const hudProgressBar = document.getElementById('hudProgressBar');
  const hudNodes = document.querySelectorAll('.hud-node');
  const navLinks = document.querySelectorAll('.nav-link-item a');

  // Chapter 1 Elements
  const coreStageContainer = document.querySelector('.core-stage-container');
  const coreArena = document.getElementById('coreArena') || document.querySelector('.core-scrolly-arena');
  const coreNarrative = document.getElementById('coreNarrativeCol') || document.querySelector('.core-narrative-col');
  const coreBadgeRow = document.getElementById('coreBadgeRow');
  const coreHeadline = document.getElementById('coreHeadline');
  const coreBio = document.getElementById('coreBio');
  const coreCtaGroup = document.getElementById('coreCtaGroup');
  const coreEmblemCol = document.getElementById('coreEmblemCol') || document.querySelector('.core-emblem-col');
  const emblemPhotoFrame = document.getElementById('emblemPhotoFrame');
  const coreEmblemCard = document.getElementById('coreEmblemCard');
  const coreCredentialsBar = document.getElementById('coreCredentialsBar');
  const credentialItems = document.querySelectorAll('.core-credentials-bar .credential-item');
  const scrollOpenCue = document.getElementById('scrollOpenCue') || document.getElementById('coreScrollCue');

  // Chapter 2 Elements
  const motionStageContainer = document.querySelector('.motion-stage-container');
  const motionSectionHeader = document.querySelector('.motion-stage-container .section-header');
  const motionCyclingCard = document.querySelector('.motion-cycling-card');
  const motionHikingCard = document.querySelector('.motion-hiking-card');
  const cyclingRoutePills = document.querySelectorAll('.motion-cycling-card .route-pill');

  // Chapter 3 Elements
  const studioStageContainer = document.querySelector('.studio-stage-container');
  const studioSectionHeader = document.querySelector('.studio-stage-container .section-header');
  const studioHardwareCard = document.querySelector('.studio-hardware-card');
  const studioStackCard = document.querySelector('.studio-stack-card');
  const specRows = document.querySelectorAll('.spec-row');

  // Chapter 4 Elements
  const horizontalSection = document.getElementById('showcase');
  const horizontalTrack = document.getElementById('horizontalTrack');
  const flagshipCards = document.querySelectorAll('.flagship-card');
  const creationStatusText = document.getElementById('creationStatusText');

  // Chapter 5 Elements
  const curiositiesStageContainer = document.querySelector('.curiosities-stage-container');
  const curiositiesSectionHeader = document.querySelector('.curiosities-stage-container .section-header');
  const cabinetCards = document.querySelectorAll('.cabinet-card');

  // Chapter 6 Elements
  const outroStageContainer = document.querySelector('.outro-stage-container');
  const outroCard = document.querySelector('.outro-card');

  // Ambient Parallax Elements
  const ambientGlow1 = document.querySelector('.ambient-glow-1');
  const ambientGlow2 = document.querySelector('.ambient-glow-2');
  const ambientGlow3 = document.querySelector('.ambient-glow-3');

  const CREATION_LABELS = [
    'Project 01 / 04: VeraLove',
    'Project 02 / 04: Wildcat One',
    'Project 03 / 04: Crack Detector + ESP32',
    'Project 04 / 04: Banter',
    'The Engineering Archive (17 Repos)'
  ];

  // Tracking state
  let lastActiveChapterId = '';
  let trackMetrics = [];

  // Kinetic RAF Physics State
  let targetScrollY = 0;
  let smoothScrollY = 0;
  let isLoopRunning = false;
  let lastFrameTime = performance.now();
  let currentVelocity = 0;

  // Active Emblem shifts (to accurately compensate when measuring)
  let currentEmblemShiftX = 0;
  let currentEmblemShiftY = 0;
  let cachedDeltaX = 0;
  let cachedDeltaY = 0;

  /**
   * High-Performance Organic Easing Curves for Silky Motion
   */
  // Ken Perlin's quintic smootherstep (zero 1st & 2nd derivatives at ends - eliminates snappy step-locks)
  function smootherstep(t) {
    const clamped = Math.max(0, Math.min(1, t));
    return clamped * clamped * clamped * (clamped * (clamped * 6 - 15) + 10);
  }

  // Smoothstep (cubic Hermite)
  function smoothstep(t) {
    const clamped = Math.max(0, Math.min(1, t));
    return clamped * clamped * (3 - 2 * clamped);
  }

  // Cubic ease out
  function easeOutCubic(t) {
    const clamped = Math.max(0, Math.min(1, t));
    return 1 - Math.pow(1 - clamped, 3);
  }

  // Sinusoidal ease in-out
  function easeInOutSine(t) {
    const clamped = Math.max(0, Math.min(1, t));
    return 0.5 - 0.5 * Math.cos(clamped * Math.PI);
  }

  /**
   * Measure true horizontal and vertical shift required to place
   * the centerpiece card dead center in the viewport/stage at p = 0.
   * Measures the centerpiece card directly with neutral un-animated transforms.
   */
  function updateEmblemStageCenterDelta() {
    if (!coreEmblemCol || !coreEmblemCard) return;

    const stageCenterX = window.innerWidth / 2;
    const stageCenterY = window.innerHeight / 2;

    // Temporarily reset transforms & animation to read pure unshifted layout geometry
    const prevColTransform = coreEmblemCol.style.transform;
    const prevColTranslate = coreEmblemCol.style.translate;
    const prevCardAnimation = coreEmblemCard.style.animation;
    const prevCardTransform = coreEmblemCard.style.transform;

    coreEmblemCol.style.transform = 'none';
    coreEmblemCol.style.translate = 'none';
    coreEmblemCard.style.animation = 'none';
    coreEmblemCard.style.transform = 'none';

    // Measure the actual centerpiece card directly
    const cardRect = coreEmblemCard.getBoundingClientRect();
    const naturalCardCenterX = cardRect.left + cardRect.width / 2;
    const naturalCardCenterY = cardRect.top + cardRect.height / 2;

    cachedDeltaX = stageCenterX - naturalCardCenterX;
    cachedDeltaY = stageCenterY - naturalCardCenterY;

    // Restore previous inline styles
    coreEmblemCol.style.transform = prevColTransform;
    coreEmblemCol.style.translate = prevColTranslate;
    coreEmblemCard.style.animation = prevCardAnimation;
    coreEmblemCard.style.transform = prevCardTransform;
  }

  /**
   * Measure track metrics on page resize / load
   */
  function updateMetrics() {
    const windowHeight = window.innerHeight;
    trackMetrics = Array.from(tracks).map(track => {
      const top = track.offsetTop;
      const height = track.offsetHeight;
      const scrollableDistance = Math.max(height - windowHeight, 1);
      return {
        track,
        id: track.getAttribute('data-chapter') || track.id,
        top,
        height,
        scrollableDistance
      };
    });
    updateEmblemStageCenterDelta();
  }

  /**
   * Calculate exact progress [0, 1] for a track given a scroll position
   */
  function getTrackProgress(trackId, scrollY) {
    const metric = trackMetrics.find(m => m.id === trackId);
    if (!metric) return 0;
    if (scrollY <= metric.top) return 0;
    if (scrollY >= metric.top + metric.scrollableDistance) return 1;
    return (scrollY - metric.top) / metric.scrollableDistance;
  }

  /**
   * Main Render Frame
   */
  function renderFrame(scrollY) {
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    const isMobile = windowWidth <= 768;
    const docHeight = document.documentElement.scrollHeight;
    const totalScrollable = Math.max(docHeight - windowHeight, 1);

    // 1. Global HUD Progress Bar Update
    if (hudProgressBar && totalScrollable > 0) {
      const globalProgress = Math.min(Math.max(scrollY / totalScrollable, 0), 1);
      hudProgressBar.style.height = `${(globalProgress * 100).toFixed(2)}%`;
    }

    // 1b. Kinetic Parallax for Ambient Background Orbs
    if (ambientGlow1) ambientGlow1.style.transform = `translate3d(0, ${(scrollY * -0.05).toFixed(1)}px, 0)`;
    if (ambientGlow2) ambientGlow2.style.transform = `translate3d(0, ${(scrollY * -0.03).toFixed(1)}px, 0)`;
    if (ambientGlow3) ambientGlow3.style.transform = `translate3d(0, ${(scrollY * -0.07).toFixed(1)}px, 0)`;

    // 1c. Kinetic Physical Tilt from Scroll Velocity
    if (coreEmblemCard && !prefersReducedMotion) {
      const kineticPitch = Math.max(Math.min(currentVelocity * 0.003, 2.0), -2.0);
      coreEmblemCard.style.setProperty('--scroll-pitch', `${kineticPitch.toFixed(2)}deg`);
    }

    // 2. Determine Currently Active Chapter
    const centerTrigger = windowHeight * 0.40;
    let currentChapterId = '';

    trackMetrics.forEach(metric => {
      const top = metric.top - scrollY;
      const bottom = top + metric.height;
      if (top <= centerTrigger && bottom >= centerTrigger) {
        currentChapterId = metric.id;
      }
    });

    if (!currentChapterId && trackMetrics.length > 0) {
      if (scrollY < 100) {
        currentChapterId = trackMetrics[0].id;
      } else {
        currentChapterId = trackMetrics[trackMetrics.length - 1].id;
      }
    }

    if (currentChapterId && currentChapterId !== lastActiveChapterId) {
      const chapterIndex = trackMetrics.findIndex(t => t.id === currentChapterId);

      // Update HUD Active State
      hudNodes.forEach(node => {
        if (node.getAttribute('data-chapter') === currentChapterId) {
          node.classList.add('active');
        } else {
          node.classList.remove('active');
        }
      });

      // Update Floating Nav Active State
      navLinks.forEach(link => {
        if (link.getAttribute('href') === `#${currentChapterId}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      // Trigger sensory harmonic chime on chapter entry (if enabled)
      if (window.playHarmonicChime && lastActiveChapterId !== '') {
        window.playHarmonicChime(chapterIndex >= 0 ? chapterIndex % 6 : 2, 0.04);
      }

      // Trigger gentle fluid simulation burst on chapter transition
      if (window.triggerFluidSplat && lastActiveChapterId !== '') {
        window.triggerFluidSplat(windowWidth * 0.5, windowHeight * 0.5, 1.2);
      }

      lastActiveChapterId = currentChapterId;
    }

    // If user prefers reduced motion, ensure all content is statically visible
    if (prefersReducedMotion) {
      document.querySelectorAll('.stage-container').forEach(c => {
        c.style.removeProperty('--stage-opacity');
        c.style.removeProperty('--stage-translate-y');
        c.style.removeProperty('--stage-scale');
      });
      [coreBadgeRow, coreHeadline, coreBio, coreCtaGroup, coreNarrative, coreCredentialsBar, coreEmblemCol].forEach(el => {
        if (el) {
          el.style.opacity = '1';
          el.style.transform = 'none';
          el.style.translate = 'none';
          el.style.pointerEvents = 'auto';
        }
      });
      return;
    }

    // ------------------------------------------------------------------------
    // CHAPTER 1: THE CORE (Scroll-Driven Introduction of Myself)
    // ------------------------------------------------------------------------
    const coreTrack = document.getElementById('core');
    if (coreTrack) {
      const p = getTrackProgress('core', scrollY);
      coreTrack.style.setProperty('--chapter-progress', p.toFixed(4));

      // 0. Levitation Class Toggle:
      // Weightless breathing at rest (p < 0.02); remove on scroll to let scrollytelling transforms take full control
      if (coreEmblemCard) {
        if (p < 0.02) {
          if (!coreEmblemCard.classList.contains('levitating')) {
            coreEmblemCard.classList.add('levitating');
          }
        } else {
          if (coreEmblemCard.classList.contains('levitating')) {
            coreEmblemCard.classList.remove('levitating');
          }
        }
      }

      // Beat 1 (p: 0.00 - 0.35): Theatrical "French Doors" Opening Unfold
      // Centerpiece card docks to right while narrative unfolds to left like opening a luxury silk folio
      const unfoldP = Math.min(Math.max(p / 0.35, 0), 1);
      // Silky smootherstep ease (zero initial and final jerk)
      const easeUnfold = smootherstep(unfoldP);

      // 1. Scroll-to-open invitation cue inside the centerpiece card
      if (scrollOpenCue) {
        const cueOp = Math.max(1 - smootherstep(p / 0.10), 0);
        scrollOpenCue.style.opacity = cueOp.toFixed(2);
        scrollOpenCue.style.pointerEvents = cueOp <= 0.05 ? 'none' : 'auto';
        scrollOpenCue.style.transform = `translate3d(0, ${((1 - cueOp) * 8).toFixed(1)}px, 0)`;
      }

      // 2. Emblem Column glide: Starts dead center at p = 0, docks to right at p = 0.35
      if (coreEmblemCol) {
        currentEmblemShiftX = cachedDeltaX * (1 - easeUnfold);
        currentEmblemShiftY = cachedDeltaY * (1 - easeUnfold);

        coreEmblemCol.style.transform = `translate3d(${currentEmblemShiftX.toFixed(2)}px, ${currentEmblemShiftY.toFixed(2)}px, 0)`;
        coreEmblemCol.style.translate = 'none';
      }

      // 3. Narrative Column unfold: Staggered Folio Cascade
      const getLayerProgress = (val, min, max) => Math.min(Math.max((val - min) / (max - min), 0), 1);

      if (coreNarrative) {
        coreNarrative.style.opacity = '1';
        coreNarrative.style.pointerEvents = p > 0.06 ? 'auto' : 'none';
      }

      // Layer 1: Hero Headline (p: 0.05 -> 0.20)
      if (coreHeadline) {
        const l1P = getLayerProgress(p, 0.05, 0.20);
        const l1Ease = smootherstep(l1P);
        coreHeadline.style.opacity = l1Ease.toFixed(3);
        const offset1 = (1 - l1Ease) * (!isMobile ? -42 : 18);
        coreHeadline.style.transform = !isMobile ? `translate3d(${offset1.toFixed(1)}px, 0, 0)` : `translate3d(0, ${offset1.toFixed(1)}px, 0)`;
        coreHeadline.style.pointerEvents = l1Ease > 0.3 ? 'auto' : 'none';
      }

      // Layer 2: Biography Paragraph (p: 0.13 -> 0.27)
      if (coreBio) {
        const l2P = getLayerProgress(p, 0.13, 0.27);
        const l2Ease = smootherstep(l2P);
        coreBio.style.opacity = l2Ease.toFixed(3);
        const offset2 = (1 - l2Ease) * (!isMobile ? -38 : 16);
        coreBio.style.transform = !isMobile ? `translate3d(${offset2.toFixed(1)}px, 0, 0)` : `translate3d(0, ${offset2.toFixed(1)}px, 0)`;
        coreBio.style.pointerEvents = l2Ease > 0.3 ? 'auto' : 'none';
      }

      // Layer 3: CTA Action Group (p: 0.21 -> 0.35)
      if (coreCtaGroup) {
        const l3P = getLayerProgress(p, 0.21, 0.35);
        const l3Ease = smootherstep(l3P);
        coreCtaGroup.style.opacity = l3Ease.toFixed(3);
        const offset3 = (1 - l3Ease) * (!isMobile ? -32 : 14);
        coreCtaGroup.style.transform = !isMobile ? `translate3d(${offset3.toFixed(1)}px, 0, 0)` : `translate3d(0, ${offset3.toFixed(1)}px, 0)`;
        coreCtaGroup.style.pointerEvents = l3Ease > 0.3 ? 'auto' : 'none';
      }

      // 4. Photo Frame Scale Transformation
      if (emblemPhotoFrame) {
        const scaleVal = Math.max(1.04 - easeUnfold * 0.04, 1.0);
        emblemPhotoFrame.style.scale = scaleVal.toFixed(3);
      }

      // 5. Ambient aura breathing
      if (coreEmblemCard) {
        const auraScale = 1 + Math.min(p / 0.5, 1) * 0.15;
        coreEmblemCard.style.setProperty('--aura-scale', auraScale.toFixed(2));
      }

      // 6. Beat 2 (p: 0.40 - 0.80): Technical Credentials Wave Revelation
      if (coreCredentialsBar) {
        const credP = Math.min(Math.max((p - 0.40) / 0.35, 0), 1);
        const credEase = smootherstep(credP);
        coreCredentialsBar.style.opacity = credEase.toFixed(2);
        coreCredentialsBar.style.transform = `translate3d(0, ${((1 - credEase) * 24).toFixed(1)}px, 0)`;
        coreCredentialsBar.style.translate = 'none';
        coreCredentialsBar.style.pointerEvents = credEase > 0.25 ? 'auto' : 'none';

        // Sequential milestone illumination as progress advances
        credentialItems.forEach((item, idx) => {
          const itemThreshold = 0.46 + idx * 0.08;
          if (p >= itemThreshold) {
            item.classList.add('highlight-active');
          } else {
            item.classList.remove('highlight-active');
          }
        });
      }

      // 7. Beat 3 (p: 0.85 - 1.00): Seamless Morphing Horizon into Chapter 2
      if (coreStageContainer) {
        if (p > 0.85) {
          const exitP = Math.min(Math.max((p - 0.85) / 0.15, 0), 1);
          const exitEase = smootherstep(exitP);
          coreStageContainer.style.setProperty('--stage-opacity', (1 - exitEase).toFixed(2));
          coreStageContainer.style.setProperty('--stage-translate-y', `${(-exitEase * 32).toFixed(1)}px`);
          coreStageContainer.style.setProperty('--stage-scale', (1 - exitEase * 0.025).toFixed(3));
        } else {
          coreStageContainer.style.setProperty('--stage-opacity', '1');
          coreStageContainer.style.setProperty('--stage-translate-y', '0px');
          coreStageContainer.style.setProperty('--stage-scale', '1');
        }
      }
    }

    // ------------------------------------------------------------------------
    // CHAPTER 2: IN MOTION (Cycling & Hiking Trails)
    // ------------------------------------------------------------------------
    const motionTrack = document.getElementById('motion');
    if (motionTrack) {
      const p = getTrackProgress('motion', scrollY);
      motionTrack.style.setProperty('--chapter-progress', p.toFixed(4));

      if (motionSectionHeader) {
        const headP = Math.min(Math.max(p / 0.25, 0), 1);
        const headEase = smootherstep(headP);
        motionSectionHeader.style.opacity = (0.15 + headEase * 0.85).toFixed(2);
        motionSectionHeader.style.transform = `translate3d(0, ${((1 - headEase) * 20).toFixed(1)}px, 0)`;
        motionSectionHeader.style.translate = 'none';
      }

      if (!isMobile) {
        // Desktop: Side-by-side glide
        if (motionCyclingCard) {
          const cP = Math.min(Math.max(p / 0.45, 0), 1);
          const cEase = smootherstep(cP);
          motionCyclingCard.style.opacity = (0.15 + cEase * 0.85).toFixed(2);
          motionCyclingCard.style.transform = `translate3d(${((1 - cEase) * -36).toFixed(1)}px, 0, 0)`;
          motionCyclingCard.style.translate = 'none';
          motionCyclingCard.style.pointerEvents = cEase > 0.1 ? 'auto' : 'none';
        }

        if (motionHikingCard) {
          const hP = Math.min(Math.max((p - 0.15) / 0.45, 0), 1);
          const hEase = smootherstep(hP);
          motionHikingCard.style.opacity = (0.15 + hEase * 0.85).toFixed(2);
          motionHikingCard.style.transform = `translate3d(${((1 - hEase) * 36).toFixed(1)}px, 0, 0)`;
          motionHikingCard.style.translate = 'none';
          motionHikingCard.style.pointerEvents = hEase > 0.1 ? 'auto' : 'none';
        }
      } else {
        // Mobile: Card cross-fade inside single area (no overflow)
        if (motionCyclingCard && motionHikingCard) {
          if (p < 0.48) {
            const cP = Math.min(Math.max(p / 0.30, 0), 1);
            const cEase = smootherstep(cP);
            motionCyclingCard.style.opacity = (0.2 + cEase * 0.8).toFixed(2);
            motionCyclingCard.style.pointerEvents = 'auto';
            motionHikingCard.style.opacity = '0';
            motionHikingCard.style.pointerEvents = 'none';
          } else {
            const hP = Math.min(Math.max((p - 0.48) / 0.30, 0), 1);
            const hEase = smootherstep(hP);
            motionCyclingCard.style.opacity = '0';
            motionCyclingCard.style.pointerEvents = 'none';
            motionHikingCard.style.opacity = (0.2 + hEase * 0.8).toFixed(2);
            motionHikingCard.style.pointerEvents = 'auto';
          }
          motionCyclingCard.style.transform = 'none';
          motionHikingCard.style.transform = 'none';
          motionCyclingCard.style.translate = 'none';
          motionHikingCard.style.translate = 'none';
        }
      }

      // Highlight route pills sequentially
      cyclingRoutePills.forEach((pill, idx) => {
        const threshold = 0.20 + idx * 0.05;
        if (p >= threshold) {
          pill.classList.add('highlight');
        } else if (idx >= 3) {
          pill.classList.remove('highlight');
        }
      });

      // Exit dissolve into Chapter 3
      if (motionStageContainer) {
        if (p > 0.85) {
          const exitP = Math.min(Math.max((p - 0.85) / 0.15, 0), 1);
          const exitEase = smootherstep(exitP);
          motionStageContainer.style.setProperty('--stage-opacity', (1 - exitEase).toFixed(2));
          motionStageContainer.style.setProperty('--stage-translate-y', `${(-exitEase * 28).toFixed(1)}px`);
          motionStageContainer.style.setProperty('--stage-scale', (1 - exitEase * 0.02).toFixed(3));
        } else {
          motionStageContainer.style.setProperty('--stage-opacity', '1');
          motionStageContainer.style.setProperty('--stage-translate-y', '0px');
          motionStageContainer.style.setProperty('--stage-scale', '1');
        }
      }
    }

    // ------------------------------------------------------------------------
    // CHAPTER 3: THE STUDIO (Dev Rig & Weaponry)
    // ------------------------------------------------------------------------
    const studioTrack = document.getElementById('studio');
    if (studioTrack) {
      const p = getTrackProgress('studio', scrollY);
      studioTrack.style.setProperty('--chapter-progress', p.toFixed(4));

      if (studioSectionHeader) {
        const headP = Math.min(Math.max(p / 0.25, 0), 1);
        const headEase = smootherstep(headP);
        studioSectionHeader.style.opacity = (0.15 + headEase * 0.85).toFixed(2);
        studioSectionHeader.style.transform = `translate3d(0, ${((1 - headEase) * 20).toFixed(1)}px, 0)`;
        studioSectionHeader.style.translate = 'none';
      }

      if (!isMobile) {
        // Desktop: Side-by-side glide
        if (studioHardwareCard) {
          const hwP = Math.min(Math.max(p / 0.40, 0), 1);
          const hwEase = smootherstep(hwP);
          studioHardwareCard.style.opacity = (0.15 + hwEase * 0.85).toFixed(2);
          studioHardwareCard.style.transform = `translate3d(0, ${((1 - hwEase) * 30).toFixed(1)}px, 0)`;
          studioHardwareCard.style.translate = 'none';
          studioHardwareCard.style.pointerEvents = hwEase > 0.1 ? 'auto' : 'none';
        }

        if (studioStackCard) {
          const stP = Math.min(Math.max((p - 0.20) / 0.45, 0), 1);
          const stEase = smootherstep(stP);
          studioStackCard.style.opacity = (0.15 + stEase * 0.85).toFixed(2);
          studioStackCard.style.transform = `translate3d(0, ${((1 - stEase) * 30).toFixed(1)}px, 0)`;
          studioStackCard.style.translate = 'none';
          studioStackCard.style.pointerEvents = stEase > 0.1 ? 'auto' : 'none';
        }
      } else {
        // Mobile: Cross-fade inside single area
        if (studioHardwareCard && studioStackCard) {
          if (p < 0.48) {
            const hwP = Math.min(Math.max(p / 0.30, 0), 1);
            studioHardwareCard.style.opacity = (0.2 + hwP * 0.8).toFixed(2);
            studioHardwareCard.style.pointerEvents = 'auto';
            studioStackCard.style.opacity = '0';
            studioStackCard.style.pointerEvents = 'none';
          } else {
            const stP = Math.min(Math.max((p - 0.48) / 0.30, 0), 1);
            studioHardwareCard.style.opacity = '0';
            studioHardwareCard.style.pointerEvents = 'none';
            studioStackCard.style.opacity = (0.2 + stP * 0.8).toFixed(2);
            studioStackCard.style.pointerEvents = 'auto';
          }
          studioHardwareCard.style.transform = 'none';
          studioStackCard.style.transform = 'none';
          studioHardwareCard.style.translate = 'none';
          studioStackCard.style.translate = 'none';
        }
      }

      // Diagnostic sequential spec rows highlight
      specRows.forEach((row, idx) => {
        const threshold = 0.12 + idx * 0.07;
        if (p >= threshold) {
          row.classList.add('active-spec');
        } else {
          row.classList.remove('active-spec');
        }
      });

      // Exit dissolve into Chapter 4
      if (studioStageContainer) {
        if (p > 0.85) {
          const exitP = Math.min(Math.max((p - 0.85) / 0.15, 0), 1);
          const exitEase = smootherstep(exitP);
          studioStageContainer.style.setProperty('--stage-opacity', (1 - exitEase).toFixed(2));
          studioStageContainer.style.setProperty('--stage-translate-y', `${(-exitEase * 28).toFixed(1)}px`);
          studioStageContainer.style.setProperty('--stage-scale', (1 - exitEase * 0.02).toFixed(3));
        } else {
          studioStageContainer.style.setProperty('--stage-opacity', '1');
          studioStageContainer.style.setProperty('--stage-translate-y', '0px');
          studioStageContainer.style.setProperty('--stage-scale', '1');
        }
      }
    }

    // ------------------------------------------------------------------------
    // CHAPTER 4: THE CREATIONS (Flagship Horizontal Glide & Lab Archive)
    // ------------------------------------------------------------------------
    if (horizontalSection && horizontalTrack) {
      const p = getTrackProgress('showcase', scrollY);
      horizontalSection.style.setProperty('--chapter-progress', p.toFixed(4));

      const trackWidth = horizontalTrack.scrollWidth;
      const maxTranslate = Math.max(trackWidth - windowWidth + (isMobile ? 24 : 48), 0);

      // Kinetic smootherstep translation curve
      const easeP = smootherstep(p);
      const translateX = -(easeP * maxTranslate);
      horizontalTrack.style.transform = `translate3d(${translateX.toFixed(1)}px, 0, 0)`;

      // Dynamic 3D Focal Carousel Depth
      const cardCount = flagshipCards.length;
      const floatIndex = easeP * (cardCount - 1);
      const activeIdx = Math.min(Math.round(floatIndex), cardCount - 1);

      flagshipCards.forEach((card, idx) => {
        const distFromCenter = Math.abs(floatIndex - idx);
        const cardScale = Math.max(1.02 - distFromCenter * 0.035, 0.96);
        const cardOpacity = Math.max(1.0 - distFromCenter * 0.22, 0.55);

        if (idx === activeIdx) {
          card.classList.add('is-active-project');
        } else {
          card.classList.remove('is-active-project');
        }

        if (!isMobile) {
          card.style.transform = `scale(${cardScale.toFixed(3)})`;
          card.style.opacity = cardOpacity.toFixed(2);
        }
      });

      if (creationStatusText) {
        creationStatusText.textContent = CREATION_LABELS[activeIdx] || CREATION_LABELS[0];
      }
    }

    // ------------------------------------------------------------------------
    // CHAPTER 5: SENSES & SOUL (Curiosity Cabinet)
    // ------------------------------------------------------------------------
    const curiositiesTrack = document.getElementById('curiosities');
    if (curiositiesTrack) {
      const p = getTrackProgress('curiosities', scrollY);
      curiositiesTrack.style.setProperty('--chapter-progress', p.toFixed(4));

      if (curiositiesSectionHeader) {
        const headP = Math.min(Math.max(p / 0.25, 0), 1);
        const headEase = smootherstep(headP);
        curiositiesSectionHeader.style.opacity = (0.15 + headEase * 0.85).toFixed(2);
        curiositiesSectionHeader.style.transform = `translate3d(0, ${((1 - headEase) * 20).toFixed(1)}px, 0)`;
        curiositiesSectionHeader.style.translate = 'none';
      }

      if (!isMobile) {
        // Desktop: Staggered entrance with smootherstep
        cabinetCards.forEach((card, idx) => {
          const start = 0.05 + idx * 0.16;
          const end = start + 0.35;
          const cP = Math.min(Math.max((p - start) / (end - start), 0), 1);
          const cEase = smootherstep(cP);
          card.style.opacity = (0.15 + cEase * 0.85).toFixed(2);
          card.style.transform = `translate3d(0, ${((1 - cEase) * 28).toFixed(1)}px, 0) scale(${(0.97 + cEase * 0.03).toFixed(3)})`;
          card.style.translate = 'none';
          card.style.pointerEvents = cEase > 0.1 ? 'auto' : 'none';
        });
      } else {
        // Mobile: Step-through cross-fade of the 3 cards
        const step = 1 / cabinetCards.length;
        cabinetCards.forEach((card, idx) => {
          const cardStart = idx * step;
          const cardEnd = (idx + 1) * step;
          const isCurrent = (p >= cardStart && p < cardEnd) || (idx === cabinetCards.length - 1 && p >= cardStart);
          card.style.opacity = isCurrent ? '1' : '0';
          card.style.pointerEvents = isCurrent ? 'auto' : 'none';
          card.style.transform = 'none';
          card.style.translate = 'none';
        });
      }

      // Exit dissolve into Chapter 6
      if (curiositiesStageContainer) {
        if (p > 0.85) {
          const exitP = Math.min(Math.max((p - 0.85) / 0.15, 0), 1);
          const exitEase = smootherstep(exitP);
          curiositiesStageContainer.style.setProperty('--stage-opacity', (1 - exitEase).toFixed(2));
          curiositiesStageContainer.style.setProperty('--stage-translate-y', `${(-exitEase * 28).toFixed(1)}px`);
          curiositiesStageContainer.style.setProperty('--stage-scale', (1 - exitEase * 0.02).toFixed(3));
        } else {
          curiositiesStageContainer.style.setProperty('--stage-opacity', '1');
          curiositiesStageContainer.style.setProperty('--stage-translate-y', '0px');
          curiositiesStageContainer.style.setProperty('--stage-scale', '1');
        }
      }
    }

    // ------------------------------------------------------------------------
    // CHAPTER 6: OUTRO & CONNECTION
    // ------------------------------------------------------------------------
    const contactTrack = document.getElementById('contact');
    if (contactTrack && outroCard) {
      const p = getTrackProgress('contact', scrollY);
      contactTrack.style.setProperty('--chapter-progress', p.toFixed(4));

      const oP = Math.min(Math.max(p / 0.50, 0), 1);
      const oEase = smootherstep(oP);
      outroCard.style.opacity = (0.15 + oEase * 0.85).toFixed(2);
      outroCard.style.transform = `translate3d(0, ${((1 - oEase) * 24).toFixed(1)}px, 0) scale(${(0.95 + oEase * 0.05).toFixed(3)})`;
      outroCard.style.translate = 'none';
    }
  }

  /**
   * Continuous RAF loop with delta-time aware exponential smoothing physics & velocity tracking
   */
  function rafLoop(currentTime) {
    const dt = Math.min((currentTime - lastFrameTime) / 1000, 0.05); // clamp to 50ms (20fps floor)
    lastFrameTime = currentTime;

    // Weight-governed silk gliding physics (lambda = 8.5)
    const lambda = 8.5;
    const factor = 1 - Math.exp(-lambda * dt);

    const prevSmooth = smoothScrollY;
    const diff = targetScrollY - smoothScrollY;

    if (Math.abs(diff) > 0.05) {
      smoothScrollY += diff * factor;
      currentVelocity = dt > 0 ? (smoothScrollY - prevSmooth) / dt : 0;
      renderFrame(smoothScrollY);
      requestAnimationFrame(rafLoop);
    } else {
      // Settled cleanly at rest
      smoothScrollY = targetScrollY;
      currentVelocity = 0;
      renderFrame(smoothScrollY);
      isLoopRunning = false;
    }
  }

  /**
   * Trigger on native scroll event
   */
  function onScroll() {
    targetScrollY = Math.max(0, window.pageYOffset || document.documentElement.scrollTop || 0);
    if (!isLoopRunning) {
      lastFrameTime = performance.now();
      isLoopRunning = true;
      requestAnimationFrame(rafLoop);
    }
  }

  /**
   * Force instantaneous re-metric and render (used on load and resize)
   */
  function forceImmediateRender() {
    updateMetrics();
    targetScrollY = Math.max(0, window.pageYOffset || document.documentElement.scrollTop || 0);
    smoothScrollY = targetScrollY;
    renderFrame(smoothScrollY);
  }

  // Scroll to open invitation interaction
  if (scrollOpenCue) {
    scrollOpenCue.addEventListener('click', () => {
      const coreTrack = document.getElementById('core');
      if (coreTrack) {
        const targetY = coreTrack.offsetTop + coreTrack.offsetHeight * 0.42;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }
    });
    scrollOpenCue.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        scrollOpenCue.click();
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    forceImmediateRender();
  }, { passive: true });

  window.addEventListener('portfolioLoaded', () => {
    forceImmediateRender();
  });

  // Initial trigger once DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    forceImmediateRender();
  });

  // Immediate initial calculation
  forceImmediateRender();

})();
