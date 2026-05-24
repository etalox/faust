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
