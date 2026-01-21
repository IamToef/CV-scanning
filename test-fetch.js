const url = 'https://n8ndev.ndsvn.vn/webhook/jd-extraction1';
console.log('Fetching:', url);

async function run() {
    try {
        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({ message: "test" }),
            headers: { 'Content-Type': 'application/json' }
        });
        console.log('Status:', res.status);
        // console.log('Text:', await res.text()); 
    } catch (e) {
        console.error('Fetch Failed:', e.message);
        if (e.cause) console.error('Cause:', e.cause);
    }
}

run();
