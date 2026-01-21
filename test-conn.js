const https = require('https');

const url = 'https://n8ndev.ndsvn.vn/webhook/jd-extraction1'; // Hardcoded based on previous finding

console.log(`Target: ${url}`);

function test(name, options) {
    console.log(`[${name}] Starting...`);
    const req = https.request(url, { method: 'POST', ...options }, (res) => {
        console.log(`[${name}] Success! Status: ${res.statusCode}`);
        res.resume(); // consume
    });
    req.on('error', (e) => {
        console.log(`[${name}] Failed: ${e.message} (Code: ${e.code})`);
    });
    req.end();
}

test('Standard', {});
test('Insecure (rejectUnauthorized: false)', { rejectUnauthorized: false });
