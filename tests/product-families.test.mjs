import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { calendarDateCounts } from "../src/calendarDates.js";
import { getPublishedDate } from "../src/nodeSources.js";

const nodes = JSON.parse(readFileSync(new URL("../src/nodes.json", import.meta.url), "utf8"));
const metadataSource = readFileSync(new URL("../src/nodeMeta.jsx", import.meta.url), "utf8");
// This metadata module is plain JS with a UI re-export. Remove module declarations
// only, so tests exercise its real rules and summaries without loading SVG components.
const metadata = runInNewContext(metadataSource
  .replace(/^import .+;\r?$/gm, "")
  .replace(/^export \{.+\} from .+;\r?$/gm, "")
  .replace(/^export (const|function) /gm, "$1 ")
  + "\n({ getSeriesKey, getEvolutionTrail, getLongSummary, getNodeTags });", { nodes, getPublishedDate });

const expected = new Map([
  ["OpenAI Codex", ["node-062", "node-064", "node-065", "node-066", "node-067", "node-068", "node-071", "node-073"]],
  ["Google Jules", ["node-063"]],
  ["Google Gemini CLI", ["node-069"]],
  ["Google Antigravity", ["node-070", "node-072"]],
]);

test("the former mixed categories split into four exact, disjoint product families", () => {
  assert.equal(nodes.length, 192);
  assert.equal(new Set(nodes.map((node) => node.id)).size, 192);
  assert.ok(nodes.every((node) => !/Codex\s*\/\s*(Google|Jules)/i.test(node.family)));
  for (const [family, ids] of expected) {
    assert.deepEqual(nodes.filter((node) => node.family === family).map((node) => node.id).sort(), [...ids].sort());
  }
  const categories = new Set(nodes.filter((node) => node.section === "products").map((node) => node.family));
  assert.ok([...expected.keys()].every((family) => categories.has(family)));
});

test("each product's development line matches its family, including OpenAI-prefixed Codex names", () => {
  for (const [family, ids] of expected) {
    for (const id of ids) {
      const node = nodes.find((item) => item.id === id);
      assert.equal(metadata.getSeriesKey(node), family);
      const trail = metadata.getEvolutionTrail(node);
      assert.deepEqual(Array.from(trail, (item) => item.id).sort(), [...ids].sort());
      const dates = Array.from(trail, getPublishedDate);
      assert.deepEqual(dates, [...dates].sort());
      assert.equal(metadata.getNodeTags(node)[0], family);
    }
  }
});

test("Google summaries no longer claim a Codex predecessor, and Antigravity stays separate from Gemini CLI", () => {
  for (const id of ["node-063", "node-069", "node-070", "node-072"]) {
    const summary = metadata.getLongSummary(nodes.find((node) => node.id === id));
    assert.doesNotMatch(summary, /Codex/);
  }
  const antigravity = metadata.getLongSummary(nodes.find((node) => node.id === "node-070"));
  assert.match(antigravity, /Antigravity CLI/);
  assert.doesNotMatch(antigravity, /Gemini CLI/);
  const cli = metadata.getLongSummary(nodes.find((node) => node.id === "node-062"));
  assert.match(cli, /Codex Cloud/);
  assert.doesNotMatch(cli, /Jules|Google/);
});

test("Codex model and research categories remain distinct from the Codex product family", () => {
  const models = nodes.filter((node) => node.section === "models" && /codex/i.test(node.title));
  assert.ok(models.length > 0);
  for (const node of models) {
    assert.equal(metadata.getSeriesKey(node), "OpenAI Codex 模型");
    assert.ok(metadata.getEvolutionTrail(node).every((item) => item.section === "models"));
  }
  const research = nodes.find((node) => node.section === "tech" && /codex/i.test(node.title));
  assert.ok(research);
  assert.equal(metadata.getSeriesKey(research), research.family);
});

test("filter options, cards, details, and calendar counts all use the corrected source families", () => {
  const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  assert.match(app, /source.map\(\(node\) => node.family\)/);
  assert.match(app, /family === "all" \|\| node.family === family/);
  assert.match(app, /library-card-foot"><span>\{node.family\}/);
  assert.match(app, /<dt>细分轨道<\/dt><dd>\{selected.family\}/);
  for (const [family, ids] of expected) {
    const dates = nodes.filter((node) => node.family === family).map(getPublishedDate);
    const counts = calendarDateCounts(dates);
    assert.equal(Object.entries(counts).filter(([key]) => key.length === 10).reduce((total, [, count]) => total + count, 0), ids.length);
  }
});
