class FaustBtnApply extends HTMLElement {
  connectedCallback() {
    this.style.display = 'contents';
    this.innerHTML = `<a class="btn btn-primary faust-apply-btn" data-action="apply" href="#contacto">Aplicar <img class="arrow" src="./assets/Icons/button_arrow.svg" alt=""></a>`;
  }
}
customElements.define('faust-btn-apply', FaustBtnApply);

class FaustBtnMessage extends HTMLElement {
  connectedCallback() {
    this.style.display = 'contents';
    this.innerHTML = `<a class="btn btn-secondary" href="#contacto"><span class="hide-mobile">Escribir un mensaje</span><span class="show-mobile">Contacto</span></a>`;
  }
}
customElements.define('faust-btn-message', FaustBtnMessage);

class FaustBtnStrategy extends HTMLElement {
  connectedCallback() {
    this.style.display = 'contents';
    this.innerHTML = `<a class="btn btn-secondary" href="#estrategia">Estrategia<span class="hide-mobile"> de crecimiento</span></a>`;
  }
}
customElements.define('faust-btn-strategy', FaustBtnStrategy);

class FaustLogoLockup extends HTMLElement {
  connectedCallback() {
    const isNav = this.hasAttribute('is-nav');
    const imgId = isNav ? 'id="nav-isotipo"' : '';
    const imgClass = isNav ? 'class="nav-logo-icon is-blue"' : '';
    const spanId = isNav ? 'id="nav-logo-text"' : '';
    const src = this.getAttribute('src') || './assets/Logotypes/Faust Logo.svg';
    
    this.classList.add('logo-lockup');
    this.innerHTML = `
      <img ${imgId} ${imgClass} src="${src}" alt="Faust" draggable="false">
      <span ${spanId}>FaustPartners™</span>
    `;
  }
}
customElements.define('faust-logo-lockup', FaustLogoLockup);

class FaustLegalNav extends HTMLElement {
  connectedCallback() {
    this.style.display = 'contents';
    const nextHref = this.getAttribute('next-href') || './index.html';
    const nextLabel = this.getAttribute('next-label') || '';
    
    this.innerHTML = `
      <div class="legal-nav-buttons">
        <a class="btn btn-secondary" href="./index.html">Salir</a>
        <a class="btn btn-secondary" href="${nextHref}">${nextLabel}</a>
      </div>
    `;
  }
}
customElements.define('faust-legal-nav', FaustLegalNav);

