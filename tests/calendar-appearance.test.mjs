import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
const calendarCss = css.slice(css.indexOf(".refinement-panel.calendar-panel"), css.indexOf("@keyframes calendar-reveal"));

test("calendar selection uses black and amber across days and periods, not Windows blue", () => {
  assert.match(calendarCss, /--calendar-accent: var\(--amber\)/);
  assert.doesNotMatch(calendarCss, /#0067c0|#005ba9|#e5eff8/);
  assert.match(calendarCss, /\.calendar-cell\.selected \.calendar-cell-face \{[^}]*color: #fff; background: #111;[^}]*var\(--calendar-accent\)/);
  assert.match(calendarCss, /\.calendar-cell\.today:not\(\.selected\) \.calendar-cell-face/);
  assert.match(calendarCss, /\.calendar-cell:hover:not\(:disabled\):not\(\.selected\)/);
  assert.match(calendarCss, /button\[aria-pressed="true"\]:hover \{ color: #fff; background: #111/);
});

test("compact calendar keeps a complete six-week grid, readable labels and bounded panel", () => {
  assert.match(calendarCss, /width: min\(22\.5rem,calc\(100vw - 20px\)\)/);
  assert.match(calendarCss, /\.calendar-body \{ height: 17\.75rem/);
  assert.match(calendarCss, /\.calendar-days \{ height: 15\.75rem; grid-template-rows: repeat\(6/);
  assert.match(calendarCss, /\.calendar-weekdays \{ height: 1\.75rem;[^}]*margin-bottom: \.25rem/);
  assert.match(calendarCss, /\.calendar-cell \{[^}]*font-size: var\(--text-body\)/);
  assert.match(calendarCss, /\.calendar-cell-face \{[^}]*align-items: center; justify-content: center/);
  assert.match(calendarCss, /\.calendar-cell:focus-visible \.calendar-cell-face/);
  assert.match(app, /Math\.min\(600, mobile \? window.innerHeight - 136/);
  assert.match(css, /\.refinement-panel\.calendar-panel \{ left: auto; \}/);
});
