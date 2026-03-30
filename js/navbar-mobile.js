document.addEventListener('DOMContentLoaded', function () {
  if (window.innerWidth <= 768) {
    var navbar = document.querySelector('.figma-stage > div > div:first-child > div:last-child');
    if (navbar) {
      // Un ligero delay para permitir que las transiciones CSS de entrada se ejecuten suavemente
      setTimeout(function () {
        navbar.classList.add('navbar-visible');
      }, 100);
    }
  }
});
