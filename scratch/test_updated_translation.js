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
  cookie: ''
};

// Mock MutationObserver
class MockMutationObserver {
  observe() {}
  disconnect() {}
}

// Set up global context
global.window = {
  location: {
    hostname: 'localhost',
    reload: () => {
      global.window.reloaded = true;
    }
  },
  localStorage: mockLocalStorage,
  reloaded: false
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

  await detectCountryByIP();

  assert(localStorage.getItem('faust-detected-country-code') === 'MX', 'Detected country code should be stored as MX');
  assert(localStorage.getItem('faust-lang-selection-code') === 'es-LA', 'Should select es-LA for Mexican visitors');
  assert(localStorage.getItem('faust-lang-country') === 'Latinoamética', 'Saved country label should be Latinoamética');
  assert(getDetectedCountryName() === 'México', 'getDetectedCountryName() should resolve to México');
  assert(getButtonLabelHtml('es-LA').includes('México'), 'Button label should contain México');
  assert(!getButtonLabelHtml('es-LA').includes('LATAM'), 'Button label should not contain LATAM');

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

  await detectCountryByIP();
  assert(localStorage.getItem('faust-detected-country-code') === null, 'No country code from failed IP call');
  assert(getDetectedCountryName() === 'México', 'getDetectedCountryName should fall back to navigator.language region name (México)');
  assert(getButtonLabelHtml('es-LA').includes('México'), 'Button label should contain México via browser fallback');

  // Test Case 4: No country detected at all (fails and browser language is just 'es')
  localStorage.clear();
  global.navigator.language = 'es';
  mockFetchError = new Error('API blocked');
  
  await detectCountryByIP();
  assert(getDetectedCountryName() === 'Latinoamética', 'Should fall back to Latinoamética if no region is detected');
  assert(getButtonLabelHtml('es-LA').includes('Latinoamética'), 'Button label should fall back to Latinoamética');

  // Test Case 5: Visited from another LATAM country (e.g. Colombia 'CO')
  localStorage.clear();
  global.navigator.language = 'es-ES';
  mockFetchResult = { country_code: 'CO' };
  mockFetchError = null;
  global.window.reloaded = false;

  await detectCountryByIP();
  assert(localStorage.getItem('faust-detected-country-code') === 'CO', 'Detected country code should be CO');
  assert(getDetectedCountryName() === 'Colombia', 'getDetectedCountryName() should resolve to Colombia');
  assert(getButtonLabelHtml('es-LA').includes('Colombia'), 'Button label should contain Colombia');

  console.log('ALL NEW REGION-DETECTION TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
