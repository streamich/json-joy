import * as React from 'react';
import {drule} from 'nano-theme';
import {useStyles} from '../../../../styles/context';
import {argBlockCss} from './css';
import {FormRow} from '../../../../3-list-item/FormRow';
import type {ParamSelect} from '../../../StructuralMenu/types';
import {Scrollbox} from '../../../Scrollbox';

const optionClass = drule({
  d: 'flex',
  alignItems: 'center',
  pd: '4px 8px',
  bdrad: '4px',
  cur: 'pointer',
  fz: '13px',
  lh: '1.4em',
  us: 'none',
});

const optionSelectedClass = drule({
  fontWeight: 600,
});

export interface ArgSelectProps {
  param: ParamSelect;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export const ArgSelect: React.FC<ArgSelectProps> = ({param, value, onChange, onSubmit}) => {
  const options = param.options ?? [];
  const styles = useStyles();
  const optionCls = optionClass({
    '&:hover': {bg: styles.g(0, 0.06)},
  });
  const optionSelectedCls = optionSelectedClass({bg: styles.g(0, 0.08)});

  return (
    <div className={argBlockCss}>
      <FormRow
        title={param.display?.() ?? param.name ?? param.id}
        descriptionAbove
        description={param.description}
        optional={param.optional}
      >
        <div style={{margin: '-4px -16px'}}>
          <Scrollbox style={{maxHeight: 200}}>
            <div style={{padding: '4px 16px'}}>
              {options.map((opt) => {
                const id = opt.id ?? opt.name;
                const isSelected = value === id;
                return (
                  <div
                    key={id}
                    className={optionCls + (isSelected ? ' ' + optionSelectedCls : '')}
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={0}
                    data-menu-row
                    onClick={() => {
                      onChange(id);
                      onSubmit();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onChange(id);
                        onSubmit();
                      }
                    }}
                  >
                    {opt.icon?.()}
                    <span style={opt.icon ? {marginLeft: 8} : void 0}>{opt.display?.() ?? opt.name ?? opt.id}</span>
                  </div>
                );
              })}
            </div>
          </Scrollbox>
        </div>
      </FormRow>
    </div>
  );
};
