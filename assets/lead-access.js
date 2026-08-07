(function () {
  'use strict';

  // These product surfaces are reserved for confirmed Leads. It runs before
  // each protected page paints and does not depend on the component loader.
  const facebookEntryKey = 'faust-profile-facebook-entry';
  const isFacebookEntry = () => {
    try {
      if (window.sessionStorage.getItem(facebookEntryKey) === '1') return true;
      const params = new URLSearchParams(window.location.search);
      const utmSource = (params.get('utm_source') || '').trim().toLowerCase();
      const hasSource = /^(facebook|fb|meta)$/.test(utmSource) || params.has('fbclid');
      let hasReferrer = false;
      if (document.referrer) {
        const hostname = new URL(document.referrer).hostname.toLowerCase();
        hasReferrer = hostname === 'facebook.com' || hostname.endsWith('.facebook.com') ||
          hostname === 'fb.com' || hostname.endsWith('.fb.com') ||
          hostname === 'messenger.com' || hostname.endsWith('.messenger.com');
      }
      const detected = hasSource || hasReferrer;
      if (detected) window.sessionStorage.setItem(facebookEntryKey, '1');
      return detected;
    } catch (error) {
      return false;
    }
  };
  const enteredFromFacebook = isFacebookEntry();
  let isLead = false;
  try {
    const storedProfile = window.localStorage.getItem('faust-user-profile');
    if (enteredFromFacebook && storedProfile !== 'Lead') {
      window.localStorage.setItem('faust-user-profile', 'Talento');
      window.localStorage.setItem('faust-user-role', 'Talento');
    }
    isLead = storedProfile === 'Lead';
  } catch (error) {}

  if (isLead) return;

  // Silent fallback for any protected route: return to the landing page.
  window.location.replace(new URL('../start/index.html', window.location.href).href);
})();
