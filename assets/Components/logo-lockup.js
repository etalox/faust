const getRootPrefixForLogo = () => {
  const path = window.location.pathname.toLowerCase();
  if (path.includes('/start/') || path.endsWith('/start') || path.includes('/careers/') || path.endsWith('/careers') || path.includes('/about/') || path.endsWith('/about')) {
    return '../';
  }
  return './';
};

class FaustLogoLockup extends HTMLElement {
  connectedCallback() {
    const rootPrefix = getRootPrefixForLogo();
    const isNav = this.hasAttribute('is-nav');
    const imgId = isNav ? 'id="nav-isotipo"' : '';
    const imgClass = isNav ? 'class="nav-logo-icon is-blue"' : '';
    const spanId = isNav ? 'id="nav-logo-text"' : '';
    const src = this.getAttribute('src') || (rootPrefix + 'assets/Logotypes/Faust Logo.svg');
    
    this.classList.add('logo-lockup');
    this.innerHTML = `
      <img ${imgId} ${imgClass} src="${src}" alt="Faust" draggable="false">
      <span ${spanId}>FaustPartners™</span>
    `;
  }
}
customElements.define('faust-logo-lockup', FaustLogoLockup);
