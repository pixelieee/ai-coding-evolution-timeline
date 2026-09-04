import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { getPublishedDate } from "../src/nodeSources.js";

const nodes = JSON.parse(readFileSync(new URL("../src/nodes.json", import.meta.url), "utf8"));
const metadataSource = readFileSync(new URL("../src/nodeMeta.jsx", import.meta.url), "utf8");
const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
// Execute the real metadata rules without importing the UI-only SVG re-export.
const metadata = runInNewContext(metadataSource
  .replace(/^import .+;\r?$/gm, "")
  .replace(/^export \{.+\} from .+;\r?$/gm, "")
  .replace(/^export (const|function) /gm, "$1 ")
  + "\n({ getDevelopmentStage, getDevelopmentStages, getNodeTags });", { nodes, getPublishedDate });

test("section-specific labels preserve the four stable lane and filter keys", () => {
  const stages = metadata.getDevelopmentStages();
  for (const section of ["products", "models", "tech"]) {
    const scoped = metadata.getDevelopmentStages(section);
    assert.deepEqual(Array.from(scoped, (stage) => stage.id), Array.from(stages, (stage) => stage.id));
    assert.deepEqual(Array.from(scoped, (stage) => stage.number), ["01", "02", "03", "04"]);
    assert.ok(scoped.every((stage) => stage.label && stage.short && stage.description));
  }
});

test("the four disputed labels are replaced by concrete descriptions of their content", () => {
  const examples = [
    ["Cursor Composer", "products", "多文件编辑与应用生成"],
    ["GLM-5", "models", "复杂任务与持续执行"],
    ["ReAct", "tech", "推理与纠错"],
    ["MCP", "tech", "工具调用与任务训练"],
  ];
  for (const [title, section, label] of examples) {
    const node = nodes.find((item) => item.title === title && item.section === section);
    assert.ok(node, title);
    assert.equal(metadata.getDevelopmentStage(node).label, label);
  }
  assert.doesNotMatch(metadataSource + app, /上下文式开发|长程 Agent 模型|推理与行动机制|可验证训练/);
  assert.match(metadata.getDevelopmentStages("tech")[2].description, /工具协议本身不是训练方法/);
  assert.match(metadata.getDevelopmentStages("models")[3].description, /不是一种独立的模型架构/);
});

test("all 192 nodes and tags use their own section's stage vocabulary", () => {
  assert.equal(nodes.length, 192);
  assert.equal(new Set(nodes.map((node) => node.id)).size, 192);
  for (const node of nodes) {
    const stage = metadata.getDevelopmentStage(node);
    assert.ok(metadata.getDevelopmentStages(node.section).includes(stage), node.id);
    assert.ok(metadata.getNodeTags(node).includes(stage.label), node.id);
  }
});

test("automatic-improvement research is not presented as basic generation or reasoning", () => {
  for (const title of ["Voyager", "PromptBreeder", "STOP", "ADAS"]) {
    const node = nodes.find((item) => item.title === title && item.section === "tech");
    assert.ok(node, title);
    assert.equal(metadata.getDevelopmentStage(node).id, "orchestrate", title);
    assert.equal(metadata.getDevelopmentStage(node).label, "自动改进", title);
  }
  for (const title of ["MCP", "Function Calling"]) {
    const node = nodes.find((item) => item.title === title && item.section === "tech");
    assert.ok(node, title);
    assert.equal(metadata.getDevelopmentStage(node).id, "tool", title);
  }
});

test("navigation, scoped filters, results and search consume the shared labels", () => {
  assert.doesNotMatch(app, /stageLabelsBySection/);
  assert.match(app, /getDevelopmentStages\(layout.id\)\.map/);
  assert.match(app, /getDevelopmentStages\(section\)\.map/);
  assert.match(app, /getDevelopmentStages\(section\)\.find/);
  const refinements = app.match(/<RefinementMenu\b[^\n]+/g);
  assert.equal(refinements.length, 2);
  assert.ok(refinements.every((line) => line.includes("section={section}")));
  assert.match(app, /title=\{item.description\}/);
  const search = app.slice(app.indexOf("function matchesSearch("), app.indexOf("export default function"));
  assert.ok(search.includes("getDevelopmentStage(node).label"));
});
