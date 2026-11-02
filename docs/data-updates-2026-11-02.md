# 2026-11-02 数据更新记录

本轮从 2026-09-05 的 212 个节点更新到 242 个节点。新增 30 个：产品 11、模型 10、关键技术 9。只收录已公开、可由官方公告、官方仓库或论文原文核验，且足以改变产品形态、模型能力边界或技术路线的事件。

## 新增产品里程碑

- OpenAI Agents API：把 Codex Harness 的会话、编排、上下文压缩与恢复作为托管 API 开放。
- Kimi Code Desktop：把目标、计划、后台任务、审批与浏览器纳入桌面长任务工作台。
- Antigravity SDK 本地模型：本地 LiteRT / OpenAI 兼容模型获得 MCP 与子代理支持。
- Cursor Rollouts / Security Review：把 Agent 工作流延伸到部署后回归判断和 PR 安全审查。
- Copilot Dynamic Workflows：用代码固定可复用、多 Agent、带检查点的编排流程。
- DeepSeek Harness 0.2.1 RC：围绕 V4.1 Flash 联合优化模型与 Harness；明确标为候选版本。
- Cursor Agent SDK：Agent-as-code、评测、PR 回放与多环境部署正式开放。
- MiniMax Code Mini App：Agent 可生成并持续运行带界面的前后端应用，应用与 Agent 双向调用。
- Copilot 统一云端会话：跨 Web、移动端、CLI、App、VS Code、Slack、Teams 延续同一沙盒会话。
- GitHub Agentic Workflows：自然语言 Markdown 编译为受 Actions 权限和 Runner 约束的 Agent 工作流。
- OpenCode Goal Mode：持续执行直到独立 Reviewer 判断目标完成。

## 新增模型里程碑

- DeepSeek V4.1 Flash 与 V4.1 Flash 1017：正式替代旧 Flash 分支；后续版本用自反馈强化学习并针对多个 Harness 优化。
- GPT-6 Sol / Luna、GPT-6.1 Sol、GPT-6.1 Terra：GPT-6 从旗舰模型扩展到不同能力、成本和延迟档位。
- Claude Opus 5.5、Sonnet 5.5、Haiku 5.5：覆盖高端 Agentic Coding、主力模型效率与高吞吐子代理三档。
- MiniMax M3.1 Flash：Agent、编程、电脑操作与安全能力升级，同时明显降低推理成本。
- Kimi K3.1 Pro：更大规模后训练、1M 上下文和长程 Agent；权重仍按官方计划标注，未提前写成已开源。

## 新增关键技术里程碑

- Recursive Agent Harnesses：递归单元从模型调用扩展为带工具的完整 Harness。
- GLM Infra Agent：在人工定义边界和可归因实验反馈下优化自身推理系统；属于早期工业自我改进，不等同完整 RSI。
- AIDE²：Agent 改写自身代码，并用隐藏评测筛选后继版本。
- Env-Rethink：从任务扩增推进到环境整理、诊断与主动演化。
- RSIGym：统一服务化训练、推理、rollout、评测和沙盒，支持数据、Harness 与训练配置联合改进。
- Work2Skill：从人类 GUI 示范中归纳可复用流程 Skill。
- Harness²：在线任务级 Harness 改写与跨任务持续改进结合。
- RSI-Opt：把递归改进推进到优化策略、Playbook、优化器代码和训练决策节奏。
- Skill∞：任务 Skill 与负责优化 Skill 的 Meta-Skill 同时演化。

## 明确未收录

- 未公开传闻、产品预告和无法从一手来源确认的版本号。
- 只改变界面、快捷键或常规性能的补丁版本。
- 与 AI Coding / Work Agent 路线关联弱的专用模型，例如仅面向生命科学的 GPT-6 Rosalind Research。
- 尚未兑现的开源计划；例如 Kimi K3.1 Pro 只记录官方承诺日期，不写成已经完成开放权重。

## 项目与工程调整

- 对外名称统一为“AI大事件图鉴”，包括页面标题、页头、元数据、README 和包名。
- 主题切换、系统主题跟随与本地偏好继续保留，但不再作为 README 中的重点功能宣传。
- 将一次性锁死“212 个节点 / 2026-09-05”的测试改为可持续的数据完整性、来源、日期、演进线和最新节点校验。
