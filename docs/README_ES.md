# CoBridge — El puente dimensional para la "memoria compartida" de la IA ✨

[English](../README.md) | [简体中文](README_CN.md) | [繁體中文](README_ZH_TW.md) | [日本語](README_JA.md) | [Français](README_FR.md) | [Español](README_ES.md) | [Português](README_PT.md) | [한국어](README_KO.md) | [Русский](README_RU.md) | [العربية](README_AR.md)

[![Version](https://img.shields.io/visual-studio-marketplace/v/windfall.co-bridge?label=version&style=flat-square)](https://marketplace.visualstudio.com/items?itemName=windfall.co-bridge)
[![VS Code Installs](https://img.shields.io/visual-studio-marketplace/i/windfall.co-bridge?style=flat-square&label=VS%20Code&logo=visual-studio-code&logoColor=white)](https://marketplace.visualstudio.com/items?itemName=windfall.co-bridge)
[![Open VSX Installs](https://img.shields.io/open-vsx/dt/windfall/co-bridge?style=flat-square&label=Open%20VSX)](https://open-vsx.org/extension/windfall/co-bridge)
[![License](https://img.shields.io/github/license/Winddfall/CoBridge?style=flat-square)](https://github.com/Winddfall/CoBridge/blob/master/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/Winddfall/CoBridge?style=flat-square&logo=github)](https://github.com/Winddfall/CoBridge/stargazers)
[![Last Commit](https://img.shields.io/github/last-commit/Winddfall/CoBridge?style=flat-square)](https://github.com/Winddfall/CoBridge/commits/master)

> [!IMPORTANT]
> **CoBridge requiere explícitamente la extensión del navegador [Gemini Voyager](https://github.com/Nagi-ovo/gemini-voyager) para funcionar.**
> CoBridge maneja la recepción del contexto en el IDE, mientras que Gemini Voyager captura el contexto desde la interfaz web. ¡Juntos, permiten una sincronización de contexto perfecta!

## ⚡️ Ecosistema soportado (Supported Ecosystem)

![VS Code](https://img.shields.io/badge/Visual%20Studio%20Code-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white)
![GitHub Copilot](https://img.shields.io/badge/GitHub%20Copilot-6f42c1?style=for-the-badge&logo=githubcopilot&logoColor=white)
![Cursor](https://img.shields.io/badge/Cursor-000000?style=for-the-badge&logo=cursor&logoColor=white)
![Trae](https://img.shields.io/badge/Trae-3B82F6?style=for-the-badge&logo=openai&logoColor=white)

**¿Haciendo lluvia de ideas con IA en la web, programando en el IDE — pero parece que se han olvidado el uno del otro?**

CoBridge es ese "Puente Dimensional": teletransporta instantáneamente tu historial de chat desde el navegador a tu IDE, permitiendo que asistentes de IA como Copilot, Trae y Cursor entiendan tu proceso de pensamiento.

> Cerebro en la nube, manos en local — respirando al unísono.

---

## 🚀 Tres pasos para despegar

### 1. Instalar CoBridge

Abre el mercado de extensiones de VS Code, busca **CoBridge**, y haz clic en instalar. Es así de simple.

### 2. Confirmar estado del servicio

Después de la instalación, mira la barra de estado en la esquina inferior derecha — ver `CoBridge: On` significa que el puente está listo (puerto predeterminado `3030`).

![Estado de ejecución](../images/running.png)

Hacer clic en este icono te permite:
- **Iniciar/Detener** manualmente el servicio
- **Ver registros** (Revisa esto si surgen problemas)
- **Abrir archivo de sincronización** (Ver qué recuerda la IA)
- **Borrar archivo de sincronización** (Borrar la memoria de la IA)

![Menú de gestión](../images/management.png)

### 3. Comenzar la "Teletransportación de Memoria"

Asegúrate de que **Gemini Voyager** en tu navegador tenga habilitada la "Sincronización de Contexto". Haz clic en **Sincronizar con IDE**, y el contenido de la conversación aterrizará automáticamente en:

```
.cobridge/AI_CONTEXT.md
```

A partir de ahora, tu asistente de IDE nunca más te mirará inexpresivamente preguntando: "¿Qué dijiste antes?"

---

## ⚙️ ¿Puerto ocupado? ¡Cámbialo!

Si el puerto predeterminado `3030` está "acaparado" por otro programa, cambiarlo es fácil:

1. Abre la configuración de VS Code (`Ctrl + ,` / `Cmd + ,`)
2. Busca `AIContextSync.port`
3. Cambia el número de puerto a tu preferencia (por ejemplo, `3031`)
4. Reinicia el servicio desde el menú de la barra de estado, ¡y listo!

**Dado que la configuración del espacio de trabajo de VS Code anula la configuración del usuario, modifica el número de puerto en la configuración de tu espacio de trabajo.**

![Configuración de puerto](../images/port.png)

---

## 📋 Prerrequisitos

| Requisito | Descripción |
|------|------|
| **VS Code** | `1.50.0` o superior |
| **Extensión del navegador** | Requiere la extensión complementaria [Gemini Voyager](https://github.com/Nagi-ovo/gemini-voyager) para capturar conversaciones |
| **Red** | Asegúrate de que `127.0.0.1` no esté bloqueado por un firewall |

---

## 🎯 Principios

- **Cero Contaminación**: CoBridge agrega automáticamente el archivo de sincronización a `.gitignore`, asegurando que nunca contamine tu repositorio Git. Tus "susurros" se quedan contigo.
- **Formato Amigable**: Salida completa en Markdown, haciéndolo tan fluido de leer para tu IA de IDE como un manual.
- **Configuración Automática**: También ayuda a actualizar los archivos de reglas, permitiendo que varios asistentes de IA lean el contexto sin problemas.

---

## ⚠️ Limitaciones conocidas

| Estado | Descripción |
|------|------|
| ✅ **Soportado** | Gemini |
| ✅ **Soporte de tablas** | La sincronización de tablas es soportada |
| ✅ **Soporte de imágenes** | La sincronización de imágenes es soportada |
| ❌ **No Soportado** | Plataformas con anti-scraping estricto o estructuras DOM complejas (¡PRs bienvenidas!) |
| ❌ **Adjuntos** | Aún no soportado |

---

## 🌟 En resumen

**Los LLMs ya no tendrán amnesia. Discute soluciones a fondo en la web e impleméntalas directamente en el IDE.**

Si este proyecto te ha ayudado, por favor danos una Estrella ⭐ en [GitHub](https://github.com/Winddfall/CoBridge).

## 💡 Problemas

Si tienes nuevos requisitos, bienvenido a abrir un issue en [GitHub](https://github.com/Winddfall/CoBridge/issues).

## 🤝 Contribución

Si tienes buenas sugerencias o encuentras un error, ¡las Pull Requests son bienvenidas!

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
