function truncateText(text, maxLength) {
  if (text.length > maxLength) {
    return text.slice(0, maxLength - 1) + '…';
  }
  return text;
}

// floating-window.js
document.addEventListener('DOMContentLoaded', function () {
    // 监听来自后台脚本的消息
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      if (request.type === 'newMessage') {
        const messagesDiv = document.getElementById('messages');
        const messageElement = document.createElement('div');
        messageElement.className = 'message-item flash'; // 添加闪动类
        messageElement.textContent = truncateText(request.content, 10); // 最大长度为10字符
        messageElement.onclick = () => {
          // 假设每个消息都有一个关联的窗口ID和标签页ID
          chrome.windows.update(request.windowId, {focused: true});
          chrome.tabs.update(request.tabId, {active: true});
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

