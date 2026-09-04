import nodes from "./nodes.json";
import { getPublishedDate } from "./nodeSources.js";
export { BrandMark, getBrandName } from "./brandAssets.jsx";

export const developmentStages = [
  { id: "generate", number: "01", label: "生成与对话", short: "生成" },
  { id: "reason", number: "02", label: "推理与上下文", short: "推理" },
  { id: "tool", number: "03", label: "工具型 Agent", short: "工具" },
  { id: "orchestrate", number: "04", label: "协作型 Agent", short: "协作" },
];

const stageBySourceNumber = new Map(developmentStages.map((stage) => [stage.number, stage]));

const sectionStageCopy = {
  products: [
    ["代码补全与问答", "补全", "补全代码，或通过对话解释、生成代码。"],
    ["多文件编辑与应用生成", "编辑", "理解项目中的多个文件，批量修改代码，或根据需求生成应用。"],
    ["编码与任务执行", "执行", "调用编辑器、终端或浏览器，连续完成编码和其他任务。"],
    ["Agent 工作台", "工作台", "在同一工作空间管理多个任务、会话和 Agent。"],
  ],
  models: [
    ["代码生成与对话", "生成", "根据输入生成代码、解释内容或回答问题。"],
    ["推理与长上下文", "推理", "处理多步骤问题，并理解较长的代码或文档。"],
    ["编程与工具调用", "工具", "强化编程能力，并通过工具接口执行操作。"],
    ["复杂任务与持续执行", "复杂任务", "支持需要多轮规划、工具操作和检查的复杂任务；不是一种独立的模型架构。"],
  ],
  tech: [
    ["代码生成与评测", "生成与评测", "代码生成、仓库检索，以及检验代码是否正确的测试与评测。"],
    ["推理与纠错", "推理与纠错", "通过推理步骤、反馈或奖励，提高解题与纠错能力。"],
    ["工具调用与任务训练", "工具与训练", "包括 MCP 等工具协议，以及软件任务环境和 Agent 训练框架；工具协议本身不是训练方法。"],
    ["自动改进", "自动改进", "根据执行结果自动调整提示词、技能、上下文或程序。"],
  ],
};

const sectionStages = Object.fromEntries(Object.entries(sectionStageCopy).map(([section, copy]) => [
  section, developmentStages.map((stage, index) => ({ ...stage, label: copy[index][0], short: copy[index][1], description: copy[index][2] })),
]));

export function getDevelopmentStages(section = "all") {
  return sectionStages[section] || developmentStages;
}

export function getDevelopmentStage(node) {
  const stage = classifyDevelopmentStage(node);
  return getDevelopmentStages(node.section).find((item) => item.id === stage.id) || stage;
}

function classifyDevelopmentStage(node) {
  const explicitStage = developmentStages.find((stage) => stage.id === node.developmentStage);
  if (explicitStage) return explicitStage;
  const sourceNumber = node.stage.match(/^\d+/)?.[0] || "03";
  const sourceStage = stageBySourceNumber.get(sourceNumber) || stageBySourceNumber.get("03");

  if (node.section === "models") {
    if (/gpt-3\.5|^gpt-4$|claude 2(?:\.1)?|^claude 3$|^codex$|alphacode|code llama|deepseek-coder$/i.test(node.title)) return stageBySourceNumber.get("01");
    if (/gpt-4o|o1-preview|o3-mini|deepseek r1|deepseek v3$|kimi k1\.5|gemini 1\.5|gemini 2\.0/i.test(node.title)) return stageBySourceNumber.get("02");
    if (/gpt-5\.[456](?!-codex)|claude (?:sonnet 5|opus 4\.[678]|opus 5|fable|mythos)|deepseek v4|kimi k2\.5|kimi k3|glm-5(?:\.|$)|gemini 3\.5|qwen3\.8/i.test(node.title)) return stageBySourceNumber.get("04");
    return stageBySourceNumber.get("03");
  }

  if (node.section === "products") {
    if (/agent swarm|agent teams|ultraplan|multi-agent|codex platform|chatgpt work|claude cowork|kimi work|workbuddy|devin desktop|kiro web|replit agent 4|codex remote|codex \+ chatgpt/i.test(node.title)) return stageBySourceNumber.get("04");
    if (/agent mode|coding agent|cursor agent|claude code|codex|jules|gemini cli|antigravity|operator|manus|deep research|chatgpt agent|openclaw|hermes agent|harness|sdk|qoder|amp|open ?code|pi coding|qwen code|kimi cli|kimi code|zcode|trae|codebuddy/i.test(node.title)) return stageBySourceNumber.get("03");
    return sourceStage;
  }

  if (/react|reflexion|prm|grpo|r1 \/ r1-zero|star|self-rewarding/i.test(node.title)) return stageBySourceNumber.get("02");
  if (/mcp|function calling|swe-agent|codeact|context engineering|swe-gym|swe-smith|agent lightning|agent-rlvr/i.test(node.title)) return stageBySourceNumber.get("03");
  if (/voyager|promptbreeder|^stop$|^adas$|envfactory|swe-universe|alphaevolve|ace|mce|meta-harness|continual harness|self-harness|dgm|ahe|sia/i.test(node.title)) return stageBySourceNumber.get("04");
  return sourceStage;
}

const sourceBriefs = new Map([
  ["node-001", "把代码补全作为编辑器中的实时协作层，让模型首次进入开发者的日常输入循环。"],
  ["node-002", "将 Copilot 从补全扩展到 Chat、Pull Request 与文档协作，开始覆盖完整开发流程。"],
  ["node-003", "以 GPT-4 驱动对话式编程，把解释、生成和修改代码直接带入 IDE。"],
  ["node-004", "引入多文件生成式编辑，让 Cursor 从局部补全升级为跨文件任务执行。"],
  ["node-005", "把补全、终端调用与自动修复串成 Agent Mode，开始闭环完成工程任务。"],
  ["node-006", "以 Multi-Agent、worktree 与远程隔离并行处理任务，扩大编辑器代理的执行半径。"],
  ["node-007", "对话式编程窗口让自然语言成为代码解释、生成与调试的统一入口。"],
  ["node-008", "AI 原生编辑器把仓库上下文、生成与修改整合在同一个编码界面。"],
  ["node-009", "从 Issue 自动形成计划并提交代码修改，验证仓库级异步工程代理。"],
  ["node-010", "将自动执行推进到终端层，使编辑器能够运行命令、观察结果并继续修改。"],
  ["node-011", "公开预览 coding agent，把 GitHub 中的任务交给可持续执行的软件代理。"],
  ["node-012", "把 GitHub Copilot 的代理能力带入 CLI，使仓库操作和审阅进入终端工作流。"],
  ["node-013", "以声明式 UI 和 prompt-to-app 交互，把文字需求直接转化为可编辑界面。"],
  ["node-014", "将构建器能力连接 IDE 与 AWS 迁移路径，使生成结果更接近真实云端工程。"],
  ["node-015", "借助 WebContainers 在浏览器中安装依赖、运行后端并即时预览全栈应用。"],
  ["node-016", "用自然语言完成应用构建、编辑与发布，降低从原型到可用产品的距离。"],
  ["node-017", "长构建能力与托管环境结合，让 Agent 可以持续完成更复杂的应用任务。"],
  ["node-018", "以 Specs 与 Hooks 固化意图和约束，把一次性生成变成可控的软件开发流程。"],
  ["node-019", "Linux Desktop 与自测能力让 Devin 在独立环境中完成更长链路的工程工作。"],
  ["node-020", "将 Kiro 的规范驱动体验扩展到异步云端任务，支持持续执行与回看。"],
  ["node-052", "初始公开预览聚焦读、改、测、提交，让终端代理形成最小可用闭环。"],
  ["node-053", "Desktop 与本地、远程会话打通，使 Claude Code 从终端工具进入持续工作空间。"],
  ["node-054", "Auto Mode 与 Computer Use 扩大执行权限，让代理能够跨工具完成任务。"],
  ["node-055", "Ultrareview 让多个 Agent 并行审查复杂变更，强化高风险代码的验证层。"],
  ["node-056", "Dynamic Workflows 将编排能力交给 Agent，使流程能够随任务动态调整。"],
  ["node-057", "终端、IDE 与 SDK 正式统一，把 Claude Code 变成可嵌入的平台能力。"],
  ["node-058", "Agent Teams 让多个专职代理并行协作，处理跨模块和长周期任务。"],
  ["node-059", "Ultraplan 引入云端规划、审查与执行分离，提升复杂任务的可控性。"],
  ["node-060", "Agent View 提供可观察、可接管的多会话界面，增强人机协作。"],
  ["node-061", "跨会话通信与并行规划形成更完整的团队式软件工程运行层。"],
  ["node-062", "Shell、patch 与 approval 组成可审计的本地执行循环，是 Codex 终端形态的起点。"],
  ["node-063", "以 Cloud VM 异步处理仓库任务，让开发者把工程工作交给远程代理。"],
  ["node-064", "统一 IDE、CLI 与 Web 会话，使同一任务可以在多个入口间连续推进。"],
  ["node-065", "以 Skills、Automations 和 Agent 机制扩展桌面工作台，形成可组合的执行环境。"],
  ["node-066", "手机接管 Mac 与 Windows 会话，让远程监督进入真实开发流程。"],
  ["node-067", "把账户、聊天与项目状态连接起来，使 ChatGPT 成为 Codex 的协作入口。"],
  ["node-068", "沙盒并行任务与 PR 交付让 Codex 在云端完成多个隔离的仓库工作。"],
  ["node-069", "把 Gemini 的代理能力接入本地终端，覆盖解释、修改、运行和验证。"],
  ["node-070", "将编辑器、终端与浏览器统一为一个 Google Agent Harness。"],
  ["node-071", "Windows 原生体验与插件扩展补齐跨平台开发者工作流。"],
  ["node-072", "统一 Google Agent Harness 的命令行入口，便于自动化与远程调用。"],
  ["node-073", "以桌面 Agent Harness 与 App Server 形成可扩展的 Codex 平台层。"],
]);

const capabilityRules = [
  [/replit agent 4/i, "把任务拆分、后台并行与合并集成到托管开发环境，支持更长链路的构建。"],
  [/replit agent/i, "在托管开发环境中规划、生成、运行并迭代应用，覆盖从需求到部署的闭环。"],
  [/windsurf cascade/i, "在 IDE 内执行多步 Agent 任务，并以代码库上下文维持连续推理。"],
  [/jetbrains junie/i, "在 JetBrains IDE 中执行多步软件工程任务，连接编辑、运行与验证。"],
  [/factory droids/i, "以软件工厂式 Agent loop 承担仓库任务，强调可重复执行与工程流程集成。"],
  [/aider/i, "通过 repo map、Git diff 与 commit 形成透明的终端协作循环，适合可审阅的代码修改。"],
  [/continue/i, "将模型选择、IDE 上下文和可配置规则组合为开放的编码助手框架。"],
  [/^amp/i, "围绕编辑、终端与 Agent runtime 构建多步工程执行环境，并逐步开放 SDK。"],
  [/^cody$/i, "依赖代码图与仓库检索理解大型代码库，把上下文检索作为生成前置层。"],
  [/swe-agent/i, "用 Agent-Computer Interface 重构终端接口，让模型更稳定地浏览、修改与验证仓库。"],
  [/cline/i, "在 VS Code 中逐步执行、请求授权并审阅变更，把自主性与人工控制并置。"],
  [/opencode/i, "以多供应商 TUI 提供开放的终端编码代理，保留模型与运行时选择权。"],
  [/pi coding/i, "以轻量终端 Harness 支持脚本化、工具调用与可组合的编码工作流。"],
  [/baidu comate/i, "面向中文开发场景提供代码生成、问答、补全与仓库理解。"],
  [/^trae$/i, "把 AI IDE 与 Builder 结合，覆盖从代码理解到应用构建的统一体验。"],
  [/qwen code|通义灵码/i, "将 Qwen-Coder 能力带入 IDE 与终端 Agent，面向中文仓库和工程任务。"],
  [/kimi cli|kimi code/i, "以长上下文和终端执行为核心，逐步扩展到完整的编码代理体验。"],
  [/zcode/i, "以 GLM 为基础构建官方 Harness，覆盖规划、编码、审查与部署流程。"],
  [/codebuddy|workbuddy/i, "把自然语言构建、仓库任务与团队协作整合到国产开发工作流。"],
  [/qoder/i, "通过 Quest Mode 与异步长任务处理复杂仓库工作，并形成国内统一产品线。"],
  [/openai operator/i, "把浏览器与计算机操作纳入模型执行循环，是通用 Work Agent 的早期形态。"],
  [/manus/i, "在云沙盒中持续运行通用多步任务，强调异步交付和结果产物。"],
  [/openclaw/i, "以本地 Gateway、渠道连接与工具调用构建可自托管的个人代理。"],
  [/hermes agent/i, "强调多会话编排、工具使用与可改进 Skills，面向持续运行的工作代理。"],
  [/kimi work/i, "把文件处理、浏览器执行与 Cron 任务带入长上下文工作代理。"],
  [/deep research/i, "将多步检索、综合与引用组织成可追踪的研究工作流。"],
  [/chatgpt agent|chatgpt work/i, "把浏览、研究、连接器与文档产出整合为跨应用执行入口。"],
  [/claude cowork/i, "围绕文件和应用协作组织长周期工作，并保留人类接管点。"],
];

const modelRules = [
  [/gpt-3\.5|chatgpt/i, "以对话式代码生成建立低门槛入口，奠定自然语言编程的交互范式。"],
  [/gpt-4o/i, "在多模态、低延迟与成本之间取得平衡，扩大实时编程协作场景。"],
  [/o3-mini/i, "以更低成本提供强化推理与数学能力，使可验证推理进入日常调用。"],
  [/gpt-4\.1/i, "强化长上下文、代码能力与指令遵循，面向真实仓库和工具调用。"],
  [/gpt-5\.6/i, "通过 Sol、Terra、Luna 分层覆盖高强度推理、均衡执行与低延迟任务。"],
  [/gpt-5\.5/i, "聚焦工程编程、计算机使用与专业任务，把模型能力压向真实工作负载。"],
  [/gpt-5\.4/i, "结合超长上下文、computer use 与 compaction，支持更持久的代理会话。"],
  [/gpt-5\.3-codex-spark/i, "以实时编码和超过千 token 每秒的吞吐优化交互式软件工程。"],
  [/gpt-5\.3-codex/i, "面向真实电脑环境的专业软件工程任务，强化连续执行稳定性。"],
  [/gpt-5\.2-codex/i, "聚焦大型重构、迁移与安全任务，在长程执行中维持计划一致性。"],
  [/gpt-5\.1-codex/i, "加入低延迟、上下文压缩与 Windows 支持，扩大工程可用范围。"],
  [/gpt-5-codex/i, "从通用模型分化出的软件工程专项模型，优化仓库任务与工具调用。"],
  [/^codex$/i, "以代码生成与 HumanEval 建立专用代码模型路线，并通过 API 进入开发工具。"],
  [/o1-preview|\bo1\b/i, "把测试时计算和链式推理产品化，为复杂代码问题引入更深的推理预算。"],
  [/o3 \/ o4-mini/i, "让推理、视觉理解与工具使用进一步融合，面向可执行的复杂任务。"],
  [/^gpt-5$/i, "统一 coding、reasoning 与 agent 能力，减少模型切换带来的工作流割裂。"],
  [/^gpt-5\.2$/i, "强化专业知识、代码生成与长上下文稳定性，服务更完整的软件项目。"],
  [/^gpt-5\.1$/i, "提升自适应推理与工具可靠性，使代理在多步任务中更稳健。"],
  [/^gpt-4$/i, "显著提升复杂代码理解与生成能力，跨过真实工程应用的早期门槛。"],
  [/claude 2\.1/i, "把上下文扩展到 200K，并引入更成熟的 tool use 试验。"],
  [/^claude 2$/i, "以 100K 长上下文提升大型代码库阅读、总结与修改能力。"],
  [/^claude 3$/i, "通过 Haiku、Sonnet 与 Opus 分层，覆盖速度、能力和成本的不同需求。"],
  [/claude 3\.5 sonnet/i, "显著强化 coding 与 tool use，并为 Computer Use 能力奠定基础。"],
  [/claude 3\.7 sonnet/i, "把扩展思考与 action scaling 结合，提升长链路工具任务的可靠性。"],
  [/claude haiku 4\.5/i, "优化 coding 的成本与延迟拐点，使轻量代理获得更高吞吐。"],
  [/claude sonnet 4\.6/i, "将长上下文、computer use 与 agent planning 结合到均衡模型。"],
  [/claude sonnet 4\.5/i, "强化 coding、computer use 与一致性，面向持续软件工程会话。"],
  [/claude sonnet 4/i, "加入扩展思考与工具调用优化，使中高强度代理任务更稳定。"],
  [/claude sonnet 5/i, "面向 agentic coding、长程执行与成本效率继续推进主力模型。"],
  [/claude opus 4\.8/i, "强化 agentic judgment、computer use 与长会话一致性。"],
  [/claude opus 4\.7/i, "聚焦复杂工程、自验证与更可靠的长程任务执行。"],
  [/claude opus 4\.6/i, "把超长上下文与更复杂的 Agent 任务结合，提升持续执行能力。"],
  [/claude opus 4\.5/i, "推动长期软件工程表现跃迁，增强规划、编码与复核闭环。"],
  [/claude opus 4\.1/i, "以真实代码质量和精度改进 Opus 路线的工程可靠性。"],
  [/claude opus 4/i, "面向复杂编码与长周期 Agent，提供更高推理和执行上限。"],
  [/claude opus 5|fable 5|mythos 5/i, "以多日 Agent 与长程软件工程为目标，探索更高自治上限。"],
  [/deepseek-coder-v2\.5/i, "在代码生成、补全与推理间取得平衡，提升开放模型的工程可用性。"],
  [/deepseek-coder-v2/i, "以更大规模和更广语言覆盖推进开源代码模型能力。"],
  [/deepseek-coder/i, "建立专用开源代码模型路线，为后续推理与 Agent 能力奠定基础。"],
  [/deepseek r1/i, "以强化学习驱动可见推理能力，显著降低高水平推理的使用成本。"],
  [/deepseek v3\.2/i, "强化 thinking-in-tools，让模型在调用工具时保持显式规划和反思。"],
  [/deepseek v4 pro/i, "面向更强推理、编程与工具调用，提升复杂工程任务的完成质量。"],
  [/deepseek v4 preview/i, "提前验证下一代推理与工具调用能力，为 V4 系列建立技术基线。"],
  [/deepseek v3/i, "以高效训练与 MoE 架构提高推理和代码能力的性价比。"],
  [/qwen2\.5-coder/i, "以大规模代码数据和长上下文优化开源代码生成与仓库理解。"],
  [/qwen3-coder/i, "面向 Agentic Coding 强化工具调用、长任务与多语言代码能力。"],
  [/qwen3-next/i, "以稀疏架构探索更长上下文和更高推理效率。"],
  [/qwen3\.8-max/i, "将长上下文与 Agent 场景能力推向旗舰模型上限。"],
  [/kimi k1\.5/i, "以多模态推理与长上下文建立 Kimi 的强化推理路线。"],
  [/kimi k2 thinking/i, "加入边思考边调用工具的能力，强化复杂 Agent 任务。"],
  [/kimi k2\.5/i, "面向视觉、百级子 Agent 与 Swarm 工作流优化旗舰能力。"],
  [/kimi k2/i, "以 MoE 与 Agent tool use 为重点，增强开放模型的工具执行。"],
  [/kimi k3/i, "继续扩展长程推理和工具协作，面向下一代通用 Agent。"],
  [/glm-4\.5/i, "以推理、coding 与 Agent 一体化建立国产开源模型基线。"],
  [/glm-4\.6/i, "围绕 Claude Code 与 Harness 生态优化真实编码任务。"],
  [/glm-4\.7/i, "强化长程 Agent 与工具稳定性，提升持续执行表现。"],
  [/glm-5\.3-flash/i, "以低延迟和高吞吐服务实时编码与交互式 Agent。"],
  [/glm-5\.3/i, "面向编程与复杂任务推进国产旗舰基础模型。"],
  [/glm-5\.2/i, "加强多 Agent 协作和长程执行，拓展复杂工程上限。"],
  [/glm-5\.1/i, "强化真实工具调用与长任务可靠性。"],
  [/glm-5/i, "整合复杂工程与 Agentic Coding 能力，推进统一基础模型。"],
  [/minimax m2\.1/i, "以多语言 coding、scaffold 与高吞吐为核心优化工程任务。"],
  [/minimax m2\.5/i, "进一步统一 coding、search 与 tool use，增强代理闭环。"],
  [/gemini 1\.5 pro/i, "以超长上下文和多模态能力支持大型代码库与复杂资料处理。"],
  [/gemini 2\.0/i, "把多模态理解与 Agent 能力结合，推进实时工具使用。"],
  [/gemini 2\.5 pro/i, "强化推理与 1M+ 上下文，面向复杂代码和长文档任务。"],
  [/gemini 3\.5 flash/i, "以低延迟、高性价比支持长程 Agent 和交互式编码。"],
  [/gemini 3/i, "在推理、工具调用和 Agentic Coding 之间形成统一能力。"],
  [/code llama/i, "把开放代码模型带入 Meta 生态，推动可本地部署的代码生成。"],
  [/alphacode/i, "以竞赛编程验证大模型的程序合成与搜索能力。"],
];

const techRules = [
  [/codex \/ humaneval/i, "以 HumanEval 建立可量化的代码生成评测，并把专用代码模型推向 API。"],
  [/alphacode/i, "通过海量候选采样、聚类与测试筛选攻克竞赛编程题，验证“生成 + 搜索 + 验证”的程序合成路线。"],
  [/incoder|fim/i, "把 Fill-in-the-Middle 训练引入代码模型，使编辑和补全能够利用双向上下文。"],
  [/repocoder/i, "通过检索仓库级上下文提升跨文件生成，是代码 RAG 的早期代表。"],
  [/swe-bench/i, "以真实 GitHub Issue 和测试验证 Agent 是否真正完成软件工程任务。"],
  [/react/i, "把推理与行动交替组织为 Agent loop，成为工具调用系统的基础范式。"],
  [/voyager/i, "用自动课程、技能库和环境反馈展示持续学习型 Agent。"],
  [/codeact/i, "让模型用可执行代码表达行动，提升复杂工具编排的组合能力。"],
  [/^mcp$/i, "以开放协议统一模型、工具与数据连接，降低 Agent 集成成本。"],
  [/reflexion/i, "通过语言化反馈和记忆进行自我修正，提升多轮任务成功率。"],
  [/function calling/i, "将结构化工具调用纳入模型接口，使外部系统成为可控能力。"],
  [/swe-agent \/ aci/i, "以 Agent-Computer Interface 重构仓库浏览、编辑和终端反馈，降低语言模型与真实开发环境之间的交互摩擦。"],
  [/context engineering/i, "从提示词扩展到上下文选择、压缩、记忆与检索的系统工程。"],
  [/prm/i, "用过程奖励监督中间推理步骤，为可验证强化学习提供训练信号。"],
  [/swe-gym/i, "把真实软件仓库转化为可交互训练环境，让 Agent 在执行中学习。"],
  [/swe-smith/i, "自动构造软件工程任务与验证器，扩大可训练、可评测的数据规模。"],
  [/agent lightning/i, "把任意 Agent 运行轨迹转化为强化学习训练信号，解耦框架与优化器。"],
  [/envfactory/i, "自动生成可验证环境与任务，为大规模 Agent 训练提供基础设施。"],
  [/grpo/i, "以组内相对优势估计降低强化学习成本，推动推理模型规模化训练。"],
  [/r1 \/ r1-zero/i, "展示纯强化学习与可验证奖励如何诱发长链推理能力。"],
  [/agent-rlvr/i, "把可验证奖励扩展到工具型 Agent，优化长链路执行结果。"],
  [/swe-universe/i, "构建更广覆盖的软件工程训练宇宙，连接任务生成、执行与验证。"],
  [/star/i, "通过自生成推理数据与筛选迭代提升模型推理能力。"],
  [/promptbreeder/i, "利用进化搜索自动改进提示策略，探索自适应任务优化。"],
  [/self-rewarding/i, "让模型同时生成答案和评判信号，探索自举式对齐与改进。"],
  [/adas|aflow/i, "自动搜索和组合 Agent 架构，减少人工设计工作流的依赖。"],
  [/alphaevolve/i, "把模型生成、自动评测与进化搜索结合，用于发现更优算法。"],
  [/^stop$/i, "让语言模型迭代改写自己的脚手架程序，以元优化方式探索可递归改进的 Agent 系统。"],
  [/^dgm$/i, "在固定评测框架中开放式地产生、验证并保留 Harness 变体，让软件代理沿性能档案持续演化。"],
  [/^ace$/i, "把上下文从一次性提示变成可持续更新的 Playbook，通过执行反馈积累可复用策略。"],
  [/^mce$/i, "让上下文内容与管理机制共同演化，寻找更适合长周期 Agent 的记忆与调度结构。"],
  [/meta-harness/i, "自动生成并评判 Harness 代码候选，把执行框架本身纳入搜索和优化闭环。"],
  [/continual harness/i, "在长期运行中持续更新工具、记忆与 Skills，让 Harness 能随任务分布一起成长。"],
  [/self-harness/i, "让 Harness 通过自举生成、评测与改写自身组件，探索不依赖固定人工脚手架的改进循环。"],
  [/^ahe$/i, "把 Harness 拆成可观察、可归因的组件，在局部验证后逐步演化整体执行系统。"],
  [/^sia$/i, "尝试联合更新 Harness 与模型权重，使执行策略和基础能力不再彼此割裂。"],
];

const productSeriesRules = [
  [/copilot/i, "GitHub Copilot"], [/cursor/i, "Cursor"], [/replit/i, "Replit Agent"], [/kiro/i, "Kiro"], [/devin/i, "Devin"],
  [/lovable/i, "Lovable"], [/cline/i, "Cline"], [/^amp/i, "Amp"], [/qoder/i, "Qoder"], [/claude code/i, "Claude Code"],
  [/\bcodex\b/i, "OpenAI Codex"], [/\bjules\b/i, "Google Jules"],
  [/gemini cli/i, "Google Gemini CLI"], [/antigravity/i, "Google Antigravity"],
  [/qwen code|通义灵码/i, "Qwen 开发工具"],
  [/kimi cli|kimi code|kimi agent/i, "Kimi 开发工具"], [/deep research|chatgpt agent|chatgpt work|operator/i, "OpenAI Work Agent"],
  [/claude cowork/i, "Claude Work Agent"],
];

const modelSeriesRules = [
  [/codex/i, "OpenAI Codex 模型"], [/gpt|^o\d|o1-preview/i, "OpenAI GPT / o"], [/claude.*opus|fable|mythos/i, "Claude Opus / Fable"],
  [/claude/i, "Claude Sonnet / Haiku"], [/deepseek/i, "DeepSeek"], [/qwen/i, "Qwen"], [/kimi/i, "Kimi"], [/glm/i, "GLM"],
  [/minimax/i, "MiniMax"], [/gemini|alphacode/i, "Google Models"], [/code llama/i, "Meta Code Llama"],
];

export function getSeriesKey(node) {
  if (node.series) return node.series;
  if (node.section === "tech") {
    if (/agent lightning/i.test(node.title)) return "Agent Lightning";
    return node.family;
  }
  const rules = node.section === "models" ? modelSeriesRules : productSeriesRules;
  const match = rules.find(([pattern]) => pattern.test(node.title));
  return match ? match[1] : node.family;
}

export function getNodeSummary(node) {
  if (node.summary) return node.summary;
  const source = sourceBriefs.get(node.id);
  if (source) return source;
  const rules = node.section === "models" ? modelRules : node.section === "tech" ? techRules : capabilityRules;
  const match = rules.find(([pattern]) => pattern.test(node.title));
  if (match) return match[1];
  if (node.section === "products") return `${node.title} 将“${node.family}”能力推进到 ${getDevelopmentStage(node).label}，扩大 Agent 在真实开发流程中的执行范围。`;
  if (node.section === "models") return `${node.title} 面向代码理解、复杂推理与工具调用继续优化，提升长任务中的稳定性。`;
  return `${node.title} 是“${node.family}”轨道的重要方法节点，为可训练、可验证的软件 Agent 提供基础能力。`;
}

export function getEvolutionTrail(node) {
  const series = getSeriesKey(node);
  const members = nodes.filter((candidate) => candidate.section === node.section && getSeriesKey(candidate) === series);
  // Explicit branch anchors give context without merging sibling product lines.
  const anchorIds = new Set(members.map((candidate) => candidate.branchFrom).filter(Boolean));
  const anchors = nodes.filter((candidate) => candidate.section === node.section && anchorIds.has(candidate.id));
  return [...new Map([...anchors, ...members].map((candidate) => [candidate.id, candidate])).values()]
    .sort((a, b) => getPublishedDate(a).localeCompare(getPublishedDate(b)) || a.id.localeCompare(b.id));
}

export function getLongSummary(node) {
  const trail = getEvolutionTrail(node);
  const index = trail.findIndex((candidate) => candidate.id === node.id);
  const previous = trail[index - 1];
  const next = trail[index + 1];
  const relation = previous && next
    ? `这条发展线的较早记录是 ${getPublishedDate(previous)} 的「${previous.title}」，较晚记录是 ${getPublishedDate(next)} 的「${next.title}」。`
    : previous
      ? `这条发展线的较早记录是 ${getPublishedDate(previous)} 的「${previous.title}」；当前记录到本节点。`
      : next
        ? `这条发展线的下一条记录是 ${getPublishedDate(next)} 的「${next.title}」。`
        : node.origin === "supplement" ? "这是根据发布来源补充收录的独立节点。" : "它在原始 PDF 中作为独立节点出现。";
  return [getNodeSummary(node), node.detail, node.dateNote, relation].filter(Boolean).join(" ");
}

export function getNodeTags(node) {
  const tags = [getSeriesKey(node), getDevelopmentStage(node).label, node.section === "products" ? "开发工具" : node.section === "models" ? "代码模型" : "基础能力"];
  if (node.status) tags.push(node.status);
  if (/Agent/i.test(`${node.title} ${node.family} ${node.stage}`)) tags.push("Agent");
  if (/CLI|终端|Shell/i.test(`${node.title} ${node.family}`)) tags.push("终端");
  return [...new Set(tags)].slice(0, 4);
}
