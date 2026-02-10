# CoBridge — A Ponte Dimensional para a "Memória Compartilhada" da IA ✨

[English](../README.md) | [简体中文](README_CN.md) | [繁體中文](README_ZH_TW.md) | [日本語](README_JA.md) | [Français](README_FR.md) | [Español](README_ES.md) | [Português](README_PT.md) | [한국어](README_KO.md) | [Русский](README_RU.md) | [العربية](README_AR.md)

[![Version](https://img.shields.io/visual-studio-marketplace/v/windfall.co-bridge?label=version&style=flat-square)](https://marketplace.visualstudio.com/items?itemName=windfall.co-bridge)
[![VS Code Installs](https://img.shields.io/visual-studio-marketplace/i/windfall.co-bridge?style=flat-square&label=VS%20Code&logo=visual-studio-code&logoColor=white)](https://marketplace.visualstudio.com/items?itemName=windfall.co-bridge)
[![Open VSX Installs](https://img.shields.io/open-vsx/dt/windfall/co-bridge?style=flat-square&label=Open%20VSX)](https://open-vsx.org/extension/windfall/co-bridge)
[![License](https://img.shields.io/github/license/Winddfall/CoBridge?style=flat-square)](https://github.com/Winddfall/CoBridge/blob/master/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/Winddfall/CoBridge?style=flat-square&logo=github)](https://github.com/Winddfall/CoBridge/stargazers)
[![Last Commit](https://img.shields.io/github/last-commit/Winddfall/CoBridge?style=flat-square)](https://github.com/Winddfall/CoBridge/commits/master)

> [!IMPORTANT]
> **O CoBridge requer explicitamente a extensão do navegador [Gemini Voyager](https://github.com/Nagi-ovo/gemini-voyager) para funcionar.**
> O CoBridge lida com a recepção de contexto no IDE, enquanto o Gemini Voyager captura o contexto da interface web. Juntos, eles permitem uma sincronização de contexto perfeita!

## ⚡️ Ecossistema Suportado (Supported Ecosystem)

![VS Code](https://img.shields.io/badge/Visual%20Studio%20Code-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white)
![GitHub Copilot](https://img.shields.io/badge/GitHub%20Copilot-6f42c1?style=for-the-badge&logo=githubcopilot&logoColor=white)
![Cursor](https://img.shields.io/badge/Cursor-000000?style=for-the-badge&logo=cursor&logoColor=white)
![Trae](https://img.shields.io/badge/Trae-3B82F6?style=for-the-badge&logo=openai&logoColor=white)

**Fazendo brainstorming com IA na web, codificando no IDE — mas parece que eles se esqueceram um do outro?**

CoBridge é essa "Ponte Dimensional": ele teletransporta instantaneamente seu histórico de bate-papo do navegador para o seu IDE, permitindo que assistentes de IA como Copilot, Trae e Cursor entendam seu processo de pensamento.

> Cérebro na nuvem, mãos no local — respirando em uníssono.

---

## 🚀 Três Passos para Decolar

### 1. Instalar CoBridge

Abra o Marketplace de extensões do VS Code, pesquise por **CoBridge** e clique em instalar. É simples assim.

### 2. Confirmar Status do Serviço

Após a instalação, olhe para a barra de status no canto inferior direito — ver `CoBridge: On` significa que a ponte está pronta (porta padrão `3030`).

![Running Status](../images/running.png)

Clicar neste ícone permite que você:
- **Iniciar/Parar** manualmente o serviço
- **Ver Logs** (Verifique aqui se surgirem problemas)
- **Abrir Arquivo de Sincronização** (Veja o que a IA lembra)
- **Limpar Arquivo de Sincronização** (Limpar a memória da IA)

![Management Menu](../images/management.png)

### 3. Começar o "Teletransporte de Memória"

Certifique-se de que o **Gemini Voyager** no seu navegador tenha a "Sincronização de Contexto" ativada. Clique em **Sync to IDE**, e o conteúdo da conversa aterrissará automaticamente em:

```
.cobridge/AI_CONTEXT.md
```

A partir de agora, seu assistente de IDE nunca mais olhará para você sem expressão e perguntará: "O que você disse antes?"

---

## ⚙️ Porta Ocupada? Mude!

Se a porta padrão `3030` estiver "sendo usada" por outro programa, alterá-la é fácil:

1. Abra as Configurações do VS Code (`Ctrl + ,` / `Cmd + ,`)
2. Pesquise por `AIContextSync.port`
3. Altere o número da porta para sua preferência (por exemplo, `3031`)
4. Reinicie o serviço no menu da barra de status e pronto!

**Como as configurações do workspace do VS Code substituem as configurações do usuário, modifique o número da porta nas Configurações do Workspace.**

![Port Settings](../images/port.png)

---

## 📋 Pré-requisitos

| Requisito | Descrição |
|------|------|
| **VS Code** | `1.50.0` ou superior |
| **Extensão do Navegador** | Requer a extensão complementar [Gemini Voyager](https://github.com/Nagi-ovo/gemini-voyager) para capturar conversas |
| **Rede** | Certifique-se de que `127.0.0.1` não esteja bloqueado por um firewall |

---

## 🎯 Princípios

- **Poluição Zero**: O CoBridge adiciona automaticamente o arquivo de sincronização ao `.gitignore`, garantindo que ele nunca polua seu repositório Git. Seus "segredos" ficam com você.
- **Formato Amigável**: Saída completa em Markdown, tornando a leitura tão suave para a IA do seu IDE quanto um manual.
- **Configuração Automática**: Também ajuda a atualizar arquivos de regras, permitindo que vários assistentes de IA leiam o contexto perfeitamente.

---

## ⚠️ Limitações Conhecidas

| Status | Descrição |
|------|------|
| ✅ **Suportado** | Gemini |
| ✅ **Suporte a Tabelas** | A sincronização de tabelas é suportada |
| ✅ **Suporte a Imagens** | A sincronização de imagens é suportada |
| ❌ **Não Suportado** | Plataformas com anti-scraping rigoroso ou estruturas DOM complexas (PRs bem-vindos!) |
| ❌ **Anexos de Arquivo** | Ainda não suportado |

---

## 🌟 Resumo

**Os LLMs não terão mais amnésia. Discuta soluções completamente na web e implemente-as diretamente no IDE.**

Se este projeto ajudou você, por favor, nos dê uma Estrela ⭐ no [GitHub](https://github.com/Winddfall/CoBridge).

## 💡 Problemas

Se você tiver novos requisitos, sinta-se à vontade para abrir uma issue no [GitHub](https://github.com/Winddfall/CoBridge/issues).

## 🤝 Contribuindo

Se você tiver boas sugestões ou encontrar um bug, Pull Requests são bem-vindos!

## 📄 Licença

Este projeto está licenciado sob a Licença MIT.
