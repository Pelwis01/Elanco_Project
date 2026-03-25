// Sidebar toggle logic
function toggleSidebar() {

  document.addEventListener('DOMContentLoaded', function () {

  const isMobile = () => window.innerWidth <= 768;

  /* ── Desktop toggle ── */
  const toggleBtn     = document.getElementById('sidebar-toggle-btn');
  const sidebar       = document.querySelector('.sidebar');
  const mainEl        = document.querySelector('main');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      if (isMobile()) return;

      const collapsed = sidebar.classList.toggle('collapsed');
      mainEl.classList.toggle('sidebar-collapsed', collapsed);
      toggleWrapper.classList.toggle('sidebar-collapsed', collapsed);
      toggleBtn.innerText = collapsed ? '→' : '☰';

      setTimeout(() => {
        if (window._elancoMap) window._elancoMap.invalidateSize();
      }, 350);
    });
  }
  /* ── Mobile sheet: tap handle to open/close ── */
  const sheet  = document.getElementById('mobile-sheet');
  const handle = document.getElementById('sheet-handle');

  if (handle && sheet) {
    handle.addEventListener('click', function () {
      sheet.classList.toggle('open');
    });
  }

  /* ── Mobile sheet: tab switching ── */
  const tabs   = document.querySelectorAll('.sheet-tab');
  const panels = document.querySelectorAll('.sheet-panel');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('sheet-panel-' + tab.dataset.tab).classList.add('active');
      if (sheet) sheet.classList.add('open');
    });
  });

  /* ── Mobile bottom nav ── */
  const navMap   = document.getElementById('nav-map');
  const navInfo  = document.getElementById('nav-info');
  const navGuide = document.getElementById('nav-guide');
  const navBtns  = document.querySelectorAll('.mobile-bottom-nav button');

  function setNavActive(btn) {
    navBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  if (navMap) navMap.addEventListener('click', function () {
    setNavActive(navMap);
    if (sheet) sheet.classList.remove('open');
  });

  if (navInfo) navInfo.addEventListener('click', function () {
    setNavActive(navInfo);
    tabs.forEach(t => t.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    document.querySelector('[data-tab="info"]').classList.add('active');
    document.getElementById('sheet-panel-info').classList.add('active');
    if (sheet) sheet.classList.add('open');
  });

  if (navGuide) navGuide.addEventListener('click', function () {
    setNavActive(navGuide);
    tabs.forEach(t => t.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    document.querySelector('[data-tab="guide"]').classList.add('active');
    document.getElementById('sheet-panel-guide').classList.add('active');
    if (sheet) sheet.classList.add('open');
  });

  /* ── Mobile layer FAB ── */
  const fab    = document.getElementById('mobile-layer-fab');
  const picker = document.getElementById('mobile-layer-picker');

  if (fab && picker) {
    fab.addEventListener('click', function (e) {
      e.stopPropagation();
      picker.style.display = picker.style.display === 'block' ? 'none' : 'block';
    });
    document.addEventListener('click', function () {
      picker.style.display = 'none';
    });
    picker.querySelectorAll('button').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        const key = btn.dataset.layer;
        picker.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        picker.style.display = 'none';
        if (window._elancoMap && window.layers) {
          Object.values(window.layers).forEach(l => {
            if (window._elancoMap.hasLayer(l)) window._elancoMap.removeLayer(l);
          });
          if (window.layers[key]) window.layers[key].addTo(window._elancoMap);
        }
      });
    });
  };
});
}


