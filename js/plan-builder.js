(function () {
  var services = Array.prototype.slice.call(document.querySelectorAll(".plan-service"));
  if (!services.length) return;

  var ctaText = document.getElementById("plan-cta-text");
  var incomeInput = document.getElementById("monthly-income");
  var sortableSections = Array.prototype.slice.call(document.querySelectorAll(".plan-sortable"));
  var selectedSection = document.querySelector(".plan-stack.plan-sortable");
  var recommendedSection = document.querySelector(".plan-recommend.plan-sortable");
  var planPriority = {
    "web-dev": 1,
    "marketing": 2,
    "faust-max": 3
  };
  var ASSET_BASE = "./assets/AB Test Flow/";

  function formatMXN(value) {
    var amount = Number(value) || 0;
    return "MXN " + amount.toLocaleString("en-US");
  }

  function parseMoney(raw) {
    var digits = String(raw || "").replace(/\D/g, "");
    return digits ? Number(digits) : 0;
  }

  function renderCard(card) {
    var selected = card.getAttribute("data-selected") === "true";
    var left = card.querySelector(".plan-left-state img");
    var toggle = card.querySelector(".plan-toggle");
    var toggleIcon = toggle ? toggle.querySelector("img") : null;
    if (!left || !toggle || !toggleIcon) return;

    card.classList.toggle("is-selected", selected);
    left.src = ASSET_BASE + (selected ? "check.svg" : "dash.svg");
    toggleIcon.src = ASSET_BASE + (selected ? "cross.svg" : "plus.svg");
    toggle.setAttribute("aria-label", selected ? "Excluir servicio" : "Añadir servicio");
  }

  function renderTotal() {
    if (!ctaText) return;
    var total = services.reduce(function (sum, card) {
      var selected = card.getAttribute("data-selected") === "true";
      if (!selected) return sum;
      return sum + parseMoney(card.getAttribute("data-price"));
    }, 0);

    ctaText.textContent = total > 0 ? "Unirme a Max™" : "Obtener plan por $0";
  }

  function reorderWithinSections() {
    sortableSections.forEach(function (section) {
      var cards = Array.prototype.slice.call(section.querySelectorAll(".plan-service"));
      if (cards.length <= 1) return;

      cards
        .sort(function (a, b) {
          var aSelected = a.getAttribute("data-selected") === "true" ? 1 : 0;
          var bSelected = b.getAttribute("data-selected") === "true" ? 1 : 0;
          if (aSelected !== bSelected) return bSelected - aSelected;
          var aPriority = planPriority[a.getAttribute("data-plan-id")] || 999;
          var bPriority = planPriority[b.getAttribute("data-plan-id")] || 999;
          if (aPriority !== bPriority) return aPriority - bPriority;
          var aOrder = Number(a.getAttribute("data-order") || 0);
          var bOrder = Number(b.getAttribute("data-order") || 0);
          return aOrder - bOrder;
        })
        .forEach(function (card) {
          section.appendChild(card);
        });
    });
  }

  function syncCardBucket(card) {
    if (!selectedSection || !recommendedSection) return;
    var selected = card.getAttribute("data-selected") === "true";
    if (selected) {
      card.classList.remove("recommended");
      selectedSection.appendChild(card);
    } else {
      card.classList.add("recommended");
      recommendedSection.appendChild(card);
    }
  }

  function updateRecommendedVisibility() {
    if (!recommendedSection) return;
    var cardsCount = recommendedSection.querySelectorAll(".plan-service").length;
    recommendedSection.classList.toggle("is-empty", cardsCount === 0);
  }

  sortableSections.forEach(function (section) {
    Array.prototype.slice.call(section.querySelectorAll(".plan-service")).forEach(function (card, index) {
      card.setAttribute("data-order", String(index));
    });
  });

  services.forEach(function (card) {
    renderCard(card);
    var toggle = card.querySelector(".plan-toggle");
    if (!toggle) return;
    toggle.addEventListener("click", function () {
      var selected = card.getAttribute("data-selected") === "true";
      card.setAttribute("data-selected", selected ? "false" : "true");
      renderCard(card);
      syncCardBucket(card);
      renderTotal();
      reorderWithinSections();
      updateRecommendedVisibility();
    });
  });

  if (incomeInput) {
    incomeInput.addEventListener("input", function () {
      var caretAtEnd = incomeInput.selectionStart === incomeInput.value.length;
      var amount = parseMoney(incomeInput.value);
      incomeInput.value = amount ? amount.toLocaleString("en-US") : "";
      if (caretAtEnd) {
        var end = incomeInput.value.length;
        incomeInput.setSelectionRange(end, end);
      }
    });
  }

  services.forEach(syncCardBucket);
  renderTotal();
  reorderWithinSections();
  updateRecommendedVisibility();
})();
