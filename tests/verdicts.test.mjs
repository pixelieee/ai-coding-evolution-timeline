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
    assert.match(entry.source.url, /^https:\/\//, `${entry.nodeId} needs a public source`);
    assert.ok(entry.source.label.length >= 5, `${entry.nodeId} needs a source label`);
  }
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
  assert.match(board, /夯、顶级必须有跨生态采用或可复现实验/);
  assert.match(board, /判定依据/);
  assert.match(board, /verdict-source/);
  assert.match(board, /onSelect\(node\)/);
});
