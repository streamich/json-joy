import * as React from 'react';
import {BasicButton} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {Label} from '@jsonjoy.com/ui/lib/1-inline/Label';
import {BasicTooltip} from '@jsonjoy.com/ui/lib/4-card/BasicTooltip';
import {Iconista} from '@jsonjoy.com/ui/lib/icons/Iconista';
import JsonJoyLogo from '@jsonjoy.com/ui/lib/icons/svg/JsonJoyLogo';
import useWindowSize from 'react-use/lib/useWindowSize';
import {Split} from '@jsonjoy.com/ui/lib/3-list-item/Split';

const linkStyle: React.CSSProperties = {
  color: 'inherit',
  textDecoration: 'none',
  opacity: 0.7,
  fontSize: '13px',
  fontWeight: 500,
  padding: '4px 8px',
  borderRadius: '4px',
  transition: 'opacity 0.15s',
};

export const Menu: React.FC = () => {
  const {width} = useWindowSize();

  const logo = (
    <BasicTooltip nowrap renderTooltip={() => 'jsonjoy.com'}>
      <BasicButton to="https://jsonjoy.com" round target="_blank" rel="noreferrer" size={40}>
        <span style={{margin: '0 1px 0 -1px', display: 'flex'}}>
          <JsonJoyLogo color size={24} />
        </span>
      </BasicButton>
    </BasicTooltip>
  );

  const left = (
    <div style={{display: 'flex', alignItems: 'center', gap: '16px', paddingLeft: '24px'}}>
      <a href="https://explorer.jsoncrdt.org" style={{...linkStyle, opacity: 1, marginLeft: '-8px'}}>
        <span style={{fontSize: '10.5px'}}>JSON CRDT</span>
        <br />
        <span style={{fontWeight: 700, fontSize: '16px'}}>Explorer</span>
      </a>
      <span style={{opacity: 0.3, fontSize: '13px', userSelect: 'none'}}>by</span>
      {logo}
    </div>
  );

  // const middle = width > 1000 && (
  //   <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
  //     {/* <span style={{fontSize: '11px', opacity: 0.55, maxWidth: '340px', lineHeight: 1.35}}>
  //       JSON CRDT playground
  //     </span>
  //     <span style={{opacity: 0.3, fontSize: '13px', userSelect: 'none'}}>·</span> */}
  //     <span style={{fontSize: '11px', opacity: 0.55, maxWidth: '340px', lineHeight: 1.35}}>
  //       Load and explore JSON CRDT documents
  //     </span>
  //   </div>
  // );

  const right = (
    <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
      {width > 400 && (
        <BasicTooltip renderTooltip={() => 'Specification of JSON CRDT format'}>
          <BasicButton
            to="https://jsonjoy.com/specs/json-crdt"
            target="_blank"
            rel="noreferrer"
            width="auto"
            height={32}
            rounder
            compact
          >
            <span style={linkStyle}>
              JSON CRDT <Label>Spec</Label>
            </span>
          </BasicButton>
        </BasicTooltip>
      )}
      <BasicTooltip nowrap renderTooltip={() => 'GitHub repository'}>
        <BasicButton
          to="https://github.com/streamich/json-joy"
          round
          target="_blank"
          rel="noreferrer"
          size={40}
        >
          <Iconista set="fontawesome_brands" icon="github" width={24} height={24} />
        </BasicButton>
      </BasicTooltip>
    </div>
  );

  return (
    <Split>
      {left}
      {/* {middle} */}
      {right}
    </Split>
  );
};
