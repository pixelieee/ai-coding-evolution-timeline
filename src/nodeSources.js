import { publicAssetUrl } from "./siteAssets.js";

const dateSequence = `
2021-06-29 2023-03-22 2023-12-29 2024-07-23 2025-02-06 2025-10-29 2022-11-30 2023-03-15 2024-04-29 2024-11-27
2025-05-19 2025-09-25 2023-10-03 2024-04-30 2024-10-03 2024-11-21 2025-03-25 2025-07-14 2026-02-12 2026-05-18
2024-03-12 2024-09-05 2024-11-13 2025-01-23 2025-06-05 2025-11-18 2026-04-23 2026-06-18 2023-05-09 2023-08-01
2024-06-27 2025-05-12 2025-10-16 2026-05-21 2023-05-10 2024-04-02 2024-07-13 2025-05-15 2025-11-13 2026-08-20
2023-06-08 2025-01-20 2025-07-22 2025-10-13 2026-05-07 2026-06-18 2023-10-31 2025-04-22 2025-08-22 2026-02-09
2026-05-15 2025-02-24 2025-11-24 2026-03-19 2026-04-16 2026-05-28 2025-05-22 2026-02-05 2026-04-16 2026-05-28
2026-08-13 2025-04-16 2025-05-20 2025-10-06 2026-02-02 2026-06-18 2026-07-09 2025-05-16 2025-06-25 2025-11-18
2026-03-04 2026-05-19 2026-08-12 2025-01-23 2025-03-06 2026-01-30 2026-02-17 2026-06-30 2025-02-02 2025-07-17
2026-01-12 2026-03-19 2026-07-09 2022-11-30 2024-05-13 2025-01-31 2025-04-14 2025-11-12 2026-03-05 2026-07-09
2023-03-14 2024-09-12 2025-04-16 2025-08-07 2025-12-11 2026-04-23 2021-07-07 2025-11-19 2026-02-05 2025-09-15
2025-12-18 2026-02-12 2023-07-11 2024-03-04 2024-10-22 2025-05-22 2025-10-15 2026-06-30 2023-11-21 2024-06-20
2025-02-24 2025-09-29 2026-02-17 2025-05-22 2025-11-24 2026-04-16 2026-06-09 2025-08-05 2026-02-05 2026-05-28
2026-07-24 2023-11-02 2024-09-05 2025-01-20 2026-04-08 2024-06-17 2024-12-26 2025-12-01 2026-08-25 2024-11-12
2025-07-11 2025-09-12 2026-01-27 2026-08-28 2025-01-20 2025-07-23 2025-11-06 2026-07-16 2025-07-28 2025-12-22
2026-02-12 2026-04-07 2026-08-18 2025-09-30 2025-12-23 2026-02-12 2026-06-16 2026-08-26 2022-02-02 2024-02-15
2024-12-11 2025-11-18 2026-05-19 2023-08-24 2025-03-25 2021-07-07 2022-04-12 2023-03-22 2023-10-10 2022-02-02
2022-10-06 2023-05-25 2024-02-01 2024-11-25 2023-03-20 2023-06-13 2024-05-27 2025-06-19 2023-05-31 2024-12-30
2025-04-30 2025-08-05 2026-05-14 2024-02-05 2025-01-22 2025-06-26 2026-02-18 2026-08-12 2022-03-29 2023-09-29
2024-01-18 2024-08-15 2025-05-14 2025-10-08 2026-01-15 2026-03-12 2026-05-14 2026-06-18 2023-10-03 2025-05-28
2026-04-16 2026-05-21
`.trim().split(/\s+/);

const preciseDateById = Object.fromEntries(dateSequence.map((date, index) => [`node-${String(index + 1).padStart(3, "0")}`, date]));
Object.assign(preciseDateById, {
  "node-125": "2026-04-24",
  "node-129": "2026-08-13",
  "node-176": "2025-06-13",
  "node-177": "2026-02-02",
  "node-184": "2025-10-06",
  "node-185": "2026-01-29",
  "node-186": "2026-03-30",
  "node-187": "2026-05-11",
  "node-188": "2026-06-09",
  "node-191": "2026-04-28",
  "node-192": "2026-05-26",
});

const official = (label, url) => ({ label, url, kind: "官方发布" });
const paper = (label, url) => ({ label, url, kind: "论文 / 研究" });
const project = (label, url) => ({ label, url, kind: "项目资料" });

const sourceById = new Map([
  ["node-001", official("GitHub · Copilot technical preview", "https://github.blog/news-insights/product-news/introducing-github-copilot-ai-pair-programmer/")],
  ["node-002", official("GitHub · Copilot X", "https://github.blog/news-insights/product-news/github-copilot-x-the-ai-powered-developer-experience/")],
  ["node-003", official("GitHub · Copilot Chat GA", "https://github.blog/changelog/2023-12-29-github-copilot-chat-now-generally-available-for-organizations-and-individuals/")],
  ["node-005", official("GitHub · Agent mode preview", "https://github.blog/news-insights/product-news/github-copilot-the-agent-awakens/")],
  ["node-006", official("Cursor · 2.0 changelog", "https://cursor.com/changelog/2-0")],
  ["node-007", official("OpenAI · Introducing ChatGPT", "https://openai.com/index/chatgpt/")],
  ["node-009", official("GitHub · Copilot Workspace", "https://github.blog/news-insights/product-news/github-copilot-workspace/")],
  ["node-011", official("GitHub · Copilot coding agent", "https://github.blog/changelog/2025-05-19-github-copilot-coding-agent-in-public-preview/")],
  ["node-012", official("GitHub · Copilot CLI public preview", "https://github.blog/changelog/2025-09-25-github-copilot-cli-is-now-in-public-preview/")],
  ["node-018", official("Kiro · launch announcement", "https://kiro.dev/blog/introducing-kiro/")],
  ["node-020", official("Kiro · Introducing Kiro Web", "https://kiro.dev/blog/introducing-kiro-web/")],
  ["node-035", official("Sourcegraph · Cody", "https://sourcegraph.com/cody")],
  ["node-039", project("Pi coding agent", "https://github.com/badlogic/pi-mono")],
  ["node-040", project("DeepSeek Harness", "https://github.com/deepseek-ai/deepseek-harness")],
  ["node-050", official("Kimi · Agent Swarm", "https://www.kimi.ai/blog/agent-swarm")],
  ["node-052", official("Anthropic · Claude Code research preview", "https://www.anthropic.com/news/claude-3-7-sonnet")],
  ["node-057", official("Anthropic · Claude Code", "https://www.anthropic.com/news/claude-4")],
  ["node-062", official("OpenAI · Codex CLI", "https://openai.com/index/introducing-codex/")],
  ["node-063", official("Google · Jules public beta", "https://blog.google/technology/google-labs/jules/")],
  ["node-064", official("OpenAI · Codex general availability", "https://openai.com/index/codex-now-generally-available/")],
  ["node-065", official("OpenAI · Introducing the Codex app", "https://openai.com/index/introducing-the-codex-app/")],
  ["node-068", official("OpenAI · Introducing Codex", "https://openai.com/index/introducing-codex/")],
  ["node-069", official("Google · Gemini CLI", "https://blog.google/technology/developers/introducing-gemini-cli-open-source-ai-agent/")],
  ["node-070", official("Google · Antigravity", "https://blog.google/technology/google-labs/google-antigravity/")],
  ["node-071", official("OpenAI · Codex app for Windows", "https://openai.com/index/introducing-the-codex-app/")],
  ["node-074", official("OpenAI · Operator", "https://openai.com/index/introducing-operator/")],
  ["node-079", official("OpenAI · Deep research", "https://openai.com/index/introducing-deep-research/")],
  ["node-080", official("OpenAI · ChatGPT agent", "https://openai.com/index/introducing-chatgpt-agent/")],
  ["node-083", official("OpenAI · ChatGPT Work", "https://openai.com/index/chatgpt-for-your-most-ambitious-work/")],
  ["node-084", official("OpenAI · Introducing ChatGPT", "https://openai.com/index/chatgpt/")],
  ["node-085", official("OpenAI · GPT-4o", "https://openai.com/index/hello-gpt-4o/")],
  ["node-086", official("OpenAI · o3-mini", "https://openai.com/index/openai-o3-mini/")],
  ["node-087", official("OpenAI · GPT-4.1", "https://openai.com/index/gpt-4-1/")],
  ["node-088", official("OpenAI · GPT-5.1", "https://openai.com/index/gpt-5-1/")],
  ["node-089", official("OpenAI · GPT-5.4", "https://openai.com/index/introducing-gpt-5-4/")],
  ["node-090", official("OpenAI · GPT-5.6", "https://openai.com/index/gpt-5-6/")],
  ["node-091", official("OpenAI · GPT-4", "https://openai.com/research/gpt-4")],
  ["node-092", official("OpenAI · o1-preview", "https://openai.com/index/introducing-openai-o1-preview/")],
  ["node-093", official("OpenAI · o3 and o4-mini", "https://openai.com/index/introducing-o3-and-o4-mini/")],
  ["node-094", official("OpenAI · GPT-5", "https://openai.com/index/introducing-gpt-5/")],
  ["node-095", official("OpenAI · GPT-5.2", "https://openai.com/index/introducing-gpt-5-2/")],
  ["node-096", official("OpenAI · GPT-5.5", "https://openai.com/index/introducing-gpt-5-5/")],
  ["node-097", paper("OpenAI Codex paper", "https://arxiv.org/abs/2107.03374")],
  ["node-098", official("OpenAI · GPT-5.1-Codex-Max", "https://openai.com/index/gpt-5-1-codex-max/")],
  ["node-099", official("OpenAI · GPT-5.3-Codex", "https://openai.com/index/introducing-gpt-5-3-codex/")],
  ["node-100", official("OpenAI · GPT-5-Codex", "https://openai.com/index/introducing-upgrades-to-codex/")],
  ["node-101", official("OpenAI · GPT-5.2-Codex", "https://openai.com/index/gpt-5-2-codex/")],
  ["node-102", official("OpenAI · GPT-5.3-Codex-Spark", "https://openai.com/index/introducing-gpt-5-3-codex-spark/")],
  ["node-108", official("Anthropic · Claude Sonnet 5", "https://www.anthropic.com/news/claude-sonnet-5")],
  ["node-112", official("Anthropic · Claude Sonnet 4.5", "https://www.anthropic.com/news/claude-sonnet-4-5")],
  ["node-113", official("Anthropic · Claude Sonnet 4.6", "https://www.anthropic.com/news/claude-sonnet-4-6")],
  ["node-115", official("Anthropic · Claude Opus 4.5", "https://www.anthropic.com/news/claude-opus-4-5")],
  ["node-116", official("Anthropic · Claude Opus 4.7", "https://www.anthropic.com/news/claude-opus-4-7")],
  ["node-117", official("Anthropic · Claude Fable 5 / Mythos 5", "https://www.anthropic.com/news/claude-fable-5-mythos-5")],
  ["node-119", official("Anthropic · Claude Opus 4.6", "https://www.anthropic.com/news/claude-opus-4-6")],
  ["node-120", official("Anthropic · Claude Opus 4.8", "https://www.anthropic.com/news/claude-opus-4-8")],
  ["node-121", official("Anthropic · Claude Opus 5", "https://www.anthropic.com/news/claude-opus-5")],
  ["node-122", project("DeepSeek · DeepSeek Coder", "https://github.com/deepseek-ai/DeepSeek-Coder")],
  ["node-123", project("DeepSeek · DeepSeek-Coder-V2", "https://github.com/deepseek-ai/DeepSeek-Coder-V2")],
  ["node-124", project("DeepSeek · DeepSeek-R1", "https://github.com/deepseek-ai/DeepSeek-R1")],
  ["node-125", official("DeepSeek · V4 Preview", "https://deepseek.com/en/news/v4-preview/")],
  ["node-126", project("DeepSeek · DeepSeek-Coder-V2", "https://github.com/deepseek-ai/DeepSeek-Coder-V2")],
  ["node-127", project("DeepSeek · DeepSeek-V3", "https://github.com/deepseek-ai/DeepSeek-V3")],
  ["node-128", official("DeepSeek · V3.2 Release", "https://api-docs.deepseek.com/news/news251201/")],
  ["node-129", official("DeepSeek · V4-Pro GA", "https://api-docs.deepseek.com/news/news251201/")],
  ["node-131", official("Kimi · Kimi K2", "https://www.kimi.ai/blog/kimi-k2")],
  ["node-133", official("Kimi · Kimi K2.5", "https://www.kimi.ai/blog/kimi-k2-5")],
  ["node-135", paper("Kimi K1.5 technical report", "https://arxiv.org/abs/2501.12599")],
  ["node-137", official("Kimi · Kimi K2 Thinking", "https://www.kimi.ai/blog/kimi-k2-thinking")],
  ["node-138", official("Kimi · Kimi K3", "https://www.kimi.ai/blog/kimi-k3")],
  ["node-139", official("Z.ai · GLM-4.5", "https://docs.z.ai/guides/llm/glm-4.5")],
  ["node-140", official("Z.ai · GLM-4.7", "https://docs.z.ai/guides/llm/glm-4.7")],
  ["node-141", official("Z.ai · GLM-5", "https://docs.z.ai/release-notes/new-released")],
  ["node-142", official("Z.ai · GLM-5.1", "https://docs.z.ai/release-notes/new-released")],
  ["node-143", official("Z.ai · GLM-5.3", "https://docs.z.ai/release-notes/new-released")],
  ["node-144", official("Z.ai · GLM-4.6", "https://docs.z.ai/release-notes/new-released")],
  ["node-147", official("Z.ai · GLM-5.2", "https://docs.z.ai/release-notes/new-released")],
  ["node-148", official("Z.ai · GLM-5.3-Flash", "https://docs.z.ai/release-notes/new-released")],
  ["node-153", official("Google · Gemini 3.5 Flash", "https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5/")],
  ["node-156", paper("Evaluating Large Language Models Trained on Code", "https://arxiv.org/abs/2107.03374")],
  ["node-157", paper("InCoder", "https://arxiv.org/abs/2204.05999")],
  ["node-158", paper("RepoCoder", "https://arxiv.org/abs/2303.12570")],
  ["node-159", paper("SWE-bench", "https://arxiv.org/abs/2310.06770")],
  ["node-160", paper("AlphaCode", "https://www.science.org/doi/10.1126/science.abq1158")],
  ["node-161", paper("ReAct", "https://arxiv.org/abs/2210.03629")],
  ["node-162", paper("Voyager", "https://arxiv.org/abs/2305.16291")],
  ["node-163", paper("CodeAct", "https://arxiv.org/abs/2402.01030")],
  ["node-164", official("Anthropic · Model Context Protocol", "https://www.anthropic.com/news/model-context-protocol")],
  ["node-165", paper("Reflexion", "https://arxiv.org/abs/2303.11366")],
  ["node-166", official("OpenAI · Function calling", "https://openai.com/index/function-calling-and-other-api-updates/")],
  ["node-167", paper("SWE-agent", "https://arxiv.org/abs/2405.15793")],
  ["node-168", project("Tobi Lütke · Context Engineering", "https://x.com/tobi/status/1935533422589399127")],
  ["node-169", paper("Let’s Verify Step by Step / PRM800K", "https://arxiv.org/abs/2305.20050")],
  ["node-170", paper("SWE-Gym", "https://arxiv.org/abs/2412.21139")],
  ["node-171", paper("SWE-smith", "https://arxiv.org/abs/2504.21798")],
  ["node-172", paper("Agent Lightning", "https://arxiv.org/abs/2508.03680")],
  ["node-174", paper("DeepSeekMath / GRPO", "https://arxiv.org/abs/2402.03300")],
  ["node-175", paper("DeepSeek-R1", "https://arxiv.org/abs/2501.12948")],
  ["node-176", paper("Agent-RLVR", "https://arxiv.org/abs/2506.11425")],
  ["node-177", paper("SWE-Universe", "https://arxiv.org/abs/2602.02361")],
  ["node-178", project("Microsoft · Agent Lightning", "https://github.com/microsoft/agent-lightning")],
  ["node-179", paper("STaR", "https://arxiv.org/abs/2203.14465")],
  ["node-180", paper("PromptBreeder", "https://arxiv.org/abs/2309.16797")],
  ["node-181", paper("Self-Rewarding Language Models", "https://arxiv.org/abs/2401.10020")],
  ["node-182", paper("Automated Design of Agentic Systems", "https://arxiv.org/abs/2408.08435")],
  ["node-183", official("Google DeepMind · AlphaEvolve", "https://deepmind.google/discover/blog/alphaevolve-a-gemini-powered-coding-agent-for-designing-advanced-algorithms/")],
  ["node-184", paper("Agentic Context Engineering", "https://arxiv.org/abs/2510.04618")],
  ["node-185", paper("Meta Context Engineering", "https://arxiv.org/abs/2601.21557")],
  ["node-186", paper("Meta-Harness", "https://arxiv.org/abs/2603.28052")],
  ["node-187", paper("Continual Harness", "https://arxiv.org/abs/2605.09998")],
  ["node-188", paper("Self-Harness", "https://arxiv.org/abs/2606.09498")],
  ["node-189", paper("STOP", "https://arxiv.org/abs/2310.02304")],
  ["node-190", paper("Darwin Gödel Machine", "https://arxiv.org/abs/2505.22954")],
  ["node-191", paper("Agentic Harness Engineering", "https://arxiv.org/abs/2604.25850")],
  ["node-192", paper("SIA: Self Improving AI", "https://arxiv.org/abs/2605.27276")],
]);

const sourceRules = [
  [/copilot/i, official("GitHub Copilot 官方更新", "https://github.blog/changelog/label/copilot/")],
  [/cursor/i, official("Cursor Changelog", "https://cursor.com/changelog")],
  [/replit/i, official("Replit 官方博客", "https://blog.replit.com/")],
  [/kiro/i, official("Kiro 官方博客", "https://kiro.dev/blog/")],
  [/devin/i, official("Cognition 官方博客", "https://cognition.ai/blog")],
  [/claude/i, official("Anthropic Newsroom", "https://www.anthropic.com/news")],
  [/\bglm|zcode/i, official("Z.ai Release Notes", "https://docs.z.ai/release-notes/new-released")],
  [/kimi/i, official("Kimi Research & Product", "https://www.kimi.ai/blog/")],
  [/qwen|通义/i, official("Qwen 官方博客", "https://qwenlm.github.io/blog/")],
  [/gemini|antigravity|jules|alphacode/i, official("Google AI 官方博客", "https://blog.google/technology/ai/")],
  [/gpt|openai|chatgpt|codex|operator|deep research/i, official("OpenAI 官方发布", "https://openai.com/news/product-releases/")],
  [/minimax/i, official("MiniMax 官方资料", "https://www.minimax.io/news")],
  [/code llama/i, official("Meta AI 官方资料", "https://ai.meta.com/blog/code-llama-large-language-model-coding/")],
  [/aider/i, project("Aider GitHub", "https://github.com/Aider-AI/aider")],
  [/continue/i, project("Continue GitHub", "https://github.com/continuedev/continue")],
  [/swe-agent/i, project("SWE-agent GitHub", "https://github.com/SWE-agent/SWE-agent")],
  [/cline/i, project("Cline GitHub", "https://github.com/cline/cline")],
  [/opencode/i, project("OpenCode GitHub", "https://github.com/sst/opencode")],
  [/factory/i, official("Factory 官方资料", "https://www.factory.ai/news")],
  [/\bamp\b/i, official("Amp Changelog", "https://ampcode.com/news")],
  [/qoder/i, official("Qoder 官方博客", "https://qoder.com/blog")],
  [/manus/i, official("Manus 官方资料", "https://manus.im/")],
  [/openclaw/i, project("OpenClaw GitHub", "https://github.com/openclaw/openclaw")],
  [/hermes/i, project("Hermes Agent GitHub", "https://github.com/NousResearch/hermes-agent")],
  [/^v0$/i, official("Vercel v0 Changelog", "https://vercel.com/changelog?type=v0")],
  [/amazon q/i, official("AWS · Amazon Q Developer", "https://aws.amazon.com/q/developer/")],
  [/bolt\.new/i, official("StackBlitz · Bolt", "https://stackblitz.com/bolt")],
  [/lovable/i, official("Lovable 官方博客", "https://lovable.dev/blog")],
  [/windsurf/i, official("Windsurf Changelog", "https://windsurf.com/changelog")],
  [/junie/i, official("JetBrains Junie", "https://www.jetbrains.com/junie/")],
  [/trae/i, official("TRAE 官方资料", "https://www.trae.ai/")],
  [/baidu comate/i, official("Baidu Comate", "https://comate.baidu.com/")],
  [/codebuddy|workbuddy/i, official("Tencent Cloud CodeBuddy", "https://www.codebuddy.ai/")],
];

export function getNodeResearch(node) {
  const specific = sourceById.get(node.id);
  const fallback = sourceRules.find(([pattern]) => pattern.test(node.title))?.[1];
  const resolved = specific || fallback || (node.section === "tech"
    ? paper("arXiv 相关研究检索", `https://arxiv.org/search/?query=${encodeURIComponent(node.title)}&searchtype=all`)
    : project("原始研究时间线", publicAssetUrl("AI-Coding-Evolution-Timeline.pdf")));
  return { ...resolved, date: preciseDateById[node.id] || node.date };
}

export function getPublishedDate(node) {
  return getNodeResearch(node).date;
}

export const sourceCoverage = {
  exactDates: Object.keys(preciseDateById).length,
  directSources: sourceById.size,
};
