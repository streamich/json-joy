import * as React from 'react';
import {Paper} from '@jsonjoy.com/ui/lib/4-card/Paper';
import {useTheme} from 'nano-theme';
import {NewFileForm} from '../NewFileForm';
import {Separator} from '@jsonjoy.com/ui/lib/3-list-item/Separator';
import {ResponsiveFlex} from '@jsonjoy.com/ui/lib/misc/ResponsiveFlex';
import {HelpText} from '../HelpText';
import {Typesetting} from '../Typesetting';
import {Space} from '@jsonjoy.com/ui/lib/3-list-item/Space';

export type WelcomeScreenProps = Record<string, never>;

export const WelcomeScreen: React.FC<WelcomeScreenProps> = () => {
  const theme = useTheme();
  const circle = (
    <div
      style={{
        background: '#fff',
        width: 406,
        height: 406,
        borderRadius: '50%',
        overflow: 'hidden',
        position: 'relative',
        boxSizing: 'border-box',
        zIndex: 1,
        margin: `-32px auto 0`,
      }}
    >
      <div style={{width: 600, margin: '16px 0 0 -80px'}}>
        <video
          src={'https://appsets.jsonjoy.com/ui/elements/clickable-json-editing-720x486.mp4'}
          width={'100%'}
          autoPlay
          muted
          loop
          controls={false}
          style={{display: 'block'}}
        />
      </div>
      <div
        style={{
          width: 400,
          height: 400,
          borderRadius: '50%',
          border: '3px solid #555',
          position: 'absolute',
          top: 3,
          left: 3,
          boxSizing: 'border-box',
        }}
      ></div>
    </div>
  );

  return (
    <div style={{display: 'flex', width: '100%', height: '100%', alignItems: 'center', flexDirection: 'column', padding: '32px 16px 16px'}}>
      <Paper round style={{maxWidth: '900px', width: '100%'}} contrast hoverElevate>
        <ResponsiveFlex breakpoint={700} style={{minWidth: 366, width: '100%'}} render={(wide) => (
          <>
            <div style={{width: wide ? '50%' : '100%', flex: 1}}>
              <Typesetting>
                <div style={{padding: '16px 32px'}}>
                  <h2>
                    JSON (CRDT) Playground
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
            <div style={{width: wide ? '50%' : '100%', flex: wide ? 1 : undefined}}>
              {circle}
              <div style={{position: 'relative', zIndex: 2, margin: '-100px 0 0'}}>
                <Separator />
                <div style={{background: `linear-gradient(to bottom, ${theme.bg} 100px, transparent)`, boxSizing: 'border-box', padding: wide ? 32 : 16}}>
                  <NewFileForm expanded />
                </div>
              </div>
            </div>
          </>
        )}/>
      </Paper>
    </div>
  );
};
