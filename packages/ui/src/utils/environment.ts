export const isTouch = typeof window !== 'undefined' && window.matchMedia("(pointer: coarse)").matches;

let isMobile: boolean = isTouch;
if (typeof navigator !== 'undefined' && typeof (navigator as any).userAgentData !== 'undefined')
  isMobile = (navigator as any).userAgentData.mobile;
else if (!isMobile && typeof navigator !== 'undefined')
  isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);
export {isMobile};
