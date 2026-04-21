# CoBridge — AI에 "공유 메모리"를 제공하는 차원 다리 ✨

[English](../README.md) | [简体中文](README_CN.md) | [繁體中文](README_ZH_TW.md) | [日本語](README_JA.md) | [Français](README_FR.md) | [Español](README_ES.md) | [Português](README_PT.md) | [한국어](README_KO.md) | [Русский](README_RU.md) | [العربية](README_AR.md)

[![Version](https://img.shields.io/visual-studio-marketplace/v/windfall.co-bridge?label=version&style=flat-square)](https://marketplace.visualstudio.com/items?itemName=windfall.co-bridge)
[![VS Code Installs](https://img.shields.io/visual-studio-marketplace/i/windfall.co-bridge?style=flat-square&label=VS%20Code&logo=visual-studio-code&logoColor=white)](https://marketplace.visualstudio.com/items?itemName=windfall.co-bridge)
[![Open VSX Installs](https://img.shields.io/open-vsx/dt/windfall/co-bridge?style=flat-square&label=Open%20VSX)](https://open-vsx.org/extension/windfall/co-bridge)
[![License](https://img.shields.io/github/license/Winddfall/CoBridge?style=flat-square)](https://github.com/Winddfall/CoBridge/blob/master/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/Winddfall/CoBridge?style=flat-square&logo=github)](https://github.com/Winddfall/CoBridge/stargazers)
[![Last Commit](https://img.shields.io/github/last-commit/Winddfall/CoBridge?style=flat-square)](https://github.com/Winddfall/CoBridge/commits/master)

> [!IMPORTANT]
> **CoBridge가 작동하려면 브라우저 확장 프로그램 [Voyager](https://github.com/Nagi-ovo/gemini-voyager)가 필요합니다.**
> CoBridge는 IDE에서 컨텍스트 수신을 처리하고, Voyager는 웹 인터페이스에서 컨텍스트를 캡처합니다. 이 두 가지가 함께 작동해야 완벽한 컨텍스트 동기화가 가능합니다!

## ⚡️ 지원되는 생태계 (Supported Ecosystem)

![VS Code](https://img.shields.io/badge/Visual%20Studio%20Code-007ACC?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMSAxIDE0IDE0Ij48cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNMTAuODYzIDEzLjkxOWEuOC44IDAgMCAxLS42NDQuMDI1YS44LjggMCAwIDEtLjI3OS0uMTgzTDQuODE2IDkuMDYzbC0yLjIzMiAxLjcwM2EuNTQuNTQgMCAwIDEtLjY5MS0uMDMxbC0uNzE2LS42NTVhLjU0Ni41NDYgMCAwIDEgMC0uODA1TDMuMTEyIDcuNUwxLjE3NyA1LjcyNWEuNTQ2LjU0NiAwIDAgMSAwLS44MDVsLjcxNi0uNjU1YS41NC41NCAwIDAgMSAuNjkxLS4wMzFsMi4yMzIgMS43MDNMOS45NCAxLjIzOWEuODA1LjgwNSAwIDAgMSAuOTIzLS4xNTlsMi42NzcgMS4yOTVjLjI4MS4xMzYuNDYuNDIyLjQ2LjczNlY4aC0zLjI0OFY0LjUzNEw2Ljg2NCA3LjVsMy44ODggMi45NjZWOEgxNHYzLjg4OWMwIC4zMTQtLjE3OS42LS40Ni43MzZ6Ii8+PC9zdmc+)
![GitHub Copilot](https://img.shields.io/badge/GitHub%20Copilot-6f42c1?style=for-the-badge&logo=githubcopilot&logoColor=white)
![Cursor](https://img.shields.io/badge/Cursor-000000?style=for-the-badge&logo=cursor&logoColor=white)
![Trae](https://img.shields.io/badge/Trae-32f08C?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGhlaWdodD0iMWVtIiBzdHlsZT0iZmxleDpub25lO2xpbmUtaGVpZ2h0OjEiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjFlbSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+VFJBRTwvdGl0bGU+PHBhdGggZD0iTTI0IDIwLjU0MUgzLjQyOHYtMy40MjZIMFYzLjRoMjRWMjAuNTR6TTMuNDI4IDE3LjExNWgxNy4xNDRWNi44MjdIMy40Mjh2MTAuMjg4em04LjU3My01LjE5NmwtMi40MjUgMi40MjQtMi40MjQtMi40MjQgMi40MjQtMi40MjQgMi40MjUgMi40MjR6bTYuODU3LS4wMDFsLTIuNDI0IDIuNDIzLTIuNDI1LTIuNDIzIDIuNDI1LTIuNDI1IDIuNDI0IDIuNDI1eiI+PC9wYXRoPjwvc3ZnPg==)
![Antigravity](https://img.shields.io/badge/Antigravity-4285F4?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJ3aGl0ZSIgZD0iTTEyLjAyNSAycTIuMjg0IDAgMy41NTkgMS43MTZUMTcuMTI1IDdxLjY1IDEuNTc1IDEuMjUgMy41dDEuMjc1IDMuODc1cS42NSAxLjg3NSAxLjQyNSAzLjUyNXQxLjggMi44MjVxLjIuMjI1LjE3NS41MjV0LS4yMjUuNTI1dC0uNDc1LjI1dC0uNTUtLjE3NXEtMS45NzUtMS41NS0zLjI1LTMuNDYzdC0yLjU3NS0zLjMzN3EtLjg1LS45NS0xLjgxMi0xLjVUMTIuMDI1IDEzdC0yLjEzNy41NXQtMS44MTMgMS41cS0xLjMgMS40MjUtMi41NzUgMy4zMzhUMi4yNSAyMS44NnEtLjI3NS4yLS41NS4xNzV0LS40NzUtLjI1VDEgMjEuMjV0LjE3NS0uNTI1UTIuMiAxOS41NSAyLjk3NSAxNy45VDQuNCAxNC4zNzVxLjY3NS0xLjk1IDEuMjc1LTMuODc1VDYuOTI1IDdxLjgtMS45NSAxLjkzOC0zLjQ3NVQxMi4wMjUgMiIvPjwvc3ZnPg==)
![Claude Code](https://img.shields.io/badge/Claude%20Code-D97757?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGhlaWdodD0iMmVtIiBzdHlsZT0iZmxleDpub25lO2xpbmUtaGVpZ2h0OjEiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjJlbSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCiAgPHRpdGxlPkFudGlncmF2aXR5PC90aXRsZT4NCiAgPHBhdGggY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMjAuOTk4IDEwLjk0OUgyNHYzLjEwMmgtM3YzLjAyOGgtMS40ODdWMjBIMTh2LTIuOTIxaC0xLjQ4N1YyMEgxNXYtMi45MjFIOVYyMEg3LjQ4OHYtMi45MjFINlYyMEg0LjQ4N3YtMi45MjFIM1YxNC4wNUgwVjEwLjk1aDNWNWgxNy45OTh2NS45NDl6TTYgMTAuOTQ5aDEuNDg4VjguMTAySDZ2Mi44NDd6bTEwLjUxIDBIMThWOC4xMDJoLTEuNDl2Mi44NDd6Ij48L3BhdGg+DQo8L3N2Zz4=)
![Codex](https://img.shields.io/badge/Codex-5865F2?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGhlaWdodD0iMWVtIiBzdHlsZT0iZmxleDpub25lO2xpbmUtaGVpZ2h0OjEiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjFlbSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+Q29kZXg8L3RpdGxlPjxwYXRoIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTguMDg2LjQ1N2E2LjEwNSA2LjEwNSAwIDAxMy4wNDYtLjQxNWMxLjMzMy4xNTMgMi41MjEuNzIgMy41NjQgMS43YS4xMTcuMTE3IDAgMDAuMTA3LjAyOWMxLjQwOC0uMzQ2IDIuNzYyLS4yMjQgNC4wNjEuMzY2bC4wNjMuMDMuMTU0LjA3NmMxLjM1Ny43MDMgMi4zMyAxLjc3IDIuOTE4IDMuMTk4LjI3OC42NzkuNDE4IDEuMzg4LjQyMSAyLjEyNmE1LjY1NSA1LjY1NSAwIDAxLS4xOCAxLjYzMS4xNjcuMTY3IDAgMDAuMDQuMTU1IDUuOTgyIDUuOTgyIDAgMDExLjU3OCAyLjg5MWMuMzg1IDEuOTAxLS4wMSAzLjYxNS0xLjE4MyA1LjE0bC0uMTgyLjIyYTYuMDYzIDYuMDYzIDAgMDEtMi45MzQgMS44NTEuMTYyLjE2MiAwIDAwLS4xMDguMTAyYy0uMjU1LjczNi0uNTExIDEuMzY0LS45ODcgMS45OTItMS4xOTkgMS41ODItMi45NjIgMi40NjItNC45NDggMi40NTEtMS41ODMtLjAwOC0yLjk4Ni0uNTg3LTQuMjEtMS43MzZhLjE0NS4xNDUgMCAwMC0uMTQtLjAzMmMtLjUxOC4xNjctMS4wNC4xOTEtMS42MDQuMTg1YTUuOTI0IDUuOTI0IDAgMDEtMi41OTUtLjYyMiA2LjA1OCA2LjA1OCAwIDAxLTIuMTQ2LTEuNzgxYy0uMjAzLS4yNjktLjQwNC0uNTIyLS41NTEtLjgyMWE3Ljc0IDcuNzQgMCAwMS0uNDk1LTEuMjgzIDYuMTEgNi4xMSAwIDAxLS4wMTctMy4wNjQuMTY2LjE2NiAwIDAwLjAwOC0uMDc0LjExNS4xMTUgMCAwMC0uMDM3LS4wNjQgNS45NTggNS45NTggMCAwMS0xLjM4LTIuMjAyIDUuMTk2IDUuMTk2IDAgMDEtLjMzMy0xLjU4OSA2LjkxNSA2LjkxNSAwIDAxLjE4OC0yLjEzMmMuNDUtMS40ODQgMS4zMDktMi42NDggMi41NzctMy40OTMuMjgyLS4xODguNTUtLjMzNC44MDItLjQzOC4yODYtLjEyLjU3My0uMjIuODYxLS4zMDRhLjEyOS4xMjkgMCAwMC4wODctLjA4N0E2LjAxNiA2LjAxNiAwIDAxNS42MzUgMi4zMUM2LjMxNSAxLjQ2NCA3LjEzMi44NDYgOC4wODYuNDU3em0tLjgwNCA3Ljg1YS44NDguODQ4IDAgMDAtMS40NzMuODQybDEuNjk0IDIuOTY1LTEuNjg4IDIuODQ4YS44NDkuODQ5IDAgMDAxLjQ2Ljg2NGwxLjk0LTMuMjcyYS44NDkuODQ5IDAgMDAuMDA3LS44NTRsLTEuOTQtMy4zOTN6bTUuNDQ2IDYuMjRhLjg0OS44NDkgMCAwMDAgMS42OTVoNC44NDhhLjg0OS44NDkgMCAwMDAtMS42OTZoLTQuODQ4eiI+PC9wYXRoPjwvc3ZnPg==)

**웹에서 AI와 브레인스토밍하고 IDE/CLI에서 Agent가 코드를 작성하지만, 서로 잊어버린 것 같지 않나요?**

CoBridge는 바로 그 "차원 다리"입니다. 브라우저의 대화 기록을 즉시 로컬로 전송하여 Copilot, Cursor, Claude Code와 같은 Agent가 사용자의 사고 과정을 이해할 수 있도록 합니다.

> 구름 속의 두뇌, 로컬의 손 — 한 호흡으로.

---

## 🚀 이륙을 위한 3단계

### 1. CoBridge 설치

VS Code 확장 마켓플레이스를 열고 **CoBridge**를 검색하여 설치를 클릭하세요. 정말 간단합니다.

### 2. 서비스 상태 확인

설치 후 오른쪽 하단 상태 표시줄을 확인하세요. `CoBridge: On`이 표시되면 다리가 준비된 것입니다 (기본 포트 `3030`).

![Running Status](../images/running.png)

이 아이콘을 클릭하면 다음 작업을 수행할 수 있습니다:
- 서비스 수동 **시작/중지**
- **로그 보기** (문제가 발생하면 여기 확인)
- **동기화 파일 열기** (AI가 무엇을 기억하는지 확인)
- **동기화 파일 지우기** (AI의 기억 삭제)

![Management Menu](../images/management.png)

### 3. "기억 순간이동" 시작

브라우저의 **Gemini Voyager**에서 "컨텍스트 동기화"가 활성화되어 있는지 확인하세요. **Sync to IDE**를 클릭하면 대화 내용이 자동으로 다음 위치에 저장됩니다:

```
.cobridge/AI_CONTEXT.md
```

이제부터 IDE 어시스턴트가 멍하니 쳐다보며 "아까 뭐라고 하셨죠?"라고 묻는 일은 없을 것입니다.

---

## ⚙️ 포트가 사용 중인가요? 변경하세요!

기본 포트 `3030`을 다른 프로그램이 차지하고 있다면 쉽게 변경할 수 있습니다:

1. VS Code 설정 열기 (`Ctrl + ,` / `Cmd + ,`)
2. `AIContextSync.port` 검색
3. 원하는 포트 번호로 변경 (예: `3031`)
4. 상태 표시줄 메뉴에서 서비스를 다시 시작하면 완료!

**VS Code 작업 영역 설정이 사용자 설정을 덮어쓰므로 작업 영역 설정에서 포트 번호를 수정하십시오.**

![Port Settings](../images/port.png)

---

## 📋 필수 조건

| 요구 사항 | 설명 |
|------|------|
| **VS Code** | `1.50.0` 이상 |
| **브라우저 확장** | 대화를 캡처하려면 컴패니언 [Gemini Voyager](https://github.com/Nagi-ovo/gemini-voyager)가 필요합니다 |
| **네트워크** | `127.0.0.1`이 방화벽에 의해 차단되지 않았는지 확인하세요 |

---

## 🎯 원칙

- **오염 제로**: CoBridge는 동기화 파일을 자동으로 `.gitignore`에 추가하여 Git 저장소를 오염시키지 않도록 합니다. 당신의 "속삭임"은 당신만의 것입니다.
- **친숙한 형식**: 전체 Markdown 출력으로, IDE AI가 설명서처럼 원활하게 읽을 수 있도록 합니다.
- **자동 구성**: 규칙 파일 업데이트도 지원하여 다양한 AI 어시스턴트가 컨텍스트를 원활하게 읽을 수 있도록 합니다.

---

## ⚠️ 알려진 제한 사항

| 상태 | 설명 |
|------|------|
| ✅ **지원됨** | Gemini |
| ✅ **테이블 지원** | 테이블 동기화 지원됨 |
| ✅ **이미지 지원** | 이미지 동기화 지원됨 |
| ❌ **지원되지 않음** | 스크래핑 방지 정책이 엄격하거나 DOM 구조가 복잡한 플랫폼 (PR 환영!) |
| ❌ **파일 첨부** | 아직 지원되지 않음 |

---

## 🌟 요약

**LLM은 더 이상 기억상실증에 걸리지 않을 것입니다. 웹에서 솔루션을 철저히 논의하고 IDE에서 직접 구현하세요.**

이 프로젝트가 도움이 되었다면 [GitHub](https://github.com/Winddfall/CoBridge)에서 별 ⭐을 눌러주세요.

## 💡 문제

새로운 요구 사항이 있으면 [GitHub](https://github.com/Winddfall/CoBridge/issues)에 문제를 제기해 주세요.

## 🤝 기여

좋은 제안이 있거나 버그를 발견하면 풀 리퀘스트를 환영합니다!

## 📄 라이선스

이 프로젝트는 MIT 라이선스에 따라 라이선스가 부여됩니다.
