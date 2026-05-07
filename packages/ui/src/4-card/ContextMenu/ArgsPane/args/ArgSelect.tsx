import * as React from 'react';
import {makeRule} from 'nano-theme';
import {argBlockCss} from './css';
import {FormRow} from '../../../../3-list-item/FormRow';
import type {ParamSelect} from '../../../StructuralMenu/types';
import {Scrollbox} from '../../../Scrollbox';

const useOptionClass = makeRule((t) => ({
  d: 'flex',
  alignItems: 'center',
  pd: '4px 8px',
  bdrad: '4px',
  cur: 'pointer',
  fz: '13px',
  lh: '1.4em',
  us: 'none',
  '&:hover': {
    bg: t.g(0, 0.06),
  },
}));

const useOptionSelectedClass = makeRule((t) => ({
  bg: t.g(0, 0.08),
  fontWeight: 600,
}));

export interface ArgSelectProps {
  param: ParamSelect;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export const ArgSelect: React.FC<ArgSelectProps> = ({param, value, onChange, onSubmit}) => {
  const options = param.options ?? [];
  const optionClass = useOptionClass();
  const optionSelectedClass = useOptionSelectedClass();

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
                    className={optionClass + (isSelected ? ' ' + optionSelectedClass : '')}
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
