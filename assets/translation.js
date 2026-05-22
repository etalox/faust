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

// Global language metadata and helpers
const FAUST_LANGUAGES = [
  { code: 'auto', lang: 'Automatico', country: '', engLang: 'Automatic', engCountry: '', gtCode: 'auto' },
  { code: 'es-LA', lang: 'Español', country: 'Latinoamética', engLang: 'Spanish', engCountry: 'Latin America', gtCode: 'es' },
  { code: 'es-ES', lang: 'Español', country: 'España', engLang: 'Spanish', engCountry: 'Spain', gtCode: 'es' },
  { code: 'pt', lang: 'Português', country: '', engLang: 'Portuguese', engCountry: '', gtCode: 'pt' },
  { code: 'en-GB', lang: 'English', country: 'UK', engLang: 'English', engCountry: 'United Kingdom', gtCode: 'en' },
  { code: 'en-US', lang: 'English', country: 'US', engLang: 'English', engCountry: 'United States', gtCode: 'en' },
  { code: 'fr', lang: 'Français', country: '', engLang: 'French', engCountry: '', gtCode: 'fr' },
  { code: 'ru', lang: 'Русский', country: '', engLang: 'Russian', engCountry: '', gtCode: 'ru' },
  { code: 'zh-CN', lang: '简体中文', country: '', engLang: 'Mandarin Chinese', engCountry: '', gtCode: 'zh-CN' },
  { code: 'ja', lang: '日本語', country: '', engLang: 'Japanese', engCountry: '', gtCode: 'ja' }
];

function getBrowserLangCode() {
  if (typeof navigator === 'undefined') return 'es';
  const navLang = navigator.language || navigator.userLanguage || 'es';
  return navLang.split('-')[0].toLowerCase();
}

function getLanguageName(code) {
  try {
    const displayNames = new Intl.DisplayNames(['es'], { type: 'language' });
    const name = displayNames.of(code);
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch (e) {
    const fallbacks = {
      'en': 'Inglés', 'es': 'Español', 'pt': 'Portugués', 'fr': 'Francés',
      'de': 'Alemán', 'it': 'Italiano', 'ja': 'Japonés', 'zh': 'Chino',
      'ru': 'Ruso', 'ko': 'Coreano'
    };
    return fallbacks[code] || code.toUpperCase();
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
  if (savedNative === '日本語') return 'ja';
  
  // First visit: auto-detect!
  const browserLang = getBrowserLangCode();
  const covered = ['es', 'pt', 'en', 'fr', 'ru', 'zh', 'ja'];
  if (covered.includes(browserLang)) {
    if (browserLang === 'es') {
      const fullLang = (navigator.language || 'es-ES').toLowerCase();
      if (fullLang.includes('mx')) return 'es-LA';
      if (fullLang === 'es' || fullLang.includes('es-es')) return 'es-ES';
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
    if (browserLang === 'ja') return 'ja';
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
      const detectedName = getLanguageName(detectedLangCode);
      nameNative = `Automatico (${detectedName})`;
      nameEnglish = `Automatic (${detectedName})`;
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

function getDetectedCountryName() {
  if (typeof window === 'undefined' || !window.localStorage) return 'Latinoamética';
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
      const displayNames = new Intl.DisplayNames(['es'], { type: 'region' });
      const name = displayNames.of(countryCode);
      if (name) return name;
    } catch (e) {
      // Fallback
    }
  }
  return 'Latinoamética';
}

function getButtonLabelHtml(code) {
  if (code === 'auto') {
    const detectedLangCode = getBrowserLangCode();
    const detectedName = getLanguageName(detectedLangCode);
    return `<img src="./assets/Icons/Globe.svg" alt=""> Automatico <span style="color: #8B8D91 !important;">(${detectedName})</span>`;
  }
  const lang = FAUST_LANGUAGES.find(l => l.code === code) || FAUST_LANGUAGES[3]; // Fallback to es-ES
  
  let country = lang.country;
  if (code === 'es-LA') {
    country = getDetectedCountryName();
  }
  
  const countryText = country ? ` <span style="color: #8B8D91 !important;">${country}</span>` : '';
  return `<img src="./assets/Icons/Globe.svg" alt=""> ${lang.lang}${countryText}`;
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
    return;
  }

  // If the IP detection has already run, stop to avoid repeat requests
  if (localStorage.getItem('faust-ip-detected') === 'true') {
    return;
  }

  // Mark as detected (or attempted) so we don't repeat this even if it fails or gets blocked
  localStorage.setItem('faust-ip-detected', 'true');

  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) throw new Error('Network response not ok');
    const data = await response.json();
    const country = (data.country_code || '').toUpperCase();

    if (!country) return;

    // Save the detected country code
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
      if (currentCode !== targetCode) {
        const mappedLang = FAUST_LANGUAGES.find(l => l.code === targetCode);
        if (mappedLang) {
          localStorage.setItem('faust-lang-selection-code', targetCode);
          localStorage.setItem('faust-lang-native', mappedLang.lang);
          localStorage.setItem('faust-lang-country', mappedLang.country || '');

          const cookieCode = getTranslateCodeForSelection(targetCode);
          if (cookieCode === 'es') {
            clearTranslateCookie();
          } else {
            setTranslateCookie(cookieCode);
          }

          window.location.reload();
        }
      }
    }
  } catch (error) {
    console.warn('Geolocation detection failed:', error);
  }
}

// Start IP detection immediately in the background
detectCountryByIP();

(function() {
  const applyNotranslate = () => {
    const activeCode = getSelectedCode();
    const code = getTranslateCodeForSelection(activeCode);
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
