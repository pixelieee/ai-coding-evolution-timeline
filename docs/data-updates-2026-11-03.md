# 2026-11-03 增补核查

本次补入三十九个被上一轮扫描遗漏、且已经达到里程碑标准的节点。节点总数从 242 增至 281：产品 113、模型 97、关键技术 71。

## 第二轮审计：协议、评测环境与闭环工程

- `goose`：2025-01-28 首次公开，把本地执行、可替换模型、CLI/桌面端和 MCP 扩展合成完整开源 Agent，是 MCP 从规范进入真实运行时的重要案例。
- `OpenHands`：补回 2024 年开源软件工程 Agent 的公共底座，把终端、浏览器、沙盒、多 Agent 与评测放进同一个可复现平台。
- `A2A` 与 `ACP`：分别补齐 Agent-to-Agent 协作、Agent-to-Editor 接入两层协议。它们与 MCP 分工不同，不再笼统写成“工具协议”。
- `AGENTS.md`：补齐仓库级持久上下文约定，记录 Coding Agent 如何获得构建、测试、规范与业务约束，而不是把所有上下文工程都写成检索算法。
- `SWE-bench Live`：用持续更新任务和 RepoLaunch 自动环境构建，正面处理静态榜单过时与训练污染。
- `SWE-bench Verified`：记录人工复核让仓库评测成为行业标准，也明确标注它后来因污染失去区分度，不再把高分当作真实工程能力。
- `SWE-Bench Pro`：把评测推进到更长、更复杂的企业级多文件任务，并明确公开、隐藏与私有数据边界。
- `SWE-Perf`：把验收条件从功能正确扩展到性能确实改善，同时保留机器噪声与统计复现的限制。
- `Terminal-Bench 2.0 + Harbor`：把容器验证、并发环境、统一 Agent 接口和 RL/SFT rollout 放到同一 Harness，补上 Env Scaling 主线。
- `Meta Ranking Engineer Agent`：把模型实验延伸为跨数天或数周的异步闭环，明确标注为内部生产系统，不写成对外产品。
- `KernelEvolve`：用专用 Harness、搜索和可执行验证持续优化异构硬件内核，是“生成代码”走向“闭环搜索生产代码”的代表节点。
- `PARL`：冻结子 Agent、训练调度器，首次把多 Agent 组织方式本身作为强化学习对象。Kimi Agent Swarm 同步修正到 2026-01-27，并补全 Beta、产品上限和证据边界。
- `OSWorld` 与新版 Claude 3.5 Sonnet：补齐 Computer Use 从可执行桌面环境评测走向前沿模型公开 Beta 的路线；不再用“3.6”这一非正式名字。
- `Context Editing + Memory`：把长程上下文管理拆成裁剪短期轨迹与跨会话文件记忆，并明确存储、权限和记忆正确性仍由应用负责。
- `Agent Skills`：记录 2025-10 产品发布，并在同一节点注明 2025-12 开放标准和 2026-10 捐赠 AAIF，避免把治理更新拆成噪声。
- `Long-running Agent Harness` 与 `Harness Engineering`：补齐跨上下文交接、仓库可读性、隔离 worktree、CI、日志、指标和 Agent 审查等生产工程方法。
- `VERSE → UCoE → Self-HPO`：分别推进 Optimizer 自我改进、Verifier–Harness 协同演化、Harness–Policy 联合训练，补齐 Self-Harness 之后的三条关键技术路线。
- `Responses API + Agents SDK`：补齐通用 Agent Runtime、handoff、guardrail 与 tracing/observability 的工程基础层。
- `Live-SWE-agent`：补上最小 Bash Agent 在真实软件任务中在线修改自身 scaffold 的路线，明确它仍属于模型外 Self-Harness。
- `Symphony`：记录 Issue Tracker 变为持续 Coding Agent 控制面的编排范式，并标注其只是开源规范与参考实现。

## Jev

- 日期：2026-09-15。
- 状态：早期访问，不写成全面开放或成熟生产模型。
- 收录理由：TypeSafe AI 将模型输出从自由文本改为预先定义的类型化选择、评分和概率，使模型能作为软件工作流中的低延迟决策函数。这是模型接口形态的实质变化，不是普通版本升级。
- 证据边界：官方披露 RLCD、并行采样、延迟与成本数据，但没有公开底层架构和完整训练细节。厂商的“不会幻觉”和大幅领先主流模型等表述不作为本站独立结论。
- 主来源：TypeSafe 官方发布；机器之心、量子位用于发现、中文解释和路线对照；另附独立评测论文。

## DeepSeek dsh-superagent

- 日期：2026-10-31。
- 状态：开源研究原型，不是正式 DeepSeek 产品。
- 收录理由：它把 Coding Agent 从单会话工具推进到团队协作层：监听 GitHub/飞书事件，经授权后创建独立任务、会话和工作目录，并把结果送回原对话。配套架构讨论覆盖 Router/Worker、事件驱动、异步多任务、持久状态和 Watchdog。
- 证据边界：官方仓库明确说明，公开原型不同于内部实现，文章中的部分设计仍是未来方向。因此节点标题使用仓库正式名称 `dsh-superagent`，不把媒体常用的“DeepSeek Super Agent”写成已发布商业产品。
- 主来源：DeepSeek 官方仓库与官方账号文章；机器之心、量子位作为中文延伸阅读。

## Grok / SpaceXAI 产品与模型线

- Grok Build：终端 Coding Agent 首发。
- `/goal`：把单轮对话扩展为可暂停、恢复和验证的长任务循环。
- Grok Build 开源：公开 Agent Loop、工具、TUI 与完整扩展系统。
- Workflows：将大型任务编译为可复用的并行 Agent 编排，并设置独立验证阶段。
- Grok Bot：每个 Bot 拥有持久云电脑、记忆和跨应用执行环境。
- Grok 4.5 / 4.6 / 4.7：从 Coding 与 Agentic RL，推进到多小时任务、自验证、长上下文管理和原生理解 Grok Bot Harness。

没有把 Grok Bot 的套餐扩展、Web 入口、X 集成等普通渠道更新拆成独立节点。

## REA 与 Self-Harness 工具

- REA：用本地 MCP Server 与 CLI 将 Ghidra、Hopper、IDA 等工具接入 Coding Agent；按首个 npm 公共版本日期定位。REA 提供工具和证据，不等于恢复原始源码，也不保证模型解释正确。
- PenguinHarness：把多种 Agent 自我改进算法、评测、快照和 Harness 版本迭代放进统一开源框架；只描述模型外部 Harness 改进，不写成模型权重 RSI。

## 新增评测与工程基础设施

- T2J-Bench：用独立离线验证器检查整仓框架迁移的数值、梯度、优化轨迹和端到端行为等价性。
- CLASHarness：用可验证任务测试多 Agent 面对矛盾消息、共享权限、过期状态和视觉证据时的冲突解决能力。
- Anthropic Scion：Agent 产码规模反向推动版本控制、代码审查和 CI 重构；明确标注为内部系统，不写成公开产品。

## 来源策略补充

后续扫描增加 X 官方账号、机器之心、量子位、AI 科技评论、InfoQ、新智元、极客公园和 36 氪等发现层，用于发现发布、访谈与工程语境。发布日期、版本、开放状态、指标和正式命名仍回到官方公告、论文或官方仓库核验；找不到一手证据的帖子或报道不直接进入时间线。
