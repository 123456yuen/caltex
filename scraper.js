const puppeteer = require('puppeteer');
const fs = require('fs');

async function updatePrice() {
    console.log("--- 瀏覽器模式啟動 ---");
    // 設定 --no-sandbox 讓它能在 GitHub 的伺服器上執行
    const browser = await puppeteer.launch({ 
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    
    try {
        // 設定 User-Agent 避免被攔截
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        await page.goto('https://www.caltex.com/hk/zh/motorists/products-and-services/fuel-prices.html', {
            waitUntil: 'networkidle2', // 等待網頁載入完成
            timeout: 60000
        });

        const content = await page.content();
        
        // 使用正則匹配價格
        const match = content.match(/白金汽油.*?HK[\$\s]*(\d{2}\.\d{2})/i);
        
        if (match && match[1]) {
            const price = parseFloat(match[1]);
            const data = { 
                platinum: price, 
                last_updated: new Date().toLocaleString('zh-HK', { timeZone: 'Asia/Hong_Kong' }) 
            };
            fs.writeFileSync('prices.json', JSON.stringify(data, null, 2));
            console.log("更新成功，最新價格:", price);
        } else {
            console.log("【警告】找不到價格，請檢查網頁內容結構是否變更。");
            console.log("內容預覽:", content.substring(0, 200));
        }
    } catch (e) {
        console.error("執行錯誤:", e);
    } finally {
        await browser.close();
    }
}

updatePrice();
