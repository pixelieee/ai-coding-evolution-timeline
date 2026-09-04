import OpenAIIcon from "@lobehub/icons/es/OpenAI/components/Mono.js";
import { PlugsConnected } from "@phosphor-icons/react";
import AnthropicIcon from "@lobehub/icons/es/Anthropic/components/Mono.js";
import ClaudeIcon from "@lobehub/icons/es/Claude/components/Color.js";
import ClaudeCodeIcon from "@lobehub/icons/es/ClaudeCode/components/Color.js";
import DeepSeekIcon from "@lobehub/icons/es/DeepSeek/components/Color.js";
import QwenIcon from "@lobehub/icons/es/Qwen/components/Color.js";
import MiniMaxIcon from "@lobehub/icons/es/Minimax/components/Color.js";
import GeminiIcon from "@lobehub/icons/es/Gemini/components/Color.js";
import GeminiCliIcon from "@lobehub/icons/es/GeminiCLI/components/Color.js";
import GoogleIcon from "@lobehub/icons/es/Google/components/Color.js";
import MicrosoftIcon from "@lobehub/icons/es/Microsoft/components/Color.js";
import GithubCopilotIcon from "@lobehub/icons/es/GithubCopilot/components/Mono.js";
import CursorIcon from "@lobehub/icons/es/Cursor/components/Mono.js";
import ReplitIcon from "@lobehub/icons/es/Replit/components/Color.js";
import WindsurfIcon from "@lobehub/icons/es/Windsurf/components/Mono.js";
import ClineIcon from "@lobehub/icons/es/Cline/components/Mono.js";
import AmpIcon from "@lobehub/icons/es/Amp/components/Color.js";
import AntigravityIcon from "@lobehub/icons/es/Antigravity/components/Color.js";
import BaiduIcon from "@lobehub/icons/es/Baidu/components/Color.js";
import DevinIcon from "@lobehub/icons/es/Devin/components/Color.js";
import KiroIcon from "@lobehub/icons/es/Kiro/components/Color.js";
import LovableIcon from "@lobehub/icons/es/Lovable/components/Color.js";
import OpenCodeIcon from "@lobehub/icons/es/OpenCode/components/Mono.js";
import ManusIcon from "@lobehub/icons/es/Manus/components/Mono.js";
import MetaIcon from "@lobehub/icons/es/Meta/components/Color.js";
import PiIcon from "@lobehub/icons/es/Pi/components/Mono.js";
import TraeIcon from "@lobehub/icons/es/Trae/components/Color.js";
import CodeBuddyIcon from "@lobehub/icons/es/CodeBuddy/components/Color.js";
import AwsIcon from "@lobehub/icons/es/Aws/components/Color.js";
import JunieIcon from "@lobehub/icons/es/Junie/components/Color.js";
import VercelIcon from "@lobehub/icons/es/Vercel/components/Mono.js";
import QoderIcon from "@lobehub/icons/es/Qoder/components/Color.js";
import OpenClawIcon from "@lobehub/icons/es/OpenClaw/components/Color.js";
import HermesAgentIcon from "@lobehub/icons/es/HermesAgent/components/Mono.js";
import CodexIcon from "@lobehub/icons/es/Codex/components/Color.js";
import { getNodeResearch } from "./nodeSources.js";
import { publicAssetUrl } from "./siteAssets.js";

const componentRules = [
  { pattern: /claude code/i, name: "Anthropic · Claude Code", Icon: ClaudeCodeIcon },
  { pattern: /claude/i, name: "Anthropic · Claude", Icon: ClaudeIcon },
  { pattern: /deepseek/i, name: "DeepSeek", Icon: DeepSeekIcon },
  { pattern: /qwen|通义/i, name: "Alibaba · Qwen", Icon: QwenIcon },
  { pattern: /minimax/i, name: "MiniMax", Icon: MiniMaxIcon },
  { pattern: /gemini cli/i, name: "Google · Gemini CLI", Icon: GeminiCliIcon },
  { pattern: /gemini/i, name: "Google · Gemini", Icon: GeminiIcon },
  { pattern: /google jules|alphacode/i, name: "Google", Icon: GoogleIcon },
  { pattern: /copilot/i, name: "GitHub Copilot", Icon: GithubCopilotIcon },
  { pattern: /cursor/i, name: "Cursor", Icon: CursorIcon },
  { pattern: /replit/i, name: "Replit", Icon: ReplitIcon },
  { pattern: /windsurf/i, name: "Windsurf", Icon: WindsurfIcon },
  { pattern: /cline/i, name: "Cline", Icon: ClineIcon },
  { pattern: /^amp(?:\s|$)/i, name: "Sourcegraph · Amp", Icon: AmpIcon },
  { pattern: /antigravity/i, name: "Google · Antigravity", Icon: AntigravityIcon },
  { pattern: /baidu/i, name: "Baidu", Icon: BaiduIcon },
  { pattern: /devin/i, name: "Cognition · Devin", Icon: DevinIcon },
  { pattern: /kiro/i, name: "Kiro", Icon: KiroIcon },
  { pattern: /lovable/i, name: "Lovable", Icon: LovableIcon },
  { pattern: /opencode/i, name: "OpenCode", Icon: OpenCodeIcon },
  { pattern: /manus/i, name: "Manus", Icon: ManusIcon },
  { pattern: /code llama/i, name: "Meta", Icon: MetaIcon },
  { pattern: /^pi coding/i, name: "Pi", Icon: PiIcon },
  { pattern: /^trae$/i, name: "TRAE", Icon: TraeIcon },
  { pattern: /codebuddy|workbuddy/i, name: "Tencent · CodeBuddy", Icon: CodeBuddyIcon },
  { pattern: /amazon q/i, name: "AWS", Icon: AwsIcon },
  { pattern: /junie/i, name: "JetBrains · Junie", Icon: JunieIcon },
  { pattern: /^v0$/i, name: "Vercel · v0", Icon: VercelIcon },
  { pattern: /qoder/i, name: "Qoder", Icon: QoderIcon },
  { pattern: /openclaw/i, name: "OpenClaw", Icon: OpenClawIcon },
  { pattern: /hermes/i, name: "Nous Research · Hermes", Icon: HermesAgentIcon },
  { pattern: /codex/i, name: "OpenAI · Codex", Icon: CodexIcon },
  { pattern: /openai|chatgpt|\bgpt|\bo\d|deep research|operator/i, name: "OpenAI", Icon: OpenAIIcon },
];

const fileRules = [
  { pattern: /kimi/i, name: "Moonshot AI · Kimi", source: "/logos/vector/kimi-official.svg" },
  { pattern: /\bglm|zcode/i, name: "Z.ai · GLM", source: "/logos/vector/z-ai-official.svg" },
  { pattern: /^aider$/i, name: "Aider", source: "/logos/vector/aider.svg" },
  { pattern: /^continue$/i, name: "Continue", source: "/logos/vector/continue.svg" },
  { pattern: /bolt\.new/i, name: "StackBlitz · Bolt", source: "/logos/vector/bolt.svg" },
  { pattern: /factory droids/i, name: "Factory", source: "/logos/vector/factory.svg" },
  { pattern: /^swe-agent$/i, name: "SWE-agent", source: "/logos/vector/swe-agent.svg" },
  { pattern: /^cody$/i, name: "Sourcegraph · Cody", source: "/logos/vector/sourcegraph.svg" },
];

const technicalSourceMarks = new Map([
  ["node-211", { name: "Agent Plugins · 开放插件标准", Icon: PlugsConnected }],
  ["node-164", { name: "Anthropic", Icon: AnthropicIcon }],
  ["node-166", { name: "OpenAI", Icon: OpenAIIcon }],
  ["node-168", { name: "Shopify", source: "/logos/vector/shopify.svg" }],
  ["node-173", { name: "Factory", source: "/logos/vector/factory.svg" }],
  ["node-178", { name: "Microsoft", Icon: MicrosoftIcon }],
  ["node-183", { name: "Google DeepMind", Icon: GoogleIcon }],
]);

export function resolveBrand(node) {
  if (node.section === "tech") {
    const institutionalMark = technicalSourceMarks.get(node.id);
    if (institutionalMark) return institutionalMark;

    const research = getNodeResearch(node);
    if (research.kind === "论文 / 研究") {
      return { name: "arXiv · 论文来源", source: "/logos/vector/arxiv.svg" };
    }

    return { name: research.label || "研究来源", source: "/logos/vector/arxiv.svg" };
  }
  // Match the actual milestone title. Combined PDF track labels such as
  // "GLM / MiniMax" and "Qwen / Kimi" must not leak a neighbour's logo.
  const text = node.title;
  const file = fileRules.find((rule) => rule.pattern.test(node.title));
  if (file) return file;
  const component = componentRules.find((rule) => rule.pattern.test(text));
  return component || { name: "AI Coding" };
}

export function getBrandName(node) {
  return resolveBrand(node).name;
}

export function hasBrandMark(node) {
  const brand = resolveBrand(node);
  return Boolean(brand.Icon || brand.source);
}

export function BrandMark({ node, compact = false, orb = false }) {
  const brand = resolveBrand(node);
  if (!brand.Icon && !brand.source) return null;
  const className = `brand-mark ${compact ? "compact" : ""} ${orb ? "orb" : ""}`;

  return (
    <span className={className} title={`${brand.name} · SVG vector`} role="img" aria-label={`${brand.name} 标识`}>
      {brand.Icon ? <brand.Icon size="100%" aria-hidden="true" /> : <img src={publicAssetUrl(brand.source)} alt="" />}
    </span>
  );
}
