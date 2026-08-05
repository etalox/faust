(function () {
  'use strict';

  function init() {
  if (!document.querySelector('[data-os-page="database"]')) return;

  var data = window.FaustOSData;
  var rows = document.querySelector('[data-transaction-rows]');
  var empty = document.querySelector('[data-transaction-empty]');
  var count = document.querySelector('[data-transaction-count]');
  var search = document.querySelector('[data-transaction-search]');
  var dateFilter = document.querySelector('[data-transaction-date]');
  var typeFilter = document.querySelector('[data-transaction-type]');
  var abFilter = document.querySelector('[data-transaction-ab]');
  var dateFormatter = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'medium' });

  data.articles.forEach(function (article) {
    var option = document.createElement('option');
    option.value = article;
    option.textContent = article;
    typeFilter.appendChild(option);
  });

  function filteredTransactions() {
    var query = search.value.trim().toLocaleLowerCase('es-MX');
    var age = dateFilter.value === 'all' ? null : Number(dateFilter.value) * data.day;
    var minimumTimestamp = age === null ? 0 : data.now.getTime() - age;
    return data.transactions.filter(function (transaction) {
      return transaction.timestamp >= minimumTimestamp &&
        (typeFilter.value === 'all' || transaction.article === typeFilter.value) &&
        (abFilter.value === 'all' || transaction.ab === abFilter.value) &&
        (!query || (transaction.id + ' ' + transaction.article + ' ' + transaction.ab).toLocaleLowerCase('es-MX').indexOf(query) !== -1);
    });
  }

  function renderRows() {
    var transactions = filteredTransactions();
    rows.innerHTML = transactions.map(function (transaction) {
      return '<tr><td>' + dateFormatter.format(new Date(transaction.timestamp)) + '</td><td>' + transaction.article + '</td><td>' + data.formatCurrency(transaction.netRevenue) + '</td><td><span class="ab-badge' + (transaction.ab === 'B' ? ' is-b' : '') + '">' + transaction.ab + '</span></td></tr>';
    }).join('');
    count.textContent = transactions.length + ' transacciones';
    empty.hidden = transactions.length !== 0;
  }

  function csvEscape(value) {
    return '"' + String(value).replace(/"/g, '""') + '"';
  }

  function download(format) {
    var transactions = filteredTransactions();
    var values = [['Fecha y hora', 'Tipo de artículo', 'Ingreso neto', 'A/B']].concat(transactions.map(function (transaction) {
      return [dateFormatter.format(new Date(transaction.timestamp)), transaction.article, transaction.netRevenue, transaction.ab];
    }));
    var csv = '\ufeff' + values.map(function (row) { return row.map(csvEscape).join(','); }).join('\r\n');
    var isExcel = format === 'xlsx';
    var blob = new Blob([isExcel ? '<html><head><meta charset="utf-8"></head><body><table>' + values.map(function (row, index) { return '<tr>' + row.map(function (cell) { return '<' + (index ? 'td' : 'th') + '>' + String(cell).replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</' + (index ? 'td' : 'th') + '>'; }).join('') + '</tr>'; }).join('') + '</table></body></html>' : csv], { type: isExcel ? 'application/vnd.ms-excel;charset=utf-8' : 'text/csv;charset=utf-8' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'faustos-transacciones.' + (isExcel ? 'xls' : 'csv');
    link.click();
    URL.revokeObjectURL(link.href);
  }

  document.querySelectorAll('[data-download-control]').forEach(function (control) {
    var toggle = control.querySelector('[data-download-toggle]');
    toggle.addEventListener('click', function () {
      var open = control.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    control.querySelectorAll('[data-download-format]').forEach(function (button) {
      button.addEventListener('click', function () {
        download(button.getAttribute('data-download-format'));
        control.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  });
  document.addEventListener('click', function (event) {
    if (!event.target.closest('[data-download-control]')) document.querySelectorAll('[data-download-control]').forEach(function (control) { control.classList.remove('is-open'); });
  });
  [search, dateFilter, typeFilter, abFilter].forEach(function (control) { control.addEventListener('input', renderRows); control.addEventListener('change', renderRows); });

  renderRows();
  }

  window.FaustOSDatabase = { init: init };
  if (document.querySelector('[data-os-page="database"]')) init();
})();
