// api/fuel.js
export default async function handler(req, res) {
  try {
    // 從 Caltex 抓取網頁
    const response = await fetch('https://www.caltex.com/hk/zh/motorists/products-and-services/fuel-prices.html', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) throw new Error('Failed to fetch');

    const html = await response.text();
    
    // 回傳網頁內容給你的前端
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  } catch (error) {
    res.status(500).json({ error: '無法抓取資料' });
  }
}
