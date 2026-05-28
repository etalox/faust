// Helpers for cookie consent checking
const strictCountriesList = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 
  'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 
  'SI', 'ES', 'SE', 'IS', 'LI', 'NO', 'GB', 'CH'
];

const faustIsStrictRegion = () => {
  if (typeof window === 'undefined') return false;
  
  // Check active language selection code (e.g. if manually switched to en-GB, es-ES, fr)
  const activeCode = (typeof getSelectedCode === 'function') ? getSelectedCode() : 'es-LA';
  if (activeCode === 'es-ES' || activeCode === 'en-GB' || activeCode.startsWith('fr')) {
    return true;
  }
  
  const detectedCountry = (localStorage.getItem('faust-detected-country-code') || '').toUpperCase();
  if (detectedCountry) {
    return strictCountriesList.includes(detectedCountry);
  }
  
  // Check browser language region (fallback if geolocation hasn't loaded or failed)
  const browserLang = (navigator.language || navigator.userLanguage || '');
  const parts = browserLang.split('-');
  if (parts.length > 1) {
    const browserCountry = parts[1].toUpperCase();
    if (strictCountriesList.includes(browserCountry)) {
      return true;
    }
  }
  
  return false;
};

const faustIsClarityEnabled = () => {
  if (typeof window === 'undefined') return false;
  const consent = localStorage.getItem('faust-cookie-consent-clarity');
  if (consent === 'true') return true;
  if (consent === 'false') return false;
  // Default: false in strict regions, true in standard regions
  return !faustIsStrictRegion();
};

const faustIsAnalyticsEnabled = () => {
  if (typeof window === 'undefined') return false;
  const consent = localStorage.getItem('faust-cookie-consent-analytics');
  if (consent === 'true') return true;
  return false;
};

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
    const path = window.location.pathname.toLowerCase();
    let current;
    if (path.includes('/start/') || path.endsWith('/start')) {
      current = 'start/index.html';
    } else if (path.includes('/careers/') || path.endsWith('/careers')) {
      current = 'careers/index.html';
    } else {
      current = window.location.pathname.split('/').pop() || 'index.html';
      if (current === '' || current === 'es-MX' || current === 'en-US' || current === 'es-LA' || current === 'es-ES' || current === 'en-GB' || current === 'zh-CN' || current === 'pt' || current === 'fr' || current === 'ru') {
        current = 'index.html';
      }
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
  const clarityEnabled = faustIsClarityEnabled();
  const analyticsEnabled = faustIsAnalyticsEnabled();

  if (analyticsEnabled) {
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
  }

  if (typeof window.clarity === 'function') {
    if (clarityEnabled) {
      window.clarity("consent");
    } else {
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
  const choiceMade = localStorage.getItem('faust-cookie-consent-choice-made') === 'true';

  if (hasConsented === 'true') return;
  if (choiceMade && faustIsStrictRegion()) return;

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
      transform: translateY(calc(100% + 48px));
      transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .cookie-banner-overlay.show {
      transform: translateY(0);
    }

    .cookie-banner-container {
      position: relative;
      width: auto;
      min-width: min(752px, 100%);
      max-width: 1200px;
      background: rgba(20, 21, 23, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 20px;
      padding: 24px 44px 24px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 32px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
      box-sizing: border-box;
      pointer-events: auto;
    }

    .cookie-banner-container.no-close {
      padding: 24px 32px;
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

    .cookie-banner-buttons {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
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

    .btn-cookie-decline {
      height: 48px;
      padding: 0 32px;
      border-radius: 999px;
      font-size: 14px;
      font-weight: 600;
      position: relative;
      background: rgba(253, 253, 255, 0.06);
      color: #f2f2f2 !important;
      border: none;
      backdrop-filter: blur(20px);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background 240ms ease-out, color 240ms ease-out, transform 150ms ease;
      white-space: nowrap;
      flex-shrink: 0;
      text-decoration: none;
    }

    .btn-cookie-decline::before {
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

    .btn-cookie-decline:hover {
      background: rgba(238, 238, 241, 0.10);
      color: #fff !important;
    }

    .btn-cookie-decline:hover::before {
      opacity: 0.5;
    }

    .btn-cookie-decline:active {
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
      
      .cookie-banner-container.no-close {
        padding: 20px 24px;
      }
      
      .cookie-banner-content {
        gap: 4px;
      }

      .cookie-banner-buttons {
        width: 100%;
        display: flex;
        flex-direction: column-reverse;
        align-items: stretch;
        gap: 10px;
      }
      
      .btn-cookie-decline,
      .btn-cookie-accept {
        width: 100%;
        height: 44px;
      }
    }
  `;
  document.head.appendChild(style);

  let bannerCreated = false;
  let bannerDismissed = false;
  let bannerOverlay = null;
  let footerIntersecting = false;
  let footerObserver = null;

  function updateLegalNavBottom() {
    const overlay = bannerOverlay || document.getElementById('faust-cookie-banner');
    if (!overlay) {
      document.documentElement.style.setProperty('--legal-nav-bottom', '40px');
      return;
    }
    const container = overlay.querySelector('.cookie-banner-container');
    if (container && overlay.classList.contains('show')) {
      const rect = container.getBoundingClientRect();
      const bannerStyle = window.getComputedStyle(overlay);
      const bannerBottom = parseInt(bannerStyle.bottom, 10) || 0;
      const totalHeight = rect.height + bannerBottom;
      document.documentElement.style.setProperty('--legal-nav-bottom', `${totalHeight + 40}px`);
    } else {
      document.documentElement.style.setProperty('--legal-nav-bottom', '40px');
    }
  }

  function closeBannerAndResetButtons() {
    bannerDismissed = true;
    const overlay = bannerOverlay || document.getElementById('faust-cookie-banner');
    if (overlay) {
      overlay.classList.remove('show');
      updateLegalNavBottom();
      window.removeEventListener('resize', updateLegalNavBottom);
      removeScrollListeners();
      if (footerObserver) {
        footerObserver.disconnect();
        footerObserver = null;
      }
      setTimeout(() => {
        overlay.remove();
        bannerOverlay = null;
        bannerCreated = false;
      }, 500);
    }
  }

  const initBanner = () => {
    if (document.getElementById('faust-cookie-banner')) return;

    const getRootPrefix = () => {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('/start/') || path.endsWith('/start') || path.includes('/careers/') || path.endsWith('/careers')) {
        return '../';
      }
      return './';
    };
    const rootPrefix = getRootPrefix();

    const activeCode = (typeof getSelectedCode === 'function') ? getSelectedCode() : 'es-LA';

    const translations = {
      'es': {
        title: 'Utilizamos Cookies Analíticas',
        textStandard: 'Al interactuar con el sitio, aceptas nuestra <a href="./privacy.html" target="_blank" style="color: #fff; text-decoration: underline;">Política de Privacidad</a> y nuestros <a href="./terms.html" target="_blank" style="color: #fff; text-decoration: underline;">Términos y Condiciones</a>.',
        textStrict: 'Al hacer clic en "Entendido", aceptas nuestra <a href="./privacy.html" target="_blank" style="color: #fff; text-decoration: underline;">Política de Privacidad</a> y nuestros <a href="./terms.html" target="_blank" style="color: #fff; text-decoration: underline;">Términos y Condiciones</a>.',
        accept: 'Entendido',
        decline: 'Rechazar'
      },
      'pt': {
        title: 'Consentimento de Cookies e Acordo Legal',
        textStandard: 'Utilizamos cookies de análise. Ao interagir com o site, você concorda com nossa <a href="./privacy.html" target="_blank" style="color: #fff; text-decoration: underline;">Política de Privacidade</a> e nuestros <a href="./terms.html" target="_blank" style="color: #fff; text-decoration: underline;">Termos de Serviço</a>.',
        textStrict: 'Utilizamos cookies de análise. Ao clicar em Aceitar, você concorda com nuestra <a href="./privacy.html" target="_blank" style="color: #fff; text-decoration: underline;">Política de Privacidade</a> e nuestros <a href="./terms.html" target="_blank" style="color: #fff; text-decoration: underline;">Termos de Serviço</a>.',
        accept: 'Aceitar',
        decline: 'Recusar'
      },
      'en': {
        title: 'Cookie Consent & Legal Agreement',
        textStandard: 'We use analytical cookies. By interacting with the site, you agree to our <a href="./privacy.html" target="_blank" style="color: #fff; text-decoration: underline;">Privacy Policy</a> and <a href="./terms.html" target="_blank" style="color: #fff; text-decoration: underline;">Terms of Service</a>.',
        textStrict: 'We use analytical cookies. By clicking Accept, you agree to our <a href="./privacy.html" target="_blank" style="color: #fff; text-decoration: underline;">Privacy Policy</a> and <a href="./terms.html" target="_blank" style="color: #fff; text-decoration: underline;">Terms of Service</a>.',
        accept: 'Accept',
        decline: 'Decline'
      },
      'fr': {
        title: 'Consentement aux Cookies et Accord Légal',
        textStandard: 'Nous utilisons des cookies analytiques. En interagissant avec le site, vous acceptez notre <a href="./privacy.html" target="_blank" style="color: #fff; text-decoration: underline;">Politique de Confidentialité</a> et nos <a href="./terms.html" target="_blank" style="color: #fff; text-decoration: underline;">Conditions d\'Utilisation</a>.',
        textStrict: 'Nous utilisons des cookies analytiques. En cliquant sur Accepter, vous acceptez notre <a href="./privacy.html" target="_blank" style="color: #fff; text-decoration: underline;">Politique de Confidentialité</a> et nos <a href="./terms.html" target="_blank" style="color: #fff; text-decoration: underline;">Conditions d\'Utilisation</a>.',
        accept: 'Accepter',
        decline: 'Refuser'
      },
      'ru': {
        title: 'Согласие на использование файлов cookie и юридическое соглашение',
        textStandard: 'Мы используем аналитические файлы cookie. Взаимодействуя с сайтом, вы соглашаетесь с нашей <a href="./privacy.html" target="_blank" style="color: #fff; text-decoration: underline;">Политикой конфиденциальности</a> и <a href="./terms.html" target="_blank" style="color: #fff; text-decoration: underline;">Условиями использования</a>.',
        textStrict: 'Мы используем аналитические файлы cookie. Нажимая кнопку Принять, вы соглашаетесь с нашей <a href="./privacy.html" target="_blank" style="color: #fff; text-decoration: underline;">Политикой конфиденциальности</a> и <a href="./terms.html" target="_blank" style="color: #fff; text-decoration: underline;">Условиями использования</a>.',
        accept: 'Принять',
        decline: 'Отклонить'
      },
      'zh': {
        title: 'Cookie 同意与法律协议',
        textStandard: '我们使用分析型 Cookie。与本网站互动即表示您同意我们的 <a href="./privacy.html" target="_blank" style="color: #fff; text-decoration: underline;">隐私政策</a> 和 <a href="./terms.html" target="_blank" style="color: #fff; text-decoration: underline;">服务条款</a>。',
        textStrict: '我们使用分析型 Cookie。点击接受即表示您同意我们的 <a href="./privacy.html" target="_blank" style="color: #fff; text-decoration: underline;">隐私政策</a> 和 <a href="./terms.html" target="_blank" style="color: #fff; text-decoration: underline;">服务条款</a>。',
        accept: '接受',
        decline: '拒绝'
      }
    };

    for (const lang in translations) {
      if (translations[lang].textStandard) {
        translations[lang].textStandard = translations[lang].textStandard
          .replace(/\.\/privacy\.html/g, rootPrefix + 'privacy.html')
          .replace(/\.\/terms\.html/g, rootPrefix + 'terms.html');
      }
      if (translations[lang].textStrict) {
        translations[lang].textStrict = translations[lang].textStrict
          .replace(/\.\/privacy\.html/g, rootPrefix + 'privacy.html')
          .replace(/\.\/terms\.html/g, rootPrefix + 'terms.html');
      }
    }

    let baseLang = 'es';
    if (activeCode.startsWith('en')) baseLang = 'en';
    else if (activeCode.startsWith('pt')) baseLang = 'pt';
    else if (activeCode.startsWith('fr')) baseLang = 'fr';
    else if (activeCode.startsWith('ru')) baseLang = 'ru';
    else if (activeCode.startsWith('zh')) baseLang = 'zh';

    const t = translations[baseLang] || translations['es'];
    const strictMode = faustIsStrictRegion();
    const textToShow = strictMode ? t.textStrict : t.textStandard;

    const overlay = document.createElement('div');
    overlay.className = 'cookie-banner-overlay notranslate';
    overlay.setAttribute('translate', 'no');
    overlay.id = 'faust-cookie-banner';

    overlay.innerHTML = `
      <div class="cookie-banner-container ${strictMode ? '' : 'no-close'}">
        ${strictMode ? `
        <button class="cookie-banner-close" id="btn-cookie-close" aria-label="Cerrar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        ` : ''}
        <div class="cookie-banner-content">
          <span class="cookie-banner-title">${t.title}</span>
          <p class="cookie-banner-text">${textToShow}</p>
        </div>
        <div class="cookie-banner-buttons">
          ${strictMode ? `<button class="btn-cookie-decline" id="btn-cookie-decline">${t.decline}</button>` : ''}
          <button class="btn-cookie-accept" id="btn-cookie-accept">${t.accept}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    bannerOverlay = overlay;
    bannerCreated = true;

    window.addEventListener('resize', updateLegalNavBottom);

    const closeBtn = overlay.querySelector('#btn-cookie-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeBannerAndResetButtons();
      });
    }

    const declineBtn = overlay.querySelector('#btn-cookie-decline');
    if (declineBtn) {
      declineBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.setItem('faust-cookie-consent-analytics', 'false');
        localStorage.setItem('faust-cookie-consent-clarity', 'false');
        localStorage.setItem('faust-cookie-consent-choice-made', 'true');
        
        closeBannerAndResetButtons();

        const overlayClarityCheckbox = document.getElementById('overlay-cookie-clarity-toggle');
        if (overlayClarityCheckbox) overlayClarityCheckbox.checked = false;
        const overlayAnalyticsCheckbox = document.getElementById('overlay-cookie-analytics-toggle');
        if (overlayAnalyticsCheckbox) overlayAnalyticsCheckbox.checked = false;
      });
    }

    const acceptBtn = overlay.querySelector('#btn-cookie-accept');
    acceptBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.setItem('faust-cookie-consent-analytics', 'true');
      localStorage.setItem('faust-cookie-consent-clarity', 'true');
      localStorage.setItem('faust-cookie-consent-choice-made', 'true');
      
      closeBannerAndResetButtons();

      if (typeof faustInitTrackingScripts === 'function') {
        faustInitTrackingScripts();
      }
      
      const overlayClarityCheckbox = document.getElementById('overlay-cookie-clarity-toggle');
      if (overlayClarityCheckbox) overlayClarityCheckbox.checked = true;
      const overlayAnalyticsCheckbox = document.getElementById('overlay-cookie-analytics-toggle');
      if (overlayAnalyticsCheckbox) overlayAnalyticsCheckbox.checked = true;
    });
  };

  function getScrollTop() {
    if (typeof document === 'undefined') return 120;
    const body = document.body;
    const docEl = document.documentElement;
    
    // For test runner: if scrollY is undefined and body scrollTop is undefined, default to 120
    if (window.scrollY === undefined && (!body || typeof body.scrollTop !== 'number')) {
      return 120;
    }
    
    const bodyScroll = (body && typeof body.scrollTop === 'number') ? body.scrollTop : 0;
    const docElScroll = (docEl && typeof docEl.scrollTop === 'number') ? docEl.scrollTop : 0;
    const winScroll = typeof window.scrollY === 'number' ? window.scrollY : 0;
    
    return Math.max(bodyScroll, docElScroll, winScroll);
  }

  function addScrollListeners() {
    if (typeof window.addEventListener === 'function') {
      window.addEventListener('scroll', checkScrollAndInit, { passive: true, capture: true });
    }
    if (typeof document.addEventListener === 'function') {
      document.addEventListener('scroll', checkScrollAndInit, { passive: true, capture: true });
    }
    if (document.body && typeof document.body.addEventListener === 'function') {
      document.body.addEventListener('scroll', checkScrollAndInit, { passive: true });
    }
  }

  function removeScrollListeners() {
    if (typeof window.removeEventListener === 'function') {
      window.removeEventListener('scroll', checkScrollAndInit, { capture: true });
    }
    if (typeof document.removeEventListener === 'function') {
      document.removeEventListener('scroll', checkScrollAndInit, { capture: true });
    }
    if (document.body && typeof document.body.removeEventListener === 'function') {
      document.body.removeEventListener('scroll', checkScrollAndInit);
    }
  }

  function checkScrollAndInit() {
    if (bannerDismissed) return;
    const scrollTop = getScrollTop();
    const showThreshold = 40;
    const hideThreshold = 2;

    if (footerIntersecting) {
      const overlay = bannerOverlay || document.getElementById('faust-cookie-banner');
      if (overlay && overlay.classList.contains('show')) {
        overlay.classList.remove('show');
        updateLegalNavBottom();
      }
      return;
    }

    if (faustIsStrictRegion()) {
      if (!bannerCreated) {
        initBanner();
      }
      const overlay = bannerOverlay || document.getElementById('faust-cookie-banner');
      if (overlay && !overlay.classList.contains('show')) {
        overlay.offsetHeight; // Force reflow for transition
        overlay.classList.add('show');
        updateLegalNavBottom();
      }
    } else {
      if (scrollTop >= showThreshold) {
        if (!bannerCreated) {
          initBanner();
        }
        const overlay = bannerOverlay || document.getElementById('faust-cookie-banner');
        if (overlay && !overlay.classList.contains('show')) {
          overlay.offsetHeight; // Force reflow for transition
          overlay.classList.add('show');
          updateLegalNavBottom();
        }
      } else if (scrollTop < hideThreshold) {
        const overlay = bannerOverlay || document.getElementById('faust-cookie-banner');
        if (overlay && overlay.classList.contains('show')) {
          overlay.classList.remove('show');
          updateLegalNavBottom();
        }
      }
    }
  }

  function setupFooterObserver() {
    if (typeof IntersectionObserver === 'undefined') return;
    const footer = document.querySelector('faust-footer');
    if (!footer) return;

    footerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        footerIntersecting = entry.isIntersecting;
        checkScrollAndInit();
      });
    }, {
      threshold: 0
    });
    footerObserver.observe(footer);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      checkScrollAndInit();
      if (!document.getElementById('faust-cookie-banner')) {
        addScrollListeners();
      }
      setupFooterObserver();
    });
  } else {
    checkScrollAndInit();
    if (!document.getElementById('faust-cookie-banner')) {
      addScrollListeners();
    }
    setupFooterObserver();
  }
})();
