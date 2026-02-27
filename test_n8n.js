const fs = require('fs');

const url = "https://n8ndev.ndsvn.vn/webhook/jd-extraction";
const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0OWM5ZWY3NS1hNDhiLTRlY2MtYWQ3Yy1iZjhkZWY2OGMwMjIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY1Nzg3MDE1fQ.MeNahheSlEqEyfK2u4jO9EVB7HG5qsq7KCVXtXHoEU8";
const body = JSON.stringify({ message: "Test JD Extraction Requirement Analysis" });

console.log("Fetching:", url);

(async () => {
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-N8N-API-KEY': apiKey
            },
            body: body
        });

        console.log("Status:", res.status);
        const text = await res.text();

        // Write raw text to file
        fs.writeFileSync('n8n_response.json', text, 'utf8');
        console.log("Response written to n8n_response.json");

        try {
            const json = JSON.parse(text);
            console.log("JSON parsed successfully");
            // Optional: Write formatted JSON
            fs.writeFileSync('n8n_response_formatted.json', JSON.stringify(json, null, 2), 'utf8');
        } catch (e) {
            console.log("Not valid JSON");
        }
    } catch (e) {
        console.error("Error:", e);
    }
})();
