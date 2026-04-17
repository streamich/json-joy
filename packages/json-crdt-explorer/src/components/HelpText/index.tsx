import {Key} from '@jsonjoy.com/ui/lib/1-inline/Key';
import {Code} from '@jsonjoy.com/ui/lib/1-inline/Code';
import * as React from 'react';
import {useT} from 'use-t';
import {AddAction} from '@jsonjoy.com/click-json/lib/buttons/Action/AddAction';
import {EditAction} from '@jsonjoy.com/click-json/lib/buttons/Action/EditAction';

export type HelpTextProps = Record<string, never>;

export const HelpText: React.FC<HelpTextProps> = () => {
  const [t] = useT();

  return (
    <div>
      <h3>{t('Basic Editing')}</h3>
      <p>
        Click on{' '}
        <a
          href={'https://jsonjoy.com/specs/json-crdt/model-document/node-types'}
          title="JSON CRDT Node Types"
          rel="noopener noreferrer"
          target="_blank"
        >
          any node
        </a>{' '}
        to select it. When a value is selected, you can edit by clicking <EditAction /> or by clicking on it again.
      </p>

      <h3>{t('Value Types')}</h3>
      <ul>
        <li>
          <Code border>null</Code> &mdash; {t('Type "null" for null values')}
        </li>
        <li>
          <Code border>true</Code> / <Code border>false</Code> &mdash; {t('Boolean values')}
        </li>
        <li>
          <Code border>123</Code> &mdash; Integers, or decimals: <Code border>3.14</Code>
        </li>
        <li>
          <Code border>"text"</Code>, <Code border>text</Code> &mdash; {t('Strings (with or without quotes)')}
        </li>
        <li>
          <Code border>{'{}'}</Code>, <Code border>[]</Code>, <Code border>[1, 2, 3]</Code> &mdash;{' '}
          {t('Insert objects')}
        </li>
      </ul>

      <h3>{t('Adding New Properties')}</h3>
      <p>
        Click on an object or array to select it. A <AddAction /> button will appear allowing you to add new properties
        or elements.
      </p>

      <h3>{t('Deleting')}</h3>
      <p>
        Select a property or array element and press the <Key>Delete</Key> or <Key>Backspace</Key> key, or use the
        delete button that appears in the toolbar.
      </p>

      <h3>{t('Keyboard Shortcuts')}</h3>
      <ul>
        <li>
          <Key>Enter</Key> &mdash; {t('Confirm edit')}
        </li>
        <li>
          <Key>Escape</Key> &mdash; {t('Cancel edit')}
        </li>
        <li>
          <Key>Tab</Key> &mdash; {t('Auto-complete value type')}
        </li>
      </ul>
    </div>
  );
};
