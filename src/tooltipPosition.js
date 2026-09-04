const EDGE_GAP = 12;
const ANCHOR_GAP = 18;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export function positionHoverCard(anchor, card, viewport) {
  const below = viewport.height - EDGE_GAP - anchor.bottom - ANCHOR_GAP;
  const above = anchor.top - EDGE_GAP - ANCHOR_GAP;
  const placement = below >= card.height || below >= above ? "below" : "above";
  const left = clamp(anchor.left - 14, EDGE_GAP, Math.max(EDGE_GAP, viewport.width - card.width - EDGE_GAP));
  const top = placement === "below"
    ? anchor.bottom + ANCHOR_GAP
    : anchor.top - ANCHOR_GAP - card.height;

  return {
    left,
    top,
    placement,
    arrowLeft: clamp(anchor.centerX - left, 18, card.width - 18),
    // In an exceptionally short viewport, keep the source card readable;
    // clicking the node still opens the full detail drawer.
    hidden: Math.max(below, above) < card.height || card.width > viewport.width - EDGE_GAP * 2,
  };
}
