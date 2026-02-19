import preview from '../../../../.storybook/preview';

import {SingleEditorDebug} from './SingleEditorDebug';

const meta = preview.meta({
  title: 'ProseMirror',
});

export const Debug = meta.story({
  render: SingleEditorDebug,
});
