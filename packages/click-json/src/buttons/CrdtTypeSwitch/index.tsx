import * as React from 'react';
import {TypeSwitch} from '../TypeSwitch';

export interface CrdtTypeSwitchProps {
  types?: string[];
  type: React.RefObject<string>;
  onSubmit?: () => void;
  onClick?: React.MouseEventHandler;
}

export const CrdtTypeSwitch: React.FC<CrdtTypeSwitchProps> = ({
  types = ['any', 'con', 'vec', 'val'] as const,
  type,
  onSubmit,
  onClick,
}) => {
  const [typeIndex, setTypeIndex] = React.useState(types.findIndex((t) => t === type.current));
  React.useLayoutEffect(() => {
    (type as any).current = types[typeIndex];
  }, []);

  const onNext = () => {
    setTypeIndex((n) => {
      const index = (n + 1) % types.length;
      (type as any).current = types[index];
      return index;
    });
  };

  const onPrev = () => {
    setTypeIndex((n) => {
      const index = (n - 1 + types.length) % types.length;
      (type as any).current = types[index];
      return index;
    });
  };

  return (
    <span style={{display: 'inline-block', padding: '0 0 0 4px', margin: '-1px 0'}}>
      <TypeSwitch
        value={types[typeIndex]}
        onClick={(e) => {
          onNext();
          if (onClick) onClick(e);
        }}
        onKeyDown={(e) => {
          switch (e.key) {
            case 'ArrowDown':
            case 'ArrowRight': {
              e.preventDefault();
              onNext();
              break;
            }
            case 'ArrowUp':
            case 'ArrowLeft': {
              e.preventDefault();
              onPrev();
              break;
            }
            case 'Enter': {
              e.preventDefault();
              if (onSubmit) {
                e.preventDefault();
                onSubmit();
              }
              break;
            }
          }
        }}
      />
    </span>
  );
};
