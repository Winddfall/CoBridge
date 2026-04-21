# CoBridge — AIに「共有メモリ」を持たせる次元の架け橋✨

[English](../README.md) | [简体中文](README_CN.md) | [繁體中文](README_ZH_TW.md) | [日本語](README_JA.md) | [Français](README_FR.md) | [Español](README_ES.md) | [Português](README_PT.md) | [한국어](README_KO.md) | [Русский](README_RU.md) | [العربية](README_AR.md)

[![Version](https://img.shields.io/visual-studio-marketplace/v/windfall.co-bridge?label=version&style=flat-square)](https://marketplace.visualstudio.com/items?itemName=windfall.co-bridge)
[![VS Code Installs](https://img.shields.io/visual-studio-marketplace/i/windfall.co-bridge?style=flat-square&label=VS%20Code&logo=visual-studio-code&logoColor=white)](https://marketplace.visualstudio.com/items?itemName=windfall.co-bridge)
[![Open VSX Installs](https://img.shields.io/open-vsx/dt/windfall/co-bridge?style=flat-square&label=Open%20VSX)](https://open-vsx.org/extension/windfall/co-bridge)
[![License](https://img.shields.io/github/license/Winddfall/CoBridge?style=flat-square)](https://github.com/Winddfall/CoBridge/blob/master/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/Winddfall/CoBridge?style=flat-square&logo=github)](https://github.com/Winddfall/CoBridge/stargazers)
[![Last Commit](https://img.shields.io/github/last-commit/Winddfall/CoBridge?style=flat-square)](https://github.com/Winddfall/CoBridge/commits/master)

> [!IMPORTANT]
> **CoBridgeが機能するには、ブラウザ拡張機能 [Voyager](https://github.com/Nagi-ovo/gemini-voyager) が必要です。**
> CoBridgeはIDE側でコンテキストを受信・管理し、VoyagerはWeb側で会話を取得・送信します。この2つが「合体」することで、初めてシームレスなコンテキスト同期が可能になります！

## ⚡️ サポートされているエコシステム (Supported Ecosystem)

![VS Code](https://img.shields.io/badge/Visual%20Studio%20Code-007ACC?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMSAxIDE0IDE0Ij48cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNMTAuODYzIDEzLjkxOWEuOC44IDAgMCAxLS42NDQuMDI1YS44LjggMCAwIDEtLjI3OS0uMTgzTDQuODE2IDkuMDYzbC0yLjIzMiAxLjcwM2EuNTQuNTQgMCAwIDEtLjY5MS0uMDMxbC0uNzE2LS42NTVhLjU0Ni41NDYgMCAwIDEgMC0uODA1TDMuMTEyIDcuNUwxLjE3NyA1LjcyNWEuNTQ2LjU0NiAwIDAgMSAwLS44MDVsLjcxNi0uNjU1YS41NC41NCAwIDAgMSAuNjkxLS4wMzFsMi4yMzIgMS43MDNMOS45NCAxLjIzOWEuODA1LjgwNSAwIDAgMSAuOTIzLS4xNTlsMi42NzcgMS4yOTVjLjI4MS4xMzYuNDYuNDIyLjQ2LjczNlY4aC0zLjI0OFY0LjUzNEw2Ljg2NCA3LjVsMy44ODggMi45NjZWOEgxNHYzLjg4OWMwIC4zMTQtLjE3OS42LS40Ni43MzZ6Ii8+PC9zdmc+)
![GitHub Copilot](https://img.shields.io/badge/GitHub%20Copilot-6f42c1?style=for-the-badge&logo=githubcopilot&logoColor=white)
![Cursor](https://img.shields.io/badge/Cursor-000000?style=for-the-badge&logo=cursor&logoColor=white)
![Trae](https://img.shields.io/badge/Trae-32f08C?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGhlaWdodD0iMWVtIiBzdHlsZT0iZmxleDpub25lO2xpbmUtaGVpZ2h0OjEiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjFlbSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+VFJBRTwvdGl0bGU+PHBhdGggZD0iTTI0IDIwLjU0MUgzLjQyOHYtMy40MjZIMFYzLjRoMjRWMjAuNTR6TTMuNDI4IDE3LjExNWgxNy4xNDRWNi44MjdIMy40Mjh2MTAuMjg4em04LjU3My01LjE5NmwtMi40MjUgMi40MjQtMi40MjQtMi40MjQgMi40MjQtMi40MjQgMi40MjUgMi40MjR6bTYuODU3LS4wMDFsLTIuNDI0IDIuNDIzLTIuNDI1LTIuNDIzIDIuNDI1LTIuNDI1IDIuNDI0IDIuNDI1eiI+PC9wYXRoPjwvc3ZnPg==)
![Antigravity](https://img.shields.io/badge/Antigravity-4285F4?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJ3aGl0ZSIgZD0iTTEyLjAyNSAycTIuMjg0IDAgMy41NTkgMS43MTZUMTcuMTI1IDdxLjY1IDEuNTc1IDEuMjUgMy41dDEuMjc1IDMuODc1cS42NSAxLjg3NSAxLjQyNSAzLjUyNXQxLjggMi44MjVxLjIuMjI1LjE3NS41MjV0LS4yMjUuNTI1dC0uNDc1LjI1dC0uNTUtLjE3NXEtMS45NzUtMS41NS0zLjI1LTMuNDYzdC0yLjU3NS0zLjMzN3EtLjg1LS45NS0xLjgxMi0xLjVUMTIuMDI1IDEzdC0yLjEzNy41NXQtMS44MTMgMS41cS0xLjMgMS40MjUtMi41NzUgMy4zMzhUMi4yNSAyMS44NnEtLjI3NS4yLS41NS4xNzV0LS40NzUtLjI1VDEgMjEuMjV0LjE3NS0uNTI1UTIuMiAxOS41NSAyLjk3NSAxNy45VDQuNCAxNC4zNzVxLjY3NS0xLjk1IDEuMjc1LTMuODc1VDYuOTI1IDdxLjgtMS45NSAxLjkzOC0zLjQ3NVQxMi4wMjUgMiIvPjwvc3ZnPg==)
![Claude Code](https://img.shields.io/badge/Claude%20Code-D97757?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGhlaWdodD0iMmVtIiBzdHlsZT0iZmxleDpub25lO2xpbmUtaGVpZ2h0OjEiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjJlbSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCiAgPHRpdGxlPkFudGlncmF2aXR5PC90aXRsZT4NCiAgPHBhdGggY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMjAuOTk4IDEwLjk0OUgyNHYzLjEwMmgtM3YzLjAyOGgtMS40ODdWMjBIMTh2LTIuOTIxaC0xLjQ4N1YyMEgxNXYtMi45MjFIOVYyMEg3LjQ4OHYtMi45MjFINlYyMEg0LjQ4N3YtMi45MjFIM1YxNC4wNUgwVjEwLjk1aDNWNWgxNy45OTh2NS45NDl6TTYgMTAuOTQ5aDEuNDg4VjguMTAySDZ2Mi44NDd6bTEwLjUxIDBIMThWOC4xMDJoLTEuNDl2Mi44NDd6Ij48L3BhdGg+DQo8L3N2Zz4=)
![Codex](https://img.shields.io/badge/Codex-5865F2?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGhlaWdodD0iMWVtIiBzdHlsZT0iZmxleDpub25lO2xpbmUtaGVpZ2h0OjEiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjFlbSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+Q29kZXg8L3RpdGxlPjxwYXRoIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTguMDg2LjQ1N2E2LjEwNSA2LjEwNSAwIDAxMy4wNDYtLjQxNWMxLjMzMy4xNTMgMi41MjEuNzIgMy41NjQgMS43YS4xMTcuMTE3IDAgMDAuMTA3LjAyOWMxLjQwOC0uMzQ2IDIuNzYyLS4yMjQgNC4wNjEuMzY2bC4wNjMuMDMuMTU0LjA3NmMxLjM1Ny43MDMgMi4zMyAxLjc3IDIuOTE4IDMuMTk4LjI3OC42NzkuNDE4IDEuMzg4LjQyMSAyLjEyNmE1LjY1NSA1LjY1NSAwIDAxLS4xOCAxLjYzMS4xNjcuMTY3IDAgMDAuMDQuMTU1IDUuOTgyIDUuOTgyIDAgMDExLjU3OCAyLjg5MWMuMzg1IDEuOTAxLS4wMSAzLjYxNS0xLjE4MyA1LjE0bC0uMTgyLjIyYTYuMDYzIDYuMDYzIDAgMDEtMi45MzQgMS44NTEuMTYyLjE2MiAwIDAwLS4xMDguMTAyYy0uMjU1LjczNi0uNTExIDEuMzY0LS45ODcgMS45OTItMS4xOTkgMS41ODItMi45NjIgMi40NjItNC45NDggMi40NTEtMS41ODMtLjAwOC0yLjk4Ni0uNTg3LTQuMjEtMS43MzZhLjE0NS4xNDUgMCAwMC0uMTQtLjAzMmMtLjUxOC4xNjctMS4wNC4xOTEtMS42MDQuMTg1YTUuOTI0IDUuOTI0IDAgMDEtMi41OTUtLjYyMiA2LjA1OCA2LjA1OCAwIDAxLTIuMTQ2LTEuNzgxYy0uMjAzLS4yNjktLjQwNC0uNTIyLS41NTEtLjgyMWE3Ljc0IDcuNzQgMCAwMS0uNDk1LTEuMjgzIDYuMTEgNi4xMSAwIDAxLS4wMTctMy4wNjQuMTY2LjE2NiAwIDAwLjAwOC0uMDc0LjExNS4xMTUgMCAwMC0uMDM3LS4wNjQgNS45NTggNS45NTggMCAwMS0xLjM4LTIuMjAyIDUuMTk2IDUuMTk2IDAgMDEtLjMzMy0xLjU4OSA2LjkxNSA2LjkxNSAwIDAxLjE4OC0yLjEzMmMuNDUtMS40ODQgMS4zMDktMi42NDggMi41NzctMy40OTMuMjgyLS4xODguNTUtLjMzNC44MDItLjQzOC4yODYtLjEyLjU3My0uMjIuODYxLS4zMDRhLjEyOS4xMjkgMCAwMC4wODctLjA4N0E2LjAxNiA2LjAxNiAwIDAxNS42MzUgMi4zMUM2LjMxNSAxLjQ2NCA3LjEzMi44NDYgOC4wODYuNDU3em0tLjgwNCA3Ljg1YS44NDguODQ4IDAgMDAtMS40NzMuODQybDEuNjk0IDIuOTY1LTEuNjg4IDIuODQ4YS44NDkuODQ5IDAgMDAxLjQ2Ljg2NGwxLjk0LTMuMjcyYS44NDkuODQ5IDAgMDAuMDA3LS44NTRsLTEuOTQtMy4zOTN6bTUuNDQ2IDYuMjRhLjg0OS44NDkgMCAwMDAgMS42OTVoNC44NDhhLjg0OS44NDkgMCAwMDAtMS42OTZoLTQuODQ4eiI+PC9wYXRoPjwvc3ZnPg==)

**WebでAIと「ブレインストーミング」し、IDE/CLIでAgentにコードを書かせる。でも、お互いの記憶がないことに気づきませんか？**

CoBridgeはまさにその「次元の架け橋」です。ブラウザでのAIとのチャット履歴を瞬時にローカルに転送し、Copilot、Cursor、Claude CodeなどのAgentがあなたの思考プロセスを理解できるようにします。

> 脳はクラウドに、手はローカルに —— これで息が合います。

---

## 🚀 離陸までの3ステップ

### 1. CoBridgeをインストール

VS Codeの拡張機能マーケットプレイスを開き、**CoBridge** を検索してインストールをクリックします。とても簡単です。

### 2. サービスの起動を確認

インストール後、右下のステータスバーを見てください。`CoBridge: On` と表示されていれば、架け橋の準備は完了です（デフォルトポート `3030`）。

![実行中ステータス](../images/running.png)

このアイコンをクリックすると、以下のことができます：
- 手動でサービスの **オン/オフ**
- **ログの表示**（問題が発生した場合はここを確認）
- **同期ファイルを開く**（AIが何を記憶しているか確認）
- **同期ファイルをクリア**（AIの記憶を消去）

![管理メニュー](../images/management.png)

### 3. 「記憶の転送」を開始

ブラウザ側の **Gemini Voyager** で「コンテキスト同期」機能が有効になっていることを確認してください。**IDEに同期** をクリックすると、会話の内容が自動的に以下のファイルに保存されます：

```
.cobridge/AI_CONTEXT.md
```

これで、あなたのIDEアシスタントが「前に何を言ったっけ？」と呆然とすることはもうありません。

---

## ⚙️ ポートが使われている？変更しましょう！

デフォルトのポート `3030` が他のプログラムに「占領」されている場合でも、簡単に変更できます：

1. VS Codeの設定を開く（`Ctrl + ,` / `Cmd + ,`）
2. `AIContextSync.port` を検索
3. ポート番号を好きな数字に変更（例：`3031`）
4. ステータスバーのメニューからサービスを再起動すれば完了！

**VS Codeはワークスペース設定がユーザー設定を上書きするため、ワークスペース設定でポート番号を変更してください。**

![ポート設定](../images/port.png)

---

## 📋 必要なもの

| 要件 | 説明 |
|------|------|
| **VS Code** | `1.50.0` 以上 |
| **ブラウザ拡張機能** | 会話を取得するために、対応する [Gemini Voyager](https://github.com/Nagi-ovo/gemini-voyager) が必要です |
| **ネットワーク** | `127.0.0.1` がファイアウォールでブロックされていないことを確認してください |

---

## 🎯 原則

- **汚染ゼロ**：CoBridgeは同期ファイルを自動的に `.gitignore` に追加し、Gitリポジトリを汚染しません。あなたの「内緒話」はあなただけのものです。
- **フレンドリーなフォーマット**：完全なMarkdown出力により、IDE内のAIが説明書を読むようにスムーズに読み取れます。
- **自動設定**：ルールファイルの更新も支援し、さまざまなAIアシスタントがシームレスにコンテキストを読み取れるようにします。

---

## ⚠️ 既知の制限事項

| ステータス | 説明 |
|------|------|
| ✅ **サポート済み** | Gemini |
| ✅ **テーブル対応** | テーブルの同期に対応 |
| ✅ **画像対応** | 画像の同期に対応 |
| ❌ **未サポート** | スクレイピング対策が厳しい、またはDOM構造が複雑なプラットフォーム（PR歓迎！）|
| ❌ **ファイル添付** | 未サポート |

---

## 🌟 一言でまとめると

**大規模言語モデル（LLM）はもう記憶喪失にはなりません。Webで解決策を徹底的に議論し、IDEで直接実装しましょう。**

このプロジェクトが役に立った場合は、[GitHub](https://github.com/Winddfall/CoBridge) でStar ⭐ をお願いします。

## 💡 質問

新しい要望がある場合は、[GitHub](https://github.com/Winddfall/CoBridge/issues) でissueを立ててください。

## 🤝 貢献

良い提案がある場合やバグを見つけた場合は、Pull Requestを歓迎します！

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。
