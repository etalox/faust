(function() {
  class FaustEcosystem extends HTMLElement {
    connectedCallback() {
      this.style.display = 'contents';
      
      const pill = this.getAttribute('pill') || '/ Ecosistema';
      const title = this.getAttribute('title') || 'El ecosistema para el talento extraordinario.';
      this.removeAttribute('title');



      this.innerHTML = `
        <section class="section section-grid-bg" id="perks">
          <div class="wrap-narrow">
            <div class="pill reveal-item">${pill}</div>
            <h2 class="section-title reveal-item" style="margin: 0 0 60px 0;">${title}</h2>
            
            <div class="perks-showcase-container reveal-item">
              <!-- Left side: interactive step list -->
              <div class="perks-interactive-list">
                <!-- Item 1: Revenue Share -->
                <div class="perk-interactive-item is-active" data-index="0">
                  <span class="perk-num">01</span>
                  <div class="perk-item-content">
                    <h3>Revenue Share</h3>
                    <p>Participa directamente del valor que generas. Los contribuidores clave reciben compensaciones vinculadas al rendimiento neto de los experimentos CRO.</p>
                  </div>
                  <!-- Mobile visual (inline SVG) -->
                  <div class="perk-mobile-visual">
                    <faust-illustration-revenue></faust-illustration-revenue>
                  </div>
                  <div class="perk-row-progress">
                    <div class="perk-row-progress-fill"></div>
                  </div>
                  <faust-mouse-follower text="Conocer más"></faust-mouse-follower>
                </div>

                <!-- Item 2: Autonomía Asíncrona -->
                <div class="perk-interactive-item" data-index="1" style="display: none;">
                  <span class="perk-num">02</span>
                  <div class="perk-item-content">
                    <h3>Autonomía Asíncrona</h3>
                    <p>Trabajamos orientados a resultados. Sin reuniones redundantes ni burocracia, diseñas tu propio horario para maximizar tu enfoque y productividad.</p>
                  </div>
                  <!-- Mobile visual (inline SVG) -->
                  <div class="perk-mobile-visual">
                    <faust-illustration-autonomy></faust-illustration-autonomy>
                  </div>
                  <div class="perk-row-progress">
                    <div class="perk-row-progress-fill"></div>
                  </div>
                  <faust-mouse-follower text="Conocer más"></faust-mouse-follower>
                </div>

                <!-- Item 3: Enfoque Basado en Evidencia -->
                <div class="perk-interactive-item" data-index="2">
                  <span class="perk-num">03</span>
                  <div class="perk-item-content">
                    <h3>Enfoque Analítico</h3>
                    <p>Sin opiniones subjetivas. Cada diseño y propuesta visual se valida mediante tests A/B con millones de usuarios y significancia estadística rigurosa.</p>
                  </div>
                  <!-- Mobile visual (inline SVG) -->
                  <div class="perk-mobile-visual">
                    <faust-illustration-evidence></faust-illustration-evidence>
                  </div>
                  <div class="perk-row-progress">
                    <div class="perk-row-progress-fill"></div>
                  </div>
                  <faust-mouse-follower text="Conocer más"></faust-mouse-follower>
                </div>

                <!-- Item 4: Proyectos High-Ticket -->
                <div class="perk-interactive-item" data-index="3">
                  <span class="perk-num">04</span>
                  <div class="perk-item-content">
                    <h3>Proyectos High-Ticket</h3>
                    <p>Optimiza las plataformas de comercio electrónico más grandes de la región, logrando un impacto masivo y cuantificable en tu portafolio.</p>
                  </div>
                  <!-- Mobile visual (inline SVG) -->
                  <div class="perk-mobile-visual">
                    <faust-illustration-highticket></faust-illustration-highticket>
                  </div>
                  <div class="perk-row-progress">
                    <div class="perk-row-progress-fill"></div>
                  </div>
                  <faust-mouse-follower text="Conocer más"></faust-mouse-follower>
                </div>
              </div>

              <!-- Right side: sticky terminal/code editor mockup window -->
              <div class="perks-preview-pane">
                <div class="mockup-window">
                  <div class="mockup-header">
                    <div class="mockup-dots">
                      <span class="mockup-dot"></span>
                      <span class="mockup-dot"></span>
                      <span class="mockup-dot"></span>
                    </div>
                    <span class="mockup-filename" id="perk-filename">revenue_share.svg</span>
                  </div>
                  <div class="mockup-body">
                    <!-- SVG 1: Revenue Share -->
                    <div class="perk-preview-svg is-active" id="perk-svg-0">
                      <faust-illustration-revenue></faust-illustration-revenue>
                    </div>
                    <!-- SVG 2: Autonomía -->
                    <div class="perk-preview-svg" id="perk-svg-1">
                      <faust-illustration-autonomy></faust-illustration-autonomy>
                    </div>
                    <!-- SVG 3: Evidencia -->
                    <div class="perk-preview-svg" id="perk-svg-2">
                      <faust-illustration-evidence></faust-illustration-evidence>
                    </div>
                    <!-- SVG 4: High-Ticket -->
                    <div class="perk-preview-svg" id="perk-svg-3">
                      <faust-illustration-highticket></faust-illustration-highticket>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      `;

      this.init();
      
      // Initialize reveal animations for the newly created items
      if (window.initReveal) {
        window.initReveal();
      }
    }

    init() {
      const items = this.querySelectorAll('.perk-interactive-item');
      const previewSvgs = this.querySelectorAll('.perk-preview-svg');
      const filenameEl = this.querySelector('#perk-filename');
      const follower = document.body.querySelector('.perk-mouse-follower');
      
      const filenames = [
        'revenue_share.svg',
        'async_flow.svg',
        'evidence_ab.svg',
        'traffic_nodes.svg'
      ];
      
      let currentIndex = 0;
      const duration = 6000; // 6 seconds per step
      let startTime = null;
      let animationFrameId = null;

      const section = this.querySelector('.section');
      const syncAnimationVisibility = () => {
        this.classList.toggle('is-page-visible', document.visibilityState === 'visible');
      };
      const animationObserver = 'IntersectionObserver' in window
        ? new IntersectionObserver((entries) => {
            this.classList.toggle('is-in-view', entries[0].isIntersecting);
          }, { threshold: 0.05 })
        : null;

      if (animationObserver && section) {
        animationObserver.observe(section);
      } else {
        this.classList.add('is-in-view');
      }
      document.addEventListener('visibilitychange', syncAnimationVisibility);
      syncAnimationVisibility();

      const setActiveStep = (index) => {
        currentIndex = index;
        
        // Update items active state
        items.forEach((item, idx) => {
          if (idx === index) {
            item.classList.add('is-active');
          } else {
            item.classList.remove('is-active');
            // Reset progress bar width
            const fill = item.querySelector('.perk-row-progress-fill');
            if (fill) fill.style.width = '0%';
          }
        });

        // Update desktop preview SVGs
        previewSvgs.forEach((svg, idx) => {
          if (idx === index) {
            svg.classList.add('is-active');
          } else {
            svg.classList.remove('is-active');
          }
        });

        // Update mockup filename
        if (filenameEl) {
          filenameEl.textContent = filenames[index];
        }
        
        // Start progress bar animation for active item (only on desktop widths)
        if (window.innerWidth > 980) {
          startProgressAnimation();
        }
      };

      const startProgressAnimation = () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        
        const activeItem = items[currentIndex];
        if (!activeItem) return;
        const fill = activeItem.querySelector('.perk-row-progress-fill');
        if (!fill) return;

        startTime = performance.now();

        const updateProgress = (now) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          fill.style.width = (progress * 100) + '%';

          if (progress < 1) {
            animationFrameId = requestAnimationFrame(updateProgress);
          } else {
            // Auto-advance
            const nextIndex = (currentIndex + 1) % items.length;
            setActiveStep(nextIndex);
          }
        };

        animationFrameId = requestAnimationFrame(updateProgress);
      };

      // Click handlers (ignored on mobile for scroll-only interaction)
      const clickListeners = [];
      items.forEach((item, idx) => {
        const listener = () => {
          if (window.innerWidth <= 980) {
            return; // Scroll-only on mobile
          }
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
          }
          setActiveStep(idx);
        };
        item.addEventListener('click', listener);
        clickListeners.push({ item, listener });
      });

      // Scroll handler for mobile accordion scroll-driven activation
      const handleScroll = () => {
        if (window.innerWidth > 980) {
          return;
        }
        
        const viewportCenter = window.innerHeight / 2;
        let closestIndex = -1;
        let closestDistance = Infinity;
        
        items.forEach((item, idx) => {
          if (item.offsetWidth === 0 && item.offsetHeight === 0) return;
          const rect = item.getBoundingClientRect();
          const itemCenter = rect.top + rect.height / 2;
          const distance = Math.abs(itemCenter - viewportCenter);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = idx;
          }
        });
        
        if (closestIndex !== -1 && closestIndex !== currentIndex) {
          setActiveStep(closestIndex);
        }
      };

      window.addEventListener('scroll', handleScroll, { passive: true });

      const resizeVisualContainers = () => {
        if (window.innerWidth > 980) {
          const middleItem = items[2];
          if (middleItem) {
            const middleVisual = middleItem.querySelector('.perk-mobile-visual');
            if (middleVisual) {
              middleVisual.style.height = 'auto';
              const targetHeight = middleVisual.clientHeight;
              if (targetHeight > 0) {
                items.forEach((item) => {
                  if (item.style.display !== 'none') {
                    const visual = item.querySelector('.perk-mobile-visual');
                    if (visual) {
                      visual.style.setProperty('height', targetHeight + 'px', 'important');
                    }
                  }
                });
              }
            }
          }
        } else {
          items.forEach((item) => {
            const visual = item.querySelector('.perk-mobile-visual');
            if (visual) {
              visual.style.removeProperty('height');
            }
          });
        }
      };

      // Handle window resizing to restart or stop animation appropriately
      const handleResize = () => {
        if (window.innerWidth <= 980) {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
          }
          // Clear any width on progress bar fills on mobile
          items.forEach((item) => {
            const fill = item.querySelector('.perk-row-progress-fill');
            if (fill) fill.style.width = '0%';
          });
          handleScroll(); // Align active state with scroll position immediately on resize
        } else {
          // Restart animation if resizing back to desktop
          startProgressAnimation();
        }
        resizeVisualContainers();
      };

      window.addEventListener('resize', handleResize);

      const handleLoad = () => {
        resizeVisualContainers();
      };
      window.addEventListener('load', handleLoad);

      // Initial run
      if (window.innerWidth <= 980) {
        currentIndex = -1;
        handleScroll();
        if (currentIndex === -1) {
          setActiveStep(0);
        }
      } else {
        setActiveStep(0);
      }
      
      // Defer height calculations slightly to allow rendering
      setTimeout(resizeVisualContainers, 150);
      resizeVisualContainers();

      // Store references for clean up on disconnect
      this._cleanup = () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('load', handleLoad);
        document.removeEventListener('visibilitychange', syncAnimationVisibility);
        if (animationObserver) animationObserver.disconnect();
        clickListeners.forEach(({ item, listener }) => {
          item.removeEventListener('click', listener);
        });
      };
    }

    disconnectedCallback() {
      if (this._cleanup) {
        this._cleanup();
      }
    }
  }

  customElements.define('faust-ecosystem', FaustEcosystem);
})();
