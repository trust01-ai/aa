export default async (req, res) => {
    const targetUrl = req.query.url;
    const response = await fetch(targetUrl, {
        headers: {
            'X-Forwarded-Host': req.headers.host,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    });
    res.status(200).send(await response.text());
};