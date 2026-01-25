import * as React from 'react';
import {drule, theme, useTheme} from 'nano-theme';
import {Split} from 'nice-ui/lib/3-list-item/Split';
import {Flex} from 'nice-ui/lib/3-list-item/Flex';
import {Space} from 'nice-ui/lib/3-list-item/Space';
import {BasicButtonClose} from 'nice-ui/lib/2-inline-block/BasicButton/BasicButtonClose';
import {BasicTooltip} from 'nice-ui/lib/4-card/BasicTooltip';
import {useT} from 'use-t';

const css = {
  block: drule({
    ...theme.font.mono,
    d: 'block',
    bdrad: '5px',
    trs: 'background 0.6s ease 0s',
    fz: '.9em',
    lh: 1.3,
    bd: '1px solid transparent',
    pd: 0,
    mr: 0,
    '&+&': {
      mrt: '8px',
    },
  }),
  header: drule({
    pd: '8px 8px 8px 16px',
    bxz: 'border-box',
    ai: 'center',
  }),
  body: drule({
    pd: '8px 8px 8px 16px',
    bxz: 'border-box',
    ovy: 'auto',
  }),
};

export interface CardLayoutProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  onTitleClick?: React.MouseEventHandler;
  onClose?: React.MouseEventHandler;
}

export const CardLayout: React.FC<CardLayoutProps> = ({left, right, footer, children, onClose, onTitleClick}) => {
  const [t] = useT();
  const theme = useTheme();

  let header: React.ReactNode = null;

  if (left || right || onClose) {
    header = (
      <Split
        className={css.header({bdb: !children ? undefined : `1px solid ${theme.g(0, 0.05)}`})}
        onClick={onTitleClick}
      >
        <div>{left}</div>
        <div>
          <Flex style={{alignItems: 'center'}}>
            {right}
            {!!onClose && (
              <>
                <Space horizontal size={0} />
                <BasicTooltip renderTooltip={() => t('Close')}>
                  <BasicButtonClose onClick={onClose} />
                </BasicTooltip>
              </>
            )}
          </Flex>
        </div>
      </Split>
    );
  }

  return (
    <div
      className={css.block({
        col: theme.g(0.3),
        bg: theme.g(0, 0.02),
        '&:hover': {
          bg: theme.bg,
          bd: `1px solid ${theme.g(0, 0.04)}`,
        },
      })}
    >
      {header}
      {!!children && <div className={css.body()}>{children}</div>}
      {footer}
    </div>
  );
};
