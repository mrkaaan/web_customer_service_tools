const messageContainer = document.querySelector('#messages');

if (messageContainer) {
    // 创建一个MutationObserver对象实例，这是一个能够监听DOM变化的Web API。当DOM发生变化时，例如元素被添加、删除或修改时，MutationObserver会触发一个回调函数。
    // 箭头函数，作为MutationObserver的回调函数。当观察到DOM变化时，这个函数会被调用，并且会接收一个mutations数组作为参数，该数组包含了所有观察到的变化。
    const observer = new MutationObserver(mutations => {
        let hasUnreadDot = false;
        mutations.forEach(mutation => {
            // 检查新添加的节点中是否有 .unread-dot
            if (mutation.addedNodes.length > 0) {
                for (let node of mutation.addedNodes) {
                    if (node.nodeType === 1 && node.querySelector('.unread-dot')) { // nodeType 1 表示这是一个元素节点
                        const unreadDots = Array.from(node.querySelectorAll('.unread-dot')); // 获取所有匹配的.unread-dot元素
                        hasUnreadDot = true;
                        // 检测到新节点，使用chrome.runtime.sendMessage方法向扩展的后台脚本发送一个消息。这个消息包含了一个type字段和一个message字段，后台脚本可以根据type字段来决定如何处理这个消息
                        unreadDots.forEach(dot => {
                            // 假设需要获取的是dot父级元素下的另外两个子元素的值
                            const parentElement = dot.parentElement;
                            const username = parentElement.querySelector('.username')?.textContent;
                            const messageText = parentElement.querySelector('.message-text')?.textContent;
                            
                            // 获取当前标签页和窗口ID
                            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                                if (tabs.length > 0) {
                                const tabId = tabs[0].id;
                                const windowId = tabs[0].windowId;
                
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
                                }
                            });
                        });
                    }
                }
            }

            // 检查被移除的节点中是否有 .unread-dot，并获取相关用户信息
            if (mutation.removedNodes.length > 0) {
                mutation.removedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        const removedDots = Array.from(node.querySelectorAll('.unread-dot'));
                        removedDots.forEach(dot => {
                            const parentElement = dot.parentElement;
                            const username = parentElement.querySelector('.username')?.textContent; // 替换为实际选择器
                            const messageText = parentElement.querySelector('.message-text')?.textContent; // 替换为实际选择器
                            
                            // 将移除信息发送给后台脚本
                            chrome.runtime.sendMessage({
                                type: 'redDotRemoved',
                                data: {
                                    username,
                                    message: messageText,
                                    dotExists: false
                                }
                            });
                        });
                    }
                });
            }
        });

        // 如果页面上有未读消息标志，但没有通过新增或移除节点检测到，则可能是通过其他方式修改的DOM
        // if (!hasUnreadDot && document.querySelector('.unread-dot')) {
        //     chrome.runtime.sendMessage({type: 'newMessage', message: 'New message detected'});
        // }
    });

    // 开始监听 #messages 元素及其后代的变化
    observer.observe(messageContainer, { childList: true, subtree: true });

    // 初始化检查已存在的.unread-dot元素
    const existingUnreadDots = document.querySelectorAll('.unread-dot');
    existingUnreadDots.forEach(dot => {
        const parentElement = dot.parentElement;
        const username = parentElement.querySelector('.username')?.textContent; // 替换为实际选择器
        const messageText = parentElement.querySelector('.message-text')?.textContent; // 替换为实际选择器
        
        chrome.runtime.sendMessage({
            type: 'newMessage',
            data: {
                username,
                message: messageText,
                dotExists: true
            }
        });
    });
}

// 注册当前浏览器实例
// 向扩展的后台脚本发送一个注册消息。这个注册消息包含了一个随机生成的id，用于标识当前的浏览器实例或标签页
// 生成一个随机字符串作为id。Math.random()生成一个0到1之间的随机数，toString(36)将其转换为一个36进制的字符串（包含数字和字母a-z），substr(2, 9)从字符串的第三个字符开始截取9个字符，以确保id的长度适中且随机
chrome.runtime.sendMessage({
    type: 'register',
    id: Math.random().toString(36).substr(2, 9)
});