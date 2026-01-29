# CoBridge

[中文](#中文说明) | [English](#english-description)

---

## 中文说明

CoBridge 是一个 VS Code 插件，与 Gemini Voyager 配套使用，旨在无缝同步浏览器中的 AI 对话记录到本地 IDE，帮助 AI 助手（如 Copilot, Trae, Cursor 等）获取最新的开发上下文。

### 🚀 快速入门 (Quick Start)

1. **安装插件**：在 VS Code 插件市场搜索并安装 `CoBridge`。

2. **启动服务**：
   
   - 插件安装后会在后台自动启动服务（默认端口 `3030`）。
   
   - 你可以在 VS Code 右下角状态栏看到 `CoBridge: On` 图标。
   
     ![running](images/running.png)
   
   - 点击该图标可以手动 **启动/停止** 服务、**查看日志** 或 **打开同步文件**。
   
     ![management](images/management.png)
   
3. **开始同步**：确保你的浏览器端已配置好发送端（配套的浏览器扩展或脚本），对话内容将自动保存至当前工作区的 `.vscode/AI_CONTEXT_SYNC.md`。

### ⚙️ 配置说明 (Settings)

如果默认端口 `3030` 被占用或需要更改，可以按照以下步骤操作：

1. 打开 VS Code 设置 (`Ctrl + ,` 或 `Cmd + ,`)。
2. 搜索 `AIContextSync.port`。
3. 将端口号修改为你需要的数值（例如 `3031`）。
4. 修改后建议重启或在状态栏菜单中手动重启服务以使配置生效。

![port](images/port.png)

### 📋 前置要求 (Prerequisites)

- **VS Code 版本**：`^1.104.3` 或更高版本。
- **浏览器端**：需要安装能够抓取 AI 对话并发送至本地接口（`http://127.0.0.1:端口/sync`）的浏览器插件或脚本。
- **网络环境**：确保本地环回地址 `127.0.0.1` 未被防火墙拦截。

### ⚠️ 已知限制 (Known Issues)

- **AI 平台支持**：
  - ✅ **已测试支持**：Gemini
  - ❌ **暂不支持**：部分具有强反爬或复杂 DOM 结构的 AI 平台可能需要针对性更新发送端。
- **内容限制**：目前仅支持同步文本对话，暂不支持同步图片、文件等二进制附件。
- **文件更新**：插件会自动更新 `.traerules` 和 `.cursorrules`，将同步文件包含在 AI 助手的上下文引用中。

---

**提示**：CoBridge 会自动将 `.vscode/AI_CONTEXT_SYNC.md`、`.traerules` 和 `.cursorrules` 添加到 `.gitignore`，以防止这些本地上下文文件被误提交到 Git 仓库。本插件不会以任何形式污染你的项目仓库。

<br>

---

## English Description

CoBridge is a VS Code extension designed to seamlessly sync AI conversation records from your browser to your local IDE, helping AI assistants (like Trae, Cursor, etc.) get the latest development context.

### 🚀 Quick Start

1. **Install Extension**: Search and install `CoBridge` in the VS Code Marketplace.

2. **Start Service**:
   
   - The service starts automatically in the background after installation (default port `3030`).
   
   - You can see the `CoBridge: On` icon in the bottom right status bar.
   
     ![running](images/running.gif)
   
   - Click the icon to manually **Start/Stop** the server, **View Logs**, or **Open Sync File**.
   
     ![management](images/management.png)
   
3. **Start Syncing**: Ensure your browser side is configured with a sender (companion browser extension or script). Conversations will be automatically saved to `.vscode/AI_CONTEXT_SYNC.md` in your current workspace.

### ⚙️ Settings

If the default port `3030` is occupied or needs to be changed:

1. Open VS Code Settings (`Ctrl + ,` or `Cmd + ,`).
2. Search for `AIContextSync.port`.
3. Change the port number to your desired value (e.g., `3031`).
4. It is recommended to restart the service manually via the status bar menu for changes to take effect.

![port](images/port.png)

### 📋 Prerequisites

- **VS Code Version**: `^1.104.3` or higher.
- **Browser Side**: Requires a browser extension or script capable of capturing AI conversations and sending them to the local interface (`http://127.0.0.1:PORT/sync`).
- **Network**: Ensure the local loopback address `127.0.0.1` is not blocked by a firewall.

### ⚠️ Known Issues

- **AI Platform Support**:
  - ✅ **Tested**: Gemini
  - ❌ **Not Supported**: AI platforms with strong anti-crawling or complex DOM structures may require specific updates to the sender.
- **Content Limits**: Currently supports syncing text conversations only; images, files, and other binary attachments are not supported.
- **File Updates**: The extension automatically updates `.traerules` and `.cursorrules` to include the sync file in the AI assistant's context.

---

**Note**: CoBridge automatically adds `.vscode/AI_CONTEXT_SYNC.md`, `.traerules`, and `.cursorrules` to `.gitignore` to prevent these local context files from being accidentally committed. This extension will not pollute your project repository in any way.
