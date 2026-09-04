import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("timeline and zoom sliders use a pointing hand rather than resize arrows", () => {
  const css = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
  for (const selector of [".scrubber-row input", ".zoom-slider", ".year-jumps button", ".month-lens-ticks button"]) {
    const rule = css.slice(css.indexOf(`${selector} {`)).split("}")[0];
    assert.match(rule, /cursor:\s*pointer\s*;/, selector);
    assert.doesNotMatch(rule, /cursor:\s*(?:ew|col)-resize\s*;/, selector);
  }
});
