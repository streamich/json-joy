import * as React from 'react';

export const useLockScrolling = (lock: boolean) => {
  React.useEffect(() => {
    const html = document.querySelector('html');
    if (html) {
      if (lock) html.style.overflow = 'hidden';
      else html.style.overflow = '';
    }
  }, [lock]);
};
