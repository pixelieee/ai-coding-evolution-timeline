import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { getPublishedDate, getNodeResearch } from "../src/nodeSources.js";
import { calendarDateCounts } from "../src/calendarDates.js";
import { buildTimelineYears, getCalendarTimelineNode, getLatestTimelineNode } from "../src/timelineNavigation.js";

const nodes = JSON.parse(readFileSync(new URL("../src/nodes.json", import.meta.url), "utf8"));
const metadataSource = readFileSync(new URL("../src/nodeMeta.jsx", import.meta.url), "utf8");
const metadata = runInNewContext(metadataSource
  .replace(/^import .+;\r?$/gm, "")
  .replace(/^export \{.+\} from .+;\r?$/gm, "")
  .replace(/^export (const|function) /gm, "$1 ")
  + "\n({ getSeriesKey, getEvolutionTrail, getLongSummary, getNodeSummary, getNodeTags, getDevelopmentStage, developmentStages });", { nodes, getPublishedDate });
const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
const buildLayout = runInNewContext(app.slice(app.indexOf("function buildEvolutionLayout("), app.indexOf("function matchesSearch("))
  + "\nbuildEvolutionLayout;", {
  ...metadata, buildTimelineYears, getPublishedDate,
  years: [2021, 2022, 2023, 2024, 2025, 2026],
  sections: ["products", "models", "tech"].map((id) => ({ id })),
});
const byId = (id) => nodes.find((node) => node.id === id);
const ids = (list) => Array.from(list, (node) => node.id);
const added = nodes.filter((node) => node.origin === "supplement");

test("the September refresh retains every original ID and adds exactly 20 unique records", () => {
  assert.equal(nodes.length, 212);
  assert.equal(new Set(nodes.map((node) => node.id)).size, 212);
  for (let id = 1; id <= 212; id++) assert.ok(byId(`node-${String(id).padStart(3, "0")}`));
  assert.equal(added.length, 20);
  assert.deepEqual(["products", "models", "tech"].map((section) => nodes.filter((node) => node.section === section).length), [91, 83, 38]);
});

test("supplementary nodes carry exact dates, explicit capability summaries and traceable sources", () => {
  for (const node of added) {
    assert.match(node.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(new Date(`${node.date}T00:00:00Z`).toISOString().slice(0, 10), node.date);
    assert.equal(node.year, Number(node.date.slice(0, 4)));
    assert.equal(getPublishedDate(node), node.date);
    assert.ok(node.date <= node.verifiedAt && node.verifiedAt === "2026-09-05");
    assert.equal(getNodeResearch(node).url, node.research.url);
    assert.equal(new URL(node.research.url).protocol, "https:");
    assert.equal(metadata.getNodeSummary(node), node.summary);
    assert.ok(node.summary.length > 20 && node.status);
    assert.equal(metadata.getDevelopmentStage(node).id, node.developmentStage);
    assert.ok(metadata.getNodeTags(node).includes(node.status));
    assert.doesNotMatch(metadata.getLongSummary(node), /在原始 PDF 中/);
    assert.equal(node.x, undefined, "new records must not invent original PDF coordinates");
  }
});

test("Flash, MiniMax and Fable development lines include the missing intermediate versions", () => {
  assert.deepEqual(ids(metadata.getEvolutionTrail(byId("node-205"))), ["node-153", "node-203", "node-204", "node-205"]);
  assert.deepEqual(ids(metadata.getEvolutionTrail(byId("node-208"))).slice(-3), ["node-146", "node-207", "node-208"]);
  assert.deepEqual(ids(metadata.getEvolutionTrail(byId("node-202"))), ["node-117", "node-202"]);
});

test("explicit branch anchors do not create false successors or merge sibling branches", () => {
  assert.deepEqual(ids(metadata.getEvolutionTrail(byId("node-193"))), ["node-006", "node-193"]);
  assert.deepEqual(ids(metadata.getEvolutionTrail(byId("node-195"))), ["node-006", "node-194", "node-195"]);
  assert.deepEqual(ids(metadata.getEvolutionTrail(byId("node-210"))), ["node-209", "node-210"]);
  assert.ok(!ids(metadata.getEvolutionTrail(byId("node-138"))).includes("node-210"));
  assert.deepEqual(ids(metadata.getEvolutionTrail(byId("node-206"))), ["node-125", "node-212", "node-206"]);
  assert.ok(!ids(metadata.getEvolutionTrail(byId("node-129"))).includes("node-206"));
  assert.deepEqual(ids(metadata.getEvolutionTrail(byId("node-200"))), ["node-200"]);
  for (const node of added.filter((item) => item.branchFrom)) {
    assert.equal(byId(node.branchFrom).section, node.section);
    assert.ok(getPublishedDate(byId(node.branchFrom)) <= node.date);
  }
});

test("panorama and drawer use the same branch nodes at all zoom and rail sizes", () => {
  for (const zoom of [.4, 1, 2.5]) for (const axisWidth of [48, 340]) {
    const { layouts } = buildLayout(nodes, 340 * zoom, axisWidth, zoom);
    assert.equal(layouts.reduce((count, layout) => count + layout.nodes.length, 0), nodes.length);
    for (const layout of layouts) {
      assert.ok(layout.nodes.every((node) => Number.isFinite(node.left) && node.lane >= 0 && node.lane < 4));
      for (const chain of layout.chains) {
        const representative = layout.nodes.find((node) => node.series === chain.series);
        assert.deepEqual(ids(chain.nodes), ids(metadata.getEvolutionTrail(representative)));
        const dates = Array.from(chain.nodes, getPublishedDate);
        assert.deepEqual(dates, [...dates].sort());
      }
    }
  }
});

test("new dates show calendar dots and locate the actual first matching node", () => {
  const { layouts } = buildLayout(nodes, 340, 340, 1);
  const matches = new Set(nodes.map((node) => node.id));
  const counts = calendarDateCounts(nodes.map(getPublishedDate));
  for (const date of new Set(added.map((node) => node.date))) {
    assert.ok(counts[date] > 0);
    const target = getCalendarTimelineNode(layouts, matches, date, getPublishedDate);
    assert.equal(target.date, date);
    assert.ok(Number.isFinite(target.node.left));
  }
  const latest = getLatestTimelineNode(layouts, matches, getPublishedDate);
  assert.equal(latest.node.id, "node-201");
  assert.equal(latest.date, "2026-09-03");
});

test("corrections preserve provenance, uncertainty and limited availability", () => {
  assert.equal(getNodeResearch(byId("node-129")).url, "https://api-docs.deepseek.com/news/news260813/");
  assert.equal(getNodeResearch(byId("node-125")).url, "https://api-docs.deepseek.com/news/news260424/");
  assert.match(metadata.getLongSummary(byId("node-134")), /日期待核/);
  assert.equal(getPublishedDate(byId("node-134")), "2026-08-28");
  assert.match(metadata.getLongSummary(byId("node-201")), /首批|逐步开放/);
  assert.match(metadata.getLongSummary(byId("node-202")), /相同模型、不同安全限制/);
  assert.match(metadata.getLongSummary(byId("node-200")), /默认关闭.*管理员/);
  assert.match(metadata.getLongSummary(byId("node-206")), /实验版本/);
  assert.match(app, /selectedResearch\.references\?\.map/);
  assert.match(app, /selected\.origin === "supplement" \? "补充 #"/);
});
