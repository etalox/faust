const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const metricsPath = path.join(root, 'live', 'metrics.txt');
const pagePath = path.join(root, 'start', 'index.html');
const startMarker = '<!-- metrics:generated:start -->';
const endMarker = '<!-- metrics:generated:end -->';

function parseMetrics(text) {
  return text.split(/\r?\n/).reduce((metrics, rawLine) => {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) return metrics;

    const separator = line.lastIndexOf('-');
    if (separator === -1) return metrics;

    const fields = line.slice(separator + 1).split('|').map((field) => field.trim());
    if (fields.length < 3) return metrics;

    metrics.push({
      name: line.slice(0, separator).trim(),
      number: fields[0],
      title: fields[1],
      description: fields.slice(2).join(' | ')
    });
    return metrics;
  }, []);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[character]));
}

function renderMetrics(metrics) {
  const cards = metrics.map((metric) => `          <article class="stat reveal-item">
            <div class="stat-heading">${escapeHtml(metric.name)}</div>
            <div class="stat-number-wrap">
              <h3>${escapeHtml(metric.number)}</h3>
              <p class="title">${escapeHtml(metric.title)}</p>
            </div>
            <p class="desc">${escapeHtml(metric.description)}</p>
          </article>`).join('\n');

  return `${startMarker}\n${cards}\n          ${endMarker}`;
}

const metrics = parseMetrics(fs.readFileSync(metricsPath, 'utf8'));
if (!metrics.length) {
  throw new Error('live/metrics.txt does not contain valid metrics.');
}

const page = fs.readFileSync(pagePath, 'utf8');
const generatedBlock = renderMetrics(metrics);
const pattern = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`);
if (!pattern.test(page)) {
  throw new Error('Metrics markers were not found in start/index.html.');
}

fs.writeFileSync(pagePath, page.replace(pattern, generatedBlock), 'utf8');
console.log(`Synced ${metrics.length} landing metrics from live/metrics.txt.`);
