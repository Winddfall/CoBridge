# CoBridge — Le pont dimensionnel pour la "mémoire partagée" de l'IA ✨

[English](../README.md) | [简体中文](README_CN.md) | [繁體中文](README_ZH_TW.md) | [日本語](README_JA.md) | [Français](README_FR.md) | [Español](README_ES.md) | [Português](README_PT.md) | [한국어](README_KO.md) | [Русский](README_RU.md) | [العربية](README_AR.md)

[![Version](https://img.shields.io/visual-studio-marketplace/v/windfall.co-bridge?label=version&style=flat-square)](https://marketplace.visualstudio.com/items?itemName=windfall.co-bridge)
[![VS Code Installs](https://img.shields.io/visual-studio-marketplace/i/windfall.co-bridge?style=flat-square&label=VS%20Code&logo=visual-studio-code&logoColor=white)](https://marketplace.visualstudio.com/items?itemName=windfall.co-bridge)
[![Open VSX Installs](https://img.shields.io/open-vsx/dt/windfall/co-bridge?style=flat-square&label=Open%20VSX)](https://open-vsx.org/extension/windfall/co-bridge)
[![License](https://img.shields.io/github/license/Winddfall/CoBridge?style=flat-square)](https://github.com/Winddfall/CoBridge/blob/master/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/Winddfall/CoBridge?style=flat-square&logo=github)](https://github.com/Winddfall/CoBridge/stargazers)
[![Last Commit](https://img.shields.io/github/last-commit/Winddfall/CoBridge?style=flat-square)](https://github.com/Winddfall/CoBridge/commits/master)

> [!IMPORTANT]
> **CoBridge nécessite l'extension de navigateur [Voyager](https://github.com/Nagi-ovo/gemini-voyager) pour fonctionner.**
> CoBridge gère la réception du contexte dans l'IDE, tandis que Voyager capture le contexte depuis l'interface web. Ensemble, ils permettent une synchronisation transparente du contexte !

## ⚡️ Écosystème pris en charge (Supported Ecosystem)

![VS Code](https://img.shields.io/badge/Visual%20Studio%20Code-007ACC?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMSAxIDE0IDE0Ij48cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNMTAuODYzIDEzLjkxOWEuOC44IDAgMCAxLS42NDQuMDI1YS44LjggMCAwIDEtLjI3OS0uMTgzTDQuODE2IDkuMDYzbC0yLjIzMiAxLjcwM2EuNTQuNTQgMCAwIDEtLjY5MS0uMDMxbC0uNzE2LS42NTVhLjU0Ni41NDYgMCAwIDEgMC0uODA1TDMuMTEyIDcuNUwxLjE3NyA1LjcyNWEuNTQ2LjU0NiAwIDAgMSAwLS44MDVsLjcxNi0uNjU1YS41NC41NCAwIDAgMSAuNjkxLS4wMzFsMi4yMzIgMS43MDNMOS45NCAxLjIzOWEuODA1LjgwNSAwIDAgMSAuOTIzLS4xNTlsMi42NzcgMS4yOTVjLjI4MS4xMzYuNDYuNDIyLjQ2LjczNlY4aC0zLjI0OFY0LjUzNEw2Ljg2NCA3LjVsMy44ODggMi45NjZWOEgxNHYzLjg4OWMwIC4zMTQtLjE3OS42LS40Ni43MzZ6Ii8+PC9zdmc+)
![GitHub Copilot](https://img.shields.io/badge/GitHub%20Copilot-6f42c1?style=for-the-badge&logo=githubcopilot&logoColor=white)
![Cursor](https://img.shields.io/badge/Cursor-000000?style=for-the-badge&logo=cursor&logoColor=white)
![Trae](https://img.shields.io/badge/Trae-32f08C?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGhlaWdodD0iMWVtIiBzdHlsZT0iZmxleDpub25lO2xpbmUtaGVpZ2h0OjEiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjFlbSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+VFJBRTwvdGl0bGU+PHBhdGggZD0iTTI0IDIwLjU0MUgzLjQyOHYtMy40MjZIMFYzLjRoMjRWMjAuNTR6TTMuNDI4IDE3LjExNWgxNy4xNDRWNi44MjdIMy40Mjh2MTAuMjg4em04LjU3My01LjE5NmwtMi40MjUgMi40MjQtMi40MjQtMi40MjQgMi40MjQtMi40MjQgMi40MjUgMi40MjR6bTYuODU3LS4wMDFsLTIuNDI0IDIuNDIzLTIuNDI1LTIuNDIzIDIuNDI1LTIuNDI1IDIuNDI0IDIuNDI1eiI+PC9wYXRoPjwvc3ZnPg==)
![Antigravity](https://img.shields.io/badge/Antigravity-4285F4?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJ3aGl0ZSIgZD0iTTEyLjAyNSAycTIuMjg0IDAgMy41NTkgMS43MTZUMTcuMTI1IDdxLjY1IDEuNTc1IDEuMjUgMy41dDEuMjc1IDMuODc1cS42NSAxLjg3NSAxLjQyNSAzLjUyNXQxLjggMi44MjVxLjIuMjI1LjE3NS41MjV0LS4yMjUuNTI1dC0uNDc1LjI1dC0uNTUtLjE3NXEtMS45NzUtMS41NS0zLjI1LTMuNDYzdC0yLjU3NS0zLjMzN3EtLjg1LS45NS0xLjgxMi0xLjVUMTIuMDI1IDEzdC0yLjEzNy41NXQtMS44MTMgMS41cS0xLjMgMS40MjUtMi41NzUgMy4zMzhUMi4yNSAyMS44NnEtLjI3NS4yLS41NS4xNzV0LS40NzUtLjI1VDEgMjEuMjV0LjE3NS0uNTI1UTIuMiAxOS41NSAyLjk3NSAxNy45VDQuNCAxNC4zNzVxLjY3NS0xLjk1IDEuMjc1LTMuODc1VDYuOTI1IDdxLjgtMS45NSAxLjkzOC0zLjQ3NVQxMi4wMjUgMiIvPjwvc3ZnPg==)
![Claude Code](https://img.shields.io/badge/Claude%20Code-D97757?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGhlaWdodD0iMmVtIiBzdHlsZT0iZmxleDpub25lO2xpbmUtaGVpZ2h0OjEiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjJlbSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCiAgPHRpdGxlPkFudGlncmF2aXR5PC90aXRsZT4NCiAgPHBhdGggY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMjAuOTk4IDEwLjk0OUgyNHYzLjEwMmgtM3YzLjAyOGgtMS40ODdWMjBIMTh2LTIuOTIxaC0xLjQ4N1YyMEgxNXYtMi45MjFIOVYyMEg3LjQ4OHYtMi45MjFINlYyMEg0LjQ4N3YtMi45MjFIM1YxNC4wNUgwVjEwLjk1aDNWNWgxNy45OTh2NS45NDl6TTYgMTAuOTQ5aDEuNDg4VjguMTAySDZ2Mi44NDd6bTEwLjUxIDBIMThWOC4xMDJoLTEuNDl2Mi44NDd6Ij48L3BhdGg+DQo8L3N2Zz4=)
![Codex](https://img.shields.io/badge/Codex-5865F2?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGhlaWdodD0iMWVtIiBzdHlsZT0iZmxleDpub25lO2xpbmUtaGVpZ2h0OjEiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjFlbSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+Q29kZXg8L3RpdGxlPjxwYXRoIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTguMDg2LjQ1N2E2LjEwNSA2LjEwNSAwIDAxMy4wNDYtLjQxNWMxLjMzMy4xNTMgMi41MjEuNzIgMy41NjQgMS43YS4xMTcuMTE3IDAgMDAuMTA3LjAyOWMxLjQwOC0uMzQ2IDIuNzYyLS4yMjQgNC4wNjEuMzY2bC4wNjMuMDMuMTU0LjA3NmMxLjM1Ny43MDMgMi4zMyAxLjc3IDIuOTE4IDMuMTk4LjI3OC42NzkuNDE4IDEuMzg4LjQyMSAyLjEyNmE1LjY1NSA1LjY1NSAwIDAxLS4xOCAxLjYzMS4xNjcuMTY3IDAgMDAuMDQuMTU1IDUuOTgyIDUuOTgyIDAgMDExLjU3OCAyLjg5MWMuMzg1IDEuOTAxLS4wMSAzLjYxNS0xLjE4MyA1LjE0bC0uMTgyLjIyYTYuMDYzIDYuMDYzIDAgMDEtMi45MzQgMS44NTEuMTYyLjE2MiAwIDAwLS4xMDguMTAyYy0uMjU1LjczNi0uNTExIDEuMzY0LS45ODcgMS45OTItMS4xOTkgMS41ODItMi45NjIgMi40NjItNC45NDggMi40NTEtMS41ODMtLjAwOC0yLjk4Ni0uNTg3LTQuMjEtMS43MzZhLjE0NS4xNDUgMCAwMC0uMTQtLjAzMmMtLjUxOC4xNjctMS4wNC4xOTEtMS42MDQuMTg1YTUuOTI0IDUuOTI0IDAgMDEtMi41OTUtLjYyMiA2LjA1OCA2LjA1OCAwIDAxLTIuMTQ2LTEuNzgxYy0uMjAzLS4yNjktLjQwNC0uNTIyLS41NTEtLjgyMWE3Ljc0IDcuNzQgMCAwMS0uNDk1LTEuMjgzIDYuMTEgNi4xMSAwIDAxLS4wMTctMy4wNjQuMTY2LjE2NiAwIDAwLjAwOC0uMDc0LjExNS4xMTUgMCAwMC0uMDM3LS4wNjQgNS45NTggNS45NTggMCAwMS0xLjM4LTIuMjAyIDUuMTk2IDUuMTk2IDAgMDEtLjMzMy0xLjU4OSA2LjkxNSA2LjkxNSAwIDAxLjE4OC0yLjEzMmMuNDUtMS40ODQgMS4zMDktMi42NDggMi41NzctMy40OTMuMjgyLS4xODguNTUtLjMzNC44MDItLjQzOC4yODYtLjEyLjU3My0uMjIuODYxLS4zMDRhLjEyOS4xMjkgMCAwMC4wODctLjA4N0E2LjAxNiA2LjAxNiAwIDAxNS42MzUgMi4zMUM2LjMxNSAxLjQ2NCA3LjEzMi44NDYgOC4wODYuNDU3em0tLjgwNCA3Ljg1YS44NDguODQ4IDAgMDAtMS40NzMuODQybDEuNjk0IDIuOTY1LTEuNjg4IDIuODQ4YS44NDkuODQ5IDAgMDAxLjQ2Ljg2NGwxLjk0LTMuMjcyYS44NDkuODQ5IDAgMDAuMDA3LS44NTRsLTEuOTQtMy4zOTN6bTUuNDQ2IDYuMjRhLjg0OS44NDkgMCAwMDAgMS42OTVoNC44NDhhLjg0OS44NDkgMCAwMDAtMS42OTZoLTQuODQ4eiI+PC9wYXRoPjwvc3ZnPg==)

**Brainstorming avec une IA sur le web, faire écrire du code par des Agents dans l'IDE/CLI — mais ils semblent s'être oubliés ?**

CoBridge est ce "Pont Dimensionnel" : il téléporte instantanément votre historique de discussion du navigateur vers votre espace de travail local, permettant aux Agents comme Copilot, Cursor et Claude Code de comprendre votre processus de réflexion.

> Le cerveau dans le cloud, les mains en local — respirant à l'unisson.

---

## 🚀 Trois étapes pour décoller

### 1. Installer CoBridge

Ouvrez le marché des extensions VS Code, recherchez **CoBridge**, et cliquez sur installer. C'est aussi simple que ça.

### 2. Confirmer l'état du service

Après l'installation, jetez un coup d'œil à la barre d'état en bas à droite — si vous voyez `CoBridge: On`, cela signifie que le pont est prêt (port par défaut `3030`).

![Running Status](../images/running.png)

Cliquer sur cette icône vous permet de :
- **Démarrer/Arrêter** manuellement le service
- **Voir les journaux** (Vérifiez ici si des problèmes surviennent)
- **Ouvrir le fichier de synchronisation** (Voir ce que l'IA a retenu)
- **Effacer le fichier de synchronisation** (Effacer la mémoire de l'IA)

![Management Menu](../images/management.png)

### 3. Commencer la "Téléportation de Mémoire"

Assurez-vous que **Gemini Voyager** dans votre navigateur a activé la "Synchronisation du contexte". Cliquez sur **Sync to IDE**, et le contenu de la conversation atterrira automatiquement dans :

```
.cobridge/AI_CONTEXT.md
```

Désormais, votre assistant IDE ne vous regardera plus jamais d'un air absent en demandant : "Qu'est-ce que tu disais avant ?"

---

## ⚙️ Port occupé ? Changez-le !

Si le port par défaut `3030` est "accaparé" par un autre programme, le changer est facile :

1. Ouvrez les paramètres VS Code (`Ctrl + ,` / `Cmd + ,`)
2. Recherchez `AIContextSync.port`
3. Changez le numéro de port selon votre préférence (par exemple, `3031`)
4. Redémarrez le service depuis le menu de la barre d'état, et c'est fait !

**Comme les paramètres de l'espace de travail VS Code remplacent les paramètres utilisateur, veuillez modifier le numéro de port dans les paramètres de votre espace de travail.**

![Port Settings](../images/port.png)

---

## 📋 Prérequis

| Exigence | Description |
|------|------|
| **VS Code** | `1.50.0` ou version ultérieure |
| **Extension de navigateur** | Nécessite l'extension complémentaire [Gemini Voyager](https://github.com/Nagi-ovo/gemini-voyager) pour capturer les conversations |
| **Réseau** | Assurez-vous que `127.0.0.1` n'est pas bloqué par un pare-feu |

---

## 🎯 Principes

- **Zéro Pollution** : CoBridge ajoute automatiquement le fichier de synchronisation à `.gitignore`, garantissant qu'il ne pollue jamais votre dépôt Git. Vos "chuchotements" restent privés.
- **Format Amical** : Sortie entièrement en Markdown, rendant la lecture aussi fluide pour votre IA d'IDE qu'un manuel.
- **Configuration Auto** : Elle aide également à mettre à jour les fichiers de règles, permettant à divers assistants IA de lire le contexte de manière transparente.

---

## ⚠️ Limitations connues

| Statut | Description |
|------|------|
| ✅ **Supporté** | Gemini |
| ✅ **Support des tableaux** | La synchronisation des tableaux est supportée |
| ✅ **Support des ../images** | La synchronisation des ../images est supportée |
| ❌ **Non Supporté** | Plateformes avec anti-scraping strict ou structures DOM complexes (PRs bienvenues !) |
| ❌ **Pièces jointes** | Pas encore supporté |

---

## 🌟 En résumé

**Les LLM n'auront plus d'amnésie. Discutez des solutions à fond sur le web, et implémentez-les directement dans l'IDE.**

Si ce projet vous a aidé, n'hésitez pas à nous donner une étoile ⭐ sur [GitHub](https://github.com/Winddfall/CoBridge).

## 💡 Problèmes

Si vous avez de nouvelles exigences, n'hésitez pas à ouvrir un ticket sur [GitHub](https://github.com/Winddfall/CoBridge/issues).

## 🤝 Contribuer

Si vous avez de bonnes suggestions ou trouvez un bug, les Pull Requests sont les bienvenues !

## 📄 Licence

Ce projet est sous licence MIT.
