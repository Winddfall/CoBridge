# CoBridge — 讓 AI 擁有「共享記憶」的次元橋✨

[English](../README.md) | [简体中文](README_CN.md) | [繁體中文](README_ZH_TW.md) | [日本語](README_JA.md) | [Français](README_FR.md) | [Español](README_ES.md) | [Português](README_PT.md) | [한국어](README_KO.md) | [Русский](README_RU.md) | [العربية](README_AR.md)

[![Version](https://img.shields.io/visual-studio-marketplace/v/windfall.co-bridge?label=version&style=flat-square)](https://marketplace.visualstudio.com/items?itemName=windfall.co-bridge)
[![VS Code Installs](https://img.shields.io/visual-studio-marketplace/i/windfall.co-bridge?style=flat-square&label=VS%20Code&logo=visual-studio-code&logoColor=white)](https://marketplace.visualstudio.com/items?itemName=windfall.co-bridge)
[![Open VSX Installs](https://img.shields.io/open-vsx/dt/windfall/co-bridge?style=flat-square&label=Open%20VSX)](https://open-vsx.org/extension/windfall/co-bridge)
[![License](https://img.shields.io/github/license/Winddfall/CoBridge?style=flat-square)](https://github.com/Winddfall/CoBridge/blob/master/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/Winddfall/CoBridge?style=flat-square&logo=github)](https://github.com/Winddfall/CoBridge/stargazers)
[![Last Commit](https://img.shields.io/github/last-commit/Winddfall/CoBridge?style=flat-square)](https://github.com/Winddfall/CoBridge/commits/master)

> [!IMPORTANT]
> **CoBridge 需要搭配 [Gemini Voyager](https://github.com/Nagi-ovo/gemini-voyager) 才能發揮作用**。
> CoBridge 負責在 IDE 端接收並管理上下文，Gemini Voyager 負責在網頁端抓取並發送對話內容。兩者「合體」後，你的 IDE 助手才能真正看懂網頁裡的聊天記錄！

## ⚡️ 支援生態 (Supported Ecosystem)

![VS Code](https://img.shields.io/badge/Visual%20Studio%20Code-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white)
![GitHub Copilot](https://img.shields.io/badge/GitHub%20Copilot-6f42c1?style=for-the-badge&logo=githubcopilot&logoColor=white)
![Cursor](https://img.shields.io/badge/Cursor-000000?style=for-the-badge&logo=cursor&logoColor=white)
![Trae](https://img.shields.io/badge/Trae-3B82F6?style=for-the-badge&logo=openai&logoColor=white)

**一邊在網頁端和 AI 「腦力激盪」，一邊在 IDE 裡寫程式——卻發現它們彼此失憶？**

CoBridge 就是那座「次元橋」：它把你在瀏覽器裡與 AI 的聊天記錄，瞬間搬運到 IDE ，讓 Copilot、Trae、Cursor 這些 IDE 助手也能讀懂你的思路。

> 大腦在雲端，雙手在本地——從此同頻呼吸。

---

## 🚀 三步起飛

### 1. 安裝 CoBridge

打開 VS Code 插件市場，搜尋 **CoBridge**，點擊安裝。就這麼簡單。

### 2. 確認服務已啟動

安裝完畢後，瞄一眼右下角狀態列——看到 `CoBridge: On` 就說明橋已經搭好了（預設連接埠 `3030`）。

![狀態列運行中](../images/running.png)

點擊這個小圖示，你可以：
- 手動 **開/關** 服務
- **查看日誌**（出問題先看這裡）
- **打開同步文件**（看看 AI 記住了什麼）
- **清空同步文件**（清空 AI 的記憶）

![管理菜單](../images/management.png)

### 3. 開始「記憶搬運」

確保瀏覽器端的 **Gemini Voyager** 已開啟「上下文同步」功能。點擊 **同步到IDE**，對話內容就會自動落地到：

```
.cobridge/AI_CONTEXT.md
```

從此，你的 IDE 助手再也不會一臉茫然地問你「你之前說了什麼？」

---

## ⚙️ 連接埠被佔用了？換一個！

預設連接埠 `3030` 如果被其他程式「霸佔」了，改起來也很簡單：

1. 打開 VS Code 設定（`Ctrl + ,` / `Cmd + ,`）
2. 搜尋 `AIContextSync.port`
3. 把連接埠號改成你喜歡的數字（比如 `3031`）
4. 在狀態列菜單裡重啟一下服務，搞定！

**由於 VS Code 會以工作區設定覆蓋用戶設定，所以請在工作區設定中修改連接埠號**

![連接埠設定](../images/port.png)

---

## 📋 你需要準備什麼

| 需求 | 說明 |
|------|------|
| **VS Code** | `1.50.0` 或更高版本 |
| **瀏覽器插件** | 需要配套的 [Gemini Voyager](https://github.com/Nagi-ovo/gemini-voyager) 來抓取對話 |
| **網絡** | 確保 `127.0.0.1` 沒被防火牆擋住 |

---

## 🎯 它的原則

- **零污染**：CoBridge 會自動把同步文件加入 `.gitignore`，絕不污染你的 Git 倉庫。你的「悄悄話」只屬於你自己。
- **格式友善**：全 Markdown 輸出，IDE 裡的 AI 讀起來就像讀說明書一樣絲滑。
- **自動配置**：它還會幫你更新規則文件，讓各路 AI 助手無縫讀取上下文。

---

## ⚠️ 已知的小脾氣

| 狀態 | 說明 |
|------|------|
| ✅ **已支援** | Gemini |
| ✅ **表格支援** | 已支援同步表格 |
| ✅ **圖片支援** | 已支援同步圖片 |
| ❌ **暫不支援** | 某些反爬蟲嚴格或 DOM 結構複雜的平台（歡迎 PR！）|
| ❌ **文件附件支援** | 暫不支援 |

---

## 🌟 一句話總結

**大模型從此不再失憶，在網頁端聊透方案，在 IDE 裡直接落地。**

如果這個專案幫到了你，歡迎去 [GitHub](https://github.com/Winddfall/CoBridge) 點個 Star ⭐

## 💡 提問

如果你有新的需求，歡迎在 [GitHub](https://github.com/Winddfall/CoBridge/issues) 提 issue。

## 🤝 貢獻

如果你有好的建議或發現 bug，歡迎提交 Pull Request！

## 📄 授權許可

該專案採用 MIT 授權許可。
