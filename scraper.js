const puppeteer = require('puppeteer');
const fs = require('fs');

async function updatePrice() {
    console.log("--- 瀏覽器模式啟動 (逐行解析版) ---");
    
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
        
        // 【核心邏輯：逐行檢查】
        const lines = text.split('\n'); // 將所有文字按換行切開
        let price = null;

        for (let i = 0; i < lines.length; i++) {
            // 如果這行包含「白金」
            if (lines[i].includes('白金')) {
                // 我們檢查這一行或者是下一行是否含有數字 (例如 33.64)
                // 將當前行和下一行合併檢查
                const nextLine = lines[i+1] || "";
                const combined = lines[i] + " " + nextLine;
                
                // 抓取格式為 XX.XX 的數字
                const match = combined.match(/(\d{2}\.\d{2})/);
                if (match) {
                    price = parseFloat(match[1]);
                    break; // 找到後立刻停止迴圈
                }
            }
        }
        
        if (price) {
            const data = { 
                platinum: price, 
                last_updated: new Date().toLocaleString('zh-HK', { timeZone: 'Asia/Hong_Kong' }) 
            };
            fs.writeFileSync('prices.json', JSON.stringify(data, null, 2));
            console.log("成功抓取！最新價格:", price);
        } else {
            console.log("【失敗】找不到符合的價格。");
            // 印出部分內容除錯
            console.log("---");
            console.log(text.substring(0, 500));
        }
        
    } catch (e) {
        console.error("執行錯誤:", e);
    } finally {
        await browser.close();
    }
}

updatePrice();
