(function () {
  'use strict';

  var app = document.querySelector('.os-app');
  var isNavigating = false;
  var initialLoadStartedAt = window.performance && window.performance.now ? window.performance.now() : Date.now();
  var isFirstPlatformEntry = false;
  var isReload = false;
  try {
    // localStorage hace que la primera carga sea histórica: no se repite al
    // abrir otra pestaña. Conservamos la marca de la versión anterior de
    // sessionStorage para no reiniciar usuarios de la sesión actual.
    var hasHistoricalEntry = window.localStorage.getItem('faustos-loader-historical') === '1' || window.sessionStorage.getItem('faustos-loader-seen') === '1';
    isFirstPlatformEntry = !hasHistoricalEntry;
    window.localStorage.setItem('faustos-loader-historical', '1');
    window.sessionStorage.setItem('faustos-loader-seen', '1');
  } catch (error) {
    isFirstPlatformEntry = true;
  }
  var navigationEntry = window.performance && window.performance.getEntriesByType ? window.performance.getEntriesByType('navigation')[0] : null;
  isReload = navigationEntry ? navigationEntry.type === 'reload' : Boolean(window.performance && window.performance.navigation && window.performance.navigation.type === 1);
  var loaderMode = isFirstPlatformEntry ? 'first' : (isReload ? 'reloading' : 'opening');
  document.documentElement.classList.add('os-loader-' + loaderMode);
  if (!app || !window.fetch || !window.DOMParser) return;

  function revealInitialPage() {
    var loaderDuration = isFirstPlatformEntry ? 10000 : (isReload ? 1400 : 3000);
    var fontReady = document.fonts && document.fonts.ready ? document.fonts.ready.catch(function () {}) : Promise.resolve();
    var imageReady = Promise.all(Array.prototype.slice.call(document.images).map(function (image) {
      var loaded = image.complete ? Promise.resolve() : new Promise(function (resolve) {
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', resolve, { once: true });
      });
      // decode() evita que una imagen ya descargada se pinte tarde, justo
      // después de retirar la pantalla de carga.
      return loaded.then(function () {
        return image.decode ? image.decode().catch(function () {}) : undefined;
      });
    }));
    var layoutReady = new Promise(function (resolve) {
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          // Fuerza el cálculo final de layout mientras el lienzo sigue oculto.
          app.getBoundingClientRect();
          resolve();
        });
      });
    });
    // Los tiempos del loader son mínimos: la interfaz no se revela hasta que
    // hayan transcurrido y los recursos visibles estén listos para su primer
    // render estable.
    var minimumDuration = new Promise(function (resolve) { window.setTimeout(resolve, loaderDuration); });
    Promise.all([fontReady, imageReady, layoutReady, minimumDuration]).then(function () {
      // La UI ya está lista detrás del loader. Revelarla con la propia capa de
      // carga conserva el backdrop real del gráfico para sus elementos glass.
      document.documentElement.classList.remove('os-loading');
      document.documentElement.classList.add('os-initial-ready');
      window.dispatchEvent(new Event('faustos:initial-ready'));
      window.requestAnimationFrame(function () {
        document.documentElement.classList.add('os-loader-leaving');
        window.dispatchEvent(new Event('faustos:loader-leaving'));
      });
      window.setTimeout(function () {
        document.documentElement.classList.remove('os-loader-leaving');
        var loader = document.querySelector('[data-os-loader]');
        if (loader) loader.remove();
      }, 500);
      window.setTimeout(function () {
        document.documentElement.classList.remove('os-initial-ready');
      }, 1100);
    });
  }

  function initialiseView(page) {
    if (page === 'dashboard' && window.FaustOSDashboard) window.FaustOSDashboard.init();
    if (page === 'database' && window.FaustOSDatabase) window.FaustOSDatabase.init();
    if (page === 'settings' && window.FaustOSConfig) window.FaustOSConfig.init();
  }

  function initialiseNotifications() {
    var control = document.querySelector('[data-notifications-control]');
    var toggle = document.querySelector('[data-notifications-toggle]');
    if (!control || !toggle || control.getAttribute('data-notifications-ready') === 'true') return;
    control.setAttribute('data-notifications-ready', 'true');
    toggle.addEventListener('click', function () {
      var isOpen = control.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
    document.addEventListener('click', function (event) {
      if (event.target.closest('[data-notifications-control]')) return;
      control.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      control.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  }

  function syncPersistentShell(page, parsedDocument) {
    document.querySelectorAll('.os-tab[data-os-view]').forEach(function (item) {
      var active = item.getAttribute('data-os-view') === page;
      item.classList.toggle('is-active', active);
      if (active) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    });
    var incomingTitle = parsedDocument.querySelector('.os-brand strong');
    var persistentTitle = document.querySelector('.os-brand strong');
    if (incomingTitle && persistentTitle) persistentTitle.textContent = incomingTitle.textContent;
  }

  function navigate(targetUrl, shouldPush) {
    if (isNavigating) return;
    var current = document.querySelector('[data-os-page-content]');
    if (!current) return window.location.assign(targetUrl.href);
    isNavigating = true;

    window.fetch(targetUrl.href, { credentials: 'same-origin' }).then(function (response) {
      if (!response.ok) throw new Error('No se pudo cargar la vista');
      return response.text();
    }).then(function (markup) {
      var parsedDocument = new DOMParser().parseFromString(markup, 'text/html');
      var incoming = parsedDocument.querySelector('[data-os-page-content]');
      if (!incoming) throw new Error('Vista no compatible');

      current.classList.add('is-page-leaving');
      window.setTimeout(function () {
        incoming.classList.add('is-page-entering');
        current.replaceWith(incoming);
        // Fuerza el estado inicial antes de renderizar una vista pesada como la tabla.
        void incoming.offsetWidth;
        document.title = parsedDocument.title;
        if (shouldPush) window.history.pushState({ osPage: incoming.getAttribute('data-os-page') }, '', targetUrl.href);
        syncPersistentShell(incoming.getAttribute('data-os-page'), parsedDocument);
        try {
          initialiseView(incoming.getAttribute('data-os-page'));
        } finally {
          window.requestAnimationFrame(function () {
            window.requestAnimationFrame(function () { incoming.classList.remove('is-page-entering'); });
          });
          isNavigating = false;
        }
      }, 300);
    }).catch(function () {
      window.location.assign(targetUrl.href);
    });
  }

  document.querySelectorAll('.os-tabs a[data-os-view][href]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      var target = new URL(link.href, window.location.href);
      if (target.origin !== window.location.origin || target.pathname === window.location.pathname) return;
      event.preventDefault();
      navigate(target, true);
    });
  });

  window.addEventListener('popstate', function () { navigate(new URL(window.location.href), false); });
  initialiseNotifications();
  revealInitialPage();
})();
