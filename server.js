const WebSocket = require('ws');

// 创建WebSocket服务器实例
const wss = new WebSocket.Server({ port: 8080 });

// 存储每个客户端的标识符和WebSocket连接
const clients = new Map();

// 当有新的客户端连接时触发
wss.on('connection', (ws) => {
    console.log('New client connected');

    // 监听从客户端发送的消息
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        console.log(`Received message from`);

        if (data.type === 'register') {
            // 注册新用户
            clients.set(data.id, ws);
            console.log(`Client ${data.id} registered`);
        } else if (data.type === 'newMessage') {
            // 广播新消息给所有已注册的客户端
            broadcastMessage(data);
        }
    });

    // 当客户端断开连接时触发
    ws.on('close', () => {
        console.log('A client disconnected');
        // 移除断开连接的客户端
        for (let [id, client] of clients) {
            if (client === ws) {
                clients.delete(id);
                break;
            }
        }
    });
});

// 向所有已注册的客户端广播消息
function broadcastMessage(data) {
    for (let [id, client] of clients) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'update',
                message: data.message,
                username: data.username, 
                dotExists: data.dotExists,
                tabId: data.tabId,
                windowId: data.windowId
            }));
        }
    }
}

console.log('WebSocket server is running on ws://localhost:8080');