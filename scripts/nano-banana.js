const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function loadLocalEnvironment() {
  const envPath = path.join(root, '.env');
  if (!fs.existsSync(envPath)) return;
  for (const rawLine of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

function readArguments() {
  const args = process.argv.slice(2);
  const valueAfter = (flag) => args[args.indexOf(flag) + 1];
  const prompt = valueAfter('--prompt');
  if (!prompt) {
    throw new Error('Uso: node scripts/nano-banana.js --prompt "..." [--input ruta/a/referencia.png] [--out assets/Thumbnails/nueva.png]');
  }
  return {
    prompt,
    input: valueAfter('--input'),
    output: valueAfter('--out') || 'assets/Thumbnails/Thumbnail_generated.png'
  };
}

function imagePart(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const mimeTypes = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
  if (!mimeTypes[extension]) throw new Error('La imagen de referencia debe ser PNG, JPG o WEBP.');
  return { inline_data: { mime_type: mimeTypes[extension], data: fs.readFileSync(filePath).toString('base64') } };
}

async function main() {
  loadLocalEnvironment();
  const { prompt, input, output } = readArguments();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Falta GEMINI_API_KEY. Escríbela en el archivo .env de la raíz del proyecto.');

  const parts = [{ text: prompt }];
  if (input) {
    const inputPath = path.resolve(root, input);
    if (!fs.existsSync(inputPath)) throw new Error(`No se encontró la imagen de referencia: ${input}`);
    parts.push(imagePart(inputPath));
  }

  const model = process.env.NANO_BANANA_MODEL || 'gemini-2.5-flash-image';
  const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        responseFormat: { image: { aspectRatio: '16:9' } }
      }
    })
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error?.message || 'Nano Banana no pudo generar la imagen.');

  const outputPart = payload.candidates?.flatMap((candidate) => candidate.content?.parts || [])
    .find((part) => part.inlineData?.data || part.inline_data?.data);
  const image = outputPart?.inlineData || outputPart?.inline_data;
  if (!image?.data) throw new Error('Nano Banana respondió sin una imagen. Ajusta el prompt e inténtalo de nuevo.');

  const outputPath = path.resolve(root, output);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, Buffer.from(image.data, 'base64'));
  console.log(`Miniatura guardada en ${path.relative(root, outputPath)}`);
  require('./generate-thumbnail-manifest.js');
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});
