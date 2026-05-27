const getRootPrefix = () => {
  const path = window.location.pathname.toLowerCase();
  if (path.includes('/start/') || path.endsWith('/start') || path.includes('/careers/') || path.endsWith('/careers')) {
    return '../';
  }
  return './';
};

class FaustBtnApply extends HTMLElement {
  connectedCallback() {
    const rootPrefix = getRootPrefix();
    this.style.display = 'contents';
    this.innerHTML = `<a class="btn btn-primary faust-apply-btn" data-action="apply" href="#contacto">Aplicar <img class="arrow" src="${rootPrefix}assets/Icons/button_arrow.svg" alt=""></a>`;
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



class FaustLegalNav extends HTMLElement {
  connectedCallback() {
    const rootPrefix = getRootPrefix();
    const nextHref = this.getAttribute('next-href') || (rootPrefix + 'start/index.html');
    const nextLabel = this.getAttribute('next-label') || '';
    
    this.innerHTML = `
      <div class="legal-nav-buttons">
        <a class="btn btn-secondary" href="${rootPrefix}start/index.html">Salir</a>
        <a class="btn btn-secondary" href="${nextHref}">${nextLabel}</a>
      </div>
    `;
  }
}
customElements.define('faust-legal-nav', FaustLegalNav);
