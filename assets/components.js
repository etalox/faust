// Auto-protect brand names from translation
(function() {
  const brandRegex = /Faust\s*Partners™?/gi;
  const skipTags = ['SCRIPT', 'STYLE', 'IFRAME', 'NOSCRIPT', 'HEAD', 'META', 'TEXTAREA', 'INPUT'];

  function protectTitle() {
    const titleEl = document.querySelector('title');
    if (titleEl) {
      brandRegex.lastIndex = 0;
      if (brandRegex.test(titleEl.textContent)) {
        titleEl.classList.add('notranslate');
        titleEl.setAttribute('translate', 'no');
      }
    }
  }

  function protectNode(node) {
    if (!node) return;
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.nodeValue;
      brandRegex.lastIndex = 0;
      if (brandRegex.test(text)) {
        brandRegex.lastIndex = 0;
        const parent = node.parentNode;
        if (!parent) return;

        if (parent.closest && parent.closest('.notranslate, [translate="no"]')) {
          return;
        }

        const fragment = document.createDocumentFragment();
        let lastOffset = 0;
        let match;

        while ((match = brandRegex.exec(text)) !== null) {
          const matchText = match[0];
          const matchIndex = match.index;

          if (matchIndex > lastOffset) {
            fragment.appendChild(document.createTextNode(text.substring(lastOffset, matchIndex)));
          }

          const span = document.createElement('span');
          span.className = 'notranslate';
          span.setAttribute('translate', 'no');
          span.textContent = matchText;
          fragment.appendChild(span);

          lastOffset = brandRegex.lastIndex;
        }

        if (lastOffset < text.length) {
          fragment.appendChild(document.createTextNode(text.substring(lastOffset)));
        }

        parent.replaceChild(fragment, node);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (skipTags.includes(node.tagName)) return;
      if (node.classList.contains('notranslate') || node.getAttribute('translate') === 'no') return;

      const children = Array.from(node.childNodes);
      for (const child of children) {
        protectNode(child);
      }
    }
  }

  function runProtection() {
    protectTitle();
    if (document.body) {
      protectNode(document.body);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runProtection);
  } else {
    runProtection();
  }

  const observer = new MutationObserver((mutations) => {
    observer.disconnect();
    protectTitle();
    for (const mutation of mutations) {
      for (const addedNode of mutation.addedNodes) {
        protectNode(addedNode);
      }
    }
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();

(function() {
  const applyNotranslate = () => {
    const savedNative = localStorage.getItem('faust-lang-native') || 'Español';
    const savedCountry = localStorage.getItem('faust-lang-country') || 'España';
    
    const getGoogleTranslateCode = (lang, country) => {
      if (lang === 'Español') return 'es';
      if (lang === 'Português') return 'pt';
      if (lang === 'English') return 'en';
      if (lang === 'Français') return 'fr';
      if (lang === 'Русский') return 'ru';
      if (lang === '简体中文') return 'zh-CN';
      if (lang === '日本語') return 'ja';
      return 'es';
    };

    const code = getGoogleTranslateCode(savedNative, savedCountry);
    const metaId = 'faust-notranslate-meta';

    if (code === 'es') {
      document.documentElement.setAttribute('translate', 'no');
      if (!document.getElementById(metaId)) {
        const meta = document.createElement('meta');
        meta.id = metaId;
        meta.name = 'google';
        meta.content = 'notranslate';
        document.head.appendChild(meta);
      }
    } else {
      document.documentElement.removeAttribute('translate');
      const meta = document.getElementById(metaId);
      if (meta) {
        meta.remove();
      }
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyNotranslate);
  } else {
    applyNotranslate();
  }
})();

class FaustNavbar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <style>
        .nav-links a, #nav-contacto {
          transition: opacity 0.2s ease, color 0.2s ease;
        }
        .nav-links a:hover, #nav-contacto:hover {
          color: #ffffff !important;
        }

        .nav {
          --nav-transition-dur: 0.5s;
          background: rgb(8, 9, 10) !important; 
          backdrop-filter: blur(0px) !important;
          -webkit-backdrop-filter: blur(0px) !important;     
          transition: background var(--nav-transition-dur) cubic-bezier(0.25, 1, 0.5, 1), 
                      backdrop-filter var(--nav-transition-dur) cubic-bezier(0.25, 1, 0.5, 1),
                      -webkit-backdrop-filter var(--nav-transition-dur) cubic-bezier(0.25, 1, 0.5, 1);
        }

        .nav.is-active {
          background: rgba(9, 10, 11, 0.88) !important; 
          backdrop-filter: blur(20px) !important;
          -webkit-backdrop-filter: blur(20px) !important;
        }

        .logo-lockup {
          user-select: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
        }
      </style>

      <nav class="nav">
        <div class="wrap nav-inner">
          <div class="logo-lockup" style="margin:0">
            <img id="nav-isotipo" class="nav-logo-icon" src="./assets/Logotypes/Faust Logo.svg" alt="Faust">
            <span id="nav-logo-text">FaustPartners™</span>
          </div>
          <div class="nav-links">
            <a href="./index.html#estrategia">Estrategia</a>
            <a href="./index.html#resultados">Resultados</a>
            <a href="./index.html#expertos">Expertos</a>
            <a href="./index.html#empresa">Empresa</a>
          </div>
          <div class="nav-right">
            <a id="nav-contacto" href="./index.html#contacto" style="user-select: none !important;">Contacto</a>
            <a class="btn btn-secondary btn-nav" href="./index.html#aplicar">
              Aplicar
              <img class="arrow arrow-light" src="./assets/Icons/button_arrow.svg" alt="">
            </a>
          </div>
        </div>
      </nav>
    `;

    const internalNav = this.querySelector('.nav');
    if (internalNav) {
      internalNav.offsetHeight; 

      setTimeout(() => {
        internalNav.classList.add('is-active');
      }, 120);
    }

    this.initLogoObserver();
    this.initResizeHandler();
  }

  initLogoObserver() {
    const navIcon = this.querySelector('#nav-isotipo');
    const heroLogo = document.getElementById('hero-logo');
    const ctaLogo = document.querySelector('.cta .FaustLogo');
    if (!navIcon) return;
    let isHeroIntersecting = false;
    let isCtaIntersecting = false;
    const updateLogoColor = () => {
      if (isHeroIntersecting || isCtaIntersecting) {
        navIcon.classList.remove('is-blue');
      } else {
        navIcon.classList.add('is-blue');
      }

      if (ctaLogo) {
        if (isCtaIntersecting) {
          ctaLogo.style.color = '#0022FF';
        } else {
          ctaLogo.style.color = 'white';
        }
      }
    };

    if (heroLogo) {
      const heroObserver = new IntersectionObserver(
        ([entry]) => {
          isHeroIntersecting = entry.isIntersecting;
          updateLogoColor();
        },
        { threshold: 0, rootMargin: '-80px 0px 0px 0px' }
      );
      heroObserver.observe(heroLogo);
    } else {
      isHeroIntersecting = false;
      updateLogoColor();
    }

    if (ctaLogo) {
      const ctaObserver = new IntersectionObserver(
        ([entry]) => {
          isCtaIntersecting = entry.isIntersecting;
          updateLogoColor();
        },
        { threshold: 0, rootMargin: '0px 0px -30% 0px' }
      );
      ctaObserver.observe(ctaLogo);
    }
  }

  initResizeHandler() {
    const nav = this.querySelector('.nav');
    const navLinks = this.querySelector('.nav-links');
    const navRight = this.querySelector('.nav-right');
    const logoText = this.querySelector('#nav-logo-text');
    const navContacto = this.querySelector('#nav-contacto');
    if (!nav || !navLinks || !navRight) return;
    const checkNavGap = () => {
      const links = Array.from(navLinks.children);

      nav.classList.remove('nav-contacto-hidden');
      links.forEach(link => link.style.display = '');

      for (let i = links.length - 1; i >= 0; i--) {
        const visibleLinks = links.filter(link => link.style.display !== 'none');
        
        if (visibleLinks.length <= 2) {
          // Hide all of them if 2 or fewer remain
          visibleLinks.forEach(link => link.style.display = 'none');
          break;
        }

        const leftmostLink = visibleLinks[0];
        const rightmostLink = visibleLinks[visibleLinks.length - 1];
        const gapRight = navRight.getBoundingClientRect().left - rightmostLink.getBoundingClientRect().right;
        const gapLeft = logoText ? (leftmostLink.getBoundingClientRect().left - logoText.getBoundingClientRect().right) : 999;
        
        if (gapRight < 30 || gapLeft < 30) {
          rightmostLink.style.display = 'none';
        } else {
          break;
        }
      }

      if (logoText && navContacto) {
        const gapContacto = navContacto.getBoundingClientRect().left - logoText.getBoundingClientRect().right;
        if (gapContacto < 30) {
          nav.classList.add('nav-contacto-hidden');
        }
      }
    };

    checkNavGap();
    window.addEventListener('resize', checkNavGap);
    
    this._resizeHandler = checkNavGap;
  }

  disconnectedCallback() {
    if (this._resizeHandler) {
      window.removeEventListener('resize', this._resizeHandler);
    }
  }
}

class FaustFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <style>
        /* ── Backup styles and variables for standalone/external pages ── */
        faust-footer {
          --blue: #0022ff;
          --chip: rgba(253, 253, 255, 0.06);
          --fg: #f2f2f2;
        }
        faust-footer .btn { 
          border-radius: 999px; 
          padding: 16px 24px; 
          font-size: 16px; 
          border: 1px solid transparent; 
          display: inline-flex; 
          gap: 8px; 
          align-items: center; 
          cursor: pointer; 
          user-select: none;
          box-sizing: border-box;
          font-family: inherit;
          text-decoration: none;
        }
        faust-footer .btn-secondary { 
          position: relative; 
          background: var(--chip); 
          border: 0 !important;
          color: var(--fg); 
          backdrop-filter: blur(20px); 
          -webkit-backdrop-filter: blur(20px);
          transition: background 180ms ease-out, color 180ms ease-out, border-color 180ms ease-out; 
        }
        faust-footer .btn-secondary::before { 
          content: ''; 
          position: absolute; 
          inset: 0;
          border-radius: 999px; 
          padding: 1px; 
          background: linear-gradient(to bottom, rgba(255,255,255,.08), rgba(255,255,255,.03)); 
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); 
          -webkit-mask-composite: xor; 
          mask-composite: exclude; 
          pointer-events: none; 
          transition: opacity 180ms ease-out;
        }
        faust-footer .btn-secondary:hover { 
          background: rgba(238, 238, 241, 0.10); 
          color: #fff; 
        }

        /* ── Google Translate Premium Clean Overrides ── */
        iframe.goog-te-banner-frame {
          display: none !important;
        }
        .goog-te-banner-frame {
          display: none !important;
        }
        .goog-te-banner {
          display: none !important;
        }
        body {
          top: 0 !important;
        }
        html {
          margin-top: 0 !important;
        }
        body {
          margin-top: 0 !important;
        }
        #goog-gt-tt, .goog-gt-tt, #goog-gt-tt * {
          display: none !important;
          visibility: hidden !important;
        }
        .goog-te-balloon-frame {
          display: none !important;
        }
        .goog-text-highlight {
          background: transparent !important;
          box-shadow: none !important;
        }
        body > .skiptranslate {
          display: none !important;
        }

        .footer-col a, .footer-bottom a {
          transition: color 0.2s ease, opacity 0.2s ease;
        }
        .footer-col a:hover {
          color: #ffffff !important;
        }
        .footer-bottom a:hover {
          color: #ffffff !important;
        }

        .footer-bottom .lang {
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          height: 48px;
          box-sizing: border-box;
        }

        .footer-logo {
          user-select: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
        }

        /* ── Menú de selección de idiomas (original / Faust Partners) ── */
        .lang-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          z-index: 2000;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .lang-overlay-wrap {
          height: 100%;
          display: flex;
          justify-content: flex-end;
          align-items: flex-end;
          padding-bottom: 15px !important;
          box-sizing: border-box;
        }
        .lang-overlay.is-open {
          opacity: 1;
          pointer-events: auto;
        }
        .lang-modal-container {
          width: 380px;
          max-height: 380px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transform: translateY(20px);
          transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .lang-overlay.is-open .lang-modal-container {
          transform: translateY(0);
        }
        .lang-modal {
          flex: 1;
          background: var(--chip);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: none;
          border-radius: 20px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-height: 0;
        }
        .lang-modal-header {
          padding: 20px 24px;
          display: flex;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .lang-modal-header span {
          font-size: 15px;
          font-weight: 600;
          color: #fff;
          letter-spacing: 0.28px;
        }
        .lang-modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 10px 0;
        }
        .lang-modal-body::-webkit-scrollbar {
          width: 4px;
        }
        .lang-modal-body::-webkit-scrollbar-track {
          background: transparent;
          margin: 12px 0;
        }
        .lang-modal-body::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 10px;
        }
        .lang-modal-body::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        .lang-item {
          padding: 12px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .lang-item:hover {
          background: rgba(255, 255, 255, 0.04);
        }
        .lang-item-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .lang-name-row {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }
        .lang-name-native {
          font-size: 14px;
          font-weight: 500;
          color: #fff;
        }
        .lang-country-native {
          font-size: 13px;
          color: #8b8d91;
        }
        .lang-name-sub {
          display: flex;
          align-items: baseline;
          gap: 4px;
          font-size: 12px;
          color: #8b8d91;
        }
        .lang-checkmark {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--blue);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          opacity: 0;
          transform: scale(0.8);
          transition: opacity 0.2s, transform 0.2s;
        }
        .lang-item.is-active .lang-checkmark {
          opacity: 1;
          transform: scale(1);
        }
        .btn-listo {
          width: 100%;
          justify-content: center;
          height: 48px;
          font-weight: 600;
          font-size: 14px;
          letter-spacing: 0.2px;
          display: flex;
          align-items: center;
          box-sizing: border-box;
        }

        @media (min-width: 981px) {
          .lang-overlay {
            opacity: 1 !important;
            visibility: hidden;
            background: rgba(0, 0, 0, 0);
            backdrop-filter: blur(0px);
            -webkit-backdrop-filter: blur(0px);
            transition: background 0.3s cubic-bezier(0.25, 1, 0.5, 1),
                        backdrop-filter 0.3s cubic-bezier(0.25, 1, 0.5, 1),
                        -webkit-backdrop-filter 0.3s cubic-bezier(0.25, 1, 0.5, 1),
                        visibility 0.3s cubic-bezier(0.25, 1, 0.5, 1);
          }
          .lang-overlay.is-open {
            visibility: visible;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            pointer-events: auto;
          }
          .lang-modal-container {
            transform: none !important;
            transition: none !important;
          }
          .lang-modal {
            transform: scaleY(0);
            transform-origin: bottom;
            opacity: 0;
            transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s cubic-bezier(0.25, 1, 0.5, 1);
          }
          .lang-overlay.is-open .lang-modal {
            transform: scaleY(1);
            opacity: 1;
          }
          .btn-listo {
            align-self: flex-end;
          }
        }

        @media (max-width: 980px) {
          .lang-overlay-wrap {
            justify-content: center;
            align-items: center;
            padding: 16px !important;
          }
          .lang-modal-container {
            width: 100%;
            max-height: 380px;
            gap: 10px;
          }
        }
      </style>

      <footer>
        <div class="wrap">
          <div class="footer-grid">
            <div class="footer-col">
              <h4>General</h4>
              <a href="./index.html#">Aplicar</a>
              <a href="./index.html#">Diseño web</a>
              <a href="./index.html#">Consultoría</a>
              <a href="./index.html#">Software</a>
              <a href="./index.html#">Nuestra visión</a>
              <a href="./index.html#">Estrategia de crecimiento</a>
              <a href="./index.html#">Faust Max</a>
            </div>
            <div class="footer-col">
              <h4>Resultados</h4>
              <a href="./index.html#">Reportes de crecimiento</a>
              <a href="./index.html#">Carreras</a>
              <a href="./index.html#">Faust OS</a>
              <a href="./index.html#">Inversionistas</a>
            </div>
            <div class="footer-col">
              <h4>Empresa</h4>
              <a href="./index.html#">Acerca de nosotros</a>
              <a href="./index.html#">Proyectos</a>
              <a href="./index.html#">Expert Network</a>
            </div>
          </div>
          <div class="footer-bottom">
            <div class="footer-logo" style="color: #fff !important;">Faust Partners™ © 2026</div>
            <div style="display:flex;gap:24px;">
              <a href="./index.html#">Privacidad</a>
              <a href="./index.html#">Términos y condiciones</a>
              <a href="./index.html#">Legal</a>
            </div>
            <div style="display:flex;gap:20px;align-items:center;">
              <a href="./index.html#" style="text-decoration:underline;color:#fff;">Gestionar cookies</a>
              
              <span class="lang btn btn-secondary notranslate" translate="no"><img src="./assets/Icons/Globe.svg" alt=""> Español <span style="color: #8B8D91 !important;">España</span></span>
              
            </div>
          </div>
        </div>
      </footer>

      <!-- Language selection modal overlay -->
      <div class="lang-overlay notranslate" id="lang-menu-overlay" translate="no">
        <div class="wrap lang-overlay-wrap">
          <div class="lang-modal-container">
            <div class="lang-modal">
              <div class="lang-modal-header">
                <span>Select your language</span>
              </div>
            <div class="lang-modal-body">
              <div class="lang-list">
                <!-- 1. Español México -->
                <div class="lang-item" data-lang="Español" data-country="México">
                  <div class="lang-item-info">
                    <div class="lang-name-row">
                      <span class="lang-name-native">Español</span>
                      <span class="lang-country-native">México</span>
                    </div>
                    <div class="lang-name-sub">
                      <span class="lang-name-english">Spanish</span>
                      <span class="lang-country-english">Mexico</span>
                    </div>
                  </div>
                  <div class="lang-checkmark">
                    <svg width="10" height="8" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>

                <!-- 2. Español Latinoamérica -->
                <div class="lang-item" data-lang="Español" data-country="Latinoamérica">
                  <div class="lang-item-info">
                    <div class="lang-name-row">
                      <span class="lang-name-native">Español</span>
                      <span class="lang-country-native">Latinoamérica</span>
                    </div>
                    <div class="lang-name-sub">
                      <span class="lang-name-english">Spanish</span>
                      <span class="lang-country-english">Latin America</span>
                    </div>
                  </div>
                  <div class="lang-checkmark">
                    <svg width="10" height="8" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>

                <!-- 3. Español España (Active by default) -->
                <div class="lang-item is-active" data-lang="Español" data-country="España">
                  <div class="lang-item-info">
                    <div class="lang-name-row">
                      <span class="lang-name-native">Español</span>
                      <span class="lang-country-native">España</span>
                    </div>
                    <div class="lang-name-sub">
                      <span class="lang-name-english">Spanish</span>
                      <span class="lang-country-english">Spain</span>
                    </div>
                  </div>
                  <div class="lang-checkmark">
                    <svg width="10" height="8" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>

                <!-- 4. Portugués -->
                <div class="lang-item" data-lang="Português">
                  <div class="lang-item-info">
                    <div class="lang-name-row">
                      <span class="lang-name-native">Português</span>
                    </div>
                    <div class="lang-name-sub">
                      <span class="lang-name-english">Portuguese</span>
                    </div>
                  </div>
                  <div class="lang-checkmark">
                    <svg width="10" height="8" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>

                <!-- 5. Inglés UK -->
                <div class="lang-item" data-lang="English" data-country="UK">
                  <div class="lang-item-info">
                    <div class="lang-name-row">
                      <span class="lang-name-native">English</span>
                      <span class="lang-country-native">UK</span>
                    </div>
                    <div class="lang-name-sub">
                      <span class="lang-name-english">English</span>
                      <span class="lang-country-english">United Kingdom</span>
                    </div>
                  </div>
                  <div class="lang-checkmark">
                    <svg width="10" height="8" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>

                <!-- 6. Inglés USA -->
                <div class="lang-item" data-lang="English" data-country="US">
                  <div class="lang-item-info">
                    <div class="lang-name-row">
                      <span class="lang-name-native">English</span>
                      <span class="lang-country-native">US</span>
                    </div>
                    <div class="lang-name-sub">
                      <span class="lang-name-english">English</span>
                      <span class="lang-country-english">United States</span>
                    </div>
                  </div>
                  <div class="lang-checkmark">
                    <svg width="10" height="8" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>

                <!-- 7. Francés -->
                <div class="lang-item" data-lang="Français">
                  <div class="lang-item-info">
                    <div class="lang-name-row">
                      <span class="lang-name-native">Français</span>
                    </div>
                    <div class="lang-name-sub">
                      <span class="lang-name-english">French</span>
                    </div>
                  </div>
                  <div class="lang-checkmark">
                    <svg width="10" height="8" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>

                <!-- 8. Ruso -->
                <div class="lang-item" data-lang="Русский">
                  <div class="lang-item-info">
                    <div class="lang-name-row">
                      <span class="lang-name-native">Русский</span>
                    </div>
                    <div class="lang-name-sub">
                      <span class="lang-name-english">Russian</span>
                    </div>
                  </div>
                  <div class="lang-checkmark">
                    <svg width="10" height="8" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>

                <!-- 9. Mandarín -->
                <div class="lang-item" data-lang="简体中文">
                  <div class="lang-item-info">
                    <div class="lang-name-row">
                      <span class="lang-name-native">简体中文</span>
                    </div>
                    <div class="lang-name-sub">
                      <span class="lang-name-english">Mandarin Chinese</span>
                    </div>
                  </div>
                  <div class="lang-checkmark">
                    <svg width="10" height="8" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>

                <!-- 10. Japonés -->
                <div class="lang-item" data-lang="日本語">
                  <div class="lang-item-info">
                    <div class="lang-name-row">
                      <span class="lang-name-native">日本語</span>
                    </div>
                    <div class="lang-name-sub">
                      <span class="lang-name-english">Japanese</span>
                    </div>
                  </div>
                  <div class="lang-checkmark">
                    <svg width="10" height="8" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>

              </div>
            </div>
          </div>
          <!-- Botón Listo -->
          <button class="btn btn-secondary btn-listo">Listo</button>
        </div>
      </div>
    </div>
    `;

    this.initGoogleTranslate();
    this.initLanguageModal();
  }

  initGoogleTranslate() {
    if (!document.getElementById('google_translate_element')) {
      const gtDiv = document.createElement('div');
      gtDiv.id = 'google_translate_element';
      gtDiv.style.display = 'none';
      document.body.appendChild(gtDiv);
    }

    if (!window.googleTranslateElementInit) {
      window.googleTranslateElementInit = () => {
        new google.translate.TranslateElement({
          pageLanguage: 'es',
          includedLanguages: 'es,pt,en,fr,ru,zh-CN,ja',
          layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false
        }, 'google_translate_element');
      };
    }

    if (!document.querySelector('script[src*="translate.google.com"]')) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }

  getGoogleTranslateCode(lang, country) {
    if (lang === 'Español') return 'es';
    if (lang === 'Português') return 'pt';
    if (lang === 'English') return 'en';
    if (lang === 'Français') return 'fr';
    if (lang === 'Русский') return 'ru';
    if (lang === '简体中文') return 'zh-CN';
    if (lang === '日本語') return 'ja';
    return 'es';
  }

  setTranslateCookie(code) {
    const value = `/es/${code}`;
    const domain = window.location.hostname;
    document.cookie = `googtrans=${value}; path=/;`;
    document.cookie = `googtrans=${value}; path=/; domain=${domain};`;
    if (domain.includes('.')) {
      document.cookie = `googtrans=${value}; path=/; domain=.${domain};`;
    }
  }

  clearTranslateCookie() {
    const domain = window.location.hostname;
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
    if (domain.includes('.')) {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain};`;
    }
  }

  triggerGoogleTranslate(code) {
    if (code === 'es') {
      this.clearTranslateCookie();
    } else {
      this.setTranslateCookie(code);
    }

    const setComboValue = () => {
      const combo = document.querySelector('.goog-te-combo');
      if (combo) {
        const val = code === 'es' ? '' : code;
        if (combo.value !== val) {
          combo.value = val;
          combo.dispatchEvent(new Event('change'));
        }
        return true;
      }
      return false;
    };

    if (!setComboValue()) {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (setComboValue() || attempts > 50) {
          clearInterval(interval);
        }
      }, 100);
    }
  }

  initLanguageModal() {
    const langBtn = this.querySelector('.lang');
    const overlay = this.querySelector('#lang-menu-overlay');
    const listoBtn = this.querySelector('.btn-listo');

    if (!langBtn || !overlay || !listoBtn) return;

    const savedNative = localStorage.getItem('faust-lang-native');
    const savedCountry = localStorage.getItem('faust-lang-country');
    
    this.currentLangNative = savedNative || 'Español';
    this.currentLangCountry = savedCountry || 'España';
    this.currentLangCode = this.getGoogleTranslateCode(this.currentLangNative, this.currentLangCountry);

    if (savedNative) {
      const countryText = savedCountry ? ` <span style="color: #8B8D91 !important;">${savedCountry}</span>` : '';
      langBtn.innerHTML = `<img src="./assets/Icons/Globe.svg" alt=""> ${savedNative}${countryText}`;
    }

    this.triggerGoogleTranslate(this.currentLangCode);

    const syncActiveItem = () => {
      const items = this.querySelectorAll('.lang-item');
      items.forEach(item => {
        const itemNative = item.getAttribute('data-lang');
        const itemCountry = item.getAttribute('data-country') || '';
        if (itemNative === this.currentLangNative && itemCountry === this.currentLangCountry) {
          item.classList.add('is-active');
        } else {
          item.classList.remove('is-active');
        }
      });
    };

    langBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      syncActiveItem();

      const isDesktop = window.innerWidth >= 981;
      let langWidth = 0;
      if (isDesktop) {
        langWidth = langBtn.offsetWidth;
        listoBtn.style.transition = 'none';
        listoBtn.style.width = langWidth + 'px';
        langBtn.style.transition = 'opacity 0.15s ease';
        langBtn.style.opacity = '0';
        langBtn.style.pointerEvents = 'none';
      }

      overlay.classList.add('is-open');
      
      const activeItem = this.querySelector('.lang-item.is-active');
      if (activeItem) {
        setTimeout(() => {
          activeItem.scrollIntoView({ block: 'center', inline: 'nearest' });
        }, 50);
      }

      if (isDesktop) {
        // Force reflow
        listoBtn.offsetWidth;
        listoBtn.style.transition = 'width 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
        listoBtn.style.width = '100%';
      }
    });

    const closeModal = () => {
      const isDesktop = window.innerWidth >= 981;
      if (isDesktop) {
        const langWidth = langBtn.offsetWidth;
        listoBtn.style.transition = 'width 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
        listoBtn.style.width = langWidth + 'px';
      }
      overlay.classList.remove('is-open');
      if (isDesktop) {
        setTimeout(() => {
          langBtn.style.opacity = '1';
          langBtn.style.pointerEvents = 'auto';
          listoBtn.style.width = '';
        }, 300);
      }
    };

    listoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      const activeItem = this.querySelector('.lang-item.is-active');
      if (activeItem) {
        const nativeName = activeItem.getAttribute('data-lang');
        const countryName = activeItem.getAttribute('data-country') || '';
        const code = this.getGoogleTranslateCode(nativeName, countryName);

        if (code !== this.currentLangCode || nativeName !== this.currentLangNative || countryName !== this.currentLangCountry) {
          localStorage.setItem('faust-lang-native', nativeName);
          if (countryName) {
            localStorage.setItem('faust-lang-country', countryName);
          } else {
            localStorage.removeItem('faust-lang-country');
          }

          if (code === 'es') {
            this.clearTranslateCookie();
          } else {
            this.setTranslateCookie(code);
          }

          window.location.reload();
          return;
        }
      }

      closeModal();
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.classList.contains('lang-overlay-wrap')) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
        closeModal();
      }
    });
    
    const langItems = this.querySelectorAll('.lang-item');
    langItems.forEach(item => {
      item.addEventListener('click', () => {
        langItems.forEach(i => i.classList.remove('is-active'));
        item.classList.add('is-active');
      });
    });
  }
}

customElements.define('faust-navbar', FaustNavbar);
customElements.define('faust-footer', FaustFooter);