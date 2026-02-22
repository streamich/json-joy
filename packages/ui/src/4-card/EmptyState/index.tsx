import * as React from 'react';
import {useT} from 'use-t';
import {useTheme, rule} from 'nano-theme';
import {MiniTitle} from '../../3-list-item/MiniTitle';

const blockClass = rule({
  ta: 'center',
  maxW: '300px',
  mar: '30px auto',
});

const frameClass = rule({
  w: '150px',
  h: '100px',
  mar: '0 auto',
  bdrad: '8px',
});

const frameSmallClass = rule({
  w: '100px',
  h: '67px',
});

const emojiClass = rule({
  fz: '50px',
  lh: '100px',
});

const contentClass = rule({
  w: '100%',
  pad: '8px 0 0',
});

export interface Props {
  frame?: boolean;
  title?: string;
  emoji?: string;
  illustration?: React.ReactNode;
  small?: boolean;
  children?: React.ReactNode;
}

export const EmptyState: React.FC<Props> = ({frame, title, emoji, illustration, small, children}) => {
  const [t] = useT();
  const theme = useTheme();

  if (frame) {
    title ??= '';
    emoji ??= ' ';
  }

  return (
    <div className={blockClass}>
      {illustration
        ? illustration
        : emoji !== undefined && (
            <div
              className={frameClass + (small ? frameSmallClass : '')}
              style={{border: `1px dashed ${theme.g(0.76)}`}}
            >
              <div className={emojiClass}>{emoji}</div>
            </div>
          )}
      {!!title || (!!children && <br />)}
      {title === undefined ? (
        <MiniTitle>{t('Empty')}</MiniTitle>
      ) : title ? (
        title ? (
          <MiniTitle>{title || t('Empty')}</MiniTitle>
        ) : null
      ) : null}
      {!!children && <div className={contentClass}>{children}</div>}
    </div>
  );
};
