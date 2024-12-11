let ws;
let floatingWindow;

// 创建和维护与WebSocket服务器的连接
function connectWebSocket() {
  const url = 'ws://localhost:8080'; // WebSocket服务器地址
  ws = new WebSocket(url); // 创建一个新的WebSocket连接

  // 监听WebSocket连接打开事件
  ws.onopen = () => {
    console.log('Connected to WebSocket server');
    
  };

  // 设置来自WebSocket服务器的消息接收监听器
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data); // 解析服务器发来的JSON数据(消息假定为JSON格式)
    if (data.type === 'update') {
      // 创建悬浮窗（如果还没有）
      createFloatingWindow();
      
      // 发送完整的消息到悬浮窗
      chrome.runtime.sendMessage({
        type: 'floatingWindowUpdate',
        username: data.username,
        message: data.message,
        dotExists: data.dotExists,
        tabId: data.tabId,
        windowId: data.windowId
      });

      // 对每个URL模式进行查询，并将消息发送到所有匹配的标签页
      // getUrls().forEach(urlPattern => {
      //   chrome.tabs.query({url: urlPattern}, (tabs) => {
      //     tabs.forEach(tab => {
      //       chrome.tabs.sendMessage(tab.id, {type: 'newMessage', message: data.message});
      //     });
      //   });
      // });
    }
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


// 监听消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    switch (request.type) {
      case 'register':
        ws.send(JSON.stringify({
          type: 'register',
          id: request.id
        }));
        break;
      
      case 'newMessage':
        if (request.data && request.data.username && request.data.message) {
          ws.send(JSON.stringify({
            type: 'newMessage',
            username: request.data.username,
            message: request.data.message,
            dotExists: request.data.dotExists,
            tabId: request.data.tabId,
            windowId: request.data.windowId
          }));
        } else {
          console.warn('Invalid newMessage request:', request);
        }
        break;

      case 'redDotRemoved':
        if (request.data && request.data.username && request.data.message) {
          ws.send(JSON.stringify({
            type: 'redDotRemoved',
            username: request.data.username,
            message: request.data.message
          }));
        } else {
          console.warn('Invalid redDotRemoved request:', request);
        }
        break;
      
      // 仅处理来自悬浮 窗的消息
      case 'floatingWindowCreated':
        if (sender.tab) {
          chrome.runtime.sendMessage({
            type: 'floatingWindowCreated',
            message: request.message,
            content: request.content
          });
      }

      default:
        console.warn('Unknown message type:', request.type);
    }
  } else {
    console.warn('WebSocket is not ready or not connected.');
  }

  // 可选：回复内容脚本
  // sendResponse({status: 'received'});
});

// 创建悬浮窗
function createFloatingWindow() {
  if (!floatingWindow) {
    chrome.windows.create({
      url: chrome.runtime.getURL('floating-window.html'),
      type: 'popup',
      width: 320,
      height: 420
    }, (window) => {
      floatingWindow = window;
      // 确保窗口创建完成后发送消息
      chrome.runtime.sendMessage({type: 'floatingWindowCreated', message: '悬浮窗已创建'});
    });
  }
}


// 监听扩展安装事件 脚本安装时判断是否已有红点元素
chrome.runtime.onInstalled.addListener(() => {
  getUrls().forEach(urlPattern => {
    chrome.tabs.query({url: urlPattern}, (tabs) => {
      tabs.forEach(tab => {
        // 使用 chrome.scripting API 注入临时脚本，检查是否有红点元素
        chrome.scripting.executeScript({
          target: {tabId: tab.id},
          func: checkAndSendRedDotInfo,
          args: [tab.id, tab.windowId] // 传递tabId和windowId作为参数
        }, (results) => {
        });
      });
    });
  });

  function checkAndSendRedDotInfo(tabId, windowId)) {
    const unreadDots = document.querySelectorAll('.unread-dot');
    if (unreadDots.length > 0) {
      unreadDots.forEach(dot => {
        const parentElement = dot.parentElement;
        const username = parentElement.querySelector('.username')?.textContent;
        const messageText = parentElement.querySelector('.message-text')?.textContent;
  
        // 将信息发送给后台脚本
        chrome.runtime.sendMessage({
          type: 'newMessage',
          data: {
            username,
            message: messageText,
            dotExists: true,
            tabId,
            windowId
          }
        });
      });
    }
  }
});

// 从JSON文件中获取URL列表
function getUrls() {
  return fetch(chrome.runtime.getURL('urls.json'))
    .then(response => response.json())
    .catch(error => console.error('Failed to load URLs:', error));
}