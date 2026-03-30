(function () {
  var flowMain = document.querySelector(".ab-flow-main");
  var indicator = document.querySelector(".ab-scroll-indicator");
  if (!flowMain || !indicator) return;
  var thumb = indicator.querySelector(".ab-scroll-thumb");
  if (!thumb) return;

  function updateFlowIndicator() {
    var trackWidth = indicator.clientWidth;
    var maxScroll = Math.max(0, flowMain.scrollWidth - flowMain.clientWidth);
    if (!trackWidth) return;

    if (maxScroll <= 0) {
      thumb.style.width = "100%";
      thumb.style.transform = "translateX(0px)";
      return;
    }

    var visibleRatio = flowMain.clientWidth / flowMain.scrollWidth;
    var thumbWidth = Math.max(28, Math.min(trackWidth, trackWidth * visibleRatio));
    var maxThumbShift = trackWidth - thumbWidth;
    var thumbShift = (flowMain.scrollLeft / maxScroll) * maxThumbShift;

    thumb.style.width = thumbWidth + "px";
    thumb.style.transform = "translateX(" + thumbShift + "px)";
  }

  flowMain.addEventListener("scroll", updateFlowIndicator, { passive: true });
  window.addEventListener("resize", updateFlowIndicator);
  window.addEventListener("load", updateFlowIndicator);
  updateFlowIndicator();
})();
