(function () {
  'use strict';

  var day = 24 * 60 * 60 * 1000;
  var now = new Date();
  var seed = 8042026;
  var articles = [
    { name: 'Licencia estratégica', base: 12800, weight: .20 },
    { name: 'Servicio gestionado', base: 9150, weight: .31 },
    { name: 'Optimización de conversión', base: 6350, weight: .29 },
    { name: 'Analítica avanzada', base: 3820, weight: .20 }
  ];

  function random() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  function chooseArticle() {
    var cursor = random();
    var cumulative = 0;
    for (var index = 0; index < articles.length; index++) {
      cumulative += articles[index].weight;
      if (cursor <= cumulative) return articles[index];
    }
    return articles[articles.length - 1];
  }

  function createTransactions() {
    var transactions = [];
    for (var index = 0; index < 640; index++) {
      // Una distribución sesgada hacia hoy reproduce una fuente que crece
      // con rapidez, sin requerir entradas manuales del prototipo.
      var daysAgo = Math.floor(Math.pow(random(), 3) * 365);
      var article = chooseArticle();
      var group = random() > .47 ? 'B' : 'A';
      var variation = .78 + random() * .48;
      var uplift = group === 'B' ? 1.075 : 1;
      var timestamp = now.getTime() - daysAgo * day - Math.floor(random() * day);
      transactions.push({
        id: 'TX-' + String(index + 1).padStart(5, '0'),
        timestamp: timestamp,
        article: article.name,
        netRevenue: Math.round(article.base * variation * uplift),
        ab: group
      });
    }
    return transactions.sort(function (first, second) { return second.timestamp - first.timestamp; });
  }

  var transactions = createTransactions();

  window.FaustOSData = {
    now: now,
    day: day,
    articles: articles.map(function (article) { return article.name; }),
    transactions: transactions,
    formatCurrency: function (value) {
      return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value);
    },
    formatCompactCurrency: function (value) {
      if (value >= 1000000) return '$' + (value / 1000000).toFixed(2) + 'M';
      if (value >= 1000) return '$' + Math.round(value / 1000) + 'K';
      return this.formatCurrency(value);
    }
  };
})();
