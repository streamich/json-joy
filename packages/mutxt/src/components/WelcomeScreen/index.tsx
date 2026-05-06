import * as React from 'react';
import {Paper} from '@jsonjoy.com/ui/lib/4-card/Paper';
import {NewFileForm} from '../NewFileForm';
import {Separator} from '@jsonjoy.com/ui/lib/3-list-item/Separator';
import {MuTxtLogo} from '@jsonjoy.com/ui/lib/icons/svg/MuTxtLogo';
import {HelpText} from './HelpText';
import {Typesetting} from '../Typesetting';
import {Code} from '@jsonjoy.com/ui/lib/1-inline/Code';

export type WelcomeScreenProps = Record<string, never>;

export const WelcomeScreen: React.FC<WelcomeScreenProps> = () => {
  const intro = (
    <div style={{padding: '16px 32px 8px'}}>
      <h2>
        <MuTxtLogo size={48} style={{display: 'inline-block', verticalAlign: 'middle', margin: '-8px 0'}} /> Workspace
      </h2>
      <ul>
        <li>
          <sub>μ</sub>txt (micro text) is a simple, functional rich-text editor.
        </li>
        <li>Manage multiple rich-text documents in one sidebar.</li>
        <li>Saves documents locally on your disk automatically as you edit.</li>
        <li>No cloud, no authentication required.</li>
        <li>
          Powered by{' '}
          <Code>
            <a href="https://jsonjoy.com" target="_blank" rel="noopener noreferrer">
              json-joy
            </a>
          </Code>{' '}
          <a
            href={'https://jsonjoy.com/specs/json-crdt'}
            title="JSON CRDT specification"
            rel="noopener noreferrer"
            target="_blank"
          >
            JSON CRDT
          </a>{' '}
          — local-first, works offline, with sync-ready document format
        </li>
        {/* <li>
          Fork and merge documents seamlessly<sup>(</sup>*<sup>)</sup>
          <sup> coming soon</sup>
        </li> */}
      </ul>
    </div>
  );

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        flexDirection: 'column',
        padding: '16px',
        maxWidth: '500px',
        margin: '0 auto 32px',
      }}
    >
      {/* <MuTxtLogo
        size={128}
        style={{display: 'inline-block', margin: '-32px auto -50px', position: 'relative', zIndex: 2}}
      /> */}
      {/* <MuTxtLogo
        size={96}
        style={{display: 'inline-block', margin: '-32px auto -16px'}}
      /> */}
      <Paper round style={{maxWidth: '900px', width: '100%'}} contrast hoverElevate>
        <div style={{padding: 32}}>
          <NewFileForm expanded />
        </div>
        <Separator />
        <Typesetting>
          {intro}
          {/* <Separator /> */}
          <div style={{padding: '0 32px 24px'}}>
            <HelpText />
          </div>
        </Typesetting>
      </Paper>
    </div>
  );
};
