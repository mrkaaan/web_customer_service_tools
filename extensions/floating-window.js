// floating-window.js
document.addEventListener('DOMContentLoaded', function () {
    // 监听来自后台脚本的消息
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      if (request.type === 'newMessage') {
        const messagesDiv = document.getElementById('messages');
        const messageElement = document.createElement('div');
        messageElement.className = 'message-item';
        messageElement.textContent = request.message;
        messageElement.onclick = () => {
          // 假设每个消息都有一个关联的窗口ID和标签页ID
          chrome.windows.update(request.windowId, {focused: true});
          chrome.tabs.update(request.tabId, {active: true});
        };
        messagesDiv.appendChild(messageElement);
      }
    });
  });