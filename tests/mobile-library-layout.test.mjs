import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const app = read("../src/App.jsx");
const css = read("../src/styles.css");
const libraryToolbar = app.slice(app.indexOf('<section className="library-toolbar">'), app.indexOf('<section className="library-results">'));

test("the library removes decorative result counts and keeps filter counts out of tabs", () => {
  assert.doesNotMatch(app, /ARCHIVE RESULTS/);
  assert.doesNotMatch(app, /filteredNodes\.length\} 个节点/);
  assert.doesNotMatch(libraryToolbar, /nodes\.length\}<\/span>/);
  assert.doesNotMatch(libraryToolbar, /sectionCounts\[item\.id\]\}<\/span>/);
});

test("mobile library controls use a deliberate three-row grid", () => {
  assert.match(css, /\.library-toolbar \{ display: grid; grid-template-columns: minmax\(0,1fr\) 44px 44px;/);
  assert.match(css, /\.library-search \{ grid-column: 1 \/ -1;/);
  assert.match(css, /\.category-tabs \{ grid-column: 1 \/ -1;[^}]*grid-template-columns: repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(css, /\.refinement-menu \{ grid-column: 2; width: 44px; \}/);
  assert.match(css, /\.icon-button \{ grid-column: 3; width: 44px; height: 44px; \}/);
});

test("mobile cards align identity controls and stay compact", () => {
  assert.match(css, /\.library-node-card \{ height: auto; min-height: 0; padding: 14px;/);
  assert.match(css, /\.library-card-top \{ grid-template-columns: 44px minmax\(0,1fr\) 18px;/);
  assert.match(css, /\.library-card-top > \.brand-mark,\.library-card-top > \.research-mark \{ width: 44px; height: 44px;/);
  assert.match(css, /\.library-card-body > small \{ display: -webkit-box; overflow: hidden;[^}]*-webkit-line-clamp: 4;/);
});
