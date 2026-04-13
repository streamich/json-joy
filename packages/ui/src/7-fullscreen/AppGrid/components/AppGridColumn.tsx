import * as React from 'react';
import {drule, useTheme} from 'nano-theme';
import * as ScrollArea from '../../../4-card/ScrollArea';
import {NiceUiSizes} from '../../../constants';

const marginalsClass = drule({
  d: 'flex',
  h: NiceUiSizes.NavHeight + 'px',
  ai: 'center',
  flexShrink: 0,
  bxz: 'border-box',
  pd: '0 8px',
});

export interface AppGridColumnProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  scrollRailWidth?: number;
  children?: React.ReactNode;
}

export const AppGridColumn: React.FC<AppGridColumnProps> = ({header, footer, scrollRailWidth, children, ...rest}) => {
  const theme = useTheme();

  const headerElement = !!header && (
    <div className={marginalsClass({bdb: `1px solid ${theme.g(0, 0.08)}`})}>
      {header}
    </div>
  );

  const footerElement = !!footer && (
    <div className={marginalsClass({bdt: `1px solid ${theme.g(0, 0.08)}`})}>
      {footer}
    </div>
  );

  return (
    <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
      {headerElement}
      <ScrollArea.ScrollArea style={{flex: 1}} railWidth={scrollRailWidth ?? 8}>
        <ScrollArea.Viewport>
          {children}
        </ScrollArea.Viewport>
        <ScrollArea.ScrollRail style={{top: 2, bottom: 2, borderRadius: 3}}>
          <ScrollArea.Thumb />
        </ScrollArea.ScrollRail>
      </ScrollArea.ScrollArea>
      {footerElement}
    </div>
  );
};
