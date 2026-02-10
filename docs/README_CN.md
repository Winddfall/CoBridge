# CoBridge — 让 AI 拥有"共享记忆"的次元桥✨

[English](../README.md) | [简体中文](README_CN.md) | [繁體中文](README_ZH_TW.md) | [日本語](README_JA.md) | [Français](README_FR.md) | [Español](README_ES.md) | [Português](README_PT.md) | [한국어](README_KO.md) | [Русский](README_RU.md) | [العربية](README_AR.md)

[![Version](https://img.shields.io/visual-studio-marketplace/v/windfall.co-bridge?label=version&style=flat-square)](https://marketplace.visualstudio.com/items?itemName=windfall.co-bridge)
[![VS Code Installs](https://img.shields.io/visual-studio-marketplace/i/windfall.co-bridge?style=flat-square&label=VS%20Code&logo=visual-studio-code&logoColor=white)](https://marketplace.visualstudio.com/items?itemName=windfall.co-bridge)
[![Open VSX Installs](https://img.shields.io/open-vsx/dt/windfall/co-bridge?style=flat-square&label=Open%20VSX)](https://open-vsx.org/extension/windfall/co-bridge)
[![License](https://img.shields.io/github/license/Winddfall/CoBridge?style=flat-square)](https://github.com/Winddfall/CoBridge/blob/master/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/Winddfall/CoBridge?style=flat-square&logo=github)](https://github.com/Winddfall/CoBridge/stargazers)
[![Last Commit](https://img.shields.io/github/last-commit/Winddfall/CoBridge?style=flat-square)](https://github.com/Winddfall/CoBridge/commits/master)

> [!IMPORTANT]
> **CoBridge 需要搭配 [Gemini Voyager](https://github.com/Nagi-ovo/gemini-voyager) 才能发挥作用**。
> CoBridge 负责在 IDE 端接收并管理上下文，Gemini Voyager 负责在网页端抓取并发送对话内容。两者"合体"后，你的 IDE 助手才能真正看懂网页里的聊天记录！

## ⚡️ 支持生态 (Supported Ecosystem)

![VS Code](https://img.shields.io/badge/Visual%20Studio%20Code-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white)
![GitHub Copilot](https://img.shields.io/badge/GitHub%20Copilot-6f42c1?style=for-the-badge&logo=githubcopilot&logoColor=white)
![Cursor](https://img.shields.io/badge/Cursor-000000?style=for-the-badge&logo=cursor&logoColor=white)
![Trae](https://img.shields.io/badge/Trae-3B82F6?style=for-the-badge&logo=openai&logoColor=white)

**一边在网页端和 AI "头脑风暴"，一边在 IDE 里写代码——却发现它们彼此失忆？**

CoBridge 就是那座"次元桥"：它把你在浏览器里与 AI 的聊天记录，瞬间搬运到 IDE ，让 Copilot、Trae、Cursor 这些 IDE 助手也能读懂你的思路。

> 大脑在云端，双手在本地——从此同频呼吸。

---

## 🚀 三步起飞

### 1. 安装 CoBridge

打开 VS Code 插件市场，搜索 **CoBridge**，点击安装。就这么简单。

### 2. 确认服务已启动

安装完毕后，瞄一眼右下角状态栏——看到 `CoBridge: On` 就说明桥已经搭好了（默认端口 `3030`）。

![状态栏运行中](../images/running.png)

点击这个小图标，你可以：
- 手动 **开/关** 服务  
- **查看日志**（出问题先看这里）  
- **打开同步文件**（看看 AI 记住了什么）
- **清空同步文件**（清空 AI 的记忆）

![管理菜单](../images/management.png)

### 3. 开始"记忆搬运"

确保浏览器端的 **Gemini Voyager** 已开启"上下文同步"功能。点击 **同步到IDE**，对话内容就会自动落地到：

```
.cobridge/AI_CONTEXT.md
```

从此，你的 IDE 助手再也不会一脸茫然地问你“你之前说了什么？”

---

## ⚙️ 端口被占了？换一个！

默认端口 `3030` 如果被其他程序"霸占"了，改起来也很简单：

1. 打开 VS Code 设置（`Ctrl + ,` / `Cmd + ,`）
2. 搜索 `AIContextSync.port`
3. 把端口号改成你喜欢的数字（比如 `3031`）
4. 在状态栏菜单里重启一下服务，搞定！

**由于vscode会以工作区设置覆盖用户设置，所以请在工作区设置中修改端口号**

![端口设置](../images/port.png)

---

## 📋 你需要准备什么

| 需求 | 说明 |
|------|------|
| **VS Code** | `1.50.0` 或更高版本 |
| **浏览器插件** | 需要配套的 [Gemini Voyager](https://github.com/Nagi-ovo/gemini-voyager) 来抓取对话 |
| **网络** | 确保 `127.0.0.1` 没被防火墙挡住 |

---

## 🎯 它的原则

- **零污染**：CoBridge 会自动把同步文件加入 `.gitignore`，绝不污染你的 Git 仓库。你的"悄悄话"只属于你自己。
- **格式友好**：全 Markdown 输出，IDE 里的 AI 读起来就像读说明书一样丝滑。
- **自动配置**：它还会帮你更新规则文件，让各路 AI 助手无缝读取上下文。

---

## ⚠️ 已知的小脾气

| 状态 | 说明 |
|------|------|
| ✅ **已支持** | Gemini |
| ✅ **表格支持** | 已支持同步表格 |
| ✅ **图片支持** | 已支持同步图片 |
| ❌ **暂不支持** | 某些反爬严格或 DOM 结构复杂的平台（欢迎 PR！）|
| ❌ **文件附件支持** | 暂不支持 |

---

## 🌟 一句话总结

**大模型从此不再失忆，在网页端聊透方案，在 IDE 里直接落地。**

如果这个项目帮到了你，欢迎去 [GitHub](https://github.com/Winddfall/CoBridge) 点个 Star ⭐

## 💡 提问

如果你有新的需求，欢迎在 [GitHub](https://github.com/Winddfall/CoBridge/issues) 提 issue。

## 🤝 贡献

如果你有好的建议或发现 bug，欢迎提交 Pull Request！

## 📄 许可证

该项目采用 MIT 许可证。

