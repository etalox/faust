(function () {
  function loadDeferredSvgs() {
    var deferred = Array.prototype.slice.call(document.querySelectorAll("img[data-svg-src]"));
    deferred.forEach(function (img) {
      var nextSrc = img.getAttribute("data-svg-src");
      if (!nextSrc) return;
      img.setAttribute("loading", "eager");
      img.setAttribute("src", nextSrc);
      img.removeAttribute("data-svg-src");
    });
  }

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var heroRoot = document.querySelector(".hero-viewport");
  var contentRoot = document.querySelector(".figma-stage > div > div:first-child > div:nth-child(2)");
  if (!heroRoot && !contentRoot) {
    loadDeferredSvgs();
    return;
  }
  if (reducedMotion) {
    loadDeferredSvgs();
    return;
  }

  if (heroRoot) {
    var heroItems = Array.prototype.slice.call(heroRoot.querySelectorAll(".hero-reveal"));
    window.requestAnimationFrame(function () {
      heroItems.forEach(function (node) {
        node.classList.add("active");
      });
      window.setTimeout(loadDeferredSvgs, 120);
    });
  } else {
    loadDeferredSvgs();
  }

  function isRevealTarget(el) {
    if (!el || !(el instanceof HTMLElement)) return false;
    if (el.id === 'side-panel' || el.closest('#side-panel')) return false;
    if (el.matches("script,style,br")) return false;
    if (el.closest(".hero-viewport")) return false;
    if (el.closest(".ab-flow-grid")) return false;
    if (el.closest(".ab-scroll-indicator")) return false;
    if (el.closest(".navbar-talk-btn")) return false;
    if (el.closest(".ab-metrics-col") && !el.classList.contains("ab-metrics-col")) return false;
    if (el.closest(".ab-traffic-col") && !el.classList.contains("ab-traffic-col")) return false;
    if (el.closest(".ab-rule-col") && !el.classList.contains("ab-rule-col")) return false;
    var rect = el.getBoundingClientRect();
    if (rect.width < 8 || rect.height < 8) return false;
    if (
      el.matches(
        ".ab-traffic-col, .ab-metrics-col, .ab-rule-col, .ab-node-circle, .ab-split-wrap, .ab-variant-box, .ab-join-svg, .ab-arrow-svg, .ab-badge"
      )
    ) {
      return true;
    }
    if (el.matches("img,a,button,input,label")) return true;
    return el.children.length === 0;
  }

  var revealTargets = contentRoot
    ? Array.prototype.slice.call(contentRoot.querySelectorAll("*")).filter(isRevealTarget)
    : [];

  revealTargets.forEach(function (node) {
    node.classList.add("reveal-when-visible");
  });

  if (!("IntersectionObserver" in window)) {
    revealTargets.forEach(function (node) {
      node.classList.add("active");
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("active");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
  );

  revealTargets.forEach(function (node) {
    observer.observe(node);
  });
})();
