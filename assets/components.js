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

  const scripts = [
    'Components/consent.js',
    'Components/navbar.js',
    'Components/footer.js',
    'Components/buttons.js',
    'Components/flow-canvas.js',
    'Components/apply-modal.js',
    'Components/logo-lockup.js',
    'Components/vacancy-card.js',
    'Components/responsive-br.js',
    'Components/perk-illustrations.js',
    'Components/mouse-follower.js',
    'Components/ecosystem.js',
    'Components/documentation.js'
  ];

  scripts.forEach(src => {
    const s = document.createElement('script');
    s.src = basePath + src;
    s.async = false;
    document.head.appendChild(s);
  });

  // Client-side Router transition function
  async function navigateTo(url, isPopState = false) {
    try {
      // Dismiss any open modals
      if (typeof window.closeApplyModal === 'function') window.closeApplyModal(true);
      if (typeof window.closeMessageModal === 'function') window.closeMessageModal();

      // Start fade out of the content area
      document.body.classList.add('is-transitioning');
      
      // Wait for content fade-out duration (300ms)
      await new Promise(resolve => setTimeout(resolve, 300));

      // Fetch target HTML
      const response = await fetch(url);
      if (!response.ok) throw new Error('Fetch failed');
      const htmlText = await response.text();

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
      if (document.body.classList.contains('no-reveal-animations')) {
        preservedBodyClasses.push('no-reveal-animations');
      }
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

      // Remove current non-preserved elements
      const childrenToRemove = Array.from(document.body.childNodes).filter(node => {
        return node !== navbar && 
               node !== footer && 
               node !== applyModal && 
               node !== fadeOverlay && 
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

      // Update/Re-render navbar and footer for new path
      if (navbar && typeof navbar.render === 'function') {
        navbar.render();
      }
      if (footer && typeof footer.render === 'function') {
        footer.render();
      }

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