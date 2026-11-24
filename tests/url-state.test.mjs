import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
const board = readFileSync(new URL("../src/VerdictBoard.jsx", import.meta.url), "utf8");

test("view and selected node are addressable through the URL", () => {
  assert.match(app, /new URLSearchParams\(window\.location\.search\)/);
  assert.match(app, /params\.set\("view", viewMode\)/);
  assert.match(app, /params\.set\("node", selected\.id\)/);
  assert.match(app, /history\.replaceState/);
  assert.match(app, /addEventListener\("popstate"/);
});

test("the library first screen states what this atlas is", () => {
  assert.match(app, /library-lede/);
  assert.match(app, /条锐评/);
  assert.match(app, /私人判决/);
});

test("verdict cards show the hard evidence instead of hiding it in a tooltip", () => {
  assert.match(board, /verdict-proof/);
  assert.match(board, /硬证据/);
});

test("counterpoints render on their own line", () => {
  assert.match(board, /verdict-opposition/);
  assert.match(board, /opposition/);
});
