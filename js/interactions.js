/**
 * ADRIAN SETH TABOTABO — INTERACTIVE MICRO-INTERACTIONS
 * 1-click email copy toast and the project modal drawer. (Card tilt lives in
 * js/card-tilt.js.)
 */

(function () {
  'use strict';

  const data = window.PORTFOLIO_DATA;


  // 2. One-Click Copy Email with Toast Feedback
  const copyBtn = document.getElementById('copyEmailBtn');
  const toast = document.getElementById('toastNotification');
  const toastText = document.getElementById('toastText');

  if (copyBtn && toast) {
    copyBtn.addEventListener('click', () => {
      const email = data.profile.email;
      navigator.clipboard.writeText(email).then(() => {
        toastText.textContent = `Copied ${email} to clipboard!`;
        toast.classList.add('active');

        setTimeout(() => {
          toast.classList.remove('active');
        }, 3000);
      }).catch(() => {
        toastText.textContent = email;
        toast.classList.add('active');
        setTimeout(() => toast.classList.remove('active'), 3000);
      });
    });
  }

  // 3. Project Deep-Dive Modal Drawer
  const modalBackdrop = document.getElementById('projectModal');
  const modalTitle = document.getElementById('modalProjectTitle');
  const modalTagline = document.getElementById('modalProjectTagline');
  const modalDesc = document.getElementById('modalProjectDesc');
  const modalArch = document.getElementById('modalProjectArchitecture');
  const modalHighlights = document.getElementById('modalProjectHighlights');
  const modalStack = document.getElementById('modalProjectStack');
  const modalGithubLink = document.getElementById('modalGithubLink');
  const modalCloseBtn = document.getElementById('modalCloseBtn');

  function openProjectModal(projectId) {
    if (!data || !data.flagships) return;
    const project = data.flagships.find(p => p.id === projectId);
    if (!project) return;

    modalBackdrop.dataset.projectId = project.id;
    modalTitle.textContent = project.title;
    modalTagline.textContent = project.tagline;
    modalDesc.textContent = project.desc;
    modalArch.textContent = project.architecture;

    // Highlights list
    modalHighlights.innerHTML = '';
    project.highlights.forEach(h => {
      const li = document.createElement('li');
      li.style.marginBottom = '6px';
      li.textContent = h;
      modalHighlights.appendChild(li);
    });

    // Tech stack pills
    modalStack.innerHTML = '';
    project.stack.forEach(tech => {
      const pill = document.createElement('span');
      pill.className = 'tag-pill';
      pill.textContent = tech;
      modalStack.appendChild(pill);
    });

    modalGithubLink.href = project.githubUrl;

    modalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeProjectModal() {
    if (modalBackdrop) {
      modalBackdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // Attach click to all flagship deep dive buttons
  document.querySelectorAll('[data-deep-dive]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const projectId = btn.getAttribute('data-deep-dive');
      openProjectModal(projectId);
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeProjectModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeProjectModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeProjectModal();
  });

})();
