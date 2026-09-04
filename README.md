# AI Coding Evolution

AI 编程工具、模型与关键技术的交互式资料库与全景时间线。

截至 2026-09-05 收录 212 个节点：产品 91、模型 83、关键技术 38。
原始 PDF 的 192 个节点保留原 ID；20 个补充节点从 node-193 起编号，
附独立发布来源、核查日期与开放状态。PDF 保持原始资料，不冒充已同步更新。
发展线表示同系列的发布记录；编程、视觉和托管分支单列，不表示版本间必然替代。
完整更新清单与待核事项见 [数据更新记录](docs/data-updates-2026-09-05.md)。

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
