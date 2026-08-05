(function () {
  'use strict';

  var storageKey = 'faustos-preferences-v1';
  var defaults = {
    period: '1m',
    aggregation: 'rolling',
    markers: true,
    advancedChart: false,
    normalizedBaseline: false,
    chartMetric: 'revenue',
    chartTransformation: false
  };

  function read() {
    try {
      var stored = JSON.parse(window.localStorage.getItem(storageKey) || '{}');
      return Object.assign({}, defaults, stored);
    } catch (error) {
      return Object.assign({}, defaults);
    }
  }

  var values = read();

  function save() {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(values));
    } catch (error) {
      // La interfaz permanece funcional si el navegador bloquea almacenamiento.
    }
  }

  window.FaustOSSettings = {
    get: function (key) { return values[key]; },
    set: function (key, value) {
      values[key] = value;
      save();
      window.dispatchEvent(new CustomEvent('faustos:setting-change', { detail: { key: key, value: value } }));
    }
  };
})();
