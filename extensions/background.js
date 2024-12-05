const color = "#3aa757";

chrome.runtime.onInstalled.addListener(() => {
    console.log("插件已被安装");
    console.log(`[Coloring] default background color is set to: ${color}`);
    // chrome.action.setBadgeText({text: 'ON'}); // 配置文本
    // chrome.action.setBadgeBackgroundColor({color: '#4688F1'}); // 配置背景颜色
});

chrome.action.onClicked.addListener((tab) => {
    console.log("Browser action clicked!");
    if (tab && tab.id !== undefined) {
        console.log("Valid tab object received:", tab);
        chrome.action.setTitle({ tabId: tab.id, title: "You are on tab:" + tab.id });
    } else {
        console.log("No valid tab associated with this click event.");
        chrome.action.setTitle({ title: "Default Title" }); // 设置全局标题
    }
});

// chrome.omnibox.onInputEntered.addListener((text) => {
//     // Encode user input for special characters , / ? : @ & = + $ #
//     const newURL = 'https://cn.bing.com/search?q=' + encodeURIComponent(text);
//     chrome.tabs.create({ url: newURL });
// });