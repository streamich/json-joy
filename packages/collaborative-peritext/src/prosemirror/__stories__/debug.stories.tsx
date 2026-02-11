import preview from '../../../../../.storybook/preview';

import {SingleEditorDebug} from './SingleEditorDebug';

const meta = preview.meta({
  title: 'Peritext/ProseMirrorFacade',
});

export const Default = meta.story({
  render: SingleEditorDebug,
});
