import * as React from 'react';
import {lightTheme, rule, drule} from 'nano-theme';
import {useT} from 'use-t';
import {useStyles} from '../../styles/context';
import {Code} from '../../1-inline/Code';

const blockClass = rule({
  d: 'flex',
  flexWrap: 'nowrap',
  cur: 'pointer',
  bd: 0,
  pad: '5px',
  mar: '-5px',
  bdrad: '4px',
  trs: 'background .12s ease-in 0s',
  userSelect: 'none',
});

const rightClass = rule({
  w: '100%',
  ov: 'hidden',
  d: 'inline-block',
  flex: '1 1',
});

const nameClass = drule({
  ...lightTheme.font.sans,
  lh: 1.2,
  mar: 0,
  whiteSpace: 'nowrap',
  ov: 'hidden',
  textOverflow: 'ellipsis',
  w: '100%',
  flexBasis: '100%',
  d: 'block',
});

const subtextClass = drule({
  ...lightTheme.font.ui1.mid,
  lh: 1.3,
  d: 'inline-block',
  mar: 0,
  whiteSpace: 'nowrap',
  ov: 'hidden',
  textOverflow: 'ellipsis',
});

const specialFontClass = rule({
  ...lightTheme.font.ui1.mid,
});

export interface Props {
  /** @todo Rename ot "size". */
  width?: number;
  name?: string;
  hideName?: boolean;
  subtext?: React.ReactNode;
  grey?: boolean;
  lightGrey?: boolean;
  spacious?: boolean;
  you?: boolean;
  onNameClick?: React.MouseEventHandler;
  onSubtextClick?: React.MouseEventHandler;
}

export const LabelRight: React.FC<Props> = (props) => {
  const [t] = useT();
  const styles = useStyles();
  const {width = 40, name, hideName, subtext, grey, lightGrey, spacious, onNameClick, onSubtextClick} = props;

  return (
    <span
      className={rightClass}
      style={{
        padding: `${width * (subtext ? (spacious ? 0 : 0.085) : width < 32 ? (spacious ? 0.12 : 0.2) : 0.19)}px ${
          width * 0.2
        }px 0 ${width * (0.2 + (spacious ? 0.1 : 0))}px`,
        fontSize: width * (subtext ? (spacious ? 0.5 : 0.42) : spacious ? (width < 32 ? 0.65 : 0.53) : 0.5) + 'px',
      }}
    >
      {!!name && !hideName && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: programmatic click handler
        <span
          className={nameClass({col: styles.g(0.1, 0.8)}) + (grey || lightGrey ? ' ' + specialFontClass : '')}
          style={{
            marginTop: spacious && subtext ? width * -0.05 : undefined,
          }}
          onClick={onNameClick}
        >
          {props.you ? (
            <>
              {name} <Code gray>{t('you')}</Code>
            </>
          ) : (
            name
          )}
        </span>
      )}
      {subtext && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: programmatic click handler
        <span
          className={subtextClass({
            col: styles.g(0.3),
            [`.${blockClass.trim()}:hover &`]: {
              col: styles.g(0.1),
            },
          })}
          style={{
            fontSize: width * (name && !hideName ? (spacious ? 0.35 : 0.28) : 0.53) + 'px',
            paddingTop: name && !hideName ? 0 : `${width * 0.08}px`,
            opacity: spacious ? 0.7 : undefined,
          }}
          onClick={onSubtextClick}
        >
          {subtext}
        </span>
      )}
    </span>
  );
};
