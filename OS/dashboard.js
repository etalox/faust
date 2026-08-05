(function () {
  'use strict';

  function init() {
  if (!document.querySelector('[data-os-page="dashboard"]')) return;

  // Cada hito representa una tendencia de negocio; se densifica antes de dibujar
  // para que el trazo tenga resolución de producto sin perder su suavidad.
  function detailedSeries(keyframes, samplesPerSegment, variation) {
    var series = [];
    for (var index = 0; index < keyframes.length - 1; index++) {
      var start = keyframes[index];
      var end = keyframes[index + 1];
      for (var sample = 0; sample < samplesPerSegment; sample++) {
        var progress = sample / samplesPerSegment;
        var eased = progress * progress * (3 - 2 * progress);
        var ripple = Math.sin(progress * Math.PI) * Math.sin((index + 1) * 1.73 + progress * 4.1) * variation;
        series.push(start + (end - start) * eased + ripple);
      }
    }
    series.push(keyframes[keyframes.length - 1]);
    return normalizeSeries(series, 81);
  }

  function normalizeSeries(values, targetLength) {
    if (values.length === targetLength) return values;

    var normalized = [];
    for (var index = 0; index < targetLength; index++) {
      var sourceIndex = (index / (targetLength - 1)) * (values.length - 1);
      var lowerIndex = Math.floor(sourceIndex);
      var upperIndex = Math.ceil(sourceIndex);
      var progress = sourceIndex - lowerIndex;
      normalized.push(values[lowerIndex] + (values[upperIndex] - values[lowerIndex]) * progress);
    }
    return normalized;
  }

  var periods = {
    '1m': {
      values: detailedSeries([1.862, 1.861, 1.863, 1.872, 1.895, 1.918, 1.932, 1.939, 1.933, 1.920, 1.907, 1.898, 1.892, 1.897, 1.915, 1.944, 1.973], 5, .00145),
      labels: ['Semana 1', '', 'Semana 2', '', 'Semana 3', '', 'Semana 4', '', 'Hoy'],
      primary: '$1,900,412', total: '$2.4M', conversion: '+25.7%', tests: '4'
    },
    '3m': {
      values: detailedSeries([1.746, 1.759, 1.752, 1.771, 1.789, 1.803, 1.817, 1.809, 1.831, 1.846, 1.861, 1.853, 1.874, 1.892, 1.908, 1.926, 1.914, 1.941, 1.958, 1.973], 4, .00185),
      labels: [],
      primary: '$1,118,904', total: '$3.8M', conversion: '+17.2%', tests: '7'
    },
    '6m': {
      values: detailedSeries([1.702, 1.716, 1.728, 1.719, 1.742, 1.758, 1.777, 1.766, 1.793, 1.812, 1.829, 1.818, 1.846, 1.864, 1.852, 1.878, 1.895, 1.918, 1.939, 1.958, 1.973], 4, .00175),
      labels: [],
      primary: '$1,527,300', total: '$5.6M', conversion: '+21.4%', tests: '10'
    },
    '1y': {
      values: detailedSeries([1.676, 1.692, 1.718, 1.703, 1.749, 1.781, 1.756, 1.809, 1.846, 1.834, 1.888, 1.914], 7, .0026),
      labels: ['Ene', '', 'Mar', '', 'May', '', 'Jul', '', 'Sep', '', 'Nov', 'Hoy'],
      primary: '$1,900,412', total: '$8.7M', conversion: '+25.7%', tests: '12'
    }
  };

  var linePaths = document.querySelectorAll('[data-chart-line]');
  var controlLine = document.querySelector('[data-chart-line-a]');
  var monthGuides = document.querySelector('[data-chart-month-guides]');
  var chartSection = document.querySelector('.revenue-chart');
  var areaPaths = document.querySelectorAll('[data-chart-area]');
  var positiveDiffArea = document.querySelector('[data-chart-diff-positive]');
  var negativeDiffArea = document.querySelector('[data-chart-diff-negative]');
  var positiveHoverDiffArea = document.querySelector('[data-chart-hover-diff-positive]');
  var negativeHoverDiffArea = document.querySelector('[data-chart-hover-diff-negative]');
  var positiveDiffGradient = document.querySelector('[data-chart-diff-gradient="positive"]');
  var negativeDiffGradient = document.querySelector('[data-chart-diff-gradient="negative"]');
  var negativeLineGradient = document.querySelector('[data-chart-negative-line-gradient]');
  var lossAlert = document.querySelector('[data-chart-loss-alert]');
  var lossAlertCopy = document.querySelector('.chart-loss-alert-copy');
  var criticalHoverFill = document.querySelector('[data-chart-critical-hover-fill]');
  var notificationsList = document.querySelector('[data-notifications-list]');
  var notificationsCount = document.querySelector('[data-notifications-count]');
  var advancedPositiveLines = document.querySelectorAll('[data-chart-advanced-positive]');
  var advancedNegativeLine = document.querySelector('[data-chart-advanced-negative]');
  var advancedEntryClip = document.querySelector('[data-chart-advanced-entry-clip]');
  var stage = document.querySelector('.chart-stage');
  var labelsElement = document.querySelector('[data-chart-labels]');
  var hitArea = document.querySelector('[data-chart-hit]');
  var guide = document.querySelector('[data-chart-guide]');
  var horizontalGuide = document.querySelector('[data-chart-guide-horizontal]');
  var normalizedBaselineGuide = document.querySelector('[data-chart-normalized-baseline]');
  var lineLight = document.querySelector('[data-chart-light]');
  var lineLightGlow = document.querySelector('[data-chart-light-glow]');
  var criticalLineLight = document.querySelector('[data-chart-light-critical]');
  var hoverGradient = document.getElementById('os-hover-line');
  var criticalHoverGradient = document.getElementById('os-hover-line-critical');
  var positiveHoverDiffGradient = document.getElementById('os-hover-diff-positive');
  var negativeHoverDiffGradient = document.getElementById('os-hover-diff-negative');
  var tooltip = document.querySelector('[data-chart-tooltip]');
  var tooltipLabel = document.querySelector('[data-tooltip-label]');
  var tooltipValueB = document.querySelector('[data-tooltip-value-b]');
  var tooltipValueA = document.querySelector('[data-tooltip-value-a]');
  var status = document.querySelector('[data-chart-status]');
  var osTabs = document.querySelector('.os-tabs');
  var annotations = document.querySelector('.chart-annotations');
  var chartSvg = document.querySelector('.chart-svg');
  var yAxis = document.querySelector('.chart-y-axis');
  var yAxisTickCount = yAxis ? yAxis.querySelectorAll('span').length : 0;
  var yAxisTicks = [];
  var yAxisStep = .05;
  var axisWindowState = null;
  var currentPeriod = '1m';
  var currentAggregation = 'rolling';
  var width = 1200;
  var height = 360;
  var yMin = 1.65;
  var yMax = 2.00;
  var chartView = { zoom: 1, pan: 0 };
  var dragState = null;
  // La vista se mantiene estable: por ahora sólo se navega por periodos.
  var interactiveNavigationEnabled = false;
  var chartInterpolationTimer = null;
  var chartViewTransitionTimer = null;
  var chartViewEntranceTimer = null;
  var advancedEntryFrame = null;
  var currentLossInfo = null;
  var hoveredCriticalRunKey = null;
  var hoveredCriticalRun = null;
  var alertCriticalRunKey = null;
  var persistentCriticalRun = null;
  var historicalAlertKey = null;
  var historicalAlertTimer = null;
  var preserveAlertPresentationOnNextRender = false;
  var hoverState = { targetClientX: null, targetClientY: null, currentClientX: null, frame: 0 };
  var crosshairState = { targetClientX: null, targetClientY: null, currentClientX: null, currentClientY: null, frame: 0 };
  var lastPointerPosition = window.__faustosLastPointer;
  // Una lente vertical local: amplía la zona inspeccionada, pero conserva los
  // límites superior e inferior del rango dentro del gráfico.
  var autoZoomState = { intensity: 0, targetIntensity: 0, focusValue: .5, targetFocusValue: .5, frame: 0 };
  var controlZoomActive = false;
  var data = window.FaustOSData;
  var preferences = window.FaustOSSettings;
  var transactions = data ? data.transactions : [];
  var chartNow = data ? data.now : new Date();
  var clientConfig = window.FaustOSClientConfig || {};
  var revShareRate = clamp(typeof clientConfig.revShareRate === 'number' ? clientConfig.revShareRate : .25, 0, .95);
  // En producción este dato llega del registro de exposición por experimento,
  // no de las transacciones. El valor por defecto replica la asignación del
  // dataset demostrativo y puede sustituirse por una línea de tiempo real.
  var defaultControlAudienceShare = clamp(typeof clientConfig.controlAudienceShare === 'number' ? clientConfig.controlAudienceShare : .47, .01, .99);
  var periodDurations = {
    '1m': 30 * 24 * 60 * 60 * 1000,
    '3m': 91 * 24 * 60 * 60 * 1000,
    '6m': 182 * 24 * 60 * 60 * 1000,
    '1y': 365 * 24 * 60 * 60 * 1000
  };

  function preference(key, fallback) {
    return preferences && preferences.get(key) !== undefined ? preferences.get(key) : fallback;
  }

  function savePreference(key, value) {
    if (preferences) preferences.set(key, value);
  }

  var storedPeriod = preference('period', '1m');
  if (Object.prototype.hasOwnProperty.call(periodDurations, storedPeriod)) currentPeriod = storedPeriod;
  currentAggregation = preference('aggregation', 'rolling') === 'cumulative' ? 'cumulative' : 'rolling';
  var chartMetric = preference('chartMetric', 'revenue') === 'conversion' ? 'conversion' : 'revenue';
  var chartEvents = [
    { label: 'A/B', timestamp: chartNow.getTime() - 15 * 24 * 60 * 60 * 1000 },
    { label: 'A/B', timestamp: chartNow.getTime() - 5 * 24 * 60 * 60 * 1000 },
    { label: 'A/B', timestamp: chartNow.getTime() - 2.5 * 24 * 60 * 60 * 1000 }
  ];

  function focalYFor(value) {
    var range = Math.max(.0001, yMax - yMin);
    var normalized = clamp((value - yMin) / range, 0, 1);
    var focus = clamp(autoZoomState.focusValue, .02, .98);
    var distance = normalized - focus;
    var spread = .22;
    // La corrección se anula en los extremos: el valor mínimo y el máximo no
    // salen nunca del área visible, mientras el entorno del foco gana detalle.
    var edgeProtection = Math.sin(Math.PI * normalized);
    var localWeight = Math.exp(-(distance * distance) / (2 * spread * spread));
    var warped = clamp(normalized + autoZoomState.intensity * edgeProtection * distance * localWeight, 0, 1);
    return height - warped * height;
  }

  function linearYFor(value) {
    return height - ((value - yMin) / Math.max(.0001, yMax - yMin)) * height;
  }

  function pointFor(value, index, length) {
    return {
      x: length === 1 ? width / 2 : (index / (length - 1)) * width,
      y: focalYFor(value)
    };
  }

  function smoothPath(values) {
    var points = values.map(function (value, index) { return pointFor(value, index, values.length); });
    if (points.length < 2) return '';
    var d = 'M ' + points[0].x.toFixed(2) + ' ' + points[0].y.toFixed(2);
    for (var i = 0; i < points.length - 1; i++) {
      var current = points[i];
      var next = points[i + 1];
      var previous = points[i - 1] || current;
      var after = points[i + 2] || next;
      var cp1x = current.x + (next.x - previous.x) / 6;
      var cp1y = current.y + (next.y - previous.y) / 6;
      var cp2x = next.x - (after.x - current.x) / 6;
      var cp2y = next.y - (after.y - current.y) / 6;
      d += ' C ' + cp1x.toFixed(2) + ' ' + cp1y.toFixed(2) + ', ' + cp2x.toFixed(2) + ' ' + cp2y.toFixed(2) + ', ' + next.x.toFixed(2) + ' ' + next.y.toFixed(2);
    }
    return d;
  }

  function valueAt(values, normalizedPosition) {
    var position = clamp(normalizedPosition, 0, 1) * (values.length - 1);
    var lower = Math.floor(position);
    var upper = Math.ceil(position);
    var progress = position - lower;
    return values[lower] + (values[upper] - values[lower]) * progress;
  }

  function visibleSeries(values) {
    var sampleCount = 81;
    var span = 1 / chartView.zoom;
    var series = [];
    for (var index = 0; index < sampleCount; index++) {
      series.push(valueAt(values, chartView.pan + (index / (sampleCount - 1)) * span));
    }
    return series;
  }

  function smoothPointPath(points, moveTo) {
    if (!points.length) return '';
    var path = (moveTo ? 'M ' : 'L ') + points[0].x.toFixed(2) + ' ' + points[0].y.toFixed(2);
    for (var index = 0; index < points.length - 1; index++) {
      var current = points[index];
      var next = points[index + 1];
      var previous = points[index - 1] || current;
      var after = points[index + 2] || next;
      var cp1x = current.x + (next.x - previous.x) / 6;
      var cp1y = current.y + (next.y - previous.y) / 6;
      var cp2x = next.x - (after.x - current.x) / 6;
      var cp2y = next.y - (after.y - current.y) / 6;
      path += ' C ' + cp1x.toFixed(2) + ' ' + cp1y.toFixed(2) + ', ' + cp2x.toFixed(2) + ' ' + cp2y.toFixed(2) + ', ' + next.x.toFixed(2) + ' ' + next.y.toFixed(2);
    }
    return path;
  }

  function lerpPoint(first, second, amount) {
    return { x: first.x + (second.x - first.x) * amount, y: first.y + (second.y - first.y) * amount };
  }

  function smoothSegment(points, index) {
    var current = points[index];
    var next = points[index + 1];
    var previous = points[index - 1] || current;
    var after = points[index + 2] || next;
    return {
      p0: current,
      c1: { x: current.x + (next.x - previous.x) / 6, y: current.y + (next.y - previous.y) / 6 },
      c2: { x: next.x - (after.x - current.x) / 6, y: next.y - (after.y - current.y) / 6 },
      p1: next
    };
  }

  function splitCubic(segment, amount) {
    var first = lerpPoint(segment.p0, segment.c1, amount);
    var second = lerpPoint(segment.c1, segment.c2, amount);
    var third = lerpPoint(segment.c2, segment.p1, amount);
    var fourth = lerpPoint(first, second, amount);
    var fifth = lerpPoint(second, third, amount);
    var crossing = lerpPoint(fourth, fifth, amount);
    return [
      { p0: segment.p0, c1: first, c2: fourth, p1: crossing },
      { p0: crossing, c1: fifth, c2: third, p1: segment.p1 }
    ];
  }

  function cubicLinePath(segment) {
    if (!segment) return '';
    return 'M ' + segment.p0.x.toFixed(2) + ' ' + segment.p0.y.toFixed(2) + ' C ' + segment.c1.x.toFixed(2) + ' ' + segment.c1.y.toFixed(2) + ', ' + segment.c2.x.toFixed(2) + ' ' + segment.c2.y.toFixed(2) + ', ' + segment.p1.x.toFixed(2) + ' ' + segment.p1.y.toFixed(2);
  }

  function collapsedLinePath(point) {
    var value = point.x.toFixed(2) + ' ' + point.y.toFixed(2);
    return 'M ' + value + ' C ' + value + ', ' + value + ', ' + value;
  }

  function cubicAreaPath(actualSegment, baselineSegment, collapsePoint) {
    if (!actualSegment || !baselineSegment) {
      var collapsed = collapsedLinePath(collapsePoint);
      return collapsed + ' L ' + collapsePoint.x.toFixed(2) + ' ' + collapsePoint.y.toFixed(2) + ' C ' + collapsePoint.x.toFixed(2) + ' ' + collapsePoint.y.toFixed(2) + ', ' + collapsePoint.x.toFixed(2) + ' ' + collapsePoint.y.toFixed(2) + ', ' + collapsePoint.x.toFixed(2) + ' ' + collapsePoint.y.toFixed(2) + ' Z';
    }
    return cubicLinePath(actualSegment) + ' L ' + baselineSegment.p1.x.toFixed(2) + ' ' + baselineSegment.p1.y.toFixed(2) + ' C ' + baselineSegment.c2.x.toFixed(2) + ' ' + baselineSegment.c2.y.toFixed(2) + ', ' + baselineSegment.c1.x.toFixed(2) + ' ' + baselineSegment.c1.y.toFixed(2) + ', ' + baselineSegment.p0.x.toFixed(2) + ' ' + baselineSegment.p0.y.toFixed(2) + ' Z';
  }

  function advancedDifferentialPaths(actualValues, baselineValues) {
    var count = Math.min(actualValues.length, baselineValues.length);
    var actualPoints = actualValues.slice(0, count).map(function (value, index) { return pointFor(value, index, count); });
    var baselinePoints = baselineValues.slice(0, count).map(function (value, index) { return pointFor(value, index, count); });
    var paths = { positiveArea: '', negativeArea: '', positiveLine: '', negativeLine: '' };
    var epsilon = .0000001;

    for (var index = 0; index < count - 1; index++) {
      var actualSegment = smoothSegment(actualPoints, index);
      var baselineSegment = smoothSegment(baselinePoints, index);
      var differenceStart = actualValues[index] - baselineValues[index];
      var differenceEnd = actualValues[index + 1] - baselineValues[index + 1];
      var positiveActual = null;
      var positiveBaseline = null;
      var negativeActual = null;
      var negativeBaseline = null;

      if (differenceStart * differenceEnd < -epsilon) {
        var crossing = differenceStart / (differenceStart - differenceEnd);
        var actualParts = splitCubic(actualSegment, crossing);
        var baselineParts = splitCubic(baselineSegment, crossing);
        if (differenceStart > 0) {
          positiveActual = actualParts[0]; positiveBaseline = baselineParts[0];
          negativeActual = actualParts[1]; negativeBaseline = baselineParts[1];
        } else {
          negativeActual = actualParts[0]; negativeBaseline = baselineParts[0];
          positiveActual = actualParts[1]; positiveBaseline = baselineParts[1];
        }
      } else if ((Math.abs(differenceStart) > epsilon ? differenceStart : differenceEnd) >= 0) {
        positiveActual = actualSegment; positiveBaseline = baselineSegment;
      } else {
        negativeActual = actualSegment; negativeBaseline = baselineSegment;
      }

      paths.positiveArea += cubicAreaPath(positiveActual, positiveBaseline, actualSegment.p0) + ' ';
      paths.negativeArea += cubicAreaPath(negativeActual, negativeBaseline, actualSegment.p0) + ' ';
      paths.positiveLine += (positiveActual ? cubicLinePath(positiveActual) : collapsedLinePath(actualSegment.p0)) + ' ';
      paths.negativeLine += (negativeActual ? cubicLinePath(negativeActual) : collapsedLinePath(actualSegment.p0)) + ' ';
    }
    return paths;
  }

  function cubicCoordinate(first, second, third, fourth, amount) {
    var inverse = 1 - amount;
    return inverse * inverse * inverse * first + 3 * inverse * inverse * amount * second + 3 * inverse * amount * amount * third + amount * amount * amount * fourth;
  }

  function cubicYAtX(segment, targetX) {
    var lower = 0;
    var upper = 1;
    for (var iteration = 0; iteration < 12; iteration++) {
      var midpoint = (lower + upper) / 2;
      if (cubicCoordinate(segment.p0.x, segment.c1.x, segment.c2.x, segment.p1.x, midpoint) < targetX) lower = midpoint;
      else upper = midpoint;
    }
    var amount = (lower + upper) / 2;
    return cubicCoordinate(segment.p0.y, segment.c1.y, segment.c2.y, segment.p1.y, amount);
  }

  function applyGradientStops(gradient, opacityValues, colors) {
    var stops = gradient.__chartStops;
    if (!stops || stops.length !== opacityValues.length) {
      var fragment = document.createDocumentFragment();
      stops = [];
      for (var index = 0; index < opacityValues.length; index++) {
        var stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop.setAttribute('offset', (index / (opacityValues.length - 1)).toFixed(4));
        fragment.appendChild(stop);
        stops.push(stop);
      }
      gradient.replaceChildren(fragment);
      gradient.__chartStops = stops;
    }
    stops.forEach(function (stop, index) {
      stop.setAttribute('stop-color', colors[index]);
      stop.setAttribute('stop-opacity', opacityValues[index].toFixed(3));
    });
  }

  function updateOpacityGradient(gradient, opacityValues, colors) {
    if (!gradient) return;
    var previous = gradient.__chartOpacityValues;
    var canInterpolate = preference('chartTransformation', false) === true && previous && previous.length === opacityValues.length;
    if (gradient.__chartOpacityFrame) window.cancelAnimationFrame(gradient.__chartOpacityFrame);

    if (!canInterpolate) {
      gradient.__chartOpacityValues = opacityValues.slice();
      applyGradientStops(gradient, opacityValues, colors);
      return;
    }

    var initial = previous.slice();
    var startedAt = window.performance.now();
    function animateOpacity(now) {
      var progress = Math.min(1, (now - startedAt) / 450);
      var eased = progress * progress * (3 - 2 * progress);
      var current = opacityValues.map(function (value, index) { return initial[index] + (value - initial[index]) * eased; });
      gradient.__chartOpacityValues = current;
      applyGradientStops(gradient, current, colors);
      if (progress < 1) gradient.__chartOpacityFrame = window.requestAnimationFrame(animateOpacity);
      else gradient.__chartOpacityFrame = null;
    }
    gradient.__chartOpacityFrame = window.requestAnimationFrame(animateOpacity);
  }

  function lossRuns(actualValues, baselineValues, metricActualValues, metricBaselineValues, useMetricLossState) {
    var count = Math.min(actualValues.length, baselineValues.length);
    var result = { runs: [], criticalPixels: new Array(width + 1).fill(false), actualSegments: [], baselineSegments: [], count: count };
    if (count < 2) return result;
    var actualPoints = actualValues.slice(0, count).map(function (value, index) { return pointFor(value, index, count); });
    var baselinePoints = baselineValues.slice(0, count).map(function (value, index) { return pointFor(value, index, count); });
    var activeRun = null;
    var visibleDays = currentPeriodWindow().duration / chartView.zoom / 86400000;

    for (var segmentIndex = 0; segmentIndex < count - 1; segmentIndex++) {
      result.actualSegments.push(smoothSegment(actualPoints, segmentIndex));
      result.baselineSegments.push(smoothSegment(baselinePoints, segmentIndex));
    }

    function completeRun() {
      if (!activeRun) return;
      activeRun.days = (activeRun.end - activeRun.start) / width * visibleDays;
      activeRun.critical = activeRun.days > 14 || activeRun.maximumDrop > .1;
      result.runs.push(activeRun);
      activeRun = null;
    }

    for (var pixel = 0; pixel <= width; pixel++) {
      var position = pixel / width * (count - 1);
      var index = Math.min(count - 2, Math.floor(position));
      var progression = position - index;
      var actualY = cubicYAtX(result.actualSegments[index], pixel);
      var baselineY = cubicYAtX(result.baselineSegments[index], pixel);
      var actualValue = actualValues[index] + (actualValues[Math.min(index + 1, count - 1)] - actualValues[index]) * progression;
      var baselineValue = baselineValues[index] + (baselineValues[Math.min(index + 1, count - 1)] - baselineValues[index]) * progression;
      var metricActual = metricActualValues && metricActualValues.length
        ? metricActualValues[index] + (metricActualValues[Math.min(index + 1, count - 1)] - metricActualValues[index]) * progression
        : actualValue;
      var metricBaseline = metricBaselineValues && metricBaselineValues.length
        ? metricBaselineValues[index] + (metricBaselineValues[Math.min(index + 1, count - 1)] - metricBaselineValues[index]) * progression
        : baselineValue;
      // En CR cambia la geometría, pero las alertas conservan su referencia
      // monetaria original y, por tanto, su etiqueta y severidad.
      var isLoss = useMetricLossState ? metricActual < metricBaseline : actualY - baselineY > .25;
      if (isLoss) {
        if (!activeRun) activeRun = { start: pixel, end: pixel, maximumDrop: 0 };
        activeRun.end = pixel;
        activeRun.maximumDrop = Math.max(activeRun.maximumDrop, metricBaseline ? (metricBaseline - metricActual) / Math.abs(metricBaseline) : 0);
      } else {
        completeRun();
      }
    }
    completeRun();
    result.runs.forEach(function (run) {
      if (!run.critical) return;
      for (var pixel = run.start; pixel <= run.end; pixel++) result.criticalPixels[pixel] = true;
    });
    return result;
  }

  function updateDifferentialOpacity(gradient, actualValues, baselineValues, direction, color, criticalPixels, nonCriticalColor) {
    if (!gradient) return;
    var count = Math.min(actualValues.length, baselineValues.length);
    if (count < 2) return;
    var actualPoints = actualValues.slice(0, count).map(function (value, index) { return pointFor(value, index, count); });
    var baselinePoints = baselineValues.slice(0, count).map(function (value, index) { return pointFor(value, index, count); });
    var actualSegments = [];
    var baselineSegments = [];
    var rawOpacity = [];

    for (var segmentIndex = 0; segmentIndex < count - 1; segmentIndex++) {
      actualSegments.push(smoothSegment(actualPoints, segmentIndex));
      baselineSegments.push(smoothSegment(baselinePoints, segmentIndex));
    }

    for (var pixel = 0; pixel <= width; pixel++) {
      var position = pixel / width * (count - 1);
      var index = Math.min(count - 2, Math.floor(position));
      var actualY = cubicYAtX(actualSegments[index], pixel);
      var baselineY = cubicYAtX(baselineSegments[index], pixel);
      var separation = Math.max(0, direction * (baselineY - actualY));
      rawOpacity.push(separation);
    }

    // La intensidad se normaliza contra la mayor separación visible de esta vista.
    // Así siempre existe un pico legible, sin convertir el relleno en opacidad plena.
    var peakSeparation = Math.max.apply(Math, rawOpacity);
    for (var opacityIndex = 0; opacityIndex < rawOpacity.length; opacityIndex++) {
      rawOpacity[opacityIndex] = peakSeparation > .01 ? .05 + rawOpacity[opacityIndex] / peakSeparation * .25 : 0;
    }

    // Suavizado bidireccional: conserva la relación local, pero elimina cualquier cambio duro entre píxeles.
    var forward = rawOpacity.slice();
    for (var forwardIndex = 1; forwardIndex < forward.length; forwardIndex++) {
      forward[forwardIndex] = forward[forwardIndex - 1] + (forward[forwardIndex] - forward[forwardIndex - 1]) * .22;
    }
    var backward = rawOpacity.slice();
    for (var backwardIndex = backward.length - 2; backwardIndex >= 0; backwardIndex--) {
      backward[backwardIndex] = backward[backwardIndex + 1] + (backward[backwardIndex] - backward[backwardIndex + 1]) * .22;
    }

    var opacityStops = [];
    var colors = [];
    for (var stopIndex = 0; stopIndex <= width; stopIndex++) {
      var opacity = (forward[stopIndex] + backward[stopIndex]) / 2;
      var stopColor = criticalPixels ? (criticalPixels[stopIndex] ? color : nonCriticalColor) : color;
      opacityStops.push(opacity);
      colors.push(stopColor);
    }
    updateOpacityGradient(gradient, opacityStops, colors);
  }

  function updateNegativeLineGradient(criticalPixels) {
    if (!negativeLineGradient) return;
    var stops = '';
    for (var pixel = 0; pixel <= width; pixel++) {
      stops += '<stop offset="' + (pixel / width).toFixed(4) + '" stop-color="' + (criticalPixels[pixel] ? '#ff7a00' : '#7d8188') + '"></stop>';
    }
    negativeLineGradient.innerHTML = stops;
  }

  function updateLossAlert(lossInfo) {
    if (!lossAlert) return;
    var preservePresentation = preserveAlertPresentationOnNextRender;
    preserveAlertPresentationOnNextRender = false;
    if (!stage.classList.contains('is-alternate-chart')) {
      lossAlert.classList.remove('is-visible');
      alertCriticalRunKey = null;
      historicalAlertKey = null;
      window.clearTimeout(historicalAlertTimer);
      stage.classList.remove('is-historical-alert-revealed');
      return;
    }
    var criticalRuns = lossInfo.runs.filter(function (run) { return run.critical; });
    var ongoingRun = criticalRuns.filter(function (run) { return run.end >= width - 2; })[0];
    var longestRun = ongoingRun || criticalRuns.sort(function (first, second) { return second.end - second.start - (first.end - first.start); })[0];
    if (!longestRun) {
      lossAlert.classList.remove('is-visible');
      alertCriticalRunKey = null;
      historicalAlertKey = null;
      window.clearTimeout(historicalAlertTimer);
      stage.classList.remove('is-historical-alert-revealed');
      return;
    }

    var centerX = (longestRun.start + longestRun.end) / 2;
    var centerPosition = centerX / width * (lossInfo.count - 1);
    var centerIndex = Math.min(lossInfo.count - 2, Math.floor(centerPosition));
    var centerActualY = cubicYAtX(lossInfo.actualSegments[centerIndex], centerX);
    var centerBaselineY = cubicYAtX(lossInfo.baselineSegments[centerIndex], centerX);
    var plotHeight = chartSvg ? chartSvg.getBoundingClientRect().height : height;
    lossAlert.style.left = (centerX / width * 100) + '%';
    lossAlert.style.top = (Math.min(centerActualY, centerBaselineY) / height * plotHeight) + 'px';
    alertCriticalRunKey = longestRun.start + ':' + longestRun.end;
    if (lossAlertCopy) {
      lossAlertCopy.textContent = ongoingRun ? 'Alerta' : '-' + Math.round(longestRun.maximumDrop * 100) + '% CR';
      var alertCopyWidth = Math.ceil(lossAlertCopy.scrollWidth);
      lossAlert.style.setProperty('--chart-alert-copy-width', alertCopyWidth + 'px');
      lossAlert.style.setProperty('--chart-alert-open-width', Math.max(88, alertCopyWidth + 52) + 'px');
    }
    if (ongoingRun) {
      historicalAlertKey = null;
      window.clearTimeout(historicalAlertTimer);
      stage.classList.remove('is-historical-alert-revealed');
    } else if (historicalAlertKey !== alertCriticalRunKey) {
      historicalAlertKey = alertCriticalRunKey;
      if (!preservePresentation) {
        stage.classList.add('is-historical-alert-revealed');
        window.clearTimeout(historicalAlertTimer);
        historicalAlertTimer = window.setTimeout(function () {
          stage.classList.remove('is-historical-alert-revealed');
        }, 3000);
      }
    }
    lossAlert.classList.add('is-visible');
  }

  function formatNotificationDate(timestamp) {
    return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' }).format(new Date(timestamp)).replace('.', '');
  }

  function updateCriticalNotifications(lossInfo) {
    if (!notificationsList || !notificationsCount) return;
    var criticalRuns = lossInfo.runs.filter(function (run) { return run.critical; });
    notificationsCount.hidden = criticalRuns.length === 0;
    notificationsCount.textContent = criticalRuns.length > 9 ? '9+' : String(criticalRuns.length);
    notificationsList.replaceChildren();

    if (!criticalRuns.length) {
      var empty = document.createElement('p');
      empty.className = 'notifications-empty';
      empty.textContent = 'Sin alertas críticas en esta vista.';
      notificationsList.appendChild(empty);
      return;
    }

    var windowRange = currentPeriodWindow();
    var visibleStart = windowRange.start + chartView.pan * windowRange.duration;
    var visibleDuration = windowRange.duration / chartView.zoom;
    criticalRuns.forEach(function (run) {
      var item = document.createElement('article');
      var icon = document.createElement('span');
      var copy = document.createElement('span');
      var title = document.createElement('strong');
      var detail = document.createElement('span');
      var start = visibleStart + run.start / width * visibleDuration;
      var end = visibleStart + run.end / width * visibleDuration;
      item.className = 'notification-item';
      icon.className = 'notification-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.innerHTML = '<svg viewBox="0 0 14 14" fill="none"><path d="M7 0C3.13 0 0 3.13 0 7s3.13 7 7 7 7-3.13 7-7S10.87 0 7 0Zm-.5 3.63c0-.07.06-.13.13-.13h.74c.07 0 .13.06.13.13v4.25c0 .07-.06.12-.13.12h-.74c-.07 0-.13-.05-.13-.12V3.63ZM7 10.5a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" fill="currentColor"/></svg>';
      copy.className = 'notification-copy';
      title.textContent = 'Caída crítica detectada';
      detail.textContent = formatNotificationDate(start) + ' – ' + formatNotificationDate(end) + ' · −' + Math.round(run.maximumDrop * 100) + '% frente a la base';
      copy.append(title, detail);
      item.append(icon, copy);
      notificationsList.appendChild(item);
    });
  }

  function criticalHoverPath(run, lossInfo) {
    var path = '';
    for (var pixel = run.start; pixel <= run.end; pixel++) {
      var position = pixel / width * (lossInfo.count - 1);
      var index = Math.min(lossInfo.count - 2, Math.floor(position));
      var y = cubicYAtX(lossInfo.actualSegments[index], pixel);
      path += (pixel === run.start ? 'M ' : ' L ') + pixel.toFixed(2) + ' ' + (y - 100).toFixed(2);
    }
    for (var reversePixel = run.end; reversePixel >= run.start; reversePixel--) {
      var reversePosition = reversePixel / width * (lossInfo.count - 1);
      var reverseIndex = Math.min(lossInfo.count - 2, Math.floor(reversePosition));
      var reverseY = cubicYAtX(lossInfo.actualSegments[reverseIndex], reversePixel);
      path += ' L ' + reversePixel.toFixed(2) + ' ' + reverseY.toFixed(2);
    }
    return path + ' Z';
  }

  function syncCriticalHover(ratio) {
    if (!criticalHoverFill || !currentLossInfo || !stage.classList.contains('is-alternate-chart')) {
      stage.classList.remove('is-hovering-critical');
      stage.classList.remove('is-hovering-alert-run');
      stage.classList.remove('is-current-critical-event');
      hoveredCriticalRunKey = null;
      hoveredCriticalRun = null;
      return;
    }
    var pixel = ratio * width;
    var run = currentLossInfo.runs.find(function (candidate) {
      return candidate.critical && pixel >= candidate.start && pixel <= candidate.end;
    });
    if (!run) {
      if (stage.classList.contains('is-hovering-alert-run') && !persistentCriticalRun) stage.classList.remove('is-historical-alert-revealed');
      stage.classList.remove('is-hovering-critical');
      stage.classList.remove('is-hovering-alert-run');
      stage.classList.remove('is-current-critical-event');
      hoveredCriticalRunKey = null;
      hoveredCriticalRun = null;
      return;
    }
    var runKey = run.start + ':' + run.end;
    if (stage.classList.contains('is-hovering-alert-run') && runKey !== alertCriticalRunKey && !persistentCriticalRun) {
      stage.classList.remove('is-historical-alert-revealed');
    }
    var fillRun = persistentCriticalRun || run;
    var fillRunKey = fillRun.start + ':' + fillRun.end;
    if (hoveredCriticalRunKey !== fillRunKey || stage.classList.contains('is-auto-zooming')) {
      criticalHoverFill.setAttribute('d', criticalHoverPath(fillRun, currentLossInfo));
      hoveredCriticalRunKey = fillRunKey;
    }
    hoveredCriticalRun = run;
    stage.classList.add('is-hovering-critical');
    stage.classList.toggle('is-hovering-alert-run', runKey === alertCriticalRunKey);
    stage.classList.toggle('is-current-critical-event', run.end >= width - 2);
  }

  function renderChartPath(values, controlValues) {
    var visibleValues = visibleSeries(values);
    var visibleControlValues = visibleSeries(controlValues || values);
    var path = smoothPath(visibleValues);
    var area = path + ' L ' + width + ' ' + height + ' L 0 ' + height + ' Z';
    var controlPath = smoothPath(visibleControlValues);
    var alertValues = visibleSeries(periods[currentPeriod].alertValues || values);
    var alertControlValues = visibleSeries(periods[currentPeriod].alertControlValues || controlValues || values);
    if (normalizedBaselineGuide) {
      var baselineY = focalYFor(0);
      normalizedBaselineGuide.setAttribute('y1', baselineY.toFixed(2));
      normalizedBaselineGuide.setAttribute('y2', baselineY.toFixed(2));
    }
    linePaths.forEach(function (line) { line.setAttribute('d', path); });
    if (controlLine) controlLine.setAttribute('d', controlPath);
    lineLight.setAttribute('d', path);
    lineLightGlow.setAttribute('d', path);
    if (criticalLineLight) criticalLineLight.setAttribute('d', path);
    areaPaths.forEach(function (areaPath) { areaPath.setAttribute('d', area); });
    var advancedPaths = advancedDifferentialPaths(visibleValues, visibleControlValues);
    var currentLossRuns = lossRuns(visibleValues, visibleControlValues, alertValues, alertControlValues, chartMetric === 'conversion');
    currentLossInfo = currentLossRuns;
    persistentCriticalRun = stage.classList.contains('is-alternate-chart') ? currentLossRuns.runs.filter(function (run) {
      return run.critical && run.end >= width - 2;
    })[0] || null : null;
    stage.classList.toggle('is-persistent-critical-event', Boolean(persistentCriticalRun));
    if (persistentCriticalRun && criticalHoverFill) {
      criticalHoverFill.setAttribute('d', criticalHoverPath(persistentCriticalRun, currentLossRuns));
    }
    updateDifferentialOpacity(positiveDiffGradient, visibleValues, visibleControlValues, 1, '#2864ff');
    updateDifferentialOpacity(negativeDiffGradient, visibleValues, visibleControlValues, -1, '#ff7a00', currentLossRuns.criticalPixels, '#7d8188');
    updateNegativeLineGradient(currentLossRuns.criticalPixels);
    updateLossAlert(currentLossRuns);
    updateCriticalNotifications(currentLossRuns);
    if (positiveDiffArea) positiveDiffArea.setAttribute('d', advancedPaths.positiveArea);
    if (negativeDiffArea) negativeDiffArea.setAttribute('d', advancedPaths.negativeArea);
    if (positiveHoverDiffArea) positiveHoverDiffArea.setAttribute('d', advancedPaths.positiveArea);
    if (negativeHoverDiffArea) negativeHoverDiffArea.setAttribute('d', advancedPaths.negativeArea);
    advancedPositiveLines.forEach(function (line) { line.setAttribute('d', advancedPaths.positiveLine); });
    if (advancedNegativeLine) advancedNegativeLine.setAttribute('d', advancedPaths.negativeLine);
  }

  function playChartEntrance(replay) {
    if (!stage || (!replay && stage.getAttribute('data-chart-entered') === 'true')) return;
    if (!replay) stage.setAttribute('data-chart-entered', 'true');
    stage.classList.add('is-chart-entering');
    if (chartSection) chartSection.classList.add('is-chart-entering');
    var isAdvancedEntrance = stage.classList.contains('is-alternate-chart');
    var paths = Array.prototype.slice.call(linePaths);
    if (controlLine) paths.push(controlLine);
    var surfaces = Array.prototype.slice.call(areaPaths);
    if (positiveDiffArea) surfaces.push(positiveDiffArea);
    if (negativeDiffArea) surfaces.push(negativeDiffArea);
    var advancedRevealTargets = [];
    if (isAdvancedEntrance) {
      advancedPositiveLines.forEach(function (line) { advancedRevealTargets.push(line); });
      if (advancedNegativeLine) advancedRevealTargets.push(advancedNegativeLine);
      if (positiveDiffArea) advancedRevealTargets.push(positiveDiffArea);
      if (negativeDiffArea) advancedRevealTargets.push(negativeDiffArea);
      if (advancedEntryClip) {
        if (advancedEntryFrame) window.cancelAnimationFrame(advancedEntryFrame);
        advancedEntryClip.setAttribute('width', '0');
        advancedRevealTargets.forEach(function (target) { target.setAttribute('clip-path', 'url(#os-advanced-entry-clip)'); });
      }
    }

    paths.forEach(function (path) {
      var length = path.getTotalLength();
      path.style.transition = 'none';
      path.style.strokeDasharray = length + ' ' + length;
      path.style.strokeDashoffset = String(length);
      path.setAttribute('data-chart-entry-opacity', window.getComputedStyle(path).opacity || '1');
      path.style.setProperty('opacity', '0', 'important');
    });
    surfaces.forEach(function (area) {
      area.style.transition = 'none';
      area.style.opacity = '0';
    });

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        if (chartSection) chartSection.classList.add('is-chart-entering-active');
        paths.forEach(function (path) {
          path.style.transition = 'stroke-dashoffset 1.35s cubic-bezier(.16,1,.3,1), opacity .72s cubic-bezier(.16,1,.3,1)';
          path.style.strokeDashoffset = '0';
          path.style.setProperty('opacity', path.getAttribute('data-chart-entry-opacity'), 'important');
        });
        surfaces.forEach(function (area) {
          area.style.transition = 'opacity 1.1s .24s cubic-bezier(.16,1,.3,1)';
          area.style.opacity = '1';
        });
        if (isAdvancedEntrance && advancedEntryClip) {
          var startedAt = window.performance.now();
          var duration = 1350;
          function revealAdvancedPath(now) {
            var progress = Math.min(1, (now - startedAt) / duration);
            var eased = 1 - Math.pow(1 - progress, 3);
            advancedEntryClip.setAttribute('width', (width * eased).toFixed(2));
            if (progress < 1) advancedEntryFrame = window.requestAnimationFrame(revealAdvancedPath);
            else advancedEntryFrame = null;
          }
          advancedEntryFrame = window.requestAnimationFrame(revealAdvancedPath);
        }
      });
    });

    window.setTimeout(function () {
      paths.forEach(function (path) {
        path.style.removeProperty('transition');
        path.style.removeProperty('stroke-dasharray');
        path.style.removeProperty('stroke-dashoffset');
        path.style.removeProperty('opacity');
        path.removeAttribute('data-chart-entry-opacity');
      });
      surfaces.forEach(function (area) {
        area.style.removeProperty('transition');
        area.style.removeProperty('opacity');
      });
      if (isAdvancedEntrance && advancedEntryClip) {
        if (advancedEntryFrame) window.cancelAnimationFrame(advancedEntryFrame);
        advancedEntryFrame = null;
        advancedEntryClip.setAttribute('width', String(width));
        advancedRevealTargets.forEach(function (target) { target.removeAttribute('clip-path'); });
      }
      stage.classList.remove('is-chart-entering');
      if (chartSection) chartSection.classList.remove('is-chart-entering', 'is-chart-entering-active');
    }, 1500);
  }

  function holdHoverLightUntilChartSettles() {
    stage.classList.add('is-chart-transitioning');
    window.clearTimeout(chartInterpolationTimer);
    chartInterpolationTimer = window.setTimeout(function () {
      stage.classList.remove('is-chart-transitioning');
    }, 475);
  }

  function renderLabels(labels) {
    labelsElement.classList.remove('is-calendar-axis', 'is-bi-daily-axis');
    labelsElement.innerHTML = '';
    labels.forEach(function (label) {
      var item = document.createElement('span');
      item.textContent = label;
      labelsElement.appendChild(item);
    });
  }

  function calendarMonthMarkers() {
    var markers = [];
    var cursor = new Date(chartNow.getTime());
    cursor.setHours(0, 0, 0, 0);
    cursor.setDate(1);
    cursor.setMonth(cursor.getMonth() - 14);

    for (var index = 0; index < 17; index++) {
      markers.push({
        timestamp: cursor.getTime(),
        label: new Intl.DateTimeFormat('es-MX', { month: 'short' }).format(cursor).replace('.', ''),
        isMonthStart: true
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return markers;
  }

  function axisPositionFor(timestamp, windowRange) {
    return ((timestamp - windowRange.start) / windowRange.duration) * 100;
  }

  function retireAxisLabel(item, timestamp, destinationRange) {
    item.style.left = axisPositionFor(timestamp, destinationRange) + '%';
    item.style.opacity = '0';
    item.setAttribute('data-axis-exiting', 'true');
    window.setTimeout(function () {
      if (item.getAttribute('data-axis-exiting') === 'true' && item.parentNode) item.remove();
    }, 740);
  }

  function placeAxisLabel(item, timestamp, destinationRange, isNew) {
    var destination = axisPositionFor(timestamp, destinationRange) + '%';
    item.removeAttribute('data-axis-exiting');
    if (!isNew) {
      item.style.left = destination;
      item.style.opacity = '1';
      return;
    }

    // Una etiqueta nueva nace en la coordenada temporal que habría tenido en
    // la vista anterior y viaja hasta su coordenada del nuevo rango.
    item.style.left = axisPositionFor(timestamp, axisWindowState || destinationRange) + '%';
    item.style.opacity = '0';
    labelsElement.appendChild(item);
    window.requestAnimationFrame(function () {
      if (item.getAttribute('data-axis-exiting') !== 'true') {
        item.style.left = destination;
        item.style.opacity = '1';
      }
    });
  }

  function commitAxisWindow(windowRange) {
    axisWindowState = { start: windowRange.start, end: windowRange.end, duration: windowRange.duration };
  }

  function renderCalendarLabels(windowRange) {
    labelsElement.classList.remove('is-bi-daily-axis');
    labelsElement.classList.add('is-calendar-axis');
    labelsElement.querySelectorAll('span:not([data-axis-key])').forEach(function (item) { item.remove(); });
    labelsElement.querySelectorAll('[data-axis-type="day"]').forEach(function (item) {
      retireAxisLabel(item, Number(item.getAttribute('data-axis-time')), windowRange);
    });
    var existing = {};
    labelsElement.querySelectorAll('[data-axis-type="month"]').forEach(function (item) { existing[item.getAttribute('data-axis-key')] = item; });
    calendarMonthMarkers().forEach(function (marker) {
      var date = new Date(marker.timestamp);
      var key = date.getFullYear() + '-' + date.getMonth();
      var item = existing[key] || document.createElement('span');
      item.setAttribute('data-axis-key', key);
      item.setAttribute('data-axis-type', 'month');
      item.setAttribute('data-axis-time', String(marker.timestamp));
      item.textContent = marker.label;
      placeAxisLabel(item, marker.timestamp, windowRange, !existing[key]);
    });
    commitAxisWindow(windowRange);
  }

  function renderBiDailyLabels(windowRange) {
    labelsElement.classList.add('is-calendar-axis', 'is-bi-daily-axis');

    // Los meses salientes conservan su instante y recorren su posición real
    // dentro del rango de 1m, hasta salir del área recortada del eje.
    labelsElement.querySelectorAll('[data-axis-type="month"]').forEach(function (item) {
      var timestamp = Number(item.getAttribute('data-axis-time'));
      if (Number.isFinite(timestamp)) retireAxisLabel(item, timestamp, windowRange);
    });

    var existing = {};
    labelsElement.querySelectorAll('[data-axis-type="day"]').forEach(function (item) {
      existing[item.getAttribute('data-axis-key')] = item;
    });

    var markers = [];
    var cursor = new Date(windowRange.end);
    cursor.setHours(0, 0, 0, 0);
    while (cursor.getTime() >= windowRange.start) {
      markers.push(new Date(cursor));
      cursor.setDate(cursor.getDate() - 2);
    }

    markers.reverse().forEach(function (marker, index) {
      var timestamp = marker.getTime();
      var key = 'day-' + timestamp;
      var item = existing[key] || document.createElement('span');
      var isNew = !existing[key];
      item.setAttribute('data-axis-key', key);
      item.setAttribute('data-axis-type', 'day');
      item.setAttribute('data-axis-time', String(timestamp));
      item.textContent = index === markers.length - 1 ? 'Hoy' : String(marker.getDate());
      placeAxisLabel(item, timestamp, windowRange, isNew);
    });
    commitAxisWindow(windowRange);
  }

  function renderMonthLabels() {
    var windowRange = currentPeriodWindow();
    var defaultRange = chartView.zoom === 1 && chartView.pan === 0;
    var showMonthlyGuides = (currentPeriod === '3m' || currentPeriod === '6m' || currentPeriod === '1y') && defaultRange;
    var markers = calendarMonthMarkers();
    var markerPositions = {};
    var existingGuides = {};
    if (monthGuides) monthGuides.querySelectorAll('[data-guide-key]').forEach(function (guide) { existingGuides[guide.getAttribute('data-guide-key')] = guide; });
    markers.forEach(function (monthMarker) {
      var markerDate = new Date(monthMarker.timestamp);
      var markerKey = markerDate.getFullYear() + '-' + markerDate.getMonth();
      markerPositions[markerKey] = ((monthMarker.timestamp - windowRange.start) / windowRange.duration) * 100;
    });

    if (!showMonthlyGuides) {
      Object.keys(existingGuides).forEach(function (key) {
        var guide = existingGuides[key];
        if (Object.prototype.hasOwnProperty.call(markerPositions, key)) {
          guide.style.left = markerPositions[key] + '%';
        }
        guide.style.opacity = '0';
      });
      return;
    }

    // Primero reubicamos también las guías que van a salir. Así, al pasar de
    // una guía mensual (6m) a una bimestral (1y), viajan con el calendario al
    // mismo tiempo que reducen su opacidad, en lugar de desvanecerse inmóviles.
    Object.keys(existingGuides).forEach(function (key) {
      var guide = existingGuides[key];
      if (Object.prototype.hasOwnProperty.call(markerPositions, key)) {
        guide.style.left = markerPositions[key] + '%';
      }
      guide.style.opacity = '0';
    });
    markers.forEach(function (monthMarker) {
      var position = ((monthMarker.timestamp - windowRange.start) / windowRange.duration) * 100;
      var markerDate = new Date(monthMarker.timestamp);
      var shouldDrawGuide = currentPeriod !== '1y' || markerDate.getMonth() % 2 === 1;
      if (monthGuides && shouldDrawGuide) {
        var guideKey = markerDate.getFullYear() + '-' + markerDate.getMonth();
        var guide = existingGuides[guideKey] || document.createElement('span');
        guide.setAttribute('data-guide-key', guideKey);
        guide.setAttribute('class', 'chart-month-guide');
        guide.style.left = position + '%';
        guide.style.opacity = '1';
        if (!existingGuides[guideKey]) {
          monthGuides.appendChild(guide);
        }
      }
    });
  }

  function currentPeriodWindow() {
    var duration = periodDurations[currentPeriod];
    var end = chartNow.getTime();
    return { start: end - duration, end: end, duration: duration };
  }

  function revenueBetween(start, end) {
    return transactions.reduce(function (total, transaction) {
      return transaction.timestamp > start && transaction.timestamp <= end ? total + transaction.netRevenue : total;
    }, 0);
  }

  function groupPerformanceBetween(start, end, group) {
    var windowTransactions = transactions.filter(function (transaction) {
      return transaction.timestamp > start && transaction.timestamp <= end;
    });
    var groupTransactions = windowTransactions.filter(function (transaction) { return transaction.ab === group; });
    if (!windowTransactions.length || !groupTransactions.length) return 0;
    var groupRevenue = groupTransactions.reduce(function (total, transaction) { return total + transaction.netRevenue; }, 0);
    // Igualamos el volumen de actividad para comparar A y B bajo la misma
    // demanda externa, pero cada valor sigue saliendo de sus transacciones reales.
    return (groupRevenue / groupTransactions.length) * windowTransactions.length;
  }

  function valuesForPeriod(periodName) {
    var duration = periodDurations[periodName];
    var end = chartNow.getTime();
    var points = [];
    for (var index = 0; index < 81; index++) {
      var pointTime = end - duration + duration * (index / 80);
      points.push(revenueBetween(pointTime - periodDurations['1m'], pointTime) / 1000000);
    }
    return points;
  }

  function comparisonValuesForPeriod(periodName) {
    var duration = periodDurations[periodName];
    var end = chartNow.getTime();
    var start = end - duration;
    if (currentAggregation === 'cumulative') return cumulativeComparisonValues(start, end, duration);

    var values = { A: [], B: [] };
    for (var index = 0; index < 81; index++) {
      var pointTime = start + duration * (index / 80);
      var windowStart = pointTime - periodDurations['1m'];
      values.A.push(baselineRevenueBetween(windowStart, pointTime) / 1000000);
      values.B.push(revenueBetween(windowStart, pointTime) / 1000000);
    }
    return values;
  }

  function conversionComparisonValues(comparison) {
    // La fuente actual contiene transacciones e ingresos, no eventos de
    // exposición. Para el prototipo expresamos la conversión observada como
    // una tasa base estable modulada por la relación B / línea de control.
    // En producción esta función se alimenta del registro de sesiones y
    // conversiones, manteniendo la misma interfaz de series.
    var averageBaseline = comparison.A.reduce(function (total, value) { return total + value; }, 0) / Math.max(1, comparison.A.length);
    return {
      A: comparison.A.map(function (baseline) {
        return 3.05 + ((baseline - averageBaseline) / Math.max(.0001, averageBaseline)) * .42;
      }),
      B: comparison.B.map(function (actual, index) {
        var baseline = comparison.A[index];
        var baselineRate = 3.05 + ((baseline - averageBaseline) / Math.max(.0001, averageBaseline)) * .42;
        return baselineRate * (baseline ? actual / baseline : 1);
      })
    };
  }

  function normalizedComparisonValues(comparison) {
    // La BL funciona como origen local en cada X. El trazo gris queda plano
    // en 0 y el azul expresa la diferencia monetaria real frente a esa BL.
    // Así no se borra el valor base: se incorpora al cálculo de cada punto.
    return {
      A: comparison.A.map(function () { return 0; }),
      B: comparison.B.map(function (value, index) { return value - comparison.A[index]; })
    };
  }

  function groupRevenueBetween(start, end, group) {
    return transactions.reduce(function (total, transaction) {
      return transaction.ab === group && transaction.timestamp > start && transaction.timestamp <= end ? total + transaction.netRevenue : total;
    }, 0);
  }

  function controlAudienceShareAt(timestamp) {
    var timeline = Array.isArray(clientConfig.controlAudienceTimeline) ? clientConfig.controlAudienceTimeline : [];
    var share = defaultControlAudienceShare;
    timeline.forEach(function (entry) {
      if (typeof entry.start === 'number' && entry.start <= timestamp && typeof entry.controlShare === 'number') {
        share = clamp(entry.controlShare, .01, .99);
      }
    });
    return share;
  }

  function baselineRevenueBetween(start, end) {
    return transactions.reduce(function (total, transaction) {
      if (transaction.ab !== 'A' || transaction.timestamp <= start || transaction.timestamp > end) return total;
      return total + transaction.netRevenue / controlAudienceShareAt(transaction.timestamp);
    }, 0);
  }

  function cumulativeComparisonValues(start, end, duration) {
    // La ventana seleccionada sólo define qué tramo mostramos. El acumulado
    // parte del primer registro histórico y no se reinicia al cambiar 1m/3m.
    var historyTransactions = transactions.filter(function (transaction) {
      return transaction.timestamp <= end;
    }).sort(function (first, second) { return first.timestamp - second.timestamp; });
    var cumulativeActual = 0;
    var cumulativeBaseline = 0;
    var values = { A: [], B: [] };
    var transactionIndex = 0;

    for (var index = 0; index < 81; index++) {
      var pointTime = start + duration * (index / 80);
      while (transactionIndex < historyTransactions.length && historyTransactions[transactionIndex].timestamp <= pointTime) {
        var transaction = historyTransactions[transactionIndex];
        cumulativeActual += transaction.netRevenue;
        if (transaction.ab === 'A') cumulativeBaseline += transaction.netRevenue / controlAudienceShareAt(transaction.timestamp);
        transactionIndex += 1;
      }
      values.A.push(cumulativeBaseline / 1000000);
      values.B.push(cumulativeActual / 1000000);
    }
    return values;
  }

  function updateChartScale(values) {
    var minimum = Math.min.apply(null, values);
    var maximum = Math.max.apply(null, values);
    var padding = Math.max((maximum - minimum) * .18, .08);
    yMin = Math.floor((minimum - padding) * 20) / 20;
    yMax = Math.ceil((maximum + padding) * 20) / 20;
  }

  function metricsForPeriod(periodName) {
    var windowRange = { start: chartNow.getTime() - periodDurations[periodName], end: chartNow.getTime() };
    var periodTransactions = transactions.filter(function (transaction) {
      return transaction.timestamp > windowRange.start && transaction.timestamp <= windowRange.end;
    });
    var total = periodTransactions.reduce(function (sum, transaction) { return sum + transaction.netRevenue; }, 0);
    var baseline = baselineRevenueBetween(windowRange.start, windowRange.end);
    var uplift = baseline ? ((total / baseline) - 1) * 100 : 0;
    var mrr = revenueBetween(chartNow.getTime() - periodDurations['1m'], chartNow.getTime());
    var articleTypes = new Set(periodTransactions.map(function (transaction) { return transaction.article; }));
    return { mrr: mrr, total: total, uplift: uplift, tests: articleTypes.size, mrrGrowth: mrrGrowthForPeriod(periodName) };
  }

  function incrementalMrrNetAt(timestamp) {
    var start = timestamp - periodDurations['1m'];
    return (revenueBetween(start, timestamp) - baselineRevenueBetween(start, timestamp)) * (1 - revShareRate);
  }

  function averageIncrementalMrr(start, end) {
    var duration = end - start;
    if (duration <= periodDurations['1m']) return incrementalMrrNetAt(end);
    var total = 0;
    var samples = 61;
    for (var index = 0; index < samples; index++) {
      total += incrementalMrrNetAt(start + duration * (index / (samples - 1)));
    }
    return total / samples;
  }

  function mrrGrowthForPeriod(periodName) {
    var duration = periodDurations[periodName];
    var currentEnd = chartNow.getTime();
    var currentStart = currentEnd - duration;
    var previousStart = currentStart - duration;
    var firstTransaction = transactions.reduce(function (earliest, transaction) {
      return Math.min(earliest, transaction.timestamp);
    }, currentEnd);
    if (firstTransaction > previousStart) return null;

    var currentMrr = averageIncrementalMrr(currentStart, currentEnd);
    var previousMrr = averageIncrementalMrr(previousStart, currentStart);
    if (Math.abs(previousMrr) < 1) return null;
    return ((currentMrr - previousMrr) / Math.abs(previousMrr)) * 100;
  }

  function incrementalNetValue(period) {
    var lastIndex = period.values.length - 1;
    if (currentAggregation === 'cumulative') {
      return (period.values[lastIndex] - period.controlValues[lastIndex]) * 1000000 * (1 - revShareRate);
    }
    if (currentPeriod === '1m') {
      return (period.values[lastIndex] - period.controlValues[lastIndex]) * 1000000 * (1 - revShareRate);
    }

    var averageIncrementalMrr = period.values.reduce(function (total, value, index) {
      return total + (value - period.controlValues[index]);
    }, 0) / Math.max(1, period.values.length);
    return averageIncrementalMrr * 1000000 * (1 - revShareRate);
  }

  function formatTimeLabel(timestamp) {
    var date = new Date(timestamp);
    if (currentPeriod === '1m' || currentPeriod === '3m') {
      return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' }).format(date).replace('.', '');
    }
    return new Intl.DateTimeFormat('es-MX', { month: 'short' }).format(date).replace('.', '');
  }

  function formatTooltipLabel(timestamp) {
    var date = new Date(timestamp);
    if (currentPeriod === '1m' || currentPeriod === '3m') {
      return new Intl.DateTimeFormat('es-MX', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false
      }).format(date).replace('.', '');
    }
    return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' }).format(date).replace('.', '');
  }

  function renderTimeLabels() {
    if (currentPeriod === '1m' && chartView.zoom === 1 && chartView.pan === 0) {
      renderBiDailyLabels(currentPeriodWindow());
      renderMonthLabels();
      return;
    }

    if ((currentPeriod === '6m' || currentPeriod === '1y') && chartView.zoom === 1 && chartView.pan === 0) {
      var calendarWindow = currentPeriodWindow();
      renderCalendarLabels(calendarWindow);
      renderMonthLabels();
      return;
    }

    if (currentPeriod === '3m' && chartView.zoom === 1 && chartView.pan === 0) {
      var threeMonthWindow = currentPeriodWindow();
      renderCalendarLabels(threeMonthWindow);
      renderMonthLabels();
      return;
    }

    var tickCount = currentPeriod === '1m' ? 5 : 6;
    var windowRange = currentPeriodWindow();
    var visibleSpan = 1 / chartView.zoom;
    var visibleStart = windowRange.start + windowRange.duration * chartView.pan;
    var visibleDuration = windowRange.duration * visibleSpan;
    var labels = [];

    for (var index = 0; index < tickCount; index++) {
      var timestamp = visibleStart + visibleDuration * (index / (tickCount - 1));
      labels.push(index === tickCount - 1 && Math.abs(timestamp - chartNow.getTime()) < 60 * 60 * 1000 ? 'Hoy' : formatTimeLabel(timestamp));
    }
    renderLabels(labels);
    renderMonthLabels();
  }

  function formatMillion(value) {
    return '$' + value.toFixed(2) + 'M';
  }

  function formatChartMetric(value) {
    return chartMetric === 'conversion' ? value.toFixed(2) + '%' : formatMillion(value);
  }

  function normalizedBaselineIsActive() {
    return preference('normalizedBaseline', false) === true;
  }

  function formatAxisValue(value) {
    if (!normalizedBaselineIsActive()) return chartMetric === 'conversion' ? value.toFixed(2) + '%' : value.toFixed(2) + 'M';
    // No es dinero cero: es el origen local que representa la BL de cada X.
    if (Math.abs(value) < .0005) return 'BL';
    if (chartMetric === 'conversion') return (value > 0 ? '+' : '-') + Math.abs(value).toFixed(2) + ' pp';
    return (value > 0 ? '+' : '-') + '$' + Math.abs(value).toFixed(2) + 'M';
  }

  function formatDashboardCurrency(value) {
    return data ? data.formatCurrency(value) : '$' + Math.round(value).toLocaleString('en-US');
  }

  function setMetric(selector, value) {
    var element = document.querySelector(selector);
    if (element) element.textContent = value;
  }

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  function constrainChartView() {
    var visibleSpan = 1 / chartView.zoom;
    var maxPan = Math.max(0, 1 - visibleSpan);
    // pan = 1 - visibleSpan sitúa el extremo derecho exactamente en hoy.
    // Nunca permitimos valores superiores que puedan dibujar tiempo futuro.
    chartView.pan = clamp(chartView.pan, 0, maxPan);
  }

  function applyChartView() {
    constrainChartView();
    renderChartPath(periods[currentPeriod].values, periods[currentPeriod].controlValues);
    renderYAxis();
    renderTimeLabels();
    syncAnnotationLines();
  }

  function renderYAxis() {
    if (!yAxis) return;

    // Sin lente, el eje vuelve a su retícula lineal habitual. La selección
    // adaptativa de ticks sólo hace falta durante la ampliación focal.
    var lensIsActive = autoZoomState.intensity > .002 || autoZoomState.targetIntensity > .002;
    var yPositionFor = lensIsActive ? focalYFor : linearYFor;
    var activeTicks = yAxisTicks.slice();
    syncYAxisTickElements(activeTicks);

    // Si la curvatura comprime una parte del eje, ocultamos ticks principales
    // antes de que puedan colisionar. No inventamos valores intermedios.
    var minimumGap = lensIsActive ? 22 : 0;
    var lastVisibleY = -Infinity;
    var visibleTicks = {};
    activeTicks.forEach(function (value) {
      var renderedY = yPositionFor(value);
      if (renderedY < 0 || renderedY > height || renderedY - lastVisibleY < minimumGap) return;
      visibleTicks[value.toFixed(4)] = true;
      lastVisibleY = renderedY;
    });

    yAxis.querySelectorAll('[data-y-tick]').forEach(function (label) {
      var isActive = label.getAttribute('data-y-active') === 'true';
      var value = Number(label.getAttribute('data-y-value'));
      var renderedY = yPositionFor(value);
      var isAbove = renderedY <= 0;
      var isBelow = renderedY >= height;
      label.style.top = (isAbove ? 0 : (isBelow ? 100 : renderedY / height * 100)) + '%';
      label.style.transform = isAbove ? 'translateY(0)' : (isBelow ? 'translateY(-100%)' : 'translateY(-50%)');
      var isVisible = Boolean(visibleTicks[value.toFixed(4)]);
      label.setAttribute('data-y-visible', String(isVisible));
      label.style.opacity = isActive && isVisible && label.getAttribute('data-y-entering') !== 'true' ? '1' : '0';
    });
  }

  function setYAxisTicks() {
    if (!yAxis || !yAxisTickCount) return;
    var rawStep = (yMax - yMin) / Math.max(1, yAxisTickCount - 1);
    var magnitude = Math.pow(10, Math.floor(Math.log(rawStep) / Math.LN10));
    var normalized = rawStep / magnitude;
    var multiplier = normalized <= 1 ? 1 : (normalized <= 2 ? 2 : (normalized <= 2.5 ? 2.5 : (normalized <= 5 ? 5 : 10)));
    yAxisStep = multiplier * magnitude;
    var top = Math.ceil(yMax / yAxisStep) * yAxisStep;
    yAxisTicks = Array.from({ length: yAxisTickCount }, function (_, index) { return top - yAxisStep * index; });
    syncYAxisTickElements(yAxisTicks);
  }

  function syncYAxisTickElements(values) {
    if (!yAxis) return;
    var existing = {};
    yAxis.querySelectorAll('[data-y-tick]').forEach(function (label) { existing[label.getAttribute('data-y-tick')] = label; });
    yAxis.querySelectorAll('span:not([data-y-tick])').forEach(function (label) { label.remove(); });
    yAxis.querySelectorAll('[data-y-tick]').forEach(function (label) { label.setAttribute('data-y-active', 'false'); });

    values.forEach(function (value) {
      var key = value.toFixed(4);
      var label = existing[key] || document.createElement('span');
      label.setAttribute('data-y-tick', key);
      label.setAttribute('data-y-value', String(value));
      label.setAttribute('data-y-active', 'true');
      label.textContent = formatAxisValue(value);
      if (!existing[key]) {
        label.setAttribute('data-y-entering', 'true');
        label.style.opacity = '0';
        yAxis.appendChild(label);
        window.requestAnimationFrame(function () {
          window.requestAnimationFrame(function () {
            label.removeAttribute('data-y-entering');
            if (label.getAttribute('data-y-active') === 'true' && label.getAttribute('data-y-visible') === 'true') {
              label.style.opacity = '1';
            }
          });
        });
      }
    });
  }

  function setAutomaticZoomTarget(clientX) {
    var rect = hitArea.getBoundingClientRect();
    var ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    var values = periods[currentPeriod].values;
    var controlValues = periods[currentPeriod].controlValues || values;
    if (!controlZoomActive) {
      autoZoomState.targetIntensity = 0;
      autoZoomState.targetFocusValue = .5;
      if (autoZoomState.intensity > .002 || Math.abs(autoZoomState.focusValue - .5) > .0005) settleAutomaticZoom();
      return;
    }
    var visiblePosition = ratio;
    var separation = Math.abs(valueAt(values, visiblePosition) - valueAt(controlValues, visiblePosition));
    var separationPixels = (separation / Math.max(.0001, yMax - yMin)) * height;
    // No elegimos un zoom arbitrario: buscamos que las dos líneas lleguen a
    // una separación visual legible. El límite superior evita descontextualizar
    // el resto de la serie cuando prácticamente se superponen.
    var targetSeparation = height * .42;
    var requestedZoom = clamp(targetSeparation / Math.max(separationPixels, height * .017), 1, 3.8);
    var midpoint = (valueAt(values, visiblePosition) + valueAt(controlValues, visiblePosition)) / 2;
    // Convertimos el zoom deseado a intensidad de la lente no lineal. A
    // diferencia de una escala uniforme, los extremos permanecen anclados.
    autoZoomState.targetIntensity = clamp((requestedZoom - 1) / .5, 0, 1.6);
    autoZoomState.targetFocusValue = (midpoint - yMin) / Math.max(.0001, yMax - yMin);
    settleAutomaticZoom();
  }

  function setControlZoomActive(active) {
    if (controlZoomActive === active) return;
    controlZoomActive = active;
    stage.classList.toggle('is-control-zoom', active);
    if (hoverState.targetClientX !== null) {
      setAutomaticZoomTarget(hoverState.targetClientX);
    } else {
      autoZoomState.targetIntensity = 0;
      autoZoomState.targetFocusValue = .5;
      settleAutomaticZoom();
    }
  }

  function settleAutomaticZoom() {
    if (autoZoomState.frame) return;

    function tick() {
      var intensityDifference = autoZoomState.targetIntensity - autoZoomState.intensity;
      var focusDifference = autoZoomState.targetFocusValue - autoZoomState.focusValue;
      var hasMovement = Math.abs(intensityDifference) > .001 || Math.abs(focusDifference) > .0005;

      if (hasMovement) {
        stage.classList.add('is-auto-zooming');
        if (yAxis) yAxis.classList.add('is-zooming');
        autoZoomState.intensity += intensityDifference * .13;
        autoZoomState.focusValue += focusDifference * .13;
        renderChartPath(periods[currentPeriod].values, periods[currentPeriod].controlValues);
        renderYAxis();
        if (hoverState.currentClientX !== null) renderInspectionAt(hoverState.currentClientX);
        autoZoomState.frame = window.requestAnimationFrame(tick);
      } else {
        autoZoomState.intensity = autoZoomState.targetIntensity;
        autoZoomState.focusValue = autoZoomState.targetFocusValue;
        renderChartPath(periods[currentPeriod].values, periods[currentPeriod].controlValues);
        renderYAxis();
        if (hoverState.currentClientX !== null) renderInspectionAt(hoverState.currentClientX);
        stage.classList.remove('is-auto-zooming');
        if (yAxis) yAxis.classList.remove('is-zooming');
        autoZoomState.frame = 0;
      }
    }

    autoZoomState.frame = window.requestAnimationFrame(tick);
  }

  function activatePeriod(periodName, preserveView) {
    var activeButton = document.querySelector('[data-period="' + periodName + '"]');
    if (!activeButton) return;

    document.querySelectorAll('[data-period]').forEach(function (item) {
      var selected = item === activeButton;
      item.classList.toggle('is-active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    if (!preserveView) {
      chartView.zoom = 1;
      chartView.pan = 0;
    }
    currentPeriod = periodName;
    syncPeriodSwitch(activeButton);
    savePreference('period', periodName);
    if (preference('chartTransformation', false) === true) {
      window.clearTimeout(chartViewTransitionTimer);
      stage.classList.remove('is-chart-view-transitioning');
      render(periodName);
      return;
    }

    stage.classList.add('is-chart-view-transitioning');
    stage.classList.remove('is-chart-view-entering');
    window.clearTimeout(chartViewEntranceTimer);
    window.clearTimeout(chartViewTransitionTimer);
    chartViewTransitionTimer = window.setTimeout(function () {
      render(periodName);
      stage.classList.add('is-chart-view-entering');
      window.requestAnimationFrame(function () {
        stage.classList.remove('is-chart-view-transitioning');
      });
      chartViewEntranceTimer = window.setTimeout(function () {
        stage.classList.remove('is-chart-view-entering');
      }, 500);
    }, 170);
  }

  function periodForDuration(duration) {
    if (duration <= periodDurations['1m']) return '1m';
    if (duration <= periodDurations['3m']) return '3m';
    if (duration <= periodDurations['6m']) return '6m';
    return '1y';
  }

  function setPeriodForVisibleDuration(duration, focusTimestamp, focusRatio) {
    var nextPeriod = periodForDuration(duration);
    var nextDuration = periodDurations[nextPeriod];
    var nextSpan = clamp(duration / nextDuration, 1 / 3.5, 1);
    var nextWindowStart = chartNow.getTime() - nextDuration;
    var nextFocus = (focusTimestamp - nextWindowStart) / nextDuration;

    chartView.zoom = 1 / nextSpan;
    chartView.pan = nextFocus - focusRatio * nextSpan;
    activatePeriod(nextPeriod, true);
  }

  function syncPeriodSwitch(button) {
    var picker = button.closest('.period-picker');
    if (!picker) return;
    var currentLabel = picker.querySelector('[data-period-current]');
    var options = picker.querySelector('.period-options');
    if (currentLabel) currentLabel.textContent = button.textContent;
    var optionsLeft = options ? options.offsetLeft : 0;
    picker.style.setProperty('--period-switch-left', (optionsLeft + button.offsetLeft) + 'px');
    picker.style.setProperty('--period-switch-width', button.offsetWidth + 'px');
    var labelWidth = currentLabel ? currentLabel.offsetWidth : button.offsetWidth;
    picker.style.setProperty('--period-collapsed-width', (labelWidth + 10) + 'px');
    if (options) picker.style.setProperty('--period-expanded-width', (options.scrollWidth + 10) + 'px');
  }

  function openPeriodSwitch(picker) {
    if (!picker) return;
    window.clearTimeout(picker.__periodCloseTimer);
    window.clearTimeout(picker.__periodLabelTimer);
    picker.classList.remove('is-closing');
    picker.classList.add('is-expanded');
  }

  function closePeriodSwitch(picker, force) {
    if (!picker || (!force && picker.matches(':hover'))) return;
    picker.classList.remove('is-expanded');
    picker.classList.add('is-closing');
    window.clearTimeout(picker.__periodLabelTimer);
    picker.__periodLabelTimer = window.setTimeout(function () {
      picker.classList.remove('is-closing');
    }, 160);
  }

  var periodPicker = document.querySelector('.period-picker');
  if (periodPicker) {
    periodPicker.addEventListener('pointerenter', function () { openPeriodSwitch(periodPicker); });
    periodPicker.addEventListener('pointerleave', function () {
      window.clearTimeout(periodPicker.__periodCloseTimer);
      periodPicker.__periodCloseTimer = window.setTimeout(function () {
        closePeriodSwitch(periodPicker);
      }, 400);
    });
  }

  function revealPeriodSwitch() {
    if (!periodPicker) return;
    window.clearTimeout(periodPicker.__keyboardExpandTimer);
    openPeriodSwitch(periodPicker);
    periodPicker.__keyboardExpandTimer = window.setTimeout(function () {
      closePeriodSwitch(periodPicker);
    }, 920);
  }

  function syncChartViewportGap() {
    if (!osTabs) return;
    var stageRect = stage.getBoundingClientRect();
    var tabsRect = osTabs.getBoundingClientRect();
    var chartAxisHeight = 29;
    var desiredGap = 50;
    var plotHeight = tabsRect.top - desiredGap - stageRect.top - chartAxisHeight;

    document.documentElement.style.setProperty('--os-chart-plot-height', Math.max(180, Math.round(plotHeight)) + 'px');
  }

  function syncAnnotationLines() {
    if (!annotations) return;
    var labels = annotations.querySelectorAll('.chart-annotation');
    var annotationsVisible = currentPeriod === '1m' || currentPeriod === '3m' || currentPeriod === '6m';
    var windowRange = currentPeriodWindow();
    var visibleSpan = 1 / chartView.zoom;

    labels.forEach(function (label, index) {
      var eventData = chartEvents[index];
      var eventPosition = (eventData.timestamp - windowRange.start) / windowRange.duration;
      var screenPosition = (eventPosition - chartView.pan) / visibleSpan;
      var isVisible = annotationsVisible && screenPosition >= 0 && screenPosition <= 1;

      label.textContent = eventData.label;
      label.style.left = (screenPosition * 100) + '%';
      label.style.opacity = isVisible ? '1' : '0';
    });
  }

  function zoomChartAt(clientX, multiplier) {
    var rect = hitArea.getBoundingClientRect();
    var ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    var windowRange = currentPeriodWindow();
    var previousSpan = 1 / chartView.zoom;
    var focusPosition = chartView.pan + ratio * previousSpan;
    var focusTimestamp = windowRange.start + focusPosition * windowRange.duration;
    var nextVisibleDuration = clamp(
      (windowRange.duration * previousSpan) / multiplier,
      periodDurations['1m'] / 3.5,
      periodDurations['1y']
    );

    setPeriodForVisibleDuration(nextVisibleDuration, focusTimestamp, ratio);
    inspectAt(clientX);
  }

  function revealLightSegment(path, targetX) {
    var totalLength = path.getTotalLength();

    function lengthAtX(target) {
      var low = 0;
      var high = totalLength;
      for (var iteration = 0; iteration < 18; iteration++) {
        var middle = (low + high) / 2;
        var point = path.getPointAtLength(middle);
        if (point.x < target) low = middle;
        else high = middle;
      }
      return (low + high) / 2;
    }
    // La curva avanza de izquierda a derecha: buscamos el mismo tramo SVG
    // para que el brillo siga su geometría exacta, no una aproximación recta.
    var center = lengthAtX(targetX);
    var segmentLength = 100;
    var start = Math.max(0, center - segmentLength / 2);
    var end = Math.min(totalLength, center + segmentLength / 2);
    var remaining = Math.max(0, totalLength - end);
    var dashPattern = '0 ' + start.toFixed(2) + ' ' + (end - start).toFixed(2) + ' ' + remaining.toFixed(2);

    var startPoint = path.getPointAtLength(start);
    var endPoint = path.getPointAtLength(end);
    var centerPoint = path.getPointAtLength(center);

    lineLight.style.strokeDasharray = dashPattern;
    lineLightGlow.style.strokeDasharray = dashPattern;
    if (criticalLineLight) {
      var criticalStart = hoveredCriticalRun ? Math.max(start, lengthAtX(hoveredCriticalRun.start)) : start;
      var criticalEnd = hoveredCriticalRun ? Math.min(end, lengthAtX(hoveredCriticalRun.end)) : start;
      var criticalVisibleLength = Math.max(0, criticalEnd - criticalStart);
      criticalLineLight.style.strokeDasharray = '0 ' + criticalStart.toFixed(2) + ' ' + criticalVisibleLength.toFixed(2) + ' ' + Math.max(0, totalLength - criticalEnd).toFixed(2);
    }
    hoverGradient.setAttribute('x1', startPoint.x.toFixed(2));
    hoverGradient.setAttribute('y1', startPoint.y.toFixed(2));
    hoverGradient.setAttribute('x2', endPoint.x.toFixed(2));
    hoverGradient.setAttribute('y2', endPoint.y.toFixed(2));
    if (criticalHoverGradient) {
      criticalHoverGradient.setAttribute('x1', startPoint.x.toFixed(2));
      criticalHoverGradient.setAttribute('y1', startPoint.y.toFixed(2));
      criticalHoverGradient.setAttribute('x2', endPoint.x.toFixed(2));
      criticalHoverGradient.setAttribute('y2', endPoint.y.toFixed(2));
    }

    return centerPoint;
  }

  function render(periodName) {
    currentPeriod = periodName;
    var period = periods[currentPeriod];
    var rawComparison = comparisonValuesForPeriod(currentPeriod);
    var metricComparison = chartMetric === 'conversion' ? conversionComparisonValues(rawComparison) : rawComparison;
    var isNormalizedBaseline = normalizedBaselineIsActive();
    var comparison = isNormalizedBaseline ? normalizedComparisonValues(metricComparison) : metricComparison;
    stage.classList.toggle('is-normalized-baseline', isNormalizedBaseline);
    period.values = comparison.B;
    period.controlValues = comparison.A;
    period.metricValues = metricComparison.B;
    period.metricControlValues = metricComparison.A;
    period.alertValues = rawComparison.B;
    period.alertControlValues = rawComparison.A;
    updateChartScale(period.values.concat(period.controlValues));
    setYAxisTicks();
    constrainChartView();
    var metrics = metricsForPeriod(currentPeriod);
    // Las métricas siguen usando los importes reales; normalizar sólo cambia
    // la referencia visual de la BL, nunca los ingresos reportados.
    var incrementalNet = incrementalNetValue({ values: rawComparison.B, controlValues: rawComparison.A });
    holdHoverLightUntilChartSettles();
    renderChartPath(period.values, period.controlValues);
    renderYAxis();
    renderTimeLabels();
    setMetric('[data-primary-value]', formatDashboardCurrency(incrementalNet));
    setMetric('[data-total-value]', data ? data.formatCompactCurrency(metrics.total) : period.total);
    setMetric('[data-conversion-value]', (metrics.uplift >= 0 ? '+' : '') + metrics.uplift.toFixed(1) + '%');
    setMetric('[data-mrr-growth-value]', metrics.mrrGrowth === null ? '--' : (metrics.mrrGrowth >= 0 ? '+' : '') + metrics.mrrGrowth.toFixed(1) + '%');
    setMetric('[data-mrr-growth-description]', {
      '1m': 'Vs. los 30 días anteriores',
      '3m': 'Vs. el trimestre anterior',
      '6m': 'Vs. el semestre anterior',
      '1y': 'Vs. el año anterior'
    }[currentPeriod]);
    setMetric('[data-primary-context]', currentAggregation === 'cumulative' ? 'IR Acumulado' : 'IR Net. (-RevS)');
    setMetric('[data-primary-description]', currentAggregation === 'cumulative'
      ? 'Total Generado por Faust Partners'
      : 'MRR incremental (después de Rev. Share)');
    syncAnnotationLines();
    stage.classList.remove('is-inspecting');
    stage.classList.remove('is-hovering-critical');
    stage.classList.remove('is-hovering-alert-run');
    stage.classList.remove('is-current-critical-event');
    hoveredCriticalRun = null;
  }

  function renderInspectionAt(clientX) {
    var rect = hitArea.getBoundingClientRect();
    var ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    syncCriticalHover(ratio);
    var values = periods[currentPeriod].values;
    var controlValues = periods[currentPeriod].controlValues || values;
    var visibleSpan = 1 / chartView.zoom;
    var visiblePosition = chartView.pan + ratio * visibleSpan;
    var index = Math.round(visiblePosition * (values.length - 1));
    var point = revealLightSegment(linePaths[linePaths.length - 1], ratio * width);
    var pixelX = (point.x / width) * rect.width;
    var pixelY = (point.y / height) * rect.height;
    var chartValue = valueAt(values, visiblePosition);
    var controlValue = valueAt(controlValues, visiblePosition);
    var rawChartValue = valueAt(periods[currentPeriod].metricValues || values, visiblePosition);
    var rawControlValue = valueAt(periods[currentPeriod].metricControlValues || controlValues, visiblePosition);
    var windowRange = currentPeriodWindow();
    var timestamp = windowRange.start + visiblePosition * windowRange.duration;
    var label = formatTooltipLabel(timestamp);

    tooltip.style.left = pixelX + 'px';
    tooltip.style.top = Math.max(42, pixelY) + 'px';
    tooltipLabel.textContent = label;
    if (normalizedBaselineIsActive()) {
      tooltipValueB.textContent = formatChartMetric(rawChartValue);
      tooltipValueA.textContent = formatChartMetric(rawControlValue);
      status.textContent = label + ': ' + (chartMetric === 'conversion' ? 'conversión real ' : 'ingreso real ') + formatChartMetric(rawChartValue) + ', BL ' + formatChartMetric(rawControlValue);
    } else {
      tooltipValueB.textContent = formatChartMetric(chartValue);
      tooltipValueA.textContent = formatChartMetric(controlValue);
      status.textContent = label + ': ' + (chartMetric === 'conversion' ? 'conversión real ' : 'ingreso real ') + formatChartMetric(chartValue) + ', línea base ' + formatChartMetric(controlValue);
    }
    stage.classList.add('is-inspecting');
  }

  function renderCrosshair(clientX, clientY) {
    if (!guide || !hitArea) return;
    var rect = hitArea.getBoundingClientRect();
    var x = clamp((clientX - rect.left) / rect.width, 0, 1) * width;
    var y = clamp(((typeof clientY === 'number' ? clientY : rect.top + rect.height / 2) - rect.top) / rect.height, 0, 1) * height;
    guide.setAttribute('x1', x.toFixed(2));
    guide.setAttribute('x2', x.toFixed(2));
    if (horizontalGuide) {
      horizontalGuide.setAttribute('y1', y.toFixed(2));
      horizontalGuide.setAttribute('y2', y.toFixed(2));
    }
    var focusStart = Math.max(0, x - 150);
    var focusEnd = Math.min(width, x + 150);
    [positiveHoverDiffGradient, negativeHoverDiffGradient].forEach(function (gradient) {
      if (!gradient) return;
      gradient.setAttribute('x1', focusStart.toFixed(2));
      gradient.setAttribute('y1', '0');
      gradient.setAttribute('x2', focusEnd.toFixed(2));
      gradient.setAttribute('y2', '0');
    });
  }

  function syncCrosshair(clientX, clientY) {
    crosshairState.targetClientX = clientX;
    crosshairState.targetClientY = clientY;
    if (crosshairState.currentClientX === null) {
      crosshairState.currentClientX = clientX;
      crosshairState.currentClientY = clientY;
      renderCrosshair(clientX, clientY);
    }
    if (crosshairState.frame) return;

    function settleCrosshair() {
      var deltaX = crosshairState.targetClientX - crosshairState.currentClientX;
      var deltaY = crosshairState.targetClientY - crosshairState.currentClientY;
      if (Math.abs(deltaX) < .05 && Math.abs(deltaY) < .05) {
        crosshairState.currentClientX = crosshairState.targetClientX;
        crosshairState.currentClientY = crosshairState.targetClientY;
      } else {
        // Más fino que el tooltip (.24): conserva presencia física sin vibración.
        crosshairState.currentClientX += deltaX * .48;
        crosshairState.currentClientY += deltaY * .48;
      }
      renderCrosshair(crosshairState.currentClientX, crosshairState.currentClientY);
      if (crosshairState.currentClientX !== crosshairState.targetClientX || crosshairState.currentClientY !== crosshairState.targetClientY) {
        crosshairState.frame = window.requestAnimationFrame(settleCrosshair);
      } else {
        crosshairState.frame = 0;
      }
    }
    crosshairState.frame = window.requestAnimationFrame(settleCrosshair);
  }

  function inspectAt(clientX, clientY) {
    hoverState.targetClientX = clientX;
    if (typeof clientY === 'number') hoverState.targetClientY = clientY;
    syncCrosshair(clientX, typeof clientY === 'number' ? clientY : hoverState.targetClientY);
    stage.classList.add('is-inspecting');
    setAutomaticZoomTarget(clientX);
    if (hoverState.currentClientX === null) hoverState.currentClientX = clientX;
    if (hoverState.frame) return;

    function settleHover() {
      var difference = hoverState.targetClientX - hoverState.currentClientX;
      if (Math.abs(difference) < .2) {
        hoverState.currentClientX = hoverState.targetClientX;
      } else {
        // Una amortiguación breve elimina el jitter sin generar un retraso perceptible.
        hoverState.currentClientX += difference * .24;
      }

      renderInspectionAt(hoverState.currentClientX);
      if (hoverState.currentClientX !== hoverState.targetClientX) {
        hoverState.frame = window.requestAnimationFrame(settleHover);
      } else {
        hoverState.frame = 0;
      }
    }

    hoverState.frame = window.requestAnimationFrame(settleHover);
  }

  document.querySelectorAll('[data-period]').forEach(function (button) {
    button.addEventListener('click', function () {
      activatePeriod(button.getAttribute('data-period'));
    });
  });

  function currentChartMode() {
    if (preference('normalizedBaseline', false) === true) return 'normalized';
    return currentAggregation === 'cumulative' ? 'cumulative' : 'standard';
  }

  function chartModeFullLabel(mode) {
    return {
      standard: 'Absoluto',
      cumulative: 'Acumulativo',
      normalized: 'Diferencial'
    }[mode] || 'Absoluto';
  }

  function syncChartMode(button) {
    if (!button) return;
    var picker = button.closest('.chart-mode-picker');
    if (picker) {
      var currentLabel = picker.querySelector('[data-chart-mode-current]');
      var options = picker.querySelector('.chart-mode-options');
      if (currentLabel) currentLabel.textContent = chartModeFullLabel(button.getAttribute('data-chart-mode'));
      var optionsLeft = options ? options.offsetLeft : 0;
      picker.style.setProperty('--chart-mode-left', (optionsLeft + button.offsetLeft) + 'px');
      picker.style.setProperty('--chart-mode-width', button.offsetWidth + 'px');
      var fullLabelWidth = currentLabel ? currentLabel.offsetWidth : button.offsetWidth;
      picker.style.setProperty('--chart-mode-collapsed-width', (fullLabelWidth + 10) + 'px');
      if (options) picker.style.setProperty('--chart-mode-expanded-width', (options.scrollWidth + 10) + 'px');
    }
    document.querySelectorAll('[data-chart-mode]').forEach(function (item) {
      var isActive = item === button;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-pressed', String(isActive));
    });
  }

  var initialChartMode = currentChartMode();
  var initialChartModeButton = document.querySelector('[data-chart-mode="' + initialChartMode + '"]');
  syncChartMode(initialChartModeButton);
  window.requestAnimationFrame(function () { syncChartMode(initialChartModeButton); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { syncChartMode(initialChartModeButton); });

  function openChartModeSwitch(picker) {
    if (!picker) return;
    window.clearTimeout(picker.__modeCloseTimer);
    window.clearTimeout(picker.__modeLabelTimer);
    picker.classList.remove('is-closing');
    picker.classList.add('is-expanded');
  }

  function closeChartModeSwitch(picker, force) {
    if (!picker || (!force && picker.matches(':hover'))) return;
    picker.classList.remove('is-expanded');
    picker.classList.add('is-closing');
    window.clearTimeout(picker.__modeLabelTimer);
    picker.__modeLabelTimer = window.setTimeout(function () {
      picker.classList.remove('is-closing');
    }, 160);
  }

  var chartModePicker = document.querySelector('.chart-mode-picker');
  if (chartModePicker) {
    chartModePicker.addEventListener('pointerenter', function () { openChartModeSwitch(chartModePicker); });
    chartModePicker.addEventListener('pointerleave', function () {
      window.clearTimeout(chartModePicker.__modeCloseTimer);
      chartModePicker.__modeCloseTimer = window.setTimeout(function () {
        closeChartModeSwitch(chartModePicker);
      }, 400);
    });
  }

  function revealChartModeSwitch() {
    if (!chartModePicker) return;
    window.clearTimeout(chartModePicker.__keyboardExpandTimer);
    openChartModeSwitch(chartModePicker);
    chartModePicker.__keyboardExpandTimer = window.setTimeout(function () {
      closeChartModeSwitch(chartModePicker);
    }, 920);
  }

  function activateChartMode(mode, animateSwitch) {
    var button = document.querySelector('[data-chart-mode="' + mode + '"]');
    if (!button) return;
    function applyMode() {
      currentAggregation = mode === 'cumulative' ? 'cumulative' : 'rolling';
      savePreference('aggregation', currentAggregation);
      savePreference('normalizedBaseline', mode === 'normalized');
      syncChartMode(button);
      preserveAlertPresentationOnNextRender = true;
      render(currentPeriod);
    }
    if (animateSwitch) {
      revealChartModeSwitch();
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(applyMode);
      });
    } else {
      applyMode();
    }
  }

  document.querySelectorAll('[data-chart-mode]').forEach(function (button) {
    button.addEventListener('click', function () {
      activateChartMode(button.getAttribute('data-chart-mode'));
    });
  });

  function syncChartMetric(button) {
    if (!button) return;
    var picker = button.closest('.chart-metric-picker');
    if (picker) {
      var currentLabel = picker.querySelector('[data-chart-metric-current]');
      var options = picker.querySelector('.chart-metric-options');
      if (currentLabel) currentLabel.textContent = button.textContent;
      var optionsLeft = options ? options.offsetLeft : 0;
      picker.style.setProperty('--chart-metric-left', (optionsLeft + button.offsetLeft) + 'px');
      picker.style.setProperty('--chart-metric-width', button.offsetWidth + 'px');
      var fullLabelWidth = currentLabel ? currentLabel.offsetWidth : button.offsetWidth;
      picker.style.setProperty('--chart-metric-collapsed-width', (fullLabelWidth + 10) + 'px');
      if (options) picker.style.setProperty('--chart-metric-expanded-width', (options.scrollWidth + 10) + 'px');
    }
    document.querySelectorAll('[data-chart-metric]').forEach(function (item) {
      var isActive = item === button;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-pressed', String(isActive));
    });
  }

  function activateChartMetric(metric) {
    if (metric !== 'revenue' && metric !== 'conversion') return;
    var button = document.querySelector('[data-chart-metric="' + metric + '"]');
    if (!button || chartMetric === metric) return;
    chartMetric = metric;
    savePreference('chartMetric', chartMetric);
    syncChartMetric(button);
    // El control sigue siendo financiero aunque la gráfica se exprese en CR.
    // Preservamos el estado de despliegue de la etiqueta de alarma.
    preserveAlertPresentationOnNextRender = true;
    render(currentPeriod);
  }

  var initialMetricButton = document.querySelector('[data-chart-metric="' + chartMetric + '"]');
  syncChartMetric(initialMetricButton);
  window.requestAnimationFrame(function () { syncChartMetric(initialMetricButton); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { syncChartMetric(initialMetricButton); });
  function openChartMetricSwitch(picker) {
    if (!picker) return;
    window.clearTimeout(picker.__metricCloseTimer);
    window.clearTimeout(picker.__metricLabelTimer);
    picker.classList.remove('is-closing');
    picker.classList.add('is-expanded');
  }

  function closeChartMetricSwitch(picker) {
    if (!picker) return;
    picker.classList.remove('is-expanded');
    picker.classList.add('is-closing');
    window.clearTimeout(picker.__metricLabelTimer);
    picker.__metricLabelTimer = window.setTimeout(function () {
      picker.classList.remove('is-closing');
    }, 160);
  }

  var chartMetricPicker = document.querySelector('.chart-metric-picker');
  if (chartMetricPicker) {
    chartMetricPicker.addEventListener('pointerenter', function () { openChartMetricSwitch(chartMetricPicker); });
    chartMetricPicker.addEventListener('pointerleave', function () {
      window.clearTimeout(chartMetricPicker.__metricCloseTimer);
      chartMetricPicker.__metricCloseTimer = window.setTimeout(function () {
        closeChartMetricSwitch(chartMetricPicker);
      }, 400);
    });
  }
  document.querySelectorAll('[data-chart-metric]').forEach(function (button) {
    button.addEventListener('click', function () {
      activateChartMetric(button.getAttribute('data-chart-metric'));
    });
  });

  var markersToggle = document.querySelector('[data-markers-toggle]');
  if (markersToggle) {
    var markersAreVisible = preference('markers', true) !== false;
    markersToggle.classList.toggle('is-active', markersAreVisible);
    markersToggle.setAttribute('aria-pressed', String(markersAreVisible));
    markersToggle.setAttribute('aria-label', markersAreVisible ? 'Ocultar marcadores A/B Testing' : 'Mostrar marcadores A/B Testing');
    annotations.hidden = !markersAreVisible;
    markersToggle.addEventListener('click', function () {
      var areVisible = markersToggle.getAttribute('aria-pressed') !== 'true';
      markersToggle.classList.toggle('is-active', areVisible);
      markersToggle.setAttribute('aria-pressed', String(areVisible));
      markersToggle.setAttribute('aria-label', areVisible ? 'Ocultar marcadores A/B Testing' : 'Mostrar marcadores A/B Testing');
      annotations.hidden = !areVisible;
      savePreference('markers', areVisible);
    });
  }

  var alternateChartToggle = document.querySelector('[data-alternate-chart-toggle]');
  if (alternateChartToggle) {
    var advancedChartEnabled = preference('advancedChart', false) === true;
    alternateChartToggle.classList.toggle('is-active', advancedChartEnabled);
    alternateChartToggle.setAttribute('aria-pressed', String(advancedChartEnabled));
    alternateChartToggle.setAttribute('aria-label', advancedChartEnabled ? 'Desactivar modo avanzado' : 'Activar modo avanzado');
    stage.classList.toggle('is-alternate-chart', advancedChartEnabled);
    alternateChartToggle.addEventListener('click', function () {
      var isAlternate = alternateChartToggle.getAttribute('aria-pressed') !== 'true';
      alternateChartToggle.classList.toggle('is-active', isAlternate);
      alternateChartToggle.setAttribute('aria-pressed', String(isAlternate));
      alternateChartToggle.setAttribute('aria-label', isAlternate ? 'Desactivar modo avanzado' : 'Activar modo avanzado');
      stage.classList.toggle('is-alternate-chart', isAlternate);
      savePreference('advancedChart', isAlternate);
      render(currentPeriod);
      if (isAlternate) {
        // El modo avanzado nace tras la entrada de la página. Lo reproducimos
        // en el siguiente frame, cuando ya tiene su geometría SVG definitiva.
        window.requestAnimationFrame(function () { playChartEntrance(true); });
      }
    });
  }

  var settingsControl = document.querySelector('[data-settings-control]');
  if (settingsControl) {
    var settingsToggle = settingsControl.querySelector('[data-settings-toggle]');
    settingsToggle.addEventListener('click', function () {
      var isOpen = settingsControl.classList.toggle('is-open');
      settingsToggle.setAttribute('aria-expanded', String(isOpen));
    });
    document.addEventListener('click', function (event) {
      if (event.target.closest('[data-settings-control]')) return;
      settingsControl.classList.remove('is-open');
      settingsToggle.setAttribute('aria-expanded', 'false');
    });
  }

  hitArea.addEventListener('pointerdown', function (event) {
    if (!interactiveNavigationEnabled) return;
    var rect = hitArea.getBoundingClientRect();
    dragState = { pointerId: event.pointerId, clientX: event.clientX, pan: chartView.pan, visibleSpan: 1 / chartView.zoom, rectWidth: rect.width };
    hitArea.setPointerCapture(event.pointerId);
    stage.classList.add('is-panning', 'is-navigating');
  });
  hitArea.addEventListener('pointermove', function (event) {
    if (interactiveNavigationEnabled && dragState && dragState.pointerId === event.pointerId) {
      chartView.pan = dragState.pan - ((event.clientX - dragState.clientX) / dragState.rectWidth) * dragState.visibleSpan;
      applyChartView();
    }
    setControlZoomActive(event.shiftKey);
    inspectAt(event.clientX, event.clientY);
  });
  window.addEventListener('pointerrawupdate', function (event) {
    var rect = hitArea.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) return;
    // pointerrawupdate no agrupa muestras: el retículo se actualiza con el
    // último dato físico disponible, sin tocar el tooltip suavizado.
    syncCrosshair(event.clientX, event.clientY);
  }, { passive: true });
  document.addEventListener('pointermove', function (event) {
    lastPointerPosition = { clientX: event.clientX, clientY: event.clientY };
  }, { passive: true });
  window.addEventListener('faustos:loader-leaving', function () {
    window.requestAnimationFrame(function () {
      var pointer = lastPointerPosition || window.__faustosLastPointer;
      if (!pointer) return;
      var rect = hitArea.getBoundingClientRect();
      var isOverChart = pointer.clientX >= rect.left && pointer.clientX <= rect.right && pointer.clientY >= rect.top && pointer.clientY <= rect.bottom;
      if (isOverChart) inspectAt(pointer.clientX, pointer.clientY);
    });
  });
  function endChartDrag(event) {
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    if (hitArea.hasPointerCapture(event.pointerId)) hitArea.releasePointerCapture(event.pointerId);
    dragState = null;
    stage.classList.remove('is-panning', 'is-navigating');
  }
  hitArea.addEventListener('pointerup', endChartDrag);
  hitArea.addEventListener('pointercancel', endChartDrag);
  hitArea.addEventListener('wheel', function (event) {
    if (!interactiveNavigationEnabled) return;
    event.preventDefault();
    zoomChartAt(event.clientX, event.deltaY < 0 ? 1.12 : 1 / 1.12);
  }, { passive: false });
  hitArea.addEventListener('pointerenter', function (event) {
    setControlZoomActive(event.shiftKey);
    inspectAt(event.clientX, event.clientY);
  });
  hitArea.addEventListener('pointerleave', function () {
    if (stage.classList.contains('is-hovering-alert-run') && !persistentCriticalRun) stage.classList.remove('is-historical-alert-revealed');
    stage.classList.remove('is-inspecting');
    stage.classList.remove('is-hovering-critical');
    stage.classList.remove('is-hovering-alert-run');
    stage.classList.remove('is-current-critical-event');
    hoveredCriticalRunKey = null;
    hoveredCriticalRun = null;
    if (hoverState.frame) window.cancelAnimationFrame(hoverState.frame);
    hoverState.frame = 0;
    hoverState.targetClientX = null;
    hoverState.targetClientY = null;
    hoverState.currentClientX = null;
    if (crosshairState.frame) window.cancelAnimationFrame(crosshairState.frame);
    crosshairState.frame = 0;
    crosshairState.targetClientX = null;
    crosshairState.targetClientY = null;
    crosshairState.currentClientX = null;
    crosshairState.currentClientY = null;
    autoZoomState.targetIntensity = 0;
    autoZoomState.targetFocusValue = .5;
    settleAutomaticZoom();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Shift') setControlZoomActive(true);

    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    var target = event.target;
    if (target && (target.matches('input, textarea, select') || target.isContentEditable)) return;

    if (event.altKey) {
      var modeOrder = ['standard', 'normalized', 'cumulative'];
      var modeIndex = modeOrder.indexOf(currentChartMode());
      var modeDirection = event.key === 'ArrowRight' ? 1 : -1;
      var nextModeIndex = (modeIndex + modeDirection + modeOrder.length) % modeOrder.length;
      activateChartMode(modeOrder[nextModeIndex], true);
      event.preventDefault();
      return;
    }

    var periodOrder = ['1m', '3m', '6m', '1y'];
    var currentIndex = periodOrder.indexOf(currentPeriod);
    var direction = event.key === 'ArrowRight' ? 1 : -1;
    var nextIndex = (currentIndex + direction + periodOrder.length) % periodOrder.length;

    event.preventDefault();
    revealPeriodSwitch();
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        activatePeriod(periodOrder[nextIndex]);
      });
    });
  });
  document.addEventListener('keyup', function (event) {
    if (event.key === 'Shift') setControlZoomActive(false);
  });
  window.addEventListener('blur', function () { setControlZoomActive(false); });

  function downloadTransactions(format) {
    if (!data) return;
    var dateFormatter = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'medium' });
    var values = [['Fecha y hora', 'Tipo de artículo', 'Ingreso neto', 'A/B']].concat(transactions.map(function (transaction) {
      return [dateFormatter.format(new Date(transaction.timestamp)), transaction.article, transaction.netRevenue, transaction.ab];
    }));
    var isExcel = format === 'xlsx';
    var csv = '\ufeff' + values.map(function (row) { return row.map(function (value) { return '"' + String(value).replace(/"/g, '""') + '"'; }).join(','); }).join('\r\n');
    var spreadsheet = '<html><head><meta charset="utf-8"></head><body><table>' + values.map(function (row, rowIndex) {
      return '<tr>' + row.map(function (cell) {
        var tag = rowIndex ? 'td' : 'th';
        return '<' + tag + '>' + String(cell).replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</' + tag + '>';
      }).join('') + '</tr>';
    }).join('') + '</table></body></html>';
    var blob = new Blob([isExcel ? spreadsheet : csv], { type: isExcel ? 'application/vnd.ms-excel;charset=utf-8' : 'text/csv;charset=utf-8' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'faustos-transacciones.' + (isExcel ? 'xls' : 'csv');
    link.click();
    URL.revokeObjectURL(link.href);
  }

  document.querySelectorAll('[data-download-control]').forEach(function (control) {
    var toggle = control.querySelector('[data-download-toggle]');
    toggle.addEventListener('click', function () {
      var isOpen = control.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
    control.querySelectorAll('[data-download-format]').forEach(function (button) {
      button.addEventListener('click', function () {
        downloadTransactions(button.getAttribute('data-download-format'));
        control.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  });
  document.addEventListener('click', function (event) {
    if (!event.target.closest('[data-download-control]')) {
      document.querySelectorAll('[data-download-control]').forEach(function (control) {
        control.classList.remove('is-open');
        control.querySelector('[data-download-toggle]').setAttribute('aria-expanded', 'false');
      });
    }
  });

  document.querySelectorAll('.os-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.os-tab').forEach(function (item) {
        var selected = item === tab;
        item.classList.toggle('is-active', selected);
        if (selected) item.setAttribute('aria-current', 'page');
        else item.removeAttribute('aria-current');
      });
    });
  });

  var initialPeriodButton = document.querySelector('[data-period="' + currentPeriod + '"]');
  document.querySelectorAll('[data-period]').forEach(function (button) {
    var isInitialPeriod = button === initialPeriodButton;
    button.classList.toggle('is-active', isInitialPeriod);
    button.setAttribute('aria-pressed', String(isInitialPeriod));
  });
  render(currentPeriod);
  if (initialPeriodButton) syncPeriodSwitch(initialPeriodButton);
  requestAnimationFrame(function () {
    syncChartViewportGap();
    syncAnnotationLines();
    applyChartView();
  });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(syncAnnotationLines);
  }
  window.addEventListener('resize', function () {
    syncPeriodSwitch(document.querySelector('[data-period].is-active'));
    syncChartViewportGap();
    syncAnnotationLines();
    applyChartView();
  });
  // La interfaz entra en conjunto, pero el trazo mantiene su propia entrada.
  window.addEventListener('faustos:initial-ready', playChartEntrance, { once: true });
  }

  window.FaustOSDashboard = { init: init };
  if (document.querySelector('[data-os-page="dashboard"]')) init();
})();
