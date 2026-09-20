/**
 * ADRIAN SETH TABOTABO — POLAROID FLIP
 * Clicking the portrait turns the print over to its back.
 *
 * The rotation itself lives in CSS, on .polaroid-flipper — an element that
 * carries nothing else, so the flip is a plain transform transition the
 * compositor can run without the main thread. This file only owns the state
 * and the accessibility bookkeeping.
 *
 * There is deliberately no visible affordance. The print carries nothing a
 * real one would not, so the flip is left to be discovered.
 */

(function () {
  'use strict';

  const card = document.getElementById('coreEmblemCard');
  if (!card) return;

  const front = card.querySelector('.polaroid-face-front');
  const back = card.querySelector('.polaroid-face-back');
  if (!front || !back) return;

  let flipped = false;

  // Without a button to tab to, the card itself has to be reachable, or the
  // back face becomes mouse-only. Kept as a plain focusable element rather
  // than role="button" because the front already contains one (the scroll
  // cue), and nesting button semantics reads badly to screen readers.
  card.setAttribute('tabindex', '0');

  function apply() {
    card.classList.toggle('is-flipped', flipped);

    // Hide whichever side faces away from assistive tech, so the card does
    // not read out both faces at once.
    front.setAttribute('aria-hidden', flipped ? 'true' : 'false');
    back.setAttribute('aria-hidden', flipped ? 'false' : 'true');

    // The front carries focusable content (the scroll cue); pull it out of
    // the tab order while it is face down, otherwise focus lands on
    // something the viewer cannot see.
    front.inert = flipped;
    back.inert = !flipped;

    card.setAttribute(
      'aria-label',
      flipped
        ? 'Back of the instant photo. Activate to turn it over to the portrait.'
        : 'Instant photo of Adrian Seth Tabotabo. Activate to turn it over.'
    );
  }

  function toggle() {
    flipped = !flipped;
    apply();
  }

  card.addEventListener('click', (e) => {
    // Let genuinely interactive children do their own job — the scroll cue,
    // any link or button — instead of swallowing the click as a flip.
    if (e.target.closest('a, button, [role="button"]')) return;
    toggle();
  });

  card.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
    // Only when the card itself holds focus — otherwise Space on the scroll
    // cue inside it would flip the print out from under the viewer.
    if (e.target !== card) return;
    e.preventDefault();
    toggle();
  });

  apply();
})();
