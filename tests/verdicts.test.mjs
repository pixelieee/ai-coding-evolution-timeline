import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import nodes from "../src/nodes.json" with { type: "json" };
import { verdicts, verdictTiers } from "../src/verdicts.js";

test("editorial verdicts reference unique existing timeline nodes", () => {
  const nodeIds = new Set(nodes.map((node) => node.id));
  const ratedIds = verdicts.map((entry) => entry.nodeId);
  assert.equal(new Set(ratedIds).size, ratedIds.length);
  assert.equal(verdicts.length, nodes.length);
  assert.deepEqual(new Set(ratedIds), new Set(nodes.map((node) => node.id)));
  for (const entry of verdicts) {
    assert.ok(nodeIds.has(entry.nodeId), entry.nodeId);
    assert.ok(entry.review.length >= 24, `${entry.nodeId} needs a substantive review`);
    assert.ok(entry.evidence.length >= 24, `${entry.nodeId} needs a public evidence statement`);
    assert.ok(entry.community.length >= 24, `${entry.nodeId} needs a community signal`);
    assert.match(entry.source.url, /^https:\/\//, `${entry.nodeId} needs a public source`);
    assert.ok(entry.source.label.length >= 5, `${entry.nodeId} needs a source label`);
    for (const source of entry.communitySources) {
      assert.match(source.url, /^https:\/\//, `${entry.nodeId} has an invalid community source`);
      assert.ok(source.label.length >= 1, `${entry.nodeId} needs a community source label`);
    }
  }
});

test("community sampling covers global and Chinese developer networks", () => {
  const labels = new Set(verdicts.flatMap((entry) => entry.communitySources.map((source) => source.label)));
  for (const label of ["HN", "Reddit", "X", "知乎"]) assert.ok(labels.has(label), label);
});

test("community links stay on auditable first-party or established public platforms", () => {
  const allowed = new Set([
    "news.ycombinator.com", "reddit.com", "x.com", "zhihu.com", "xiaohongshu.com",
    "openai.com", "community.openai.com", "wired.com", "techcrunch.com", "theverge.com", "apps.apple.com",
  ]);
  for (const entry of verdicts) {
    for (const source of entry.communitySources) {
      const domain = new URL(source.url).hostname.replace(/^www\./, "");
      assert.ok(allowed.has(domain), `${entry.nodeId} uses an unreviewed community domain: ${domain}`);
    }
  }
});

test("every tier and every timeline section is represented", () => {
  const tierIds = new Set(verdictTiers.map((tier) => tier.id));
  for (const tier of tierIds) assert.ok(verdicts.some((entry) => entry.tier === tier), tier);
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const sections = new Set(verdicts.map((entry) => nodeById.get(entry.nodeId).section));
  assert.deepEqual([...sections].sort(), ["models", "products", "tech"]);
});

test("a superseded benchmark keeps its historical rating when the evidence still matters", () => {
  const verified = verdicts.find((entry) => entry.nodeId === "node-267");
  assert.equal(verified?.tier, "top");
  assert.match(verified?.review || "", /行业通用尺子.*高分不再等于/);
  assert.match(verified?.evidence || "", /59\.4%.*停止报告/);
});

test("the bottom tier includes recognizable, evidence-backed failures", () => {
  const byId = new Map(verdicts.map((entry) => [entry.nodeId, entry]));
  assert.equal(byId.get("node-289")?.tier, "drag");
  assert.match(byId.get("node-289")?.review || "", /死循环.*API/);
  assert.equal(byId.get("node-290")?.tier, "drag");
  assert.match(byId.get("node-290")?.evidence || "", /75 美元.*150 美元.*2025-07-14/);
  assert.equal(byId.get("node-291")?.tier, "drag");
  assert.match(byId.get("node-291")?.review || "", /应用商店.*插件/);
  assert.equal(byId.get("node-292")?.tier, "drag");
  assert.match(byId.get("node-292")?.evidence || "", /2022-06-23.*2024-04-30.*Amazon Q/);
  assert.equal(byId.get("node-009")?.tier, "solid");
  assert.equal(byId.get("node-074")?.tier, "solid");
});

test("personal agent milestones are all rated", () => {
  const ratedIds = new Set(verdicts.map((entry) => entry.nodeId));
  for (const nodeId of ["node-282", "node-283", "node-284", "node-285", "node-286", "node-287", "node-288"]) {
    assert.ok(ratedIds.has(nodeId), `${nodeId} is missing from the verdict board`);
  }
});

test("verdict board supports full-catalog search and collapsible tiers", () => {
  const board = readFileSync(new URL("../src/VerdictBoard.jsx", import.meta.url), "utf8");
  assert.match(board, /搜索全部锐评/);
  assert.match(board, /collapsedTiers/);
  assert.match(board, /tierEntries\.length/);
});

test("the third view keeps ratings distinct from sourced node facts", () => {
  const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  const board = readFileSync(new URL("../src/VerdictBoard.jsx", import.meta.url), "utf8");
  assert.match(app, /从夯到拉/);
  assert.match(app, /viewMode === "verdict"/);
  assert.doesNotMatch(board, /官方负责举证，社区负责拆台/);
  assert.doesNotMatch(board, /硬数据 · 真实口碑 · 后续影响/);
  assert.match(board, /社区风向/);
  assert.match(board, /全部时间线节点均已入榜/);
  assert.match(board, /verdict-source/);
  assert.match(board, /onSelect\(node\)/);
});

test("tier numbers are plain text and cannot inherit the retired circle style", () => {
  const board = readFileSync(new URL("../src/VerdictBoard.jsx", import.meta.url), "utf8");
  const css = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
  assert.match(board, /<em className="verdict-grade">\{tier\.grade\}<\/em>/);
  assert.doesNotMatch(board, /<span>\{tier\.grade\}<\/span>/);
  assert.doesNotMatch(css, /\.verdict-grade\s*\{[^}]*border[^}]*\}/);
  assert.doesNotMatch(css, /\.verdict-tier-label\s*>\s*span/);
});

test("mobile verdict headings avoid unexplained taglines", () => {
  const board = readFileSync(new URL("../src/VerdictBoard.jsx", import.meta.url), "utf8");
  assert.doesNotMatch(board, /看它改变了什么、扩散到哪里、今天还剩下什么/);
  assert.doesNotMatch(board, /\{tier\.subtitle\}/);
});

test("verdict hero does not render a methodology card", () => {
  const board = readFileSync(new URL("../src/VerdictBoard.jsx", import.meta.url), "utf8");
  const css = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
  assert.doesNotMatch(board, /verdict-method/);
  assert.doesNotMatch(css, /\.verdict-method/);
});
