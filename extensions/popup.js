// 事件监听器，文档加载完成时触发
// 'DOMContentLoaded'：这个事件在初始的HTML文档被完全加载和解析完成后触发，不必等待样式表、图片和子框架完成加载
document.addEventListener('DOMContentLoaded', function () {
    console.log('Popup script loaded');
    // 为chrome.runtime对象添加一个消息监听器，用于监听从扩展的其他部分（如后台脚本或内容脚本）发送过来的消息
    // request：包含发送消息的详细信息，包括消息类型和其他数据。
    // sender：包含发送消息的扩展页面、脚本或内容脚本的信息。
    // sendResponse：一个函数，允许弹出页面响应发送给它的消息。
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        // 如果收到的消息类型是'newMessage'
      if (request.type === 'newMessage') {
        // 获取'messages'元素
        const messagesDiv = document.getElementById('messages');
        // 创建一个新的div元素，并将消息内容设置为其文本内容
        const messageElement = document.createElement('div');
        // 将消息内容设置为新创建的div元素的文本内容
        messageElement.textContent = request.message;
        // 为新创建的div元素添加一个点击事件监听器
        messageElement.onclick = () => {
            // 将发送消息的标签页所在的窗口设置为焦点窗口。
          chrome.windows.update(sender.tab.windowId, {focused: true});
          // 将发送消息的标签页设置为活动标签页。
          chrome.tabs.update(sender.tab.id, {active: true});
        };
        // 将新创建的消息div元素添加到消息容器中，以便在弹出页面上显示
        messagesDiv.appendChild(messageElement);
      }
    });
});