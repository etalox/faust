(function () {
  'use strict';

  function init() {
    if (!document.querySelector('[data-os-page="settings"]')) return;
    var toggle = document.querySelector('[data-chart-transformation-toggle]');
    var settings = window.FaustOSSettings;
    if (!toggle || !settings) return;

    function sync(enabled) {
      toggle.classList.toggle('is-active', enabled);
      toggle.setAttribute('aria-pressed', String(enabled));
      toggle.setAttribute('aria-label', enabled ? 'Desactivar Transformación de gráfico Beta' : 'Activar Transformación de gráfico Beta');
    }

    sync(Boolean(settings.get('chartTransformation')));
    toggle.addEventListener('click', function () {
      var enabled = toggle.getAttribute('aria-pressed') !== 'true';
      settings.set('chartTransformation', enabled);
      sync(enabled);
    });
  }

  window.FaustOSConfig = { init: init };
  if (document.querySelector('[data-os-page="settings"]')) init();
})();
