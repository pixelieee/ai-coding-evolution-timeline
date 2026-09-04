import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");

test("shared logo frame centers both inline SVG and image assets", () => {
  const frame = css.match(/\.brand-mark\s*\{([^}]+)\}/)?.[1];
  assert.ok(frame);
  for (const declaration of ["display: flex", "align-items: center", "justify-content: center"]) {
    assert.ok(frame.includes(declaration), declaration);
  }
});

test("archive and tooltip text layout cannot override sibling logo frames", () => {
  for (const [parent, textClass] of [
    ["library-card-top", "library-card-meta"],
    ["tooltip-heading", "tooltip-heading-text"],
  ]) {
    assert.ok(app.includes(`className="${textClass}"`));
    assert.match(css, new RegExp(`\\.${textClass}\\s*\\{[^}]*display: grid`));
    assert.doesNotMatch(css, new RegExp(`\\.${parent}\\s*>\\s*span\\s*\\{`));
  }
});

test("monochrome logo ink stays dark on white independently of selected-card text", () => {
  const frame = css.match(/\.brand-mark\s*\{([^}]+)\}/)?.[1];
  assert.match(frame, /(?:^|;)\s*color:\s*#111\s*;/);
  assert.match(frame, /background:\s*#fff\s*;/);

  for (const selector of [
    ".library-node-card.selected .brand-mark",
    ".milestone-node.selected .milestone-logo .brand-mark",
  ]) {
    const start = css.indexOf(`${selector} {`);
    assert.ok(start >= 0, `missing selection rule: ${selector}`);
    const rule = css.slice(start, css.indexOf("}", start));
    assert.match(rule, /background:\s*#fff\s*;/);
    assert.doesNotMatch(rule, /(?:\{|;)\s*color:\s*(?:#fff(?:fff)?|white|inherit)\s*;/);
  }
});

test("logo color fix preserves vector artwork and does not recolor multicolor paths", () => {
  const brand = readFileSync(new URL("../src/brandAssets.jsx", import.meta.url), "utf8");
  assert.match(brand, /import OpenAIIcon from "@lobehub\/icons\/es\/OpenAI\/components\/Mono\.js"/);
  assert.match(brand, /<brand\.Icon size="100%" aria-hidden="true" \/>/);
  assert.match(brand, /<img src=\{publicAssetUrl\(brand.source\)\} alt="" \/>/);
  for (const rule of css.matchAll(/([^{}]+)\{([^{}]+)\}/g)) {
    if (!rule[1].includes(".brand-mark")) continue;
    assert.doesNotMatch(rule[2], /(?:^|;)\s*(?:fill|stroke|filter):/);
  }
});
