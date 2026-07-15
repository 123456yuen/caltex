const puppeteer = require('puppeteer');
const fs = require('fs');

async function updatePrice() {
    console.log("--- 瀏覽器模式啟動 (自動化爬蟲) ---");
    
    // 啟動瀏覽器，加入必要的參數以適應 GitHub Actions 環境
    const browser = await puppeteer.launch({ 
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    
    try {
        // 設定 User-Agent 模擬真實瀏覽器，避免被封鎖
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36');
        
        console.log("正在前往加德士官網...");
        await page.goto('https://www.caltex.com/hk/zh/motorists/products-and-services/fuel-prices.html', {
            waitUntil: 'networkidle2', // 等待網絡請求趨於平靜
            timeout: 60000
        });

        // 強制等待 5 秒，確保網頁完全渲染完畢，JavaScript 已將數據填入 DOM
        console.log("等待頁面渲染完成...");
        await new Promise(r => setTimeout(r, 5000));

        // 讀取頁面上的所有文字內容
        const content = await page.evaluate(() => document.body.innerText);
        
        // 【核心規則】搜尋 "白金汽油" 後的價格
        // /is 修飾符：i 代表忽略大小寫，s 代表點號(.)可以匹配換行符號
        // [^\d]* 代表跳過中間所有非數字內容 (包含換行、HKD 等)
        // [\s\S]*? 的意思是：匹配所有字元（包含換行），直到找到第一個數字組合
        const match = content.match(/白金[\s\S]*?(\d{2}\.\d{2})/i);
        
        if (match && match[1]) {
            const price = parseFloat(match[1]);
            const data = { 
                platinum: price, 
                last_updated: new Date().toLocaleString('zh-HK', { timeZone: 'Asia/Hong_Kong' }) 
            };
            
            // 寫入 prices.json
            fs.writeFileSync('prices.json', JSON.stringify(data, null, 2));
            console.log("更新成功！最新價格:", price);
        } else {
            console.log("【錯誤】找不到價格。");
            // 將部分內容印出來以便除錯
            console.log("抓取到的內容預覽:", content.substring(0, 500));
        }
        
    } catch (e) {
        console.error("執行過程中發生錯誤:", e);
    } finally {
        await browser.close();
        console.log("瀏覽器已關閉。");
    }
}

updatePrice();
