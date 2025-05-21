import https from 'https';

export default async function handler(req, res) {
  const targetUrl = `https://185.165.171.174${req.url}`; // Use IP directly
  
  // PERFECTED HEADERS
  const headers = {
    'Host': 'login.espeharete.top',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'X-Forwarded-Proto': 'https',
    'X-Real-IP': req.ip
  };

  try {
    const options = {
      method: req.method,
      headers: headers,
      agent: new https.Agent({ 
        rejectUnauthorized: false,
        keepAlive: true
      })
    };

    const response = await fetch(targetUrl, options);
    
    // Clone all headers except problematic ones
    const responseHeaders = {};
    response.headers.forEach((value, key) => {
      if (!['content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
        responseHeaders[key] = value;
      }
    });
    
    // Send response
    res.writeHead(response.status, responseHeaders);
    response.body.pipe(res);
    
  } catch (error) {
    console.error('PROXY ERROR:', error);
    res.status(500).send(`Proxy Error: ${error.message}`);
  }
}
