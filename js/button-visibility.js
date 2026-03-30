(function () {
  function setupButtonVisibilityHighlight() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll(
      '.hero-cta-btn, .magnetic-cta'
    ));

    if (!buttons.length) return;

    // Filtramos el botón Faust Team y el nuevo de Expertos para NO aplicarles esto
    buttons = buttons.filter(function (btn) {
      var text = (btn.textContent || '').toLowerCase();
      if (btn.id === 'whatsapp-plan-cta') return false;
      return text.indexOf('faust team') === -1 && text.indexOf('expertos') === -1;
    });

    function setButtonActive(btn, active) {
      if (active) {
        btn.style.backgroundColor = '#0030ff';
        btn.style.color = '#ffffff';
      } else {
        btn.style.backgroundColor = '#1A1A1A';
        btn.style.color = '#ffffff';
      }
    }

    // Inicializamos transición suave
    buttons.forEach(function (btn) {
      btn.style.transition = 'background-color 1.6s cubic-bezier(0.2, 1, 0.3, 1), color 0.4s cubic-bezier(0.2, 1, 0.3, 1)';
    });

    function updateButtonsOnScroll() {
      var viewportH = window.innerHeight;
      var minBand = viewportH * 0.1;
      var maxBand = viewportH * 1.2;

      buttons.forEach(function (btn) {
        var rect = btn.getBoundingClientRect();
        var btnCenter = rect.top + rect.height / 2;

        var insideBand = btnCenter >= minBand && btnCenter <= maxBand;
        setButtonActive(btn, insideBand);
      });
    }

    window.addEventListener('scroll', updateButtonsOnScroll, { passive: true });
    window.addEventListener('resize', updateButtonsOnScroll);
    updateButtonsOnScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupButtonVisibilityHighlight);
  } else {
    setupButtonVisibilityHighlight();
  }
})();
