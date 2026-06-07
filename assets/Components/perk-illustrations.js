class FaustIllustrationRevenue extends HTMLElement {
  connectedCallback() {
    this.style.display = 'contents';
    this.innerHTML = `
      <svg viewBox="0 0 240 160" class="perk-technical-svg">
        <!-- Revenue Share: 3D Donut Chart with 25% slice floating -->
        
        <!-- 1. Static 75% Donut Chart Base -->
        <g class="revenue-base">
          <!-- Inner Wall of the hole (back) -->
          <path d="M 100,80 A 28 14 0 1 1 140 80 L 140,100 A 28 14 0 1 0 100,100 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.12"/>
          <!-- Left outer wall -->
          <path d="M 48,70 A 72 36 0 0 0 69 95.5 L 69,115.5 A 72 36 0 0 1 48,90 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.12"/>
          <!-- Right outer wall -->
          <path d="M 171,95.5 A 72 36 0 0 0 192 70 L 192,90 A 72 36 0 0 1 171,115.5 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.12"/>
          <!-- Cut Face 1 (Right) -->
          <path d="M 140,80 L 171,95.5 L 171,115.5 L 140,100 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.12"/>
          <!-- Cut Face 2 (Left) -->
          <path d="M 69,95.5 L 100,80 L 100,100 L 69,115.5 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.12"/>
          <!-- Top Face -->
          <path d="M 100,80 L 69,95.5 A 72 36 0 1 1 171 95.5 L 140,80 A 28 14 0 1 0 100 80 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.12"/>
        </g>

        <!-- 2. Floating 25% Slice (floats together) -->
        <g class="revenue-layer">
          <!-- Cut Face 1 (Right) -->
          <path d="M 140,80 L 171,95.5 L 171,115.5 L 140,100 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.38"/>
          <!-- Cut Face 2 (Left) -->
          <path d="M 69,95.5 L 100,80 L 100,100 L 69,115.5 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.38"/>
          <!-- Outer Wall -->
          <path d="M 171,95.5 A 72 36 0 0 1 69 95.5 L 69,115.5 A 72 36 0 0 0 171 115.5 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.38"/>
          <!-- Top Face -->
          <path d="M 140,80 L 171,95.5 A 72 36 0 0 1 69 95.5 L 100,80 A 28 14 0 0 0 140 80 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.8" stroke-opacity="0.38"/>
        </g>
      </svg>
    `;
  }
}
customElements.define('faust-illustration-revenue', FaustIllustrationRevenue);

class FaustIllustrationAutonomy extends HTMLElement {
  connectedCallback() {
    this.style.display = 'contents';
    this.innerHTML = `
      <svg viewBox="0 0 240 160" class="perk-technical-svg">
        <!-- Autonomy: Independent isometric cubes -->
        <g transform="translate(30, 80)"><g class="auto-module">
          <path d="M 0,0 L 25,-12 L 50,0 L 25,12 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.3"/>
          <path d="M 50,0 L 50,25 L 25,37 L 25,12 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.18"/>
          <path d="M 0,0 L 0,25 L 25,37 L 25,12 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.22"/>
        </g></g>
        <g transform="translate(95, 55)"><g class="auto-module auto-accent">
          <path d="M 0,0 L 25,-12 L 50,0 L 25,12 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.4"/>
          <path d="M 50,0 L 50,25 L 25,37 L 25,12 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.22"/>
          <path d="M 0,0 L 0,25 L 25,37 L 25,12 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.28"/>
          <circle cx="25" cy="4" r="2" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.25"/>
        </g></g>
        <g transform="translate(160, 75)"><g class="auto-module">
          <path d="M 0,0 L 25,-12 L 50,0 L 25,12 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.3"/>
          <path d="M 50,0 L 50,25 L 25,37 L 25,12 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.18"/>
          <path d="M 0,0 L 0,25 L 25,37 L 25,12 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.22"/>
        </g></g>
        <line class="auto-connector" x1="80" y1="86" x2="95" y2="73" stroke="currentColor" stroke-width="0.5" opacity="0.12"/>
        <line class="auto-connector" x1="145" y1="73" x2="160" y2="81" stroke="currentColor" stroke-width="0.5" opacity="0.12"/>
      </svg>
    `;
  }
}
customElements.define('faust-illustration-autonomy', FaustIllustrationAutonomy);

class FaustIllustrationEvidence extends HTMLElement {
  connectedCallback() {
    this.style.display = 'contents';
    this.innerHTML = `
      <svg viewBox="0 0 240 160" class="perk-technical-svg">
        <!-- Evidence: Isometric bar chart — strict 2:1 iso vectors -->
        <!-- Bar width: (+18,-9), depth: (-18,+9), height: (0,-N) -->

        <!-- Bar 1: Short — height 18 (cube), base at y=128 -->
        <g class="evidence-bar-iso" style="--bar-delay: 0s">
          <path d="M 54,101 L 72,110 L 72,128 L 54,119 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.6" stroke-opacity="0.2"/>
          <path d="M 72,110 L 90,101 L 90,119 L 72,128 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.6" stroke-opacity="0.15"/>
          <path d="M 72,92 L 90,101 L 72,110 L 54,101 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.6" stroke-opacity="0.25"/>
        </g>

        <!-- Bar 2: Medium — height 32, base at y=128 -->
        <g class="evidence-bar-iso" style="--bar-delay: 0.4s">
          <path d="M 102,87 L 120,96 L 120,128 L 102,119 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.6" stroke-opacity="0.28"/>
          <path d="M 120,96 L 138,87 L 138,119 L 120,128 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.6" stroke-opacity="0.2"/>
          <path d="M 120,78 L 138,87 L 120,96 L 102,87 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.6" stroke-opacity="0.35"/>
        </g>

        <!-- Bar 3: Tall — height 50, base at y=128 -->
        <g class="evidence-bar-iso evidence-accent" style="--bar-delay: 0.8s">
          <path d="M 150,69 L 168,78 L 168,128 L 150,119 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.35"/>
          <path d="M 168,78 L 186,69 L 186,119 L 168,128 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.25"/>
          <path d="M 168,60 L 186,69 L 168,78 L 150,69 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.42"/>
        </g>

        <!-- Scan line (placed on top of the bars) -->
        <line class="evidence-scan" x1="35" y1="15" x2="35" y2="145" stroke="currentColor" stroke-width="0.6" opacity="0.25"/>
      </svg>
    `;
  }
}
customElements.define('faust-illustration-evidence', FaustIllustrationEvidence);

class FaustIllustrationHighTicket extends HTMLElement {
  connectedCallback() {
    this.style.display = 'contents';
    this.innerHTML = `
      <svg viewBox="0 0 240 160" class="perk-technical-svg">
        <!-- High-Ticket: Isometric server layers receding -->
        <g transform="translate(40, 128)"><g class="infra-layer">
          <path d="M 0,0 L 80,-24 L 160,0 L 80,24 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.5" stroke-opacity="0.07"/>
          <path d="M 0,0 L 80,24 L 160,0 L 160,8 L 80,32 L 0,8 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.5" stroke-opacity="0.07"/>
        </g></g>
        <g transform="translate(45, 114)"><g class="infra-layer">
          <path d="M 0,0 L 75,-22 L 150,0 L 75,22 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.5" stroke-opacity="0.1"/>
          <path d="M 0,0 L 75,22 L 150,0 L 150,8 L 75,30 L 0,8 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.5" stroke-opacity="0.1"/>
        </g></g>
        <g transform="translate(50, 100)"><g class="infra-layer">
          <path d="M 0,0 L 70,-20 L 140,0 L 70,20 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.5" stroke-opacity="0.14"/>
          <path d="M 0,0 L 70,20 L 140,0 L 140,8 L 70,28 L 0,8 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.5" stroke-opacity="0.14"/>
        </g></g>
        <g transform="translate(55, 86)"><g class="infra-layer">
          <path d="M 0,0 L 65,-18 L 130,0 L 65,18 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.5" stroke-opacity="0.18"/>
          <path d="M 0,0 L 65,18 L 130,0 L 130,8 L 65,26 L 0,8 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.5" stroke-opacity="0.18"/>
        </g></g>
        <g transform="translate(60, 72)"><g class="infra-layer">
          <path d="M 0,0 L 60,-16 L 120,0 L 60,16 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.5" stroke-opacity="0.23"/>
          <path d="M 0,0 L 60,16 L 120,0 L 120,8 L 60,24 L 0,8 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.5" stroke-opacity="0.23"/>
        </g></g>
        <g transform="translate(65, 58)"><g class="infra-top">
          <path d="M 0,0 L 55,-14 L 110,0 L 55,14 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.38"/>
          <path d="M 0,0 L 55,14 L 110,0 L 110,8 L 55,22 L 0,8 Z" fill="var(--illustration-fill, #08090a)" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.38"/>
          <ellipse cx="55" cy="0" rx="20" ry="5" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.18"/>
        </g></g>
      </svg>
    `;
  }
}
customElements.define('faust-illustration-highticket', FaustIllustrationHighTicket);
