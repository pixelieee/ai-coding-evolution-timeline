import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import nodes from "../src/nodes.json" with { type: "json" };

const metadataSource = readFileSync(new URL("../src/nodeMeta.jsx", import.meta.url), "utf8");
const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
const metadata = runInNewContext(metadataSource
  .replace(/^import .+;\r?$/gm, "")
  .replace(/^export \{.+\} from .+;\r?$/gm, "")
  .replace(/^export (const|function) /gm, "$1 ")
  + "\n({ getNodeSummary, getLongSummary });", { nodes, getPublishedDate: (node) => node.date });

const editorialProcessCopy = /原始 PDF 中|补充收录|当前记录到本节点|这条发展线的较早记录|这条发展线的下一条记录/;
const emptyWriting = /不等同|不表示|不意味着|不写成|不能按|不是[^。；]{0,28}而是|不只[^。；]{0,28}而是|需要指出|值得注意|总体而言|综上所述|赋能|颠覆|革命性|划时代|意义重大|前景广阔|极具价值|全新视角/;

test("all timeline cards have concise reader-facing summaries", () => {
  for (const node of nodes) {
    const summary = metadata.getNodeSummary(node);
    assert.ok(summary.length >= 12, `${node.id} needs a specific summary`);
    assert.ok(summary.length <= 110, `${node.id} summary is too long (${summary.length})`);
    assert.doesNotMatch(summary, editorialProcessCopy, node.id);
    assert.doesNotMatch(summary, emptyWriting, node.id);
  }
});

test("drawer details contain facts instead of generated editorial narration", () => {
  for (const node of nodes) {
    const detail = metadata.getLongSummary(node);
    assert.doesNotMatch(detail, editorialProcessCopy, node.id);
    assert.doesNotMatch(detail, emptyWriting, node.id);
    assert.equal(detail, [node.detail, node.dateNote].filter(Boolean).join(" "), node.id);
  }
  assert.doesNotMatch(app, /SOURCE #|补充 #|Research milestone|补充来源/);
  assert.match(app, /<h3>说明<\/h3>/);
  assert.match(app, /来源 · \{selectedResearch\.kind\}/);
});
