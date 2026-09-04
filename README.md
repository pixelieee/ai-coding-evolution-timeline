# AI Coding Evolution

AI 编程工具、模型与关键技术的交互式资料库与全景时间线。

- 节点库：搜索、分类、日期与发展阶段筛选。
- 全景图：泳道导航、发展线、日期定位、拖拽平移与按钮缩放。
- 节点详情：发布日期、摘要及来源链接。
- 深色与浅色主题；支持查看和下载原始 PDF。

## 本地运行

需要 Node.js 22 或更新版本。

```sh
npm ci
npm run dev
```

## 测试与构建

```sh
npm run build
node --test tests/*.test.mjs
```

静态网页输出到 `dist/client`。GitHub Pages 通过
`.github/workflows/deploy-pages.yml` 自动测试、构建并发布 `main` 分支。
本地测试截图、临时文件、依赖目录和机器相关配置不纳入仓库。

资料以各节点提供的来源为准。产品标识、论文与原始资料的权利归各自权利人所有。
网站标识使用的 Phosphor 图形许可见 [public/brand/LICENSE.txt](public/brand/LICENSE.txt)。

GitHub：[pixelieee](https://github.com/pixelieee)
