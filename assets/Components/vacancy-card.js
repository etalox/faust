class FaustVacancyCard extends HTMLElement {
  connectedCallback() {
    this.style.display = 'contents';
    
    const title = this.getAttribute('title') || '';
    const types = this.getAttribute('types') || '';
    const modality = this.getAttribute('modality') || '';
    const role = this.getAttribute('role') || title;

    // Generar los tags dinámicamente basados en el atributo `types`
    const tagsHTML = types.split(' ').map(type => {
      if (type === 'fulltime') return '<span class="tag tag-fulltime">Tiempo Completo</span>';
      if (type === 'freelance') return '<span class="tag tag-freelance">Freelance</span>';
      if (type === 'consulting') return '<span class="tag tag-consulting">Consultoría</span>';
      return '';
    }).filter(Boolean).join('');

    this.innerHTML = `
      <div class="vacancy-item" data-type="${types}">
        <div class="vacancy-info">
          <div class="vacancy-title-row">
            <h3 class="vacancy-title">${title}</h3>
            <div class="vacancy-tags">
              ${tagsHTML}
            </div>
          </div>
        </div>
        <div class="vacancy-action">
          <button class="btn btn-secondary careers-apply-trigger" data-role="${role}" data-modality="${modality}">Postularse</button>
        </div>
      </div>
    `;
  }
}

customElements.define('faust-vacancy-card', FaustVacancyCard);
