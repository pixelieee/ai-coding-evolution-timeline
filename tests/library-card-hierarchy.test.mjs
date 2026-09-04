import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
const card = app.slice(app.indexOf('<span className="library-card-top">'), app.indexOf('<nav className="library-pagination"'));

test("archive cards lead with the node identity, then category/date, summary and secondary metadata", () => {
  const identity = card.slice(0, card.indexOf('className="library-card-classification"'));
  assert.match(identity, /<BrandMark node=\{node\} \/>/);
  assert.match(identity, /<strong>\{node.title\}<\/strong>/);
  assert.doesNotMatch(identity, /<time/);
  assert.match(card, /<time dateTime=\{publishedDate\}>\{publishedDate\}<\/time>/);
  const parts = ['library-card-top', 'library-card-classification', 'library-card-body', 'library-card-foot'].map((name) => card.indexOf(name));
  assert.ok(parts.every((value, index) => value >= 0 && (!index || value > parts[index - 1])));
  assert.equal((card.match(/\{node.title\}/g) || []).length, 1);
  assert.match(card, /getNodeSummary\(node\)/);
  assert.match(card, /research.kind/);
});

test("card hierarchy uses readable, wrapping titles and subdued exact dates", () => {
  const title = css.match(/\.library-card-meta > strong \{([^}]+)\}/)[1];
  assert.match(title, /font-size: 1\.125rem/);
  assert.match(title, /overflow-wrap: anywhere/);
  assert.doesNotMatch(title, /nowrap|ellipsis|line-clamp/);
  const date = css.match(/\.library-card-classification time \{([^}]+)\}/)[1];
  assert.match(date, /font-size: var\(--text-ui\)/);
  assert.match(date, /font-weight: 400/);
  assert.match(css, /\.library-node-card\.selected \.library-card-meta > strong/);
});
