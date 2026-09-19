/**
 * ADRIAN SETH TABOTABO — BLOOMING PETAL IRIS PRELOADER
 * Minimalist 0-100% counter, liquid progress bar, and blooming iris aperture opening sequence.
 * Enforces scroll lock and zero-offset start until aperture sequence completes.
 */

(function () {
  'use strict';

  // Force scroll restoration to manual and ensure top position on initial load / reload
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  const preloader = document.getElementById('preloader');
  const counterText = document.getElementById('preloaderCounter');
  const progressBar = document.getElementById('preloaderBar');

  // Input lock while preloader runs
  let isScrollLocked = true;

  function preventDefaultScroll(e) {
    if (isScrollLocked) {
      e.preventDefault();
    }
  }

  function preventKeyScroll(e) {
    if (!isScrollLocked) return;
    const scrollKeys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', 'Space', ' '];
    if (scrollKeys.includes(e.key)) {
      e.preventDefault();
    }
  }

  function enforceTopScroll() {
    if (isScrollLocked && (window.pageYOffset > 0 || document.documentElement.scrollTop > 0)) {
      window.scrollTo(0, 0);
    }
  }

  window.addEventListener('wheel', preventDefaultScroll, { passive: false });
  window.addEventListener('touchmove', preventDefaultScroll, { passive: false });
  window.addEventListener('keydown', preventKeyScroll, { passive: false });
  window.addEventListener('scroll', enforceTopScroll, { passive: false });

  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      window.scrollTo(0, 0);
    }
  });

  window.addEventListener('beforeunload', () => {
    window.scrollTo(0, 0);
  });

  function unlockScroll() {
    isScrollLocked = false;
    window.removeEventListener('wheel', preventDefaultScroll);
    window.removeEventListener('touchmove', preventDefaultScroll);
    window.removeEventListener('keydown', preventKeyScroll);
    window.removeEventListener('scroll', enforceTopScroll);
    document.documentElement.classList.remove('scroll-locked');
    document.body.classList.remove('scroll-locked');
    window.scrollTo(0, 0);
  }

  if (!preloader || !counterText || !progressBar) {
    unlockScroll();
    return;
  }

  let progress = 0;
  const startTime = performance.now();
  const duration = 1350; // 1.35s silky loading duration

  function updateLoading(currentTime) {
    const elapsed = currentTime - startTime;
    const rawProgress = Math.min(elapsed / duration, 1.0);
    // Cubic ease out
    const easedProgress = 1 - Math.pow(1 - rawProgress, 3);
    progress = Math.floor(easedProgress * 100);

    counterText.textContent = `${progress}%`;
    progressBar.style.width = `${progress}%`;

    if (rawProgress < 1.0) {
      requestAnimationFrame(updateLoading);
    } else {
      // Completed 100%! Trigger Blooming Iris Aperture opening
      setTimeout(() => {
        preloader.classList.add('iris-open');
        document.body.classList.add('site-revealed');

        // Play gentle introductory chime
        if (window.playHarmonicChime) {
          window.playHarmonicChime(4, 0.1);
        }

        // Petals blossom outward with 1.1s cubic-bezier transition.
        // Only unlock scroll after blooming petal iris aperture animation has finished opening
        setTimeout(() => {
          unlockScroll();
          preloader.style.display = 'none';

          // Dispatch loaded event for scrollytelling and shader resizing
          window.dispatchEvent(new CustomEvent('portfolioLoaded'));
        }, 1150);
      }, 120);
    }
  }

  requestAnimationFrame(updateLoading);
})();
