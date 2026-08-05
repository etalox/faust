(function () {
  'use strict';

  var mark = document.querySelector('.os-loading-mark');
  if (!mark) return;

  function syncLoaderViewport() {
    var viewport = window.visualViewport;
    var width = viewport ? viewport.width : window.innerWidth;
    var height = viewport ? viewport.height : window.innerHeight;
    var offsetLeft = viewport ? viewport.offsetLeft : 0;
    var offsetTop = viewport ? viewport.offsetTop : 0;
    var isMobile = width < 768;
    document.documentElement.classList.toggle('os-loader-mobile', isMobile);

    if (!isMobile) {
      mark.style.removeProperty('width');
      mark.style.removeProperty('left');
      mark.style.removeProperty('top');
      return;
    }

    mark.style.width = Math.max(200, width - 32) + 'px';
    mark.style.left = (offsetLeft + width / 2) + 'px';
    mark.style.top = (offsetTop + height / 2) + 'px';
  }

  syncLoaderViewport();
  window.addEventListener('resize', syncLoaderViewport);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', syncLoaderViewport);
})();
