// Shared shell for legal routes. Individual HTML files intentionally contain
// only the route and this loader; document-specific presentation lives here.
(() => {
  const mountLegalPage = () => {
    // The shell can be requested again by the client-side router. Do not
    // replace an already mounted legal document while its text is loading.
    if (document.querySelector('faust-legal-document[versioned]')) return;
  const currentScript = document.currentScript || [...document.scripts].find(script =>
    script.src.includes('/legal/system/legal-page.js')
  );
  const systemUrl = new URL(currentScript?.src || './system/legal-page.js', window.location.href);
  const legalRoot = new URL('../', systemUrl);
  const siteRoot = new URL('../', legalRoot);
  const slug = document.documentElement.dataset.legalDocument;

  const documents = {
    'expert-network-terms': {
      description: 'Términos de Incorporación a la Expert Network de FaustPartners™.',
      attributes: { controls: '', 'group-intro': '' }
    },
    'CIG': {
      description: 'Garantía de Integridad Empresarial (CIG) de FaustPartners™.',
      attributes: { controls: '' }
    },
    'CIG-101': {
      description: 'CIG-101: Declaración de Estándares de Producto de FaustPartners™.',
      attributes: { controls: '' }
    },
    'CIG-501': {
      description: 'CIG-501: Protocolo de Mitigación de Pérdidas de FaustPartners™.',
      attributes: { controls: '' }
    },
    'CIG-901': {
      description: 'CIG-901: Protocolo de Integridad de Datos de FaustPartners™.',
      attributes: { controls: '' }
    },
    'privacy-policies': {
      description: 'Política de Privacidad de FaustPartners™.',
      attributes: { 'hide-marco': '', 'date-first': '', 'version-label': 'Última versión' }
    },
    'terms-of-use': {
      description: 'Términos y Condiciones de Uso de FaustPartners™.',
      attributes: { 'hide-marco': '', 'date-first': '', 'version-label': 'Última versión' }
    }
  };

  const settings = documents[slug] || { description: 'Documento legal de FaustPartners™.', attributes: {} };
  const appendHead = (tag, properties) => {
    const element = document.createElement(tag);
    Object.entries(properties).forEach(([key, value]) => element.setAttribute(key, value));
    document.head.append(element);
    return element;
  };

  document.documentElement.lang = 'es';
  document.documentElement.classList.add('legal-page');
  document.body.classList.add('legal-page-loading');
  document.title = '';
  appendHead('meta', { name: 'description', content: settings.description });
  appendHead('link', { rel: 'icon', type: 'image/png', href: new URL('assets/Icons/tab_icon.png', siteRoot).href });
  const stylesheet = appendHead('link', { rel: 'stylesheet', href: new URL('style.css?v=styles-20261021-6', siteRoot).href });
  const revealStyledShell = () => document.body.classList.add('legal-page-styled');
  stylesheet.addEventListener('load', revealStyledShell, { once: true });
  // A failed stylesheet must not leave the document inaccessible.
  stylesheet.addEventListener('error', revealStyledShell, { once: true });
  if (stylesheet.sheet) revealStyledShell();

  if (!customElements.get('faust-navbar')) {
    const translation = appendHead('script', { src: new URL('assets/translation.js?v=legal-page-shell-20261019', siteRoot).href });
    translation.async = false;
    const components = appendHead('script', { src: new URL('assets/components.js?v=router-canvas-scroll-20261020', siteRoot).href });
    components.async = false;
  } else if (!customElements.get('faust-legal-document')) {
    const documentComponent = appendHead('script', { src: new URL('legal/system/legal-document.js?v=legal-system-20261036', siteRoot).href });
    documentComponent.async = false;
  }

  const fade = document.createElement('div');
  fade.className = 'page-fade-overlay';
  fade.style.opacity = '1';
  fade.style.pointerEvents = 'auto';
  fade.style.transition = 'none';
  fade.style.zIndex = '19';
  const navbar = document.createElement('faust-navbar');
  const main = document.createElement('main');
  const documentElement = document.createElement('faust-legal-document');
  documentElement.setAttribute('versioned', '');
  documentElement.className = 'notranslate';
  documentElement.setAttribute('translate', 'no');
  Object.entries(settings.attributes).forEach(([key, value]) => documentElement.setAttribute(key, value));
  documentElement.innerHTML = '<div class="legal-document__loading" role="status"><span class="legal-document__loading-icon" aria-hidden="true"></span><span class="legal-document__loading-label">Cargando documento…</span></div>';
  document.addEventListener('faust-legal-document-ready', () => {
    // The router may reset scroll immediately after the component reports it
    // is ready. Apply the fragment one frame later so internal navigation and
    // a direct page load end at the same legal point.
    requestAnimationFrame(() => documentElement.activateFragmentTarget?.());
  }, { once: true });
  main.append(documentElement);
  const footer = document.createElement('faust-footer');
    document.body.replaceChildren(fade, navbar, main, footer);
  };

  window.faustMountLegalPage = mountLegalPage;
  mountLegalPage();
})();
