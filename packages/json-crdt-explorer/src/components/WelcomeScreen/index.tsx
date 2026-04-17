import * as React from 'react';
import {Paper} from '@jsonjoy.com/ui/lib/4-card/Paper';
import {useT} from 'use-t';
import {NewFileForm} from '../NewFileForm';
import {Separator} from '@jsonjoy.com/ui/lib/3-list-item/Separator';
import {ResponsiveFlex} from '@jsonjoy.com/ui/lib/misc/ResponsiveFlex';
import {HelpText} from '../HelpText';
import {Typesetting} from '../Typesetting';
import {Link} from '@jsonjoy.com/ui/lib/misc/router';


export type WelcomeScreenProps = Record<string, never>;

export const WelcomeScreen: React.FC<WelcomeScreenProps> = () => {
  const [t] = useT();

  return (
    <div style={{display: 'flex', width: '100%', height: '100%', alignItems: 'center', flexDirection: 'column', padding: 16}}>
      <Paper round style={{maxWidth: '900px', width: '100%'}} contrast hoverElevate>
        <ResponsiveFlex breakpoint={700} style={{minWidth: 366, width: '100%'}} render={(wide) => (
          <>
            <div style={{maxWidth: 600, width: wide ? '50%' : '100%', flex: 1}}>
              <Typesetting>
                <div style={{padding: '16px 32px'}}>
                  <h2>
                    JSON CRDT Playground
                  </h2>
                  <ul>
                    <li>
                      Explore <a href={'https://jsonjoy.com/specs/json-crdt'} title="JSON CRDT specification" rel='noopener noreferrer' target='_blank'>JSON CRDT models</a> and <a href={'https://jsonjoy.com/specs/json-crdt-patch'} title="JSON CRDT Patch specification" rel='noopener noreferrer' target='_blank'>patch history</a>
                    </li>
                    <li>Save & load documents in <a href={'https://jsonjoy.com/specs/json-crdt/encoding'} title="JSON CRDT Encoding specification" rel='noopener noreferrer' target='_blank'>various formats</a></li>
                    <li>Time travel and debug document internal state</li>
                  </ul>
                </div>
                {/* <Space size={2} /> */}
                <Separator />
                {/* <Space size={2} /> */}
                <div style={{padding: '8px 32px 24px'}}>
                  <HelpText />
                </div>
              </Typesetting>
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
