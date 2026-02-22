import * as React from 'react';
import {rule} from 'nano-theme';
import type {StyleTheme} from '../../../../../styles/types';
import {Styles} from '../../../../../styles/Styles';
import {ColorHueGrid} from '../ColorHueGrid';

const blockClass = rule({
  d: 'flex',
  jc: 'center',
});

const wrapClass = rule({
  maxW: '1200px',
});

export interface ThemeColorsProps {
  theme: StyleTheme;
}

export const ThemeColors: React.FC<ThemeColorsProps> = ({theme}) => {
  const styles = React.useMemo(() => {
    return new Styles(theme);
  }, [theme]);

  const scales = styles.col.scales;

  return (
    <div className={blockClass}>
      <div className={wrapClass}>
        <ColorHueGrid name="Brand" hues={styles.theme.color!.palette.brand!} scales={scales} />
        <ColorHueGrid name="Accent" hues={styles.theme.color!.palette.accent!} scales={scales} />
        <ColorHueGrid name="Neutral" hues={styles.theme.color!.palette.neutral!} scales={scales} />
        <ColorHueGrid name="Success" hues={styles.theme.color!.palette.success!} scales={scales} />
        <ColorHueGrid name="Error" hues={styles.theme.color!.palette.error!} scales={scales} />
        <ColorHueGrid name="Warning" hues={styles.theme.color!.palette.warning!} scales={scales} />
        <ColorHueGrid name="Link" hues={styles.theme.color!.palette.link!} scales={scales} />
      </div>
    </div>
  );
};
