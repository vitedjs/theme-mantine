---
title: 配置
order: 20
---

# 配置

主题通过 [Vited Core](https://github.com/vitedjs/core) 的 `docs` 选项进行配置，
没有主题专属的选项。

```ts
import { defineConfig } from '@vited/core';

export default defineConfig({
  docs: {
    title: 'My Cool Library',
    description: 'Documentation for My Cool Library',
    supportedLocales: ['en', 'zh'],
    theme: '@vited/theme-mantine',
  },
});
```

## 标题、描述和网站图标

`title` 和 `description` 显示在页头中，旁边是 Vited 从文档目录中发现的网站图标。

## 多语言

当 `supportedLocales` 包含多个语言时，页头会显示语言选择器，界面文本（搜索、
导航、色彩模式切换）会在内置的英文和简体中文翻译之间切换。

## 搜索

搜索 Spotlight 会索引当前语言下每个页面的标题和内容，支持模糊匹配，包括中文
文本。使用搜索按钮或 `Ctrl+K` / `⌘K` 打开，用方向键在结果间移动，按 `Enter`
确认。

## 色彩模式

在用户通过页头按钮选择明暗模式之前，主题跟随系统色彩方案。用户的显式选择会
持久化到 `localStorage`，并通过 Mantine 的色彩方案应用，因此所有 Mantine
组件都会自动适配。

## 项目链接

当传给主题的 `package.json` 包含 GitHub `repository` URL 或 `funding` URL 时，
对应的链接会以图标按钮的形式显示在页头。

## 标题锚点与目录

每个 Markdown 和 MDX 标题都会生成 `id` 和锚点链接，因此可以通过
`/guide/start/#getting-started` 这样的片段直接定位标题。页面大纲显示在正文
右侧的目录中，滚动时保持可见；在小屏幕上通过浮动按钮打开。

## 代码高亮

代码块使用 Shiki 和 Mantine CodeHighlight 的 GitHub 明暗双主题进行高亮。
预加载语言：`bash`、`css`、`diff`、`html`、`javascript`、`json`、`jsx`、
`markdown`、`mdx`、`shellscript`、`typescript`、`tsx` 和 `yaml`；其他语言回退为
纯文本。
