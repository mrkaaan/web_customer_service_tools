## 基本结构

### 0. `manifest.json` （扩展配置文件）

是Chrome扩展的核心配置文件，它定义了扩展的基本信息、权限和其他设置。

### 1. `background.js`（后台脚本）

**作用：**
- **长期运行的任务**：后台脚本是唯一可以在浏览器关闭所有标签页后继续运行的脚本。它通常用于执行需要持续进行的任务，如监听WebSocket连接、定时任务等。
- **全局状态管理**：它可以存储和管理整个扩展的状态信息，比如用户的设置或与服务器之间的会话信息。
- **事件监听器**：负责监听来自内容脚本和用户界面（如弹出窗口）的消息，并根据这些消息采取行动。
- **跨页面通信枢纽**：作为不同部分（如内容脚本和弹出窗口）之间的桥梁，传递信息。

**在这个项目中的具体职责：**
- 连接到WebSocket服务器并保持连接。
- 监听从WebSocket服务器接收到的消息，并向所有打开的淘工厂页面发送通知。
- 接收来自内容脚本的注册请求，并通过WebSocket向服务器注册当前浏览器实例。
- 处理新消息的通知，并更新悬浮窗的内容。

### 2. `content.js`（内容脚本）

**作用：**
- **网页内交互**：内容脚本被注入到特定网页中，可以访问该网页的DOM元素和JavaScript环境。它主要用于修改网页内容或监听网页上的变化。
- **监控网页行为**：例如，监听特定元素的变化，检测新消息的出现等。
- **与后台脚本通信**：可以通过`chrome.runtime.sendMessage()`向后台脚本发送消息，报告网页上的重要事件。

**在这个项目中的具体职责：**
- 监控淘工厂网页上指定元素的变化，检测是否有新消息。
- 当检测到新消息时，通知后台脚本。
- 在启动时向后台脚本发送注册请求，标识当前浏览器实例。

### 3. `popup.js`（弹出窗口脚本）

**作用：**
- **用户界面逻辑**：负责处理用户与扩展弹出窗口（即悬浮窗）之间的交互。它控制显示什么信息给用户以及如何响应用户的操作。
- **显示动态内容**：可以根据后台脚本提供的数据动态更新其内容，例如显示最新的消息列表。
- **与后台脚本通信**：监听后台脚本发送的消息，并根据这些消息更新UI；也可以通过点击事件等方式向后台脚本发送指令。

**在这个项目中的具体职责：**
- 显示来自其他浏览器实例的新消息。
- 允许用户点击某条消息来聚焦对应的浏览器窗口。
- 监听后台脚本发送的新消息通知，并更新UI以反映最新消息。

### 总结

这三个脚本之间通过`chrome.runtime.sendMessage()`和`chrome.runtime.onMessage.addListener()`方法进行通信。以下是它们的工作流程：

1. **内容脚本**监听网页上的变化，并在发现新消息时通知**后台脚本**。
2. **后台脚本**接收内容脚本的消息，并通过WebSocket广播给其他已连接的客户端。
3. 当有新的消息时，**后台脚本**也会通知**弹出窗口脚本**，以便更新悬浮窗的内容。
4. 用户可以通过点击悬浮窗中的消息来聚焦对应的浏览器窗口，这一操作由**弹出窗口脚本**处理。

希望这个解释能帮助您更好地理解这三个脚本的作用及它们是如何协同工作的。如果有更多问题或需要进一步的帮助，请随时告诉我！