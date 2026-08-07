(function() {
  // Facebook recruitment traffic may arrive through the Facebook app,
  // facebook.com, Messenger, or with the tracking parameters preserved but
  // without a referrer. Remember the entry for the browser session so the
  // profile survives client-side navigation.
  const FAUST_FACEBOOK_ENTRY_KEY = 'faust-profile-facebook-entry';
  const isFaustFacebookEntry = () => {
    try {
      if (sessionStorage.getItem(FAUST_FACEBOOK_ENTRY_KEY) === '1') return true;

      const params = new URLSearchParams(window.location.search);
      const utmSource = (params.get('utm_source') || '').trim().toLowerCase();
      const sourceMatches = /^(facebook|fb|meta)$/.test(utmSource);
      const hasFacebookClickId = params.has('fbclid');
      let referrerMatches = false;
      if (document.referrer) {
        const hostname = new URL(document.referrer).hostname.toLowerCase();
        referrerMatches = hostname === 'facebook.com' || hostname.endsWith('.facebook.com') ||
          hostname === 'fb.com' || hostname.endsWith('.fb.com') ||
          hostname === 'messenger.com' || hostname.endsWith('.messenger.com');
      }

      const detected = sourceMatches || hasFacebookClickId || referrerMatches;
      if (detected) sessionStorage.setItem(FAUST_FACEBOOK_ENTRY_KEY, '1');
      return detected;
    } catch (error) {
      return false;
    }
  };
  window.faustHasFacebookEntry = isFaustFacebookEntry;

  // Available on every route, including pages without the landing shell. It
  // deliberately has no dependency on custom elements or loaded components.
  if (typeof window.faustPromoteLead !== 'function') {
    window.faustPromoteLead = function(source) {
      const profileKey = 'faust-user-profile';
      let previous = 'Indefinido';
      try {
        const saved = localStorage.getItem(profileKey);
        previous = saved === 'Lead' || saved === 'Talento' ? saved : 'Indefinido';
        // Talent is intentionally sticky. Only a successfully submitted
        // application is allowed to explicitly convert it into Lead.
        if (previous === 'Talento' && source !== 'application-submitted') return 'Talento';
        localStorage.setItem(profileKey, 'Lead');
        localStorage.setItem('faust-user-role', 'Standard');
      } catch (error) {}

      document.documentElement.dataset.faustProfile = 'lead';
      if (previous !== 'Lead') {
        const compact = previous === 'Talento' ? 'T' : 'I';
        console.info(`[Perfil] ${compact} → L`);
        window.dispatchEvent(new CustomEvent('faust-profile-changed', {
          detail: { previous, profile: 'Lead', source: source || 'unknown' }
        }));
      }
      requestAnimationFrame(() => document.querySelector('faust-footer')?.render?.());
      return 'Lead';
    };
  }

  // Sandbox registries for page-specific scripts
  const pageEventListeners = [];
  const pageObservers = [];
  const pageTimeouts = [];
  const pageIntervals = [];
  const pageRafs = [];

  // Track if we are currently executing page-specific scripts
  window.isRunningPageScripts = false;

  // Sandbox: Event Listeners
  const originalWindowAddEventListener = window.addEventListener;
  window.addEventListener = function(type, listener, options) {
    if (window.isRunningPageScripts) {
      pageEventListeners.push({ target: window, type, listener, options });
      if (type === 'DOMContentLoaded' && (document.readyState === 'interactive' || document.readyState === 'complete')) {
        originalSetTimeout(listener, 0);
        return;
      }
      if (type === 'load' && document.readyState === 'complete') {
        originalSetTimeout(listener, 0);
        return;
      }
    }
    return originalWindowAddEventListener.call(window, type, listener, options);
  };

  const originalDocumentAddEventListener = document.addEventListener;
  document.addEventListener = function(type, listener, options) {
    if (window.isRunningPageScripts) {
      pageEventListeners.push({ target: document, type, listener, options });
      if (type === 'DOMContentLoaded' && (document.readyState === 'interactive' || document.readyState === 'complete')) {
        originalSetTimeout(listener, 0);
        return;
      }
    }
    return originalDocumentAddEventListener.call(document, type, listener, options);
  };

  // Sandbox: IntersectionObservers
  const originalIntersectionObserver = window.IntersectionObserver;
  window.IntersectionObserver = function(callback, options) {
    const obs = new originalIntersectionObserver(callback, options);
    if (window.isRunningPageScripts) {
      pageObservers.push(obs);
    }
    return obs;
  };
  window.IntersectionObserver.prototype = originalIntersectionObserver.prototype;

  // Sandbox: Timers and Animation Loops
  const originalSetTimeout = window.setTimeout;
  window.setTimeout = function(callback, delay, ...args) {
    const id = originalSetTimeout(callback, delay, ...args);
    if (window.isRunningPageScripts) {
      pageTimeouts.push(id);
    }
    return id;
  };

  const originalSetInterval = window.setInterval;
  window.setInterval = function(callback, delay, ...args) {
    const id = originalSetInterval(callback, delay, ...args);
    if (window.isRunningPageScripts) {
      pageIntervals.push(id);
    }
    return id;
  };

  const originalRequestAnimationFrame = window.requestAnimationFrame;
  window.requestAnimationFrame = function(callback) {
    const id = originalRequestAnimationFrame(callback);
    if (window.isRunningPageScripts) {
      pageRafs.push(id);
    }
    return id;
  };

  function cleanupPageResources() {
    // 1. Remove event listeners
    pageEventListeners.forEach(({ target, type, listener, options }) => {
      target.removeEventListener(type, listener, options);
    });
    pageEventListeners.length = 0;

    // 2. Disconnect observers
    pageObservers.forEach(obs => {
      try {
        obs.disconnect();
      } catch (e) {}
    });
    pageObservers.length = 0;

    // 3. Clear timers
    pageTimeouts.forEach(id => clearTimeout(id));
    pageTimeouts.length = 0;

    pageIntervals.forEach(id => clearInterval(id));
    pageIntervals.length = 0;

    // 4. Cancel animation frames
    pageRafs.forEach(id => cancelAnimationFrame(id));
    pageRafs.length = 0;
  }

  // Let the press-state microinteraction complete before replacing UI or navigating.
  // Keyboard activation remains immediate so the delay does not affect accessibility.
  const pressDelayMs = 70;
  const pressableSelector = [
    'button',
    'a.btn:not([target]):not([download])',
    'a.modal-action:not([target]):not([download])',
    '[role="button"]',
    '.apply-option-item',
    '.calendar-day',
    '.lang-item'
  ].join(', ');

  // Shared modal/surface coordinator. Components register their own close
  // routine so closing preserves each surface's local cleanup and animation.
  const surfaceClosers = new Map();
  window.faustRegisterSurface = function(id, close) {
    surfaceClosers.set(id, close);
    return function() {
      if (surfaceClosers.get(id) === close) surfaceClosers.delete(id);
    };
  };
  window.faustOpenSurface = function(id) {
    surfaceClosers.forEach(function(close, registeredId) {
      if (registeredId === id) return;
      try { close(); } catch (error) { console.warn('Unable to close surface:', registeredId, error); }
    });
  };

  // Main-page scrolling dismisses transient surfaces through their own closers,
  // preserving each component's exit animation and cleanup. The legal consent
  // banner is separate from these surfaces; Apply and the expanded canvas lock
  // background scrolling instead of being dismissed.
  const blocksMainScroll = function() {
    return Boolean(
      document.body.classList.contains('has-expanded-canvas') ||
      document.querySelector('.apply-overlay.is-open')
    );
  };

  // Footer surfaces remain available while continuing down the page. They only
  // dismiss when the visitor scrolls back up, while every other transient
  // surface keeps the usual any-direction dismissal behavior.
  const footerScrollSurfaceIds = new Set(['cookies', 'language']);

  const closeScrollSurfaces = function(options = {}) {
    const closeFooterSurfaces = options.closeFooterSurfaces !== false;
    surfaceClosers.forEach(function(close, registeredId) {
      if (registeredId === 'apply') return;
      if (!closeFooterSurfaces && footerScrollSurfaceIds.has(registeredId)) return;
      try { close(); } catch (error) { console.warn('Unable to close surface:', registeredId, error); }
    });
    document.querySelectorAll('.nav-lang-dropdown.is-open').forEach(function(dropdown) {
      dropdown.classList.remove('is-open');
    });
  };

  window.faustCloseScrollSurfaces = closeScrollSurfaces;

  const closeForScrollDirection = function(direction) {
    closeScrollSurfaces({ closeFooterSurfaces: direction === 'up' });
  };

  // Footer language and cookie menus contain their own scrollable body. Events
  // that originate there are not page navigation and must not dismiss a menu.
  const isInternalSurfaceScroll = function(target) {
    return target instanceof Element && Boolean(
      target.closest('.lang-overlay.is-open .lang-modal-body')
    );
  };

  let lastPageScrollTop = window.scrollY;
  let lastTouchY = null;

  window.addEventListener('wheel', function(event) {
    if (blocksMainScroll() || isInternalSurfaceScroll(event.target)) return;
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX) && event.deltaY !== 0) {
      closeForScrollDirection(event.deltaY < 0 ? 'up' : 'down');
    }
  }, { passive: true, capture: true });

  window.addEventListener('touchstart', function(event) {
    lastTouchY = event.touches[0]?.clientY ?? null;
  }, { passive: true, capture: true });

  window.addEventListener('touchmove', function(event) {
    if (blocksMainScroll() || isInternalSurfaceScroll(event.target)) return;
    const touchY = event.touches[0]?.clientY;
    if (touchY === undefined || lastTouchY === null || touchY === lastTouchY) return;
    closeForScrollDirection(touchY > lastTouchY ? 'up' : 'down');
    lastTouchY = touchY;
  }, { passive: true, capture: true });

  window.addEventListener('scroll', function() {
    const currentScrollTop = window.scrollY;
    const direction = currentScrollTop < lastPageScrollTop ? 'up' : currentScrollTop > lastPageScrollTop ? 'down' : null;
    lastPageScrollTop = currentScrollTop;
    if (!blocksMainScroll() && direction) closeForScrollDirection(direction);
  }, { passive: true });

  // Experimental visual treatment. Set this to false before components.js
  // loads, or add `is-bottom-blur-disabled` to <body>, to turn it off.
  const enableBottomPageBlur = window.FAUST_ENABLE_BOTTOM_PAGE_BLUR !== false;
  window.faustEnsureBottomPageBlur = function() {
    if (!enableBottomPageBlur || !document.body || document.querySelector('.page-bottom-blur')) return;
    const blurLayer = document.createElement('div');
    blurLayer.className = 'page-bottom-blur';
    blurLayer.setAttribute('aria-hidden', 'true');
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < 6; index += 1) {
      const layer = document.createElement('span');
      layer.className = 'page-bottom-blur__layer';
      fragment.appendChild(layer);
    }
    const fade = document.createElement('span');
    fade.className = 'page-bottom-blur__fade';
    fragment.appendChild(fade);
    blurLayer.appendChild(fragment);
    document.body.appendChild(blurLayer);
  };

  if (document.body) {
    window.faustEnsureBottomPageBlur();
  } else {
    document.addEventListener('DOMContentLoaded', window.faustEnsureBottomPageBlur, { once: true });
  }

  let bottomBlurFooterObserver = null;
  window.faustSyncBottomPageBlurVisibility = function() {
    if (!enableBottomPageBlur || !document.body || !('IntersectionObserver' in window)) return;
    const footer = document.querySelector('faust-footer');
    if (!footer) return;

    if (bottomBlurFooterObserver) bottomBlurFooterObserver.disconnect();
    bottomBlurFooterObserver = new IntersectionObserver(function(entries) {
      document.body.classList.toggle('is-footer-near', entries[0].isIntersecting);
    }, { rootMargin: '0px 0px 20% 0px' });
    bottomBlurFooterObserver.observe(footer);
  };

  const setupBottomBlur = function() {
    window.faustEnsureBottomPageBlur();
    window.faustSyncBottomPageBlurVisibility();
  };
  if (document.body) {
    requestAnimationFrame(setupBottomBlur);
  } else {
    document.addEventListener('DOMContentLoaded', setupBottomBlur, { once: true });
  }

  /* ── Visitor profile ────────────────────────────────────────────────
     A profile is an experience state, not an analytics guess. Lead is
     deliberately sticky; Talent is inferred from the entry route or the
     first navigation of the current browser session. */
  const FAUST_PROFILE_KEY = 'faust-user-profile';
  const FAUST_PROFILE_ENTRY_KEY = 'faust-profile-entry-route';
  const FAUST_PROFILE_LAST_ROUTE_KEY = 'faust-profile-last-route';
  const FAUST_PROFILE_ROUTE_COUNT_KEY = 'faust-profile-route-count';
  const FAUST_PROFILE_FAQ_PREFIX = 'faust-profile-faq-read-ms:';
  const FAUST_PROFILE_APPLICATION_FIELDS_KEY = 'faust-profile-application-fields';
  const FAUST_PROFILES = new Set(['Indefinido', 'Talento', 'Lead']);
  let profileFaqFrame = null;
  let profileFaqCandidates = [];

  function normalizeFaustProfile(value) {
    return FAUST_PROFILES.has(value) ? value : 'Indefinido';
  }

  function compactFaustProfile(profile) {
    return profile === 'Indefinido' ? 'I' : profile === 'Talento' ? 'T' : 'L';
  }

  function getFaustPathname() {
    return window.location.pathname.toLowerCase();
  }

  function isFaustCareersPath(pathname) {
    return pathname.includes('/careers/') || pathname.endsWith('/careers');
  }

  function getStoredFaustProfile() {
    try {
      return normalizeFaustProfile(localStorage.getItem(FAUST_PROFILE_KEY));
    } catch (error) {
      return 'Indefinido';
    }
  }

  function getFaustProfile() {
    return getStoredFaustProfile();
  }

  function applyFaustProfileVisibility() {
    const profile = getFaustProfile();
    document.documentElement.dataset.faustProfile = profile.toLowerCase();

    document.querySelectorAll('[data-profile-hidden-for]').forEach((element) => {
      const restrictedProfiles = (element.getAttribute('data-profile-hidden-for') || '')
        .split(',')
        .map(value => value.trim())
        .filter(Boolean);
      element.hidden = restrictedProfiles.includes(profile);
    });
  }

  function setFaustProfile(nextProfile, source) {
    const normalized = normalizeFaustProfile(nextProfile);
    const previous = getStoredFaustProfile();

    // Both known profiles are sticky. Talent can only be upgraded through a
    // completed application, never by an inferred or lightweight signal.
    if (previous === 'Lead' && normalized !== 'Lead') {
      applyFaustProfileVisibility();
      return previous;
    }
    if (previous === 'Talento' && (normalized !== 'Lead' || source !== 'application-submitted')) {
      applyFaustProfileVisibility();
      return previous;
    }

    // The document shell owns an early, dependency-free Lead path. Reuse it
    // here so every qualification signal shares the exact same persistence and
    // UI refresh behaviour.
    if (normalized === 'Lead' && typeof window.faustPromoteLead === 'function') {
      const promoted = window.faustPromoteLead(source || 'unknown');
      applyFaustProfileVisibility();
      return promoted;
    }

    try {
      localStorage.setItem(FAUST_PROFILE_KEY, normalized);
      // Compatibility for legacy presentation code while it is gradually
      // migrated to the explicit three-profile model.
      localStorage.setItem('faust-user-role', normalized === 'Talento' ? 'Talento' : 'Standard');
    } catch (error) {
      // The UI can still reflect the current profile during this page view.
    }

    applyFaustProfileVisibility();
    if (previous !== normalized) {
      console.info(`[Perfil] ${compactFaustProfile(previous)} → ${compactFaustProfile(normalized)}`);
      window.dispatchEvent(new CustomEvent('faust-profile-changed', {
        detail: { previous, profile: normalized, source: source || 'unknown' }
      }));
    }
    return normalized;
  }

  function initialiseFaustEntryProfile() {
    let entryPath = '';
    const currentPath = getFaustPathname();
    try {
      entryPath = sessionStorage.getItem(FAUST_PROFILE_ENTRY_KEY) || '';
      if (!entryPath) {
        entryPath = currentPath;
        sessionStorage.setItem(FAUST_PROFILE_ENTRY_KEY, entryPath);
        sessionStorage.setItem(FAUST_PROFILE_LAST_ROUTE_KEY, currentPath);
        sessionStorage.setItem(FAUST_PROFILE_ROUTE_COUNT_KEY, '0');

        if (getFaustProfile() !== 'Lead') {
          const detectedFacebookEntry = isFaustFacebookEntry();
          setFaustProfile(
            detectedFacebookEntry || isFaustCareersPath(entryPath) ? 'Talento' : 'Indefinido',
            detectedFacebookEntry ? 'facebook-entry' : 'entry-route'
          );
        } else {
          applyFaustProfileVisibility();
        }
        return;
      }
    } catch (error) {
      entryPath = currentPath;
    }

    // A hard navigation can recreate the page without going through the
    // client router. Register it with the same session route counter.
    registerFaustRouteNavigation(currentPath, entryPath);
  }

  function registerFaustRouteNavigation(pathname, knownEntryPath) {
    const currentPath = (pathname || getFaustPathname()).toLowerCase();
    let entryPath = knownEntryPath || '';
    let lastPath = '';
    let routeCount = 0;

    try {
      entryPath = entryPath || sessionStorage.getItem(FAUST_PROFILE_ENTRY_KEY) || currentPath;
      lastPath = sessionStorage.getItem(FAUST_PROFILE_LAST_ROUTE_KEY) || entryPath;
      routeCount = Math.max(0, Number(sessionStorage.getItem(FAUST_PROFILE_ROUTE_COUNT_KEY)) || 0);

      if (lastPath !== currentPath) {
        routeCount += 1;
        sessionStorage.setItem(FAUST_PROFILE_LAST_ROUTE_KEY, currentPath);
        sessionStorage.setItem(FAUST_PROFILE_ROUTE_COUNT_KEY, String(routeCount));
      }
    } catch (error) {
      return;
    }

    // Carreras qualifies the visitor only as the entry page or the first
    // page reached after that entry. Lead always keeps precedence.
    if (getFaustProfile() !== 'Lead' && isFaustCareersPath(currentPath) && routeCount === 1) {
      setFaustProfile('Talento', 'first-navigation-to-careers');
    }
  }

  function isFullyVisibleInViewport(element) {
    if (!element || element.hidden) return false;
    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const tolerance = 1;
    return rect.width > 0 && rect.height > 0 &&
      rect.top >= -tolerance && rect.left >= -tolerance &&
      rect.bottom <= viewportHeight + tolerance && rect.right <= viewportWidth + tolerance;
  }

  function stopFaqLeadTracking() {
    if (profileFaqFrame !== null) {
      cancelAnimationFrame(profileFaqFrame);
      profileFaqFrame = null;
    }
    profileFaqCandidates = [];
  }

  function startFaqLeadTracking() {
    stopFaqLeadTracking();
    if (getFaustProfile() === 'Lead') return;

    profileFaqCandidates = Array.from(document.querySelectorAll('[data-lead-profile-faq]'))
      .map((item) => {
        const key = item.getAttribute('data-lead-profile-faq');
        const content = item.querySelector('.faq-content');
        let elapsed = 0;
        try {
          elapsed = Math.max(0, Number(sessionStorage.getItem(FAUST_PROFILE_FAQ_PREFIX + key)) || 0);
        } catch (error) {}
        return { item, content, key, elapsed, lastPersistedAt: 0 };
      })
      .filter(candidate => candidate.content && candidate.key);

    if (!profileFaqCandidates.length) return;

    let previousTime = performance.now();
    const tick = (now) => {
      const elapsedSinceFrame = Math.min(Math.max(now - previousTime, 0), 250);
      previousTime = now;
      const tabIsFocused = document.visibilityState === 'visible' && document.hasFocus();

      if (tabIsFocused) {
        for (const candidate of profileFaqCandidates) {
          const isBeingRead = candidate.item.classList.contains('is-open') &&
            isFullyVisibleInViewport(candidate.content);
          if (!isBeingRead) continue;

          candidate.elapsed += elapsedSinceFrame;
          if (now - candidate.lastPersistedAt > 250) {
            try {
              sessionStorage.setItem(FAUST_PROFILE_FAQ_PREFIX + candidate.key, String(Math.round(candidate.elapsed)));
            } catch (error) {}
            candidate.lastPersistedAt = now;
          }

          if (candidate.elapsed >= 4000) {
            setFaustProfile('Lead', 'faq-read:' + candidate.key);
            stopFaqLeadTracking();
            return;
          }
        }
      }

      profileFaqFrame = requestAnimationFrame(tick);
    };

    profileFaqFrame = requestAnimationFrame(tick);
  }

  function countCompletedApplicationFields() {
    const overlay = document.querySelector('.apply-overlay.is-open');
    if (!overlay) return 0;

    const fields = [
      overlay.querySelector('#apply-company'),
      overlay.querySelector('#apply-name'),
      overlay.querySelector('#apply-role'),
      overlay.querySelector('#apply-contact')
    ];
    return fields.reduce((count, field) => {
      const value = field && typeof field.value === 'string' ? field.value.trim() : '';
      return count + (value ? 1 : 0);
    }, 0);
  }

  function evaluateApplicationLeadSignal() {
    if (getFaustProfile() === 'Lead') return;
    if (countCompletedApplicationFields() >= 2) {
      setFaustProfile('Lead', 'application-fields');
    }
  }

  function recordCompletedApplicationField(fieldName, value) {
    if (getFaustProfile() === 'Lead' || !fieldName) return;
    let completedFields = [];
    try {
      completedFields = JSON.parse(sessionStorage.getItem(FAUST_PROFILE_APPLICATION_FIELDS_KEY) || '[]');
      if (!Array.isArray(completedFields)) completedFields = [];
    } catch (error) {
      completedFields = [];
    }

    const hasValue = typeof value === 'string' ? value.trim().length > 0 : Boolean(value);
    const uniqueFields = new Set(completedFields);
    if (hasValue) uniqueFields.add(fieldName);
    else uniqueFields.delete(fieldName);

    try {
      sessionStorage.setItem(FAUST_PROFILE_APPLICATION_FIELDS_KEY, JSON.stringify([...uniqueFields]));
    } catch (error) {}

    if (uniqueFields.size >= 2) {
      setFaustProfile('Lead', 'application-fields');
    }
  }

  window.faustGetProfile = getFaustProfile;
  window.faustGetEffectiveProfile = getFaustProfile;
  window.faustSetProfile = setFaustProfile;
  window.faustProfileRegisterRouteNavigation = registerFaustRouteNavigation;
  window.faustProfileRecordApplicationField = recordCompletedApplicationField;
  window.faustProfileTrackFaq = function(item) {
    if (item && item.matches?.('[data-lead-profile-faq]')) {
      startFaqLeadTracking();
    }
  };
  window.faustProfileRefresh = function() {
    applyFaustProfileVisibility();
    startFaqLeadTracking();
    evaluateApplicationLeadSignal();
  };

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    if (event.target.closest('[data-lead-profile-yes]')) {
      setFaustProfile('Lead', 'qualification-confirmed');
      return;
    }
    if (event.target.closest('.faust-apply-btn')) {
      requestAnimationFrame(evaluateApplicationLeadSignal);
    }
  });
  document.addEventListener('input', evaluateApplicationLeadSignal);
  document.addEventListener('change', evaluateApplicationLeadSignal);
  window.addEventListener('faust-profile-changed', () => {
    applyFaustProfileVisibility();
    const footer = document.querySelector('faust-footer');
    if (footer && typeof footer.render === 'function') {
      requestAnimationFrame(() => footer.render());
    }
  });

  initialiseFaustEntryProfile();
  window.faustProfileRefresh();

  document.addEventListener('click', function(event) {
    if (!event.isTrusted || event.detail === 0 || event.defaultPrevented) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    if (!(event.target instanceof Element)) return;
    const control = event.target.closest(pressableSelector);
    if (!control || control.closest('[data-press-delay="off"]')) return;
    if (control.matches(':disabled, .is-past, .is-weekend, [aria-disabled="true"]')) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    window.setTimeout(function() {
      if (control.isConnected) control.click();
    }, pressDelayMs);
  }, true);

  // Load Component Files
  let currentScript = document.currentScript;
  if (!currentScript) {
    const allScripts = document.getElementsByTagName('script');
    for (let i = 0; i < allScripts.length; i++) {
      if (allScripts[i].src && allScripts[i].src.includes('components.js')) {
        currentScript = allScripts[i];
        break;
      }
    }
  }

  let basePath = 'assets/';
  if (currentScript && currentScript.src) {
    const src = currentScript.src;
    basePath = src.substring(0, src.lastIndexOf('/') + 1);
  }

  const componentCacheVersion = 'progressive-blur-20260805f';
  const withComponentVersion = (src) => `${src}?v=${componentCacheVersion}`;
  const componentScripts = [
    { src: withComponentVersion('Components/consent.js'), always: true },
    { src: withComponentVersion('Components/navbar.js'), always: true },
    { src: withComponentVersion('Components/footer.js'), always: true },
    { src: withComponentVersion('Components/buttons.js'), always: true },
    { src: withComponentVersion('Components/apply-modal.js'), always: true },
    { src: withComponentVersion('Components/logo-lockup.js'), selector: 'faust-logo-lockup' },
    { src: withComponentVersion('Components/vacancy-card.js'), selector: 'faust-vacancy-card, #vacancies-container' },
    { src: withComponentVersion('Components/responsive-br.js'), selector: 'h1 br, h2 br, h3 br, h4 br, h5 br, h6 br, p br' },
    { src: withComponentVersion('Components/flow-canvas.js'), selector: 'faust-flow-canvas' },
    { src: withComponentVersion('Components/perk-illustrations.js'), selector: 'faust-ecosystem' },
    { src: withComponentVersion('Components/mouse-follower.js'), selector: 'faust-ecosystem' },
    { src: withComponentVersion('Components/ecosystem.js'), selector: 'faust-ecosystem' },
    { src: withComponentVersion('Components/documentation.js'), selector: 'faust-documentation' }
  ];
  const componentLoads = new Map();

  function loadComponentScript(src) {
    if (componentLoads.has(src)) return componentLoads.get(src);

    const load = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = basePath + src;
      s.async = false;
      s.onload = resolve;
      s.onerror = () => reject(new Error(`Unable to load component: ${src}`));
      document.head.appendChild(s);
    });
    componentLoads.set(src, load);
    return load;
  }

  function loadRequiredComponentScripts(root = document) {
    const required = componentScripts.filter(({ always, selector }) => (
      always || (selector && root.querySelector(selector))
    ));
    return Promise.all(required.map(({ src }) => loadComponentScript(src)));
  }

  // Defer page-specific component code until the corresponding element exists.
  // Scripts retain deterministic execution order through async=false.
  loadRequiredComponentScripts().catch(error => console.error(error));

  // Keep a small, in-memory cache of route HTML. This complements HTTP caching
  // and avoids another network request and response decode for recently visited
  // pages during the same session.
  const pageHtmlCache = new Map();
  const maxCachedPages = 8;

  function routeCacheKey(url) {
    const normalized = new URL(url, window.location.href);
    normalized.hash = '';
    return normalized.href;
  }

  function cacheRouteHtml(url, html) {
    const key = routeCacheKey(url);
    pageHtmlCache.delete(key);
    pageHtmlCache.set(key, html);
    if (pageHtmlCache.size > maxCachedPages) {
      pageHtmlCache.delete(pageHtmlCache.keys().next().value);
    }
  }

  async function getRouteHtml(url) {
    const key = routeCacheKey(url);
    if (pageHtmlCache.has(key)) {
      const cached = pageHtmlCache.get(key);
      // Refresh LRU order.
      pageHtmlCache.delete(key);
      pageHtmlCache.set(key, cached);
      return cached;
    }

    const response = await fetch(key, { credentials: 'same-origin' });
    if (!response.ok) throw new Error('Fetch failed');
    const html = await response.text();
    cacheRouteHtml(key, html);
    return html;
  }

  function getPrefetchableRoute(link) {
    if (!link || link.hasAttribute('download') || link.getAttribute('target') === '_blank') return null;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return null;

    let targetUrl;
    try {
      targetUrl = new URL(link.href);
    } catch (error) {
      return null;
    }
    if (targetUrl.origin !== window.location.origin) return null;

    const pathname = targetUrl.pathname.toLowerCase();
    const isAsset = pathname.includes('/assets/') ||
      /\.(png|jpe?g|gif|svg|mp4|pdf|zip|glb|txt|css|js)$/.test(pathname);
    return isAsset ? null : targetUrl.href;
  }

  function prefetchRoute(link) {
    const url = getPrefetchableRoute(link);
    if (!url || routeCacheKey(url) === routeCacheKey(window.location.href)) return;
    getRouteHtml(url).catch(() => {});
  }

  // Client-side Router transition function
  async function navigateTo(url, isPopState = false) {
    try {
      // Dismiss any open modals
      if (typeof window.closeApplyModal === 'function') window.closeApplyModal(true);
      if (typeof window.closeMessageModal === 'function') window.closeMessageModal();

      // Fetch in parallel with the exit animation. Navigation still retains its
      // visual transition, but network time no longer starts after the fade.
      const htmlPromise = getRouteHtml(url);

      // Start fade out of the content area
      document.body.classList.add('is-transitioning');
      
      // Wait for content fade-out duration (300ms)
      const [, htmlText] = await Promise.all([
        new Promise(resolve => setTimeout(resolve, 300)),
        htmlPromise
      ]);

      // Parse document
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');

      // Update URL and state in history
      if (!isPopState) {
        history.pushState({ path: url }, doc.title, url);
      }
      window.faustProfileRegisterRouteNavigation?.();

      // Update document title and meta description
      if (doc.title) {
        document.title = doc.title;
      }
      const newDesc = doc.querySelector('meta[name="description"]');
      const curDesc = document.querySelector('meta[name="description"]');
      if (newDesc && curDesc) {
        curDesc.setAttribute('content', newDesc.getAttribute('content'));
      }

      // Synchronize <html> classes and attributes (e.g. class="legal-page", lang="es")
      document.documentElement.className = doc.documentElement.className;
      if (doc.documentElement.lang) {
        document.documentElement.lang = doc.documentElement.lang;
      }

      // Synchronize <body> classes (preserving active transitioning and grid/animation states)
      const preservedBodyClasses = [];
      if (document.body.classList.contains('is-transitioning')) {
        preservedBodyClasses.push('is-transitioning');
      }
      if (document.body.classList.contains('hide-page-grid')) {
        preservedBodyClasses.push('hide-page-grid');
      }
      document.body.className = doc.body.className;
      preservedBodyClasses.forEach(cls => document.body.classList.add(cls));
      // Swap stylesheet path if it differs (due to directory depth differences)
      const currentStyleLink = document.querySelector('head link[rel="stylesheet"]');
      const newStyleLink = doc.querySelector('head link[rel="stylesheet"]');
      if (currentStyleLink && newStyleLink) {
        const newHref = newStyleLink.getAttribute('href');
        if (currentStyleLink.getAttribute('href') !== newHref) {
          await new Promise((resolve) => {
            const tempLink = document.createElement('link');
            tempLink.rel = 'stylesheet';
            tempLink.href = newHref;
            let resolved = false;
            const finish = () => {
              if (resolved) return;
              resolved = true;
              currentStyleLink.remove();
              resolve();
            };
            tempLink.onload = finish;
            tempLink.onerror = finish;
            setTimeout(finish, 1000); // safety timeout
            document.head.appendChild(tempLink);
          });
        }
      }

      // Swap favicon icon path
      const currentIconLink = document.querySelector('head link[rel="icon"]');
      const newIconLink = doc.querySelector('head link[rel="icon"]');
      if (currentIconLink && newIconLink) {
        const newHref = newIconLink.getAttribute('href');
        if (currentIconLink.getAttribute('href') !== newHref) {
          currentIconLink.setAttribute('href', newHref);
        }
      }

      // Swap page-specific raw <style> overrides
      document.querySelectorAll('head style[data-page-style="true"]').forEach(el => el.remove());
      doc.querySelectorAll('head style').forEach(styleTag => {
        const importedStyle = document.importNode(styleTag, true);
        importedStyle.setAttribute('data-page-style', 'true');
        document.head.appendChild(importedStyle);
      });
      // Cleanup event listeners, timers and observers of the old page
      cleanupPageResources();

      // Add no-reveal-animations to body before content swap
      document.body.classList.add('no-reveal-animations');

      // Swap page contents preserving navbar, footer, modals, and fade overlays
      const navbar = document.querySelector('faust-navbar');
      const footer = document.querySelector('faust-footer');
      const applyModal = document.querySelector('faust-apply-modal');
      const fadeOverlay = document.querySelector('.page-fade-overlay');
      const bottomPageBlur = document.querySelector('.page-bottom-blur');

      // Remove current non-preserved elements
      const childrenToRemove = Array.from(document.body.childNodes).filter(node => {
        return node !== navbar && 
               node !== footer && 
               node !== applyModal && 
               node !== fadeOverlay && 
               node !== bottomPageBlur &&
               node.nodeName !== 'NOSCRIPT' &&
               !(node.nodeType === Node.ELEMENT_NODE && node.id === 'google_translate_element') &&
               !(node.nodeType === Node.ELEMENT_NODE && node.classList.contains('skiptranslate'));
      });
      childrenToRemove.forEach(node => node.remove());

      // Insert new elements
      const newBodyChildren = Array.from(doc.body.childNodes);
      const footerIdx = newBodyChildren.findIndex(n => n.nodeName === 'FAUST-FOOTER');
      const scriptsToRun = [];

      newBodyChildren.forEach((node, idx) => {
        const nodeName = node.nodeName;
        if (nodeName === 'FAUST-NAVBAR' || 
            nodeName === 'FAUST-FOOTER' || 
            nodeName === 'FAUST-APPLY-MODAL' || 
            (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('page-fade-overlay')) ||
            (node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'NOSCRIPT')) {
          return;
        }

        const importedNode = document.importNode(node, true);
        
        // Collect scripts
        if (importedNode.nodeName === 'SCRIPT') {
          scriptsToRun.push(importedNode);
        } else if (importedNode.querySelectorAll) {
          importedNode.querySelectorAll('script').forEach(s => scriptsToRun.push(s));
        }

        if (footer && footerIdx !== -1 && idx < footerIdx) {
          document.body.insertBefore(importedNode, footer);
        } else {
          document.body.appendChild(importedNode);
        }
      });

      // Register page-specific custom elements only after their markup exists.
      await loadRequiredComponentScripts(document.body);

      // The responsive line-break component is cached across route changes, so
      // explicitly remeasure the newly mounted page after its layout is in DOM.
      window.faustInitResponsiveBreaks?.();

      // Update/Re-render navbar and footer for new path
      if (navbar && typeof navbar.render === 'function') {
        navbar.render();
      }
      if (footer && typeof footer.render === 'function') {
        footer.render();
      }
      window.faustSyncBottomPageBlur?.();

      // Execute scripts with active sandbox
      window.isRunningPageScripts = true;
      scriptsToRun.forEach(oldScript => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value);
        });
        newScript.textContent = oldScript.textContent;
        oldScript.parentNode.replaceChild(newScript, oldScript);
      });
      window.isRunningPageScripts = false;
      window.faustProfileRefresh?.();

      // This class only suppresses the initial reveal while the new page is mounted.
      // Do not let it leak into interactive transitions such as Careers filters.
      setTimeout(() => {
        document.body.classList.remove('no-reveal-animations');
      }, 0);

      // Re-bind grid intersection observers
      if (typeof window.bindGridObserver === 'function') {
        window.bindGridObserver();
      }

      // Scroll window to top
      window.scrollTo(0, 0);

      // Remove transition state
      document.body.classList.remove('is-transitioning');

      // If the new page has an async web component (e.g. faust-documentation),
      // let it add 'is-ready' itself once its fetch completes, so the overlay
      // doesn't clear before the content is available (prevents footer flicker).
      // For all other pages, add it immediately as normal.
      const hasAsyncComponent = document.querySelector('faust-documentation');
      if (!hasAsyncComponent) {
        document.body.classList.add('is-ready');
      }

      // Scroll to hash element if present
      const hash = window.location.hash;
      if (hash) {
        const targetEl = document.querySelector(hash);
        if (targetEl) {
          setTimeout(() => {
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }, 50);
        }
      }

    } catch (err) {
      console.error('Client-side routing failed, falling back to browser reload:', err);
      window.location.href = url;
    }
  }

  // Intercept all internal page-to-page links
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (!link) return;

    // Component-owned links (such as placeholder navigation that opens a
    // modal) have already handled the action and must not be routed as URLs.
    if (e.defaultPrevented) return;

    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (link.hasAttribute('download') || link.getAttribute('target') === '_blank') return;

    const href = link.getAttribute('href');
    if (!href) return;
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

    const targetUrl = new URL(link.href);
    if (targetUrl.origin !== window.location.origin) return;

    // Normalize a pathname so that /foo, /foo/, and /foo/index.html all compare equal.
    // For paths ending in .html (other than index.html) keep them as-is so that
    // /docs/introduccion.html and /docs/principios.html are correctly treated as different.
    function normalizePath(p) {
      return p
        .replace(/\/index\.html$/, '/') // /index.html → /
        .replace(/([^/])$/, '$1/')      // ensure trailing slash on directories
        .toLowerCase();
    }
    const currentNorm = normalizePath(window.location.pathname);
    const targetNorm  = normalizePath(targetUrl.pathname);
    if (currentNorm === targetNorm) {
      e.preventDefault(); // same page — block navigation entirely
      return;
    }

    const pathname = targetUrl.pathname.toLowerCase();
    const isAsset = pathname.includes('/assets/') || 
                    pathname.endsWith('.png') || 
                    pathname.endsWith('.jpg') || 
                    pathname.endsWith('.jpeg') || 
                    pathname.endsWith('.gif') || 
                    pathname.endsWith('.svg') || 
                    pathname.endsWith('.mp4') || 
                    pathname.endsWith('.pdf') || 
                    pathname.endsWith('.zip') || 
                    pathname.endsWith('.glb') || 
                    pathname.endsWith('.txt') ||
                    pathname.endsWith('.css') ||
                    pathname.endsWith('.js');

    if (isAsset) return;

    e.preventDefault();
    navigateTo(targetUrl.href);
  });

  // Warm likely next routes without changing navigation semantics. Pointerdown
  // covers quick clicks and touch; pointerover/focus cover deliberate choices.
  document.addEventListener('pointerdown', function(event) {
    prefetchRoute(event.target.closest && event.target.closest('a'));
  }, { passive: true, capture: true });
  document.addEventListener('pointerover', function(event) {
    const link = event.target.closest && event.target.closest('a');
    if (!link || link.contains(event.relatedTarget)) return;
    prefetchRoute(link);
  }, { passive: true });
  document.addEventListener('focusin', function(event) {
    prefetchRoute(event.target.closest && event.target.closest('a'));
  });

  // Handle browser back/forward buttons
  window.addEventListener('popstate', function(e) {
    if (e.state && e.state.path) {
      navigateTo(e.state.path, true);
    } else {
      navigateTo(window.location.href, true);
    }
  });

  // Seed initial history state for popstate compatibility
  if (!history.state || !history.state.path) {
    history.replaceState({ path: window.location.href }, document.title, window.location.href);
  }

  // Grid background IntersectionObserver setup
  document.addEventListener('DOMContentLoaded', function() {
    const visibleSet = new Set();

    function updateGridVisibility() {
      if (visibleSet.size > 0) {
        document.body.classList.add('hide-page-grid');
      } else {
        document.body.classList.remove('hide-page-grid');
      }
    }

    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          visibleSet.add(entry.target);
        } else {
          visibleSet.delete(entry.target);
        }
      });
      updateGridVisibility();
    }, {
      root: null,
      threshold: 0.05,
      rootMargin: '0px'
    });

    function bindGridObserver() {
      visibleSet.clear();
      updateGridVisibility();
      observer.disconnect();

      const finalCta = document.querySelector('.cta') || document.getElementById('contacto') || document.getElementById('vacantes');
      if (finalCta) observer.observe(finalCta);

      const faqSection = document.getElementById('faq');
      if (faqSection) observer.observe(faqSection);

      document.querySelectorAll('[data-hide-grid]').forEach(function(el) {
        observer.observe(el);
      });
    }

    bindGridObserver();
    window.bindGridObserver = bindGridObserver;
  });
})();
