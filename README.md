# TTS Web App

基于 React 19 + TypeScript + Vite 8 + Tailwind CSS 4 构建的语音合成（TTS）Web 应用，接入小米 MiMo TTS v2.5 API，提供现代化的语音生成体验。

## 功能特性

- **语音合成**：接入 MiMo TTS v2.5 API，支持多音色中文语音生成
- **Bento Box 布局**：响应式 12 列网格布局，输入区与播放器分栏显示
- **亮/暗主题切换**：支持 Light / Dark / System 三种模式，配置持久化到 localStorage
- **毛玻璃效果**：Glassmorphism 风格卡片，搭配光影背景
- **声波动画**：语音生成时展示 Framer Motion 驱动的声波动画
- **自定义音频播放器**：播放、暂停、进度条、缓冲进度可视化、倍速播放
- **实时字幕**：音频播放时同步高亮当前朗读片段
- **音色选择**：支持 mimo_default、冰糖、茉莉、苏打、白桦、Mia、Chloe、Milo 等音色
- **参数调节**：语速（0.5x - 2.0x）、音调、情感标签

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 19 + TypeScript |
| 构建工具 | Vite 8 |
| 样式 | Tailwind CSS 4 |
| 动画 | Framer Motion 12 |
| 状态管理 | Zustand（localStorage 持久化） |
| UI 组件 | shadcn/ui + @base-ui/react |
| 图标 | Lucide React |
| API | MiMo TTS v2.5（`/v1/chat/completions`） |

## 项目结构

```
tts-app/
├── src/
│   ├── components/
│   │   ├── layout/          # 页面布局（Header）
│   │   ├── tts/             # TTS 输入区（文本、音色、参数）
│   │   ├── player/          # 音频播放器（进度条、控制按钮）
│   │   ├── config/          # 配置抽屉（API Key、模型、音色）
│   │   └── ui/             # 通用 UI 组件（WaveAnimation 等）
│   ├── contexts/            # React Context（ThemeProvider）
│   ├── hooks/              # 自定义 Hooks（use-audio-player）
│   ├── pages/              # 页面组件（HomePage）
│   ├── services/           # API 服务（tts-api.ts）
│   ├── stores/             # 状态管理（use-config-store）
│   ├── types/              # TypeScript 类型定义
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
| `apiBaseUrl` | `https://api.xiaomimimo.com/v1` | MiMo API 地址 |
| `apiKey` | 内置默认值 | API 密钥（也可通过配置抽屉修改） |
| `modelName` | `MiMo-V2.5-TTS` | TTS 模型名称 |
| `voice` | `mimo_default` | 默认音色 |
| `speed` | `1.0` | 语速（0.5 - 2.0） |
| `response_format` | `mp3` | 音频格式（mp3/opus/aac/flac/wav） |

## API 说明

本应用使用 MiMo TTS v2.5 的 `/v1/chat/completions` 端点：

- **请求格式**：通过 `messages` 数组传递文本（user 指令 + assistant 待合成文本）
- **`modalities: ["text", "audio"]`**：指定返回音频数据
- **音频返回**：base64 编码的音频数据，在 `choices[0].message.audio.data` 中
- **可用音色**：`mimo_default`、`冰糖`、`茉莉`、`苏打`、`白桦`、`Mia`、`Chloe`、`Milo`

## 主题系统

`ThemeProvider`（`src/contexts/theme-provider.tsx`）提供三态主题支持：

- **light**：浅色模式
- **dark**：深色模式（默认）
- **system**：跟随系统偏好

主题选择持久化到 `localStorage` 的 `tts-theme` 键。

## 测试

参见 [TEST_REPORT.md](./TEST_REPORT.md) 了解完整的测试覆盖情况（33 个测试用例，覆盖核心功能、错误处理、边界场景）。

## License

MIT
