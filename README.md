# CoBridge — The Dimensional Bridge for AI "Shared Memory" ✨

[English](README.md) | [简体中文](docs/README_CN.md) | [繁體中文](docs/README_ZH_TW.md) | [日本語](docs/README_JA.md) | [Français](docs/README_FR.md) | [Español](docs/README_ES.md) | [Português](docs/README_PT.md) | [한국어](docs/README_KO.md) | [Русский](docs/README_RU.md) | [العربية](docs/README_AR.md)

[![Version](https://img.shields.io/visual-studio-marketplace/v/windfall.co-bridge?label=version&style=flat-square)](https://marketplace.visualstudio.com/items?itemName=windfall.co-bridge)
[![VS Code Installs](https://img.shields.io/visual-studio-marketplace/i/windfall.co-bridge?style=flat-square&label=VS%20Code&logo=visual-studio-code&logoColor=white)](https://marketplace.visualstudio.com/items?itemName=windfall.co-bridge)
[![Open VSX Installs](https://img.shields.io/open-vsx/dt/windfall/co-bridge?style=flat-square&label=Open%20VSX)](https://open-vsx.org/extension/windfall/co-bridge)
[![License](https://img.shields.io/github/license/Winddfall/CoBridge?style=flat-square)](https://github.com/Winddfall/CoBridge/blob/master/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/Winddfall/CoBridge?style=flat-square&logo=github)](https://github.com/Winddfall/CoBridge/stargazers)
[![Last Commit](https://img.shields.io/github/last-commit/Winddfall/CoBridge?style=flat-square)](https://github.com/Winddfall/CoBridge/commits/master)

> [!IMPORTANT]
> **CoBridge explicitly requires the [Gemini Voyager](https://github.com/Nagi-ovo/gemini-voyager) browser extension to work.**
> CoBridge handles context reception in the IDE, while Gemini Voyager captures context from the web interface. Together, they enable seamless context synchronization!

## ⚡️ Supported Ecosystem

![VS Code](https://img.shields.io/badge/Visual%20Studio%20Code-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white)
![GitHub Copilot](https://img.shields.io/badge/GitHub%20Copilot-6f42c1?style=for-the-badge&logo=githubcopilot&logoColor=white)
![Cursor](https://img.shields.io/badge/Cursor-000000?style=for-the-badge&logo=cursor&logoColor=white)
![Trae](https://img.shields.io/badge/Trae-3B82F6?style=for-the-badge&logo=openai&logoColor=white)

**Brainstorming with AI on the web, coding in the IDE — yet they seem to have forgotten each other?**

CoBridge is that "Dimensional Bridge": it instantly transports your chat history from the browser to your IDE, allowing AI assistants like Copilot, Trae, and Cursor to understand your thought process.

> Brain in the cloud, hands on local — breathing in sync.

---

## 🚀 Three Steps to Take Off

### 1. Install CoBridge

Open the VS Code Extension Marketplace, search for **CoBridge**, and click install. It's that simple.

### 2. Confirm Service Status

After installation, glance at the status bar in the bottom right corner — seeing `CoBridge: On` means the bridge is ready (default port `3030`).

![Running Status](images/running.png)

Clicking this icon allows you to:
- Manually **Start/Stop** the service
- **View Logs** (Check here if issues arise)
- **Open Sync File** (See what the AI remembers)
- **Clear Sync File** (Wipe the AI's memory)

![Management Menu](images/management.png)

### 3. Start "Memory Teleportation"

Ensure **Gemini Voyager** in your browser has "Context Sync" enabled. Click **Sync to IDE**, and the conversation content will automatically land in:

```
.cobridge/AI_CONTEXT.md
```

From now on, your IDE assistant will never look at you blankly and ask, "What did you say before?"

---

## ⚙️ Port Occupied? Change It!

If the default port `3030` is "hogged" by another program, changing it is easy:

1. Open VS Code Settings (`Ctrl + ,` / `Cmd + ,`)
2. Search for `AIContextSync.port`
3. Change the port number to your preference (e.g., `3031`)
4. Restart the service from the status bar menu, and you're done!

**Since VS Code workspace settings override user settings, please modify the port number in your Workspace Settings.**

![Port Settings](images/port.png)

---

## 📋 Prerequisites

| Requirement | Description |
|------|------|
| **VS Code** | `1.50.0` or higher |
| **Browser Extension** | Requires the companion [Gemini Voyager](https://github.com/Nagi-ovo/gemini-voyager) to capture conversations |
| **Network** | Ensure `127.0.0.1` is not blocked by a firewall |

---

## 🎯 Principles

- **Zero Pollution**: CoBridge automatically adds the sync file to `.gitignore`, ensuring it never pollutes your Git repository. Your "whispers" stay with you.
- **Friendly Format**: Full Markdown output, making it as smooth for your IDE AI to read as a manual.
- **Auto Configuration**: It also helps update rule files, allowing various AI assistants to seamlessly read the context.

---

## ⚠️ Known Quirks

| Status | Description |
|------|------|
| ✅ **Supported** | Gemini |
| ✅ **Table Support** | Table synchronization is supported |
| ✅ **Image Support** | Image synchronization is supported |
| ❌ **Not Supported** | Platforms with strict anti-scraping or complex DOM structures (PRs welcome!) |
| ❌ **File Attachments** | Not yet supported |

---

## 🌟 TL;DR

**LLMs will no longer have amnesia. Discuss solutions thoroughly on the web, and implement them directly in the IDE.**

If this project helped you, please give us a Star ⭐ on [GitHub](https://github.com/Winddfall/CoBridge).

## 💡 Issues

If you have new requirements, welcome to raise an issue on [GitHub](https://github.com/Winddfall/CoBridge/issues).

## 🤝 Contributing

If you have good suggestions or find a bug, Pull Requests are welcome!

## 📄 License

This project is licensed under the MIT License.

## Star History

<a href="https://www.star-history.com/?repos=Winddfall%2FCoBridge&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/image?repos=Winddfall/CoBridge&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/image?repos=Winddfall/CoBridge&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/image?repos=Winddfall/CoBridge&type=date&legend=top-left" />
 </picture>
</a>
