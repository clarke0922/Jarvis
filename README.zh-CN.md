<div align="center">

# JARVIS — 私人语音智能系统

**拥有语音对话、长期记忆、任务日程、对话工作区和本地知识库的电影感 AI 控制中心。**

[English](README.md) · **中文**

![JARVIS 主控制台](docs/images/jarvis-main.png)

</div>

## 项目简介

JARVIS 是一个原创的私人 AI 助理原型，拥有科幻 HUD、连续语音交互、多模型切换、长期记忆、任务日程、可持续对话工作区和本地文档知识库。

## 核心亮点

- **语音优先交互**：支持浏览器连续语音识别、播报期间暂停监听、自动恢复监听、Edge TTS、系统语音降级、音色选择以及语速、音调和机器人效果调节。
- **多模型核心**：内置 DeepSeek、OpenAI 兼容接口、硅基流动、Moonshot 和本地 Ollama 预设。
- **长期记忆**：在本地保存有价值的称呼、偏好、习惯和目标，支持相关记忆检索、容量限制、手动删除和自动记忆规则。
- **任务与日程中心**：支持待办事项、提醒、重复任务、优先级、今日简报以及 ICS 日历导入导出。
- **对话与工作区**：保存和恢复会话、搜索历史、切换不同助手模式，并将会话导出为 Markdown。
- **本地知识库**：上传 PDF、DOCX 和 Markdown，建立本地分片索引，检索相关内容并在回答中标注来源。
- **双语界面**：可在简体中文和英文之间手动切换。
- **电影感 HUD**：动态环形登录核心、装甲主题主界面、实时指标、扫描动画和自适应信息面板。

## 界面展示

### 神经访问核心

动态登录页面是系统入口，环形组件持续运动，同时展示不断变化的系统遥测数字。

![JARVIS 环形登录核心](docs/images/jarvis-boot.png)

### 模型与系统控制矩阵

在一个设置中心内管理模型提供商、模型名称、接口地址、服务端 API Key、长期记忆、语音、语言和系统信息。

![JARVIS 系统设置](docs/images/jarvis-settings.png)

### 本地知识矩阵

文档在本地服务器完成解析和索引。提问时，只把回答所需的相关片段加入模型上下文。

![JARVIS 本地知识库](docs/images/jarvis-knowledge.png)

## 功能地图

| 模块 | 功能 |
| --- | --- |
| **HOME** | 语音/文字对话、HUD 状态、运行任务和对话记录 |
| **AGENDA** | 待办、提醒、重复任务、优先级、今日简报和日历交换 |
| **PLAN** | 任务与日程规划、时间冲突检测 |
| **WORK** | 持久会话、历史搜索、助手模式和 Markdown 导出 |
| **CORE** | 模型、长期记忆、语音、语言和系统设置 |
| **KNOW** | 本地 PDF/DOCX/Markdown 解析、检索和来源引用 |

## 系统架构

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

## 环境要求

- Node.js 20 或更高版本
- npm
- 推荐使用现代 Chromium 内核浏览器
- 云端模型需要对应提供商的 API Key，也可以使用本地 Ollama 兼容接口
- 使用语音识别时需要授予麦克风权限

## 快速开始

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

## 模型配置

进入 **CORE → 模型核心**，选择或自定义模型提供商。

| 提供商预设 | 常用接口地址 | API Key |
| --- | --- | --- |
| DeepSeek | `https://api.deepseek.com` | 需要 |
| OpenAI 兼容接口 | 对应服务的 `/v1` 地址 | 通常需要 |
| 硅基流动 | `https://api.siliconflow.cn/v1` | 需要 |
| Moonshot | `https://api.moonshot.cn/v1` | 需要 |
| 本地 Ollama | `http://localhost:11434/v1` | 不需要 |

模型名称和接口地址均可编辑，因此无需修改源码，也可以连接其他 OpenAI 兼容服务。

## 语音设置

进入 **CORE → 语音系统**，可以：

- 开启或关闭语音播报；
- 选择云希、云扬或晓晓神经网络音色；
- 调整语速和音调；
- 调节机器人后处理效果强度；
- 保存前试听当前音色。

系统优先使用 Edge TTS；如果服务暂时不可用，并且浏览器支持，将自动降级到系统语音引擎。

## 本地数据与隐私

运行数据保存在本地 `data/` 目录中，并已排除在 Git 版本管理之外，其中包括设置、提供商密钥、长期记忆、任务、日程、工作区、文档索引和上传的知识文件。

- API Key 由本地服务端处理，设置界面不会回显密钥内容。
- 不要提交 `.env` 或 `data/` 目录。
- 知识文件在本地解析；回答相关问题时，命中的文本片段可能会发送给当前模型提供商。
- 使用敏感资料前，请先了解所选模型提供商的隐私政策。
- 高影响操作应始终要求用户明确确认。

## 编译与测试

```bash
npm run build
npm test
npm run test:e2e
```

生产版本会生成到 `dist/` 目录。

## 项目结构

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

## 版权与使用说明

本项目是粉丝制作的非商业软件原型，与 Marvel、Disney、OpenAI、DeepSeek 或任何演员不存在隶属、授权或背书关系。助手应使用原创合成音色，不得冒充真实人物。界面中引用的角色形象和商标归各自权利方所有；用于商业发布前，请替换为拥有合法授权的素材。

## 后续计划

- 原生桌面封装与唤醒词
- 加密本地数据保险库和多用户档案
- 日历、邮件、智能家居和桌面自动化连接器
- 面向大规模资料库的向量嵌入检索
- 更细粒度的工具权限、审计日志和确认策略

<div align="right"><a href="#jarvis--私人语音智能系统">返回顶部</a> · <a href="README.md">Read in English</a></div>
