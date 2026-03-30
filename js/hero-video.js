window.addEventListener('load', () => {
  const video = document.getElementById('hero-bg-video');
  if (!video) {
    console.warn('No se encontró #hero-bg-video');
    return;
  }

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  video.src = isMobile
    ? './assets/hero_mobile.mp4'
    : './assets/hero_desktop.mp4';

  // Iniciamos carga
  video.load();

  const showVideo = () => {
    // Si autoplay falla, al menos hacemos visible el frame cargado
    video.classList.add('is-ready');
  };

  // Si puede reproducirse sin cortes
  video.addEventListener('canplaythrough', () => {
    video.play().then(showVideo).catch((err) => {
      console.warn('Autoplay bloqueado, muestro frame estático:', err);
      showVideo();
    });
  }, { once: true });

  // Fallback: si por alguna razón no dispara canplaythrough, forzamos visibilidad
  setTimeout(() => {
    if (!video.classList.contains('is-ready')) {
      console.warn('Timeout: forzando visibilidad del video');
      showVideo();
    }
  }, 4000);
});
