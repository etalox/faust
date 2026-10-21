// Minimal ZIP writer for the two verification artifacts. Files are stored
// without compression so the archive remains portable and requires no CDN.
const encoder = new TextEncoder();
const crcTable = Uint32Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) value = (value & 1) ? (value >>> 1) ^ 0xedb88320 : value >>> 1;
  return value >>> 0;
});

function crc32(bytes) {
  let value = 0xffffffff;
  for (const byte of bytes) value = (value >>> 8) ^ crcTable[(value ^ byte) & 0xff];
  return (value ^ 0xffffffff) >>> 0;
}

function writeUint16(view, offset, value) {
  view.setUint16(offset, value, true);
}

function writeUint32(view, offset, value) {
  view.setUint32(offset, value, true);
}

function dosTimestamp(date = new Date()) {
  const year = Math.max(1980, date.getFullYear());
  return {
    time: (date.getSeconds() >> 1) | (date.getMinutes() << 5) | (date.getHours() << 11),
    date: date.getDate() | ((date.getMonth() + 1) << 5) | ((year - 1980) << 9)
  };
}

function concat(chunks, length) {
  const result = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

export async function createLegalArchive(pdfBlob, pdfName, pdfHash) {
  const baseName = pdfName.replace(/\.pdf$/i, '');
  const hashName = `${baseName}.sha256.txt`;
  const hashText = `Archivo: ${pdfName}\nSHA-256: ${pdfHash}\n`;
  const files = [
    { name: pdfName, bytes: new Uint8Array(await pdfBlob.arrayBuffer()) },
    { name: hashName, bytes: encoder.encode(hashText) }
  ].map(file => ({ ...file, nameBytes: encoder.encode(file.name) }));

  const stamp = dosTimestamp();
  const locals = [];
  const central = [];
  let localOffset = 0;
  for (const file of files) {
    const checksum = crc32(file.bytes);
    const local = new Uint8Array(30 + file.nameBytes.length + file.bytes.length);
    const localView = new DataView(local.buffer);
    writeUint32(localView, 0, 0x04034b50);
    writeUint16(localView, 4, 20);
    writeUint16(localView, 6, 0x0800);
    writeUint16(localView, 8, 0);
    writeUint16(localView, 10, stamp.time);
    writeUint16(localView, 12, stamp.date);
    writeUint32(localView, 14, checksum);
    writeUint32(localView, 18, file.bytes.length);
    writeUint32(localView, 22, file.bytes.length);
    writeUint16(localView, 26, file.nameBytes.length);
    writeUint16(localView, 28, 0);
    local.set(file.nameBytes, 30);
    local.set(file.bytes, 30 + file.nameBytes.length);
    locals.push(local);

    const directory = new Uint8Array(46 + file.nameBytes.length);
    const directoryView = new DataView(directory.buffer);
    writeUint32(directoryView, 0, 0x02014b50);
    writeUint16(directoryView, 4, 20);
    writeUint16(directoryView, 6, 20);
    writeUint16(directoryView, 8, 0x0800);
    writeUint16(directoryView, 10, 0);
    writeUint16(directoryView, 12, stamp.time);
    writeUint16(directoryView, 14, stamp.date);
    writeUint32(directoryView, 16, checksum);
    writeUint32(directoryView, 20, file.bytes.length);
    writeUint32(directoryView, 24, file.bytes.length);
    writeUint16(directoryView, 28, file.nameBytes.length);
    writeUint16(directoryView, 30, 0);
    writeUint16(directoryView, 32, 0);
    writeUint16(directoryView, 34, 0);
    writeUint16(directoryView, 36, 0);
    writeUint32(directoryView, 38, 0);
    writeUint32(directoryView, 42, localOffset);
    directory.set(file.nameBytes, 46);
    central.push(directory);
    localOffset += local.length;
  }

  const centralSize = central.reduce((total, entry) => total + entry.length, 0);
  const footer = new Uint8Array(22);
  const footerView = new DataView(footer.buffer);
  writeUint32(footerView, 0, 0x06054b50);
  writeUint16(footerView, 4, 0);
  writeUint16(footerView, 6, 0);
  writeUint16(footerView, 8, files.length);
  writeUint16(footerView, 10, files.length);
  writeUint32(footerView, 12, centralSize);
  writeUint32(footerView, 16, localOffset);
  writeUint16(footerView, 20, 0);

  return new Blob([concat([...locals, ...central, footer], localOffset + centralSize + footer.length)], {
    type: 'application/zip'
  });
}
