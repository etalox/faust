(function() {
  const currentScript = document.currentScript;
  let basePath = 'assets/';
  if (currentScript && currentScript.src) {
    const src = currentScript.src;
    basePath = src.substring(0, src.lastIndexOf('/') + 1);
  }

  const scripts = [
    'Components/consent.js',
    'Components/navbar.js',
    'Components/footer.js',
    'Components/buttons.js'
  ];

  scripts.forEach(src => {
    const s = document.createElement('script');
    s.src = basePath + src;
    s.async = false;
    document.head.appendChild(s);
  });
})();