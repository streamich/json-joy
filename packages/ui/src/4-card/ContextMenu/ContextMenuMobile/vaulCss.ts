// Vaul ships its drawer animations as a separate `vaul/style.css` file. We
// inject the subset we use (bottom-direction slide + overlay fade + handle)
// at runtime so consumers don't need a CSS-import build step.

const CSS = `
[data-vaul-drawer] {
  touch-action: none;
  will-change: transform;
  transition: transform 0.5s cubic-bezier(0.32, 0.72, 0, 1);
  animation-duration: 0.5s;
  animation-timing-function: cubic-bezier(0.32, 0.72, 0, 1);
}
[data-vaul-drawer][data-vaul-snap-points='false'][data-vaul-drawer-direction='bottom'][data-state='open'] {
  animation-name: vaulSlideFromBottom;
}
[data-vaul-drawer][data-vaul-snap-points='false'][data-vaul-drawer-direction='bottom'][data-state='closed'] {
  animation-name: vaulSlideToBottom;
}
[data-vaul-overlay][data-vaul-snap-points='false'] {
  animation-duration: 0.5s;
  animation-timing-function: cubic-bezier(0.32, 0.72, 0, 1);
}
[data-vaul-overlay][data-vaul-snap-points='false'][data-state='open'] {
  animation-name: vaulFadeIn;
}
[data-vaul-overlay][data-state='closed'] {
  animation-name: vaulFadeOut;
}
[data-vaul-animate='false'] { animation: none !important; }
[data-vaul-handle] {
  display: block;
  position: relative;
  opacity: 0.6;
  background: #999;
  margin-left: auto;
  margin-right: auto;
  height: 5px;
  width: 36px;
  border-radius: 1rem;
  touch-action: pan-y;
}
[data-vaul-handle]:hover, [data-vaul-handle]:active { opacity: 1; }
[data-vaul-handle-hitarea] {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: max(100%, 2.75rem);
  height: max(100%, 2.75rem);
  touch-action: inherit;
}
@keyframes vaulFadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes vaulFadeOut { to { opacity: 0; } }
@keyframes vaulSlideFromBottom {
  from { transform: translate3d(0, var(--initial-transform, 100%), 0); }
  to { transform: translate3d(0, 0, 0); }
}
@keyframes vaulSlideToBottom {
  to { transform: translate3d(0, var(--initial-transform, 100%), 0); }
}`;

let injected = false;

export const ensureVaulCss = (): void => {
  if (injected || typeof document === 'undefined') return;
  injected = true;
  const style = document.createElement('style');
  style.setAttribute('data-vaul-injected', 'true');
  style.textContent = CSS;
  document.head.appendChild(style);
};
