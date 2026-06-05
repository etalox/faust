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
    'Components/ascii-bg.js'
  ];

  scripts.forEach(src => {
    const s = document.createElement('script');
    s.src = basePath + src;
    s.async = false;
    document.head.appendChild(s);
  });
})();