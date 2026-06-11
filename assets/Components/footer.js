if (!window.showPrototypeToast) {
  window.showPrototypeToast = (message) => {
    // Prevent duplicate modals
    if (document.getElementById('faust-prototype-modal')) return;

    const backdrop = document.createElement('div');
    backdrop.id = 'faust-prototype-modal';
    backdrop.className = 'message-overlay';

    backdrop.innerHTML = `
      <div class="message-overlay-wrap">
        <div class="message-modal-container" style="max-width: 440px;">
          <div class="message-modal">
            <div class="message-modal-header">
              <div class="message-modal-title-row" style="justify-content: space-between;">
                <span style="font-size: 20px; font-weight: 500; color: #fff;">Sitio Web en Desarrollo</span>
                <button class="faust-modal-close-btn" style="background: none; border: none; color: rgba(255, 255, 255, 0.4); font-size: 24px; cursor: pointer; padding: 0; line-height: 1; transition: color 0.2s;" aria-label="Cerrar">&times;</button>
              </div>
            </div>
            <div class="message-modal-body" style="text-align: left;">
              <div style="font-size: 15px; line-height: 1.6; color: rgba(255, 255, 255, 0.7); font-family: inherit;">
                ${message}
              </div>
            </div>
            <div class="message-modal-footer">
              <button class="btn btn-secondary faust-modal-contact-btn" style="min-width: 120px; justify-content: center;">Contacto</button>
              <button class="btn btn-primary faust-modal-action-btn" style="min-width: 120px; justify-content: center;">Entendido</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    document.body.style.overflow = 'hidden';

    // Fade in / Slide up animation by adding 'is-open' class
    requestAnimationFrame(() => {
      backdrop.classList.add('is-open');
    });

    // Close logic
    const closeModal = () => {
      backdrop.classList.remove('is-open');
      document.body.style.overflow = '';
      
      // Wait for transitions to finish before removing from DOM
      backdrop.addEventListener('transitionend', () => {
        backdrop.remove();
      });
      document.removeEventListener('keydown', handleEsc);
    };

    const handleEsc = (e) => {
      if (e.key === 'Escape') closeModal();
    };

    // Close on escape key
    document.addEventListener('keydown', handleEsc);

    // Close on backdrop click (outside the modal box)
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop || e.target.classList.contains('message-overlay-wrap')) {
        closeModal();
      }
    });

    // Close button events
    const closeBtn = backdrop.querySelector('.faust-modal-close-btn');
    closeBtn.addEventListener('click', closeModal);
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.color = '#fff';
    });
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.color = 'rgba(255, 255, 255, 0.4)';
    });

    // Contact button event
    const contactBtn = backdrop.querySelector('.faust-modal-contact-btn');
    contactBtn.addEventListener('click', () => {
      closeModal();
      if (window.openMessageModal) {
        setTimeout(() => {
          window.openMessageModal();
        }, 300);
      } else {
        window.location.hash = '#contacto';
      }
    });

    // Action button event
    const actionBtn = backdrop.querySelector('.faust-modal-action-btn');
    actionBtn.addEventListener('click', closeModal);
  };
}



class FaustFooter extends HTMLElement {
  /* ── Feature flag: scroll-expand footer link spacing (tablet/desktop) ── */
  static ENABLE_SCROLL_EXPAND = false;
  connectedCallback() {
    this._onLanguageChanged = () => {
      this.render();
    };
    window.addEventListener('faust-language-changed', this._onLanguageChanged);

    this.render();
  }

  render() {
    const getRootPrefix = () => {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('/start/') || path.endsWith('/start') || path.includes('/careers/') || path.endsWith('/careers') || path.includes('/about/') || path.endsWith('/about') || path.includes('/docs/') || path.endsWith('/docs')) {
        return '../';
      }
      return './';
    };
    const rootPrefix = getRootPrefix();
    const isTalent = localStorage.getItem('faust-user-role') === 'Talento';

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
        .footer-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 60px; margin-bottom: 120px; }
        .footer-col h4 { margin: 0 0 32px; font-family: "BDO Grotesk", sans-serif; font-weight: 500; font-size: 18px; color: #fff; }
        .footer-col a { display: block; color: #7c7f84; font-size: 16px; text-decoration: none; }
        .footer-col a:hover { color: #fff; }
        .footer-col-links { display: flex; flex-direction: column; gap: 10px; }
        .footer-col-links a { margin: 0; } /* neutralize global style.css margin rule */

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
          backdrop-filter: blur(40px); 
          -webkit-backdrop-filter: blur(40px);
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
          color: #ffffff;
          background: #0022ff;
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
              <h4>Comenzar</h4>
              <div class="footer-col-links">
              <a href="${rootPrefix}start/index.html">Inicio</a>
                <a href="${rootPrefix}start/index.html#">Partnering</a>
                ${isTalent ? '' : `<a href="${rootPrefix}start/index.html#">Revenue Share</a>`}
                <a href="${rootPrefix}start/index.html#">Licenciamiento</a>
                <a href="${rootPrefix}start/index.html#">Consultoría</a>
                <a href="${rootPrefix}start/index.html#">Faust Max</a>
              </div>
            </div>
            <div class="footer-col">
              <h4>Estrategia</h4>
              <div class="footer-col-links">
                <a href="${rootPrefix}docs/introduccion.html">Documentación</a>
                ${isTalent ? '' : `<a href="${rootPrefix}start/index.html#">Estrategia de crecimiento</a>`}
                <a href="${rootPrefix}start/index.html#">Neurociencia Conductual</a>
                <a href="${rootPrefix}start/index.html#">UX/UI Design</a>
                <a href="${rootPrefix}start/index.html#">Desarrollo Web</a>
                <a href="${rootPrefix}start/index.html#">Inteligencia Artificial</a>
              </div>
            </div>
            <div class="footer-col">
              <h4>Empresa</h4>
              <div class="footer-col-links">
                <a href="${rootPrefix}about/index.html">Sobre nosotros</a>
                <a href="${rootPrefix}start/index.html#">Contacto</a>
                <a href="https://www.behance.net/faustpartners" target="_blank" rel="noopener noreferrer">Partners</a>
                ${isTalent ? '' : `<a href="${rootPrefix}start/index.html#">Deseo Invertir</a>`}
                <a href="${rootPrefix}careers">Carreras</a>
                <a href="${rootPrefix}start/index.html#">Faust OS</a>
              </div>
            </div>
          </div>
          <div class="footer-bottom">
            <div class="footer-logo" style="color: #fff !important;">© ${new Date().getFullYear()} Faust Partners™</div>
            <div style="display:flex;gap:24px;">
              <a href="${rootPrefix}docs/introduccion.html">Documentación</a>
              <a href="${rootPrefix}privacy.html">Privacidad</a>
              <a href="${rootPrefix}terms.html">Términos y condiciones</a>
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
          <div class="lang-modal-container" style="max-height: 520px;">
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
                
                <!-- Microsoft Clarity -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
                  <div style="display: flex; flex-direction: column; gap: 4px;">
                    <span style="font-size: 15px; font-weight: 600; color: #fff;">Seguimiento de navegación</span>
                    <span style="font-size: 12px; color: #8b8d91; line-height: 1.4;">Para analizar de forma visual e individual la interacción y comportamiento de navegación.</span>
                  </div>
                  ${faustIsStrictRegion() ? `
                    <label class="faust-switch">
                      <input type="checkbox" id="overlay-cookie-clarity-toggle" ${faustIsClarityEnabled() ? 'checked' : ''}>
                      <span class="faust-slider"></span>
                    </label>
                  ` : `
                    <div style="display: flex; align-items: center;">
                      <span class="cookie-status-badge">Siempre activas</span>
                      <input type="checkbox" id="overlay-cookie-clarity-toggle" checked style="display: none;">
                    </div>
                  `}
                </div>

                <div style="height: 1px; background: rgba(255, 255, 255, 0.06);"></div>

                <!-- Google Analytics (Otras Cookies Analíticas) -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
                  <div style="display: flex; flex-direction: column; gap: 4px;">
                    <span style="font-size: 15px; font-weight: 600; color: #fff;">Otras cookies analíticas</span>
                    <span style="font-size: 12px; color: #8b8d91; line-height: 1.4;">Google Analytics para comprender el uso general del sitio y medir tráfico.</span>
                  </div>
                  <label class="faust-switch">
                    <input type="checkbox" id="overlay-cookie-analytics-toggle" ${faustIsAnalyticsEnabled() ? 'checked' : ''}>
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
    this.initScrollExpand();
  }

  initCookieModal() {
    const triggerLink = this.querySelector('#footer-cookie-trigger');
    const overlay = this.querySelector('#cookie-menu-overlay');
    const saveBtn = this.querySelector('#btn-save-cookies-overlay');

    if (!triggerLink || !overlay || !saveBtn) return;

    const openCookieModal = (e) => {
      e.preventDefault();

      const clarityInput = this.querySelector('#overlay-cookie-clarity-toggle');
      if (clarityInput) clarityInput.checked = faustIsClarityEnabled();

      const analyticsInput = this.querySelector('#overlay-cookie-analytics-toggle');
      if (analyticsInput) analyticsInput.checked = faustIsAnalyticsEnabled();

      overlay.classList.add('is-open');
    };

    const closeCookieModal = () => {
      overlay.classList.remove('is-open');
    };

    triggerLink.addEventListener('click', openCookieModal);

    saveBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const clarityInput = this.querySelector('#overlay-cookie-clarity-toggle');
      const clarityChecked = clarityInput ? clarityInput.checked : false;

      const analyticsInput = this.querySelector('#overlay-cookie-analytics-toggle');
      const analyticsChecked = analyticsInput ? analyticsInput.checked : false;

      const oldClarity = localStorage.getItem('faust-cookie-consent-clarity') === 'true';
      const oldAnalytics = localStorage.getItem('faust-cookie-consent-analytics') === 'true';

      localStorage.setItem('faust-cookie-consent-clarity', clarityChecked ? 'true' : 'false');
      localStorage.setItem('faust-cookie-consent-analytics', analyticsChecked ? 'true' : 'false');
      localStorage.setItem('faust-cookie-consent-choice-made', 'true');

      closeCookieModal();

      const clarityWasActive = oldClarity || (localStorage.getItem('faust-cookie-consent-clarity') === null && !faustIsStrictRegion());

      if ((clarityWasActive && !clarityChecked) || (oldAnalytics && !analyticsChecked)) {
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

    // Intercept placeholder links
    this.querySelectorAll('a').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (link.id === 'footer-cookie-trigger') return;
      if (href.endsWith('#') || href.endsWith('#resultados') || href.endsWith('#expertos')) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          if (window.showPrototypeToast) {
            window.showPrototypeToast('El contenido al que intenta navegar aún se encuentra en desarrollo, aún no es indexado o ha sido retirado. Por favor, contáctenos para solicitar más información. Agradecemos su interés.');
          }
        });
      }
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

  initScrollExpand() {
    if (!FaustFooter.ENABLE_SCROLL_EXPAND) return;

    const footerGrid = this.querySelector('.footer-grid');
    const footerEl = this.querySelector('footer');
    if (!footerGrid || !footerEl) return;

    const GAP_COLLAPSED = 10;
    const GAP_EXPANDED = 22;
    const GRID_MARGIN_COLLAPSED = 80;
    const GRID_MARGIN_EXPANDED = 150;
    const LERP_SPEED = 0.14;  // 0–1, how fast current chases target per frame
    const SNAP_THRESHOLD = 0.5;  // px – snap to target when close enough
    const WHEEL_SENSITIVITY = 1.25;
    const MAX_WHEEL_STEP_RATIO = 0.46;
    const START_SCROLL_THRESHOLD = 20;
    const BOTTOM_THRESHOLD = 8;
    const AUTO_COLLAPSE_DELAY = 100;
    const AUTO_COLLAPSE_DURATION = 700;

    // ── Siblings to push upward (everything except navbar and the footer itself) ──
    const parent = this.parentElement;
    const pushTargets = parent
      ? [...parent.children].filter(el =>
        el !== this && el.tagName.toLowerCase() !== 'faust-navbar'
      )
      : [];
    // Max height delta in px (based on longest column)
    const cols = [...footerGrid.querySelectorAll('.footer-col-links')];
    const maxLinks = Math.max(...cols.map(c => c.querySelectorAll('a').length), 0);
    const maxDelta = (maxLinks - 1) * (GAP_EXPANDED - GAP_COLLAPSED);
    if (maxDelta <= 0) return;

    let target = 0;  // desired expansion px – set instantly by wheel input
    let current = 0;  // rendered expansion px – lerps toward target each frame
    let rafId = null;
    let autoCollapseTimer = null;
    let autoCollapseRafId = null;
    let startScrollAccum = 0;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

    // ── Render a specific expansion amount ──
    const applyExpansion = (px) => {
      const t = px / maxDelta;
      const easedT = easeOutQuart(t);
      const easedPx = easedT * maxDelta;
      const gap = GAP_COLLAPSED + easedT * (GAP_EXPANDED - GAP_COLLAPSED);
      const gridMargin = GRID_MARGIN_COLLAPSED + easedT * (GRID_MARGIN_EXPANDED - GRID_MARGIN_COLLAPSED);
      const visualDelta = easedPx + (gridMargin - GRID_MARGIN_COLLAPSED);
      cols.forEach(cl => { cl.style.gap = `${gap}px`; });
      footerGrid.style.marginBottom = `${gridMargin}px`;
      footerEl.style.marginTop = visualDelta > 0 ? `-${visualDelta}px` : '';
      pushTargets.forEach(el => {
        el.style.transform = visualDelta > 0 ? `translateY(-${visualDelta}px)` : '';
      });
    };

    const resetStyles = () => {
      cols.forEach(cl => { cl.style.gap = ''; });
      footerGrid.style.marginBottom = '';
      footerEl.style.marginTop = '';
      pushTargets.forEach(el => {
        el.style.transform = '';
      });
    };

    // ── Animation loop: interpolate current → target ──
    const tick = () => {
      const diff = target - current;
      if (Math.abs(diff) < SNAP_THRESHOLD) {
        // Close enough – snap exactly
        current = target;
        if (current === 0) {
          resetStyles();
        } else {
          applyExpansion(current);
        }
        rafId = null;
        return;
      }
      current += diff * LERP_SPEED;
      applyExpansion(current);
      rafId = requestAnimationFrame(tick);
    };

    const startAnimation = () => {
      if (rafId === null) rafId = requestAnimationFrame(tick);
    };

    const cancelAutoCollapseAnimation = () => {
      if (autoCollapseRafId) {
        cancelAnimationFrame(autoCollapseRafId);
        autoCollapseRafId = null;
      }
    };

    const clearAutoCollapse = () => {
      if (autoCollapseTimer) {
        clearTimeout(autoCollapseTimer);
        autoCollapseTimer = null;
      }
    };

    const scheduleAutoCollapse = () => {
      clearAutoCollapse();
      if (target <= 0) return;
      autoCollapseTimer = setTimeout(() => {
        autoCollapseTimer = null;
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        target = 0;
        const startValue = current;
        const startTime = performance.now();
        const collapseTick = (now) => {
          const progress = Math.min((now - startTime) / AUTO_COLLAPSE_DURATION, 1);
          current = startValue * (1 - easeOutCubic(progress));
          if (current <= SNAP_THRESHOLD || progress >= 1) {
            current = 0;
            resetStyles();
            autoCollapseRafId = null;
            return;
          }
          applyExpansion(current);
          autoCollapseRafId = requestAnimationFrame(collapseTick);
        };
        cancelAutoCollapseAnimation();
        autoCollapseRafId = requestAnimationFrame(collapseTick);
      }, AUTO_COLLAPSE_DELAY);
    };

    const distFromBottom = () =>
      document.documentElement.scrollHeight - window.scrollY - window.innerHeight;

    const handleScrollDelta = (rawDy) => {
      // Tablet/desktop only
      if (window.innerWidth < 768) {
        clearAutoCollapse();
        cancelAutoCollapseAnimation();
        if (target > 0 || current > SNAP_THRESHOLD) {
          target = 0; current = 0;
          if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
          resetStyles();
        }
        return;
      }

      const dy = rawDy * WHEEL_SENSITIVITY;
      const maxWheelStep = maxDelta * MAX_WHEEL_STEP_RATIO;
      const step = Math.sign(dy) * Math.min(Math.abs(dy), maxWheelStep);

      const atBottom = distFromBottom() <= BOTTOM_THRESHOLD;
      const isActive = target > 0 || current > SNAP_THRESHOLD || rafId !== null;

      if (step <= 0 || (!atBottom && !isActive)) {
        startScrollAccum = 0;
      }

      // ── Expanding: at bottom + scrolling down, or already active + scrolling down ──
      if (step > 0 && target < maxDelta && (atBottom || isActive)) {
        clearAutoCollapse();
        cancelAutoCollapseAnimation();
        let expansionStep = step;
        if (!isActive) {
          const remainingThreshold = Math.max(START_SCROLL_THRESHOLD - startScrollAccum, 0);
          const consumed = Math.min(expansionStep, remainingThreshold);
          startScrollAccum += consumed;
          expansionStep -= consumed;
        }
        if (expansionStep <= 0) return;
        target = Math.max(target, current);
        target = Math.min(target + expansionStep, maxDelta);
        startAnimation();
        scheduleAutoCollapse();
        return;
      }

      // ── Fully expanded + still scrolling down → eat the event ──
      if (step > 0 && target >= maxDelta) {
        scheduleAutoCollapse();
        return;
      }

      // ── Contracting: let page scroll continue while the footer visually collapses ──
      if (step < 0 && isActive) {
        clearAutoCollapse();
        cancelAutoCollapseAnimation();
        startScrollAccum = 0;
        target = Math.max(target + step, 0);
        startAnimation();
        return;
      }

      if (isActive) {
        scheduleAutoCollapse();
        return;
      }

      // Otherwise: normal page scroll
    };

    // ── Wheel handler ──
    this._scrollExpandWheelHandler = (e) => {
      // Normalize deltaY to pixels
      let dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 16;
      else if (e.deltaMode === 2) dy *= window.innerHeight;
      handleScrollDelta(dy);
    };

    let lastTouchY = null;
    this._scrollExpandTouchStartHandler = (e) => {
      if (e.touches.length !== 1) {
        lastTouchY = null;
        return;
      }
      lastTouchY = e.touches[0].clientY;
    };

    this._scrollExpandTouchMoveHandler = (e) => {
      if (e.touches.length !== 1 || lastTouchY === null) {
        lastTouchY = e.touches.length === 1 ? e.touches[0].clientY : null;
        return;
      }
      const nextTouchY = e.touches[0].clientY;
      const dy = lastTouchY - nextTouchY;
      lastTouchY = nextTouchY;
      handleScrollDelta(dy);
    };

    window.addEventListener('wheel', this._scrollExpandWheelHandler, { passive: true });
    window.addEventListener('touchstart', this._scrollExpandTouchStartHandler, { passive: true });
    window.addEventListener('touchmove', this._scrollExpandTouchMoveHandler, { passive: true });

    this._scrollExpandCleanup = () => {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      clearAutoCollapse();
      cancelAutoCollapseAnimation();
      target = 0; current = 0;
      startScrollAccum = 0;
      resetStyles();
    };
  }

  cleanup() {
    if (this._scrollExpandCleanup) {
      this._scrollExpandCleanup();
      this._scrollExpandCleanup = null;
    }
    if (this._scrollExpandWheelHandler) {
      window.removeEventListener('wheel', this._scrollExpandWheelHandler);
      this._scrollExpandWheelHandler = null;
    }
    if (this._scrollExpandTouchStartHandler) {
      window.removeEventListener('touchstart', this._scrollExpandTouchStartHandler);
      this._scrollExpandTouchStartHandler = null;
    }
    if (this._scrollExpandTouchMoveHandler) {
      window.removeEventListener('touchmove', this._scrollExpandTouchMoveHandler);
      this._scrollExpandTouchMoveHandler = null;
    }
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

customElements.define('faust-footer', FaustFooter);
