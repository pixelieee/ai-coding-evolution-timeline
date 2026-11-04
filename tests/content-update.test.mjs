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
  assert.equal(nodes.length, 288);
  assert.equal(new Set(nodes.map((node) => node.id)).size, nodes.length);
  for (let id = 1; id <= nodes.length; id++) assert.ok(byId(`node-${String(id).padStart(3, "0")}`));
  assert.equal(added.length, 96);
  assert.deepEqual(["products", "models", "tech"].map((section) => nodes.filter((node) => node.section === section).length), [120, 97, 71]);
});

test("the personal-agent line covers the milestone products instead of only Grok Bot", () => {
  const titles = new Set(nodes.filter((node) => node.family === "Personal Agent").map((node) => node.title));
  for (const title of ["Kimi Agent", "Gemini Spark", "Instinct", "Meta Muse", "Manus Cue", "OpenAI Dots", "Wabi 2.0"]) {
    assert.ok(titles.has(title), title);
  }
  for (const node of nodes.filter((item) => titles.has(item.title))) {
    assert.equal(node.section, "products");
    assert.match(node.date, /^\d{4}-\d{2}-\d{2}$/);
  }
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
  assert.match(metadata.getLongSummary(byId("node-201")), /API 更新日志|随后几天开放/);
  assert.match(metadata.getLongSummary(byId("node-202")), /相同模型、不同安全限制/);
  assert.match(metadata.getNodeSummary(byId("node-200")), /默认关闭.*管理员/);
  assert.match(metadata.getLongSummary(byId("node-200")), /合并仍由仓库规则或维护者执行/);
  assert.match(metadata.getNodeSummary(byId("node-206")), /实验版本/);
  assert.match(metadata.getLongSummary(byId("node-232")), /11 月 4 日/);
  assert.match(metadata.getLongSummary(byId("node-235")), /工程师设定目标、边界和风险.*模型设计与训练仍由人负责/);
  assert.match(metadata.getLongSummary(byId("node-243")), /架构和训练细节未公开.*厂商评测/);
  assert.match(metadata.getLongSummary(byId("node-244")), /研究原型|只实现了部分设计/);
  assert.match(metadata.getLongSummary(byId("node-248")), /检查工具和证据|人工判断/);
  assert.match(metadata.getLongSummary(byId("node-251")), /模型外部 Harness.*模型权重保持不变/);
  assert.match(metadata.getLongSummary(byId("node-257")), /Anthropic 内部.*Agent 规模/);
  assert.match(metadata.getLongSummary(byId("node-258")), /内部部署/);
  assert.match(metadata.getLongSummary(byId("node-259")), /专用 Harness.*特定负载和硬件/);
  assert.match(metadata.getNodeSummary(byId("node-260")), /冻结执行任务的子 Agent/);
  assert.match(metadata.getLongSummary(byId("node-262")), /A2A.*Agent 间协作.*MCP.*工具和数据/);
  assert.match(metadata.getLongSummary(byId("node-264")), /ACP.*A2A/);
  assert.match(metadata.getLongSummary(byId("node-266")), /2\.1、3\.0、4\.0/);
  assert.match(metadata.getLongSummary(byId("node-267")), /停止报告.*SWE-Bench Pro/);
  assert.match(metadata.getLongSummary(byId("node-268")), /机器配置.*统计稳定性/);
  assert.match(metadata.getLongSummary(byId("node-269")), /轻量互操作约定.*AAIF/);
  assert.match(metadata.getLongSummary(byId("node-270")), /OpenDevin.*软件 Agent 平台/);
  assert.match(metadata.getLongSummary(byId("node-271")), /Ubuntu.*Windows.*macOS|Verified\/2\.0.*按版本比较/);
  assert.match(metadata.getLongSummary(byId("node-272")), /应用负责存储、权限和内容校验/);
  assert.match(metadata.getLongSummary(byId("node-273")), /Skills 封装做事方法.*MCP 连接外部工具|第三方 Skill.*审查/);
  assert.match(metadata.getLongSummary(byId("node-275")), /单个内部项目.*Harness/);
  assert.match(metadata.getLongSummary(byId("node-276")), /执行测试.*退化/);
  assert.match(metadata.getLongSummary(byId("node-277")), /固定模型权重|偏好对比集/);
  assert.match(metadata.getLongSummary(byId("node-278")), /交替更新 Harness 与模型策略|尚无开放环境/);
  assert.match(metadata.getLongSummary(byId("node-279")), /权限.*生产可靠性.*应用实现/);
  assert.match(metadata.getLongSummary(byId("node-280")), /模型外的执行脚手架|模型权重保持不变/);
  assert.match(metadata.getLongSummary(byId("node-281")), /最小编排参考.*内部使用/);
  assert.match(app, /selectedResearch\.references\?\.map/);
  assert.match(app, /<small>\{sectionMap\[selected\.section\]\.label\}<\/small>/);
  assert.doesNotMatch(app, /SOURCE #|补充 #/);
});
