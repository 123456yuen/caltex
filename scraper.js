const puppeteer = require('puppeteer');
const fs = require('fs');

async function updatePrice() {
    console.log("--- 瀏覽器模式啟動 (除錯模式) ---");
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

        await new Promise(r => setTimeout(r, 5000));
        const text = await page.evaluate(() => document.body.innerText);

        // 【極度寬鬆除錯法】
        // 1. 先把所有非數字、非中文字、非英文的符號變成空格
        const cleanText = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9.]/g, ' ');
        
        console.log("=== 處理後的文字片段 (檢查是否有白金字樣) ===");
        const index = cleanText.indexOf("白金");
        if (index !== -1) {
            console.log("找到 '白金' 在字串中的位置:", index);
            console.log("片段:", cleanText.substring(index, index + 50));
        } else {
            console.log("完全找不到 '白金' 兩個字！文字內容可能編碼異常。");
        }

        // 2. 直接找 "白金" 後面緊接著的數字
        const match = cleanText.match(/白金.*?(\d+\.\d+)/);
        
        if (match && match[1]) {
            const price = parseFloat(match[1]);
            const data = { 
                platinum: price, 
                last_updated: new Date().toLocaleString('zh-HK', { timeZone: 'Asia/Hong_Kong' }) 
            };
            fs.writeFileSync('prices.json', JSON.stringify(data, null, 2));
            console.log("更新成功！價格:", price);
        } else {
            console.log("【依然找不到】請看上面的文字片段內容進行除錯。");
        }
        
    } catch (e) {
        console.error("執行錯誤:", e);
    } finally {
        await browser.close();
    }
}
updatePrice();
