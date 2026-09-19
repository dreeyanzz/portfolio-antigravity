/**
 * ADRIAN SETH TABOTABO — MAIN APPLICATION ENTRY
 * Orchestration, smooth anchor handling, and developer console greeting.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  // Smooth Scrolling for Internal Links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId) return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Developer Console Easter Egg
  console.log(
    `%c🌸 Adrian Seth Tabotabo — Portfolio %c\n` +
    `Computer Engineering @ CIT-U | Full-Stack Developer\n` +
    `Let's connect: adrian.tabotabo225@gmail.com\n` +
    `GitHub: https://github.com/dreeyanzz`,
    'color: #FB7185; font-size: 14px; font-weight: bold; background: #FAF5F7; padding: 4px 8px; border-radius: 4px; border: 1px solid #FB7185;',
    'color: #1E1520; font-size: 11px;'
  );
});
