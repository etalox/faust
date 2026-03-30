(function () {
  function isMobile() {
    return window.innerWidth <= 768;
  }

  function setupAbFlowAnimations() {
    if (!isMobile()) return;

    var abFlowCards = document.querySelectorAll('.ab-flow-card');
    if (abFlowCards.length === 0) return;

    // Inyectamos solo la transición, eliminamos el !important de la opacidad fija
    if (!document.getElementById('ab-flow-spotlight-styles')) {
      var style = document.createElement('style');
      style.id = 'ab-flow-spotlight-styles';
      style.innerHTML = `
            .ab-flow-card {
                transition: background-color 0.8s cubic-bezier(0.2, 1, 0.3, 1);
            }
            .ab-flow-canvas {
                transition: opacity 0.8s cubic-bezier(0.2, 1, 0.3, 1), filter 0.8s cubic-bezier(0.2, 1, 0.3, 1);
            }
            .spotlight-transition {
                transition: opacity 0.8s cubic-bezier(0.2, 1, 0.3, 1) !important;
            }
        `;
      document.head.appendChild(style);
    }

    var baseBg = '#0D0D0D';
    var focusBg = '#101010';
    var baseOpacity = '0.3';
    var focusOpacity = '1';
    var baseBlur = '1px';
    var focusBlur = '0px';

    Array.prototype.slice.call(abFlowCards).forEach(function (card) {
      card.style.backgroundColor = baseBg;
      var canvas = card.querySelector('.ab-flow-canvas');
      if (canvas) {
        canvas.style.opacity = baseOpacity;
        canvas.style.filter = 'blur(' + baseBlur + ')';
      }
    });

    var currentFocusedCard = null;

    function onScrollAbFlow() {
      var viewportH = window.innerHeight;
      var centerY = viewportH * 0.64;
      var foundFocus = null;

      Array.prototype.slice.call(abFlowCards).forEach(function (card) {
        var rect = card.getBoundingClientRect();
        if (centerY >= rect.top && centerY <= rect.bottom) {
          foundFocus = card;
        }
      });

      if (foundFocus !== currentFocusedCard) {

        if (currentFocusedCard) {
          currentFocusedCard.style.backgroundColor = baseBg;
          var oldCanvas = currentFocusedCard.querySelector('.ab-flow-canvas');
          if (oldCanvas) {
            oldCanvas.style.opacity = baseOpacity;
            oldCanvas.style.filter = 'blur(' + baseBlur + ')';
          }
        }

        // 1. Restaurar el DOM a sus valores reales y limpiar marcadores
        var dimmedElements = document.querySelectorAll('.spotlight-dimmed');
        Array.prototype.slice.call(dimmedElements).forEach(function (el) {
          el.style.opacity = el.getAttribute('data-orig-inline') || '';
          el.classList.remove('spotlight-dimmed');
        });

        if (foundFocus) {
          foundFocus.style.backgroundColor = focusBg;
          var newCanvas = foundFocus.querySelector('.ab-flow-canvas');
          if (newCanvas) {
            newCanvas.style.opacity = focusOpacity;
            newCanvas.style.filter = 'blur(' + focusBlur + ')';
          }

          // 2. Escalar por el DOM calculando opacidades relativas
          var current = foundFocus;
          while (current && current.tagName !== 'BODY' && current.tagName !== 'HTML') {
            var siblings = current.parentNode.children;
            for (var i = 0; i < siblings.length; i++) {
              var sibling = siblings[i];
              if (sibling !== current && sibling.nodeType === 1 && sibling.id !== 'desktop-navbar' && sibling.id !== 'side-panel' && !sibling.closest('#side-panel')) {

                // Guardamos su estado base en caché solo la primera vez que lo tocamos
                if (!sibling.hasAttribute('data-orig-inline')) {
                  sibling.setAttribute('data-orig-inline', sibling.style.opacity || '');
                  var compOpacity = window.getComputedStyle(sibling).opacity;
                  sibling.setAttribute('data-comp-opacity', compOpacity);
                }

                var orig = parseFloat(sibling.getAttribute('data-comp-opacity')) || 1;

                sibling.classList.add('spotlight-transition');
                sibling.classList.add('spotlight-dimmed');
                sibling.style.opacity = (orig * 0.4).toFixed(3);
              }
            }
            current = current.parentNode;
          }
        }
        currentFocusedCard = foundFocus;
      }
    }

    window.addEventListener('scroll', onScrollAbFlow, { passive: true });
    onScrollAbFlow();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAbFlowAnimations);
  } else {
    setupAbFlowAnimations();
  }
})();
