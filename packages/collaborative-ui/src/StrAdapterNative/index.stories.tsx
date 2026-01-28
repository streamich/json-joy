import * as React from 'react';
import {StrAdapterNative} from '.';
import {CollaborativeInput} from '../CollaborativeInput';
import {CollaborativeFlexibleInput} from '../CollaborativeFlexibleInput';
import type {CollaborativeStr} from 'collaborative-editor';

export default {
  component: StrAdapterNative,
  title: '<StrAdapterNative>',
};

const DefaultDemo: React.FC<{multiline?: boolean; render?: (str: () => CollaborativeStr) => React.ReactNode}> = ({
  multiline,
  render = (str) => <CollaborativeInput multiline={multiline} str={str} />,
}) => {
  const [value, setValue] = React.useState('abc');

  return (
    <div>
      <StrAdapterNative value={value} onChange={(val) => setValue(val)}>
        {render}
      </StrAdapterNative>
      <br />
      <br />
      <button type={'button'} onClick={() => setValue('')}>
        Clear
      </button>
      <button type="button" onClick={() => setValue((x) => x + '?')}>
        Append "?"
      </button>
    </div>
  );
};

export const Default = {
  render: () => <DefaultDemo />,
};

export const Multiline = {
  render: () => <DefaultDemo multiline />,
};

export const FlexibleMultiline = {
  render: () => (
    <DefaultDemo multiline render={(str) => <CollaborativeFlexibleInput fullWidth multiline str={str} />} />
  ),
};
