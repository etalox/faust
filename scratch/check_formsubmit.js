const https = require('https');

function checkURL(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 5000 }, (res) => {
      console.log(`[${url}] Status Code:`, res.statusCode);
      resolve(res.statusCode);
    });
    
    req.on('error', (err) => {
      console.error(`[${url}] Error:`, err.message);
      resolve(null);
    });
    
    req.on('timeout', () => {
      console.error(`[${url}] Timeout!`);
      req.destroy();
      resolve(null);
    });
  });
}

async function run() {
  await checkURL('https://formsubmit.co');
  await checkURL('https://formsubmit.co/ajax/francohumbertoquinonesramirez@gmail.com');
  await checkURL('https://submit-form.com'); // Formspark
  await checkURL('https://api.web3forms.com/submit'); // Web3Forms
}

run();
