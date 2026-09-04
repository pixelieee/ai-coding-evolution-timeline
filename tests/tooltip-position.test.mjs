import test from "node:test";
import assert from "node:assert/strict";
import { positionHoverCard } from "../src/tooltipPosition.js";

const card = { width: 276, height: 190 };
const viewport = { width: 1440, height: 900 };

test("prefers below with a gap after the complete node caption", () => {
  const anchor = { left: 820, top: 300, bottom: 348, centerX: 839 };
  const result = positionHoverCard(anchor, card, viewport);
  assert.equal(result.placement, "below");
  assert.equal(result.top, anchor.bottom + 18);
  assert.equal(result.hidden, false);
  assert.equal(result.left + result.arrowLeft, anchor.centerX);
});

test("flips above at the bottom without covering the source", () => {
  const anchor = { left: 800, top: 815, bottom: 859, centerX: 819 };
  const result = positionHoverCard(anchor, card, viewport);
  assert.equal(result.placement, "above");
  assert.equal(result.top + card.height, anchor.top - 18);
  assert.ok(result.top >= 12);
  assert.equal(result.hidden, false);
});

test("keeps the full preview within either horizontal edge", () => {
  for (const left of [-10, 4, 1415]) {
    const result = positionHoverCard({ left, top: 400, bottom: 444, centerX: left + 19 }, card, viewport);
    assert.ok(result.left >= 12);
    assert.ok(result.left + card.width <= viewport.width - 12);
    assert.ok(result.arrowLeft >= 18 && result.arrowLeft <= card.width - 18);
  }
});

test("uses actual preview height when deciding whether to flip", () => {
  const anchor = { left: 500, top: 555, bottom: 599, centerX: 519 };
  assert.equal(positionHoverCard(anchor, { ...card, height: 190 }, viewport).placement, "below");
  const taller = positionHoverCard(anchor, { ...card, height: 300 }, viewport);
  assert.equal(taller.placement, "above");
  assert.equal(taller.top + 300, anchor.top - 18);
});

test("all visible placements avoid their source and viewport edges", () => {
  for (const height of [600, 720, 900, 1348]) {
    for (let top = 280; top < height - 60; top += 24) {
      const anchor = { left: 900, top, bottom: top + 48, centerX: 919 };
      const result = positionHoverCard(anchor, card, { ...viewport, height });
      if (result.hidden) continue;
      assert.ok(result.top >= 12);
      assert.ok(result.top + card.height <= height - 12);
      assert.ok(result.top >= anchor.bottom + 18 || result.top + card.height <= anchor.top - 18);
    }
  }
});

test("does not cover the source when the viewport cannot fit a preview", () => {
  const result = positionHoverCard({ left: 60, top: 120, bottom: 168, centerX: 79 }, card, { width: 800, height: 300 });
  assert.equal(result.hidden, true);
});
