const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function deploy() {
    try {
        console.log('Connecting to SSH...');
        await ssh.connect({
            host: '10.86.82.130',
            username: 'phongtran',
            password: '1',
            tryKeyboard: true,
            onKeyboardInteractive: (name, instructions, instructionsLang, prompts, finish) => {
                if (prompts.length > 0 && prompts[0].prompt.toLowerCase().includes('password')) {
                    finish(['1']);
                } else {
                    finish(['1']);
                }
            }
        });
        console.log('Connected!');

        console.log('Uploading deploy.tar...');
        await ssh.putFile('deploy.tar', '/home/phongtran/talent-iq/deploy.tar');
        console.log('Upload complete.');

        console.log('Extracting and restarting PM2...');
        const result = await ssh.execCommand('tar -xf deploy.tar && rm deploy.tar && (pm2 restart talent-iq || pm2 start ecosystem.config.js)', { cwd: '/home/phongtran/talent-iq' });
        console.log('STDOUT: ' + result.stdout);
        if (result.stderr) console.log('STDERR: ' + result.stderr);

        console.log('Deployment completely finished!');
        process.exit(0);
    } catch (err) {
        console.error('Deployment Failed:', err);
        process.exit(1);
    }
}
deploy();
