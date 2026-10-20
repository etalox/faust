// A deliberately limited Markdown-like format for versioned legal documents.
// Text is inserted as DOM text, never interpreted as arbitrary HTML.
function appendInline(parent, text) {
  const appendText = (target, value) => {
    value.split('\n').forEach((part, index) => {
      if (index) target.append(document.createElement('br'));
      if (part) target.append(document.createTextNode(part));
    });
  };
  const bold = /\*\*([\s\S]*?)\*\*/g;
  let position = 0;
  for (const match of text.matchAll(bold)) {
    appendText(parent, text.slice(position, match.index));
    const strong = document.createElement('strong');
    appendText(strong, match[1]);
    parent.append(strong);
    position = match.index + match[0].length;
  }
  appendText(parent, text.slice(position));
}

function joinLines(lines) {
  let result = '';
  for (const raw of lines) {
    const line = raw.trim();
    if (!result) result = line;
    else if (result.endsWith('\\')) result = result.slice(0, -1) + '\n' + line;
    else result += ' ' + line;
  }
  return result.endsWith('\\') ? result.slice(0, -1) + '\n' : result;
}

function listInfo(line) {
  const match = /^( *)(-|\d+\.|[a-z]+\))\s+(.+)$/.exec(line);
  if (!match) return null;
  if (match[1].length % 2 || match[1].length > 4) {
    throw new Error('La sangría de una lista debe ser de 0, 2 o 4 espacios.');
  }
  const marker = match[2];
  const kind = marker === '-' ? 'bullet' : marker.endsWith('.') ? 'number' : 'alpha';
  const number = kind === 'number' ? Number.parseInt(marker, 10)
    : kind === 'alpha' ? [...marker.slice(0, -1)].reduce((n, char) => n * 26 + char.charCodeAt(0) - 96, 0) : 0;
  if (kind !== 'bullet' && (!Number.isSafeInteger(number) || number < 1)) {
    throw new Error('La numeración de una lista no es válida.');
  }
  return { kind, number, indent: match[1].length / 2, text: match[3] };
}

export function parseLegalText(text) {
  const lines = text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').split('\n');
  if (lines.shift()?.trim() !== '---') throw new Error('Faltan los datos iniciales del documento.');
  const metadata = {};
  while (lines.length && lines[0].trim() !== '---') {
    const line = lines.shift();
    const separator = line.indexOf(':');
    if (separator < 1) throw new Error('Hay un dato inicial que no se puede interpretar.');
    const key = line.slice(0, separator).trim().toLowerCase();
    if (Object.hasOwn(metadata, key)) throw new Error('Hay un dato inicial duplicado: ' + key);
    metadata[key] = line.slice(separator + 1).trim();
  }
  if (lines.shift()?.trim() !== '---') throw new Error('Falta cerrar los datos iniciales del documento.');
  for (const key of ['versión', 'emisión', 'marco', 'marca']) {
    if (!metadata[key]) throw new Error('Falta el dato inicial: ' + key);
  }
  while (lines[0] === '') lines.shift();
  if (!/^#\s+/.test(lines[0] || '')) throw new Error('Falta el título del documento.');
  const titleLines = [lines.shift().replace(/^#\s+/, '')];
  while (lines.length && lines[0].trim()) titleLines.push(lines.shift());

  const header = document.createElement('header');
  const title = document.createElement('h1');
  appendInline(title, joinLines(titleLines));
  header.append(title);
  const meta = document.createElement('p');
  meta.className = 'legal-document__metadata';
  const marco = document.createElement('span');
  marco.className = 'legal-document__metadata-marco';
  marco.textContent = metadata.marco;
  meta.append(marco, document.createElement('br'));
  const dateLabel = Object.hasOwn(metadata, 'etiqueta de fecha') ? metadata['etiqueta de fecha'] : 'Emisión';
  [metadata['versión'].replace(/^V/, 'v'), (dateLabel ? dateLabel + ': ' : '') + metadata['emisión'], metadata.marca].forEach((value, index) => {
    if (index) meta.append(document.createTextNode(' | '));
    const span = document.createElement('span');
    if (index === 0) span.className = 'legal-document__metadata-version';
    if (index === 1) span.className = 'legal-document__metadata-date';
    if (index === 2) span.className = 'legal-document__metadata-brand';
    span.textContent = value;
    meta.append(span);
  });
  header.append(meta);

  // The site's translation helper protects brand names in the initial DOM.
  // Apply the same protection to the header loaded later from the text file.
  const walker = document.createTreeWalker(header, NodeFilter.SHOW_TEXT);
  const brandNodes = [];
  while (walker.nextNode()) brandNodes.push(walker.currentNode);
  for (const node of brandNodes) {
    const text = node.nodeValue;
    const pattern = /Faust\s*Partners™?/gi;
    const matches = [...text.matchAll(pattern)];
    if (!matches.length) continue;
    const fragment = document.createDocumentFragment();
    let position = 0;
    for (const match of matches) {
      fragment.append(document.createTextNode(text.slice(position, match.index)));
      const brand = document.createElement('span');
      brand.className = 'notranslate';
      brand.setAttribute('translate', 'no');
      brand.textContent = match[0];
      fragment.append(brand);
      position = match.index + match[0].length;
    }
    fragment.append(document.createTextNode(text.slice(position)));
    node.replaceWith(fragment);
  }

  const article = document.createElement('article');
  article.className = 'notranslate';
  article.setAttribute('translate', 'no');
  let block = null;
  let seenHeading = false;
  let lastList = null;
  let expectedNumber = 1;

  function getBlock() {
    if (!block) {
      block = document.createElement('div');
      block.className = 'legal-document__block';
      article.append(block);
    }
    return block;
  }

  for (let i = 0; i < lines.length;) {
    if (!lines[i].trim()) { lastList = null; i += 1; continue; }
    const heading = /^(#{2,3})\s+(.+)$/.exec(lines[i]);
    if (heading) {
      seenHeading = true;
      lastList = null;
      const element = document.createElement(heading[1].length === 2 ? 'h2' : 'h3');
      const content = [heading[2]];
      i += 1;
      while (i < lines.length && lines[i].trim() && !/^(#{1,3})\s+/.test(lines[i]) && !listInfo(lines[i])) content.push(lines[i++]);
      appendInline(element, joinLines(content));
      if (element.tagName === 'H2') {
        article.append(element);
        block = null;
      } else {
        const section = document.createElement('section');
        block = document.createElement('div');
        block.className = 'legal-document__block';
        section.append(element, block);
        article.append(section);
      }
      continue;
    }

    const item = listInfo(lines[i]);
    if (item) {
      const parent = getBlock();
      const listKey = item.kind + ':' + item.indent;
      if (!lastList || lastList.key !== listKey) {
        const element = document.createElement(item.kind === 'bullet' ? 'ul' : 'ol');
        if (item.kind === 'alpha') element.setAttribute('type', 'a');
        if (item.kind !== 'bullet' && item.number !== 1) element.setAttribute('start', String(item.number));
        if (item.indent === 1) element.className = 'legal-document__list--nested';
        if (item.indent === 2) element.className = 'legal-document__list--deep';
        parent.append(element);
        lastList = { key: listKey, element };
        expectedNumber = item.number;
      }
      const li = document.createElement('li');
      if (item.kind !== 'bullet' && item.number !== expectedNumber) li.setAttribute('value', String(item.number));
      expectedNumber = item.number + 1;
      const content = [item.text];
      i += 1;
      while (i < lines.length && lines[i].trim() && !/^(#{1,3})\s+/.test(lines[i]) && !listInfo(lines[i])) content.push(lines[i++]);
      appendInline(li, joinLines(content));
      lastList.element.append(li);
      continue;
    }

    if (/^#\s+/.test(lines[i])) throw new Error('El documento no puede tener más de un título principal.');
    lastList = null;
    const content = [lines[i++]];
    while (i < lines.length && lines[i].trim() && !/^(#{1,3})\s+/.test(lines[i]) && !listInfo(lines[i])) content.push(lines[i++]);
    const p = document.createElement('p');
    appendInline(p, joinLines(content));
    (seenHeading ? getBlock() : article).append(p);
  }
  return { header, article, version: metadata['versión'], emission: metadata['emisión'] };
}
