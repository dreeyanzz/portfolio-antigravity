/**
 * ADRIAN SETH TABOTABO — SILK PETAL WAVE & SOFT-FOCUS MOTION BLUR
 * Replaces harsh hacker scrambles with an ethereal, serene petal-blur wave
 * that ripples across the typography with soft rose glow and zero layout jitter.
 */

(function () {
  'use strict';

  // Prepare targeted titles with petal-char spans
  const targetElements = document.querySelectorAll('.centerpiece-title, .section-title, [data-scramble]');

  targetElements.forEach(el => {
    // Preserve original text content
    const text = el.textContent.trim();
    el.dataset.originalText = text;

    // Split into character spans while preserving whitespace
    let html = '';
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === ' ') {
        html += '<span class="petal-space">&nbsp;</span>';
      } else {
        html += `<span class="petal-char" data-char="${char}">${char}</span>`;
      }
    }
    el.innerHTML = html;

    let isWaving = false;

    function triggerSilkWave() {
      if (isWaving) return;
      isWaving = true;

      const chars = el.querySelectorAll('.petal-char');
      if (!chars.length) {
        isWaving = false;
        return;
      }

      chars.forEach((char, idx) => {
        // Staggered forward wave delay: 24ms per character
        setTimeout(() => {
          char.classList.add('active-blur');

          // Gentle refocus back to crisp velvet: 170ms duration
          setTimeout(() => {
            char.classList.remove('active-blur');

            if (idx === chars.length - 1) {
              setTimeout(() => {
                isWaving = false;
              }, 150);
            }
          }, 170);
        }, idx * 24);
      });
    }

    // Trigger on hover
    el.addEventListener('mouseenter', triggerSilkWave);

    // Also trigger subtly on initial viewport scroll entry
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setTimeout(triggerSilkWave, 350);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });

      observer.observe(el);
    }
  });

})();
