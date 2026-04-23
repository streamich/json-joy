import {Key} from '@jsonjoy.com/ui/lib/1-inline/Key';
import * as React from 'react';
import {useT} from 'use-t';

export type HelpTextProps = Record<string, never>;

export const HelpText: React.FC<HelpTextProps> = () => {
  const [t] = useT();

  return (
    <div>
      <h3>{t('Writing')}</h3>
      <p>
        {t('Start typing to create a paragraph. Use the toolbar to format text or convert blocks.')}
      </p>

      <h3>{t('Common Shortcuts')}</h3>
      <ul>
        <li><Key>⌘B</Key>, <Key>⌘I</Key>, <Key>⌘U</Key>, <Key>⌘E</Key> &mdash; {t('Bold')}, {t('italic')}, {t('underline')}, {t('code')}</li>
        <li><Key>⌘K</Key> &mdash; {t('Insert / edit link')}</li>
        <li><Key>⌘⇧C</Key> &mdash; {t('Code block')}</li>
        <li><Key>⌘Z</Key>, <Key>⌘⇧Z</Key> &mdash; {t('Undo')} / {t('redo')}</li>
      </ul>
    </div>
  );
};
