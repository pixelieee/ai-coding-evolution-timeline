import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");

test("panorama and archive share one complete-card black and amber selection surface", () => {
  const selection = css.match(/\.library-node-card\.selected,\s*\.milestone-node\.selected \.milestone-card \{([^}]+)\}/);
  assert.ok(selection, "both views must use the same selected-card rule");
  assert.match(selection[1], /background: #111/);
  assert.match(selection[1], /color: #fff/);
  assert.match(selection[1], /0 0 0 2px #fff,0 0 0 4px var\(--amber\)/);
  assert.ok(selection.index > css.indexOf(".milestone-node:focus-visible .milestone-card"));
  assert.ok(selection.index > css.indexOf(".milestone-node.located .milestone-card"));
});

test("selection keeps captions white and original logos on white without logo-only rings", () => {
  const caption = css.match(/\.milestone-node\.selected \.milestone-title,\.milestone-node\.selected \.milestone-date \{([^}]+)\}/);
  assert.match(caption[1], /color: #fff/);
  assert.ok(caption.index > css.indexOf(".milestone-node:focus-visible .milestone-title"));
  assert.match(css, /\.milestone-node\.selected \.milestone-logo \.brand-mark \{[^}]*background: #fff/);
  assert.match(css, /\.milestone-node\.selected \{ filter: none; \}/);
  assert.match(css, /\.milestone-node\.selected::before \{ content: none; \}/);
  assert.doesNotMatch(css, /\.milestone-node \.selected-check/);
});

test("complete panorama cards retain semantic selection and original node details", () => {
  const start = app.indexOf('<button key={node.id} data-node-id={node.id}');
  const node = app.slice(start, app.indexOf('</button>', start));
  assert.match(node, /aria-pressed=\{isSelected\}/);
  assert.match(node, /setSelected\(node\)/);
  assert.match(node, /onFocus=/);
  assert.match(node, /<BrandMark node=\{node\} compact orb \/>/);
  assert.match(node, /className="milestone-title">\{node.title\}/);
  assert.match(node, /className="milestone-date" dateTime=\{getPublishedDate\(node\)\}/);
  assert.doesNotMatch(node, /selected-check/);
});
