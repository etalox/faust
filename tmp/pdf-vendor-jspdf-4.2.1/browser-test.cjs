const { chromium } = require('C:/Users/franc/AppData/Roaming/npm/node_modules/agent-browser/node_modules/playwright-core');
const path = require('path');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Users/franc/AppData/Local/ms-playwright/chromium-1208/chrome-win64/chrome.exe',
    headless: true
  });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('dialog', dialog => { errors.push('Dialog: ' + dialog.message()); dialog.dismiss(); });
  await page.goto('http://127.0.0.1:8765/terminos-incorporacion.html', { waitUntil: 'networkidle' });
  const button = page.locator('faust-legal-document .legal-document__download');
  await button.waitFor({ state: 'visible' });

  async function download(name) {
    const [file] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), button.click()]);
    console.log('Download:', file.suggestedFilename());
    await file.saveAs(path.join(__dirname, name));
    await button.waitFor({ state: 'visible' });
  }
  await download('original.pdf');
  await page.evaluate(() => {
    const p = document.createElement('p');
    p.textContent = 'PRUEBA DINÁMICA: cláusula actualizada con ñ, á, é y ™.';
    document.querySelector('faust-legal-document > article').append(p);
  });
  await download('modified.pdf');
  console.log('Button restored:', await button.textContent());
  console.log('Page errors:', JSON.stringify(errors));
  if (errors.length) throw new Error('Browser errors during PDF generation');
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
