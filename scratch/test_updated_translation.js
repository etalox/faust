const fs = require('fs');
const path = require('path');

// Mock localStorage
const store = {};
const mockLocalStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, value) => { store[key] = String(value); },
  removeItem: (key) => { delete store[key]; },
  clear: () => { for (let k in store) delete store[k]; }
};

// Mock Document and Element
class MockElement {
  constructor(tag) {
    this.tagName = (tag || '').toUpperCase();
    this.classList = {
      add: () => {},
      remove: () => {},
      contains: () => false
    };
    this.childNodes = [];
  }
  setAttribute() {}
  removeAttribute() {}
  appendChild() {}
  remove() {}
}

const mockDocument = {
  readyState: 'complete',
  createElement: (tag) => new MockElement(tag),
  documentElement: new MockElement('html'),
  head: new MockElement('head'),
  body: new MockElement('body'),
  querySelector: () => null,
  querySelectorAll: () => [],
  getElementById: () => null,
  addEventListener: () => {},
  cookie: '',
  title: 'Faust Partners'
};

// Mock MutationObserver
class MockMutationObserver {
  observe() {}
  disconnect() {}
}

// Set up global context
global.CustomEvent = class CustomEvent {
  constructor(type, options) {
    this.type = type;
    this.detail = options ? options.detail : null;
  }
};

global.window = {
  location: {
    hostname: 'localhost',
    reload: () => {
      global.window.reloaded = true;
    }
  },
  localStorage: mockLocalStorage,
  reloaded: false,
  dispatchEvent: (event) => {
    global.window.dispatchedEvents.push(event);
  },
  dispatchedEvents: [],
  addEventListener: () => {}
};
global.localStorage = mockLocalStorage;
global.document = mockDocument;
Object.defineProperty(global, 'navigator', {
  value: { language: 'es-ES' },
  configurable: true,
  writable: true
});
global.MutationObserver = MockMutationObserver;
global.Node = {
  TEXT_NODE: 3,
  ELEMENT_NODE: 1
};

// Mock fetch
let mockFetchResult = { country_code: 'MX' };
let mockFetchError = null;
global.fetch = async (url) => {
  if (mockFetchError) {
    throw mockFetchError;
  }
  return {
    ok: true,
    json: async () => mockFetchResult
  };
};

// Load the script (remove automatic execution during evaluation)
const translationCode = fs.readFileSync('c:/Users/franc/Workspace/Faust Partners/assets/translation.js', 'utf8')
  .replace('detectCountryByIP();', '// detectCountryByIP();');
eval(translationCode);

// Helper to run a test assertion
function assert(condition, message) {
  if (!condition) {
    console.error('FAIL:', message);
    process.exit(1);
  } else {
    console.log('PASS:', message);
  }
}

async function runTests() {
  console.log('--- Testing Region-based Country Detection & List Wording ---');

  // Test Case 1: First visit from Mexico (IP country MX)
  localStorage.clear();
  global.navigator.language = 'es-ES'; // Browser ES, but IP MX
  mockFetchResult = { country_code: 'MX' };
  mockFetchError = null;
  global.window.reloaded = false;
  global.window.dispatchedEvents = [];

  await detectCountryByIP();

  assert(localStorage.getItem('faust-detected-country-code') === 'MX', 'Detected country code should be stored as MX');
  assert(localStorage.getItem('faust-lang-selection-code') === 'es-LA', 'Should select es-LA for Mexican visitors');
  assert(localStorage.getItem('faust-lang-country') === 'Latinoamética', 'Saved country label should be Latinoamética');
  assert(getDetectedCountryName('en') === 'Mexico', 'getDetectedCountryName() should resolve to Mexico');
  assert(getButtonLabelHtml('es-LA').includes('Mexico'), 'Button label should contain Mexico');
  assert(!getButtonLabelHtml('es-LA').includes('LATAM'), 'Button label should not contain LATAM');
  assert(global.window.reloaded === false, 'Should NOT reload since es-ES and es-LA share the same base translate code es');
  assert(global.window.dispatchedEvents.length === 1, 'Should dispatch a faust-language-changed event');
  assert(global.window.dispatchedEvents[0].type === 'faust-language-changed', 'Event type should be faust-language-changed');
  assert(global.window.dispatchedEvents[0].detail.code === 'es-LA', 'Event detail code should be es-LA');

  // Test Case 2: Language list output contains "Español Latinoamética"
  const listHtml = generateLangListHtml('es-LA');
  assert(listHtml.includes('Español'), 'List contains Español');
  assert(listHtml.includes('Latinoamética'), 'List contains Latinoamética');
  assert(!listHtml.includes('LATAM'), 'List does not contain LATAM');

  // Test Case 3: Fallback using navigator.language (IP API failed/blocked)
  localStorage.clear();
  global.navigator.language = 'es-MX'; // Browser region MX
  mockFetchError = new Error('API blocked');
  global.window.reloaded = false;
  global.window.dispatchedEvents = [];

  await detectCountryByIP();
  assert(localStorage.getItem('faust-detected-country-code') === null, 'No country code from failed IP call');
  assert(getDetectedCountryName('en') === 'Mexico', 'getDetectedCountryName should fall back to navigator.language region name (Mexico)');
  assert(getButtonLabelHtml('es-LA').includes('Mexico'), 'Button label should contain Mexico via browser fallback');

  // Test Case 4: No country detected at all (fails and browser language is just 'es')
  localStorage.clear();
  global.navigator.language = 'es';
  mockFetchError = new Error('API blocked');
  
  await detectCountryByIP();
  assert(getDetectedCountryName('en') === 'Latin America', 'Should fall back to Latin America if no region is detected');
  assert(getButtonLabelHtml('es-LA').includes('Latin America'), 'Button label should fall back to Latin America');

  // Test Case 5: Visited from another LATAM country (e.g. Colombia 'CO')
  localStorage.clear();
  global.navigator.language = 'es-ES';
  mockFetchResult = { country_code: 'CO' };
  mockFetchError = null;
  global.window.reloaded = false;
  global.window.dispatchedEvents = [];

  await detectCountryByIP();
  assert(localStorage.getItem('faust-detected-country-code') === 'CO', 'Detected country code should be CO');
  assert(getDetectedCountryName('en') === 'Colombia', 'getDetectedCountryName() should resolve to Colombia');
  assert(getButtonLabelHtml('es-LA').includes('Colombia'), 'Button label should contain Colombia');
  assert(global.window.reloaded === false, 'Should NOT reload since Colombia is also es-LA');
  assert(global.window.dispatchedEvents.length === 1, 'Should dispatch a faust-language-changed event for Colombia visitor');

  console.log('ALL NEW REGION-DETECTION TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
