(function () {
  function isMobile() {
    return window.innerWidth <= 768;
  }

  function setupAbFlowScrollHijack() {
    return; // Scroll hijack removido a petición
    if (!isMobile()) return;

    var abFlowSection = document.querySelector('.ab-flow-card');
    var abFlowMain = document.querySelector('.ab-flow-main');
    if (!abFlowSection || !abFlowMain) return;

    var hijackDone = false;  // solo una vez
    var isHijacking = false;
    var anchorScrollY = 0;     // scrollY fijo mientras dura el hijack
    var maxScrollX = 0;

    var currentX = 0;      // posición actual
    var targetX = 0;      // posición objetivo
    var animating = false;

    function updateMaxScrollX() {
      maxScrollX = abFlowMain.scrollWidth - abFlowMain.clientWidth;
      if (maxScrollX < 0) maxScrollX = 0;
    }

    updateMaxScrollX();
    window.addEventListener('resize', updateMaxScrollX);

    function animate() {
      if (!animating) return;
      // Interpolación suave tipo "lerp"
      var speed = 0.15; // más alto = más rápido
      currentX += (targetX - currentX) * speed;

      // Snap muy pequeño cuando estamos muy cerca
      if (Math.abs(targetX - currentX) < 0.5) {
        currentX = targetX;
      }

      abFlowMain.scrollLeft = currentX;

      if (currentX !== targetX) {
        requestAnimationFrame(animate);
      } else {
        animating = false;

        // Al terminar de recorrer todo, liberamos
        if (hijackDone) {
          document.body.style.overflow = '';
        }
      }
    }

    var LOCK_MARGIN = 20; // distancia final entre el top de la sección y Y=74

    function onScroll() {
      if (hijackDone) return;

      var rect = abFlowSection.getBoundingClientRect();

      // Borde inferior del navbar: Y fija 74px
      var navbarBottomY = 74;

      // Distancia actual entre top de la sección y bottom del navbar
      var distance = rect.top - navbarBottomY;

      // Queremos que, al bloquear, distance = LOCK_MARGIN
      // Disparamos cuando la sección ya está por debajo de ese margen
      if (!isHijacking && distance <= LOCK_MARGIN) {
        isHijacking = true;

        var startY = window.scrollY;
        var deltaY = distance - LOCK_MARGIN;
        var targetY = startY + deltaY;
        anchorScrollY = targetY;

        var duration = 260; // ms
        var startTime = null;

        function step(timestamp) {
          if (!startTime) startTime = timestamp;
          var elapsed = timestamp - startTime;
          var t = Math.min(elapsed / duration, 1);
          var ease = 1 - Math.pow(1 - t, 3); // ease-out

          var currentY = startY + (targetY - startY) * ease;
          window.scrollTo(window.scrollX, currentY);

          if (t < 1) {
            requestAnimationFrame(step);
          } else {
            window.scrollTo(window.scrollX, targetY);
            document.body.style.overflow = 'hidden';
          }
        }

        requestAnimationFrame(step);
      }

      if (!isHijacking) return;

      if (!hijackDone) {
        window.scrollTo(window.scrollX, anchorScrollY);
      }
    }


    function onWheel(e) {
      if (!isHijacking || hijackDone) return;

      e.preventDefault();

      // Delta positivo = scroll hacia abajo → avanza horizontal
      var delta = e.deltaY || e.deltaX || 0;
      targetX = Math.min(Math.max(targetX + delta, 0), maxScrollX);

      if (!animating) {
        animating = true;
        requestAnimationFrame(animate);
      }

      // Si llegamos al final, marcamos como hecho y liberamos el scroll vertical
      if (targetX >= maxScrollX - 1) {
        hijackDone = true;
        isHijacking = false;
        // Dejamos que el body vuelva a scrollear, pero con una ligera pausa
        setTimeout(function () {
          document.body.style.overflow = '';
        }, 80);
      }
    }

    // Soporte para touch (mobile real)
    var touchStartY = 0;
    function onTouchStart(e) {
      if (!isHijacking || hijackDone) return;
      touchStartY = e.touches[0].clientY;
    }

    function onTouchMove(e) {
      if (!isHijacking || hijackDone) return;

      var currentY = e.touches[0].clientY;
      var delta = touchStartY - currentY; // arrastrar hacia arriba = delta positivo
      touchStartY = currentY;

      targetX = Math.min(Math.max(targetX + delta, 0), maxScrollX);

      if (!animating) {
        animating = true;
        requestAnimationFrame(animate);
      }

      // Bloquear scroll vertical
      e.preventDefault();
      window.scrollTo(window.scrollX, anchorScrollY);

      if (targetX >= maxScrollX - 1) {
        hijackDone = true;
        isHijacking = false;
        setTimeout(function () {
          document.body.style.overflow = '';
        }, 80);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAbFlowScrollHijack);
  } else {
    setupAbFlowScrollHijack();
  }
})();
