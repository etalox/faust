(function() {
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

  let lastPageScrollTop = window.scrollY;
  let lastTouchY = null;

  window.addEventListener('wheel', function(event) {
    if (blocksMainScroll()) return;
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX) && event.deltaY !== 0) {
      closeForScrollDirection(event.deltaY < 0 ? 'up' : 'down');
    }
  }, { passive: true, capture: true });

  window.addEventListener('touchstart', function(event) {
    lastTouchY = event.touches[0]?.clientY ?? null;
  }, { passive: true, capture: true });

  window.addEventListener('touchmove', function(event) {
    if (blocksMainScroll()) return;
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

  const componentScripts = [
    { src: 'Components/consent.js', always: true },
    { src: 'Components/navbar.js', always: true },
    { src: 'Components/footer.js', always: true },
    { src: 'Components/buttons.js', always: true },
    { src: 'Components/apply-modal.js', always: true },
    { src: 'Components/logo-lockup.js', selector: 'faust-logo-lockup' },
    { src: 'Components/vacancy-card.js', selector: 'faust-vacancy-card, #vacancies-container' },
    { src: 'Components/responsive-br.js', selector: 'h1 br, h2 br, h3 br, h4 br, h5 br, h6 br, p br' },
    { src: 'Components/flow-canvas.js', selector: 'faust-flow-canvas' },
    { src: 'Components/perk-illustrations.js', selector: 'faust-ecosystem' },
    { src: 'Components/mouse-follower.js', selector: 'faust-ecosystem' },
    { src: 'Components/ecosystem.js', selector: 'faust-ecosystem' },
    { src: 'Components/documentation.js', selector: 'faust-documentation' }
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
