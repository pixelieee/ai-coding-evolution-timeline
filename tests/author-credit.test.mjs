import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");

test("shared author credit displays the exact GitHub username with a safe new-tab link", () => {
  const credit = app.slice(app.indexOf("function AuthorCredit()"), app.indexOf("function RefinementMenu("));
  assert.match(credit, /href="https:\/\/github.com\/pixelieee" target="_blank" rel="noopener noreferrer"/);
  assert.match(credit, /<span>pixelieee<\/span>/);
  assert.match(credit, /aria-label="pixelieee 的 GitHub 主页（在新标签页打开）"/);
  assert.match(credit, /<GithubLogo[^>]*aria-hidden="true"/);
});

test("both views include one bottom credit without adding an overlay to the canvas", () => {
  assert.equal((app.match(/<AuthorCredit \/>/g) || []).length, 2);
  assert.match(app, /<footer className="library-footer"><AuthorCredit \/><\/footer>/);
  assert.match(app, /<div className="canvas-tools">\s*<div className="canvas-footer-meta"><AuthorCredit \/>/);
  assert.match(css, /\.author-credit \{[^}]*color: var\(--theme-secondary\);[^}]*font-size: var\(--text-ui\)/);
  assert.match(css, /\.canvas-footer-meta \{[^}]*flex-wrap: wrap/);
});
