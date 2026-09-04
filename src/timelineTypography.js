// At 100%, allow two 18px name lines, an 18px date, a 2px gap and
// 12px card padding without crossing into the neighbouring lane.
export const MILESTONE_LABEL_WIDTH = 208;
export const MIN_LANE_HEIGHT = 72;

export function milestoneTextStyle(zoom) {
  return {
    "--milestone-title-size": `${.875 * zoom}rem`,
    "--milestone-title-line": `${1.125 * zoom}rem`,
    "--milestone-date-size": `${.875 * zoom}rem`,
    "--milestone-date-line": `${1.125 * zoom}rem`,
  };
}
