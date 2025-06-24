export default async function handler(req, res) {
  const { path = [] } = req.query;

  const targetUrl = `http://192.168.1.20:3000/api/${path.join('/')}`;

  const fetchOptions = {
    method: req.method,
    headers: {
      ...req.headers,
      host: undefined, // Gỡ host để tránh lỗi
    },
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
  };

  try {
    const response = await fetch(targetUrl, fetchOptions);
    const contentType = response.headers.get('content-type');
    const data = await (contentType?.includes('application/json') ? response.json() : response.text());

    res.status(response.status);
    contentType && res.setHeader('Content-Type', contentType);
    res.send(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ message: 'Proxy error', error: error.message });
  }
}
