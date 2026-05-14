import * as React from 'react';

/**
 * The CSS class that resets a subtree's typography and link/button styles
 * the way `nano-theme/global-reset` would do page-wide. Provided by
 * `UiProvider` so that surfaces escaping the React tree (Portal containers,
 * fixed-position floaters, MuTxt shells, etc.) can apply the same reset
 * without relying on the host page having installed a global reset.
 *
 * `null` means "do not apply a scoped reset" — typically because the
 * surrounding app has already installed a global reset.
 */
export const ScopedResetContext = React.createContext<string | null>(null);

export const useScopedResetClass = (): string | null => React.useContext(ScopedResetContext);
