(() => {
  const CONSENT_KEY = "faust_cookie_consent_v1";
  const CONSENT_VERSION = "2026-04-27";
  const DEFAULT_ANALYTICS = false;
  const GA_MEASUREMENT_ID = window.FAUST_GA_MEASUREMENT_ID || "";
  const GTM_ID = window.FAUST_GTM_ID || "";

  let analyticsSelected = DEFAULT_ANALYTICS;
  let gtmLoaded = false;
  let bannerEl = null;
  let manageEl = null;
  let customizerEl = null;
  let analyticsSwitchEl = null;

  function safeStorageGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function safeStorageSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch (error) {
      return false;
    }
  }

  function readStoredConsent() {
    const raw = safeStorageGet(CONSENT_KEY);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed.analytics !== "boolean") return null;
      return parsed;
    } catch (error) {
      return null;
    }
  }

  function setSwitchState(isOn) {
    analyticsSelected = Boolean(isOn);
    if (!analyticsSwitchEl) return;
    analyticsSwitchEl.classList.toggle("is-on", analyticsSelected);
    analyticsSwitchEl.setAttribute("aria-checked", analyticsSelected ? "true" : "false");
  }

  function ensureGtm() {
    if (gtmLoaded || !GTM_ID) return;

    gtmLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });

    const firstScript = document.getElementsByTagName("script")[0];
    const gtmScript = document.createElement("script");
    gtmScript.async = true;
    gtmScript.src = "https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(GTM_ID);
    firstScript.parentNode.insertBefore(gtmScript, firstScript);
  }

  function applyGoogleConsent(analyticsEnabled) {
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        analytics_storage: analyticsEnabled ? "granted" : "denied"
      });

      if (analyticsEnabled && GA_MEASUREMENT_ID) {
        window.gtag("config", GA_MEASUREMENT_ID, {
          anonymize_ip: true,
          allow_google_signals: false,
          allow_ad_personalization_signals: false
        });
      }
    }

    if (analyticsEnabled) {
      ensureGtm();
    }
  }

  function persistConsent(analyticsEnabled, source) {
    safeStorageSet(
      CONSENT_KEY,
      JSON.stringify({
        analytics: analyticsEnabled,
        source: source,
        version: CONSENT_VERSION,
        timestamp: new Date().toISOString()
      })
    );
  }

  function showBanner() {
    if (!bannerEl) return;
    bannerEl.classList.add("is-visible");
    if (manageEl) manageEl.classList.remove("is-visible");
  }

  function hideBanner() {
    if (!bannerEl) return;
    bannerEl.classList.remove("is-visible");
    if (manageEl) manageEl.classList.add("is-visible");
  }

  function setConsentAndClose(analyticsEnabled, source) {
    persistConsent(analyticsEnabled, source);
    applyGoogleConsent(analyticsEnabled);
    hideBanner();
  }

  function buildUI() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <section class="faust-consent-banner" id="faust-consent-banner" role="dialog" aria-live="polite" aria-label="Preferencias de privacidad y cookies">
        <h2 class="faust-consent-title">Privacidad y uso de datos</h2>
        <p class="faust-consent-description">
          Usamos cookies y tecnologías similares para operar el sitio y, con su autorización, medir tráfico con herramientas de analítica.
          Puede cambiar sus preferencias en cualquier momento.
        </p>
        <div class="faust-consent-links">
          <a class="faust-consent-link" href="mailto:admin@faust.mx?subject=Aviso%20de%20Privacidad%20Faust%20Partners">Solicitar Aviso de Privacidad</a>
          <a class="faust-consent-link" href="mailto:admin@faust.mx?subject=Politica%20de%20Cookies%20Faust%20Partners">Solicitar Política de Cookies</a>
        </div>
        <div class="faust-consent-actions">
          <button type="button" class="faust-consent-btn faust-consent-btn-primary" data-consent-action="accept-all">Aceptar todo</button>
          <button type="button" class="faust-consent-btn faust-consent-btn-ghost" data-consent-action="reject-all">Rechazar no esenciales</button>
          <button type="button" class="faust-consent-btn" data-consent-action="customize">Personalizar</button>
        </div>
        <div class="faust-consent-customizer" id="faust-consent-customizer">
          <div class="faust-consent-row">
            <div>
              <p class="faust-consent-row-title">Cookies necesarias</p>
              <p class="faust-consent-row-note">Siempre activas para funcionalidad y seguridad.</p>
            </div>
            <span class="faust-consent-switch is-on is-locked" aria-hidden="true"></span>
          </div>
          <div class="faust-consent-row">
            <div>
              <p class="faust-consent-row-title">Cookies analíticas</p>
              <p class="faust-consent-row-note">Nos ayudan a medir rendimiento y mejorar la experiencia.</p>
            </div>
            <button type="button" class="faust-consent-switch" id="faust-analytics-switch" role="switch" aria-checked="false" aria-label="Activar cookies analíticas"></button>
          </div>
          <div class="faust-consent-actions">
            <button type="button" class="faust-consent-btn faust-consent-btn-primary" data-consent-action="save-custom">Guardar preferencias</button>
          </div>
        </div>
      </section>
      <button type="button" class="faust-consent-manage" id="faust-consent-manage">Preferencias de cookies</button>
    `;

    document.body.appendChild(wrapper);

    bannerEl = document.getElementById("faust-consent-banner");
    manageEl = document.getElementById("faust-consent-manage");
    customizerEl = document.getElementById("faust-consent-customizer");
    analyticsSwitchEl = document.getElementById("faust-analytics-switch");

    const acceptBtn = bannerEl.querySelector('[data-consent-action="accept-all"]');
    const rejectBtn = bannerEl.querySelector('[data-consent-action="reject-all"]');
    const customizeBtn = bannerEl.querySelector('[data-consent-action="customize"]');
    const saveBtn = bannerEl.querySelector('[data-consent-action="save-custom"]');

    acceptBtn.addEventListener("click", () => setConsentAndClose(true, "accept_all"));
    rejectBtn.addEventListener("click", () => setConsentAndClose(false, "reject_non_essential"));
    customizeBtn.addEventListener("click", () => {
      customizerEl.classList.toggle("is-open");
    });
    saveBtn.addEventListener("click", () => setConsentAndClose(analyticsSelected, "customized"));

    analyticsSwitchEl.addEventListener("click", () => {
      setSwitchState(!analyticsSelected);
    });

    manageEl.addEventListener("click", () => {
      customizerEl.classList.add("is-open");
      showBanner();
    });
  }

  function init() {
    buildUI();

    const stored = readStoredConsent();
    if (stored) {
      setSwitchState(stored.analytics);
      applyGoogleConsent(stored.analytics);
      hideBanner();
      return;
    }

    setSwitchState(DEFAULT_ANALYTICS);
    showBanner();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
