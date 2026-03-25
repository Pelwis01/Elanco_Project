// Sidebar toggle logic
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const main = document.querySelector('main');
  const toggleWrapper = document.getElementById('sidebar-toggle-wrapper');
  const toggleBtn = document.getElementById('sidebar-toggle-btn');
  if (sidebar.classList.contains('collapsed')) {
    sidebar.classList.remove('collapsed');
    main.classList.remove('sidebar-collapsed');
    if (toggleBtn) toggleBtn.innerText = '☰';
    if (toggleWrapper) toggleWrapper.classList.remove('sidebar-collapsed');
  } else {
    sidebar.classList.add('collapsed');
    main.classList.add('sidebar-collapsed');
    if (toggleBtn) toggleBtn.innerText = '→';
    if (toggleWrapper) toggleWrapper.classList.add('sidebar-collapsed');
  }
  // Only resize the map, do not recenter or zoom
  setTimeout(function() {
    if (window._elancoMap && window._elancoMap.invalidateSize) {
      window._elancoMap.invalidateSize();
    }
    // Try to remove and re-add the active heatmap layer
    if (window._elancoMap && window.layers && window._elancoMap.hasLayer) {
      // Find the active heatmap layer (the one currently on the map)
      let activeLayer = null;
      for (const key in window.layers) {
        if (window.layers[key] && window._elancoMap.hasLayer(window.layers[key])) {
          activeLayer = window.layers[key];
          break;
        }
      }
      if (activeLayer) {
        window._elancoMap.removeLayer(activeLayer);
        window._elancoMap.addLayer(activeLayer);
      }
    }
    if (typeof window.updateMapLayers === 'function') {
      window.updateMapLayers();
    }
  }, 350); // match CSS transition
}

document.addEventListener('DOMContentLoaded', function() {
  const toggleBtn = document.getElementById('sidebar-toggle-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleSidebar);
  }
});
