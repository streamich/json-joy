import * as React from 'react';
import {drule} from 'nano-theme';
import {useStyles} from '../../../../styles/context';
import {argBlockCss} from './css';
import {FormRow} from '../../../../3-list-item/FormRow';
import {Scrollbox} from '../../../Scrollbox';
import {ArgSelectCompact} from './ArgSelectCompact';
import type {ParamSelect} from '../../../StructuralMenu/types';

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

export interface DefaultableSelectValue {
  def: boolean;
  value: string;
}

export interface ArgSelectProps {
  param: ParamSelect;
  value: string | DefaultableSelectValue;
  compact?: boolean;
  onChange: (value: string | DefaultableSelectValue) => void;
  onSubmit: () => void;
}

const unwrapSelect = (v: ArgSelectProps['value']): string => {
  if (v && typeof v === 'object' && 'value' in v) return String((v as DefaultableSelectValue).value ?? '');
  return (v as string) ?? '';
};

export const ArgSelect: React.FC<ArgSelectProps> = (props) => {
  const styles = useStyles();
  if (props.compact) return <ArgSelectCompact {...props} />;
  const {param, value, onChange, onSubmit} = props;
  const v = unwrapSelect(value);
  const options = param.options ?? [];
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
                const isSelected = v === id;
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
