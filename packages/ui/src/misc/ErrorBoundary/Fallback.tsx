import * as React from 'react';
import {rule, theme} from 'nano-theme';
import {EmptyState} from '../../4-card/EmptyState';
import {Button} from '../../2-inline-block/Button';
import {Iconista} from '../../icons/Iconista';
import {useStyles} from '../../styles/context';

const messageClass = rule({
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  fz: '12px',
  col: theme.g(0.5),
  wordBreak: 'break-word',
  maxW: '380px',
  mar: '0 auto 12px',
});

const iconWrapClass = rule({
  d: 'flex',
  jc: 'center',
  ai: 'center',
  pad: '4px 0 4px',
});

const buttonRowClass = rule({
  d: 'flex',
  jc: 'center',
});

export interface FallbackProps {
  name?: string;
  error: Error;
  reset: () => void;
  compact?: boolean;
}

export const Fallback: React.FC<FallbackProps> = ({name, error, reset, compact}) => {
  const styles = useStyles();

  const title = name ? `${name} failed to render` : 'Something went wrong';
  const iconSize = compact ? 24 : 32;

  return (
    <div role="alert" aria-live="polite" data-error-boundary={name || true}>
      <EmptyState
        small={compact}
        title={title}
        illustration={
          <div className={iconWrapClass}>
            <Iconista set="bootstrap" icon="exclamation-triangle" width={iconSize} height={iconSize} />
          </div>
        }
      >
        <div className={messageClass} style={{color: styles.g(.5)}}>{error?.message || String(error) || 'Unknown error'}</div>
        <div className={buttonRowClass}>
          <Button small ghost size={-2} onClick={reset}>
            Try again
          </Button>
        </div>
      </EmptyState>
    </div>
  );
};

export default Fallback;
