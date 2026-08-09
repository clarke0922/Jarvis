<div align="center">

# JARVIS — Personal Voice Intelligence System

**A cinematic, local-first AI command center for voice conversations, persistent memory, tasks, workspaces, and private knowledge.**

[English](#english) · [中文](#中文)

![JARVIS main HUD](docs/images/jarvis-main.png)

</div>

---

<a id="english"></a>

## English

> JARVIS is an original personal AI assistant prototype with a futuristic HUD, continuous voice interaction, configurable model providers, long-term memory, task scheduling, reusable conversation workspaces, and a local document knowledge base.

### Highlights

- **Voice-first interaction** — continuous browser speech recognition, interruption-safe listening, Edge TTS, system speech fallback, selectable voices, and adjustable rate, pitch, and robotic effect.
- **Multi-model core** — built-in presets for DeepSeek, OpenAI-compatible APIs, SiliconFlow, Moonshot, and local Ollama models.
- **Long-term memory** — stores useful preferences, habits, names, and goals locally; supports relevance search, capacity limits, manual deletion, and automatic memory rules.
- **Tasks and schedule center** — to-dos, reminders, repeating tasks, priorities, daily briefs, and ICS calendar import/export.
- **Conversation workspaces** — save and resume conversations, search history, switch assistant modes, and export a session as Markdown.
- **Local knowledge base** — upload PDF, DOCX, and Markdown files; build a local chunk index; retrieve relevant passages and cite their sources in answers.
- **Bilingual interface** — manually switch between English and Simplified Chinese.
- **Cinematic HUD** — animated reactor login, Iron-inspired armor interface, live metrics, scanning layers, and responsive panels.

### Interface

#### Neural access core

The animated boot screen acts as the entry point to the system and displays continuously changing telemetry.

![JARVIS neural access core](docs/images/jarvis-boot.png)

#### Model and system control matrix

Configure the provider, model, endpoint, server-side API key, memory policy, voice, language, and system information from one control center.

![JARVIS settings](docs/images/jarvis-settings.png)

#### Local knowledge matrix

Documents are parsed and indexed on the local server. Only retrieved excerpts needed for a question are included in the model context.

![JARVIS local knowledge base](docs/images/jarvis-knowledge.png)

### Feature map

| Module | What it does |
| --- | --- |
| **HOME** | Voice/text conversation, HUD status, active mission queue, and dialogue history |
| **AGENDA** | To-dos, reminders, repeats, priorities, daily brief, and calendar exchange |
| **PLAN** | Task and calendar planning with conflict awareness |
| **WORK** | Persistent sessions, history search, assistant modes, and Markdown export |
| **CORE** | Model provider, memory, voice, language, and system settings |
| **KNOW** | Local PDF/DOCX/Markdown ingestion, retrieval, and source-backed answers |

### Architecture

```text
Browser HUD (Vite / Vanilla JavaScript)
  ├─ Speech recognition + audio playback
  ├─ Animated UI, i18n, tasks, workspaces, settings
  └─ REST requests
           │
           ▼
Local Node.js / Express server
  ├─ Model gateway (DeepSeek / OpenAI-compatible / Ollama)
  ├─ Edge TTS gateway
  ├─ Long-term memory and workspace storage
  ├─ Tasks, schedules, reminders, and ICS exchange
  └─ Local document parsing and retrieval
           │
           ▼
Local data directory + configured AI provider
```

### Requirements

- Node.js 20 or newer
- npm
- A modern Chromium-based browser is recommended
- An API key for the selected cloud model provider, or a local Ollama-compatible endpoint
- Microphone permission for voice recognition

### Quick start

```bash
git clone git@github.com:clarke0922/Jarvis.git
cd Jarvis
npm install
```

Copy the environment template:

```bash
copy .env.example .env
```

Add your provider credentials to `.env` when using DeepSeek:

```env
DEEPSEEK_API_KEY=your_api_key_here
DEEPSEEK_MODEL=deepseek-chat
PORT=3001
```

Start the development environment:

```bash
npm run dev
```

Open `http://localhost:3001`, initialize the core, and allow microphone access when you want to use voice conversation.

### Model configuration

Open **CORE → Model Core** to select or customize a provider.

| Provider preset | Typical base URL | API key |
| --- | --- | --- |
| DeepSeek | `https://api.deepseek.com` | Required |
| OpenAI-compatible | Provider-specific `/v1` URL | Usually required |
| SiliconFlow | `https://api.siliconflow.cn/v1` | Required |
| Moonshot | `https://api.moonshot.cn/v1` | Required |
| Ollama Local | `http://localhost:11434/v1` | Not required |

The model name and base URL are editable, so other OpenAI-compatible services can be connected without changing source code.

### Voice configuration

Open **CORE → Voice System** to:

- enable or disable spoken responses;
- choose Yunxi, Yunyang, or Xiaoxiao neural voices;
- adjust speaking rate and pitch;
- control the robotic post-processing intensity;
- preview the current voice before saving.

Edge TTS is used first. If it is temporarily unavailable, JARVIS falls back to the browser's system speech engine when supported.

### Local data and privacy

Runtime data is stored under the local `data/` directory and is excluded from Git. This includes settings, provider secrets, memories, tasks, schedules, workspaces, document metadata, and uploaded knowledge files.

- API keys are handled by the local server and are never rendered back into the settings UI.
- Do not commit `.env` or the `data/` directory.
- Knowledge files are parsed locally; relevant excerpts may be sent to the configured model provider when answering a related question.
- Review your chosen provider's privacy policy before using sensitive documents.
- High-impact tools should always require explicit confirmation.

### Build and test

```bash
npm run build
npm test
npm run test:e2e
```

The production bundle is generated in `dist/`.

### Project structure

```text
Jarvis/
├─ index.html                 # Application entry
├─ server.js                 # Express API, AI gateway, TTS, and local storage
├─ src/
│  ├─ main.js                # Main UI and interaction controller
│  ├─ i18n.js                # English / Chinese interface strings
│  ├─ schedule-core.js       # Task and calendar domain logic
│  └─ *.css                  # HUD, reactor, settings, task, workspace, and knowledge UI
├─ tests/                    # Unit, API, and end-to-end tests
├─ docs/images/              # README screenshots
└─ data/                     # Local runtime data (ignored by Git)
```

### Disclaimer

This is a fan-made, non-commercial software prototype. It is not affiliated with or endorsed by Marvel, Disney, OpenAI, DeepSeek, or any actor. The assistant voice should remain an original synthetic voice and must not impersonate a real person. Referenced character imagery and trademarks belong to their respective owners; replace them with properly licensed assets before commercial distribution.

### Roadmap

- Native desktop packaging and wake-word support
- Encrypted local data vault and user profiles
- Calendar, email, smart-home, and desktop automation connectors
- Embedding-based vector retrieval for larger knowledge collections
- Fine-grained tool permissions, audit logs, and confirmation policies

<div align="right"><a href="#english">Back to English top</a> · <a href="#中文">切换到中文</a></div>

---

<a id="中文"></a>

## 中文说明

> JARVIS 是一个原创的私人 AI 助理原型，拥有科幻 HUD、连续语音交互、多模型切换、长期记忆、任务日程、可持续对话工作区和本地文档知识库。

### 核心亮点

- **语音优先交互**：支持浏览器连续语音识别、播报期间暂停监听、自动恢复监听、Edge TTS、系统语音降级、音色选择以及语速、音调和机器人效果调节。
- **多模型核心**：内置 DeepSeek、OpenAI 兼容接口、硅基流动、Moonshot 和本地 Ollama 预设。
- **长期记忆**：在本地保存有价值的称呼、偏好、习惯和目标，支持相关记忆检索、容量限制、手动删除和自动记忆规则。
- **任务与日程中心**：支持待办事项、提醒、重复任务、优先级、今日简报以及 ICS 日历导入导出。
- **对话与工作区**：保存和恢复会话、搜索历史、切换不同助手模式，并将会话导出为 Markdown。
- **本地知识库**：上传 PDF、DOCX 和 Markdown，建立本地分片索引，检索相关内容并在回答中标注来源。
- **双语界面**：可在简体中文和英文之间手动切换。
- **电影感 HUD**：动态环形登录核心、装甲主题主界面、实时指标、扫描动画和自适应信息面板。

### 界面展示

#### 神经访问核心

动态登录页面是系统入口，环形组件持续运动，同时展示不断变化的系统遥测数字。

![JARVIS 环形登录核心](docs/images/jarvis-boot.png)

#### 模型与系统控制矩阵

在一个设置中心内管理模型提供商、模型名称、接口地址、服务端 API Key、长期记忆、语音、语言和系统信息。

![JARVIS 系统设置](docs/images/jarvis-settings.png)

#### 本地知识矩阵

文档在本地服务器完成解析和索引。提问时，只把回答所需的相关片段加入模型上下文。

![JARVIS 本地知识库](docs/images/jarvis-knowledge.png)

### 功能地图

| 模块 | 功能 |
| --- | --- |
| **HOME** | 语音/文字对话、HUD 状态、运行任务和对话记录 |
| **AGENDA** | 待办、提醒、重复任务、优先级、今日简报和日历交换 |
| **PLAN** | 任务与日程规划、时间冲突检测 |
| **WORK** | 持久会话、历史搜索、助手模式和 Markdown 导出 |
| **CORE** | 模型、长期记忆、语音、语言和系统设置 |
| **KNOW** | 本地 PDF/DOCX/Markdown 解析、检索和来源引用 |

### 系统架构

```text
浏览器 HUD（Vite / 原生 JavaScript）
  ├─ 语音识别与音频播放
  ├─ 动态界面、国际化、任务、工作区和设置
  └─ REST 请求
           │
           ▼
本地 Node.js / Express 服务
  ├─ 模型网关（DeepSeek / OpenAI 兼容 / Ollama）
  ├─ Edge TTS 网关
  ├─ 长期记忆和工作区存储
  ├─ 任务、日程、提醒和 ICS 交换
  └─ 本地文档解析与检索
           │
           ▼
本地 data 目录 + 已配置的 AI 模型服务
```

### 环境要求

- Node.js 20 或更高版本
- npm
- 推荐使用现代 Chromium 内核浏览器
- 云端模型需要对应提供商的 API Key，也可以使用本地 Ollama 兼容接口
- 使用语音识别时需要授予麦克风权限

### 快速开始

```bash
git clone git@github.com:clarke0922/Jarvis.git
cd Jarvis
npm install
```

复制环境变量模板：

```bash
copy .env.example .env
```

使用 DeepSeek 时，在 `.env` 中填写配置：

```env
DEEPSEEK_API_KEY=your_api_key_here
DEEPSEEK_MODEL=deepseek-chat
PORT=3001
```

启动开发环境：

```bash
npm run dev
```

打开 `http://localhost:3001`，启动系统；需要语音对话时，请允许浏览器使用麦克风。

### 模型配置

进入 **CORE → 模型核心**，选择或自定义模型提供商。

| 提供商预设 | 常用接口地址 | API Key |
| --- | --- | --- |
| DeepSeek | `https://api.deepseek.com` | 需要 |
| OpenAI 兼容接口 | 对应服务的 `/v1` 地址 | 通常需要 |
| 硅基流动 | `https://api.siliconflow.cn/v1` | 需要 |
| Moonshot | `https://api.moonshot.cn/v1` | 需要 |
| 本地 Ollama | `http://localhost:11434/v1` | 不需要 |

模型名称和接口地址均可编辑，因此无需修改源码，也可以连接其他 OpenAI 兼容服务。

### 语音设置

进入 **CORE → 语音系统**，可以：

- 开启或关闭语音播报；
- 选择云希、云扬或晓晓神经网络音色；
- 调整语速和音调；
- 调节机器人后处理效果强度；
- 保存前试听当前音色。

系统优先使用 Edge TTS；如果服务暂时不可用，并且浏览器支持，将自动降级到系统语音引擎。

### 本地数据与隐私

运行数据保存在本地 `data/` 目录中，并已排除在 Git 版本管理之外，其中包括设置、提供商密钥、长期记忆、任务、日程、工作区、文档索引和上传的知识文件。

- API Key 由本地服务端处理，设置界面不会回显密钥内容。
- 不要提交 `.env` 或 `data/` 目录。
- 知识文件在本地解析；回答相关问题时，命中的文本片段可能会发送给当前模型提供商。
- 使用敏感资料前，请先了解所选模型提供商的隐私政策。
- 高影响操作应始终要求用户明确确认。

### 编译与测试

```bash
npm run build
npm test
npm run test:e2e
```

生产版本会生成到 `dist/` 目录。

### 项目结构

```text
Jarvis/
├─ index.html                 # 应用入口
├─ server.js                 # Express API、模型网关、TTS 和本地存储
├─ src/
│  ├─ main.js                # 主界面与交互控制器
│  ├─ i18n.js                # 中英文界面文本
│  ├─ schedule-core.js       # 任务与日历领域逻辑
│  └─ *.css                  # HUD、登录核心、设置、任务、工作区和知识库样式
├─ tests/                    # 单元、API 和端到端测试
├─ docs/images/              # README 界面截图
└─ data/                     # 本地运行数据（Git 已忽略）
```

### 版权与使用说明

本项目是粉丝制作的非商业软件原型，与 Marvel、Disney、OpenAI、DeepSeek 或任何演员不存在隶属、授权或背书关系。助手应使用原创合成音色，不得冒充真实人物。界面中引用的角色形象和商标归各自权利方所有；用于商业发布前，请替换为拥有合法授权的素材。

### 后续计划

- 原生桌面封装与唤醒词
- 加密本地数据保险库和多用户档案
- 日历、邮件、智能家居和桌面自动化连接器
- 面向大规模资料库的向量嵌入检索
- 更细粒度的工具权限、审计日志和确认策略

<div align="right"><a href="#english">Switch to English</a> · <a href="#中文">返回中文顶部</a></div>
