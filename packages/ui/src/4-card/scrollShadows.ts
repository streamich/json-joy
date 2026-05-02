const SHADOW_THRESHOLD = 4;
const TERMINAL_EPSILON = 1;

export const getScrollShadowVisibility = (scrollTop: number, maxScrollTop: number): [top: boolean, bottom: boolean] => {
  const clampedMaxScrollTop = Math.max(0, maxScrollTop);
  if (clampedMaxScrollTop <= SHADOW_THRESHOLD) return [false, false];

  const clampedScrollTop = Math.max(0, Math.min(scrollTop, clampedMaxScrollTop));
  const distanceToBottom = clampedMaxScrollTop - clampedScrollTop;
  const atTop = clampedScrollTop <= TERMINAL_EPSILON;
  const atBottom = distanceToBottom <= TERMINAL_EPSILON;

  return [!atTop && clampedScrollTop > SHADOW_THRESHOLD, !atBottom && distanceToBottom > SHADOW_THRESHOLD];
};
