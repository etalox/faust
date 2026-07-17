// Early check to disable page transitions during translation reload
(function() {
  if (typeof window !== 'undefined' && window.localStorage && localStorage.getItem('faust-show-modal-after-reload') === 'true') {
    const style = document.createElement('style');
    style.id = 'faust-no-transitions-style';
    style.textContent = `
      * {
        transition: none !important;
        animation: none !important;
      }
      body {
        opacity: 1 !important;
      }
      .lang-overlay {
        transition: none !important;
      }
      .lang-modal-container {
        transition: none !important;
      }
      .lang-modal {
        transition: none !important;
      }
    `;
    document.documentElement.appendChild(style);
  }
})();

// Auto-protect brand names from translation
(function() {
  const brandRegex = /Faust\s*Partners™?/gi;
  const skipTags = ['SCRIPT', 'STYLE', 'IFRAME', 'NOSCRIPT', 'HEAD', 'META', 'TEXTAREA', 'INPUT'];

  const originalTitle = document.title;
  let originalPageName = '';

  if (originalTitle.includes('|')) {
    const parts = originalTitle.split('|');
    if (parts.length >= 2) {
      if (originalTitle.toLowerCase().indexOf('faust') < originalTitle.indexOf('|')) {
        originalPageName = parts[1].trim();
      } else {
        originalPageName = parts[0].trim();
      }
    }
  } else if (originalTitle.includes('-')) {
    const parts = originalTitle.split('-');
    if (parts.length >= 2) {
      if (originalTitle.toLowerCase().indexOf('faust') < originalTitle.indexOf('-')) {
        originalPageName = parts[1].trim();
      } else {
        originalPageName = parts[0].trim();
      }
    }
  } else {
    if (originalTitle.toLowerCase().includes('faust')) {
      originalPageName = '';
    } else {
      originalPageName = originalTitle;
    }
  }

  // Set the initial standardised title format
  const initialTitle = originalPageName ? `Faust Partners™ | ${originalPageName}` : "Faust Partners™";
  document.title = initialTitle;

  let observer = null;

  function protectTitle() {
    const currentTitle = document.title;
    if (currentTitle.includes('|')) {
      const parts = currentTitle.split('|');
      if (parts.length >= 2) {
        const translatedPageName = parts[1].trim();
        const desiredTitle = `Faust Partners™ | ${translatedPageName}`;
        if (currentTitle !== desiredTitle) {
          if (observer) observer.disconnect();
          document.title = desiredTitle;
          if (observer) {
            observer.observe(document.documentElement, {
              childList: true,
              characterData: true,
              subtree: true
            });
          }
        }
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

        const parentTagName = parent.tagName ? parent.tagName.toUpperCase() : '';
        if (parentTagName === 'TITLE' || skipTags.includes(parentTagName) || (parent.closest && parent.closest('title, head, script, style, iframe, textarea'))) {
          return;
        }

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

  observer = new MutationObserver((mutations) => {
    observer.disconnect();
    protectTitle();
    for (const mutation of mutations) {
      for (const addedNode of mutation.addedNodes) {
        protectNode(addedNode);
      }
    }
    observer.observe(document.documentElement, {
      childList: true,
      characterData: true,
      subtree: true
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    characterData: true,
    subtree: true
  });
})();

// Global language metadata and helpers
const FAUST_LANGUAGES = [
  { code: 'es-LA', lang: 'Español', country: 'Latinoamética', engLang: 'Spanish', engCountry: 'Latin America', gtCode: 'es' },
  { code: 'es-ES', lang: 'Español', country: 'España', engLang: 'Spanish', engCountry: 'Spain', gtCode: 'es' },
  { code: 'pt', lang: 'Português', country: '', engLang: 'Portuguese', engCountry: '', gtCode: 'pt' },
  { code: 'en-GB', lang: 'English', country: 'UK', engLang: 'English', engCountry: 'United Kingdom', gtCode: 'en' },
  { code: 'en-US', lang: 'English', country: 'US', engLang: 'English', engCountry: 'United States', gtCode: 'en' },
  { code: 'fr', lang: 'Français', country: '', engLang: 'French', engCountry: '', gtCode: 'fr' },
  { code: 'ru', lang: 'Русский', country: '', engLang: 'Russian', engCountry: '', gtCode: 'ru' },
  { code: 'zh-CN', lang: '简体中文', country: '', engLang: 'Mandarin Chinese', engCountry: '', gtCode: 'zh-CN' },
  { code: 'auto', lang: 'Automatic', country: '', engLang: 'Automatic', engCountry: '', gtCode: 'auto' }
];

function getBrowserLangCode() {
  if (typeof navigator === 'undefined') return 'es';
  const navLang = navigator.language || navigator.userLanguage || 'es';
  return navLang.split('-')[0].toLowerCase();
}

function getLanguageName(code, locale) {
  locale = locale || 'es';
  try {
    const displayNames = new Intl.DisplayNames([locale], { type: 'language' });
    const name = displayNames.of(code);
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch (e) {
    const fallbacks = {
      'en': { 'en': 'English', 'es': 'Spanish', 'pt': 'Portuguese', 'fr': 'French', 'ru': 'Russian', 'zh': 'Chinese' },
      'es': { 'en': 'Inglés', 'es': 'Español', 'pt': 'Portugués', 'fr': 'Francés', 'ru': 'Ruso', 'zh': 'Chino' }
    };
    return (fallbacks[locale] && fallbacks[locale][code]) || code.toUpperCase();
  }
}

function getSelectedCode() {
  if (typeof window === 'undefined' || !window.localStorage) return 'es-LA';
  
  const savedCode = localStorage.getItem('faust-lang-selection-code');
  if (savedCode) {
    if (savedCode === 'es-MX') return 'es-LA';
    return savedCode;
  }
  
  const savedNative = localStorage.getItem('faust-lang-native');
  const savedCountry = localStorage.getItem('faust-lang-country') || '';
  
  if (savedNative === 'Automatico') return 'auto';
  if (savedNative === 'Español') {
    if (savedCountry === 'México' || savedCountry === 'Latinoamérica' || savedCountry === 'Latinoamética' || savedCountry === 'LATAM') return 'es-LA';
    return 'es-ES';
  }
  if (savedNative === 'Português') return 'pt';
  if (savedNative === 'English') {
    if (savedCountry === 'UK') return 'en-GB';
    return 'en-US';
  }
  if (savedNative === 'Français') return 'fr';
  if (savedNative === 'Русский') return 'ru';
  if (savedNative === '简体中文') return 'zh-CN';
  
  // First visit: auto-detect!
  const browserLang = getBrowserLangCode();
  const covered = ['es', 'pt', 'en', 'fr', 'ru', 'zh'];
  if (covered.includes(browserLang)) {
    if (browserLang === 'es') {
      const fullLang = (navigator.language || 'es-ES').toLowerCase();
      if (fullLang.includes('es-es')) return 'es-ES';
      return 'es-LA';
    }
    if (browserLang === 'en') {
      const fullLang = (navigator.language || 'en-US').toLowerCase();
      if (fullLang.includes('gb') || fullLang.includes('uk')) return 'en-GB';
      return 'en-US';
    }
    if (browserLang === 'pt') return 'pt';
    if (browserLang === 'fr') return 'fr';
    if (browserLang === 'ru') return 'ru';
    if (browserLang === 'zh') return 'zh-CN';
  }
  
  return 'auto';
}

function getTranslateCodeForSelection(code) {
  if (code === 'auto') {
    return getBrowserLangCode();
  }
  const lang = FAUST_LANGUAGES.find(l => l.code === code);
  return lang ? lang.gtCode : 'es';
}

function generateLangListHtml(activeCode) {
  return FAUST_LANGUAGES.map(lang => {
    const isActive = lang.code === activeCode ? ' is-active' : '';
    const countryNative = lang.country ? ` <span class="lang-country-native">${lang.country}</span>` : '';
    const countryEnglish = lang.engCountry ? ` <span class="lang-country-english">${lang.engCountry}</span>` : '';
    
    let nameNative = lang.lang;
    let nameEnglish = lang.engLang;
    if (lang.code === 'auto') {
      const detectedLangCode = getBrowserLangCode();
      const detectedNameNative = getLanguageName(detectedLangCode, 'es');
      const detectedNameEnglish = getLanguageName(detectedLangCode, 'en');
      nameNative = `Automático (${detectedNameNative})`;
      nameEnglish = `Automatic (${detectedNameEnglish})`;
    }

    return `
      <div class="lang-item${isActive}" data-code="${lang.code}">
        <div class="lang-item-info">
          <div class="lang-name-row">
            <span class="lang-name-native">${nameNative}</span>
            ${countryNative}
          </div>
          <div class="lang-name-sub">
            <span class="lang-name-english">${nameEnglish}</span>
            ${countryEnglish}
          </div>
        </div>
        <div class="lang-checkmark">
          <svg width="10" height="8" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    `;
  }).join('');
}

function getDetectedCountryName(locale) {
  locale = locale || 'en';
  if (typeof window === 'undefined' || !window.localStorage) {
    return locale === 'es' ? 'Latinoamética' : 'Latin America';
  }
  let countryCode = localStorage.getItem('faust-detected-country-code');
  if (!countryCode) {
    if (typeof navigator !== 'undefined') {
      const navLang = navigator.language || navigator.userLanguage || '';
      const parts = navLang.split('-');
      if (parts.length > 1) {
        countryCode = parts[1].toUpperCase();
      }
    }
  }
  if (countryCode) {
    try {
      const displayNames = new Intl.DisplayNames([locale], { type: 'region' });
      const name = displayNames.of(countryCode);
      if (name) return name;
    } catch (e) {
      // Fallback
    }
  }
  return locale === 'es' ? 'Latinoamética' : 'Latin America';
}

function getButtonLabelHtml(code) {
  const getRootPrefix = () => {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('/start/') || path.endsWith('/start') || path.includes('/careers/') || path.endsWith('/careers') || path.includes('/about/') || path.endsWith('/about') || path.includes('/docs/') || path.endsWith('/docs')) {
      return '../';
    }
    return './';
  };
  const rootPrefix = getRootPrefix();

  if (code === 'auto') {
    const detectedLangCode = getBrowserLangCode();
    const detectedName = getLanguageName(detectedLangCode, 'en');
    return `<img src="${rootPrefix}assets/Icons/Globe.svg" alt=""> Automatic <span style="color: #8B8D91 !important;">(${detectedName})</span>`;
  }
  const lang = FAUST_LANGUAGES.find(l => l.code === code) || FAUST_LANGUAGES.find(l => l.code === 'en-US');
  
  let country = lang.engCountry;
  if (code === 'es-LA') {
    country = getDetectedCountryName('en');
  }
  
  const countryText = country ? ` <span style="color: #8B8D91 !important;">${country}</span>` : '';
  return `<img src="${rootPrefix}assets/Icons/Globe.svg" alt=""> ${lang.engLang}${countryText}`;
}

function setTranslateCookie(code) {
  const value = `/es/${code}`;
  const domain = window.location.hostname;
  document.cookie = `googtrans=${value}; path=/;`;
  document.cookie = `googtrans=${value}; path=/; domain=${domain};`;
  if (domain.includes('.')) {
    document.cookie = `googtrans=${value}; path=/; domain=.${domain};`;
  }
}

function clearTranslateCookie() {
  const domain = window.location.hostname;
  document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
  if (domain.includes('.')) {
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain};`;
  }
}

// Perform IP-based country geolocation auto-detection on first visit
async function detectCountryByIP() {
  if (typeof window === 'undefined' || !window.localStorage) return;

  // If we already detected the country code, we don't need to run again
  if (localStorage.getItem('faust-detected-country-code')) {
    localStorage.setItem('faust-ip-detection-status', 'complete');
    return;
  }

  // If the IP detection has already run, stop to avoid repeat requests
  if (localStorage.getItem('faust-ip-detected') === 'true') {
    localStorage.setItem('faust-ip-detection-status', 'complete');
    return;
  }

  // Mark as detected (or attempted) so we don't repeat this even if it fails or gets blocked
  localStorage.setItem('faust-ip-detected', 'true');
  localStorage.setItem('faust-ip-detection-status', 'pending');

  let resolvedCountry = null;

  try {
    let country = null;
    let ip = null;

    const services = [
      { url: 'https://ipapi.co/json/', countryKey: 'country_code', ipKey: 'ip' },
      { url: 'https://ipinfo.io/json', countryKey: 'country', ipKey: 'ip' }
    ];

    for (const service of services) {
      try {
        const response = await fetch(service.url);
        if (response.ok) {
          const data = await response.json();
          const detectedCountry = (data[service.countryKey] || '').toUpperCase();
          if (detectedCountry) {
            country = detectedCountry;
            ip = data[service.ipKey];
            break;
          }
        }
      } catch (e) {
        console.warn('Geolocation detection failed for ' + service.url, e);
      }
    }

    if (!country) return;

    resolvedCountry = country;

    if (ip) {
      localStorage.setItem('faust-detected-ip', ip);
    }
    localStorage.setItem('faust-detected-country-code', country);

    // If the user already has a saved selection, don't auto-redirect them
    if (localStorage.getItem('faust-lang-selection-code')) {
      return;
    }

    const browserLang = getBrowserLangCode();
    let targetCode = null;

    if (browserLang === 'es') {
      if (country === 'ES') {
        targetCode = 'es-ES';
      } else {
        targetCode = 'es-LA';
      }
    } else if (browserLang === 'en') {
      if (['GB', 'IE', 'AU', 'NZ'].includes(country)) {
        targetCode = 'en-GB';
      } else {
        targetCode = 'en-US';
      }
    }

    if (targetCode) {
      const currentCode = getSelectedCode();
      const mappedLang = FAUST_LANGUAGES.find(l => l.code === targetCode);
      if (mappedLang) {
        localStorage.setItem('faust-lang-selection-code', targetCode);
        localStorage.setItem('faust-lang-native', mappedLang.lang);
        localStorage.setItem('faust-lang-country', mappedLang.country || '');
      }

      if (currentCode !== targetCode) {
        const currentCookieCode = getTranslateCodeForSelection(currentCode);
        const targetCookieCode = getTranslateCodeForSelection(targetCode);

        if (currentCookieCode === targetCookieCode) {
          window.dispatchEvent(new CustomEvent('faust-language-changed', {
            detail: { code: targetCode }
          }));
        } else {
          if (targetCookieCode === 'es') {
            clearTranslateCookie();
          } else {
            setTranslateCookie(targetCookieCode);
          }
          window.location.reload();
        }
      }
    }
  } catch (error) {
    console.warn('Geolocation detection failed:', error);
  } finally {
    localStorage.setItem('faust-ip-detection-status', 'complete');
    window.dispatchEvent(new CustomEvent('faust-country-detected', {
      detail: { country: resolvedCountry }
    }));
  }
}

// Check URL for language overrides (e.g. ?lang=es-la or #es-la)
function checkUrlLanguage() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  
  const langMappings = {
    'es-la': { code: 'es-LA', lang: 'Español', country: 'Latinoamética', gtCode: 'es' },
    'es-mx': { code: 'es-LA', lang: 'Español', country: 'México', gtCode: 'es' },
    'es-es': { code: 'es-ES', lang: 'Español', country: 'España', gtCode: 'es' },
    'pt': { code: 'pt', lang: 'Português', country: '', gtCode: 'pt' },
    'en-gb': { code: 'en-GB', lang: 'English', country: 'UK', gtCode: 'en' },
    'en-us': { code: 'en-US', lang: 'English', country: 'US', gtCode: 'en' },
    'fr': { code: 'fr', lang: 'Français', country: '', gtCode: 'fr' },
    'ru': { code: 'ru', lang: 'Русский', country: '', gtCode: 'ru' },
    'zh-cn': { code: 'zh-CN', lang: '简体中文', country: '', gtCode: 'zh-CN' },
    'auto': { code: 'auto', lang: 'Automatic', country: '', gtCode: 'auto' }
  };

  let detected = null;

  // 1. Check query parameters (?lang=...)
  if (window.location.search) {
    const params = new URLSearchParams(window.location.search);
    const langParam = (params.get('lang') || '').toLowerCase();
    if (langParam && langMappings[langParam]) {
      detected = langMappings[langParam];
    }
  }

  // 2. Check hash (#es-mx)
  if (!detected && window.location.hash) {
    const hash = window.location.hash.toLowerCase().replace('#', '').replace(/\//g, '');
    if (langMappings[hash]) {
      detected = langMappings[hash];
    }
  }

  if (detected) {
    const currentCode = getSelectedCode();
    if (currentCode !== detected.code) {
      localStorage.setItem('faust-lang-selection-code', detected.code);
      localStorage.setItem('faust-lang-native', detected.lang);
      localStorage.setItem('faust-lang-country', detected.country);

      const currentCookieCode = getTranslateCodeForSelection(currentCode);
      const targetCookieCode = detected.gtCode;

      if (currentCookieCode === targetCookieCode) {
        // Trigger event for dynamic updates without reload
        window.dispatchEvent(new CustomEvent('faust-language-changed', {
          detail: { code: detected.code }
        }));
      } else {
        if (targetCookieCode === 'es' || detected.code === 'auto') {
          clearTranslateCookie();
        } else {
          setTranslateCookie(targetCookieCode);
        }
        window.location.reload();
      }
    }
  }
}

// Check URL overrides first
checkUrlLanguage();

// Start IP detection immediately in the background
detectCountryByIP();

(function() {
  const applyNotranslate = () => {
    const activeCode = getSelectedCode();
    const code = getTranslateCodeForSelection(activeCode);
    const metaId = 'faust-notranslate-meta';

    if (code === 'es') {
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
      document.documentElement.removeAttribute('translate');
      if (document.body) {
        document.body.removeAttribute('translate');
      }
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

function initLegalTranslationNotice() {
  const metaDate = document.querySelector('.meta-date');
  if (!metaDate) return;

  const existing = document.querySelector('.legal-translation-notice');
  if (existing) existing.remove();

  const activeCode = getSelectedCode();
  const gtCode = getTranslateCodeForSelection(activeCode);
  const isSpanish = (gtCode === 'es');

  if (isSpanish) return;

  let targetLangCode = activeCode;
  if (activeCode === 'auto') {
    targetLangCode = getBrowserLangCode();
  }
  const langPrefix = targetLangCode.split('-')[0];
  const targetLangName = getLanguageName(langPrefix, 'es');

  const container = document.createElement('div');
  container.className = 'legal-translation-notice';
  container.setAttribute('style', 'background: rgba(253, 253, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 20px 24px; margin-top: 16px; margin-bottom: 32px; display: flex; flex-direction: row; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);');

  const note = document.createElement('p');
  note.className = 'translation-note';
  note.setAttribute('style', 'margin: 0; font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.5; flex: 1 1 300px; font-family: inherit;');
  note.textContent = 'El contenido de esta página no se ha traducido para mantener precisión legal.';

  const btn = document.createElement('button');
  btn.className = 'btn btn-secondary translation-request-btn';
  btn.setAttribute('style', 'margin-left: auto; flex-shrink: 0; padding: 12px 24px !important; font-size: 14px !important; height: 44px !important; display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; cursor: pointer; font-family: inherit; overflow: hidden; white-space: nowrap; box-sizing: border-box;');

  const pagePath = window.location.pathname.split('/').pop() || 'privacy.html';
  const requestKey = `faust-translation-requested-${pagePath}-${targetLangCode}`;
  const isRequested = localStorage.getItem(requestKey) === 'true';

  const getSuccessText = (prefix) => {
    const translations = {
      'es': '✓ Solicitud de traducción recibida',
      'en': '✓ Translation request received',
      'pt': '✓ Solicitação de tradução recebida',
      'fr': '✓ Demande de traduction reçue',
      'ru': '✓ Запрос на перевод получен',
      'zh': '✓ 翻译申请已收到',
      'de': '✓ Übersetzungsanfrage erhalten',
      'it': '✓ Richiesta di traduzione recibuta'
    };
    return translations[prefix] || translations['es'];
  };

  const successText = getSuccessText(langPrefix);

  if (isRequested) {
    btn.innerHTML = `<span>${successText}</span>`;
    btn.style.opacity = '0.5';
    btn.style.pointerEvents = 'none';
  } else {
    btn.innerHTML = `<span>Solicitar traducción a ${targetLangName}</span>`;
    btn.addEventListener('click', () => {
      localStorage.setItem(requestKey, 'true');
      
      const oldWidth = btn.getBoundingClientRect().width;
      btn.style.width = oldWidth + 'px';

      btn.innerHTML = `<span>${successText}</span>`;
      btn.style.opacity = '0.5';
      btn.style.pointerEvents = 'none';

      btn.style.width = 'auto';
      const newWidth = btn.getBoundingClientRect().width;

      btn.style.width = oldWidth + 'px';
      btn.offsetHeight; // force reflow

      btn.style.transition = 'width 350ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 350ms ease-out';
      btn.style.width = newWidth + 'px';

      setTimeout(() => {
        btn.style.width = 'auto';
        btn.style.transition = '';
      }, 350);
    });
  }

  container.appendChild(note);
  container.appendChild(btn);

  if (!document.getElementById('legal-translation-styles')) {
    const style = document.createElement('style');
    style.id = 'legal-translation-styles';
    style.textContent = `
      .translation-request-btn:hover {
        background: rgba(238, 238, 241, 0.15) !important;
      }
    `;
    document.head.appendChild(style);
  }

  metaDate.parentNode.insertBefore(container, metaDate.nextSibling);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLegalTranslationNotice);
} else {
  initLegalTranslationNotice();
}

window.addEventListener('faust-language-changed', initLegalTranslationNotice);
