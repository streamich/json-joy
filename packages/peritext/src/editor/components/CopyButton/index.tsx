import * as React from 'react';
import {useT} from 'use-t';
import {BasicButton, type BasicButtonProps} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {BasicTooltip, type BasicTooltipProps} from '@jsonjoy.com/ui/lib/4-card/BasicTooltip';
import useMountedState from 'react-use/lib/useMountedState';
const copy = require('clipboard-copy'); // eslint-disable-line

const CheckIcon = makeIcon({set: 'atlaskit', icon: 'check'});
const CopyIcon = makeIcon({set: 'lucide', icon: 'copy'});

const anchor = {horizontal: true, center: true};

export interface CopyButtonProps extends BasicButtonProps {
  onCopy: () => string;
  tooltip?: Partial<BasicTooltipProps>;
}

export const CopyButton: React.FC<CopyButtonProps> = ({onCopy, tooltip, ...rest}) => {
  const [t] = useT();
  const isMounted = useMountedState();
  const [copied, setCopied] = React.useState(false);

  const handleClick = (e: React.MouseEvent) => {
    setCopied(true);
    copy(onCopy());
    setTimeout(() => {
      if (isMounted()) setCopied(false);
    }, 2000);
    rest.onClick?.(e);
  };

  return (
    <BasicTooltip
      anchor={anchor}
      show={copied || void 0}
      renderTooltip={copied ? () => t('Copied!') : () => t('Copy')}
      {...tooltip}
    >
      <BasicButton {...rest} onClick={handleClick}>
        <div style={{position: 'relative', width: 16, height: 16, overflow: 'hidden'}}>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              transform: copied ? 'translateY(100%)' : 'translateY(0%)',
              transition: 'transform 150ms ease-in-out',
            }}
          >
            <CopyIcon width={16} height={16} />
          </div>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              transform: copied ? 'translateY(0%)' : 'translateY(-100%)',
              transition: 'transform 150ms ease-in-out',
            }}
          >
            <CheckIcon width={16} height={16} />
          </div>
        </div>
      </BasicButton>
    </BasicTooltip>
  );
};
