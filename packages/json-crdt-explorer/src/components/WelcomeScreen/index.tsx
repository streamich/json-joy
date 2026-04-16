import * as React from 'react';
import {Paper} from '@jsonjoy.com/ui/lib/4-card/Paper';
import {useT} from 'use-t';
import {NewFileForm} from '../NewFileForm';
import {Separator} from '@jsonjoy.com/ui/lib/3-list-item/Separator';
import {ResponsiveFlex} from '@jsonjoy.com/ui/lib/misc/ResponsiveFlex';


export type WelcomeScreenProps = Record<string, never>;

export const WelcomeScreen: React.FC<WelcomeScreenProps> = () => {
  const [t] = useT();

  return (
    <div style={{display: 'flex', width: '100%', alignItems: 'center', flexDirection: 'column', padding: 16}}>
      <Paper round style={{maxWidth: '900px', width: '100%'}} contrast hoverElevate>
        <ResponsiveFlex breakpoint={700} style={{minWidth: 366, width: '100%'}} render={(wide) => (
          <>
            <div style={{
              maxWidth: 600, width: wide ? '50%' : '100%', padding: '32px', flex: 1, display: 'flex', flexDirection: 'column',
              backgroundImage: 'radial-gradient(circle, rgba(127,127,127,.1) 1px, transparent 1px)',
              backgroundSize: '8px 8px',
            }}>
              <div>
                <h4 style={{margin: '0 0 12px', opacity: 0.88, fontSize: '16px', fontWeight: 700, lineHeight: '1.4em'}}>
                  JSON CRDT Playground
                </h4>
                <ul style={{margin: 0, paddingLeft: '18px', opacity: 0.65, fontSize: '14.5px', lineHeight: '1.5em'}}>
                  <li style={{padding: 4}}>Explore JSON CRDT document state and history</li>
                  <li style={{padding: 4}}>Save &amp; load documents in various formats</li>
                  <li style={{padding: 4}}>Time travel and debug document internal state</li>
                </ul>
              </div>
              <div />
            </div>
            <Separator style={wide ? {width: '1px', height: 'auto'} : {}} />
            <div style={{width: wide ? '50%' : '100%', boxSizing: 'border-box', padding: wide ? 32 : 16, flex: wide ? 1 : undefined}}>
              <NewFileForm expanded />
            </div>
          </>
        )}/>
      </Paper>
    </div>
  );
};
