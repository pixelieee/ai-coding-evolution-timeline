import nodes from "./nodes.json" with { type: "json" };
import editorialFacts from "./nodeEditorialFacts.json" with { type: "json" };
import { getNodeResearch, getPublishedDate } from "./nodeSources.js";

export const verdictTiers = [
  { id: "hammer", label: "夯", grade: "01", subtitle: "挑刺都得先服", description: "真的改了行业默认动作。想黑它，先解释为什么全行业都在抄。" },
  { id: "top", label: "顶级", grade: "02", subtitle: "强，但没到封神", description: "硬价值、真实采用、后续影响都够。缺点也够具体，不靠情怀洗。" },
  { id: "solid", label: "人上人", grade: "03", subtitle: "能打，也有短板", description: "解决了真问题，但适用面、成本或证据还撑不起更高一档。" },
  { id: "watch", label: "NPC", grade: "04", subtitle: "发布会先赢了", description: "想法有戏，现实欠账。论文分、官方 Demo 和社区热搜都不算毕业证。" },
  { id: "drag", label: "拉完了", grade: "05", subtitle: "点子留下，产品没了", description: "当年画得很大，活得很短；好点子被后来者捡走，名字留在考古区。" },
];

const source = (label, url) => ({ label, url });

// 硬事实核查于 2026-11-08；社区风向取自 HN、Reddit、X、知乎与可检索的小红书公开讨论。
// 社区样本用于判断体验与争议，不替代技术事实，也不把单条热帖当成总体民意。
const editorialVerdicts = [
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
    nodeId: "node-267", tier: "top",
    review: "它把 SWE-bench 修成行业通用尺子，但污染与坏测试最终让高分不再等于真实工程能力。",
    evidence: "OpenAI 2026 年审计发现：常见失败题的抽查样本中至少 59.4% 存在错误测试，且受测前沿模型均能复现部分标准答案或题面细节，因此停止报告该分数。",
    source: source("OpenAI · Why we no longer evaluate SWE-bench Verified", "https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/"),
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
    nodeId: "node-282", tier: "solid",
    review: "把研究、网站和办公文档放进同一执行环境，通用 Agent 的产品闭环已经成立。",
    evidence: "Kimi 官方文档列出网页、文档、表格、幻灯片和深度研究等完整交付能力，同时明确上下文与用量限制。",
    source: source("Kimi · Agent overview", "https://www.kimi.com/en/help/agent/agent-overview"),
  },
  {
    nodeId: "node-284", tier: "solid",
    review: "短信和电话成为 Agent 入口，现实世界任务第一次做到了足够低的交互门槛。",
    evidence: "公开测试者认为任务完成度超出预期；产品仍为邀请制，代操作账户与支付也引发集中隐私争议。",
    source: source("TechCrunch · Instinct early testing", "https://techcrunch.com/2026/08/24/instincts-powerful-ai-assistant-is-raising-privacy-and-security-concerns/"),
  },
  {
    nodeId: "node-285", tier: "solid",
    review: "Personal Agent 首次获得大众级分发，安全隔离、审批和撤销权限也被做成完整产品。",
    evidence: "Reuters 援引 Sensor Tower 称 Muse 上线两周下载超过 250 万；实际电话任务仍曾由人类外包协助完成。",
    source: source("Reuters · Muse adoption and concierge", "https://www.reuters.com/business/meta-testing-human-concierge-its-new-personal-ai-agent-muse-2026-09-22/"),
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
    nodeId: "node-283", tier: "watch",
    review: "Workspace 原生接入让它很适合个人事务，但高权限、Beta 稳定性和订阅门槛还没过关。",
    evidence: "Google 将 Spark 标为 Beta；官方安全说明要求监督任务并警告网页提示注入可能暴露连接应用中的信息。",
    source: source("Google · Gemini Spark", "https://blog.google/innovation-and-ai/products/gemini-app/next-evolution-gemini-app/"),
  },
  {
    nodeId: "node-286", tier: "watch",
    review: "Agent 有了邮箱、电话、钱包和电脑，数字身份设计完整；公开可靠性证据仍很薄。",
    evidence: "Cue 仍处 Early Access 和邀请制，公开样本主要来自首批体验者，尚无规模使用或长期任务数据。",
    source: source("Manus · Cue", "https://www.manus.im/uk/blog/introducing-manus-2-0"),
  },
  {
    nodeId: "node-287", tier: "watch",
    review: "常驻云电脑、插件和审批系统都齐了，但一个月的体验还证明不了它能长期当同事。",
    evidence: "OpenAI 已公开 Dots 的云电脑、4,000+ 插件与 Auto-review；独立实测仍出现确认循环、站点阻断和任务未完成。",
    source: source("OpenAI · Introducing dots", "https://openai.com/index/introducing-dots/"),
  },
  {
    nodeId: "node-288", tier: "watch",
    review: "共享线程抓住了家庭和朋友协作的真问题，主动性与临时应用的完成度还需要打磨。",
    evidence: "Wabi 2.0 于 2026-10-19 公开发布；现有独立反馈认可多人线程，同时指出过度主动和应用粗糙。",
    source: source("Wabi · official site", "https://wabi.ai/"),
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
  {
    nodeId: "node-289", tier: "drag",
    review: "Auto-GPT 把全自主 Agent 炒到全民围观，也把死循环、任务漂移和 API 烧钱完整演示了一遍。",
    evidence: "官方仓库目前将 2023 年的原始产品单列为 AutoGPT Classic，主项目已经转向可控工作流与多专家平台。",
    source: source("AutoGPT · official repository", "https://github.com/Significant-Gravitas/AutoGPT"),
  },
  {
    nodeId: "node-290", tier: "drag",
    review: "GPT-4.5 把预训练规模堆到极限，也把价格堆到没人敢常用；四个半月后 API 下线。",
    evidence: "GPT-4.5 Preview 的 API 定价为每百万输入 75 美元、输出 150 美元；OpenAI 于 2025-07-14 关闭模型并推荐 GPT-4.1。",
    source: source("OpenAI API · GPT-4.5 deprecation", "https://developers.openai.com/api/docs/deprecations"),
  },
];

const roastReviews = {
  "node-001": "把补全做成习惯，后来却被 Agent 抢了主角；祖师爷还在，C 位没了。",
  "node-007": "把写代码入口从 IDE 拽进聊天框；人人都能开工，也人人都能复制一段幻觉。",
  "node-052": "终端外壳看着寒酸，干活却把一票 AI IDE 打成花架子；真正的敌人是额度。",
  "node-124": "R1 最狠的不是分数，是把“推理模型必须闭源又昂贵”这层窗户纸捅破。",
  "node-159": "把评测从玩具函数搬进真实仓库，也顺手教会全行业围着同一套题刷榜。",
  "node-267": "它把脏题库修成行业通用尺子，最后却被训练数据和坏测试把尺子掰弯；历史地位顶级，今天的高分不再等于真会修仓库。",
  "node-161": "论文名字快被忘了，循环结构还在给今天的 Agent 当骨架。",
  "node-164": "协议本身没多神，厉害的是大家终于懒得各造一遍插头；上下文和攻击面也一起胖了。",
  "node-174": "省下 critic 不是魔法，R1 才是它出圈的扩音器；别把训练组件供成宗教。",
  "node-008": "把最好用的 AI IDE 做成最贵的 VS Code 皮肤之一；贵归贵，交互确实是行业作业答案。",
  "node-062": "干后端像施工队，做界面像批发卡片；活能干完，审美和上下文都要人盯。",
  "node-092": "第一次让模型肯花时间想，代价是你也得花时间等；很快又被后继者写进历史。",
  "node-110": "模型换代很多，真正让仓库级编码从能演示变成能上班的，3.5 算一次。",
  "node-270": "研究圈的万能试验台，工程圈的安装说明书；价值大，离开箱即用还远。",
  "node-271": "让 Computer Use 有了考场，没让它立刻毕业；榜单会涨，鼠标还是会点歪。",
  "node-273": "把 Prompt 文件夹做成可移植资产是对的；现在的技能商店比 npm 更缺质量门槛。",
  "node-038": "自由到模型、界面、Harness 都能换；也自由到 bug 和配置都得自己扛。",
  "node-262": "大厂终于统一了 Agent 怎么打招呼；多数单 Agent 项目暂时只需要闭嘴干活。",
  "node-201": "旗舰价、旗舰能力、旗舰争议：有人一眼抓出硬 bug，也有人用完继续抱紧旧 Sol。",
  "node-226": "终于把 Opus 的智商和账单拉回同一张桌；长任务放飞自我时，事故也更贵。",
  "node-130": "本地补全的老黄牛，便宜、能跑、尺寸齐；拿它硬碰最新 Agent 模型有点欺负老人。",
  "node-139": "榜单宣传很满，社区真正买账的是工具调用稳、价格低；偶尔过度设计也是真的。",
  "node-155": "一百万上下文像大仓库，找到货不等于会装车；读得多，改得好是两回事。",
  "node-269": "一个 Markdown 文件干掉半个“上下文平台”的 PPT；朴素到没法营销，实用到谁都得支持。",
  "node-279": "OpenAI 把自建 Agent 的胶水收回云端；省代码是真的，锁生态也是真的。",
  "node-216": "从写 PR 伸手到盯上线，产品闭环补齐了；真实回滚事故率没公开，先别吹自动运维。",
  "node-222": "把 YAML 地狱换成自然语言，不代表权限地狱消失；好用与否全看默认护栏。",
  "node-224": "便宜又全能的参数表很好看；真实项目里能否少返工，社区还没形成共识。",
  "node-235": "让模型优化自己的推理栈很硬；目前成绩单仍是自家老师批的。",
  "node-258": "三个人带 Agent 跑八个模型提案很猛；离开 Meta 的算力、数据和内网，复制难度同样很猛。",
  "node-282": "网页、PPT、研究一口气全接了，像个肯干的全能实习生；任务一长，重复、额度和售后也一起加班。",
  "node-284": "发条短信真能把杂事办了，魔法感不靠界面；代价是把邮箱、账号和支付交给一家还在邀请测试的公司。",
  "node-285": "上线两周冲到榜首很能打；安全 VM 做得再认真，也挡不住用户先问：我真要把邮箱和付款交给 Meta？",
  "node-188": "会改自己工具链，听着像 RSI；实验场里能涨分，生产里先别让它碰 main。",
  "node-190": "会自改代码的研究系统有了，能否连续进化还没有；达尔文还在试管里。",
  "node-278": "Harness 和 Policy 终于不再各练各的；目前更像漂亮的双人舞录像，没证明能巡演。",
  "node-243": "把“生成文本”换成“直接做选择”很聪明；架构不公开、用户不够多，先别急着封神。",
  "node-248": "逆向工程终于有了 Agent 外挂；仓库能跑，生态还没跑起来。",
  "node-253": "持久云电脑加审批很像 Work Agent 正解；Beta 的最大功能仍是让用户替它测稳定性。",
  "node-194": "后台常驻很香，账单和误操作也会常驻；持续运行从来不等于持续正确。",
  "node-213": "把 Codex Harness 装进 API 很顺手；公开测试阶段，最稳定的功能是以后会变。",
  "node-218": "模型和 Harness 联调比换皮 CLI 有诚意；RC 就是官方提前告诉你：别拿生产当小白鼠。",
  "node-236": "连续改自己七次很抓眼球；单一系统、隐藏评测，离递归进化还隔着一整个复现圈。",
  "node-237": "让环境自己出更难的题是正路；现在题目会长大，能力是否真长大还没证实。",
  "node-238": "RSI 终于有健身房了；有没有练出肌肉，等更多队伍进场再说。",
  "node-240": "一次性改 Harness 终于能沉淀；论文里叫长期记忆，生产里还得叫变更管理。",
  "node-244": "架构图已经像大系统，实现还写着 prototype；目前最完整的是野心。",
  "node-283": "背靠 Gmail、Drive 和 Calendar，起步就住进用户生活；Beta 的日常仍是权限给得多、结果偶尔没看懂要求。",
  "node-286": "邮箱、电话、钱包、电脑一套工牌发齐了；目前更像豪华入职仪式，稳定上班记录还没攒够。",
  "node-287": "云电脑、四千插件、24/7 都配齐了；发布一个月先别叫同事，最多算还在试用期的实习生。",
  "node-288": "别人做一人一个 Agent，Wabi 直接拉进家庭群；想法很聪明，太主动时也像那个没人问却一直安排日程的群友。",
  "node-009": "Issue 到 PR 的愿景没死，产品先死了；后来者把尸体上的好点子全捡走。",
  "node-074": "演示像未来，寿命像内测；最后证明浏览器 Agent 可以活，但没必要叫 Operator。",
  "node-289": "188k Star 证明声量，死循环和 API 账单证明它还不是产品；把 GPT-4 套进 while(true) 不叫自主。",
  "node-290": "规模拉满、价格拉满、寿命四个半月；它更像纯预训练扩张路线的讣告，不像一代产品。",
};

const communitySignals = {
  "node-001": "老用户仍爱补全和 IDE diff；重度 Agent 用户则大量转向 Claude Code、Codex。",
  "node-007": "入口无敌，工程闭环弱；社区更多把它当万能问答，而非主力 Coding Agent。",
  "node-052": "长任务和工具使用口碑极强；额度、grep 循环、终端门槛和版本波动同样高频。",
  "node-124": "便宜、开放获赞；真实编码泛化、循环输出、托管审查与过度炒作长期被质疑。",
  "node-159": "真实仓库方向获认可，但污染、坏题和 Harness 差异已经让榜单严重失真。",
  "node-267": "它曾是前沿 Coding 模型的默认成绩单；OpenAI 停报后，争议已从谁分高转向题目污染、测试有效性和 Harness 可比性。",
  "node-161": "社区几乎不再争论 ReAct 本身，反而说明它已经被吸收成 Agent 的默认结构。",
  "node-164": "共识接口得到认可；token 膨胀、工具过载、认证与远程服务器安全是最高频槽点。",
  "node-174": "研究圈认可资源简化；社媒常把 R1 的成功全部归功于 GRPO，属于明显过度归因。",
  "node-183": "可执行验证器驱动的算法搜索得到认可；它擅长目标可计算的问题，不等于通用研究 Agent。",
  "node-008": "最顺手的 IDE 和最难算清的账单同时成立；Auto 路由不透明也经常挨骂。",
  "node-021": "首发演示把“AI 软件工程师”推成行业目标；真实用户更在意长任务成功率、可监督性和最后 10% 的返工成本。",
  "node-029": "Git diff、自动提交和终端工作流口碑稳定；Python 安装、依赖隔离和模型费用是长期摩擦。",
  "node-062": "后端、调试和执行获赞；UI 审美、擅自补需求、频繁压缩和额度争议集中。",
  "node-092": "深题更强得到认可；慢、贵、偶尔超时，让 o1-mini 在日常编码里反而更常用。",
  "node-091": "编码能力的跃迁得到广泛认可；速度、幻觉和版本回归让它始终更像强力搭档，而非可放手的软件工程师。",
  "node-100": "长任务与代码审查能力获赞；等待时间、额度和偶发空转让生产力提升高度依赖任务类型。",
  "node-110": "2024 年社区普遍认为净生产力转正；冷门技术栈和长上下文下仍明显掉速。",
  "node-111": "扩展思考适合复杂调试；社区同时反复报告偷懒、擅自简化约束和无监督编码不稳。",
  "node-127": "训练效率和开放权重获得认可；社区对工具调用、量化部署与不同托管版本的实际差异更谨慎。",
  "node-149": "竞赛水平令人震撼；大规模采样和筛选成本、任务分布狭窄，使它离真实软件工程仍很远。",
  "node-270": "研究者爱它可改、可测；普通用户嫌部署和环境复杂，热度明显高于日常使用率。",
  "node-271": "研究界认可统一考场；使用者反复提醒，榜单成绩不能等同真实电脑可靠性。",
  "node-273": "可复用、按需加载很受欢迎；质量、权限和供应链安全仍没有成熟答案。",
  "node-038": "轻量、模型可换、无厂商锁定获赞；patch 展示、升级兼容和配置折腾是常见抱怨。",
  "node-262": "企业平台看好互操作；独立开发者普遍觉得过早、过重，当前多数项目用不上。",
  "node-201": "反馈明显撕裂：代码审查能抓硬 bug，也有人认为比 Sol 贵很多却没明显更强。",
  "node-226": "长任务、编排和效率获大量好评；过度设计、耗尽额度与危险命令也有真实案例。",
  "node-130": "本地补全口碑稳定；Agent 工具调用评价分化，更多被当作低成本执行模型。",
  "node-139": "Reddit 与知乎普遍夸工具调用和速度；复杂任务错误、过度设计仍被反复提到。",
  "node-155": "长上下文和前端任务获赞；复杂业务逻辑、指令遵循和读完却没改对仍常见。",
  "node-269": "社区几乎一致认可它简单、可移植；争议集中在不同工具的读取层级不一致。",
  "node-279": "开发者欢迎统一工具与状态；也担心抽象变化太快、迁移成本与平台锁定。",
  "node-216": "讨论多集中在发布功能，独立生产复盘很少；真实价值仍取决于告警和回滚质量。",
  "node-222": "开发者喜欢复用 Actions 基础设施；对自然语言权限边界和误触发保持警惕。",
  "node-224": "价格和开放路线吸睛；长任务返工率、工具稳定性与真实项目数据仍缺统一结论。",
  "node-235": "技术圈兴趣很高，外部复现很少；目前主要证据仍来自 Z.ai 自己的生产案例。",
  "node-258": "业界认可这是生产级 ML Agent 案例；同时普遍认为 Meta 内部条件难以复制。",
  "node-282": "早期用户夸它全能、交付物完整；长任务重复、套餐消耗、服务拥堵和复杂工程要手工补配置被频繁吐槽。",
  "node-284": "测试者普遍认可任务完成度超出预期；讨论迅速转向密码托管、数据用途和撤销权限，越好用越考验信任。",
  "node-285": "下载和商店评分很强，省事感也真实；幻觉、主动消息、数据训练与人工代打电话让信任问题追着热度一起涨。",
  "node-188": "研究圈关注度高于工程采用；大家最担心改崩、回滚和跨任务负迁移。",
  "node-190": "自我改进方向受关注；讨论焦点始终是固定评测会不会把系统带向刷分。",
  "node-278": "概念获得认可，复现讨论尚少；长期训练稳定性和跨模型收益仍是空白。",
  "node-243": "低延迟决策接口有新鲜感；社区样本太少，讨论仍围着厂商 Demo 打转。",
  "node-248": "逆向工程用户认可切口够硬；公开用户量和跨工具稳定性还不足以形成口碑。",
  "node-253": "持久云电脑和审批回路获关注；稳定性、价格和失控后的责任边界仍被追问。",
  "node-194": "后台 Agent 很诱人；开发者更担心长期账单、误操作和任务悄悄跑偏。",
  "node-213": "嵌入 Codex 能力很方便；公开测试的新鲜感大于成熟口碑，接口稳定性待观察。",
  "node-218": "DeepSeek 用户期待官方 Harness；RC 的安装、升级与长任务可靠性仍在快速修补。",
  "node-236": "论文话题性很强，独立复现尚未跟上；隐藏评测让社区难判断增益是否可迁移。",
  "node-237": "环境自动进化被认为方向正确；社区仍缺大规模训练和跨团队复现数据。",
  "node-238": "统一 RSI 实验底座得到研究者认可；真实长期运行案例尚未出现。",
  "node-240": "双层 Harness 记忆设计受关注；工程师最关心的版本、回滚和审计仍需补齐。",
  "node-244": "架构设想获得关注，官方自己也标为 prototype；社区共识是先等代码补完。",
  "node-283": "重度 Workspace 用户认可表格和日程自动化；日常体验仍会卡在浏览器控制、权限过宽、价格和结果不稳定。",
  "node-286": "首批用户认可多 Agent 分工的潜力；更多人还卡在邀请码、平台可用性和不知道它比 Manus 主站多做了什么。",
  "node-287": "后台研究和文档迭代已有好评；搜索打转、重复确认、购物站点阻断和高价订阅让它离常驻同事还有距离。",
  "node-288": "多人线程和临时界面获得好评；首批用户也直说它过度主动、应用粗糙，公开规模与长期留存尚未出现。",
  "node-009": "理念被后来的 coding agent 继承；用户对独立预览退场几乎没有留恋。",
  "node-074": "演示阶段热度高，真实使用抱怨慢、受限和脆；并入 ChatGPT agent 后讨论迅速退潮。",
  "node-289": "HN 和 Reddit 的高频反馈高度一致：概念震撼，真实任务却经常循环、跑偏、崩溃并持续消耗 API 费用。",
  "node-290": "HN 讨论几乎被定价淹没；细腻写作和对话有人认可，但开发者很难为微妙提升接受 30 倍级输入成本。",
};

const communitySources = {
  "node-001": [{ label: "HN", url: "https://news.ycombinator.com/item?id=42736737" }],
  "node-052": [
    { label: "HN", url: "https://news.ycombinator.com/item?id=44596472" },
    { label: "X", url: "https://x.com/i/trending/2037714899749736516" },
  ],
  "node-124": [
    { label: "HN", url: "https://news.ycombinator.com/item?id=42823568" },
    { label: "Reddit", url: "https://www.reddit.com/r/DeepSeek/comments/1it9p9v/" },
  ],
  "node-159": [{ label: "公开审计", url: "https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/" }],
  "node-267": [
    { label: "2024 首发", url: "https://openai.com/index/introducing-swe-bench-verified/" },
    { label: "2026 后续审计", url: "https://openai.com/index/separating-signal-from-noise-coding-evaluations/" },
  ],
  "node-164": [{ label: "HN", url: "https://news.ycombinator.com/item?id=49779329" }],
  "node-174": [{ label: "HN", url: "https://news.ycombinator.com/item?id=42823568" }],
  "node-008": [
    { label: "HN", url: "https://news.ycombinator.com/item?id=48554513" },
  ],
  "node-021": [
    { label: "HN 首发讨论", url: "https://news.ycombinator.com/item?id=39679787" },
    { label: "HN 后续讨论", url: "https://news.ycombinator.com/item?id=41607251" },
  ],
  "node-029": [{ label: "HN", url: "https://news.ycombinator.com/item?id=39995725" }],
  "node-062": [
    { label: "HN", url: "https://news.ycombinator.com/item?id=49805972" },
    { label: "知乎", url: "https://www.zhihu.com/question/2043976840717632219/answer/2059460801459662929" },
  ],
  "node-092": [{ label: "HN", url: "https://news.ycombinator.com/item?id=42010441" }],
  "node-091": [
    { label: "HN 能力讨论", url: "https://news.ycombinator.com/item?id=35160421" },
    { label: "HN 使用反馈", url: "https://news.ycombinator.com/item?id=36037559" },
  ],
  "node-100": [{ label: "HN", url: "https://news.ycombinator.com/item?id=45252301" }],
  "node-110": [{ label: "HN", url: "https://news.ycombinator.com/item?id=41337542" }],
  "node-111": [
    { label: "HN 使用反馈", url: "https://news.ycombinator.com/item?id=44063703" },
    { label: "HN 约束问题", url: "https://news.ycombinator.com/item?id=43888803" },
  ],
  "node-127": [{ label: "HN", url: "https://news.ycombinator.com/item?id=42517113" }],
  "node-149": [
    { label: "HN 首发讨论", url: "https://news.ycombinator.com/item?id=30179549" },
    { label: "HN 代码质量", url: "https://news.ycombinator.com/item?id=34020025" },
  ],
  "node-183": [
    { label: "HN", url: "https://news.ycombinator.com/item?id=43985489" },
    { label: "HN 开源复现", url: "https://news.ycombinator.com/item?id=44043625" },
  ],
  "node-038": [
    { label: "Reddit", url: "https://www.reddit.com/r/opencodeCLI/comments/1t5apre/im_loving_opencode/" },
    { label: "X", url: "https://x.com/i/trending/2009717178501661120" },
  ],
  "node-201": [
    { label: "HN", url: "https://news.ycombinator.com/item?id=49682013" },
    { label: "Reddit", url: "https://www.reddit.com/r/OpenAI/comments/1wc4kug/any_experience_with_gpt_6_astra_on_agentic_coding/" },
  ],
  "node-226": [
    { label: "HN", url: "https://news.ycombinator.com/item?id=49946567" },
    { label: "Reddit", url: "https://www.reddit.com/r/ClaudeCode/comments/1wurd3e/mmmkay_i_didnt_believe_others_at_first_but/" },
  ],
  "node-130": [{ label: "Reddit", url: "https://www.reddit.com/r/LocalLLaMA/comments/1mf8la7/qwen3coder_is_bad_at_tool_call_while_glm45_is/" }],
  "node-139": [
    { label: "Reddit", url: "https://www.reddit.com/r/LocalLLaMA/comments/1mfa9tj/anyone_tried_glm45_with_claude_code_or_other/" },
    { label: "知乎", url: "https://www.zhihu.com/question/1933282570436589214/answer/1933533271528039859" },
  ],
  "node-194": [{ label: "HN", url: "https://news.ycombinator.com/item?id=48554513" }],
  "node-282": [
    { label: "Reddit", url: "https://www.reddit.com/r/kimi/comments/1vqno3r/kimi_ai_from_amazing_to_below_average/" },
    { label: "Reddit", url: "https://www.reddit.com/r/kimi/comments/1tqvqik/buyer_beware_kimis_annual_membership_may_be_a_bad/" },
  ],
  "node-283": [
    { label: "Reddit", url: "https://www.reddit.com/r/GeminiAI/comments/1w316mw/my_initial_thoughts_on_gemini_spark_beta_after_a/" },
    { label: "WIRED", url: "https://www.wired.com/story/google-gemini-spark-ai-agent-hands-on/" },
  ],
  "node-284": [{ label: "TechCrunch", url: "https://techcrunch.com/2026/08/24/instincts-powerful-ai-assistant-is-raising-privacy-and-security-concerns/" }],
  "node-285": [
    { label: "WIRED", url: "https://www.wired.com/story/metas-muse-is-better-at-surveilling-than-helping-me/" },
    { label: "App Store", url: "https://apps.apple.com/us/app/muse-from-meta/id6760173601" },
  ],
  "node-286": [
    { label: "Reddit", url: "https://www.reddit.com/r/ManusOfficial/comments/1x2txme/cue_agents_by_manus_a_lot_of_potential/" },
    { label: "Reddit", url: "https://www.reddit.com/r/ManusOfficial/comments/1wtf4v6/whats_the_point_of_cue/" },
  ],
  "node-287": [
    { label: "The Verge", url: "https://www.theverge.com/ai-artificial-intelligence/1004096/openai-chatgpt-dots-hands-on-agent" },
    { label: "Reddit", url: "https://www.reddit.com/r/OpenAI/comments/1wu77gv/thoughts_on_dots/" },
  ],
  "node-288": [
    { label: "X", url: "https://x.com/nikunj/status/2112219327881761008" },
    { label: "TechCrunch", url: "https://techcrunch.com/2026/09/29/ai-powered-app-maker-wabi-pivots-to-a-messaging-experience/" },
  ],
  "node-289": [
    { label: "HN 首发讨论", url: "https://news.ycombinator.com/item?id=35413054" },
    { label: "HN 生产问题", url: "https://news.ycombinator.com/item?id=35562821" },
    { label: "Reddit", url: "https://www.reddit.com/r/OpenAI/comments/12jjjm3/has_anyone_used_autogpt_for_something_useful/" },
  ],
  "node-290": [
    { label: "HN", url: "https://news.ycombinator.com/item?id=43197872" },
    { label: "OpenAI 开发者社区", url: "https://community.openai.com/t/gpt-4-5-preview-model-will-be-removed-from-the-api-on-2025-07-14/1230050" },
  ],
};

const tierOverrides = Object.fromEntries([
  ...["node-289", "node-290"].map((id) => [id, "drag"]),
  ...[
    // 产品：已经公开落地，但尚不足以改变行业默认动作。
    "node-005", "node-006", "node-011", "node-012", "node-017", "node-018", "node-019", "node-020",
    "node-024", "node-025", "node-026", "node-027", "node-028", "node-032", "node-033", "node-034",
    "node-039", "node-040", "node-042", "node-043", "node-044", "node-045", "node-046", "node-048",
    "node-049", "node-051", "node-053", "node-054", "node-055", "node-056", "node-057", "node-058",
    "node-059", "node-060", "node-061", "node-063", "node-064", "node-065", "node-066", "node-067",
    "node-069", "node-070", "node-071", "node-072", "node-073", "node-077", "node-078", "node-080",
    "node-081", "node-082", "node-194", "node-197", "node-215", "node-216", "node-222", "node-248",
    "node-249", "node-251", "node-287", "node-288",
    // 模型：正式能力升级，影响明确，但不是新的技术范式。
    "node-086", "node-087", "node-088", "node-089", "node-090", "node-093", "node-095", "node-096",
    "node-098", "node-099", "node-101", "node-102", "node-106", "node-107", "node-108", "node-113",
    "node-114", "node-115", "node-116", "node-117", "node-118", "node-119", "node-120", "node-121",
    "node-128", "node-129", "node-132", "node-133", "node-135", "node-138", "node-140", "node-141",
    "node-142", "node-143", "node-144", "node-145", "node-146", "node-147", "node-148", "node-152",
    "node-153", "node-202", "node-203", "node-204", "node-205", "node-207", "node-208", "node-209",
    "node-210", "node-224", "node-225", "node-227", "node-228", "node-229", "node-230", "node-231",
    "node-232", "node-233", "node-250", "node-254", "node-255",
    // 技术：已有公开实现、复现或工程采用，但长期外溢仍需观察。
    "node-162", "node-168", "node-170", "node-171", "node-172", "node-173", "node-176", "node-177",
    "node-178", "node-180", "node-181", "node-182", "node-184", "node-185", "node-189", "node-191",
    "node-211", "node-239", "node-246", "node-263", "node-264", "node-268", "node-272", "node-280",
    "node-281",
  ].map((id) => [id, "solid"]),
  ...[
    // 公开影响已经越过单次版本更新，形成新产品或技术路线。
    "node-068", "node-075", "node-076", "node-079", "node-083", "node-094", "node-105", "node-112",
    "node-131", "node-136", "node-137", "node-156", "node-169", "node-175", "node-188", "node-190",
    "node-235", "node-257", "node-258", "node-259", "node-260", "node-266", "node-269", "node-274",
    "node-275", "node-279",
  ].map((id) => [id, "top"]),
]);

const curatedVerdicts = editorialVerdicts.map((entry) => ({
  ...entry,
  tier: tierOverrides[entry.nodeId] || entry.tier,
  review: roastReviews[entry.nodeId] || entry.review,
  community: communitySignals[entry.nodeId] || "社区讨论样本不足，暂不把发布热度当成真实采用。",
  communitySources: communitySources[entry.nodeId] || [],
}));

const landmarkPatterns = [
  /^GPT-4$/, /^GPT-5-Codex$/, /^DeepSeek V3$/, /^Claude 3\.7 Sonnet$/,
  /^AlphaCode$/, /^InCoder \/ FIM$/, /^RepoCoder$/, /^CodeAct$/,
  /^Reflexion$/, /^Function Calling$/, /^SWE-agent \/ ACI$/, /^PRM$/,
  /^STaR$/, /^AlphaEvolve$/, /^Aider$/, /^Devin$/,
];

const earlyStagePattern = /预览|preview|beta|候选|实验|早期|prototype|research|内测|邀请|预印本/i;
const retiredPattern = /终止|停止服务|关闭|退场|不再推荐/i;
const matureStagePattern = /正式|GA|公开发布|正式开放|开源发布|开放协议|开放标准|工业案例|生产系统|内部生产|功能发布|模型发布/i;

function getCompleteTier(node) {
  const status = node.status || "";
  if (retiredPattern.test(status)) return "drag";
  if (landmarkPatterns.some((pattern) => pattern.test(node.title))) return "top";
  if (earlyStagePattern.test(`${status} ${node.title}`)) return "watch";
  if (node.section === "tech") return "watch";
  if (matureStagePattern.test(status)) return "solid";
  if (Number(getPublishedDate(node).slice(0, 4)) <= 2024) return "solid";
  return "watch";
}

function getCompleteReview(node) {
  return editorialFacts[node.id]?.summary || node.summary;
}

function getCompleteEvidence(node) {
  const fact = editorialFacts[node.id];
  return fact?.detail || fact?.summary || node.detail || node.summary;
}

function getCompleteCommunity() {
  return "尚未找到足够的 HN、Reddit、X、知乎或小红书公开样本，暂不判断社区口碑。";
}

function makeCompleteVerdict(node) {
  const research = getNodeResearch(node);
  const sourceLabel = research.label.length >= 5 ? research.label : `${research.label} · 来源`;
  return {
    nodeId: node.id,
    tier: tierOverrides[node.id] || getCompleteTier(node),
    review: getCompleteReview(node),
    evidence: getCompleteEvidence(node),
    community: communitySignals[node.id] || getCompleteCommunity(node),
    source: source(sourceLabel, research.url),
    communitySources: communitySources[node.id] || [],
  };
}

const curatedById = new Map(curatedVerdicts.map((entry) => [entry.nodeId, entry]));

export const verdicts = nodes.map((node) => curatedById.get(node.id) || makeCompleteVerdict(node));

export function getVerdictTier(id) {
  return verdictTiers.find((tier) => tier.id === id);
}
