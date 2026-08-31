// IconKit landing: small, dependency-free behaviour.
(function () {
  // Real glyphs from a production IconKit library, copied into assets/icons/.
  const ICONS = [
    'action-search', 'action-bookmark-outline', 'action-favorite-outline', 'action-star-outline', 'action-camera',
    'action-attach', 'action-calendar', 'action-comment', 'action-chart', 'action-card',
    'action-bug', 'action-key', 'action-link', 'action-lock', 'action-filter',
    'action-flag', 'action-gift-card', 'action-history', 'action-home-outline', 'action-mic',
    'action-people', 'action-pin', 'action-profile-outline', 'action-refresh', 'action-setting',
    'action-share', 'action-sort', 'action-terms', 'action-time', 'action-add-person',
    'action-eye-on', 'action-face-happy', 'action-grid', 'action-list-outline', 'action-explore',
    'action-bookmark', 'alert-notification-outline', 'alert-info-outline', 'alert-error-outline', 'badge-lightning',
    'badge-trophy', 'badge-verified', 'badge-hashtag', 'badge-money', 'badge-lamp',
    'badge-magnet-outline', 'comm-chat', 'comm-headphone', 'comm-laptop', 'comm-mobile',
    'comm-send', 'comm-wifi-on', 'comm-robot', 'comm-support', 'content-copy',
    'content-edit', 'content-crop', 'content-check', 'content-write', 'content-infinity',
    'content-swap-horiz', 'content-trend-up', 'content-block', 'content-duplicate', 'content-note-pin',
    'device-printer', 'device-calc', 'device-speaker', 'file-doc', 'file-image',
    'file-download', 'file-upload', 'file-export', 'file-qr', 'file-publish',
    'location-map', 'location-pin', 'location-direction', 'media-play-outline', 'media-video',
    'media-3d', 'media-reel', 'nav-menu', 'nav-more-horiz', 'nav-zoom-in',
    'nav-arrow-right-circle', 'nav-undo', 'nav-redo', 'nav-expand', 'shop-cart-outline',
    'shop-gift', 'shop-receipt', 'shop-mall', 'shop-save', 'shop-guarantee',
    'shipping-bike', 'shipping-jet', 'shipping-locker', 'shipping-fast', 'payment-bank',
    'payment-wallet', 'payment-safe', 'payment-dollar', 'cat-electronic', 'cat-fashion',
    'cat-health', 'cat-tools', 'cat-vehicle', 'cat-mobile', 'cat-beauty',
    'cat-sportoutdoor', 'cat-jewelry', 'action-work', 'badge-book', 'badge-free',
    'content-check-double', 'file-done', 'cloud-api', 'cloud-cli', 'cloud-disk',
    'cloud-hub', 'cloud-workspace', 'cloud-language', 'location-hub', 'media-pause',
    'nav-collapse', 'shop-order', 'action-privacy', 'action-question', 'action-sign-out',
    'action-fullscreen', 'action-shuffle', 'action-flash-on',
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

  // Icon wall: a spread of the library, a few tinted brand blue like a fresh add.
  // Capped so the wall stays a few rows tall; trimToWholeRows drops the ragged end.
  const WALL_COUNT = 45;
  const step = Math.max(1, Math.floor(ICONS.length / WALL_COUNT));
  const wallIcons = [];
  for (let i = 0; wallIcons.length < WALL_COUNT && i < ICONS.length; i += step) wallIcons.push(ICONS[i]);

  const wall = document.getElementById('icon-wall');
  fillGrid(wall, wallIcons, { brand: [6, 20, 33] }).then(() => trimToWholeRows(wall));

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

  // App UI icons (assets/ui/) replace the text glyphs the chrome used to fake:
  // the window close, the project chevron, folders, and the published check.
  document.querySelectorAll('[data-ui-icon]').forEach((el) => {
    fetch('/assets/ui/' + el.dataset.uiIcon + '.svg')
      .then((r) => (r.ok ? r.text() : ''))
      .then((svg) => { if (svg) el.innerHTML = svg; })
      .catch(() => {});
  });

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
