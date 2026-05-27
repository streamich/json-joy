import * as React from 'react';
import {useT} from 'use-t';
import {BasicButton, type BasicButtonProps} from '../BasicButton';
import {BasicTooltip, type BasicTooltipProps} from '../../4-card/BasicTooltip';
import useMountedState from 'react-use/lib/useMountedState';
import CheckIcon__svg from 'iconista/lib/react/atlaskit/check';
import CopyIcon__svg from 'iconista/lib/react/lucide/copy';

const copy = require('clipboard-copy'); // eslint-disable-line

const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <CheckIcon__svg {...props} />;
const CopyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <CopyIcon__svg {...props} />;

// const anchor = {horizontal: true, center: true};

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
      // anchor={anchor}
      show={copied || void 0}
      renderTooltip={copied ? () => t('Copied!') : () => t('Copy')}
      {...tooltip}
    >
      <BasicButton {...rest} onClick={handleClick}>
        {/* Spans (not divs) and explicit margins so ambient markdown rules
            like `div+div { margin-top: 2em }` cannot shift the icon stack. */}
        <span
          style={{
            display: 'block',
            position: 'relative',
            width: 16,
            height: 16,
            margin: 0,
            lineHeight: 0,
            overflow: 'hidden',
          }}
        >
          <span
            style={{
              display: 'block',
              position: 'absolute',
              top: 0,
              left: 0,
              margin: 0,
              transform: copied ? 'translateY(100%)' : 'translateY(0%)',
              transition: 'transform 150ms ease-in-out',
            }}
          >
            <CopyIcon width={16} height={16} style={{display: 'block'}} />
          </span>
          <span
            style={{
              display: 'block',
              position: 'absolute',
              top: 0,
              left: 0,
              margin: 0,
              transform: copied ? 'translateY(0%)' : 'translateY(-100%)',
              transition: 'transform 150ms ease-in-out',
            }}
          >
            <CheckIcon width={16} height={16} style={{display: 'block'}} />
          </span>
        </span>
      </BasicButton>
    </BasicTooltip>
  );
};
