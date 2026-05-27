import * as React from 'react';
import {useT} from 'use-t';
import useMountedState from 'react-use/lib/useMountedState';
import CopyIcon__svg from 'iconista/lib/react/lucide/copy';
import CheckIcon__svg from 'iconista/lib/react/atlaskit/check';
import BasicButton, {type BasicButtonProps} from '.';
import {BasicTooltip, type BasicTooltipProps} from '../../4-card/BasicTooltip';

const copy = require('clipboard-copy'); // eslint-disable-line

const CopyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <CopyIcon__svg {...props} />;
const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <CheckIcon__svg {...props} />;

export interface BasicButtonCopyProps extends BasicButtonProps {
  /** Returns the text to copy to the clipboard. */
  onCopy: () => string | Promise<string>;
  /** Tooltip shown in the idle state. Pass `true` for the default "Copy". */
  tooltip?: boolean | React.ReactNode;
  tooltipProps?: Partial<BasicTooltipProps>;
}

export const BasicButtonCopy: React.FC<BasicButtonCopyProps> = ({onCopy, tooltip = true, tooltipProps, ...rest}) => {
  const [t] = useT();
  const isMounted = useMountedState();
  const [copied, setCopied] = React.useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    rest.onClick?.(e);
    copy(await onCopy());
    setCopied(true);
    setTimeout(() => {
      if (isMounted()) setCopied(false);
    }, 2000);
  };

  const idle = tooltip === true ? () => t('Copy') : tooltip ? () => tooltip : void 0;

  return (
    <BasicTooltip show={copied || void 0} renderTooltip={copied ? () => t('Copied!') : idle} {...tooltipProps}>
      <BasicButton {...rest} onClick={handleClick}>
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
