function formatShort(value) {
  if (value >= 1_000_000) {
    return "$" + (value / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (value >= 1_000) {
    return "$" + (value / 1_000).toFixed(0) + "k";
  }
  return Math.round(value).toString();
}

function formatMetric(value, format, originalText) {
  if (format === "percent") {
    const sign = originalText.trim().startsWith("+") ? "+" : "";
    return sign + value.toFixed(1) + "%";
  }
  if (format === "short") {
    return formatShort(value);
  }
  // int por defecto
  return Math.round(value).toString();
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function animateMetric(el, target, duration, format, originalText) {
  const start = 0;
  const startTime = performance.now();

  return new Promise((resolve) => {
    function update(now) {
      const elapsed = now - startTime;
      const linearProgress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(linearProgress);
      const current = start + (target - start) * easedProgress;

      el.textContent = formatMetric(current, format, originalText);

      if (linearProgress < 1) {
        requestAnimationFrame(update);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(update);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const section = document.getElementById("stats-section");
  if (!section) return;

  const metrics = Array.from(section.querySelectorAll(".metric"));
  if (!metrics.length) return;

  let hasAnimatedStats = false;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasAnimatedStats) {
          hasAnimatedStats = true;

          (async () => {
            for (const el of metrics) {
              const format = el.dataset.format || "int";
              const originalText = el.textContent || "";
              const rawTarget = el.dataset.target || "0";
              const target = parseFloat(rawTarget.replace(/[^\d.]/g, "")) || 0;

              el.classList.remove("metric-final");
              el.textContent = formatMetric(0, format, originalText);

              await animateMetric(el, target, 2400, format, originalText);
            }
          })().catch(() => { });

          observer.disconnect();
        }
      });
    },
    {
      threshold: 0.4,
    }
  );

  observer.observe(section);
});
