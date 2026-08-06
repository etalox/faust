(function () {
  'use strict';

  // These product surfaces are reserved for confirmed Leads. It runs before
  // each protected page paints and does not depend on the component loader.
  const campaignUntil = Date.parse(
    window.FAUST_TALENT_CAMPAIGN_UNTIL || '2026-08-08T07:27:04.000Z'
  );
  const isTalentCampaignActive = Number.isFinite(campaignUntil) && Date.now() < campaignUntil;
  let isLead = false;
  try {
    isLead = !isTalentCampaignActive && window.localStorage.getItem('faust-user-profile') === 'Lead';
  } catch (error) {}

  if (isLead) return;

  // Silent fallback for any protected route: return to the landing page.
  window.location.replace(new URL('../start/index.html', window.location.href).href);
})();
