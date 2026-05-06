import {Key} from '@jsonjoy.com/ui/lib/1-inline/Key';
import {formatKeys} from 'mutxt-react/lib/MuTxt/util/keys';
import * as React from 'react';
import {useT} from 'use-t';

export type HelpTextProps = Record<string, never>;

export const HelpText: React.FC<HelpTextProps> = () => {
  const [t] = useT();

  return (
    <div>
      <h3>{t('Writing')}</h3>
      <p>
        {t('Just start typing. Use the toolbar to format text and switch block types.')}
        <ul>
          <li>
            {t('Press')} <Key>Shift</Key> <Key>Shift</Key> or{' '}
            <Key>{['Primary', 'j'].map((k) => formatKeys([k])).join(' + ')}</Key> {t(' for menu.')}
          </li>
          <li>
            {t('Press')} <Key>{['Primary', '/'].map((k) => formatKeys([k])).join(' + ')}</Key> {t(' for shortcuts.')}
          </li>
        </ul>
      </p>

      <h3>{t('History')}</h3>
      <p>
        {t(
          'Below the editor, you can find the history of all changes. Click on any entry to view the document at that point in time.',
        )}
      </p>
      {/* 
      <h3>{t('Formatting')}</h3>
      <ul>
        <li><Key>⌘B</Key> <Key>⌘I</Key> <Key>⌘U</Key> <Key>⌘E</Key> &mdash; {t('bold, italic, underline, inline code')}</li>
        <li><Key>⌘⇧X</Key> &mdash; {t('strikethrough')}</li>
        <li><Key>⌘K</Key> &mdash; {t('insert or edit a link')}</li>
      </ul>

      <h3>{t('Blocks')}</h3>
      <ul>
        <li><Key>⌘⌥0</Key> &mdash; {t('paragraph')}; <Key>⌘⌥1</Key> … <Key>⌘⌥6</Key> &mdash; {t('headings')}</li>
        <li><Key>⌘⌥7</Key> <Key>⌘⌥8</Key> &mdash; {t('numbered and bulleted lists')}</li>
        <li><Key>⌘⌥9</Key> {t('or')} <Key>⌘⇧Q</Key> &mdash; {t('blockquote')}; <Key>⌘⇧C</Key> &mdash; {t('code block')}</li>
        <li><Key>⌘]</Key> <Key>⌘[</Key> &mdash; {t('indent and outdent')}</li>
      </ul>

      <h3>{t('Layout & history')}</h3>
      <ul>
        <li><Key>⌘⇧L</Key> <Key>⌘⇧E</Key> <Key>⌘⇧R</Key> <Key>⌘⇧J</Key> &mdash; {t('align left, center, right, justify')}</li>
        <li><Key>⌘Z</Key> <Key>⌘⇧Z</Key> &mdash; {t('undo and redo')}</li>
      </ul> */}
    </div>
  );
};
