import preview from '../../../../.storybook/preview';

import {SingleEditorDebug} from './SingleEditorDebug';

const meta = preview.meta({
  title: 'Slate',
});

export const Debug = meta.story({
  render: SingleEditorDebug,
});
