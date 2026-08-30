// IconKit landing: small, dependency-free behaviour.
(function () {
  // Real icons from the sample library, copied into assets/icons/.
  const ICONS = [
    'action-add-person', 'action-ai', 'action-attach', 'action-barcode', 'action-basket-outline',
    'action-bookmark-outline', 'action-bug', 'action-calendar', 'action-camera', 'action-card',
    'action-chart', 'action-comment', 'action-compare', 'action-confetti', 'action-delete',
    'action-explore', 'action-eye-on', 'action-face-happy', 'ad-action-similar', 'alert-notification-read',
    'badge-bundle', 'badge-discount-tiered', 'badge-hashtag', 'badge-score', 'badge-trophy-fill',
    'cat-bookstationary', 'cat-fmcg-canned', 'cat-fmcg-pet', 'cat-kidstooy-fill', 'cat-service-fill',
    'cloud-iaaaas', 'comm-wifi-on', 'content-flip-horiz', 'device-calc', 'file-publish',
    'location-iran', 'nav-arrow-left-circle', 'nav-chevron-up', 'os-debian', 'payment-sheba',
    'qc-reject', 'shipping-seller', 'shop-process', 'social-instagram', 'toggle-switch',
  ];

  const cache = new Map();
  function loadIcon(name) {
    if (!cache.has(name)) {
      cache.set(name, fetch('/assets/icons/' + name + '.svg').then((r) => (r.ok ? r.text() : '')).catch(() => ''));
    }
    return cache.get(name);
  }

  // Fill a grid container with inline SVG cells.
  async function fillGrid(el, names, opts) {
    if (!el) return;
    const frag = document.createDocumentFragment();
    const svgs = await Promise.all(names.map(loadIcon));
    svgs.forEach((svg, i) => {
      if (!svg) return;
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.style.setProperty('--i', i);
      cell.title = names[i];
      cell.innerHTML = svg;
      if (opts && opts.pending && opts.pending.includes(i)) cell.classList.add('is-pending');
      if (opts && opts.brand && opts.brand.includes(i)) cell.classList.add('is-brand');
      frag.appendChild(cell);
    });
    el.appendChild(frag);
  }

  // Hero plugin window: 6 columns x 6 rows, with one "being written" cell.
  fillGrid(document.getElementById('hero-grid'), ICONS.slice(0, 36), { pending: [7] });

  // Icon wall: all icons, a few tinted brand blue like a fresh add.
  const wall = document.getElementById('icon-wall');
  fillGrid(wall, ICONS, { brand: [6, 19, 31] }).then(() => trimToWholeRows(wall));

  // Hide the trailing partial row so the wall always ends on a full row.
  function trimToWholeRows(el) {
    if (!el) return;
    const apply = () => {
      const cols = getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length;
      const cells = el.children;
      if (!cols || !cells.length) return;
      const keep = Math.floor(cells.length / cols) * cols || cells.length;
      for (let i = 0; i < cells.length; i++) cells[i].hidden = i >= keep;
    };
    apply();
    if ('ResizeObserver' in window) new ResizeObserver(apply).observe(el);
    else window.addEventListener('resize', apply);
  }

  // Heatmap: deterministic pseudo-random activity.
  const heat = document.getElementById('heatmap');
  if (heat) {
    let seed = 7;
    const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 26 * 7; i++) {
      const cell = document.createElement('i');
      const r = rnd();
      const level = r > 0.92 ? 4 : r > 0.8 ? 3 : r > 0.65 ? 2 : r > 0.45 ? 1 : 0;
      cell.style.setProperty('--l', level);
      heat.appendChild(cell);
    }
  }

  // Animate the chart bars when the section scrolls into view.
  const chart = document.querySelector('.chart');
  if (chart) chart.classList.add('is-armed');
  if (chart && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { chart.classList.add('is-visible'); io.disconnect(); } });
    }, { threshold: 0.4 });
    io.observe(chart);
  } else if (chart) {
    chart.classList.add('is-visible');
  }

  // Download buttons: non-Mac visitors get the releases page and a hint.
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform) || /Mac OS X/.test(navigator.userAgent);
  document.querySelectorAll('[data-download]').forEach((a) => {
    if (!isMac) a.title = 'IconKit is a macOS app. This opens the releases page.';
  });
})();
