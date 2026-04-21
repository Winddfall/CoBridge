# CoBridge — The Dimensional Bridge for AI "Shared Memory" ✨

[English](README.md) | [简体中文](docs/README_CN.md) | [繁體中文](docs/README_ZH_TW.md) | [日本語](docs/README_JA.md) | [Français](docs/README_FR.md) | [Español](docs/README_ES.md) | [Português](docs/README_PT.md) | [한국어](docs/README_KO.md) | [Русский](docs/README_RU.md) | [العربية](docs/README_AR.md)

[![Version](https://img.shields.io/visual-studio-marketplace/v/windfall.co-bridge?label=version&style=flat-square)](https://marketplace.visualstudio.com/items?itemName=windfall.co-bridge)
[![VS Code Installs](https://img.shields.io/visual-studio-marketplace/i/windfall.co-bridge?style=flat-square&label=VS%20Code&logo=visual-studio-code&logoColor=white)](https://marketplace.visualstudio.com/items?itemName=windfall.co-bridge)
[![Open VSX Installs](https://img.shields.io/open-vsx/dt/windfall/co-bridge?style=flat-square&label=Open%20VSX)](https://open-vsx.org/extension/windfall/co-bridge)
[![License](https://img.shields.io/github/license/Winddfall/CoBridge?style=flat-square)](https://github.com/Winddfall/CoBridge/blob/master/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/Winddfall/CoBridge?style=flat-square&logo=github)](https://github.com/Winddfall/CoBridge/stargazers)
[![Last Commit](https://img.shields.io/github/last-commit/Winddfall/CoBridge?style=flat-square)](https://github.com/Winddfall/CoBridge/commits/master)

> [!IMPORTANT]
> **CoBridge requires the browser extension [Voyager](https://github.com/Nagi-ovo/gemini-voyager) to work.**
> CoBridge handles context reception in the IDE, while Voyager captures context from the web interface. Together, they enable seamless context synchronization!

## ⚡️ Supported Ecosystem

![VS Code](https://img.shields.io/badge/Visual%20Studio%20Code-007ACC?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMSAxIDE0IDE0Ij48cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNMTAuODYzIDEzLjkxOWEuOC44IDAgMCAxLS42NDQuMDI1YS44LjggMCAwIDEtLjI3OS0uMTgzTDQuODE2IDkuMDYzbC0yLjIzMiAxLjcwM2EuNTQuNTQgMCAwIDEtLjY5MS0uMDMxbC0uNzE2LS42NTVhLjU0Ni41NDYgMCAwIDEgMC0uODA1TDMuMTEyIDcuNUwxLjE3NyA1LjcyNWEuNTQ2LjU0NiAwIDAgMSAwLS44MDVsLjcxNi0uNjU1YS41NC41NCAwIDAgMSAuNjkxLS4wMzFsMi4yMzIgMS43MDNMOS45NCAxLjIzOWEuODA1LjgwNSAwIDAgMSAuOTIzLS4xNTlsMi42NzcgMS4yOTVjLjI4MS4xMzYuNDYuNDIyLjQ2LjczNlY4aC0zLjI0OFY0LjUzNEw2Ljg2NCA3LjVsMy44ODggMi45NjZWOEgxNHYzLjg4OWMwIC4zMTQtLjE3OS42LS40Ni43MzZ6Ii8+PC9zdmc+)
![GitHub Copilot](https://img.shields.io/badge/GitHub%20Copilot-6f42c1?style=for-the-badge&logo=githubcopilot&logoColor=white)
![Cursor](https://img.shields.io/badge/Cursor-000000?style=for-the-badge&logo=cursor&logoColor=white)
![Trae](https://img.shields.io/badge/Trae-32f08C?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGhlaWdodD0iMWVtIiBzdHlsZT0iZmxleDpub25lO2xpbmUtaGVpZ2h0OjEiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjFlbSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+VFJBRTwvdGl0bGU+PHBhdGggZD0iTTI0IDIwLjU0MUgzLjQyOHYtMy40MjZIMFYzLjRoMjRWMjAuNTR6TTMuNDI4IDE3LjExNWgxNy4xNDRWNi44MjdIMy40Mjh2MTAuMjg4em04LjU3My01LjE5NmwtMi40MjUgMi40MjQtMi40MjQtMi40MjQgMi40MjQtMi40MjQgMi40MjUgMi40MjR6bTYuODU3LS4wMDFsLTIuNDI0IDIuNDIzLTIuNDI1LTIuNDIzIDIuNDI1LTIuNDI1IDIuNDI0IDIuNDI1eiI+PC9wYXRoPjwvc3ZnPg==)
![Antigravity](https://img.shields.io/badge/Antigravity-4285F4?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJ3aGl0ZSIgZD0iTTEyLjAyNSAycTIuMjg0IDAgMy41NTkgMS43MTZUMTcuMTI1IDdxLjY1IDEuNTc1IDEuMjUgMy41dDEuMjc1IDMuODc1cS42NSAxLjg3NSAxLjQyNSAzLjUyNXQxLjggMi44MjVxLjIuMjI1LjE3NS41MjV0LS4yMjUuNTI1dC0uNDc1LjI1dC0uNTUtLjE3NXEtMS45NzUtMS41NS0zLjI1LTMuNDYzdC0yLjU3NS0zLjMzN3EtLjg1LS45NS0xLjgxMi0xLjVUMTIuMDI1IDEzdC0yLjEzNy41NXQtMS44MTMgMS41cS0xLjMgMS40MjUtMi41NzUgMy4zMzhUMi4yNSAyMS44NnEtLjI3NS4yLS41NS4xNzV0LS40NzUtLjI1VDEgMjEuMjV0LjE3NS0uNTI1UTIuMiAxOS41NSAyLjk3NSAxNy45VDQuNCAxNC4zNzVxLjY3NS0xLjk1IDEuMjc1LTMuODc1VDYuOTI1IDdxLjgtMS45NSAxLjkzOC0zLjQ3NVQxMi4wMjUgMiIvPjwvc3ZnPg==)
![Claude Code](https://img.shields.io/badge/Claude%20Code-D97757?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGhlaWdodD0iMmVtIiBzdHlsZT0iZmxleDpub25lO2xpbmUtaGVpZ2h0OjEiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjJlbSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCiAgPHRpdGxlPkFudGlncmF2aXR5PC90aXRsZT4NCiAgPHBhdGggY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMjAuOTk4IDEwLjk0OUgyNHYzLjEwMmgtM3YzLjAyOGgtMS40ODdWMjBIMTh2LTIuOTIxaC0xLjQ4N1YyMEgxNXYtMi45MjFIOVYyMEg3LjQ4OHYtMi45MjFINlYyMEg0LjQ4N3YtMi45MjFIM1YxNC4wNUgwVjEwLjk1aDNWNWgxNy45OTh2NS45NDl6TTYgMTAuOTQ5aDEuNDg4VjguMTAySDZ2Mi44NDd6bTEwLjUxIDBIMThWOC4xMDJoLTEuNDl2Mi44NDd6Ij48L3BhdGg+DQo8L3N2Zz4=)
![Codex](https://img.shields.io/badge/Codex-5865F2?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGhlaWdodD0iMWVtIiBzdHlsZT0iZmxleDpub25lO2xpbmUtaGVpZ2h0OjEiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjFlbSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+Q29kZXg8L3RpdGxlPjxwYXRoIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTguMDg2LjQ1N2E2LjEwNSA2LjEwNSAwIDAxMy4wNDYtLjQxNWMxLjMzMy4xNTMgMi41MjEuNzIgMy41NjQgMS43YS4xMTcuMTE3IDAgMDAuMTA3LjAyOWMxLjQwOC0uMzQ2IDIuNzYyLS4yMjQgNC4wNjEuMzY2bC4wNjMuMDMuMTU0LjA3NmMxLjM1Ny43MDMgMi4zMyAxLjc3IDIuOTE4IDMuMTk4LjI3OC42NzkuNDE4IDEuMzg4LjQyMSAyLjEyNmE1LjY1NSA1LjY1NSAwIDAxLS4xOCAxLjYzMS4xNjcuMTY3IDAgMDAuMDQuMTU1IDUuOTgyIDUuOTgyIDAgMDExLjU3OCAyLjg5MWMuMzg1IDEuOTAxLS4wMSAzLjYxNS0xLjE4MyA1LjE0bC0uMTgyLjIyYTYuMDYzIDYuMDYzIDAgMDEtMi45MzQgMS44NTEuMTYyLjE2MiAwIDAwLS4xMDguMTAyYy0uMjU1LjczNi0uNTExIDEuMzY0LS45ODcgMS45OTItMS4xOTkgMS41ODItMi45NjIgMi40NjItNC45NDggMi40NTEtMS41ODMtLjAwOC0yLjk4Ni0uNTg3LTQuMjEtMS43MzZhLjE0NS4xNDUgMCAwMC0uMTQtLjAzMmMtLjUxOC4xNjctMS4wNC4xOTEtMS42MDQuMTg1YTUuOTI0IDUuOTI0IDAgMDEtMi41OTUtLjYyMiA2LjA1OCA2LjA1OCAwIDAxLTIuMTQ2LTEuNzgxYy0uMjAzLS4yNjktLjQwNC0uNTIyLS41NTEtLjgyMWE3Ljc0IDcuNzQgMCAwMS0uNDk1LTEuMjgzIDYuMTEgNi4xMSAwIDAxLS4wMTctMy4wNjQuMTY2LjE2NiAwIDAwLjAwOC0uMDc0LjExNS4xMTUgMCAwMC0uMDM3LS4wNjQgNS45NTggNS45NTggMCAwMS0xLjM4LTIuMjAyIDUuMTk2IDUuMTk2IDAgMDEtLjMzMy0xLjU4OSA2LjkxNSA2LjkxNSAwIDAxLjE4OC0yLjEzMmMuNDUtMS40ODQgMS4zMDktMi42NDggMi41NzctMy40OTMuMjgyLS4xODguNTUtLjMzNC44MDItLjQzOC4yODYtLjEyLjU3My0uMjIuODYxLS4zMDRhLjEyOS4xMjkgMCAwMC4wODctLjA4N0E2LjAxNiA2LjAxNiAwIDAxNS42MzUgMi4zMUM2LjMxNSAxLjQ2NCA3LjEzMi44NDYgOC4wODYuNDU3em0tLjgwNCA3Ljg1YS44NDguODQ4IDAgMDAtMS40NzMuODQybDEuNjk0IDIuOTY1LTEuNjg4IDIuODQ4YS44NDkuODQ5IDAgMDAxLjQ2Ljg2NGwxLjk0LTMuMjcyYS44NDkuODQ5IDAgMDAuMDA3LS44NTRsLTEuOTQtMy4zOTN6bTUuNDQ2IDYuMjRhLjg0OS44NDkgMCAwMDAgMS42OTVoNC44NDhhLjg0OS44NDkgMCAwMDAtMS42OTZoLTQuODQ4eiI+PC9wYXRoPjwvc3ZnPg==)

**Brainstorming with AI on the web, having Agents write code in the IDE/CLI — yet they seem to have forgotten each other?**

CoBridge is that "Dimensional Bridge": it instantly transports your chat history from the browser to your local workspace, allowing Agents like Copilot, Cursor, and Claude Code to understand your thought process.

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
