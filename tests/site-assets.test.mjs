import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { publicAssetUrl } from "../src/siteAssets.js";
import { getNodeResearch } from "../src/nodeSources.js";

test("public assets resolve within root hosting and GitHub Pages project hosting", () => {
  for (const page of ["https://example.test/", "https://pixelieee.github.io/ai-coding-evolution-timeline/"]) {
    for (const path of ["/logos/vector/kimi-official.svg", "logos/vector/z-ai-official.svg", "AI-Coding-Evolution-Timeline.pdf"]) {
      assert.equal(new URL(publicAssetUrl(path), page).href, `${page}${path.replace(/^\//, "")}`);
    }
  }
  assert.equal(publicAssetUrl("/logo.svg", "/project/"), "/project/logo.svg");
  assert.equal(publicAssetUrl("/logo.svg", "/"), "/logo.svg");
});

test("file-backed marks use the base-aware helper and all referenced vectors exist", () => {
  const brands = readFileSync(new URL("../src/brandAssets.jsx", import.meta.url), "utf8");
  assert.match(brands, /src=\{publicAssetUrl\(brand.source\)\}/);
  for (const [, path] of brands.matchAll(/source: "(\/logos\/vector\/[^"\n]+)"/g)) {
    assert.ok(existsSync(new URL(`../public${path}`, import.meta.url)), path);
  }
  assert.equal(getNodeResearch({ id: "unknown", title: "Unknown", section: "products", date: "2026-01-01" }).url, "./AI-Coding-Evolution-Timeline.pdf");
});
