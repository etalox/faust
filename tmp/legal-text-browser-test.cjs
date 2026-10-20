const { chromium } = require('C:/Users/franc/AppData/Roaming/npm/node_modules/agent-browser/node_modules/playwright-core');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Users/franc/AppData/Local/ms-playwright/chromium-1208/chrome-win64/chrome.exe', headless: true });
  const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('dialog', d => { errors.push(d.message()); d.dismiss(); });
  async function capture(url, screenshot) {
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.locator('faust-legal-document > article').waitFor();
    await page.locator('.legal-document__download').waitFor();
    await page.screenshot({ path: screenshot, fullPage: true });
    return page.evaluate(() => {
      const component = document.querySelector('faust-legal-document');
      const clone = component.cloneNode(true);
      clone.querySelector('.legal-document__actions')?.remove();
      for (const wrapper of clone.querySelectorAll('.responsive-br')) wrapper.replaceWith(...wrapper.childNodes);
      for (const item of clone.querySelectorAll('.no-br')) item.classList.remove('no-br');
      const canon = node => {
        if (node.nodeType === Node.TEXT_NODE) {
          const value = node.nodeValue.replace(/\s+/g, ' ');
          return value.trim() ? ['text', value] : null;
        }
        if (node.nodeType !== Node.ELEMENT_NODE) return null;
        const attrs = Array.from(node.attributes).filter(a => a.name !== 'class' || a.value).sort((a,b) => a.name.localeCompare(b.name)).map(a => [a.name,a.value]);
        return [node.tagName, attrs, Array.from(node.childNodes, canon).filter(Boolean)];
      };
      return { header: canon(clone.querySelector('header')), article: canon(clone.querySelector('article')) };
    });
  }
  const before = await capture('http://127.0.0.1:8765/terminos-incorporacion.html', 'tmp/legal-before.png');
  const after = await capture('http://127.0.0.1:8765/legal/terminos-incorporacion.html', 'tmp/legal-after.png');
  const assets = await page.evaluate(() => ({
    brokenImages: Array.from(document.images).filter(image => !image.complete || !image.naturalWidth).map(image => image.src),
    logo: document.querySelector('#nav-isotipo')?.src,
    navbarHome: document.querySelector('.nav-inner > a')?.href,
    footerPrivacy: Array.from(document.querySelectorAll('faust-footer a')).find(a => a.textContent.trim() === 'Privacidad')?.href
  }));
  if (assets.brokenImages.length || !assets.logo?.includes('/assets/') || !assets.navbarHome?.endsWith('/start/index.html') || !assets.footerPrivacy?.endsWith('/privacy.html')) throw new Error('Shared assets or links failed: ' + JSON.stringify(assets));
  console.log('Shared images and navigation links: OK');
  fs.writeFileSync('tmp/legal-before.json', JSON.stringify(before, null, 2));
  fs.writeFileSync('tmp/legal-after.json', JSON.stringify(after, null, 2));
  console.log('Header exact:', JSON.stringify(before.header) === JSON.stringify(after.header));
  console.log('Article exact:', JSON.stringify(before.article) === JSON.stringify(after.article));
  const button = page.locator('.legal-document__download');
  const [download] = await Promise.all([page.waitForEvent('download', {timeout: 60000}), button.click()]);
  await download.saveAs(path.resolve('tmp/legal-text-output.pdf'));
  console.log('PDF:', download.suggestedFilename());
  await page.route('**/legal/terminos-incorporacion/versiones.json', route => route.fulfill({ json: { actual: 'v1-0', versiones: ['v1-0', 'v0-9'] } }));
  await page.route('**/legal/terminos-incorporacion/v0-9.txt', route => {
    const text = fs.readFileSync('legal/terminos-incorporacion/v1-0.txt', 'utf8')
      .replace('Versión: V1.0', 'Versión: V0.9') + '\nPRUEBA DE VERSIÓN HISTÓRICA.\n';
    return route.fulfill({ contentType: 'text/plain; charset=utf-8', body: text });
  });
  await page.goto('http://127.0.0.1:8765/legal/terminos-incorporacion.html?version=v0-9', { waitUntil: 'networkidle' });
  await page.getByText('PRUEBA DE VERSIÓN HISTÓRICA.').waitFor();
  if (!(await page.locator('.legal-document__version').innerText()).includes('v0.9')) throw new Error('Incorrect version label');
  const [historicalDownload] = await Promise.all([page.waitForEvent('download', {timeout: 60000}), page.locator('.legal-document__download').click()]);
  await historicalDownload.saveAs(path.resolve('tmp/legal-text-historical.pdf'));
  if (historicalDownload.suggestedFilename() !== 'terminos-incorporacion-v0-9.pdf') throw new Error('Incorrect historical PDF name');
  await page.locator('.legal-document__version').click();
  await Promise.all([
    page.waitForURL('**/legal/terminos-incorporacion.html?version=v1-0'),
    page.getByRole('link', { name: 'v1.0', exact: true }).click()
  ]);
  await page.locator('faust-legal-document > article').waitFor();
  if (await page.getByText('PRUEBA DE VERSIÓN HISTÓRICA.').count()) throw new Error('Historical text leaked into current version');
  await page.goto('http://127.0.0.1:8765/legal/terminos-incorporacion.html?version=v9-9', { waitUntil: 'networkidle' });
  await page.getByRole('alert').waitFor();
  if (await page.locator('.legal-document__download').count()) throw new Error('An unavailable version offered a PDF');
  console.log('Version routing, selector, version-specific PDF and invalid-version handling: OK');
  await page.route('**/legal/otro-documento.html', route => route.fulfill({ contentType: 'text/html; charset=utf-8', body: fs.readFileSync('legal/terminos-incorporacion.html', 'utf8') }));
  await page.route('**/legal/otro-documento/versiones.json', route => route.fulfill({ json: { actual: 'v2-0', versiones: ['v2-0'] } }));
  await page.route('**/legal/otro-documento/v2-0.txt', route => route.fulfill({ contentType: 'text/plain; charset=utf-8', body: '---\nVersión: V2.0\nEmisión: 1 de enero de 2026\nMarco: Documento de prueba\nMarca: FaustPartners™\n---\n\n# Otro documento\n\n## Primera sección\n\nContenido de prueba **destacado**.\n' }));
  await page.goto('http://127.0.0.1:8765/legal/otro-documento.html', { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: 'Otro documento' }).waitFor();
  if (!(await page.locator('article strong').innerText()).includes('destacado')) throw new Error('Reusable document did not parse formatting');
  const [otherDownload] = await Promise.all([page.waitForEvent('download', {timeout: 60000}), page.locator('.legal-document__download').click()]);
  if (otherDownload.suggestedFilename() !== 'otro-documento-v2-0.pdf') throw new Error('Reusable document has incorrect PDF name');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:8765/legal/terminos-incorporacion.html', { waitUntil: 'networkidle' });
  await page.locator('faust-legal-document > article').waitFor();
  if (!(await page.locator('#nav-isotipo').evaluate(image => image.complete && image.naturalWidth > 0))) throw new Error('Mobile navbar logo is missing');
  console.log('Reusable HTML with a second document and mobile navbar: OK');
  console.log('Errors:', JSON.stringify(errors));
  if (JSON.stringify(before) !== JSON.stringify(after) || errors.length) process.exitCode = 1;
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
