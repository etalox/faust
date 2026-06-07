(function() {
  let currentScript = document.currentScript;
  if (!currentScript) {
    const allScripts = document.getElementsByTagName('script');
    for (let i = 0; i < allScripts.length; i++) {
      if (allScripts[i].src && allScripts[i].src.includes('components.js')) {
        currentScript = allScripts[i];
        break;
      }
    }
  }

  let basePath = 'assets/';
  if (currentScript && currentScript.src) {
    const src = currentScript.src;
    basePath = src.substring(0, src.lastIndexOf('/') + 1);
  }

  const scripts = [
    'Components/consent.js',
    'Components/navbar.js',
    'Components/footer.js',
    'Components/buttons.js',
    'Components/flow-canvas.js',
    'Components/apply-modal.js',
    'Components/logo-lockup.js',
    'Components/vacancy-card.js',
    'Components/responsive-br.js',
    'Components/perk-illustrations.js'
  ];

  scripts.forEach(src => {
    const s = document.createElement('script');
    s.src = basePath + src;
    s.async = false;
    document.head.appendChild(s);
  });

  // IntersectionObserver to fade out background lines when the final CTA enters the viewport
  document.addEventListener('DOMContentLoaded', function() {
    const finalCta = document.querySelector('.cta') || document.getElementById('contacto') || document.getElementById('vacantes');
    if (finalCta) {
      const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            document.body.classList.add('hide-page-grid');
          } else {
            document.body.classList.remove('hide-page-grid');
          }
        });
      }, {
        root: null,
        threshold: 0.05,
        rootMargin: '0px'
      });
      observer.observe(finalCta);
    }
  });
})();