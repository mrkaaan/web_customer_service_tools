const express = require('express');
const app = express();
const port = 3000;

// 存储检测到的元素信息
let detectedElements = {};

// 使Express能够解析JSON请求体
app.use(express.json());

// 接收来自内容脚本的检测消息
app.post('/detect', (req, res) => {
  const { tabId, elementInfo } = req.body;
  if (!detectedElements[tabId]) {
    detectedElements[tabId] = [];
  }
  detectedElements[tabId].push(elementInfo);
  res.send('Received');
});

// 提供检测到的元素信息
app.get('/elements', (req, res) => {
  res.json(detectedElements);
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});