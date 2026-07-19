const menuButton = document.querySelector('.menu-button');
const drawer = document.querySelector('.drawer');
menuButton?.addEventListener('click', () => {
  const open = !drawer.classList.contains('open');
  drawer.classList.toggle('open', open);
  drawer.setAttribute('aria-hidden', String(!open));
  menuButton.setAttribute('aria-expanded', String(open));
});
drawer?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => menuButton?.click()));

document.querySelector('.search-form')?.addEventListener('submit', event => {
  event.preventDefault();
});
