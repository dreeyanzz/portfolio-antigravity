/** One card per tool. No scroll choreography, hidden panels, or selection state. */
(function () {
  'use strict';
  const root = document.getElementById('techStack');
  const groups = window.PORTFOLIO_DATA?.tools?.groups;
  if (!root || !groups) return;
  const brands = window.TECH_BRANDS || {};
  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  };
  groups.forEach(group => {
    const section = el('section', 'stack-group');
    const heading = el('div', 'stack-group__heading');
    const title = el('h3', '', group.label);
    title.id = `stack-${group.id}`;
    section.setAttribute('aria-labelledby', title.id);
    heading.append(title, el('span', '', String(group.items.length).padStart(2, '0')));
    const list = el('ul', 'stack-grid');
    group.items.forEach(item => {
      const card = el('li', 'stack-card');
      const brand = brands[item.name] || brands[item.mark];
      if (brand) {
        card.style.setProperty('--brand', brand.color);
        const hex = brand.color.slice(1);
        const full = hex.length === 3 ? [...hex].map(char => char + char).join('') : hex;
        const [r, g, b] = full.match(/.{2}/g).map(channel => parseInt(channel, 16));
        // Pale marks keep their real color and receive a contrasting surface.
        if (r * .2126 + g * .7152 + b * .0722 > 226) card.dataset.logoSurface = 'dark';
      }
      if (brand?.asset) {
        const logo = el('img', 'stack-card__logo');
        logo.src = brand.asset;
        logo.alt = '';
        logo.width = logo.height = 36;
        logo.loading = 'lazy';
        logo.decoding = 'async';
        card.appendChild(logo);
      } else {
        const mark = el('span', 'stack-card__monogram', item.name.replace(/[^a-z0-9]/gi, '').slice(0, 2).toUpperCase());
        mark.setAttribute('aria-hidden', 'true');
        card.appendChild(mark);
      }
      card.appendChild(el('span', 'stack-card__name', item.name));
      list.appendChild(card);
    });
    section.append(heading, list);
    root.appendChild(section);
  });
  document.getElementById('stackSummary').textContent = `${groups.reduce((sum, group) => sum + group.items.length, 0)} tools across ${groups.length} disciplines`;
})();
