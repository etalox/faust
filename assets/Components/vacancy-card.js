(function() {
  const getRootPrefix = () => {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('/start/') || path.endsWith('/start') || path.includes('/careers/') || path.endsWith('/careers')) {
      return '../';
    }
    return './';
  };

  class FaustVacancyCard extends HTMLElement {
    connectedCallback() {
      this.style.display = 'contents';
      
      const rootPrefix = getRootPrefix();
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
            <span class="vacancy-apply-link careers-apply-trigger" data-role="${role}" data-modality="${modality}">
              Postularse <img class="arrow arrow-light" src="${rootPrefix}assets/Icons/button_arrow.svg" alt="">
            </span>
          </div>
        </div>
      `;
    }
  }

  customElements.define('faust-vacancy-card', FaustVacancyCard);
})();
