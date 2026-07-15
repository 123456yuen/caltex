const fs = require('fs');

async function updatePrice() {
    console.log("--- 開始抓取 ---");
    try {
        const response = await fetch('https://www.caltex.com/hk/zh/motorists/products-and-services/fuel-prices.html', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept-Language': 'zh-HK,zh;q=0.9,en-US;q=0.8,en;q=0.7',
                'Referer': 'https://www.google.com/'
            }
        });

        console.log("HTTP 狀態碼:", response.status); // 檢查是否為 200
        const text = await response.text();
        
        // 印出前 500 個字元來確認網頁內容
        console.log("抓取到的內容預覽 (前 500 字):");
        console.log(text.substring(0, 500)); 

        const match = text.match(/白金.*?(\d{2}\.\d{2})/i); // 稍微放寬 regex
        
        if (match && match[1]) {
            const price = parseFloat(match[1]);
            const data = { 
                platinum: price, 
                last_updated: new Date().toLocaleString('zh-HK', { timeZone: 'Asia/Hong_Kong' }) 
            };
            fs.writeFileSync('prices.json', JSON.stringify(data, null, 2));
            console.log("更新成功，價格:", price);
        } else {
            console.log("【警告】找不到價格！regex 匹配失敗。");
        }
    } catch (e) {
        console.error("執行錯誤:", e);
    }
}
updatePrice();
