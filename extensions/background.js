let ws;

// 创建和维护与WebSocket服务器的连接
function connectWebSocket() {
  const url = 'ws://localhost:8080'; // WebSocket服务器地址
  ws = new WebSocket(url); // 创建一个新的WebSocket连接

  // 监听WebSocket连接打开事件
  ws.onopen = () => {
    console.log('Connected to WebSocket server');
  };

  // 监听WebSocket消息接收事件 当从服务器接收到消息时触发
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data); // 解析服务器发来的JSON数据(消息假定为JSON格式)
    if (data.type === 'update') {
        // 生成通知
      chrome.notifications.create('', {
        type: 'basic',
        iconUrl: 'icons/icon48.png', // 通知图标路径
        title: 'New Message',
        message: data.message
      });
      // 发送消息到内容脚本content.js 目的：消息共享、页面更新、解耦提高独立性、便于维护
      chrome.runtime.sendMessage({type: 'newMessage', message: data.message});
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

// 监听来自content.js的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // 如果消息类型为register则向服务器注册用户
  if (request.type === 'register') {
    ws.send(JSON.stringify({
      type: 'register',
      id: request.id
    }));
  } else if (request.type === 'newMessage') {
    // 如果消息类型为newMessage则向服务器发送消息
    ws.send(JSON.stringify({
      type: 'newMessage',
      from: request.from,
      message: request.message
    }));
  }
});