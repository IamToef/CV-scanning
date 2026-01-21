const fs = require('fs');
const path = require('path');
const envPath = path.resolve('C:\\Users\\dao minh hai\\Desktop\\CVs-web', '.env.local');
const outPath = path.resolve('C:\\Users\\dao minh hai\\Desktop\\CVs-web', 'env_debug_output.txt');

let output = '';

if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split(/\r?\n/);
    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('N8N_EXTRACTJD_WEBHOOK_URL')) {
            const parts = trimmed.split('=');
            const key = parts[0].trim();
            const val = parts.slice(1).join('=').trim();
            output += `KEY: ${key}\n`;
            output += `VAL_PREFIX: ${val.substring(0, 8)}\n`;
            output += `HAS_HTTP: ${val.startsWith('http')}\n`;
            output += `FULL_VAL: ${val}\n`; // I'll trust this won't leak critical secrets if it's just a local n8n url
        }
    });
} else {
    output = 'File not found';
}

fs.writeFileSync(outPath, output);
console.log('Done');
