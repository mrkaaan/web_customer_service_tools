let ws;
let floatingWindow;

function createFloatingWindow() {
  if (!floatingWindow) {
    chrome.windows.create({
      url: chrome.runtime.getURL('floating-window.html'),
      type: 'popup',
      width: 320,
      height: 420
    }, (window) => {
      floatingWindow = window;
    });
  }
}

// 创建和维护与WebSocket服务器的连接
function connectWebSocket() {
  const url = 'ws://localhost:8080'; // WebSocket服务器地址
  ws = new WebSocket(url); // 创建一个新的WebSocket连接

  // 监听WebSocket连接打开事件
  ws.onopen = () => {
    console.log('Connected to WebSocket server');
    
    // 设置消息接收监听器
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data); // 解析服务器发来的JSON数据(消息假定为JSON格式)
      if (data.type === 'update') {
        // 创建悬浮窗（如果还没有）
        createFloatingWindow();
        
        // 发送消息到悬浮窗
        chrome.runtime.sendMessage({type: 'newMessage', message: data.message});

        // 查询所有匹配的标签页并发送消息
        const urls = [
          "https://c2mbc.service.xixikf.cn/im-desk/*",
          "http://localhost/*",
          "http://localhost:5500/*",
          "http://127.0.0.1/*",
          "http://127.0.0.1:5500/*",
          "file:///*"
        ];

        // 对每个URL模式进行查询，并将消息发送到所有匹配的标签页
        urls.forEach(urlPattern => {
          chrome.tabs.query({url: urlPattern}, (tabs) => {
            tabs.forEach(tab => {
              chrome.tabs.sendMessage(tab.id, {type: 'newMessage', message: data.message});
            });
          });
        });
      }
    };
  };

  // 监听WebSocket连接关闭事件
  ws.onclose = () => {
    console.log('Disconnected from WebSocket server, retrying...');
    setTimeout(connectWebSocket, 5000); // 尝试重新连接
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
}

connectWebSocket();

// 监听来自content.js的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    if (request.type === 'register') {
      ws.send(JSON.stringify({
        type: 'register',
        id: request.id
      }));
    } else if (request.type === 'newMessage') {
      ws.send(JSON.stringify({
        type: 'newMessage',
        from: request.from,
        message: request.message
      }));
    }
  } else {
    console.warn('WebSocket is not ready or not connected.');
  }
});

// 监听扩展安装事件
chrome.runtime.onInstalled.addListener(() => {
  // 检查所有匹配的标签页是否存在红点元素
  const urls = [
    "https://c2mbc.service.xixikf.cn/im-desk/*",
    "http://localhost/*",
    "http://localhost:5500/*",
    "http://127.0.0.1/*",
    "http://127.0.0.1:5500/*",
    "file:///*"
  ];

  urls.forEach(urlPattern => {
    chrome.tabs.query({url: urlPattern}, (tabs) => {
      tabs.forEach(tab => {
        chrome.scripting.executeScript({
          target: {tabId: tab.id},
          func: checkRedDotElement
        }, (results) => {
          if (results && results[0].result) {
            createFloatingWindow();
            chrome.runtime.sendMessage({type: 'newMessage', message: data.message, content: data.content});
          }
        });
      });
    });
  });

  function checkRedDotElement() {
    return !!document.querySelector('.unread-dot'); // 替换为实际的红点元素选择器
  }
});