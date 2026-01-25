import * as React from 'react';
import {JsonAtom} from '../JsonAtom';
import {ClickableJson} from '../ClickableJson';
import {useFocus} from '../context/focus';

export interface JsonCrdtConstantProps {
  id: string;
  view: unknown;
}

export const JsonCrdtConstant: React.FC<JsonCrdtConstantProps> = ({id, view}) => {
  const {focus} = useFocus();
  const [viewJson, setViewJson] = React.useState(false);

  const handleAtomClick = () => {
    if (view && typeof view === 'object') {
      setViewJson(!viewJson);
    }
  };

  if (!viewJson) {
    return <JsonAtom value={view} onClick={handleAtomClick} />;
  }

  return (
    <span style={{display: 'inline-block', verticalAlign: 'top', margin: '-1px'}}>
      <ClickableJson
        readonly
        compact
        noCollapseToggles
        pfx={id}
        doc={view}
        onFocus={(p) => {
          if (p !== null) focus(id);
        }}
      />
    </span>
  );
};
