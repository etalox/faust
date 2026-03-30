(function () {
  const root = document.documentElement;
  const stage = document.getElementById('figma-stage');
  const panel = document.getElementById('side-panel');
  const HOLD_VISIBLE_MS = 400;
  const FADE_IN_DURATION_MS = 260;
  const FADE_OUT_DURATION_MS = 800;
  let hideTimer = null;
  let rafId = 0;
  let lastTs = 0;
  let current = 0;
  let target = 0;

  function setVisibility(value) {
    root.style.setProperty('--sb-v', value.toFixed(3));
  }

  function animateFrame(ts) {
    if (!lastTs) lastTs = ts;
    const dt = ts - lastTs;
    lastTs = ts;
    const duration = target > current ? FADE_IN_DURATION_MS : FADE_OUT_DURATION_MS;
    const step = dt / duration;

    if (Math.abs(target - current) <= step) {
      current = target;
    } else {
      current += target > current ? step : -step;
    }

    setVisibility(current);

    if (current !== target) {
      rafId = requestAnimationFrame(animateFrame);
      return;
    }

    rafId = 0;
    lastTs = 0;
  }

  function animateTo(next) {
    target = next;
    if (!rafId) {
      rafId = requestAnimationFrame(animateFrame);
    }
  }

  function onScrollActivity() {
    animateTo(1);
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(function () {
      hideTimer = null;
      animateTo(0);
    }, HOLD_VISIBLE_MS);
  }

  setVisibility(0);

  window.addEventListener('scroll', onScrollActivity, { passive: true });
  window.addEventListener('wheel', onScrollActivity, { passive: true });
  window.addEventListener('touchmove', onScrollActivity, { passive: true });

  if (stage) {
    stage.addEventListener('scroll', onScrollActivity, { passive: true });
  }

  if (panel) {
    panel.addEventListener('scroll', onScrollActivity, { passive: true });
  }
})();
