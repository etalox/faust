if (!window.showPrototypeToast) {
  /* ── Available-pages helper ── */
  window._getAvailablePages = function() {
    const footer = document.querySelector('faust-footer');
    if (!footer) return [];
    
    const columns = [];
    const footerCols = footer.querySelectorAll('.footer-col');
    
    footerCols.forEach(col => {
      const titleEl = col.querySelector('h4');
      const title = titleEl ? titleEl.textContent.trim() : '';
      const links = col.querySelectorAll('a[href]');
      const pages = [];
      
      links.forEach(link => {
        const href = link.getAttribute('href') || '';
        const label = link.textContent.trim();
        if (!label) return;
        
        if (link.id === 'footer-cookie-trigger') return;

        let isAvailable = true;
        if (!href || href.endsWith('#') || href.includes('#resultados') || href.includes('#expertos')) {
          isAvailable = false;
        }

        pages.push({
          label: label,
          href: link.href,
          isExternal: link.target === '_blank',
          isAvailable: isAvailable
        });
      });
      
      if (pages.length > 0 || title) {
        columns.push({
          title: title,
          pages: pages
        });
      }
    });

    return columns;
  };

  window.showPrototypeToast = () => {
    // Prevent duplicate modals
    if (document.getElementById('faust-prototype-modal')) return;

    window.faustOpenSurface?.('prototype');

    const columns = window._getAvailablePages();

    /* ── Build pages list HTML ── */
    const pagesHtml = columns.length > 0
      ? '<div class="proto-grid">' + columns.map(col => `
          <div class="proto-col">
            ${col.title ? `<div class="proto-col-title">${col.title}</div>` : ''}
            <div class="proto-col-links">
              ${col.pages.map(p => {
                if (p.isAvailable) {
                  return `<a href="${p.href}" class="proto-link" ${p.isExternal ? 'target="_blank" rel="noopener noreferrer"' : ''} data-proto-link>${p.label}</a>`;
                } else {
                  return `<span class="proto-link is-disabled">${p.label}</span>`;
                }
              }).join('')}
            </div>
          </div>
        `).join('') + '</div>'
      : '<p style="padding:16px 32px;color:#8b8d91;font-size:14px;margin:0;">No se encontraron páginas.</p>';

    /* ── Build modal DOM ── */
    const backdrop = document.createElement('div');
    backdrop.id = 'faust-prototype-modal';
    backdrop.className = 'lang-overlay';

    backdrop.innerHTML = `
      <style>
        #faust-prototype-modal.lang-overlay {
          z-index: 19;
        }
        .proto-modal-wrap {
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 24px;
          box-sizing: border-box;
        }
        .proto-modal-container {
          width: 800px;
          max-width: 100%;
          display: flex;
          flex-direction: column;
          gap: 0;
          transform: translateY(20px) scale(0.97);
          transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
        }
        #faust-prototype-modal.is-open .proto-modal-container {
          transform: translateY(0) scale(1);
        }
        .proto-modal {
          background: rgba(253, 253, 255, 0);
          backdrop-filter: blur(0px);
          -webkit-backdrop-filter: blur(0px);
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          max-height: calc(100dvh - 80px);
          transition: background 0.3s cubic-bezier(0.25, 1, 0.5, 1),
                      backdrop-filter 0.3s cubic-bezier(0.25, 1, 0.5, 1),
                      -webkit-backdrop-filter 0.3s cubic-bezier(0.25, 1, 0.5, 1),
                      box-shadow 0.3s cubic-bezier(0.25, 1, 0.5, 1);
        }
        #faust-prototype-modal.is-open .proto-modal {
          background: rgba(22, 22, 24, 0.92);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.8),
                      0 0 0 1px rgba(255,255,255,0.07);
        }
        .proto-modal-header,
        .proto-modal-body,
        .proto-modal-footer {
          opacity: 0;
          transition: opacity 0.25s cubic-bezier(0.25, 1, 0.5, 1) 0.05s;
        }
        #faust-prototype-modal.is-open .proto-modal-header,
        #faust-prototype-modal.is-open .proto-modal-body,
        #faust-prototype-modal.is-open .proto-modal-footer {
          opacity: 1;
        }
        .proto-modal-header {
          padding: 24px 32px 16px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .proto-modal-header-inner {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .proto-modal-title {
          font-size: 16px;
          font-weight: 600;
          color: #fff;
          letter-spacing: 0.28px;
          line-height: 1.3;
        }
        .proto-modal-subtitle {
          font-size: 14px;
          color: #8b8d91;
          line-height: 1.5;
          max-width: 100%;
        }
        .proto-modal-close-btn {
          background: none;
          border: none;
          color: rgba(255,255,255,0.35);
          font-size: 24px;
          line-height: 1;
          cursor: pointer;
          padding: 0;
          flex-shrink: 0;
          margin-top: 2px;
          transition: color 0.2s ease;
        }
        .proto-modal-close-btn:hover { color: #fff; }
        .proto-modal-body {
          overflow-y: auto;
          flex: 1;
          min-height: 0;
          padding: 8px 8px;
        }
        .proto-modal-body::-webkit-scrollbar { width: 4px; }
        .proto-modal-body::-webkit-scrollbar-track { background: transparent; margin: 8px 0; }
        .proto-modal-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }
        .proto-modal-body::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18); }
        
        .proto-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 80px;
          padding: 32px 48px;
          background: #0A0A0A;
          border-radius: 16px;
        }
        .proto-col-title {
          font-family: "BDO Grotesk", sans-serif;
          font-weight: 500;
          font-size: 18px;
          color: #fff;
          margin: 0 0 32px;
        }
        .proto-col-links {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .proto-link {
          display: block;
          font-size: 16px;
          color: #f2f2f2;
          text-decoration: none;
          line-height: normal;
          transition: color 0.2s ease;
          cursor: pointer;
        }
        a.proto-link:hover {
          color: #fff;
        }
        .proto-link.is-disabled {
          opacity: 0.35;
          cursor: not-allowed;
          pointer-events: none;
        }
        
        .proto-modal-footer {
          display: flex;
          gap: 12px;
          padding: 20px 32px;
          border-top: 1px solid rgba(255,255,255,0.06);
          justify-content: flex-end;
        }
        .proto-btn {
          border-radius: 999px;
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 500;
          border: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.18s ease, color 0.18s ease;
          text-decoration: none;
          box-sizing: border-box;
          letter-spacing: 0.1px;
        }
        .proto-btn-secondary {
          position: relative;
          background: rgba(253,253,255,0.06);
          color: #f2f2f2;
        }
        .proto-btn-secondary::before {
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
        }
        .proto-btn-secondary:hover { background: rgba(238,238,241,0.10); }
        .proto-btn-primary {
          background: #f2f2f2;
          color: #161616;
        }
        .proto-btn-primary:hover { background: #0022ff; color: #fff; }

        @media (max-width: 768px) {
          .proto-grid {
            grid-template-columns: 1fr;
            gap: 24px;
            padding: 20px 24px;
          }
          .proto-modal-header { padding: 20px 24px 16px; }
          .proto-modal-footer { padding: 16px 24px; flex-direction: column; }
          .proto-btn { width: 100%; }
        }
      </style>

      <div class="proto-modal-wrap">
        <div class="proto-modal-container">
          <div class="proto-modal">
            <div class="proto-modal-header">
              <div class="proto-modal-header-inner">
                <span class="proto-modal-title">Sitio en construcción</span>
                <span class="proto-modal-subtitle">Este contenido aún no está disponible. Páginas disponibles actualmente:</span>
              </div>
              <button class="proto-modal-close-btn" aria-label="Cerrar">&times;</button>
            </div>
            <div class="proto-modal-body">
              ${pagesHtml}
            </div>
            <div class="proto-modal-footer">
              <button class="proto-btn proto-btn-secondary" id="proto-contact-btn">Contacto</button>
              <button class="proto-btn proto-btn-primary" id="proto-close-btn">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    document.body.style.overflow = 'hidden';

    // Animate in
    requestAnimationFrame(() => {
      backdrop.classList.add('is-open');
    });

    /* ── Close logic ── */
    const closeModal = () => {
      backdrop.classList.remove('is-open');
      document.body.style.overflow = '';
      unregisterPrototypeSurface?.();
      document.removeEventListener('keydown', handleEsc);
      // Wait for transition then remove
      const onEnd = () => { backdrop.remove(); };
      backdrop.addEventListener('transitionend', onEnd, { once: true });
      // Safety fallback
      setTimeout(() => { if (backdrop.isConnected) backdrop.remove(); }, 500);
    };
    const unregisterPrototypeSurface = window.faustRegisterSurface?.('prototype', closeModal);

    const handleEsc = (e) => { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', handleEsc);

    // Close on backdrop click
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop || e.target.classList.contains('proto-modal-wrap')) {
        closeModal();
      }
    });

    // Close button
    backdrop.querySelector('.proto-modal-close-btn').addEventListener('click', closeModal);
    backdrop.querySelector('#proto-close-btn').addEventListener('click', closeModal);

    // Contact button
    backdrop.querySelector('#proto-contact-btn').addEventListener('click', () => {
      closeModal();
      setTimeout(() => {
        if (window.openMessageModal) {
          window.openMessageModal();
        } else {
          window.location.hash = '#contacto';
        }
      }, 320);
    });

    // Page links — close modal then navigate (respects client-side router)
    backdrop.querySelectorAll('[data-proto-link]').forEach(link => {
      link.addEventListener('click', (e) => {
        if (link.target === '_blank') return; // let external links open normally
        e.preventDefault();
        const href = link.href;
        closeModal();
        setTimeout(() => {
          // Use the client-side router if available, otherwise hard navigate
          const anchor = document.createElement('a');
          anchor.href = href;
          const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
          anchor.dispatchEvent(clickEvent);
          if (!clickEvent.defaultPrevented) {
            window.location.href = href;
          }
        }, 320);
      });
    });
  };
}









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
      if (path.includes('/start/') || path.endsWith('/start') || path.includes('/careers/') || path.endsWith('/careers') || path.includes('/about/') || path.endsWith('/about') || path.includes('/docs/') || path.endsWith('/docs')) {
        return '../';
      }
      return './';
    };
    const rootPrefix = getRootPrefix();
    const isStartPage = path.includes('/start/') || path.endsWith('/start');
    const isCareersPage = path.includes('/careers/') || path.endsWith('/careers');
    const startHref = isStartPage ? '' : `${rootPrefix}start/index.html`;
    const applyLabel = isCareersPage ? 'Unirme' : 'Aplicar';
    const applyHref = isCareersPage ? '#vacantes' : `${startHref}#aplicar`;
    const applyAction = isCareersPage ? '' : 'apply';
    const applyBtnBaseClass = isCareersPage ? '' : 'faust-apply-btn';

    const activeCode = getSelectedCode();
    const isLATAM = (activeCode === 'es-LA');

    let navLangHtml = '';
    let aplicarBtnClass = `btn btn-secondary btn-nav ${applyBtnBaseClass}`.trim();
    let arrowClass = 'arrow arrow-light';

    if (!isLATAM) {
      aplicarBtnClass = `btn btn-primary btn-nav ${applyBtnBaseClass}`.trim();
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
          z-index: -1;
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
            <a href="${rootPrefix}about/index.html">Empresa</a>
          </div>
          <div class="nav-right">
            <a id="nav-contacto" href="${startHref}#contacto" style="user-select: none !important;">Contacto</a>
            ${navLangHtml}
            <a class="${aplicarBtnClass}" ${applyAction ? `data-action="${applyAction}"` : ''} href="${applyHref}">
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
      if (isReload || document.body.classList.contains('no-reveal-animations')) {
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
    const perksSection = document.getElementById('perks');
    const vacantesSection = document.getElementById('vacantes');
    
    const path = window.location.pathname.toLowerCase();
    const isCareers = path.includes('/careers/') || path.endsWith('/careers');

    let isHeroIntersecting = false;
    let isCtaIntersecting = false;
    let isPerksIntersecting = false;
    let isVacantesIntersecting = false;

    const updateLogoColor = () => {
      const navIcon = this.querySelector('#nav-isotipo');
      if (!navIcon) return;
      
      let shouldBeWhite = isHeroIntersecting || isCtaIntersecting;
      if (isCareers) {
        shouldBeWhite = isHeroIntersecting || isPerksIntersecting || isVacantesIntersecting;
      }

      if (shouldBeWhite) {
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

    if (isCareers) {
      if (perksSection) {
        this._perksObserver = new IntersectionObserver(
          ([entry]) => {
            isPerksIntersecting = entry.isIntersecting;
            updateLogoColor();
          },
          { threshold: 0, rootMargin: '-80px 0px 0px 0px' }
        );
        this._perksObserver.observe(perksSection);
      }
      if (vacantesSection) {
        this._vacantesObserver = new IntersectionObserver(
          ([entry]) => {
            isVacantesIntersecting = entry.isIntersecting;
            updateLogoColor();
          },
          { threshold: 0, rootMargin: '-80px 0px 0px 0px' }
        );
        this._vacantesObserver.observe(vacantesSection);
      }
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

    // Intercept placeholder links
    this.querySelectorAll('a').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href.endsWith('#') || href.endsWith('#resultados') || href.endsWith('#expertos')) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          if (window.showPrototypeToast) {
            window.showPrototypeToast();
          }
        });
      }
    });
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
    if (this._perksObserver) {
      this._perksObserver.disconnect();
      this._perksObserver = null;
    }
    if (this._vacantesObserver) {
      this._vacantesObserver.disconnect();
      this._vacantesObserver = null;
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
