(function () {
  var whatsappButton = document.getElementById("whatsapp-plan-cta");
  if (!whatsappButton) return;

  var services = Array.prototype.slice.call(
    document.querySelectorAll(".plan-service")
  );
  var incomeInput = document.getElementById("monthly-income");

  function parseMoney(raw) {
    var digits = String(raw || "").replace(/\D/g, "");
    return digits ? Number(digits) : 0;
  }

  function buildServicesText(selectedServices) {
    if (selectedServices.length === 0) {
      return "los servicios básicos de Faust";
    } else if (selectedServices.length === 1) {
      return selectedServices[0];
    } else if (selectedServices.length === 2) {
      return selectedServices[0] + " y " + selectedServices[1];
    } else {
      var allButLast = selectedServices.slice(0, -1).join(", ");
      var last = selectedServices[selectedServices.length - 1];
      return allButLast + " y " + last;
    }
  }

  function buildWhatsappMessage() {
    var selectedServicesLabels = services
      .filter(function (card) {
        return card.getAttribute("data-selected") === "true";
      })
      .map(function (card) {
        var label = card.querySelector(".plan-title");
        return label
          ? label.textContent.trim()
          : card.getAttribute("data-plan-id") || "";
      })
      .filter(Boolean);

    var servicesText = buildServicesText(selectedServicesLabels);

    var amountNumber = incomeInput ? parseMoney(incomeInput.value) : 0;
    var incomeText = amountNumber
      ? amountNumber.toLocaleString("es-MX")
      : "N";

    var faustMaxSelected = services.some(function (card) {
      return (
        card.getAttribute("data-plan-id") === "faust-max" &&
        card.getAttribute("data-selected") === "true"
      );
    });

    var maxLine = faustMaxSelected
      ? "También, me gustaría aplicar al plan Max™."
      : "Por el momento, no quiero aplicar al plan Max™.";

    var message =
      "Buen día. Quisiera recibir una auditoría personalizada de faust.mx\n\n" +
      "Requiero los servicios de " + servicesText + ".\n" +
      "Mi empresa tiene un ingreso neto mensual de MX $" + incomeText + ".\n" +
      maxLine + "\n" +
      "Mi empresa es ";

    return message;
  }

  whatsappButton.addEventListener("click", function () {
    var phone = "524428767130";
    var message = buildWhatsappMessage();
    var encoded = encodeURIComponent(message);
    var url = "https://wa.me/" + phone + "?text=" + encoded;

    window.open(url, "_blank", "noopener,noreferrer");
  });
})();
