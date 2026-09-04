import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const svg = read("../public/site-mark.svg");
const html = read("../index.html");
const app = read("../src/App.jsx");
const css = read("../src/styles.css");

test("favicon and shared header reference the same local vector identity under the app base", () => {
  assert.match(html, /<link rel="icon" type="image\/svg\+xml" sizes="any" href="%BASE_URL%site-mark\.svg"/);
  assert.match(app, /<span className="brand-icon" aria-hidden="true"><img src=\{`\$\{import.meta.env.BASE_URL\}site-mark.svg`\} width="38" height="38" alt=""/);
  assert.doesNotMatch(app, /BookOpenText/);
  assert.match(svg, /viewBox="0 0 256 256"/);
});

test("the mark carries its own contrasting colors and no embedded images or external dependencies", () => {
  assert.match(svg, /fill="#191b1d"/);
  assert.match(svg, /fill="#f4f2ed"/);
  assert.match(svg, /fill="#e9b45b"/);
  assert.doesNotMatch(svg, /currentColor|<script|<image|href=|<filter|<animate/);
  assert.match(read("../public/brand/LICENSE.txt"), /Copyright \(c\) 2020 Phosphor Icons/);
});

test("header keeps fixed logo space, centered artwork and existing small-screen sizing", () => {
  assert.match(css, /\.brand-icon \{[^}]*width: 38px;[^}]*height: 38px;[^}]*flex: 0 0 38px/);
  assert.match(css, /\.brand-icon img \{[^}]*width: 100%;[^}]*height: 100%;[^}]*object-fit: contain/);
  assert.match(read("../src/theme.css"), /\.header-brand \.brand-icon \{ width: 30px; height: 30px; flex: 0 0 30px; \}/);
});
