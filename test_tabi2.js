const https = require('https');

const endpoints = [
  '/api/v1/send',
  '/v1/send',
  '/api/v1/messages/send',
  '/api/send',
  '/whatsapp/v1/send'
];

const testEndpoint = (path) => {
  return new Promise((resolve) => {
    const data = JSON.stringify({ to: "+2348000000000", text: "test" });
    const options = {
      hostname: 'api.tabi.africa',
      port: 443,
      path: path,
      method: 'POST',
      headers: {
        'Authorization': 'Bearer tk_46b84cc8f648d0fd1bbe84f2f283ea2287d75bb55c7565971307cbb52580452f',
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        resolve({ path, status: res.statusCode, body });
      });
    });
    req.on('error', () => resolve({ path, status: 0, body: 'error' }));
    req.write(data);
    req.end();
  });
};

async function run() {
  for (const ep of endpoints) {
    const res = await testEndpoint(ep);
    console.log(`${res.status} - ${ep}`);
    if (res.status !== 404 && res.status !== 405) {
      console.log(`BODY: ${res.body}`);
    }
  }
}

run();
