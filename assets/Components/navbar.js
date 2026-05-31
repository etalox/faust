class FaustNavbar extends HTMLElement {
  connectedCallback() {
    this.style.display = 'contents';
    
    if (!document.querySelector('faust-apply-modal')) {
      const modal = document.createElement('faust-apply-modal');
      document.body.appendChild(modal);
    }

    this._onLanguageChanged = () => {
      this.render();
    };
    window.addEventListener('faust-language-changed', this._onLanguageChanged);

    this.render();
  }

  render() {
    this.cleanup();

    const path = window.location.pathname.toLowerCase();
    const getRootPrefix = () => {
      if (path.includes('/start/') || path.endsWith('/start') || path.includes('/careers/') || path.endsWith('/careers')) {
        return '../';
      }
      return './';
    };
    const rootPrefix = getRootPrefix();
    const isStartPage = path.includes('/start/') || path.endsWith('/start');
    const isCareersPage = path.includes('/careers/') || path.endsWith('/careers');
    const startHref = isStartPage ? '' : `${rootPrefix}start/index.html`;
    const applyLabel = isCareersPage ? 'Unirme' : 'Aplicar';

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
          backdrop-filter: blur(40px); 
          -webkit-backdrop-filter: blur(40px); 
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
          border-bottom: 1px solid transparent !important;
          background: transparent !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          transition: border-color 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .nav.is-active {
          border-bottom-color: var(--line) !important;
        }

        /* Staggered entrance for children elements */
        .nav .logo-lockup,
        .nav .nav-links a,
        .nav .nav-right {
          opacity: 0;
          transform: translateY(-10px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .nav.is-active .logo-lockup,
        .nav.is-active .nav-links a,
        .nav.is-active .nav-right {
          opacity: 1;
          transform: translateY(0);
        }

        .nav.is-active .logo-lockup { transition-delay: 150ms; }
        .nav.is-active .nav-links a:nth-child(1) { transition-delay: 250ms; }
        .nav.is-active .nav-links a:nth-child(2) { transition-delay: 300ms; }
        .nav.is-active .nav-links a:nth-child(3) { transition-delay: 350ms; }
        .nav.is-active .nav-links a:nth-child(4) { transition-delay: 400ms; }
        .nav.is-active .nav-right { transition-delay: 500ms; }

        .nav::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          background: rgba(9, 10, 11, 0) !important; 
          backdrop-filter: blur(0px) !important;
          -webkit-backdrop-filter: blur(0px) !important;
          transition: background 0.8s cubic-bezier(0.16, 1, 0.3, 1),
                      backdrop-filter 0.8s cubic-bezier(0.16, 1, 0.3, 1),
                      -webkit-backdrop-filter 0.8s cubic-bezier(0.16, 1, 0.3, 1);
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

        /* Global layout overrides to ensure sticky/fixed navbar behaves correctly on all pages */
        html {
          overflow-x: hidden !important;
          overflow-y: auto !important;
          height: auto !important;
        }
        body {
          overflow: visible !important;
          height: auto !important;
        }

        @media (max-width: 980px) {
          .nav { position: fixed; top: 0; left: 0; right: 0; }
        }

        .nav .logo-lockup {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin: 0;
          font-size: 14px;
          letter-spacing: .28px;
          user-select: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          -webkit-user-drag: none !important;
          user-drag: none !important;
        }
        .nav .logo-lockup img {
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
          <a href="${rootPrefix}start/index.html" style="margin:0; display: inline-flex;">
            <faust-logo-lockup is-nav></faust-logo-lockup>
          </a>
          <div class="nav-links">
            <a href="${startHref}#estrategia">Estrategia</a>
            <a href="${startHref}#resultados">Resultados</a>
            <a href="${startHref}#expertos">Expertos</a>
            <a href="${startHref}#empresa">Empresa</a>
          </div>
          <div class="nav-right">
            <a id="nav-contacto" href="${startHref}#contacto" style="user-select: none !important;">Contacto</a>
            ${navLangHtml}
            <a class="${aplicarBtnClass}" data-action="apply" href="${startHref}#aplicar">
              ${applyLabel}
              <img class="${arrowClass}" src="${rootPrefix}assets/Icons/button_arrow.svg" alt="">
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
    const heroLogo = document.getElementById('hero-logo');
    const ctaLogo = document.querySelector('.cta .FaustLogo');
    let isHeroIntersecting = false;
    let isCtaIntersecting = false;
    const updateLogoColor = () => {
      const navIcon = this.querySelector('#nav-isotipo');
      if (!navIcon) return;
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

customElements.define('faust-navbar', FaustNavbar);
