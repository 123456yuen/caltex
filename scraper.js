const puppeteer = require('puppeteer');
const fs = require('fs');

async function updatePrice() {
    console.log("--- 瀏覽器模式啟動 (最終暴力清除法) ---");
    
    const browser = await puppeteer.launch({ 
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    
    try {
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36');
        
        await page.goto('https://www.caltex.com/hk/zh/motorists/products-and-services/fuel-prices.html', {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        // 強制等待渲染
        await new Promise(r => setTimeout(r, 5000));

        // 取得頁面所有文字
        const text = await page.evaluate(() => document.body.innerText);
        
        // 【核心邏輯：暴力清除所有空格與換行】
        // 將所有換行、Tab、空白全部刪除，讓網頁變成一行文字
        const cleanText = text.replace(/\s+/g, '');
        
        // 現在文字變成這樣：...特配Techron®白金汽油HKD33.64...
        // 我們直接抓 "白金汽油" 後面的數字
        const match = cleanText.match(/白金汽油.*?(\d{2}\.\d{2})/i);
        
        if (match && match[1]) {
            const price = parseFloat(match[1]);
            const data = { 
                platinum: price, 
                last_updated: new Date().toLocaleString('zh-HK', { timeZone: 'Asia/Hong_Kong' }) 
            };
            fs.writeFileSync('prices.json', JSON.stringify(data, null, 2));
            console.log("成功抓取！價格是:", price);
        } else {
            console.log("【依然失敗】找不到價格，已清除空格後的文字如下：");
            console.log(cleanText.substring(0, 500));
        }
        
    } catch (e) {
        console.error("執行錯誤:", e);
    } finally {
        await browser.close();
    }
}

updatePrice();
