const puppeteer = require('puppeteer');
const fs = require('fs');

async function updatePrice() {
    console.log("--- 瀏覽器模式啟動 (已加入強制等待) ---");
    const browser = await puppeteer.launch({ 
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    
    try {
        // 設定 User-Agent 讓它看起來更像真人
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36');
        
        await page.goto('https://www.caltex.com/hk/zh/motorists/products-and-services/fuel-prices.html', {
            waitUntil: 'domcontentloaded' // 改用這個模式，速度更快
        });

        // 【關鍵改動】強制等待 5 秒，讓頁面的 JavaScript 有時間去伺服器抓取價格
        console.log("等待 JS 載入...");
        await new Promise(r => setTimeout(r, 5000));

        // 讀取頁面上所有的文字內容，而不僅僅是 HTML
        const content = await page.evaluate(() => document.body.innerText);
        
        // 搜尋價格 (加德士價格通常格式為 HK$ xx.xx)
        // 這裡我們搜尋 "白金" 關鍵字後面的數字
        const match = content.match(/白金.*?HKD?\s*(\d{2}\.\d{2})/is);
        
        if (match && match[1]) {
            const price = parseFloat(match[1]);
            const data = { 
                platinum: price, 
                last_updated: new Date().toLocaleString('zh-HK', { timeZone: 'Asia/Hong_Kong' }) 
            };
            fs.writeFileSync('prices.json', JSON.stringify(data, null, 2));
            console.log("更新成功，最新價格:", price);
        } else {
            console.log("【警告】找不到價格。");
            // 偵錯用：印出抓到的文字內容，讓我們看看有沒有價格
            console.log("抓取到的文字範例:", content.substring(0, 1000));
        }
    } catch (e) {
        console.error("執行錯誤:", e);
    } finally {
        await browser.close();
    }
}

updatePrice();
