class FaustNavbar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <style>
        /* Efecto hover suave para los links del navbar */
        .nav-links a, #nav-contacto {
          transition: opacity 0.2s ease, color 0.2s ease;
        }
        .nav-links a:hover, #nav-contacto:hover {
          opacity: 0.7;
        }

        /* ── CONTROL DE TRANSPARENCIA CRONOMETRADO ── */
        .nav {
          --nav-transition-dur: 0.5s;

          /* 1. ESTADO DE NACIMIENTO INQUEBRANTABLE: Negro absoluto y 100% sólido */
          background: rgb(8, 9, 10) !important; 
          backdrop-filter: blur(0px) !important;
          -webkit-backdrop-filter: blur(0px) !important;
          
          /* Preparamos las transiciones de hardware */
          transition: background var(--nav-transition-dur) cubic-bezier(0.25, 1, 0.5, 1), 
                      backdrop-filter var(--nav-transition-dur) cubic-bezier(0.25, 1, 0.5, 1),
                      -webkit-backdrop-filter var(--nav-transition-dur) cubic-bezier(0.25, 1, 0.5, 1);
        }

        /* 2. ESTADO ANIMADO: Se activa suavemente mediante su propia clase interna */
        .nav.is-active {
          background: rgba(9, 10, 11, 0.88) !important; 
          backdrop-filter: blur(20px) !important;
          -webkit-backdrop-filter: blur(20px) !important;
        }
      </style>

      <nav class="nav">
        <div class="wrap nav-inner">
          <div class="logo-lockup" style="margin:0">
            <img id="nav-isotipo" class="nav-logo-icon" src="./assets/Logotypes/Faust Logo.svg" alt="Faust">
            <span id="nav-logo-text">FaustPartners™</span>
          </div>
          <div class="nav-links">
            <a href="./index.html#estrategia">Estrategia</a>
            <a href="./index.html#resultados">Resultados</a>
            <a href="./index.html#expertos">Expertos</a>
            <a href="./index.html#empresa">Empresa</a>
          </div>
          <div class="nav-right">
            <a id="nav-contacto" href="./index.html#contacto">Contacto</a>
            <a class="btn btn-secondary btn-nav" href="./index.html#aplicar">
              Aplicar
              <img class="arrow arrow-light" src="./assets/Icons/button_arrow.svg" alt="">
            </a>
          </div>
        </div>
      </nav>
    `;

    const internalNav = this.querySelector('.nav');
    if (internalNav) {
      internalNav.offsetHeight; 

      setTimeout(() => {
        internalNav.classList.add('is-active');
      }, 120);
    }

    this.initLogoObserver();
    this.initResizeHandler();
  }

  initLogoObserver() {
    const navIcon = this.querySelector('#nav-isotipo');
    const heroLogo = document.getElementById('hero-logo');
    const ctaLogo = document.querySelector('.cta .FaustLogo');
    
    if (!navIcon) return;

    let isHeroIntersecting = false;
    let isCtaIntersecting = false;

    const updateLogoColor = () => {
      if (isHeroIntersecting || isCtaIntersecting) {
        navIcon.classList.remove('is-blue');
      } else {
        navIcon.classList.add('is-blue');
      }

      if (ctaLogo) {
        if (isCtaIntersecting) {
          ctaLogo.style.color = '#0022FF';
        } else {
          ctaLogo.style.color = 'white';
        }
      }
    };

    if (heroLogo) {
      const heroObserver = new IntersectionObserver(
        ([entry]) => {
          isHeroIntersecting = entry.isIntersecting;
          updateLogoColor();
        },
        { threshold: 0, rootMargin: '-80px 0px 0px 0px' }
      );
      heroObserver.observe(heroLogo);
    } else {
      isHeroIntersecting = false;
      updateLogoColor();
    }

    if (ctaLogo) {
      const ctaObserver = new IntersectionObserver(
        ([entry]) => {
          isCtaIntersecting = entry.isIntersecting;
          updateLogoColor();
        },
        { threshold: 0, rootMargin: '0px 0px -30% 0px' }
      );
      ctaObserver.observe(ctaLogo);
    }
  }

  initResizeHandler() {
    const nav = this.querySelector('.nav');
    const navLinks = this.querySelector('.nav-links');
    const navRight = this.querySelector('.nav-right');
    const logoText = this.querySelector('#nav-logo-text');
    const navContacto = this.querySelector('#nav-contacto');

    if (!nav || !navLinks || !navRight) return;

    const checkNavGap = () => {
      const links = Array.from(navLinks.children);

      // 1. Reset all states to measure baseline layout
      nav.classList.remove('nav-contacto-hidden');
      links.forEach(link => link.style.display = '');

      // 2. Hide links one-by-one from right to left if they collide
      for (let i = links.length - 1; i >= 0; i--) {
        const visibleLinks = links.filter(link => link.style.display !== 'none');
        
        if (visibleLinks.length <= 2) {
          // Hide all of them if 2 or fewer remain
          visibleLinks.forEach(link => link.style.display = 'none');
          break;
        }

        const leftmostLink = visibleLinks[0];
        const rightmostLink = visibleLinks[visibleLinks.length - 1];
        const gapRight = navRight.getBoundingClientRect().left - rightmostLink.getBoundingClientRect().right;
        const gapLeft = logoText ? (leftmostLink.getBoundingClientRect().left - logoText.getBoundingClientRect().right) : 999;
        
        if (gapRight < 30 || gapLeft < 30) {
          rightmostLink.style.display = 'none';
        } else {
          // No collision, we can stop hiding
          break;
        }
      }

      // 3. Measure gap between Logo Text and Contacto (with links in their final state)
      if (logoText && navContacto) {
        const gapContacto = navContacto.getBoundingClientRect().left - logoText.getBoundingClientRect().right;
        if (gapContacto < 30) {
          nav.classList.add('nav-contacto-hidden');
        }
      }
    };

    checkNavGap();
    window.addEventListener('resize', checkNavGap);
    
    // Clean up event listener when element is disconnected
    this._resizeHandler = checkNavGap;
  }

  disconnectedCallback() {
    if (this._resizeHandler) {
      window.removeEventListener('resize', this._resizeHandler);
    }
  }
}

class FaustFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <style>
        /* Mantenemos los hovers específicos para los links de texto sencillos */
        .footer-col a, .footer-bottom a {
          transition: color 0.2s ease, opacity 0.2s ease;
        }
        .footer-col a:hover {
          color: #ffffff !important;
        }
        .footer-bottom a:hover {
          color: #ffffff !important;
        }

        /* Ajuste de padding balanceado para el botón de idioma */
        .footer-bottom .lang {
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
      </style>

      <footer id="empresa">
        <div class="wrap">
          <div class="footer-grid">
            <div class="footer-col">
              <h4>General</h4>
              <a href="./index.html#">Aplicar</a>
              <a href="./index.html#">Diseño web</a>
              <a href="./index.html#">Consultoría</a>
              <a href="./index.html#">Software</a>
              <a href="./index.html#">Nuestra visión</a>
              <a href="./index.html#">Estrategia de crecimiento</a>
              <a href="./index.html#">Faust Max</a>
            </div>
            <div class="footer-col">
              <h4>Resultados</h4>
              <a href="./index.html#">Reportes de crecimiento</a>
              <a href="./index.html#">Carreras</a>
              <a href="./index.html#">Faust OS</a>
              <a href="./index.html#">Inversionistas</a>
            </div>
            <div class="footer-col">
              <h4>Empresa</h4>
              <a href="./index.html#">Acerca de nosotros</a>
              <a href="./index.html#">Proyectos</a>
              <a href="./index.html#">Expert Network</a>
            </div>
          </div>
          <div class="footer-bottom">
            <div style="color: #fff !important;">Faust Partners™ © 2026</div>
            <div style="display:flex;gap:24px;">
              <a href="./index.html#">Privacidad</a>
              <a href="./index.html#">Términos y condiciones</a>
              <a href="./index.html#">Legal</a>
            </div>
            <div style="display:flex;gap:20px;align-items:center;">
              <a href="./index.html#" style="text-decoration:underline;color:#fff;">Gestionar cookies</a>
              
              <span class="lang btn btn-secondary"><img src="./assets/Icons/Globe.svg" alt=""> Español <span style="color: #8B8D91 !important;">México</span></span>
            
            </div>
          </div>
        </div>
      </footer>
    `;
  }
}

customElements.define('faust-navbar', FaustNavbar);
customElements.define('faust-footer', FaustFooter);
