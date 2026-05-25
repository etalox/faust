const fs = require('fs');

// Mock localStorage
const store = {};
const mockLocalStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, value) => { store[key] = String(value); },
  removeItem: (key) => { delete store[key]; },
  clear: () => { for (let k in store) delete store[k]; }
};

// Mock HTMLElement and customElements for Node
global.HTMLElement = class HTMLElement {
  querySelector() { return null; }
  querySelectorAll() { return []; }
};
global.customElements = {
  define: () => {}
};

// Mock Document and Element
class MockElement {
  constructor(tag) {
    this.tagName = (tag || '').toUpperCase();
    this.classList = {
      classes: new Set(),
      add: (c) => this.classList.classes.add(c),
      remove: (c) => this.classList.classes.delete(c),
      contains: (c) => this.classList.classes.has(c)
    };
    this.attributes = {};
    this.childNodes = [];
    this._innerHTML = '';
    this.style = {
      properties: {},
      setProperty: (name, val) => { this.style.properties[name] = val; },
      removeProperty: (name) => { delete this.style.properties[name]; }
    };
  }

  get parentNode() {
    return mockDocument.body.childNodes.includes(this) ? mockDocument.body : null;
  }

  setAttribute(name, val) { this.attributes[name] = val; }
  removeAttribute(name) { delete this.attributes[name]; }
  appendChild(child) { this.childNodes.push(child); }
  
  remove() {
    const idx = mockDocument.body.childNodes.indexOf(this);
    if (idx !== -1) {
      mockDocument.body.childNodes.splice(idx, 1);
    }
  }

  set innerHTML(val) {
    this._innerHTML = val;
    // Create elements dynamically based on selectors
    this.closeBtn = new MockElement('button');
    this.closeBtn.listeners = {};
    this.closeBtn.addEventListener = (ev, cb) => { this.closeBtn.listeners[ev] = cb; };

    this.declineBtn = new MockElement('button');
    this.declineBtn.listeners = {};
    this.declineBtn.addEventListener = (ev, cb) => { this.declineBtn.listeners[ev] = cb; };

    this.acceptBtn = new MockElement('button');
    this.acceptBtn.listeners = {};
    this.acceptBtn.addEventListener = (ev, cb) => { this.acceptBtn.listeners[ev] = cb; };
  }

  get innerHTML() {
    return this._innerHTML;
  }

  querySelector(selector) {
    if (selector === '#btn-cookie-close') return this.closeBtn;
    if (selector === '#btn-cookie-decline') {
      if (this._innerHTML.includes('id="btn-cookie-decline"')) {
        return this.declineBtn;
      }
      return null;
    }
    if (selector === '#btn-cookie-accept') return this.acceptBtn;
    return null;
  }
}

const mockDocument = {
  readyState: 'complete',
  createElement: (tag) => new MockElement(tag),
  documentElement: new MockElement('html'),
  head: new MockElement('head'),
  body: new MockElement('body'),
  querySelector: () => null,
  querySelectorAll: () => [],
  getElementById: (id) => {
    if (id === 'faust-cookie-banner') {
      return mockDocument.body.childNodes.find(c => c.id === 'faust-cookie-banner') || null;
    }
    return null;
  },
  addEventListener: () => {},
  cookie: '',
  title: 'Faust Partners'
};

global.window = {
  location: { hostname: 'localhost', pathname: '', reload: () => { global.window.reloaded = true; } },
  localStorage: mockLocalStorage,
  addEventListener: () => {},
  removeEventListener: () => {},
  reloaded: false
};
global.localStorage = mockLocalStorage;
global.document = mockDocument;
global.navigator = { language: 'es-LA' };

// Helper to assert conditions
function assert(condition, message) {
  if (!condition) {
    console.error('FAIL:', message);
    process.exit(1);
  } else {
    console.log('PASS:', message);
  }
}

// Read component fragments and concatenate them
const consentCode = fs.readFileSync('c:/Users/franc/Workspace/Faust Partners/assets/Components/consent.js', 'utf8');
const footerCode = fs.readFileSync('c:/Users/franc/Workspace/Faust Partners/assets/Components/footer.js', 'utf8');
const code = consentCode + '\n' + footerCode;


// Define getSelectedCode and translation helper mocks if referenced
global.getSelectedCode = () => 'es-LA';
global.getButtonLabelHtml = (code) => `<span>Lang: ${code}</span>`;
global.generateLangListHtml = (code) => `<div>List: ${code}</div>`;
global.getTranslateCodeForSelection = (code) => code;
global.setTranslateCookie = (code) => {};
global.clearTranslateCookie = () => {};
global.FAUST_LANGUAGES = [
  { code: 'es-LA', lang: 'Español', country: 'México' },
  { code: 'en-US', lang: 'English', country: 'United States' }
];

// Mock clarity globally
global.window.clarityCalls = [];
global.window.clarity = (...args) => {
  global.window.clarityCalls.push(args);
};

// Evaluate the component script to register top-level functions and mock classes
const evalCode = code
  .replace('class FaustFooter', 'global.FaustFooter = class FaustFooter')
  .replace(/const faustIs/g, 'global.faustIs');
eval(evalCode);

// Mock footer instances
const footer = new FaustFooter();
footer.cleanup = () => {};
footer.initGoogleTranslate = () => {};
footer.initLanguageModal = () => {};
footer.initCookieModal = () => {};
footer.initResizeHandler = () => {};

function renderFooter() {
  footer.render();
}

console.log('--- Testing Split Cookie Consent (Clarity vs Google Analytics) ---');

// Test Case 1: Standard Region (LATAM) defaults
localStorage.clear();
global.navigator.language = 'es-LA';
global.getSelectedCode = () => 'es-LA';
global.window.clarityCalls = [];

// Check global enabled states (Clarity true by default, Analytics false by default)
assert(faustIsClarityEnabled() === true, 'Clarity should be enabled by default in standard region');
assert(faustIsAnalyticsEnabled() === false, 'Analytics should be disabled by default in standard region');

// Trigger init scripts
faustInitTrackingScripts();
assert(global.window.clarityCalls.length === 1 && global.window.clarityCalls[0][0] === 'consent' && global.window.clarityCalls[0][1] === undefined, 'Clarity consent should be called with active opt-in');
assert(global.window.faustGaLoaded === undefined, 'Google Analytics should not load yet');

// Test Case 2: Strict Region (Europe) defaults
localStorage.clear();
localStorage.setItem('faust-detected-country-code', 'ES');
global.navigator.language = 'es-LA';
global.getSelectedCode = () => 'es-LA';
global.window.clarityCalls = [];

assert(faustIsClarityEnabled() === false, 'Clarity should be disabled by default in strict region');
assert(faustIsAnalyticsEnabled() === false, 'Analytics should be disabled by default in strict region');

faustInitTrackingScripts();
assert(global.window.clarityCalls.length === 1 && global.window.clarityCalls[0][0] === 'consent' && global.window.clarityCalls[0][1] === false, 'Clarity consent should be explicitly set to false');

// Test Case 3: Banner Acceptance in Standard Region
localStorage.clear();
global.navigator.language = 'es-LA';
global.getSelectedCode = () => 'es-LA';
global.window.faustGaLoaded = undefined; // reset GA load state

// Trigger banner IIFE
mockDocument.body.childNodes = [];
const bannerIndex = code.indexOf('/* ── Premium Glassmorphic Cookie Consent Banner ── */');
const bannerCode = code.substring(bannerIndex);
eval(bannerCode);

let banner = mockDocument.getElementById('faust-cookie-banner');
assert(banner !== null, 'Banner should display for standard region');
assert(banner.innerHTML.includes('Al interactuar con el sitio'), 'Standard banner should display interactive text');
assert(!banner.innerHTML.includes('id="btn-cookie-decline"'), 'Standard banner should have no decline button');

// Click accept
banner.acceptBtn.listeners['click']({ preventDefault: () => {} });
assert(localStorage.getItem('faust-cookie-consent-analytics') === 'true', 'Analytics should be true');
assert(localStorage.getItem('faust-cookie-consent-clarity') === 'true', 'Clarity should be true');
assert(localStorage.getItem('faust-cookie-consent-choice-made') === 'true', 'Choice made should be true');
assert(global.window.faustGaLoaded === true, 'Google Analytics script should have been dynamically loaded');

// Test Case 4: Banner Decline in Strict Region
localStorage.clear();
localStorage.setItem('faust-detected-country-code', 'GB');
global.navigator.language = 'en-GB';
global.getSelectedCode = () => 'en-GB';
global.window.faustGaLoaded = undefined;

mockDocument.body.childNodes = [];
eval(bannerCode);

banner = mockDocument.getElementById('faust-cookie-banner');
assert(banner !== null, 'Banner should display for strict region');
assert(banner.innerHTML.includes('id="btn-cookie-decline"'), 'Strict banner should have decline button');

// Click decline
banner.declineBtn.listeners['click']({ preventDefault: () => {} });
assert(localStorage.getItem('faust-cookie-consent-analytics') === 'false', 'Analytics should be set to false');
assert(localStorage.getItem('faust-cookie-consent-clarity') === 'false', 'Clarity should be set to false');
assert(localStorage.getItem('faust-cookie-consent-choice-made') === 'true', 'Choice made should be set to true');

// Test Case 4.5: Active language selection overrides geolocation, but browser fallback language does not if geolocation is available
localStorage.clear();
localStorage.setItem('faust-detected-country-code', 'MX');
global.navigator.language = 'en-GB'; // strict browser language
global.getSelectedCode = () => 'es-LA'; // standard active code
assert(faustIsStrictRegion() === false, 'Mexican geolocation should override strict browser language and return false when active code is standard');

global.getSelectedCode = () => 'en-GB'; // strict active code
assert(faustIsStrictRegion() === true, 'Strict selected language (en-GB) should force strict mode regardless of Mexican geolocation');

// Test Case 4.7: Strict geolocation (ES) forces strict banner even with non-strict language selection (e.g. pt)
localStorage.clear();
localStorage.setItem('faust-detected-country-code', 'ES');
global.navigator.language = 'pt';
global.getSelectedCode = () => 'pt';
global.window.faustGaLoaded = undefined;

mockDocument.body.childNodes = [];
eval(bannerCode);

banner = mockDocument.getElementById('faust-cookie-banner');
assert(banner !== null, 'Banner should display for strict region (ES)');
assert(banner.innerHTML.includes('id="btn-cookie-decline"'), 'Strict banner should have decline button even when language is Portuguese');

// Test Case 5: Footer modal rendering checks
localStorage.clear();
localStorage.setItem('faust-detected-country-code', 'MX'); // standard region
renderFooter();

assert(footer.innerHTML.includes('id="overlay-cookie-clarity-toggle"'), 'Modal should have Clarity checkbox');
assert(footer.innerHTML.includes('id="overlay-cookie-analytics-toggle"'), 'Modal should have Analytics checkbox');
assert(footer.innerHTML.includes('checked') && footer.innerHTML.indexOf('id="overlay-cookie-clarity-toggle"') !== -1, 'Clarity checkbox should be checked by default in standard region');

console.log('ALL SPLIT COOKIE CONSENT COMPLIANCE TESTS PASSED SUCCESSFULLY!');
