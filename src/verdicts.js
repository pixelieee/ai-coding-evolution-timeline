export const verdictTiers = [
  { id: "hammer", label: "夯", grade: "01", subtitle: "改了默认范式", description: "至少跨过三道门槛：形成新工作方式、跨生态扩散、经真实使用或独立研究验证。" },
  { id: "top", label: "顶级", grade: "02", subtitle: "关键跃迁", description: "有明确技术或产品增量，并出现大规模采用、标准化或可复现实验中的至少两项。" },
  { id: "solid", label: "人上人", grade: "03", subtitle: "硬价值成立", description: "解决了真问题，也有公开结果；行业外溢或长期影响还不够大。" },
  { id: "watch", label: "NPC", grade: "04", subtitle: "证据还没追上", description: "近期发布、研究原型或主要只有厂商数据；方向可看，暂不提前封神。" },
  { id: "drag", label: "拉完了", grade: "05", subtitle: "承诺没有留下来", description: "必须有明确退场、并入其他产品或被替代的公开记录；不靠个人好恶判低。" },
];

const source = (label, url) => ({ label, url });

// 评级依据核查于 2026-11-03。节点本身的发布日期与首发来源仍以详情抽屉为准。
export const verdicts = [
  {
    nodeId: "node-001", tier: "hammer",
    review: "把 AI 补全变成开发者日常入口，后续 Agent 产品都建立在这次习惯迁移上。",
    evidence: "GitHub 2025 年披露：约 80% 的新开发者在加入 GitHub 第一周使用 Copilot。",
    source: source("GitHub Octoverse 2025", "https://github.blog/news-insights/octoverse/octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1/"),
  },
  {
    nodeId: "node-007", tier: "hammer",
    review: "自然语言成为大众编程入口，代码解释、生成与调试第一次进入同一个消费级界面。",
    evidence: "OpenAI 在 DevDay 2025 披露 ChatGPT 周活超过 8 亿；影响规模远超开发者工具圈。",
    source: source("OpenAI DevDay 2025", "https://openai.com/devday/2025/"),
  },
  {
    nodeId: "node-052", tier: "hammer",
    review: "把终端、仓库、工具调用和长任务揉成一个产品，Coding Agent 成为独立工作方式。",
    evidence: "上线约六个月达到 10 亿美元年化收入；Anthropic 后续研究覆盖约 40 万次真实会话。",
    source: source("Anthropic · Claude Code $1B", "https://www.anthropic.com/news/anthropic-acquires-bun-as-claude-code-reaches-usd1b-milestone"),
  },
  {
    nodeId: "node-124", tier: "hammer",
    review: "开源推理模型与可验证 RL 同时落地，技术路线、价格和开放生态一起受到冲击。",
    evidence: "Nature 论文显示纯 RL 可诱导反思、验证与策略调整，并公开 R1、R1-Zero 和蒸馏模型。",
    source: source("Nature · DeepSeek-R1", "https://www.nature.com/articles/s41586-025-09422-z"),
  },
  {
    nodeId: "node-159", tier: "hammer",
    review: "代码评测从生成小函数推进到修真实仓库，训练目标和产品宣传口径都被它改写。",
    evidence: "OpenAI 将其用于模型自主性评估，并与作者共建 500 题人工核验版 SWE-bench Verified。",
    source: source("OpenAI · SWE-bench Verified", "https://openai.com/index/introducing-swe-bench-verified/"),
  },
  {
    nodeId: "node-161", tier: "hammer",
    review: "推理、行动、观察交替执行，至今仍是绝大多数工具型 Agent Loop 的基本结构。",
    evidence: "Google Research 原始实验中，ReAct 系统性优于仅推理或仅行动的对照方法。",
    source: source("Google Research · ReAct", "https://research.google/blog/react-synergizing-reasoning-and-acting-in-language-models/"),
  },
  {
    nodeId: "node-164", tier: "hammer",
    review: "工具接入有了跨模型、跨客户端的共同接口，生态扩散已超过单一厂商功能。",
    evidence: "Anthropic 披露 10,000+ 活跃公共服务器，并被 ChatGPT、Cursor、Gemini、Copilot、VS Code 等采用。",
    source: source("Anthropic · MCP 捐赠 AAIF", "https://www.anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation"),
  },

  {
    nodeId: "node-174", tier: "top",
    review: "GRPO 简化了推理模型的 RL 训练，并通过 R1 得到强结果验证；影响大，但它仍是训练组件。",
    evidence: "DeepSeek-R1 论文明确以 GRPO 训练 R1-Zero/R1，并说明其相对 PPO 的资源简化目标。",
    source: source("Nature · R1 中的 GRPO", "https://www.nature.com/articles/s41586-025-09422-z"),
  },
  {
    nodeId: "node-008", tier: "top",
    review: "AI IDE 被做成独立大市场；Cursor 的贡献是把模型能力转成低摩擦的工程工作流。",
    evidence: "Cursor 2025 年披露年化收入超过 10 亿美元、用户达数百万，Agent 使用量一年增长 15 倍。",
    source: source("Cursor · Past, Present, and Future", "https://cursor.com/blog/series-d"),
  },
  {
    nodeId: "node-062", tier: "top",
    review: "开源终端 Agent 把竞争推进到 Harness 与执行层，并演化成跨开发和知识工作的产品线。",
    evidence: "OpenAI 2026 年披露 Codex 周活超过 500 万；Codex CLI 保持开源并持续承接产品能力。",
    source: source("OpenAI · Codex for knowledge work", "https://openai.com/index/codex-for-knowledge-work/"),
  },
  {
    nodeId: "node-092", tier: "top",
    review: "测试时推理正式产品化，复杂编码从立即生成推进到按任务投入额外推理计算。",
    evidence: "OpenAI 报告 o1 在 Codeforces 达 89 百分位，并在内部编码评测中比 GPT-4o 高 10 个百分点。",
    source: source("OpenAI · Learning to reason", "https://openai.com/index/learning-to-reason-with-llms/"),
  },
  {
    nodeId: "node-110", tier: "top",
    review: "这代 Sonnet 把真实仓库编辑推过可用线，并成为随后 Coding Agent 爆发的重要模型底座。",
    evidence: "新版 3.5 Sonnet 以通用工具在 SWE-bench Verified 达到 49%，高于当时 45% 的前 SOTA。",
    source: source("Anthropic · Claude SWE-bench", "https://www.anthropic.com/research/swe-bench-sonnet"),
  },
  {
    nodeId: "node-270", tier: "top",
    review: "把开源 Harness、可执行环境和软件工程研究接成持续迭代的平台。",
    evidence: "OpenHands 论文被 ICLR 2025 接收；项目 2026 年披露 8 万+ stars、900 万+ 下载。",
    source: source("ICLR 2025 · OpenHands", "https://openreview.net/pdf?id=OJd3ayDDoF"),
  },
  {
    nodeId: "node-271", tier: "top",
    review: "Computer Use 从截图演示进入跨操作系统、可重置、按最终状态评分的实验环境。",
    evidence: "OSWorld 入选 NeurIPS 2024 Datasets and Benchmarks Track，包含 369 个真实电脑任务。",
    source: source("NeurIPS 2024 · OSWorld", "https://papers.nips.cc/paper_files/paper/2024/hash/5d413e48f84dc61244b6be550f1cd8f5-Abstract-Datasets_and_Benchmarks_Track.html"),
  },
  {
    nodeId: "node-273", tier: "top",
    review: "程序性知识从反复塞 Prompt 变成可移植、可版本化、可按需加载的资产。",
    evidence: "Anthropic 2026 年披露 70+ Agent 平台接入、100 万 Skills、近 2.8 亿次安装，并捐赠 AAIF。",
    source: source("Anthropic · Agent Skills 捐赠 AAIF", "https://www.anthropic.com/news/donating-agent-skills-to-the-agentic-ai-foundation"),
  },
  {
    nodeId: "node-038", tier: "top",
    review: "模型可换、Harness 可改、终端优先的开源路线形成了足够大的独立生态。",
    evidence: "OpenCode 官方站点披露 22 万+ GitHub stars、950 位贡献者、月度使用开发者超过 1600 万。",
    source: source("OpenCode · 官方站点", "https://opencode.ai/"),
  },
  {
    nodeId: "node-262", tier: "top",
    review: "Agent 互操作从厂商提案推进到有生产部署的开放协议，标准化证据已经成立。",
    evidence: "Linux Foundation 2026 年披露 150+ 组织支持、三大云集成、5 种生产级 SDK 和实际生产部署。",
    source: source("Linux Foundation · A2A 一周年", "https://www.linuxfoundation.org/press/a2a-protocol-surpasses-150-organizations-lands-in-major-cloud-platforms-and-sees-enterprise-production-use-in-first-year"),
  },

  {
    nodeId: "node-130", tier: "solid",
    review: "开源代码模型的完整尺寸梯度和修复能力很实用，但没有单独改变 Agent 产品形态。",
    evidence: "技术报告覆盖生成、补全、推理与修复；32B 版本在官方多语言修复评测中领先同期开放模型。",
    source: source("Qwen2.5-Coder Technical Report", "https://arxiv.org/abs/2409.12186"),
  },
  {
    nodeId: "node-139", tier: "solid",
    review: "开放权重、混合推理和 Agent 评测放在同一模型里，工程价值明确，历史外溢仍待时间验证。",
    evidence: "技术报告公开 355B-A32B MoE，并报告 TAU-Bench 70.1%、SWE-bench Verified 64.2%。",
    source: source("GLM-4.5 Technical Report", "https://arxiv.org/abs/2508.06471"),
  },
  {
    nodeId: "node-155", tier: "solid",
    review: "推理、长上下文和代码能力都强，是高质量底座；新增机制和行业外溢弱于 S/A 档。",
    evidence: "Google 模型卡给出 LiveCodeBench 与 SWE-bench Verified；发布时自报后者 63.8%。",
    source: source("Google · Gemini 2.5", "https://blog.google/innovation-and-ai/models-and-research/google-deepmind/gemini-model-thinking-updates-march-2025/"),
  },
  {
    nodeId: "node-269", tier: "solid",
    review: "一个朴素文件解决仓库级指令反复丢失的问题，技术简单，跨工具价值明确。",
    evidence: "AGENTS.md 与 MCP、goose 一起成为 AAIF 首批项目，由 OpenAI 捐赠并进入中立治理。",
    source: source("OpenAI · AGENTS.md 捐赠 AAIF", "https://openai.com/index/agentic-ai-foundation/"),
  },
  {
    nodeId: "node-279", tier: "solid",
    review: "把推理状态、工具和多模态输出收进统一 API，减少自建 Agent Loop 的胶水代码。",
    evidence: "OpenAI 报告保留推理状态使 TAU-bench 提升 5%，缓存利用率比 Chat Completions 高 40–80%。",
    source: source("OpenAI Developers · Responses API", "https://developers.openai.com/blog/responses-api"),
  },

  {
    nodeId: "node-188", tier: "watch",
    review: "让 Agent 改自己的 Harness 很有潜力；现有证据仍以论文实验为主，离生产闭环有距离。",
    evidence: "当前公开证据主要是预印本与配套代码，缺少跨团队复现和长期回归数据。",
    source: source("Self-Harness 论文", "https://arxiv.org/abs/2606.09498"),
  },
  {
    nodeId: "node-190", tier: "watch",
    review: "自我改写代码已经出现可信信号，通用、持续和安全的自我进化还没有被证明。",
    evidence: "Darwin Gödel Machine 展示了可验证任务上的自我改写；结论仍受任务范围与评测环境约束。",
    source: source("Darwin Gödel Machine 论文", "https://arxiv.org/abs/2505.22954"),
  },
  {
    nodeId: "node-278", tier: "watch",
    review: "Harness 与 Policy 联合优化是合理方向，目前仍是研究方法，不是成熟工程配方。",
    evidence: "目前依据为 2026-10 预印本，尚缺长期训练稳定性、跨模型复现与生产部署证据。",
    source: source("Self-HPO 论文", "https://arxiv.org/abs/2610.22791"),
  },
  {
    nodeId: "node-243", tier: "watch",
    review: "把生成模型改成低延迟决策接口很新鲜；底层架构和主要结论仍依赖厂商披露。",
    evidence: "TypeSafe 将 Jev 标为早期访问；已有独立评测论文，但生态采用和长期可靠性数据仍少。",
    source: source("TypeSafe · Introducing Jev", "https://typesafe.ai/blog/introducing-system-one-models-and-jev"),
  },
  {
    nodeId: "node-244", tier: "watch",
    review: "Router、Worker 与异步状态解耦的方向合理；当前是研究原型，不能按成熟产品评级。",
    evidence: "DeepSeek 官方仓库明确将 dsh-superagent 标为 prototype，部分架构设计尚未进入公开实现。",
    source: source("DeepSeek · dsh-superagent prototype", "https://github.com/deepseek-ai/dsh-superagent-prototype"),
  },
  {
    nodeId: "node-248", tier: "watch",
    review: "逆向工程切口够硬，也保留证据链；是否能扩散成通用 Agent 能力还没有采用数据。",
    evidence: "当前主要证据是开源仓库、npm 发行和工具集成，缺少独立效果评测与规模使用数据。",
    source: source("REA · 官方仓库", "https://github.com/morluto/rea"),
  },
  {
    nodeId: "node-253", tier: "watch",
    review: "持久云电脑加审批回路是 Work Agent 的合理形态，长期可靠性和成本尚未公开验证。",
    evidence: "目前证据主要来自 xAI 的 Beta 发布与官方文档，尚无足够独立生产数据。",
    source: source("xAI · Introducing Grok Bot", "https://x.ai/news/introducing-grok-bot"),
  },

  {
    nodeId: "node-009", tier: "drag",
    review: "它很早提出从 Issue 到 PR，但独立产品没有延续；历史价值留在思路，不在产品。",
    evidence: "GitHub Next 明确记录 Copilot Workspace 技术预览于 2025-05-30 终止。",
    source: source("GitHub Next · Copilot Workspace", "https://githubnext.com/projects/copilot-workspace/"),
  },
  {
    nodeId: "node-074", tier: "drag",
    review: "Operator 是浏览器 Agent 的过渡样机；核心能力被吸收，独立产品形态很快结束。",
    evidence: "OpenAI 2025-07 明确把 Operator 并入 ChatGPT agent，并关闭独立站点。",
    source: source("OpenAI · Operator", "https://openai.com/index/introducing-operator/"),
  },
];

export function getVerdictTier(id) {
  return verdictTiers.find((tier) => tier.id === id);
}
