export const verdictTiers = [
  { id: "hammer", label: "夯", grade: "01", subtitle: "改了默认范式", description: "它让行业换了一种做事方式，并被多个生态沿用。" },
  { id: "top", label: "顶级", grade: "02", subtitle: "关键跃迁", description: "技术或产品向前推了一大步，采用规模和后续影响都站得住。" },
  { id: "solid", label: "人上人", grade: "03", subtitle: "硬价值成立", description: "解决了真问题，公开结果扎实，影响集中在特定领域。" },
  { id: "watch", label: "NPC", grade: "04", subtitle: "还在观察", description: "想法值得看，证据还少：发布太新，或目前只有论文和厂商数据。" },
  { id: "drag", label: "拉完了", grade: "05", subtitle: "没有留下来", description: "产品已经退场、并入其他产品，或被后来的路线替代。" },
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
    review: "推理、行动、观察交替执行，今天的大多数工具型 Agent Loop 仍沿用这套结构。",
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
    review: "GRPO 降低推理模型的 RL 训练成本，R1 用强结果证明这条路线可行。",
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
    nodeId: "node-201", tier: "top",
    review: "把复杂推理、软件工程和电脑操作收进同一旗舰模型，通用 Agent 不再依赖多模型接力。",
    evidence: "OpenAI 将 Astra 定位为最强模型，官方用途覆盖复杂推理、编码、computer use、研究和文档生成。",
    source: source("OpenAI · GPT-6 Astra", "https://developers.openai.com/api/docs/models/gpt-6-astra"),
  },
  {
    nodeId: "node-226", tier: "top",
    review: "Agentic Coding 质量不降，运行步数、时间和 token 减半，旗舰模型的经济性出现实质跃迁。",
    evidence: "Anthropic 报告 Opus 5.5 在内部 Agentic Coding 任务上匹配 Opus 5，成本降低 40–50%。",
    source: source("Anthropic · Claude Opus 5.5", "https://www.anthropic.com/claude-opus-5-5"),
  },

  {
    nodeId: "node-130", tier: "solid",
    review: "完整尺寸梯度和代码修复能力很实用，主要影响开放代码模型生态。",
    evidence: "技术报告覆盖生成、补全、推理与修复；32B 版本在官方多语言修复评测中领先同期开放模型。",
    source: source("Qwen2.5-Coder Technical Report", "https://arxiv.org/abs/2409.12186"),
  },
  {
    nodeId: "node-139", tier: "solid",
    review: "开放权重、混合推理和 Agent 评测集成在同一模型，工程价值明确。",
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
    nodeId: "node-216", tier: "solid",
    review: "把 Agent 从提交 PR 延伸到上线后的安全检查、指标观察和回滚建议，补上开发链路的最后一段。",
    evidence: "Cursor 已向 Teams 与 Enterprise 开放 Rollouts 和 Security Review，并接入日志、指标和调用链。",
    source: source("Cursor · Rollouts and Security Review", "https://cursor.com/changelog/rollouts-and-security-reviewer"),
  },
  {
    nodeId: "node-222", tier: "solid",
    review: "自然语言工作流编译成标准 GitHub Actions，在现有权限、Runner 和审计体系里运行 Agent。",
    evidence: "GitHub 于 2026-10-28 正式发布；默认只读、沙盒运行，并经过 Agent Workflow Firewall。",
    source: source("GitHub · Agentic Workflows GA", "https://github.blog/changelog/2026-10-28-github-agentic-workflows-generally-available/"),
  },
  {
    nodeId: "node-224", tier: "solid",
    review: "原生视觉、代码和工具调用进入同一开放模型，V4 Flash 实验线收束为可用版本。",
    evidence: "DeepSeek 官方在 2026-09-10 用 V4.1 Flash 替代旧 V4 Flash 与视觉实验模型。",
    source: source("DeepSeek · V4.1 Flash", "https://api-docs.deepseek.com/updates/#date-2026-09-10"),
  },
  {
    nodeId: "node-235", tier: "solid",
    review: "模型开始优化承载自己的推理基础设施，工业自我改进第一次有了完整生产案例。",
    evidence: "Z.ai 报告 GLM-5.3 Infra Agent 在两周内把端到端吞吐提升到初始基线的 3 倍。",
    source: source("Z.ai · GLM Infra Agent", "https://z.ai/blog/glm-built-its-inference-infrastructure"),
  },
  {
    nodeId: "node-258", tier: "solid",
    review: "把模型实验从小时级自动化推到数天、数周的持续运行，Agent 真正进入生产 ML 工程。",
    evidence: "Meta 报告首轮内部部署由 3 名工程师推进 8 个模型提案，工程产出约为既往流程的 5 倍。",
    source: source("Meta Engineering · Ranking Engineer Agent", "https://engineering.fb.com/2026/03/17/ml-applications/ranking-engineer-agent-rea-autonomous-ai-system-accelerating-meta-ads-ranking-innovation/"),
  },

  {
    nodeId: "node-188", tier: "watch",
    review: "Agent 已能改自己的 Harness，研究已跑通；跨团队复现、长期回归和生产运行仍为空白。",
    evidence: "公开材料包括预印本和配套代码，实验范围集中在作者设定的任务与评测。",
    source: source("Self-Harness 论文", "https://arxiv.org/abs/2606.09498"),
  },
  {
    nodeId: "node-190", tier: "watch",
    review: "可验证任务上的自我改写已跑通，通用性、持续性和安全性仍待更大规模实验。",
    evidence: "Darwin Gödel Machine 的实验范围和评测环境固定，尚无长期开放运行记录。",
    source: source("Darwin Gödel Machine 论文", "https://arxiv.org/abs/2505.22954"),
  },
  {
    nodeId: "node-278", tier: "watch",
    review: "Harness 与 Policy 交替优化，避免两层各自变强却彼此失配；证据仍限于研究环境。",
    evidence: "2026-10 预印本覆盖有限模型和三类 Coding benchmark，未报告开放环境长期运行。",
    source: source("Self-HPO 论文", "https://arxiv.org/abs/2610.22791"),
  },
  {
    nodeId: "node-243", tier: "watch",
    review: "直接输出类型化选择、分数和概率，适合低延迟软件决策；产品仍处早期。",
    evidence: "TypeSafe 将 Jev 标为早期访问，架构与训练细节未公开，独立复现有限。",
    source: source("TypeSafe · Introducing Jev", "https://typesafe.ai/blog/introducing-system-one-models-and-jev"),
  },
  {
    nodeId: "node-248", tier: "watch",
    review: "把逆向工具接入 Coding Agent，证据可回看；影响目前集中在工具集成。",
    evidence: "公开证据包括开源仓库、npm 发行和工具集成，尚无规模使用与独立效果评测。",
    source: source("REA · 官方仓库", "https://github.com/morluto/rea"),
  },
  {
    nodeId: "node-253", tier: "watch",
    review: "持久云电脑加审批回路抓住了 Work Agent 的产品形态，Beta 阶段仍需验证长期运行。",
    evidence: "公开证据来自 xAI 的 Beta 发布与官方文档，独立生产数据尚少。",
    source: source("xAI · Introducing Grok Bot", "https://x.ai/news/introducing-grok-bot"),
  },
  {
    nodeId: "node-194", tier: "watch",
    review: "PR、Slack 和定时任务可以持续唤起云端 Agent，产品形态从一次性委派走向后台运行。",
    evidence: "Cursor 已发布独立 VM、子代理和持续触发机制；长期成功率与成本数据尚未公开。",
    source: source("Cursor · Cloud Agents", "https://cursor.com/changelog/08-19-26"),
  },
  {
    nodeId: "node-213", tier: "watch",
    review: "Codex 的会话、压缩、恢复和执行 Harness 变成托管 API，开发者可直接嵌入自己的产品。",
    evidence: "OpenAI 于 2026-09-10 开放公开测试；平台采用、迁移成本和长期稳定性仍需观察。",
    source: source("OpenAI · Agents API", "https://openai.com/index/introducing-the-agents-api/"),
  },
  {
    nodeId: "node-218", tier: "watch",
    review: "模型与官方 Harness 开始共同调优，长程编码、网页搜索和工具调用进入同一发行节奏。",
    evidence: "官方仓库已发布 0.2.1 RC，版本仍处候选阶段，安装与升级问题持续修复。",
    source: source("DeepSeek Harness · Releases", "https://github.com/deepseek-ai/deepseek-harness/releases"),
  },
  {
    nodeId: "node-236", tier: "watch",
    review: "研究 Agent 连续改写自己的代码并跨任务迁移，递归改进从概念走到可运行实验。",
    evidence: "论文报告 8 天运行与 7 次连续改进；结论来自单一研究系统和隐藏评测。",
    source: source("AIDE² 论文", "https://arxiv.org/abs/2609.26457"),
  },
  {
    nodeId: "node-237", tier: "watch",
    review: "训练环境不再只是扩充题量，而是主动诊断空白、组织事件并生成下一轮更难任务。",
    evidence: "目前证据来自 2026-09 预印本，缺少跨团队复现和大规模训练收益。",
    source: source("Env-Rethink 论文", "https://arxiv.org/abs/2609.29773"),
  },
  {
    nodeId: "node-238", tier: "watch",
    review: "把训练、rollout、沙盒和评测统一成 RSI 实验底座，终于能比较不同自我改进方案。",
    evidence: "RSIGym 已给出完整研究框架；长期自主运行和真实生产负载数据尚未公布。",
    source: source("RSIGym 论文", "https://arxiv.org/abs/2610.10310"),
  },
  {
    nodeId: "node-240", tier: "watch",
    review: "当前任务临时改 Harness，长期系统再吸收有效经验，解决一次性自我改写无法积累的问题。",
    evidence: "Harness² 的结果来自论文设定的开放任务，跨模型、跨组织迁移仍待复现。",
    source: source("Harness² 论文", "https://arxiv.org/abs/2610.14224"),
  },
  {
    nodeId: "node-244", tier: "watch",
    review: "把 DeepSeek Harness 接入 GitHub 和飞书，为每个请求分配独立会话与工作目录，方向对但实现仍早。",
    evidence: "官方仓库标为 prototype；Router/Worker、事件驱动和 Watchdog 只完成了部分公开实现。",
    source: source("DeepSeek · dsh-superagent", "https://github.com/deepseek-ai/dsh-superagent-prototype"),
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
