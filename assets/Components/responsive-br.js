(() => {
  function init() {
    // A client-side route swap replaces the text nodes while this script stays
    // loaded. Dispose the previous page's measurements before collecting new ones.
    if (window.__faustResponsiveBreakCleanup) {
      window.__faustResponsiveBreakCleanup();
    }

    // Inject responsive-br styles to ensure they are available on all pages
    try {
      if (!document.getElementById('responsive-br-styles')) {
        const style = document.createElement('style');
        style.id = 'responsive-br-styles';
        style.textContent = `
          .responsive-br br {
            display: inline;
          }
          .no-br .responsive-br br {
            display: none;
          }
          .no-br .responsive-br::after {
            content: " ";
          }
        `;
        document.head.appendChild(style);
      }
    } catch (e) {
      console.error("Error injecting responsive-br styles:", e);
    }

    let targets = [];
    try {
      targets = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, p'))
        .filter(el => el.querySelector('br') || el.querySelector('.responsive-br'));
    } catch (e) {
      console.error("Error querying targets:", e);
      return;
    }

    if (targets.length === 0) {
      return;
    }

    // Wrap br tags
    targets.forEach(el => {
      try {
        if (!el.querySelector('.responsive-br')) {
          el.innerHTML = el.innerHTML.replace(/<br\s*\/?>/gi, '<span class="responsive-br"><br></span>');
        }
      } catch (e) {
        console.error("Error wrapping br tag for element:", el, e);
      }
    });

    function getExactLineHeight(el) {
      try {
        const temp = document.createElement('span');
        temp.textContent = 'A';
        temp.style.visibility = 'hidden';
        temp.style.display = 'inline';
        temp.style.padding = '0';
        temp.style.margin = '0';
        temp.style.border = 'none';
        el.appendChild(temp);
        const rect = temp.getBoundingClientRect();
        el.removeChild(temp);
        if (rect.height > 0) {
          return rect.height;
        }
      } catch (e) {
        console.error("Error measuring exact line height:", e);
      }
      
      // Fallback
      try {
        const computedStyle = window.getComputedStyle(el);
        let lh = parseFloat(computedStyle.lineHeight);
        const fs = parseFloat(computedStyle.fontSize);
        const parsedFs = isNaN(fs) ? 16 : fs;
        if (isNaN(lh)) {
          return parsedFs * 1.2;
        } else if (lh <= 3) {
          return lh * parsedFs;
        }
        return lh;
      } catch (e) {
        return 20;
      }
    }

    function checkWraps() {
      try {
        targets.forEach(el => {
          el.classList.remove('no-br');
          
          const brs = el.querySelectorAll('.responsive-br');
          if (brs.length === 0) return;
          
          const lineHeight = getExactLineHeight(el);
          const height = el.getBoundingClientRect().height;
          
          if (!height) return; // Hidden elements
          
          const expectedHeight = lineHeight * (brs.length + 1.2);
          
          if (height > expectedHeight) {
            el.classList.add('no-br');
          }
        });
      } catch (e) {
        console.error("Error in checkWraps:", e);
      }
    }

    let measureFrame = null;
    const scheduleCheck = () => {
      if (measureFrame !== null) cancelAnimationFrame(measureFrame);
      measureFrame = requestAnimationFrame(() => {
        measureFrame = requestAnimationFrame(() => {
          measureFrame = null;
          checkWraps();
        });
      });
    };

    // Measure after layout and once again after deferred style/zoom work.
    scheduleCheck();

    // Listen to resize to re-check
    window.addEventListener('resize', scheduleCheck);

    if (document.fonts) {
      document.fonts.ready.then(scheduleCheck).catch(() => {});
    }
    
    // Deferred checks cover route-transition styles and CSS zoom settling.
    const timers = [50, 250, 1000].map(delay => setTimeout(scheduleCheck, delay));
    window.__faustResponsiveBreakCleanup = () => {
      window.removeEventListener('resize', scheduleCheck);
      if (measureFrame !== null) cancelAnimationFrame(measureFrame);
      timers.forEach(clearTimeout);
      window.__faustResponsiveBreakCleanup = null;
    };
  }

  window.faustInitResponsiveBreaks = init;

  // Self-correct state execution
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
