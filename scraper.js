const fs = require('fs');

async function updatePrice() {
    console.log("開始抓取價格...");
    try {
        // 使用 headers 模擬真實瀏覽器行為
        const res = await fetch('https://www.caltex.com/hk/zh/motorists/products-and-services/fuel-prices.html', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        
        const text = await res.text();
        
        // 解析價格的規則
        const match = text.match(/白金.*?HK[\$\s]*(\d{2}\.\d{2})/i);
        
        if (match && match[1]) {
            const price = parseFloat(match[1]);
            const data = { 
                platinum: price, 
                last_updated: new Date().toLocaleString('zh-HK', { timeZone: 'Asia/Hong_Kong' }) 
            };
            
            fs.writeFileSync('prices.json', JSON.stringify(data, null, 2));
            console.log("更新成功，最新價格:", price);
        } else {
            console.log("抓取失敗：找不到價格模式，可能網頁結構有變。");
            // 將內容輸出到 console 方便你除錯
            console.log(text.substring(0, 200));
        }
    } catch (e) {
        console.error("執行錯誤:", e);
    }
}

updatePrice();
