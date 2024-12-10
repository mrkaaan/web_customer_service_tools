const messageContainer = document.querySelector('#messages');


if (messageContainer) {
    // 创建一个MutationObserver对象实例，这是一个能够监听DOM变化的Web API。当DOM发生变化时，例如元素被添加、删除或修改时，MutationObserver会触发一个回调函数。
    // 箭头函数，作为MutationObserver的回调函数。当观察到DOM变化时，这个函数会被调用，并且会接收一个mutations数组作为参数，该数组包含了所有观察到的变化。
    const observer = new MutationObserver(mutations => {
        // 遍历mutations数组中的每一个变化。
        mutations.forEach(mutation => {
            // 检查当前变化是否包含添加了新的节点（addedNodes）。如果有节点被添加，执行花括号内的代码
            if (mutation.addedNodes.length > 0 && mutation.addedNodes[0].querySelector('.unread-dot')) { // 检查是否有未读信息
                // 检测到新节点，使用chrome.runtime.sendMessage方法向扩展的后台脚本发送一个消息。这个消息包含了一个type字段和一个message字段，后台脚本可以根据type字段来决定如何处理这个消息
                chrome.runtime.sendMessage({type: 'newMessage', message: 'New message detected'});
            }
        });
    });

    // 调用配置好的监听对象 使用MutationObserver的observe方法开始监听DOM变化
    // 设置body元素作为观察起点
    // 指定了观察者需要监听的变化类型。childList: true表示监听子节点的添加或删除，subtree: true表示不仅监听body元素的直接子节点，还要监听所有后代节点的变化。
    observer.observe(document.querySelector('body'), { childList: true, subtree: true });
}
// 注册当前浏览器实例
// 向扩展的后台脚本发送一个注册消息。这个注册消息包含了一个随机生成的id，用于标识当前的浏览器实例或标签页
// 生成一个随机字符串作为id。Math.random()生成一个0到1之间的随机数，toString(36)将其转换为一个36进制的字符串（包含数字和字母a-z），substr(2, 9)从字符串的第三个字符开始截取9个字符，以确保id的长度适中且随机
chrome.runtime.sendMessage({type: 'register', id: Math.random().toString(36).substr(2, 9)});

// content.js
let redDotObserver;

function observeRedDotElement() {
  const redDotElement = document.querySelector('.unread-dot'); // 替换为实际的红点元素选择器
  if (redDotElement) {
    redDotObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (!document.querySelector('.unread-dot')) {
          chrome.runtime.sendMessage({type: 'redDotRemoved'});
        }
      });
    });
    redDotObserver.observe(redDotElement, { childList: true, subtree: true });
  }
}

observeRedDotElement();