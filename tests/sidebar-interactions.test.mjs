import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { shouldCollapseAxis } from "../src/timelineInteractions.js";

function click({ inBand = true, excluded = false, ...event } = {}) {
  return {
    button: 0,
    defaultPrevented: false,
    target: { closest: (selector) => (selector === ".timeline-band" ? inBand : excluded) ? {} : null },
    ...event,
  };
}

test("swimlane clicks collapse an expanded rail, never reopen a collapsed one", () => {
  assert.equal(shouldCollapseAxis(click(), false), true);
  assert.equal(shouldCollapseAxis(click(), true), false);
});

test("rail, controls, outside clicks, canceled clicks and middle clicks do not collapse", () => {
  for (const event of [
    click({ excluded: true }), click({ inBand: false }),
    click({ defaultPrevented: true }), click({ button: 1 }), click({ button: 2 }),
  ]) assert.equal(shouldCollapseAxis(event, false), false);
});

test("node clicks retain selection and collapse only after the drag capture guard", () => {
  const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  assert.match(app, /onClickCapture=\{preventDragClick\} onClick=\{handleCanvasClick\}/);
  assert.match(app, /onClick=\{\(\) => \{ hoverDismissal.dismiss\(\); setSelected\(node\); \}\}/);
  const guard = app.match(/const preventDragClick = \(event\) => \{([\s\S]*?)\n  \};/)[1];
  assert.match(guard, /if \(!suppressClickRef.current\) return/);
  assert.match(guard, /event.stopPropagation\(\)/);
  assert.equal(shouldCollapseAxis(click(), false), true);
});

test("sidebar toggle uses one fixed-position panel icon with accessible expanded state", () => {
  const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  assert.match(app, /className="axis-title"[^>]*><button type="button" className="axis-collapse-toggle"/);
  assert.match(app, /aria-expanded=\{!axisCollapsed\}/);
  assert.match(app, /<SidebarSimple size=\{20\}/);
  assert.match(app, /id=\{`panorama-\$\{layout.id\}-axis`\}/);
});
