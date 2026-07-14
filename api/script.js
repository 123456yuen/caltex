// 原本的程式碼：
// const response = await fetch('https://api.allorigins.win/get?url=...');

// 改成這樣：
const response = await fetch('/api/fuel'); 
const htmlText = await response.text();
// 接下來你可以使用 DOMParser 解析 htmlText 來取出你要的價格
