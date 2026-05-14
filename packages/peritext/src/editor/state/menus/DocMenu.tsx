import * as React from 'react';
import type {MenuItem} from '../../types';
import type {EditorState} from '../EditorState';
import UndoIcon__svg from 'iconista/lib/react/lucide/undo';
import RedoIcon__svg from 'iconista/lib/react/lucide/redo';

const UndoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <UndoIcon__svg {...props} />;
const RedoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <RedoIcon__svg {...props} />;

export class DocMenu {
  constructor(public readonly state: EditorState) {}

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
