# CoBridge — Le pont dimensionnel pour la "mémoire partagée" de l'IA ✨

[English](../README.md) | [简体中文](README_CN.md) | [繁體中文](README_ZH_TW.md) | [日本語](README_JA.md) | [Français](README_FR.md) | [Español](README_ES.md) | [Português](README_PT.md) | [한국어](README_KO.md) | [Русский](README_RU.md) | [العربية](README_AR.md)

[![Version](https://img.shields.io/visual-studio-marketplace/v/windfall.co-bridge?label=version&style=flat-square)](https://marketplace.visualstudio.com/items?itemName=windfall.co-bridge)
[![VS Code Installs](https://img.shields.io/visual-studio-marketplace/i/windfall.co-bridge?style=flat-square&label=VS%20Code&logo=visual-studio-code&logoColor=white)](https://marketplace.visualstudio.com/items?itemName=windfall.co-bridge)
[![Open VSX Installs](https://img.shields.io/open-vsx/dt/windfall/co-bridge?style=flat-square&label=Open%20VSX)](https://open-vsx.org/extension/windfall/co-bridge)
[![License](https://img.shields.io/github/license/Winddfall/CoBridge?style=flat-square)](https://github.com/Winddfall/CoBridge/blob/master/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/Winddfall/CoBridge?style=flat-square&logo=github)](https://github.com/Winddfall/CoBridge/stargazers)
[![Last Commit](https://img.shields.io/github/last-commit/Winddfall/CoBridge?style=flat-square)](https://github.com/Winddfall/CoBridge/commits/master)

> [!IMPORTANT]
> **CoBridge nécessite explicitement l'extension de navigateur [Gemini Voyager](https://github.com/Nagi-ovo/gemini-voyager) pour fonctionner.**
> CoBridge gère la réception du contexte dans l'IDE, tandis que Gemini Voyager capture le contexte depuis l'interface web. Ensemble, ils permettent une synchronisation transparente du contexte !

## ⚡️ Écosystème pris en charge (Supported Ecosystem)

![VS Code](https://img.shields.io/badge/Visual%20Studio%20Code-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white)
![GitHub Copilot](https://img.shields.io/badge/GitHub%20Copilot-6f42c1?style=for-the-badge&logo=githubcopilot&logoColor=white)
![Cursor](https://img.shields.io/badge/Cursor-000000?style=for-the-badge&logo=cursor&logoColor=white)
![Trae](https://img.shields.io/badge/Trae-3B82F6?style=for-the-badge&logo=openai&logoColor=white)

**Brainstorming avec une IA sur le web, codage dans l'IDE — mais ils semblent s'être oubliés ?**

CoBridge est ce "Pont Dimensionnel" : il téléporte instantanément votre historique de discussion du navigateur vers votre IDE, permettant aux assistants IA comme Copilot, Trae et Cursor de comprendre votre processus de réflexion.

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
