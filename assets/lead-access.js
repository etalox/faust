(function () {
  'use strict';

  // These product surfaces are reserved for confirmed Leads. It runs before
  // each protected page paints and does not depend on the component loader.
  let isLead = false;
  try {
    isLead = window.localStorage.getItem('faust-user-profile') === 'Lead';
  } catch (error) {}

  if (isLead) return;

  // Silent fallback for any protected route: return to the landing page.
  window.location.replace(new URL('../start/index.html', window.location.href).href);
})();
