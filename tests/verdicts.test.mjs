import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import nodes from "../src/nodes.json" with { type: "json" };
import { verdicts, verdictTiers } from "../src/verdicts.js";

test("editorial verdicts reference unique existing timeline nodes", () => {
  const nodeIds = new Set(nodes.map((node) => node.id));
  const ratedIds = verdicts.map((entry) => entry.nodeId);
  assert.equal(new Set(ratedIds).size, ratedIds.length);
  assert.ok(verdicts.length >= 30);
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
  for (const label of ["HN", "Reddit", "X", "知乎", "中文社区"]) assert.ok(labels.has(label), label);
});

test("every tier and every timeline section is represented", () => {
  const tierIds = new Set(verdictTiers.map((tier) => tier.id));
  for (const tier of tierIds) assert.ok(verdicts.some((entry) => entry.tier === tier), tier);
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const sections = new Set(verdicts.map((entry) => nodeById.get(entry.nodeId).section));
  assert.deepEqual([...sections].sort(), ["models", "products", "tech"]);
});

test("the third view keeps ratings distinct from sourced node facts", () => {
  const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  const board = readFileSync(new URL("../src/VerdictBoard.jsx", import.meta.url), "utf8");
  assert.match(app, /从夯到拉/);
  assert.match(app, /viewMode === "verdict"/);
  assert.match(board, /官方负责举证，社区负责拆台/);
  assert.match(board, /硬数据 · 真实口碑 · 后续影响/);
  assert.match(board, /社区风向/);
  assert.match(board, /社区反馈是定性样本，不是投票/);
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
