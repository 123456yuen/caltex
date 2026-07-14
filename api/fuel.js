// api/fuel.js
export default async function handler(req, res) {
  const targetUrl = 'https://www.caltex.com/hk/zh/motorists/products-and-services/fuel-prices.html';
  
  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Caltex responded with ${response.status}`);
    }

    const data = await response.text(); // 取得原始 HTML 字串
    
    // 設定允許 CORS (雖然我們現在是同源，但保持良好習慣)
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(data);
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
}
