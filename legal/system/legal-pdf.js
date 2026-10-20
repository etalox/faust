// Generate a downloadable PDF from the legal document currently on the page.
// The library and typefaces are hosted locally; no document text is sent away.
const assetUrl = path => new URL('../../assets/' + path, import.meta.url).href;
let libraryPromise;
let fontsPromise;

function loadLibrary() {
  if (window.jspdf?.jsPDF) return Promise.resolve(window.jspdf.jsPDF);
  if (!libraryPromise) {
    libraryPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = assetUrl('vendor/jspdf-4.2.1/jspdf.umd.min.js');
      script.onload = () => window.jspdf?.jsPDF
        ? resolve(window.jspdf.jsPDF)
        : reject(new Error('No se encontró la biblioteca PDF.'));
      script.onerror = () => reject(new Error('No se pudo cargar la biblioteca PDF.'));
      document.head.appendChild(script);
    }).catch(error => {
      libraryPromise = undefined;
      throw error;
    });
  }
  return libraryPromise;
}

function loadFonts() {
  if (!fontsPromise) {
    fontsPromise = Promise.all(['BDOGrotesk-Regular.ttf', 'BDOGrotesk-Medium.ttf'].map(async name => {
      const response = await fetch(assetUrl('Fonts/' + name));
      if (!response.ok) throw new Error('No se pudo cargar la fuente PDF: ' + name);
      const bytes = new Uint8Array(await response.arrayBuffer());
      let binary = '';
      for (let i = 0; i < bytes.length; i += 8192) {
        binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
      }
      return btoa(binary);
    })).catch(error => {
      fontsPromise = undefined;
      throw error;
    });
  }
  return fontsPromise;
}

function inlineText(element) {
  function read(node) {
    if (node.nodeType === Node.TEXT_NODE) return node.nodeValue.replace(/\s+/g, ' ');
    if (node.nodeType !== Node.ELEMENT_NODE) return '';
    if (node.tagName === 'BR') return '\n';
    // Nested lists are rendered separately with their own markers.
    if (node.tagName === 'OL' || node.tagName === 'UL') return '';
    return Array.from(node.childNodes, read).join('');
  }
  return read(element).split('\n').map(line => line.trim()).join('\n').trim();
}

function listMarker(list, number) {
  if (list.tagName === 'UL') return '•';
  const type = list.getAttribute('type');
  if (type === 'a' || type === 'A') {
    let value = number;
    let letters = '';
    while (value > 0) {
      value -= 1;
      letters = String.fromCharCode(97 + value % 26) + letters;
      value = Math.floor(value / 26);
    }
    return (type === 'A' ? letters.toUpperCase() : letters) + ')';
  }
  if (type === 'i' || type === 'I') {
    let value = number;
    let roman = '';
    for (const [amount, digits] of [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
      [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'],
      [5, 'V'], [4, 'IV'], [1, 'I']]) {
      while (value >= amount) { roman += digits; value -= amount; }
    }
    return (type === 'i' ? roman.toLowerCase() : roman) + '.';
  }
  return number + '.';
}

export async function createLegalPdf(documentSnapshot, { fileId, emission } = {}) {
  const header = documentSnapshot.querySelector(':scope > header');
  const article = documentSnapshot.querySelector(':scope > article');
  if (!header || !article) throw new Error('El documento legal está incompleto.');

  const [jsPDF, fonts] = await Promise.all([loadLibrary(), loadFonts()]);
  const pdf = new jsPDF({ unit: 'pt', format: 'letter', compress: true });
  // Use document metadata rather than the current clock and a random PDF ID so
  // repeated exports of the same version produce the same bytes.
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const dateMatch = /^(\d{1,2})\s+de\s+([a-z]+)\s+de\s+(\d{4})$/i.exec(emission || '');
  const month = dateMatch ? months.indexOf(dateMatch[2].toLowerCase()) + 1 : 0;
  const day = dateMatch ? Number(dateMatch[1]) : 0;
  const year = dateMatch ? Number(dateMatch[3]) : 0;
  const date = new Date(Date.UTC(year, month - 1, day));
  const validDate = month > 0 && day > 0 && date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  const pdfDate = validDate ? `${dateMatch[3]}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}` : '20000101';
  pdf.setCreationDate(`D:${pdfDate}000000+00'00'`);
  pdf.setFileId(fileId || '00000000000000000000000000000000');
  pdf.addFileToVFS('BDO-Regular.ttf', fonts[0]);
  pdf.addFileToVFS('BDO-Medium.ttf', fonts[1]);
  pdf.addFont('BDO-Regular.ttf', 'BDO', 'normal');
  pdf.addFont('BDO-Medium.ttf', 'BDO', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.setProperties({ title: inlineText(header.querySelector('h1') || header), author: 'FaustPartners' });

  const width = pdf.internal.pageSize.getWidth();
  const height = pdf.internal.pageSize.getHeight();
  const margin = 54;
  const bottom = height - margin;
  let y = margin;

  function writeBlock(text, options = {}) {
    if (!text) return;
    const size = options.size || 10.5;
    const leading = options.leading || 15;
    const indent = options.indent || 0;
    const markerWidth = options.marker ? 20 : 0;
    const x = margin + indent + markerWidth;
    pdf.setFont('BDO', options.bold ? 'bold' : 'normal');
    pdf.setFontSize(size);
    const lines = text.split('\n').flatMap(line => line ? pdf.splitTextToSize(line, width - margin - x) : ['']);
    const before = options.before || 0;
    if (y + before + leading * Math.min(lines.length, options.keepLines || 1) > bottom) {
      pdf.addPage();
      y = margin;
    } else {
      y += before;
    }
    if (options.marker) pdf.text(options.marker, margin + indent, y + size);
    lines.forEach(line => {
      if (y + leading > bottom) {
        pdf.addPage();
        y = margin;
      }
      if (line) pdf.text(line, x, y + size);
      y += leading;
    });
    y += options.after ?? 7;
  }

  function writeList(list, depth = 0) {
    const items = Array.from(list.children).filter(item => item.tagName === 'LI');
    const reverse = list.hasAttribute('reversed');
    let number = list.hasAttribute('start') ? Number(list.getAttribute('start')) : (reverse ? items.length : 1);
    for (const item of items) {
      if (item.hasAttribute('value')) number = Number(item.getAttribute('value'));
      const visualDepth = list.classList.contains('legal-document__list--deep') ? 2
        : list.classList.contains('legal-document__list--nested') ? 1 : depth;
      writeBlock(inlineText(item), { marker: listMarker(list, number), indent: 12 + visualDepth * 18, after: 5 });
      for (const child of item.children) {
        if (child.tagName === 'OL' || child.tagName === 'UL') writeList(child, depth + 1);
      }
      number += reverse ? -1 : 1;
    }
    y += 2;
  }

  function writeContent(container) {
    for (const child of container.children) {
      const tag = child.tagName;
      if (tag === 'OL' || tag === 'UL') writeList(child);
      else if (tag === 'H1') writeBlock(inlineText(child), { size: 17, leading: 21, bold: true, after: 10, keepLines: 2 });
      else if (tag === 'H2') writeBlock(inlineText(child), { size: 13, leading: 17, bold: true, before: 12, after: 7, keepLines: 2 });
      else if (/^H[3-6]$/.test(tag)) writeBlock(inlineText(child), { bold: true, before: 6, after: 5, keepLines: 2 });
      else if (tag === 'P' || tag === 'BLOCKQUOTE' || tag === 'PRE') writeBlock(inlineText(child));
      else writeContent(child);
    }
  }

  // Ignore the interactive controls generated inside the header.
  for (const child of header.children) {
    if (child.matches('h1')) writeBlock(inlineText(child), { size: 17, leading: 21, bold: true, after: 10, keepLines: 2 });
    else if (child.matches('p')) writeBlock(inlineText(child), { size: 9.5, leading: 13, after: 18 });
  }
  writeContent(article);

  const totalPages = pdf.getNumberOfPages();
  pdf.setFont('BDO', 'normal');
  pdf.setFontSize(9);
  for (let page = 1; page <= totalPages; page += 1) {
    pdf.setPage(page);
    pdf.text(String(page), width - margin, height - 32, { align: 'right' });
  }
  return pdf.output('arraybuffer');
}
