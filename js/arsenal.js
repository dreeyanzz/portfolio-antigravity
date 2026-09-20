/**
 * ADRIAN SETH TABOTABO — ENGINEERING ARSENAL COMPONENT
 * Interactive categorized technology viewer with accessible tabs,
 * organic micro-interactions, and witty lore descriptors.
 */

(function () {
  'use strict';

  function initArsenal() {
    const root = document.getElementById('engineeringArsenal');
    const groups = window.PORTFOLIO_DATA?.tools?.groups;
    if (!root || !Array.isArray(groups) || !groups.length) return;

    root.innerHTML = '';

    // Category Filter Navigation
    const nav = document.createElement('div');
    nav.className = 'arsenal-filters';
    nav.setAttribute('role', 'tablist');
    nav.setAttribute('aria-label', 'Technology Categories');

    // Panel displaying active category
    const panel = document.createElement('div');
    panel.id = 'arsenalPanel';
    panel.className = 'arsenal-panel';
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-live', 'polite');

    const headerRow = document.createElement('div');
    headerRow.className = 'arsenal-header-row';

    const subText = document.createElement('span');
    subText.className = 'arsenal-sub';

    const countBadge = document.createElement('span');
    countBadge.className = 'arsenal-count';

    headerRow.append(subText, countBadge);

    const list = document.createElement('ul');
    list.className = 'arsenal-list';

    panel.append(headerRow, list);

    function selectCategory(group, clickedBtn) {
      const buttons = nav.querySelectorAll('.arsenal-filter');
      buttons.forEach(btn => {
        const isSelected = btn === clickedBtn;
        btn.setAttribute('aria-selected', String(isSelected));
        btn.setAttribute('tabindex', isSelected ? '0' : '-1');
      });

      subText.textContent = group.sub || `// ${group.label.toLowerCase()}`;
      countBadge.textContent = `${group.items.length} technologies`;

      list.innerHTML = '';
      group.items.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'tag-pill';
        li.style.animationDelay = `${Math.min(index * 20, 300)}ms`;
        li.textContent = item;
        list.appendChild(li);
      });
    }

    groups.forEach((group, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'arsenal-filter';
      btn.setAttribute('role', 'tab');
      btn.id = `tab-${group.id}`;
      btn.setAttribute('aria-controls', 'arsenalPanel');
      btn.textContent = group.label;

      if (index === 0) {
        btn.setAttribute('aria-selected', 'true');
        btn.setAttribute('tabindex', '0');
      } else {
        btn.setAttribute('aria-selected', 'false');
        btn.setAttribute('tabindex', '-1');
      }

      btn.addEventListener('click', () => selectCategory(group, btn));

      // Keyboard arrow navigation
      btn.addEventListener('keydown', (e) => {
        const buttons = Array.from(nav.querySelectorAll('.arsenal-filter'));
        const currIndex = buttons.indexOf(btn);
        let nextIndex = -1;

        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          nextIndex = (currIndex + 1) % buttons.length;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          nextIndex = (currIndex - 1 + buttons.length) % buttons.length;
        } else if (e.key === 'Home') {
          nextIndex = 0;
        } else if (e.key === 'End') {
          nextIndex = buttons.length - 1;
        }

        if (nextIndex !== -1) {
          e.preventDefault();
          buttons[nextIndex].focus();
          buttons[nextIndex].click();
        }
      });

      nav.appendChild(btn);
    });

    root.append(nav, panel);
    selectCategory(groups[0], nav.firstElementChild);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initArsenal);
  } else {
    initArsenal();
  }
})();
