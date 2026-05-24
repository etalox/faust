
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
    let aplicarBtnClass = 'btn btn-secondary btn-nav faust-apply-btn';
    let arrowClass = 'arrow arrow-light';

    if (!isLATAM) {
      aplicarBtnClass = 'btn btn-primary btn-nav faust-apply-btn';
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
        /* ── Base Styles for Navbar Components ── */
        .btn { border-radius: 999px; padding: 16px 24px; font-size: 16px; border: 1px solid transparent; display: inline-flex; gap: 8px; align-items: center; cursor: pointer; text-decoration: none; box-sizing: border-box; font-family: inherit; }
        .btn-primary { background: #f2f2f2; color: #161616 !important; font-weight: 600; transition: background 240ms ease-out, color 240ms ease-out, border-color 240ms ease-out; }
        .btn-primary:hover { background: #0022ff; color: #fff !important; }
        .btn-primary:hover .arrow { filter: invert(1); }
        .btn-secondary { 
          position: relative; 
          background: var(--chip); 
          border: 0 !important;
          color: #f2f2f2; 
          backdrop-filter: blur(20px); 
          transition: background 180ms ease-out, color 180ms ease-out, border-color 180ms ease-out; 
        }
        .btn-secondary::before { 
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
        .btn-secondary:hover { background: rgba(238, 238, 241, 0.10); color: #fff; }
        .btn-nav { height: 50px; padding: 18px 20px; font-size: 14px; color: #fff; border-radius: 40px; backdrop-filter: blur(20px); overflow: hidden; }
        .btn-nav:hover { background: #0022ff; }
        .btn-secondary::before { transition: opacity 180ms ease-out; }
        .btn-nav:hover::before { opacity: 0; }
        
        .arrow { width: 14px; height: 10px; transition: filter 240ms ease-out; }
        .arrow-light { filter: invert(1); }

        .nav-links a, #nav-contacto {
          transition: opacity 0.2s ease, color 0.2s ease;
        }
        .nav-links a:hover, #nav-contacto:hover {
          color: #ffffff !important;
        }

        .nav {
          position: sticky;
          top: 0;
          z-index: 20;
          border-bottom: 1px solid var(--line);
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

        .nav-inner { height: 80px; display: flex; justify-content: space-between; align-items: center; position: relative; }
        .nav-links { position: absolute; left: 50%; transform: translateX(-50%); display: flex; gap: 30px; color: #7c7f84; font-size: 14px; user-select: none !important; }
        .nav.nav-contacto-hidden #nav-contacto { display: none; }
        .nav-right { display: flex; align-items: center; gap: 22px; color: #7c7f84; font-size: 14px; }

        @media (max-width: 980px) {
          .nav { position: fixed; top: 0; left: 0; right: 0; }
        }

        .logo-lockup {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          letter-spacing: .28px;
          user-select: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          -webkit-user-drag: none !important;
          user-drag: none !important;
        }
        .logo-lockup img {
          width: 34px;
          height: 20px;
        }
        .nav-logo-icon {
          transition: filter .45s cubic-bezier(.4,0,.2,1);
          filter: brightness(0) invert(1);
        }
        .nav-logo-icon.is-blue {
          filter: none;
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
          visibility: hidden;
          pointer-events: none;
          transform: translateY(-8px);
          transition: transform 0.25s cubic-bezier(0.25, 1, 0.5, 1),
                      visibility 0.25s;
        }
        
        .nav-lang-dropdown.is-open {
          visibility: visible;
          pointer-events: auto;
          transform: translateY(0);
        }

        /* Reusing exact modal styles from footer modal */
        .nav-lang-dropdown .lang-modal {
          background: rgba(253, 253, 255, 0);
          backdrop-filter: blur(0px);
          -webkit-backdrop-filter: blur(0px);
          border: none;
          border-radius: 20px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          max-height: 380px;
          /* Preventing CSS leakage from FaustFooter scaleY(0) / opacity 0 */
          transform: none !important;
          opacity: 1 !important;
          transition: background 0.25s cubic-bezier(0.25, 1, 0.5, 1),
                      backdrop-filter 0.25s cubic-bezier(0.25, 1, 0.5, 1),
                      -webkit-backdrop-filter 0.25s cubic-bezier(0.25, 1, 0.5, 1),
                      box-shadow 0.25s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .nav-lang-dropdown.is-open .lang-modal {
          background: rgba(253, 253, 255, 0.06);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
        }

        .nav-lang-dropdown .lang-modal-header,
        .nav-lang-dropdown .lang-modal-body {
          opacity: 0;
          transition: opacity 0.2s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .nav-lang-dropdown.is-open .lang-modal-header,
        .nav-lang-dropdown.is-open .lang-modal-body {
          opacity: 1;
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
          <a class="logo-lockup" href="./index.html" style="margin:0">
            <img id="nav-isotipo" class="nav-logo-icon" src="./assets/Logotypes/Faust Logo.svg" alt="Faust" draggable="false">
            <span id="nav-logo-text">FaustPartners™</span>
          </a>
          <div class="nav-links">
            <a href="./index.html#estrategia">Estrategia</a>
            <a href="./index.html#resultados">Resultados</a>
            <a href="./index.html#expertos">Expertos</a>
            <a href="./index.html#empresa">Empresa</a>
          </div>
          <div class="nav-right">
            <a id="nav-contacto" href="./index.html#contacto" style="user-select: none !important;">Contacto</a>
            ${navLangHtml}
            <a class="${aplicarBtnClass}" data-action="apply" href="./index.html#aplicar">
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

    const navLangBtn = this.querySelector('#nav-lang-btn');
    const navLangDropdown = this.querySelector('#nav-lang-dropdown');

    if (!isLATAM && navLangBtn && navLangDropdown) {
      navLangBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        navLangDropdown.classList.toggle('is-open');
      });

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

    const outsideClickListener = (e) => {
      if (!this.contains(e.target)) {
        if (navLangDropdown) navLangDropdown.classList.remove('is-open');
      }
    };
    document.addEventListener('click', outsideClickListener);
    this._outsideClickListener = outsideClickListener;

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
        
        footer { border-top: 1px solid var(--line); padding: 80px 0 15px; }
        .footer-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 60px; margin-bottom: 80px; }
        .footer-col h4 { margin: 0 0 24px; font-family: "BDO Grotesk", sans-serif; font-weight: 500; font-size: 18px; color: #fff; }
        .footer-col a { display: block; color: #7c7f84; margin: 10px 0; font-size: 16px; text-decoration: none; }
        .footer-col a:hover { color: #fff; }
        .footer-bottom { display: flex; justify-content: space-between; align-items: center; gap: 20px; color: #7c7f84; font-size: 16px; }
        .lang { display: inline-flex; align-items: center; gap: 8px; border: 1px solid var(--line); border-radius: 999px; padding: 16px 20px; background: var(--chip); color:white; cursor: pointer; }
        .lang img { width: 16px; height: 16px; }

        @media (max-width: 980px) {
          .footer-grid { grid-template-columns: 1fr; gap: 30px; }
          .footer-bottom {
            display: flex !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 20px !important;
            width: 100% !important;
          }

          .footer-bottom > div:first-child {
            order: 1 !important;
            text-align: left !important;
          }

          .footer-bottom > div:nth-child(2) {
            order: 2 !important;
            display: flex !important;
            flex-direction: row !important;
            justify-content: flex-start !important;
            flex-wrap: wrap !important;
            gap: 20px !important;
            width: 100% !important;
          }

          .footer-bottom > div:last-child {
            order: 3 !important;
            display: flex !important;
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: center !important;
          }
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

        /* ── Menú de selección de idiomas (original / FaustPartners) ── */
        .lang-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0);
          z-index: 2000;
          visibility: hidden;
          pointer-events: none;
          transition: background 0.3s cubic-bezier(0.25, 1, 0.5, 1),
                      visibility 0.3s;
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
          visibility: visible;
          background: rgba(0, 0, 0, 0.6);
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
          background: rgba(253, 253, 255, 0);
          backdrop-filter: blur(0px);
          -webkit-backdrop-filter: blur(0px);
          border: none;
          border-radius: 20px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-height: 0;
          transition: background 0.3s cubic-bezier(0.25, 1, 0.5, 1),
                      backdrop-filter 0.3s cubic-bezier(0.25, 1, 0.5, 1),
                      -webkit-backdrop-filter 0.3s cubic-bezier(0.25, 1, 0.5, 1),
                      box-shadow 0.3s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .lang-overlay.is-open .lang-modal {
          background: var(--chip);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
        }

        .lang-modal-header,
        .lang-modal-body,
        .btn-listo {
          opacity: 0;
          transition: opacity 0.25s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .lang-overlay.is-open .lang-modal-header,
        .lang-overlay.is-open .lang-modal-body,
        .lang-overlay.is-open .btn-listo {
          opacity: 1;
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
            transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1),
                        background 0.3s cubic-bezier(0.25, 1, 0.5, 1),
                        backdrop-filter 0.3s cubic-bezier(0.25, 1, 0.5, 1),
                        -webkit-backdrop-filter 0.3s cubic-bezier(0.25, 1, 0.5, 1),
                        box-shadow 0.3s cubic-bezier(0.25, 1, 0.5, 1);
          }
          .lang-overlay.is-open .lang-modal {
            transform: scaleY(1);
            background: var(--chip);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
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

        /* Cookie Switch Styles */
        .faust-switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
          flex-shrink: 0;
        }
        .faust-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .faust-slider {
          position: absolute;
          cursor: pointer;
          inset: 0;
          background-color: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 24px;
          transition: .3s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .faust-slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 3px;
          bottom: 3px;
          background-color: #8b8d91;
          border-radius: 50%;
          transition: .3s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .faust-switch input:checked + .faust-slider {
          background-color: var(--blue, #0022ff);
          border-color: var(--blue, #0022ff);
        }
        .faust-switch input:checked + .faust-slider:before {
          transform: translateX(20px);
          background-color: #fff;
        }
        .cookie-status-badge {
          font-size: 11px;
          font-weight: 600;
          color: #0022ff;
          background: rgba(0, 34, 255, 0.15);
          padding: 4px 8px;
          border-radius: 4px;
          white-space: nowrap;
          align-self: flex-start;
        }
      </style>

      <footer>
        <div class="wrap">
          <div class="footer-grid">
            <div class="footer-col">
              <h4>General</h4>
              <a class="faust-apply-btn" data-action="apply" href="./index.html#">Aplicar</a>
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
              <a href="./privacy.html">Privacidad</a>
              <a href="./terms.html">Términos y condiciones</a>
            </div>
            <div style="display:flex;gap:20px;align-items:center;">
              <a href="#" id="footer-cookie-trigger" style="text-decoration:underline;color:#fff;">Gestionar cookies</a>
              
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

      <!-- Cookie selection modal overlay -->
      <div class="lang-overlay" id="cookie-menu-overlay">
        <div class="wrap lang-overlay-wrap">
          <div class="lang-modal-container" style="max-height: 450px;">
            <div class="lang-modal notranslate" translate="no" style="min-height: 0; flex: 1;">
              <div class="lang-modal-header">
                <span>Configuración de cookies</span>
              </div>
              <div class="lang-modal-body" style="padding: 24px; display: flex; flex-direction: column; gap: 20px; text-align: left;">
                <!-- Esenciales -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
                  <div style="display: flex; flex-direction: column; gap: 4px;">
                    <span style="font-size: 15px; font-weight: 600; color: #fff;">Esenciales</span>
                    <span style="font-size: 12px; color: #8b8d91; line-height: 1.4;">Necesarias para el funcionamiento técnico del sitio.</span>
                  </div>
                  <span class="cookie-status-badge">Siempre activas</span>
                </div>
                
                <div style="height: 1px; background: rgba(255, 255, 255, 0.06);"></div>
                
                <!-- Cookies Analíticas -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
                  <div style="display: flex; flex-direction: column; gap: 4px;">
                    <span style="font-size: 15px; font-weight: 600; color: #fff;">Cookies analíticas</span>
                    <span style="font-size: 12px; color: #8b8d91; line-height: 1.4;">Google Analytics y Microsoft Clarity para comprender el uso del sitio y medir visitas.</span>
                  </div>
                  <label class="faust-switch">
                    <input type="checkbox" id="overlay-cookie-analytics-toggle" ${localStorage.getItem('faust-cookie-consent-analytics') === 'true' ? 'checked' : ''}>
                    <span class="faust-slider"></span>
                  </label>
                </div>
              </div>
            </div>
            <!-- Botón Guardar en modal -->
            <button class="btn btn-secondary btn-listo btn-save-cookies-overlay" id="btn-save-cookies-overlay">Guardar preferencias</button>
          </div>
        </div>
      </div>
    `;

    this.initGoogleTranslate();
    this.initLanguageModal(wasOpen, savedScrollTop);
    this.initCookieModal();
    this.initResizeHandler();
  }

  initCookieModal() {
    const triggerLink = this.querySelector('#footer-cookie-trigger');
    const overlay = this.querySelector('#cookie-menu-overlay');
    const saveBtn = this.querySelector('#btn-save-cookies-overlay');

    if (!triggerLink || !overlay || !saveBtn) return;

    const openCookieModal = (e) => {
      e.preventDefault();
      const analyticsChecked = localStorage.getItem('faust-cookie-consent-analytics') === 'true';
      
      const analyticsInput = this.querySelector('#overlay-cookie-analytics-toggle');
      if (analyticsInput) analyticsInput.checked = analyticsChecked;

      overlay.classList.add('is-open');
    };

    const closeCookieModal = () => {
      overlay.classList.remove('is-open');
    };

    triggerLink.addEventListener('click', openCookieModal);

    saveBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const analyticsInput = this.querySelector('#overlay-cookie-analytics-toggle');
      const analyticsChecked = analyticsInput ? analyticsInput.checked : false;

      const oldAnalytics = localStorage.getItem('faust-cookie-consent-analytics') === 'true';

      localStorage.setItem('faust-cookie-consent-analytics', analyticsChecked ? 'true' : 'false');

      closeCookieModal();

      if (oldAnalytics && !analyticsChecked) {
        window.location.reload();
      } else {
        if (typeof faustInitTrackingScripts === 'function') {
          faustInitTrackingScripts();
        }
      }
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.classList.contains('lang-overlay-wrap')) {
        closeCookieModal();
      }
    });
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
      if (document.body) {
        document.body.setAttribute('translate', 'no');
      }
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
      if (document.body) {
        document.body.removeAttribute('translate');
      }
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

/* ── Cumulative Session Timer ── */
(function() {
  let lastSavedTime = Date.now();
  
  document.addEventListener('visibilitychange', () => {
    lastSavedTime = Date.now();
  });
  
  setInterval(() => {
    const now = Date.now();
    if (document.visibilityState === 'visible') {
      const delta = Math.round((now - lastSavedTime) / 1000);
      if (delta > 0) {
        const accumulated = parseInt(localStorage.getItem('faust-cumulative-session-time') || '0', 10);
        localStorage.setItem('faust-cumulative-session-time', accumulated + delta);
        lastSavedTime = now;
      }
    } else {
      lastSavedTime = now;
    }
  }, 1000);
})();

/* ── Track Visited Pages ── */
(function() {
  try {
    const visited = JSON.parse(localStorage.getItem('faust-visited-pages') || '[]');
    let current = window.location.pathname.split('/').pop() || 'index.html';
    // Clean up empty, root or directory paths to index.html
    if (current === '' || current === 'es-MX' || current === 'en-US' || current === 'es-LA' || current === 'es-ES' || current === 'en-GB' || current === 'zh-CN' || current === 'pt' || current === 'fr' || current === 'ru') {
      current = 'index.html';
    }
    if (visited.length === 0 || visited[visited.length - 1] !== current) {
      visited.push(current);
      localStorage.setItem('faust-visited-pages', JSON.stringify(visited));
    }
  } catch (e) {
    console.error("Error al rastrear páginas visitadas:", e);
  }
})();

/* ── Cookie Consent and Tracking Scripts Initialization ── */
function faustInitTrackingScripts() {
  const consentAnalytics = localStorage.getItem('faust-cookie-consent-analytics') === 'true';

  if (consentAnalytics) {
    if (!window.faustGaLoaded) {
      const gaScript = document.createElement('script');
      gaScript.async = true;
      gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';
      document.head.appendChild(gaScript);
      
      window.dataLayer = window.dataLayer || [];
      window.gtag = function(){window.dataLayer.push(arguments);}
      window.gtag('js', new Date());
      window.gtag('config', 'G-XXXXXXXXXX');
      
      window.faustGaLoaded = true;
    }
    if (typeof window.clarity === 'function') {
      window.clarity("consent");
    }
  } else {
    if (typeof window.clarity === 'function') {
      window.clarity("consent", false);
    }
  }
}

// Run immediately on page load
try {
  faustInitTrackingScripts();
} catch(e) {
  console.error("Error al inicializar scripts de rastreo:", e);
}

/* ── Premium Glassmorphic Cookie Consent Banner ── */
(function() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  
  const hasConsented = localStorage.getItem('faust-cookie-consent-analytics');
  if (hasConsented === 'true') return; // Only skip if explicitly accepted

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    .cookie-banner-overlay {
      position: fixed;
      bottom: 24px;
      left: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      justify-content: center;
      pointer-events: none;
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.4s cubic-bezier(0.25, 1, 0.5, 1),
                  transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
    }

    .cookie-banner-overlay.show {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }

    .cookie-banner-container {
      position: relative;
      width: auto;
      max-width: 1200px;
      background: rgba(20, 21, 23, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      padding: 24px 44px 24px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 32px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
      box-sizing: border-box;
    }

    .cookie-banner-close {
      position: absolute;
      top: 14px;
      right: 14px;
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.4);
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: color 180ms ease, background-color 180ms ease;
    }

    .cookie-banner-close:hover {
      color: #fff;
      background-color: rgba(255, 255, 255, 0.08);
    }

    .cookie-banner-content {
      display: flex;
      flex-direction: column;
      gap: 6px;
      text-align: left;
    }

    .cookie-banner-title {
      font-size: 15px;
      font-weight: 700;
      color: #fff;
      letter-spacing: 0.28px;
    }

    .cookie-banner-text {
      font-size: 13px;
      color: #8b8d91;
      line-height: 1.5;
      margin: 0;
    }

    .btn-cookie-accept {
      height: 48px;
      padding: 0 32px;
      border-radius: 999px;
      font-size: 14px;
      font-weight: 600;
      background: #f2f2f2;
      color: #161616 !important;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background 240ms ease-out, color 240ms ease-out, transform 150ms ease;
      white-space: nowrap;
      flex-shrink: 0;
      text-decoration: none;
    }

    .btn-cookie-accept:hover {
      background: #0022ff;
      color: #fff !important;
    }

    .btn-cookie-accept:active {
      transform: scale(0.97);
    }

    @media (max-width: 768px) {
      .cookie-banner-overlay {
        bottom: 16px;
        left: 16px;
        right: 16px;
      }
      
      .cookie-banner-container {
        flex-direction: column;
        align-items: stretch;
        gap: 20px;
        padding: 28px 24px 20px 24px;
        border-radius: 16px;
      }
      
      .cookie-banner-content {
        gap: 4px;
      }
      
      .btn-cookie-accept {
        width: 100%;
        height: 44px;
      }
    }
  `;
  document.head.appendChild(style);

  const initBanner = () => {
    if (document.getElementById('faust-cookie-banner')) return;

    const activeCode = (typeof getSelectedCode === 'function') ? getSelectedCode() : 'es-LA';

    const translations = {
      'es': {
        title: 'Consentimiento de Cookies y Acuerdo Legal',
        text: 'Utilizamos cookies analíticas. Al hacer clic en Aceptar, aceptas nuestra <a href="./privacy.html" target="_blank" style="color: #fff; text-decoration: underline;">Política de Privacidad</a> y nuestros <a href="./terms.html" target="_blank" style="color: #fff; text-decoration: underline;">Términos y Condiciones</a>.',
        accept: 'Aceptar'
      },
      'pt': {
        title: 'Consentimento de Cookies e Acordo Legal',
        text: 'Utilizamos cookies de análise. Ao clicar em Aceitar, você concorda com nossa <a href="./privacy.html" target="_blank" style="color: #fff; text-decoration: underline;">Política de Privacidade</a> e nossos <a href="./terms.html" target="_blank" style="color: #fff; text-decoration: underline;">Termos de Serviço</a>.',
        accept: 'Aceitar'
      },
      'en': {
        title: 'Cookie Consent & Legal Agreement',
        text: 'We use analytical cookies. By clicking Accept, you agree to our <a href="./privacy.html" target="_blank" style="color: #fff; text-decoration: underline;">Privacy Policy</a> and <a href="./terms.html" target="_blank" style="color: #fff; text-decoration: underline;">Terms of Service</a>.',
        accept: 'Accept'
      },
      'fr': {
        title: 'Consentement aux Cookies et Accord Légal',
        text: 'Nous utilisons des cookies analytiques. En cliquant sur Accepter, vous acceptez notre <a href="./privacy.html" target="_blank" style="color: #fff; text-decoration: underline;">Politique de Confidentialité</a> et nos <a href="./terms.html" target="_blank" style="color: #fff; text-decoration: underline;">Conditions d\'Utilisation</a>.',
        accept: 'Accepter'
      },
      'ru': {
        title: 'Согласие на использование файлов cookie и юридическое соглашение',
        text: 'Мы используем аналитические файлы cookie для анализа поведения посетителей и измерения трафика сайта. Нажимая кнопку Принять, вы соглашаетесь с нашей <a href="./privacy.html" target="_blank" style="color: #fff; text-decoration: underline;">Политикой конфиденциальности</a> и <a href="./terms.html" target="_blank" style="color: #fff; text-decoration: underline;">Условиями использования</a>.',
        accept: 'Принять'
      },
      'zh': {
        title: 'Cookie 同意与法律协议',
        text: '我们使用分析型 Cookie 来了解访客行为并测量网站流量。点击接受即表示您同意我们的 <a href="./privacy.html" target="_blank" style="color: #fff; text-decoration: underline;">隐私政策</a> 和 <a href="./terms.html" target="_blank" style="color: #fff; text-decoration: underline;">服务条款</a>。',
        accept: '接受'
      }
    };

    let baseLang = 'es';
    if (activeCode.startsWith('en')) baseLang = 'en';
    else if (activeCode.startsWith('pt')) baseLang = 'pt';
    else if (activeCode.startsWith('fr')) baseLang = 'fr';
    else if (activeCode.startsWith('ru')) baseLang = 'ru';
    else if (activeCode.startsWith('zh')) baseLang = 'zh';

    const t = translations[baseLang] || translations['es'];

    const overlay = document.createElement('div');
    overlay.className = 'cookie-banner-overlay';
    overlay.id = 'faust-cookie-banner';

    overlay.innerHTML = `
      <div class="cookie-banner-container">
        <button class="cookie-banner-close" id="btn-cookie-close" aria-label="Cerrar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <div class="cookie-banner-content">
          <span class="cookie-banner-title">${t.title}</span>
          <p class="cookie-banner-text">${t.text}</p>
        </div>
        <button class="btn-cookie-accept" id="btn-cookie-accept">${t.accept}</button>
      </div>
    `;

    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.classList.add('show');
    }, 500);

    const closeBtn = overlay.querySelector('#btn-cookie-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        overlay.classList.remove('show');
        setTimeout(() => {
          overlay.remove();
        }, 400);
      });
    }

    const acceptBtn = overlay.querySelector('#btn-cookie-accept');
    acceptBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.setItem('faust-cookie-consent-analytics', 'true');
      
      overlay.classList.remove('show');
      setTimeout(() => {
        overlay.remove();
      }, 400);

      if (typeof faustInitTrackingScripts === 'function') {
        faustInitTrackingScripts();
      }
      
      const overlayCheckbox = document.getElementById('overlay-cookie-analytics-toggle');
      if (overlayCheckbox) overlayCheckbox.checked = true;
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBanner);
  } else {
    initBanner();
  }
})();


