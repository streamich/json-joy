import * as React from 'react';
import {Paper} from '@jsonjoy.com/ui/lib/4-card/Paper';
import {useTheme} from 'nano-theme';
import {NewFileForm} from '../NewFileForm';
import {Separator} from '@jsonjoy.com/ui/lib/3-list-item/Separator';
import {ResponsiveFlex} from '@jsonjoy.com/ui/lib/misc/ResponsiveFlex';
import {MuTxtLogo} from '@jsonjoy.com/ui/lib/icons/svg/MuTxtLogo';
import {HelpText} from './HelpText';
import {Typesetting} from '../Typesetting';
import {Code} from '@jsonjoy.com/ui/lib/1-inline/Code';

export type WelcomeScreenProps = Record<string, never>;

export const WelcomeScreen: React.FC<WelcomeScreenProps> = () => {
  const theme = useTheme();

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        flexDirection: 'column',
        padding: '16px',
      }}
    >
      <Paper round style={{maxWidth: '900px', width: '100%'}} contrast hoverElevate>
        <ResponsiveFlex
          breakpoint={700}
          style={{minWidth: 366, width: '100%'}}
          render={(wide) => (
            <>
              <div style={{width: wide ? '50%' : '100%', flex: 1}}>
                <Typesetting>
                  <div style={{padding: '16px 32px'}}>
                    <h2><MuTxtLogo size={48} style={{display: 'inline-block', verticalAlign: 'middle', margin: '-8px 0'}} /> Workspace</h2>
                    <ul>
                      <li>Manage multiple rich-text documents in one place</li>
                      <li>Save documents to disk and reload them any time</li>
                      <li>
                        Powered by <Code><a href="https://jsonjoy.com" target="_blank" rel="noopener noreferrer">json-joy</a></Code> {' '}
                        <a
                          href={'https://jsonjoy.com/specs/json-crdt'}
                          title="JSON CRDT specification"
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          JSON CRDT
                        </a>
                        {' '}— local-first, works offline, with sync-ready document format
                      </li>
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
                <div>
                  <div
                    style={{
                      boxSizing: 'border-box',
                      padding: wide ? 32 : 16,
                    }}
                  >
                    <NewFileForm expanded />
                  </div>
                </div>
              </div>
            </>
          )}
        />
      </Paper>
    </div>
  );
};
