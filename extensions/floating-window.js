function truncateText(text, maxLength) {
  if (text.length > maxLength) {
    return text.slice(0, maxLength - 1) + '…';
  }
  return text;
}

document.addEventListener('DOMContentLoaded', function () {
  // 监听来自后台脚本的消息
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type === 'floatingWindowUpdate') {
      const messagesDiv = document.getElementById('messages');
      const messageElement = document.createElement('div');
      messageElement.className = 'message-item flash'; // 添加闪动类

      // 构建显示的消息文本
      const displayText = `${request.username}: ${truncateText(request.message, 10)}`;
      messageElement.textContent = displayText;

      messageElement.onclick = () => {
        // 点击消息时聚焦到关联的窗口和标签页
        if (typeof request.tabId === 'number' && typeof request.windowId === 'number') {
          chrome.windows.update(request.windowId, {focused: true});
          chrome.tabs.update(request.tabId, {active: true});
        }
      };

      messagesDiv.appendChild(messageElement);

      // 设置当前界面信息
      document.getElementById('currentWindowId').textContent = request.windowId;
      document.getElementById('currentTabId').textContent = request.tabId;

      // 移除闪动效果
      setTimeout(() => {
        messageElement.classList.remove('flash');
      }, 2000);
    }

    if (request.type === 'redDotRemoved') {
      const messagesDiv = document.getElementById('messages');
      messagesDiv.innerHTML = ''; // 清空所有消息元素
    }
  });
});