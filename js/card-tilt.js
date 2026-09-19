/**
 * ADRIAN SETH TABOTABO — 3D HOLOGRAPHIC CARD TILT & SPECULAR GLINT
 * True 3D perspective matrix transformation with dynamic angle glint.
 */

(function () {
  'use strict';

  // Only run 3D tilt on fine pointer devices (desktop)
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const tiltCards = document.querySelectorAll('.glass-card, .flagship-card');

  tiltCards.forEach(card => {
    let bounds;
    let isHovering = false;

    function mouseEnter() {
      bounds = card.getBoundingClientRect();
      isHovering = true;
    }

    function mouseMove(e) {
      if (!isHovering) return;
      bounds = card.getBoundingClientRect();
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const leftX = mouseX - bounds.x;
      const topY = mouseY - bounds.y;
      const center = {
        x: leftX - bounds.width / 2,
        y: topY - bounds.height / 2
      };

      // 3D rotation limits (max 6.5 degrees)
      const rotateX = (center.y / (bounds.height / 2)) * -6.5;
      const rotateY = (center.x / (bounds.width / 2)) * 6.5;

      // Holographic glint angle calculation
      const angle = Math.atan2(center.y, center.x) * (180 / Math.PI) + 90;

      card.style.setProperty('--tilt-rx', `${rotateX.toFixed(2)}deg`);
      card.style.setProperty('--tilt-ry', `${rotateY.toFixed(2)}deg`);
      card.style.setProperty('--tilt-tz', '8px');
      card.style.setProperty('--glint-angle', `${angle.toFixed(1)}deg`);
      card.style.setProperty('--glint-opacity', '0.25');
    }

    function mouseLeave() {
      isHovering = false;
      card.style.setProperty('--tilt-rx', '0deg');
      card.style.setProperty('--tilt-ry', '0deg');
      card.style.setProperty('--tilt-tz', '0px');
      card.style.setProperty('--glint-opacity', '0');
    }

    card.addEventListener('mouseenter', mouseEnter);
    card.addEventListener('mousemove', mouseMove);
    card.addEventListener('mouseleave', mouseLeave);
  });

})();
