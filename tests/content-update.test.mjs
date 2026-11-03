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

test("the refresh retains every original ID and keeps supplementary records sequential", () => {
  assert.equal(nodes.length, 281);
  assert.equal(new Set(nodes.map((node) => node.id)).size, nodes.length);
  for (let id = 1; id <= nodes.length; id++) assert.ok(byId(`node-${String(id).padStart(3, "0")}`));
  assert.equal(added.length, 89);
  assert.deepEqual(["products", "models", "tech"].map((section) => nodes.filter((node) => node.section === section).length), [113, 97, 71]);
});

test("supplementary nodes carry exact dates, explicit capability summaries and traceable sources", () => {
  for (const node of added) {
    assert.match(node.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(new Date(`${node.date}T00:00:00Z`).toISOString().slice(0, 10), node.date);
    assert.equal(node.year, Number(node.date.slice(0, 4)));
    assert.equal(getPublishedDate(node), node.date);
    assert.match(node.verifiedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(node.date <= node.verifiedAt);
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

test("model development lines include the missing intermediate versions", () => {
  assert.deepEqual(ids(metadata.getEvolutionTrail(byId("node-205"))), ["node-153", "node-203", "node-204", "node-205"]);
  assert.deepEqual(ids(metadata.getEvolutionTrail(byId("node-231"))).slice(-4), ["node-146", "node-207", "node-208", "node-231"]);
  assert.deepEqual(ids(metadata.getEvolutionTrail(byId("node-202"))), ["node-117", "node-202"]);
  assert.deepEqual(ids(metadata.getEvolutionTrail(byId("node-230"))).slice(-3), ["node-206", "node-224", "node-230"]);
  assert.deepEqual(ids(metadata.getEvolutionTrail(byId("node-240"))).slice(-3), ["node-188", "node-234", "node-240"]);
});

test("explicit branch anchors do not create false successors or merge sibling branches", () => {
  assert.deepEqual(ids(metadata.getEvolutionTrail(byId("node-193"))), ["node-006", "node-193"]);
  assert.deepEqual(ids(metadata.getEvolutionTrail(byId("node-195"))), ["node-006", "node-194", "node-195"]);
  assert.deepEqual(ids(metadata.getEvolutionTrail(byId("node-210"))), ["node-209", "node-210"]);
  assert.ok(!ids(metadata.getEvolutionTrail(byId("node-138"))).includes("node-210"));
  assert.deepEqual(ids(metadata.getEvolutionTrail(byId("node-206"))), ["node-125", "node-212", "node-206", "node-224", "node-230"]);
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
  assert.equal(latest.node.id, "node-244");
  assert.equal(latest.date, "2026-10-31");
});

test("corrections preserve provenance and evidence limits", () => {
  assert.equal(getNodeResearch(byId("node-129")).url, "https://api-docs.deepseek.com/news/news260813/");
  assert.equal(getNodeResearch(byId("node-125")).url, "https://api-docs.deepseek.com/news/news260424/");
  assert.match(metadata.getLongSummary(byId("node-134")), /日期待核/);
  assert.equal(getPublishedDate(byId("node-134")), "2026-08-28");
  assert.match(metadata.getLongSummary(byId("node-201")), /首批|逐步开放/);
  assert.match(metadata.getLongSummary(byId("node-202")), /相同模型、不同安全限制/);
  assert.match(metadata.getLongSummary(byId("node-200")), /默认关闭.*管理员/);
  assert.match(metadata.getLongSummary(byId("node-206")), /实验版本/);
  assert.match(metadata.getLongSummary(byId("node-232")), /11 月 4 日|不写成已完成开源/);
  assert.match(metadata.getLongSummary(byId("node-235")), /工程师设定目标、边界和风险.*尚未覆盖后继模型设计与训练/);
  assert.match(metadata.getLongSummary(byId("node-243")), /底层架构和训练细节未公开.*缺少独立复现/);
  assert.match(metadata.getLongSummary(byId("node-244")), /研究原型|不是正式 DeepSeek 产品/);
  assert.match(metadata.getLongSummary(byId("node-248")), /不会恢复原始源码|证据/);
  assert.match(metadata.getLongSummary(byId("node-251")), /模型外部 Harness|不是模型权重/);
  assert.match(metadata.getLongSummary(byId("node-257")), /内部系统|不适合普通仓库/);
  assert.match(metadata.getLongSummary(byId("node-258")), /内部部署|不应外推/);
  assert.match(metadata.getLongSummary(byId("node-259")), /专用 Harness.*特定负载和硬件/);
  assert.match(metadata.getLongSummary(byId("node-260")), /冻结执行任务的子 Agent|跨模型效果尚无独立验证/);
  assert.match(metadata.getLongSummary(byId("node-262")), /MCP.*不同/);
  assert.match(metadata.getLongSummary(byId("node-264")), /不是 A2A 的替代品/);
  assert.match(metadata.getLongSummary(byId("node-266")), /2\.1、3\.0、4\.0/);
  assert.match(metadata.getLongSummary(byId("node-267")), /停止报告|不再把高分/);
  assert.match(metadata.getLongSummary(byId("node-268")), /机器、噪声|统计稳定性/);
  assert.match(metadata.getLongSummary(byId("node-269")), /不是新的上下文算法|Linux Foundation/);
  assert.match(metadata.getLongSummary(byId("node-270")), /OpenDevin|不是单一闭源模型/);
  assert.match(metadata.getLongSummary(byId("node-271")), /Ubuntu.*Windows.*macOS|Verified\/2\.0.*按版本比较/);
  assert.match(metadata.getLongSummary(byId("node-272")), /实际存储和权限由应用负责|取决于应用层校验/);
  assert.match(metadata.getLongSummary(byId("node-273")), /Skills 封装做事方法.*MCP 连接外部工具|第三方 Skill.*独立审查/);
  assert.match(metadata.getLongSummary(byId("node-275")), /不是通用生产率结论/);
  assert.match(metadata.getLongSummary(byId("node-276")), /没有执行验证时.*不稳定/);
  assert.match(metadata.getLongSummary(byId("node-277")), /固定模型权重|错误验证器/);
  assert.match(metadata.getLongSummary(byId("node-278")), /交替更新 Harness 与模型策略|长期效果尚未验证/);
  assert.match(metadata.getLongSummary(byId("node-279")), /不自动解决.*权限|生产可靠性/);
  assert.match(metadata.getLongSummary(byId("node-280")), /模型外的执行脚手架|模型权重保持不变/);
  assert.match(metadata.getLongSummary(byId("node-281")), /不把 Symphony 当作.*独立产品|不作为通用收益/);
  assert.match(app, /selectedResearch\.references\?\.map/);
  assert.match(app, /selected\.origin === "supplement" \? "补充 #"/);
});
