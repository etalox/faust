class HabitaNavbar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="nav-container">
        <div class="nav-content">
          <a class="brand" href="index.html#inicio">
            <svg class="brand-logo" width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="16" fill="#FC2600"/>
              <rect x="0.048" y="0.048" width="47.904" height="47.904" rx="15.952" stroke="url(#paint0_linear_126_1327)" stroke-opacity="0.4" stroke-width="0.096"/>
              <g filter="url(#filter0_i_126_1327)">
                <path d="M32.0158 28.3504C31.5374 28.9777 31.2782 29.7447 31.2782 30.5336V35H25.0769V27.9648L32.6329 17.8029H40.0602L32.0158 28.3504Z" fill="url(#paint1_linear_126_1327)"/>
              </g>
              <path d="M39.8591 17.9025L31.9363 28.2902C31.4448 28.9348 31.1785 29.7227 31.1785 30.5333V34.8996H25.1765V27.9982L32.6833 17.9025H39.8591Z" stroke="url(#paint2_linear_126_1327)" stroke-width="0.2"/>
              <g filter="url(#filter1_i_126_1327)">
                <path d="M23.4774 25.949C22.999 26.5762 22.7399 27.3433 22.7399 28.1322V32.5986H16.5386V25.5633L24.0946 15.4014H31.5219L23.4774 25.949Z" fill="url(#paint3_linear_126_1327)"/>
              </g>
              <path d="M31.3208 15.501L23.3979 25.8887C22.9064 26.5333 22.6402 27.3213 22.6401 28.1319V32.4981H16.6382V25.5968L24.145 15.501H31.3208Z" stroke="url(#paint4_linear_126_1327)" stroke-width="0.2"/>
              <g filter="url(#filter2_i_126_1327)">
                <path d="M14.9389 23.5475C14.4604 24.1748 14.2013 24.9418 14.2013 25.7307V30.1971H8V23.1619L15.556 13H22.9833L14.9389 23.5475Z" fill="url(#paint5_linear_126_1327)"/>
              </g>
              <path d="M22.7822 13.0996L14.8594 23.4873C14.3678 24.1319 14.1016 24.9199 14.1016 25.7305V30.0967H8.09961V23.1953L15.6064 13.0996H22.7822Z" stroke="url(#paint6_linear_126_1327)" stroke-width="0.2"/>
              <defs>
                <filter id="filter0_i_126_1327" x="25.0769" y="17.8029" width="14.9834" height="17.1971" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                  <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                  <feOffset/>
                  <feGaussianBlur stdDeviation="0.75"/>
                  <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
                  <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"/>
                  <feBlend mode="normal" in2="shape" result="effect1_innerShadow_126_1327"/>
                </filter>
                <filter id="filter1_i_126_1327" x="16.5386" y="15.4014" width="14.9834" height="17.1971" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                  <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                  <feOffset/>
                  <feGaussianBlur stdDeviation="0.75"/>
                  <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
                  <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"/>
                  <feBlend mode="normal" in2="shape" result="effect1_innerShadow_126_1327"/>
                </filter>
                <filter id="filter2_i_126_1327" x="8" y="13" width="14.9834" height="17.1971" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                  <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                  <feOffset/>
                  <feGaussianBlur stdDeviation="0.75"/>
                  <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
                  <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"/>
                  <feBlend mode="normal" in2="shape" result="effect1_innerShadow_126_1327"/>
                </filter>
                <linearGradient id="paint0_linear_126_1327" x1="24" y1="0" x2="24" y2="48" gradientUnits="userSpaceOnUse">
                  <stop stop-color="white" stop-opacity="0"/>
                  <stop offset="1" stop-color="white"/>
                </linearGradient>
                <linearGradient id="paint1_linear_126_1327" x1="30.0714" y1="17.8029" x2="30.0714" y2="40.8567" gradientUnits="userSpaceOnUse">
                  <stop stop-color="white"/>
                  <stop offset="1" stop-color="white" stop-opacity="0.5"/>
                </linearGradient>
                <linearGradient id="paint2_linear_126_1327" x1="29.8935" y1="17.8029" x2="29.8935" y2="40.8567" gradientUnits="userSpaceOnUse">
                  <stop stop-color="white" stop-opacity="0"/>
                  <stop offset="1" stop-color="white"/>
                </linearGradient>
                <linearGradient id="paint3_linear_126_1327" x1="21.533" y1="15.4014" x2="21.533" y2="38.4553" gradientUnits="userSpaceOnUse">
                  <stop stop-color="white"/>
                  <stop offset="1" stop-color="white" stop-opacity="0.5"/>
                </linearGradient>
                <linearGradient id="paint4_linear_126_1327" x1="21.3551" y1="15.4014" x2="21.3551" y2="38.4553" gradientUnits="userSpaceOnUse">
                  <stop stop-color="white" stop-opacity="0"/>
                  <stop offset="1" stop-color="white"/>
                </linearGradient>
                <linearGradient id="paint5_linear_126_1327" x1="12.9944" y1="13" x2="12.9944" y2="36.0538" gradientUnits="userSpaceOnUse">
                  <stop stop-color="white"/>
                  <stop offset="1" stop-color="white" stop-opacity="0.5"/>
                </linearGradient>
                <linearGradient id="paint6_linear_126_1327" x1="12.8166" y1="13" x2="12.8166" y2="36.0538" gradientUnits="userSpaceOnUse">
                  <stop stop-color="white" stop-opacity="0"/>
                  <stop offset="1" stop-color="white"/>
                </linearGradient>
              </defs>
            </svg>
            <span class="Habita360">Habita—360™</span>
          </a>
          
          <nav class="desktop-links">
            <a href="#productos">Productos</a>
            <a href="#seguridad">Seguridad</a>
            <a href="#propiedades">Propiedades</a>
          </nav>
          
          <button class="MenuIcon" aria-expanded="false" aria-label="Abrir menú" aria-controls="habita-fullscreen-menu">
            <svg class="hamburger-svg" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path class="line-a" d="M0.848633 15.6978L15.6979 0.848527" stroke="#1E1E1E" stroke-width="2.4" stroke-linejoin="round"/>
              <path class="line-b" d="M0.848633 0.84853L15.6979 15.6978" stroke="#1E1E1E" stroke-width="2.4" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </header>
    `;
  }
}

class HabitaMenu extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="MenuOverlay" id="habita-fullscreen-menu" aria-hidden="true">
        <div class="Line1"></div>
        <div class="Line2"></div>
        
        <div class="MenuItem">
          <div class="MenuItemContainer active">
            <a href="#inicio" class="MenuItemText">Inicio</a>
          </div>
          <div class="MenuItemContainer">
            <a href="#productos" class="MenuItemText">Inmuebles</a>
          </div>
          <div class="MenuItemContainer">
            <a href="#propiedades" class="MenuItemText">Terrenos</a>
          </div>
          <div class="MenuItemContainer">
            <a href="#contacto" class="MenuItemText">Créditos</a>
          </div>
          <div class="MenuItemContainer">
            <a href="#propiedades" class="MenuItemText">Inversión</a>
          </div>
          <div class="MenuItemContainer">
            <a href="#contacto" class="MenuItemText">Contacto</a>
          </div>
          <div class="MenuItemContainer">
            <a href="#inicio" class="MenuItemText">Sobre nosotros</a>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('habita-navbar', HabitaNavbar);
customElements.define('habita-menu', HabitaMenu);
