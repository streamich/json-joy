import * as React from 'react';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import type {MenuItem} from '../../types';
import type {EditorState} from '../EditorState';

const UndoIcon = makeIcon({set: 'lucide', icon: 'undo'});
const RedoIcon = makeIcon({set: 'lucide', icon: 'redo'});

export class DocMenu {
  constructor(
    public readonly state: EditorState,
  ) {}

  public build(): MenuItem {
    const menu: MenuItem = {
      name: 'Document menu',
      maxToolbarItems: 1,
      more: true,
      minWidth: 280,
      children: [
        {
          name: 'History',
          expand: 2,
          children: [
            {
              name: 'Undo',
              icon: () => <UndoIcon width={16} height={16} />,
              onSelect: () => {},
            },
            {
              name: 'Redo',
              icon: () => <RedoIcon width={16} height={16} />,
              onSelect: () => {},
            },
          ],
        },
      ],
    };
    return menu;
  }
}
