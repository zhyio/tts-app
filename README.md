# TTS Web App

基于 React 19 + TypeScript + Vite + Tailwind CSS 4 构建的语音合成（TTS）Web 应用，接入小米 MiMo TTS v2.5 API，提供现代化的语音生成体验。

## 功能特性

- **三模型支持**：预置音色模式、音色设计模式、音色克隆模式，动态切换 UI
- **Bento Box 布局**：响应式 12 列网格布局，输入区与播放器分栏显示
- **亮/暗主题切换**：支持 Light / Dark / System 三种模式，配置持久化到 localStorage
- **毛玻璃效果**：Glassmorphism 风格卡片，搭配光影背景
- **声波动画**：语音生成时展示 Framer Motion 驱动的声波动画
- **自定义音频播放器**：播放、暂停、进度条、缓冲进度可视化、音量控制
- **实时字幕**：音频播放时同步高亮当前朗读片段
- **中文音色名称**：冰糖、茉莉、苏打、白桦、Mia、Chloe、Milo、Dean 等
- **快速插入标签**：情感标签（开心、怅然、慵懒、东北话）与动作标签（深呼吸、叹气、笑、哽咽、咳嗽）
- **自然语言指导**：全局 Director Mode，用自然语言描述发音风格和场景设定

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 19 + TypeScript |
| 构建工具 | Vite |
| 样式 | Tailwind CSS 4 |
| 动画 | Framer Motion |
| 状态管理 | Zustand（localStorage 持久化） |
| UI 组件 | shadcn/ui + @base-ui/react |
| 图标 | Lucide React |
| API | MiMo TTS v2.5（`/v1/chat/completions`） |

## 项目结构

```
tts-app/
├── src/
│   ├── components/
│   │   ├── layout/          # 页面布局（Header、主题切换）
│   │   ├── tts/             # TTS 输入区（文本、模型选择、标签、文件上传）
│   │   ├── player/          # 音频播放器（进度条、控制按钮、字幕）
│   │   ├── config/          # 配置抽屉（API Key、模型、音色）
│   │   └── ui/             # 通用 UI 组件（WaveAnimation 等）
│   ├── contexts/            # React Context（ThemeProvider）
│   ├── hooks/               # 自定义 Hooks（use-audio-player）
│   ├── pages/               # 页面组件（HomePage）
│   ├── services/            # API 服务（tts-api.ts）
│   ├── stores/              # 状态管理（use-config-store、use-audio-store）
│   ├── types/               # TypeScript 类型定义
│   ├── App.tsx             # 根组件（bg-glow 背景）
│   ├── main.tsx            # 入口文件（ThemeProvider 包裹）
│   └── index.css           # 样式（glass、glass-card、bg-glow 等）
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── TEST_REPORT.md         # 测试报告
```

## 快速开始

### 前置条件

- Node.js >= 18
- npm 或 pnpm

### 安装依赖

```bash
cd tts-app
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:5173（端口可能自动调整）

### 生产构建

```bash
npm run build
```

构建产物输出到 `dist/` 目录。

### 预览构建结果

```bash
npm run preview
```

## 配置说明

应用配置通过 Zustand store（`use-config-store`）管理，持久化到 `localStorage`：

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `apiBaseUrl` | `https://api.xiaomimi.com/v1` | MiMo API 地址 |
| `apiKey` | 空（需用户配置） | API 密钥（通过配置抽屉修改） |
| `modelName` | `mimo-v2.5-tts` | TTS 模型（三选一） |
| `voice` | `mimo_default` | 默认音色 |

## 三种模型模式

### 预置音色模式（`mimo-v2.5-tts`）
- 选择预设音色（冰糖、茉莉、苏打等）
- 支持插入 `(唱歌)` 标签
- 适合快速生成指定音色的语音

### 音色设计模式（`mimo-v2.5-tts-voicedesign`）
- 输入自然语言描述（如 "young woman in her mid-20s, warm and confident"）
- AI 根据描述生成定制音色
- 适合需要特定声音风格的场景

### 音色克隆模式（`mimo-v2.5-tts-voiceclone`）
- 上传音频样本（.mp3 或 .wav，<10MB）
- 系统克隆音色并用于生成
- 适合需要复现特定人声的场景

## API 说明

本应用使用 MiMo TTS v2.5 的 `/v1/chat/completions` 端点：

- **请求格式**：通过 `messages` 数组传递文本
  - `messages[0]`（role: "user"）：Director Mode 指导文本或音色设计描述
  - `messages[1]`（role: "assistant"）：待合成文本 + 情感/动作标签
- **强制参数**：`stream: false`，`audio.format: "wav"`
- **音频返回**：base64 编码的 WAV 数据，在响应中返回

## 标签系统

在预置音色模式下，可使用快速插入工具栏：

**情感标签**（插入在文本开头）：
- `(开心)` `(怅然)` `(慵懒)` `(东北话)`

**动作标签**（插入在文本结尾）：
- `[深呼吸]` `[叹气]` `[笑]` `[哽咽]` `[咳嗽]`

**特殊标签**：
- `(唱歌)` — 仅在预置音色模式可用

## 主题系统

`ThemeProvider`（`src/contexts/theme-provider.tsx`）提供三态主题支持：

- **light**：浅色模式
- **dark**：深色模式（默认）
- **system**：跟随系统偏好

主题选择持久化到 `localStorage` 的 `tts-theme` 键。

## 测试

参见 [TEST_REPORT.md](./TEST_REPORT.md) 了解完整的测试覆盖情况。

## License

MIT
