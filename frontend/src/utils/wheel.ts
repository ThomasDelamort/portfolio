// Pixels per "line" for mice that report wheel travel in lines (Firefox).
const LINE_PX = 32;

/**
 * Horizontal travel of a wheel event in pixels, or null when the gesture is
 * vertical and should be left alone to scroll the page.
 *
 * Trackpad swipes arrive as deltaX. Shift + wheel counts as horizontal too, the
 * way browsers treat it over a scrollable area -- some report the notch as
 * deltaX, others leave it in deltaY with the shift flag set.
 */
export const horizontalWheelDelta = (e: WheelEvent): number | null => {
  const unit =
    e.deltaMode === 1 ? LINE_PX : e.deltaMode === 2 ? window.innerWidth : 1;
  let dx = e.deltaX * unit;
  let dy = e.deltaY * unit;
  if (e.shiftKey && dx === 0) {
    dx = dy;
    dy = 0;
  }
  return Math.abs(dx) > Math.abs(dy) ? dx : null;
};
