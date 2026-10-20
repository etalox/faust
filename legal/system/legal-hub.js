// Public legal-directory registry. Add a record here when a new public
// document is introduced; private collaboration documents stay unlisted.
(() => {
  const groups = [
    {
      label: 'Global',
      documents: [
        { title: 'Políticas de Privacidad', href: './privacy-policies/' },
        { title: 'Términos de Uso del Sitio Web', href: './terms-of-use/' }
      ]
    },
    {
      label: 'Partners',
      documents: [
        { title: 'Contrato de Partnering', href: './partnership-agreement/' },
        { title: 'Garantía de Integridad Empresarial', href: './CIG/' },
        { title: 'CIG-101 | Declaración de Estándares de Producto', href: './CIG-101/' },
        { title: 'CIG-501 | Protocolo de Mitigación de Pérdidas', href: './CIG-501/' },
        { title: 'CIG-901 | Protocolo de Integridad de Datos', href: './CIG-901/' },
      ]
    },
    {
      label: 'Expert Network',
      documents: [
        { title: 'Términos y Condiciones de Incorporación a la Expert Network', href: './expert-network-terms/' },
      ]
    },
  ];

  const arrow = `
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M3 8h9M8.5 3.5 13 8l-4.5 4.5" />
    </svg>`;

  const mount = () => {
    const container = document.querySelector('#legal-hub-groups');
    if (!container || container.childElementCount) return;

    container.innerHTML = groups.map((group, groupIndex) => `
      <section class="legal-hub__group" aria-labelledby="legal-group-${groupIndex}">
        <h2 id="legal-group-${groupIndex}" class="legal-hub__group-label">${group.label}</h2>
        <ul class="legal-hub__list">
          ${group.documents.map((document, documentIndex) => `
            <li>
              <a class="legal-hub__link" href="${document.href}">
                <span>${document.title}</span>
                ${arrow}
              </a>
            </li>
          `).join('')}
        </ul>
      </section>
    `).join('');

    // Unlike a versioned legal document, this directory has no asynchronous
    // document component to clear the initial route overlay.
    document.body.classList.add('is-ready');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }
})();
