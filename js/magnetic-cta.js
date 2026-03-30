(function () {
  var ENABLE_MAGNETISM = false;
  if (!ENABLE_MAGNETISM) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  var ctas = Array.prototype.slice.call(document.querySelectorAll(".magnetic-cta"));
  if (!ctas.length) return;

  var MAX_SHIFT = 18;
  var RANGE = 170;
  var ticking = false;
  var mouseX = 0;
  var mouseY = 0;

  function updateMagnetism() {
    ticking = false;
    ctas.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var dx = mouseX - cx;
      var dy = mouseY - cy;
      var distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > RANGE) {
        el.style.transform = "translate3d(0, 0, 0)";
        return;
      }

      var strength = Math.pow(1 - distance / RANGE, 0.75);
      var pullX = (dx / RANGE) * MAX_SHIFT * strength;
      var pullY = (dy / RANGE) * MAX_SHIFT * strength;
      el.style.transform = "translate3d(" + pullX.toFixed(2) + "px, " + pullY.toFixed(2) + "px, 0)";
    });
  }

  function onPointerMove(ev) {
    mouseX = ev.clientX;
    mouseY = ev.clientY;
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateMagnetism);
    }
  }

  window.addEventListener("mousemove", onPointerMove);
  window.addEventListener("mouseleave", function () {
    ctas.forEach(function (el) {
      el.style.transform = "translate3d(0, 0, 0)";
    });
  });
  window.addEventListener("blur", function () {
    ctas.forEach(function (el) {
      el.style.transform = "translate3d(0, 0, 0)";
    });
  });
})();
