import {formatKeys} from '../../util/keys';

export interface ShortcutSpec {
  /** Keys passed to `formatKeys` for platform-aware rendering. */
  keys?: string[];
  /** Override the rendered key string (used for chords like "Shift Shift"). */
  display?: string;
  /** Short, user-facing description. */
  label: string;
}

export interface ShortcutGroup {
  title: string;
  shortcuts: ShortcutSpec[];
}

export const renderShortcut = (shortcut: ShortcutSpec): string =>
  shortcut.display ?? (shortcut.keys ? formatKeys(shortcut.keys) : '');

export const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: 'General',
    shortcuts: [
      {keys: ['Primary', '/'], label: 'Show keyboard shortcuts'},
      {display: 'Shift Shift', label: 'Quick actions at caret'},
      {keys: ['Primary', 'j'], label: 'Command palette'},
      {keys: ['Space'], label: 'Open menu in empty block or with selection'},
      {keys: ['Primary', 'Shift', 'm'], label: 'Toggle maximized view'},
      {keys: ['Primary', 'Shift', 'f'], label: 'Toggle fullscreen'},
    ],
  },
  {
    title: 'Inline formatting',
    shortcuts: [
      {keys: ['Primary', 'b'], label: 'Bold'},
      {keys: ['Primary', 'i'], label: 'Italic'},
      {keys: ['Primary', 'u'], label: 'Underline'},
      {keys: ['Primary', 'e'], label: 'Inline code'},
      {keys: ['Primary', 'Shift', 'x'], label: 'Strikethrough'},
      {keys: ['Primary', 'k'], label: 'Insert / edit link'},
    ],
  },
  {
    title: 'Turn into',
    shortcuts: [
      {keys: ['Primary', 'Alt', '0'], label: 'Paragraph'},
      {keys: ['Primary', 'Alt', '1'], label: 'Heading 1'},
      {keys: ['Primary', 'Alt', '2'], label: 'Heading 2'},
      {keys: ['Primary', 'Alt', '3'], label: 'Heading 3'},
      {keys: ['Primary', 'Alt', '4'], label: 'Heading 4'},
      {keys: ['Primary', 'Alt', '5'], label: 'Heading 5'},
      {keys: ['Primary', 'Alt', '6'], label: 'Heading 6'},
      {keys: ['Primary', 'Alt', '7'], label: 'Numbered list'},
      {keys: ['Primary', 'Alt', '8'], label: 'Bulleted list'},
      {keys: ['Primary', 'Shift', 'q'], label: 'Blockquote'},
      {keys: ['Primary', 'Shift', 'c'], label: 'Code block'},
    ],
  },
  {
    title: 'Block operations',
    shortcuts: [
      {keys: ['Alt', 'Shift', '↑'], label: 'Move block up'},
      {keys: ['Alt', 'Shift', '↓'], label: 'Move block down'},
      {keys: ['Primary', 'Shift', 'd'], label: 'Duplicate block'},
      {keys: ['Primary', 'Shift', 'k'], label: 'Delete block'},
    ],
  },
  {
    title: 'Alignment & indent',
    shortcuts: [
      {keys: ['Primary', 'Shift', 'l'], label: 'Align left'},
      {keys: ['Primary', 'Shift', 'e'], label: 'Align center'},
      {keys: ['Primary', 'Shift', 'r'], label: 'Align right'},
      {keys: ['Primary', 'Shift', 'j'], label: 'Justify'},
      {keys: ['Primary', ']'], label: 'Increase indent'},
      {keys: ['Primary', '['], label: 'Decrease indent'},
    ],
  },
  {
    title: 'Code blocks',
    shortcuts: [
      {keys: ['Primary', 'Enter'], label: 'Insert hard break'},
      {keys: ['Shift', 'Enter'], label: 'Exit code block'},
      {display: 'Enter x3', label: 'Exit on a blank line at the end'},
    ],
  },
  {
    title: 'Editing',
    shortcuts: [
      {keys: ['Backspace'], label: 'Convert empty / start-of-line block to paragraph'},
      {keys: ['Primary', 'z'], label: 'Undo'},
      {keys: ['Primary', 'Shift', 'z'], label: 'Redo'},
    ],
  },
];
