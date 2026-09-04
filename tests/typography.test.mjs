import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { MILESTONE_LABEL_WIDTH, MIN_LANE_HEIGHT, milestoneTextStyle } from "../src/timelineTypography.js";
import { YEAR_LABEL_WIDTH, YEAR_LABEL_ROW_HEIGHT } from "../src/timelineNavigation.js";

const css = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
const rules = (selector) => css.split("\n").filter((line) => line.trim().startsWith(`${selector} {`));

test("readable rem type scale leaves page-title sizes intact", () => {
  for (const token of ["--text-body: 1rem", "--text-ui: .875rem", "--text-meta: .8125rem", "--text-micro: .75rem"]) {
    assert.ok(css.includes(token));
  }
  assert.match(rules(".library-heading h1")[0], /font-size: clamp\(38px,3.2vw,52px\)/);
  assert.match(rules(".panorama-toolbar h1")[0], /font-size: 24px/);
  for (const selector of [".library-card-body > small", ".global-milestone-tooltip p", ".drawer-lede", ".drawer-summary p"]) {
    assert.ok(rules(selector).every((rule) => rule.includes("font-size: var(--text-body)")), selector);
  }
});

test("archive cards grow and mobile stage labels retain readable sizes", () => {
  assert.ok(rules(".library-node-card").every((rule) => rule.includes("height: auto")));
  assert.ok(rules(".stage-labels span").every((rule) => rule.includes("font-size: var(--text-ui)")));
  assert.match(rules(".library-card-body > small")[0], /-webkit-line-clamp: unset/);
  assert.match(rules(".evolution-rail button")[0], /12px 6\.4rem minmax\(0,1fr\)/);
});

test("larger timeline captions keep two-line names and exact dates inside their lanes", () => {
  for (const zoom of [.4, 1, 1.16, 2.5]) {
    const style = milestoneTextStyle(zoom);
    assert.equal(parseFloat(style["--milestone-date-size"]) * 16, 14 * zoom);
    const titleLine = parseFloat(style["--milestone-title-line"]) * 16;
    const dateLine = parseFloat(style["--milestone-date-line"]) * 16;
    assert.ok(2 * titleLine + dateLine + (2 + 12) * zoom < MIN_LANE_HEIGHT * zoom);
    assert.ok(MILESTONE_LABEL_WIDTH * zoom > 10 * 14 * .65 * zoom);
  }
  assert.ok(YEAR_LABEL_WIDTH >= 4 * 14 * .65 + 12);
  assert.ok(YEAR_LABEL_ROW_HEIGHT >= 14 * 1.35);
});
