
class FaustNavbar extends HTMLElement {
  connectedCallback() {
    this._onLanguageChanged = () => {
      this.render();
    };
    window.addEventListener('faust-language-changed', this._onLanguageChanged);

    this.render();
  }

  render() {
    this.cleanup();

    const activeCode = getSelectedCode();
    const isLATAM = (activeCode === 'es-LA');

    let navLangHtml = '';
    let aplicarBtnClass = 'btn btn-secondary btn-nav';
    let arrowClass = 'arrow arrow-light';

    if (!isLATAM) {
      aplicarBtnClass = 'btn btn-primary btn-nav';
      arrowClass = 'arrow';

      const buttonLabel = getButtonLabelHtml(activeCode);
      const navbarButtonLabel = buttonLabel.replace(
        /^(<img[^>]+>)\s*(.+)$/i,
        '$1<span class="nav-lang-btn-text">$2</span>'
      );
      const dropdownItems = generateLangListHtml(activeCode);

      navLangHtml = `
        <div class="nav-lang-selector notranslate" translate="no" id="nav-lang-selector">
          <button class="btn btn-secondary btn-nav nav-lang-btn" id="nav-lang-btn" style="user-select: none !important;">
            ${navbarButtonLabel}
          </button>
          <div class="nav-lang-dropdown" id="nav-lang-dropdown">
            <div class="lang-modal notranslate" translate="no">
              <div class="lang-modal-header">
                <span>Select your language</span>
              </div>
              <div class="lang-modal-body">
                <div class="lang-list">
                  ${dropdownItems}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

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
          background: transparent !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
        }

        .nav::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          background: rgb(8, 9, 10) !important; 
          backdrop-filter: blur(0px) !important;
          -webkit-backdrop-filter: blur(0px) !important;
          transition: background var(--nav-transition-dur) cubic-bezier(0.25, 1, 0.5, 1), 
                      backdrop-filter var(--nav-transition-dur) cubic-bezier(0.25, 1, 0.5, 1),
                      -webkit-backdrop-filter var(--nav-transition-dur) cubic-bezier(0.25, 1, 0.5, 1);
        }

        .nav.is-active::before {
          background: rgba(9, 10, 11, 0.88) !important; 
          backdrop-filter: blur(20px) !important;
          -webkit-backdrop-filter: blur(20px) !important;
        }

        .logo-lockup {
          user-select: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          -webkit-user-drag: none !important;
          user-drag: none !important;
        }
        img, svg {
          -webkit-user-drag: none !important;
          user-drag: none !important;
          user-select: none !important;
          pointer-events: none !important;
        }

        /* Navbar language selector styles */
        .nav-lang-selector {
          position: relative;
          display: inline-block;
          margin-right: -6px;
        }
        @media (max-width: 980px) {
          .nav-lang-selector {
            display: none !important;
          }
        }
        
        
        .nav-lang-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0 !important;
          cursor: pointer;
          user-select: none;
          height: 50px;
          padding: 0 16px !important;
          border-radius: 999px;
          box-sizing: border-box;
          transition: padding 0.4s ease-out,
                      background 180ms ease-out,
                      color 180ms ease-out;
        }

        .nav-lang-btn:hover,
        .nav-lang-selector:hover .nav-lang-btn,
        .nav-lang-selector:has(.is-open) .nav-lang-btn {
          background: rgba(238, 238, 241, 0.10) !important;
          color: #fff !important;
        }

        /* Ensure the gradient border outline remains visible on hover/open, matching standard secondary buttons */
        .nav-lang-selector:hover .nav-lang-btn::before,
        .nav-lang-selector:has(.is-open) .nav-lang-btn::before,
        .nav-lang-btn:hover::before {
          opacity: 1 !important;
        }

        .nav-lang-btn-text {
          max-width: 0;
          opacity: 0;
          overflow: hidden;
          white-space: nowrap;
          margin-left: 0;
          display: inline-block;
          font-weight: 500;
          font-size: 14px;
          line-height: 1;
          transition: max-width 0.4s ease-out,
                      opacity 0.3s ease-out,
                      margin-left 0.4s ease-out;
        }

        .nav-lang-selector:hover .nav-lang-btn,
        .nav-lang-selector:focus-within .nav-lang-btn,
        .nav-lang-selector:has(.is-open) .nav-lang-btn {
          padding: 0 20px !important;
        }

        .nav-lang-selector:hover .nav-lang-btn-text,
        .nav-lang-selector:focus-within .nav-lang-btn-text,
        .nav-lang-selector:has(.is-open) .nav-lang-btn-text {
          max-width: 250px;
          opacity: 1;
          margin-left: 8px;
        }

        .btn-primary.btn-nav {
          color: #161616 !important;
        }

        .btn-primary.btn-nav:hover {
          color: #fff !important;
        }

        .nav-lang-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 12px;
          width: 380px;
          max-width: calc(100vw - 32px);
          display: flex;
          flex-direction: column;
          z-index: 1000;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transform: translateY(-8px);
          transition: opacity 0.25s cubic-bezier(0.25, 1, 0.5, 1),
                      transform 0.25s cubic-bezier(0.25, 1, 0.5, 1),
                      visibility 0.25s;
        }
        
        .nav-lang-dropdown.is-open {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
          transform: translateY(0);
        }

        /* Reusing exact modal styles from footer modal */
        .nav-lang-dropdown .lang-modal {
          background: rgba(253, 253, 255, 0.06);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: none;
          border-radius: 20px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          max-height: 380px;
          /* Preventing CSS leakage from FaustFooter scaleY(0) / opacity 0 */
          transform: none !important;
          opacity: 1 !important;
        }

        .nav-lang-dropdown .lang-modal-header {
          padding: 20px 24px;
          display: flex;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .nav-lang-dropdown .lang-modal-header span {
          font-size: 15px;
          font-weight: 600;
          color: #fff;
          letter-spacing: 0.28px;
        }

        .nav-lang-dropdown .lang-modal-body {
          overflow-y: auto;
          padding: 10px 0;
          flex: 1;
        }

        .nav-lang-dropdown .lang-modal-body::-webkit-scrollbar {
          width: 4px;
        }

        .nav-lang-dropdown .lang-modal-body::-webkit-scrollbar-track {
          background: transparent;
          margin: 12px 0;
        }

        .nav-lang-dropdown .lang-modal-body::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 10px;
        }

        .nav-lang-dropdown .lang-modal-body::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .nav-lang-dropdown .lang-item {
          padding: 12px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .nav-lang-dropdown .lang-item:hover {
          background: rgba(255, 255, 255, 0.04);
        }

        .nav-lang-dropdown .lang-item-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .nav-lang-dropdown .lang-name-row {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }

        .nav-lang-dropdown .lang-name-native {
          font-size: 14px;
          font-weight: 500;
          color: #fff;
        }

        .nav-lang-dropdown .lang-country-native {
          font-size: 13px;
          color: #8b8d91;
        }

        .nav-lang-dropdown .lang-name-sub {
          display: flex;
          align-items: baseline;
          gap: 4px;
          font-size: 12px;
          color: #8b8d91;
        }

        .nav-lang-dropdown .lang-checkmark {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--blue, #0022ff);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          opacity: 0;
          transform: scale(0.8);
          transition: opacity 0.2s, transform 0.2s;
        }

        .nav-lang-dropdown .lang-item.is-active .lang-checkmark {
          opacity: 1;
          transform: scale(1);
        }

        /* Prevent transitions during window resize */
        body.resize-active .nav-lang-dropdown,
        body.resize-active .nav-lang-dropdown * {
          transition: none !important;
          animation: none !important;
        }
      </style>

      <nav class="nav">
        <div class="wrap nav-inner">
          <div class="logo-lockup" style="margin:0">
            <img id="nav-isotipo" class="nav-logo-icon" src="./assets/Logotypes/Faust Logo.svg" alt="Faust" draggable="false">
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
            ${navLangHtml}
            <a class="${aplicarBtnClass}" href="./index.html#aplicar">
              Aplicar
              <img class="${arrowClass}" src="./assets/Icons/button_arrow.svg" alt="">
            </a>
          </div>
        </div>
      </nav>
    `;

    const internalNav = this.querySelector('.nav');
    if (internalNav) {
      internalNav.offsetHeight; 

      const isReload = localStorage.getItem('faust-show-modal-after-reload') === 'true';
      if (isReload) {
        internalNav.classList.add('is-active');
      } else {
        setTimeout(() => {
          internalNav.classList.add('is-active');
        }, 120);
      }
    }

    if (!isLATAM) {
      const navLangBtn = this.querySelector('#nav-lang-btn');
      const navLangDropdown = this.querySelector('#nav-lang-dropdown');

      if (navLangBtn && navLangDropdown) {
        navLangBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          navLangDropdown.classList.toggle('is-open');
        });

        const outsideClickListener = (e) => {
          if (!this.contains(e.target)) {
            navLangDropdown.classList.remove('is-open');
          }
        };
        document.addEventListener('click', outsideClickListener);
        this._outsideClickListener = outsideClickListener;
      }

      const langItems = this.querySelectorAll('#nav-lang-dropdown .lang-item');
      langItems.forEach(item => {
        item.addEventListener('click', () => {
          const code = item.getAttribute('data-code');
          const langDef = FAUST_LANGUAGES.find(l => l.code === code);
          if (langDef) {
            const currentCode = getSelectedCode();
            const currentCookieCode = getTranslateCodeForSelection(currentCode);
            const targetCookieCode = getTranslateCodeForSelection(code);

            localStorage.setItem('faust-lang-selection-code', code);
            localStorage.setItem('faust-lang-native', langDef.lang);
            if (langDef.country) {
              localStorage.setItem('faust-lang-country', langDef.country);
            } else {
              localStorage.removeItem('faust-lang-country');
            }

            if (currentCookieCode === targetCookieCode) {
              window.dispatchEvent(new CustomEvent('faust-language-changed', {
                detail: { code }
              }));
            } else {
              const cookieCode = targetCookieCode;
              if (cookieCode === 'es') {
                clearTranslateCookie();
              } else {
                setTranslateCookie(cookieCode);
              }
              window.location.reload();
            }
          }
        });
      });
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
      this._heroObserver = new IntersectionObserver(
        ([entry]) => {
          isHeroIntersecting = entry.isIntersecting;
          updateLogoColor();
        },
        { threshold: 0, rootMargin: '-80px 0px 0px 0px' }
      );
      this._heroObserver.observe(heroLogo);
    } else {
      isHeroIntersecting = false;
      updateLogoColor();
    }

    if (ctaLogo) {
      this._ctaObserver = new IntersectionObserver(
        ([entry]) => {
          isCtaIntersecting = entry.isIntersecting;
          updateLogoColor();
        },
        { threshold: 0, rootMargin: '0px 0px -30% 0px' }
      );
      this._ctaObserver.observe(ctaLogo);
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

  cleanup() {
    if (this._resizeHandler) {
      window.removeEventListener('resize', this._resizeHandler);
      this._resizeHandler = null;
    }
    if (this._outsideClickListener) {
      document.removeEventListener('click', this._outsideClickListener);
      this._outsideClickListener = null;
    }
    if (this._heroObserver) {
      this._heroObserver.disconnect();
      this._heroObserver = null;
    }
    if (this._ctaObserver) {
      this._ctaObserver.disconnect();
      this._ctaObserver = null;
    }
  }

  disconnectedCallback() {
    this.cleanup();
    if (this._onLanguageChanged) {
      window.removeEventListener('faust-language-changed', this._onLanguageChanged);
      this._onLanguageChanged = null;
    }
  }
}


class FaustFooter extends HTMLElement {
  connectedCallback() {
    this._onLanguageChanged = () => {
      this.render();
    };
    window.addEventListener('faust-language-changed', this._onLanguageChanged);

    this.render();
  }

  render() {
    // 1. Check if the modal overlay was open before rendering
    const overlay = this.querySelector('#lang-menu-overlay');
    const wasOpen = overlay ? overlay.classList.contains('is-open') : false;
    const savedScrollTop = this._savedModalScrollTop !== undefined ? this._savedModalScrollTop : null;
    this._savedModalScrollTop = undefined;

    // 2. Perform cleanup of global listeners and observers
    this.cleanup();

    // 3. Render HTML template
    const activeCode = getSelectedCode();
    const buttonLabel = getButtonLabelHtml(activeCode);
    const langListHtml = generateLangListHtml(activeCode);

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
            transition: background 0.3s cubic-bezier(0.25, 1, 0.5, 1),
                        visibility 0.3s cubic-bezier(0.25, 1, 0.5, 1);
          }
          .lang-overlay.is-open {
            visibility: visible;
            background: rgba(0, 0, 0, 0.6);
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

        /* Prevent transitions during window resize */
        body.resize-active .lang-overlay,
        body.resize-active .lang-overlay * {
          transition: none !important;
          animation: none !important;
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
              
              <span class="lang btn btn-secondary notranslate" translate="no">${buttonLabel}</span>
              
            </div>
          </div>
        </div>
      </footer>

      <!-- Language selection modal overlay -->
      <div class="lang-overlay" id="lang-menu-overlay">
        <div class="wrap lang-overlay-wrap">
          <div class="lang-modal-container">
            <div class="lang-modal notranslate" translate="no">
              <div class="lang-modal-header">
                <span>Select your language</span>
              </div>
              <div class="lang-modal-body">
                <div class="lang-list">
                  ${langListHtml}
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
    this.initLanguageModal(wasOpen, savedScrollTop);
    this.initResizeHandler();
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
    const code = getSelectedCode();
    return getTranslateCodeForSelection(code);
  }

  setTranslateCookie(code) {
    setTranslateCookie(code);
  }

  clearTranslateCookie() {
    clearTranslateCookie();
  }

  triggerGoogleTranslate(code) {
    const metaId = 'faust-notranslate-meta';
    if (code === 'es') {
      this.clearTranslateCookie();
      document.documentElement.setAttribute('translate', 'no');
      if (!document.getElementById(metaId)) {
        const meta = document.createElement('meta');
        meta.id = metaId;
        meta.name = 'google';
        meta.content = 'notranslate';
        document.head.appendChild(meta);
      }
    } else {
      this.setTranslateCookie(code);
      document.documentElement.removeAttribute('translate');
      const meta = document.getElementById(metaId);
      if (meta) {
        meta.remove();
      }
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

  initLanguageModal(wasOpen = false, savedScrollTop = null) {
    const langBtn = this.querySelector('.lang');
    const overlay = this.querySelector('#lang-menu-overlay');
    const listoBtn = this.querySelector('.btn-listo');

    if (!langBtn || !overlay || !listoBtn) return;

    const activeCode = getSelectedCode();
    
    this.currentLangCode = getTranslateCodeForSelection(activeCode);

    this.triggerGoogleTranslate(this.currentLangCode);

    const syncActiveItem = () => {
      const items = this.querySelectorAll('.lang-item');
      items.forEach(item => {
        const code = item.getAttribute('data-code');
        if (code === activeCode) {
          item.classList.add('is-active');
        } else {
          item.classList.remove('is-active');
        }
      });
    };

    const startTranslationMonitoring = () => {
      if (this._translationObserver) {
        this._translationObserver.disconnect();
        this._translationObserver = null;
      }
      if (this._translationTimeout) clearTimeout(this._translationTimeout);
      if (this._maxTimeout) clearTimeout(this._maxTimeout);

      listoBtn.disabled = true;
      listoBtn.style.opacity = '0.6';
      listoBtn.style.pointerEvents = 'none';
      listoBtn.style.cursor = 'not-allowed';
      listoBtn.textContent = 'Translating...';

      const resetDebounce = () => {
        if (this._translationTimeout) clearTimeout(this._translationTimeout);
        this._translationTimeout = setTimeout(() => {
          stopTranslationMonitoring();
        }, 700);
      };

      this._translationObserver = new MutationObserver((mutations) => {
        resetDebounce();
      });

      this._translationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
      });

      resetDebounce();

      this._maxTimeout = setTimeout(() => {
        stopTranslationMonitoring();
      }, 3500);
    };

    const stopTranslationMonitoring = () => {
      if (this._translationObserver) {
        this._translationObserver.disconnect();
        this._translationObserver = null;
      }
      if (this._translationTimeout) clearTimeout(this._translationTimeout);
      if (this._maxTimeout) clearTimeout(this._maxTimeout);

      listoBtn.disabled = false;
      listoBtn.style.opacity = '';
      listoBtn.style.pointerEvents = '';
      listoBtn.style.cursor = '';
      listoBtn.textContent = 'Listo';

      localStorage.removeItem('faust-show-modal-after-reload');

      const noTransStyle = document.getElementById('faust-no-transitions-style');
      if (noTransStyle) {
        noTransStyle.remove();
      }
    };

    const shouldOpenModal = localStorage.getItem('faust-show-modal-after-reload') === 'true';
    if (wasOpen || shouldOpenModal) {
      syncActiveItem();

      const isDesktop = window.innerWidth >= 981;
      if (isDesktop) {
        langBtn.style.opacity = '0';
        langBtn.style.pointerEvents = 'none';
        listoBtn.style.width = '100%';
      }

      const modalBody = this.querySelector('.lang-modal-body');
      if (modalBody) {
        if (savedScrollTop !== null) {
          modalBody.scrollTop = savedScrollTop;
        } else {
          const activeItem = this.querySelector('.lang-item.is-active');
          if (activeItem) {
            activeItem.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'auto' });
          }
        }
      }

      overlay.classList.add('is-open');

      if (shouldOpenModal) {
        startTranslationMonitoring();
      }
    }

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

      const activeItem = this.querySelector('.lang-item.is-active');
      if (activeItem) {
        activeItem.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'auto' });
      }

      overlay.classList.add('is-open');

      if (isDesktop) {
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
      closeModal();
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.classList.contains('lang-overlay-wrap')) {
        closeModal();
      }
    });

    this._keydownListener = (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
        closeModal();
      }
    };
    document.addEventListener('keydown', this._keydownListener);
    
    const langItems = this.querySelectorAll('.lang-item');
    langItems.forEach(item => {
      item.addEventListener('click', () => {
        const code = item.getAttribute('data-code');
        const langDef = FAUST_LANGUAGES.find(l => l.code === code);

        if (langDef && code !== activeCode) {
          const currentCookieCode = getTranslateCodeForSelection(activeCode);
          const targetCookieCode = getTranslateCodeForSelection(code);

          localStorage.setItem('faust-lang-selection-code', code);
          localStorage.setItem('faust-lang-native', langDef.lang);
          if (langDef.country) {
            localStorage.setItem('faust-lang-country', langDef.country);
          } else {
            localStorage.removeItem('faust-lang-country');
          }

          if (currentCookieCode === targetCookieCode) {
            const modalBody = this.querySelector('.lang-modal-body');
            if (modalBody) {
              this._savedModalScrollTop = modalBody.scrollTop;
            }
            window.dispatchEvent(new CustomEvent('faust-language-changed', {
              detail: { code }
            }));
          } else {
            localStorage.setItem('faust-show-modal-after-reload', 'true');

            const modalBody = this.querySelector('.lang-modal-body');
            if (modalBody) {
              localStorage.setItem('faust-modal-scroll-top', modalBody.scrollTop.toString());
            }

            if (targetCookieCode === 'es') {
              this.clearTranslateCookie();
            } else {
              this.setTranslateCookie(targetCookieCode);
            }

            window.location.reload();
          }
        }
      });
    });
  }

  initResizeHandler() {
    this._resizeHandler = () => {
      if (this._resizeTimeout) {
        clearTimeout(this._resizeTimeout);
      }
      document.body.classList.add('resize-active');
      this._resizeTimeout = setTimeout(() => {
        document.body.classList.remove('resize-active');
      }, 100);
    };
    window.addEventListener('resize', this._resizeHandler);
  }

  cleanup() {
    if (this._resizeHandler) {
      window.removeEventListener('resize', this._resizeHandler);
      this._resizeHandler = null;
    }
    if (this._resizeTimeout) {
      clearTimeout(this._resizeTimeout);
      this._resizeTimeout = null;
    }
    document.body.classList.remove('resize-active');

    if (this._keydownListener) {
      document.removeEventListener('keydown', this._keydownListener);
      this._keydownListener = null;
    }
    if (this._translationObserver) {
      this._translationObserver.disconnect();
      this._translationObserver = null;
    }
    if (this._translationTimeout) {
      clearTimeout(this._translationTimeout);
      this._translationTimeout = null;
    }
    if (this._maxTimeout) {
      clearTimeout(this._maxTimeout);
      this._maxTimeout = null;
    }
  }

  disconnectedCallback() {
    this.cleanup();
    if (this._onLanguageChanged) {
      window.removeEventListener('faust-language-changed', this._onLanguageChanged);
      this._onLanguageChanged = null;
    }
  }
}

customElements.define('faust-navbar', FaustNavbar);
customElements.define('faust-footer', FaustFooter);
