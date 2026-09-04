# 数据更新：2026-09-05

本次从 192 个节点增至 212 个：产品 91、模型 83、关键技术 38。保留原始 192 个 ID 与 PDF；新增记录以“补充”标识，来源与原始 PDF 分开。

## 新增与历史补漏

| ID | 日期 | 节点 | 开放状态 | 发布来源 |
| --- | --- | --- | --- | --- |
| node-193 | 2026-08-17 | Cursor Origin | 早期测试 | [Cursor · Origin Code Hosting](https://cursor.com/changelog/origin-code-hosting) |
| node-194 | 2026-08-19 | Cursor Cloud Agents：持续任务 | 功能发布 | [Cursor · Cloud Agents and Harness Improvements](https://cursor.com/changelog/08-19-26) |
| node-195 | 2026-09-02 | Cursor 自托管执行环境 | 功能发布 | [Cursor · Self-hosted machines](https://cursor.com/changelog/self-hosted-machines) |
| node-196 | 2026-09-01 | Kiro Web 正式开放 | 正式开放 | [Kiro · Web general availability](https://kiro.dev/changelog/web/kiro-web-is-now-generally-available/) |
| node-197 | 2026-05-19 | Antigravity 2.0 | 产品发布 | [Google · Introducing Antigravity 2.0](https://antigravity.google/blog/introducing-google-antigravity-2?hl=en) |
| node-198 | 2026-08-20 | Antigravity Remote Control | 功能发布 | [Google Antigravity · 2.9.1 changelog](https://antigravity.google/changelog) |
| node-199 | 2026-08-26 | Replit 智能模型路由 | 功能发布 | [Replit · Intelligent Model Routing](https://replit.com/blog/intelligent-model-routing) |
| node-200 | 2026-09-01 | Copilot PR 审批 | 公开预览 | [GitHub · Copilot PR approvals](https://github.blog/changelog/2026-09-01-copilot-code-review-can-now-approve-pull-requests/) |
| node-201 | 2026-09-03 | GPT-6 Astra | 分阶段开放 | [OpenAI · GPT-6 Astra](https://developers.openai.com/api/docs/models/gpt-6-astra) |
| node-202 | 2026-09-01 | Claude Fable 5.1 / Mythos 5.1 | 分级开放 | [Anthropic · Fable 5.1 and Mythos 5.1](https://www.anthropic.com/claude-fable-and-mythos-5-1) |
| node-203 | 2026-07-21 | Gemini 3.6 Flash | 正式开放 | [Google · Gemini API release notes](https://ai.google.dev/gemini-api/docs/changelog#july-21-2026) |
| node-204 | 2026-08-13 | Gemini 3.7 Flash | 正式开放 | [Google · Gemini API release notes](https://ai.google.dev/gemini-api/docs/changelog#august-13-2026) |
| node-205 | 2026-09-02 | Gemini 3.8 Flash | 正式开放 | [Google · Gemini API release notes](https://ai.google.dev/gemini-api/docs/changelog#september-2-2026) |
| node-206 | 2026-08-21 | DeepSeek V4 Flash Vision Exp | 实验版本 | [DeepSeek · V4 Flash Vision Exp](https://api-docs.deepseek.com/news/news260821/) |
| node-207 | 2026-03-18 | MiniMax M2.7 | 模型发布 | [MiniMax · Model release notes](https://platform.minimax.io/docs/release-notes/models) |
| node-208 | 2026-06-01 | MiniMax M3 | 模型发布 | [MiniMax · M3](https://www.minimax.io/blog/minimax-m3) |
| node-209 | 2026-04-20 | Kimi K2.6 | 模型发布 | [Kimi · K2.6 technical blog](https://www.kimi.com/en/blog/kimi-k2-6) |
| node-210 | 2026-06-12 | Kimi K2.7 Code | 模型发布 | [Kimi Code · Release notes](https://www.kimi.com/code/docs/en/kimi-code/whats-new.html) |
| node-211 | 2026-08-06 | Agent Plugins 1.0 | 开放标准 | [Agent Plugins · 1.0 specification](https://github.com/agentplugins/agent-plugins-spec/blob/main/spec/1.0.0.md) |
| node-212 | 2026-07-31 | DeepSeek V4 Flash：公开测试 | 公开测试 | [DeepSeek · 2026-07-31 update](https://api-docs.deepseek.com/updates/#date-2026-07-31) |

## 发展线

- Gemini Flash 补齐 3.5 → 3.6 → 3.7 → 3.8。
- MiniMax 补齐 M2.5 → M2.7 → M3。
- Kimi K2.6 加入通用模型线；K2.7 Code 作为从 K2.6 引出的编程分支，不强接到 K3 前面。
- Fable / Mythos 5 → 5.1 独立于 Opus 版本线。
- Cursor 代码托管与云端执行分开，并从 Cursor 2.0 引入背景节点；托管产品不伪装成云端执行的前代。
- DeepSeek V4 预览 → V4 Flash 公开测试 → Flash Vision Exp；不经过 V4 Pro 正式版。
- 图上的线表示发布记录和明确标注的分支背景，不表示所有版本均存在技术继承或替代关系。

## 来源纠正与待核事项

- node-129 DeepSeek V4 Pro 原链接误指 V3.2，改为 [2026-08-13 发布原文](https://api-docs.deepseek.com/news/news260813/)。
- node-125 DeepSeek V4 Preview 改为 [2026-04-24 API 官方发布原文](https://api-docs.deepseek.com/news/news260424/)。
- node-134 Qwen3.8-Max 保留原资料日期 2026-08-28，但详情明确显示“待核”。[服务记录](https://docs.qwencloud.com/changelog/models)更早已出现该模型，尚需区分首次发布、预览、正式开放；未武断改成 8 月 3 日。
- Harness-IF、Same Model Different Harness、Qwen3.8-Flash 等保留研究候选，未混入本次正式更新。
- 不纳入尚未上线的 9 月 28 日 Copilot 体验预告、普通补丁、价格变更或非 AI 编程主题内容。

所有能力说明为发布方描述，不表示独立复现的评测结论；正式开放、公开预览、实验版本和限定访问分别标注。完整来源可在节点详情打开。
