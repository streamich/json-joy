import * as React from 'react';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {Code} from '@jsonjoy.com/ui/lib/1-inline/Code';
import {Sidetip} from '@jsonjoy.com/ui/lib/1-inline/Sidetip';
import {FontStyleButton} from '@jsonjoy.com/ui/lib/2-inline-block/FontStyleButton';
import type {MenuItem} from '@jsonjoy.com/ui/lib/4-card/StructuralMenu/types';

// Annotations icons
const LinkIcon = makeIcon({set: "radix", icon: "link-2"});
const CommentIcon = makeIcon({set: "lineicons", icon: "comment-1-text"});
const BookmarkIcon = makeIcon({set: "lineicons", icon: "flag-2"});
const FootnoteIcon = makeIcon({set: "lucide", icon: "footprints"});
const AsideIcon = makeIcon({set: "tabler", icon: "box-align-right"});

// Second brain icons
const SecondBrainIcon = makeIcon({set: "tabler", icon: "brain"});
const MakeShorterIcon = makeIcon({set: "tabler", icon: "viewport-short"});
const MakeLongerIcon = makeIcon({set: "tabler", icon: "viewport-tall"});

// Formatting icons
const BoldIcon = makeIcon({set: "radix", icon: "font-bold"});
const ItalicIcon = makeIcon({set: "lucide", icon: "italic"});
const UnderlineIcon = makeIcon({set: "tabler", icon: "underline"});
const StrikethroughIcon = makeIcon({set: "tabler", icon: "strikethrough"});
const OverlineIcon = makeIcon({set: "tabler", icon: "overline"});
const HighlightIcon = makeIcon({set: "tabler", icon: "highlight"});
const ClassifiedIcon = makeIcon({set: "tabler", icon: "lock-password"});
const CodeIcon = makeIcon({set: "tabler", icon: "code"});
const MathIcon = makeIcon({set: "tabler", icon: "math-integral-x"});
const SuperscriptIcon = makeIcon({set: "tabler", icon: "superscript"});
const SubscriptIcon = makeIcon({set: "tabler", icon: "subscript"});
const KeyboardIcon = makeIcon({set: "lucide", icon: "keyboard"});
const InsertionIcon = makeIcon({set: "tabler", icon: "pencil-plus"});
const DeletionIcon = makeIcon({set: "tabler", icon: "pencil-minus"});

// Artistic icons
const PaintbrushIcon = makeIcon({set: "lucide", icon: "paintbrush"});
const PaintBucketIcon = makeIcon({set: "lucide", icon: "paint-bucket"});
const BorderLeftIcon = makeIcon({set: "tabler", icon: "border-left"});

// Typesetting icons
const TypographyIcon = makeIcon({set: "tabler", icon: "typography"});
const FontStyleIcon = makeIcon({set: "radix", icon: "font-style"});
const FontFamilyIcon = makeIcon({set: "radix", icon: "font-family"});
const FontSizeIcon = makeIcon({set: "radix", icon: "font-size"});
const LetterSpacingIcon = makeIcon({set: "radix", icon: "letter-spacing"});
const LetterCaseUppercaseIcon = makeIcon({set: "radix", icon: "letter-case-uppercase"});
const LetterCaseLowercaseIcon = makeIcon({set: "radix", icon: "letter-case-lowercase"});

// Modify icons
const LayersIcon = makeIcon({set: "radix", icon: "layers"});
const EraserIcon = makeIcon({set: "tabler", icon: "eraser"});
const TrashIcon = makeIcon({set: "tabler", icon: "trash"});

// Clipboard icons
const CopyIcon = makeIcon({set: "lucide", icon: "copy"});
const ClipboardCopyIcon = makeIcon({set: "radix", icon: "clipboard-copy"});
const MarkdownIcon = makeIcon({set: "simple", icon: "markdown"});
const Html5Icon = makeIcon({set: "simple", icon: "html5"});
const ScissorsIcon = makeIcon({set: "tabler", icon: "scissors"});
const ClipboardIcon = makeIcon({set: "radix", icon: "clipboard"});

// Insert icons
const BetweenVerticalEndIcon = makeIcon({set: "lucide", icon: "between-vertical-end"});
const ButtonIcon = makeIcon({set: "radix", icon: "button"});
const CalendarIcon = makeIcon({set: "radix", icon: "calendar"});
const WalletIcon = makeIcon({set: "tabler", icon: "wallet"});
const DropdownMenuIcon = makeIcon({set: "radix", icon: "dropdown-menu"});
const PlusIcon = makeIcon({set: "radix", icon: "plus"});
const SewingPinIcon = makeIcon({set: "radix", icon: "sewing-pin"});
const FileIcon = makeIcon({set: "radix", icon: "file"});
const TemplateIcon = makeIcon({set: "tabler", icon: "template"});
const RadixKeyboardIcon = makeIcon({set: "radix", icon: "keyboard"});
const SmilePlusIcon = makeIcon({set: "lucide", icon: "smile-plus"});
const OmegaIcon = makeIcon({set: "lucide", icon: "omega"});
const VariableIcon = makeIcon({set: "lucide", icon: "variable"});
const SquareChevronRightIcon = makeIcon({set: "lucide", icon: "square-chevron-right"});

// Block element icons
const PilcrowIcon = makeIcon({set: "lucide", icon: "pilcrow"});
const QuoteIcon = makeIcon({set: "lucide", icon: "quote"});
const MathBlockIcon = makeIcon({set: "tabler", icon: "math"});
const TypeIcon = makeIcon({set: "lucide", icon: "type"});
const H1Icon = makeIcon({set: "tabler", icon: "h-1"});
const H2Icon = makeIcon({set: "tabler", icon: "h-2"});
const H3Icon = makeIcon({set: "tabler", icon: "h-3"});
const H4Icon = makeIcon({set: "tabler", icon: "h-4"});
const H5Icon = makeIcon({set: "tabler", icon: "h-5"});
const H6Icon = makeIcon({set: "tabler", icon: "h-6"});
const ListBulletedIcon = makeIcon({set: "ibm_32", icon: "list--bulleted"});
const ListNumberedIcon = makeIcon({set: "ibm_32", icon: "list--numbered"});
const ListCheckedIcon = makeIcon({set: "ibm_32", icon: "list--checked"});
const LayoutIcon = makeIcon({set: "tabler", icon: "layout"});
const TableIcon = makeIcon({set: "tabler", icon: "table"});
const ColumnsIcon = makeIcon({set: "tabler", icon: "columns"});
const ImageInPictureIcon = makeIcon({set: "tabler", icon: "image-in-picture"});
const PhotoScanIcon = makeIcon({set: "tabler", icon: "photo-scan"});
const TablerFileIcon = makeIcon({set: "tabler", icon: "file"});
export const annotations = (): MenuItem => {
  return {
    name: 'Annotations',
    expand: 2,
    children: [
      {
        name: 'Link',
        // icon: () => <LinkIcon width={15} height={15} />,
        icon: () => <LinkIcon width={15} height={15} />,
        active: {
          getSnapshot: () => true,
          subscribe: () => () => {},
        },
        onSelect: () => {
          console.log('Link');
        },
      },
      {
        name: 'Comment',
        icon: () => <CommentIcon width={16} height={16} />,
        onSelect: () => {
          console.log('Comment');
        },
      },
      {
        name: 'Bookmark',
        icon: () => <BookmarkIcon width={16} height={16} />,
        onSelect: () => {
          console.log('Bookmark');
        },
      },
      {
        name: 'Footnote',
        icon: () => <FootnoteIcon width={16} height={16} />,
        onSelect: () => {
          console.log('Footnote');
        },
      },
      {
        name: 'Aside',
        icon: () => <AsideIcon width={16} height={16} />,
        onSelect: () => {
          console.log('Aside');
        },
      },
    ],
  };
};

export const secondBrain = (): MenuItem => {
  return {
    sepBefore: true,
    name: 'Second brain',
    display: () => (
      <>
        <span style={{color: 'purple'}}>Second brain</span>
        {/* &nbsp;
        <span style={{opacity: .3}}>AI</span> */}
      </>
    ),
    right: () => <Sidetip small>{'AI'}</Sidetip>,
    icon: () => <SecondBrainIcon style={{color: 'purple'}} width={16} height={16} />,
    children: [
      {
        name: 'Ask question',
      },
      {
        name: 'Action',
        children: [
          {
            name: 'Make shorter',
            icon: () => <MakeShorterIcon width={16} height={16} />,
            onSelect: () => {},
          },
          {
            name: 'Make longer',
            icon: () => <MakeLongerIcon width={16} height={16} />,
            onSelect: () => {},
          },
          {name: 'Add humor'},
          {name: 'Make more professional'},
          {name: 'Make it: ...'},
        ],
      },
      {
        name: 'Translate',
        children: [
          {
            name: 'Afrikaans',
            onSelect: () => {},
          },
          {
            name: 'Arabic',
            onSelect: () => {},
          },
          {
            name: 'Bengali',
            onSelect: () => {},
          },
          {
            name: 'Bulgarian',
            onSelect: () => {},
          },
          {
            name: 'Catalan',
            onSelect: () => {},
          },
          {
            name: 'Cantonese',
            onSelect: () => {},
          },
          {
            name: 'Croatian',
            onSelect: () => {},
          },
          {
            name: 'Czech',
            onSelect: () => {},
          },
          {
            name: 'Danish',
            onSelect: () => {},
          },
          {
            name: 'Dutch',
            onSelect: () => {},
          },
          {
            name: 'Lithuanian',
            onSelect: () => {},
          },
          {
            name: 'Malay',
            onSelect: () => {},
          },
          {
            name: 'Malayalam',
            onSelect: () => {},
          },
          {
            name: 'Panjabi',
            onSelect: () => {},
          },
          {
            name: 'Tamil',
            onSelect: () => {},
          },
          {
            name: 'English',
            onSelect: () => {},
          },
          {
            name: 'Finnish',
            onSelect: () => {},
          },
          {
            name: 'French',
            onSelect: () => {},
          },
          {
            name: 'German',
            onSelect: () => {},
          },
          {
            name: 'Greek',
            onSelect: () => {},
          },
          {
            name: 'Hebrew',
            onSelect: () => {},
          },
          {
            name: 'Hindi',
            onSelect: () => {},
          },
          {
            name: 'Hungarian',
            onSelect: () => {},
          },
          {
            name: 'Indonesian',
            onSelect: () => {},
          },
          {
            name: 'Italian',
            onSelect: () => {},
          },
          {
            name: 'Japanese',
            onSelect: () => {},
          },
          {
            name: 'Javanese',
            onSelect: () => {},
          },
          {
            name: 'Korean',
            onSelect: () => {},
          },
          {
            name: 'Norwegian',
            onSelect: () => {},
          },
          {
            name: 'Polish',
            onSelect: () => {},
          },
          {
            name: 'Portuguese',
            onSelect: () => {},
          },
          {
            name: 'Romanian',
            onSelect: () => {},
          },
          {
            name: 'Russian',
            onSelect: () => {},
          },
          {
            name: 'Serbian',
            onSelect: () => {},
          },
          {
            name: 'Slovak',
            onSelect: () => {},
          },
          {
            name: 'Slovene',
            onSelect: () => {},
          },
          {
            name: 'Spanish',
            onSelect: () => {},
          },
          {
            name: 'Swedish',
            onSelect: () => {},
          },
          {
            name: 'Thai',
            onSelect: () => {},
          },
          {
            name: 'Turkish',
            onSelect: () => {},
          },
          {
            name: 'Ukrainian',
            onSelect: () => {},
          },
          {
            name: 'Vietnamese',
            onSelect: () => {},
          },
        ],
      },
    ],
  };
};

export const inlineText: MenuItem = {
  name: 'Inline text',
  maxToolbarItems: 4,
  children: [
    {
      name: 'Formatting',
      expandChild: 0,
      children: [
        {
          name: 'Common',
          expand: 8,
          children: [
            {
              name: 'Bold',
              icon: () => <BoldIcon width={15} height={15} />,
              // icon: () => <BoldIcon width={16} height={16} />,
              right: () => <Sidetip small>⌘ B</Sidetip>,
              keys: ['⌘', 'b'],
              onSelect: () => {
                console.log('Bold');
              },
            },
            {
              name: 'Italic',
              // icon: () => <ItalicIcon width={15} height={15} />,
              // icon: () => <ItalicIcon width={16} height={16} />,
              icon: () => <ItalicIcon width={14} height={14} />,
              right: () => <Sidetip small>⌘ I</Sidetip>,
              active: {
                getSnapshot: () => true,
                subscribe: () => () => {},
              },
              keys: ['⌘', 'i'],
              onSelect: () => {
                console.log('Italic');
              },
            },
            {
              name: 'Underline',
              icon: () => <UnderlineIcon width={16} height={16} />,
              right: () => <Sidetip small>⌘ U</Sidetip>,
              keys: ['⌘', 'u'],
              onSelect: () => {
                console.log('Underline');
              },
            },
            {
              name: 'Strikethrough',
              // icon: () => <StrikethroughIcon width={15} height={15} />,
              icon: () => <StrikethroughIcon width={16} height={16} />,
              onSelect: () => {
                console.log('Strikethrough');
              },
            },
            {
              name: 'Overline',
              icon: () => <OverlineIcon width={16} height={16} />,
              onSelect: () => {
                console.log('Overline');
              },
            },
            {
              name: 'Highlight',
              icon: () => <HighlightIcon width={16} height={16} />,
              onSelect: () => {
                console.log('Highlight');
              },
            },
            {
              name: 'Classified',
              icon: () => <ClassifiedIcon width={16} height={16} />,
              onSelect: () => {
                console.log('Classified');
              },
            },
          ],
        },
        {
          name: 'Technical separator',
          sep: true,
        },
        {
          name: 'Technical',
          expand: 8,
          children: [
            {
              name: 'Code',
              icon: () => <CodeIcon width={16} height={16} />,
              onSelect: () => {},
            },
            {
              name: 'Math',
              icon: () => <MathIcon width={16} height={16} />,
              onSelect: () => {},
            },
            {
              name: 'Superscript',
              icon: () => <SuperscriptIcon width={16} height={16} />,
              onSelect: () => {},
            },
            {
              name: 'Subscript',
              icon: () => <SubscriptIcon width={16} height={16} />,
              onSelect: () => {},
            },
            {
              name: 'Keyboard key',
              icon: () => <KeyboardIcon width={16} height={16} />,
              onSelect: () => {},
            },
            {
              name: 'Insertion',
              icon: () => <InsertionIcon width={16} height={16} />,
              onSelect: () => {},
            },
            {
              name: 'Deletion',
              icon: () => <DeletionIcon width={16} height={16} />,
              onSelect: () => {},
            },
          ],
        },
        {
          name: 'Artistic separator',
          sep: true,
        },
        {
          name: 'Artistic',
          expand: 8,
          children: [
            {
              name: 'Color',
              icon: () => <PaintbrushIcon width={16} height={16} />,
              onSelect: () => {},
            },
            {
              name: 'Background',
              icon: () => <PaintBucketIcon width={16} height={16} />,
              onSelect: () => {},
            },
            {
              name: 'Border',
              icon: () => <BorderLeftIcon width={16} height={16} />,
              onSelect: () => {},
            },
          ],
        },
      ],
    },
    secondBrain(),
    {
      name: 'Annotations separator',
      sep: true,
    },
    annotations(),
    {
      name: 'Style separator',
      sep: true,
    },
    {
      name: 'Typesetting',
      expand: 4,
      openOnTitleHov: true,
      icon: () => <TypographyIcon width={16} height={16} />,
      onSelect: () => {},
      children: [
        {
          name: 'Sans-serif',
          iconBig: () => <FontStyleButton kind={'sans'} />,
          onSelect: () => {},
        },
        {
          name: 'Serif',
          iconBig: () => <FontStyleButton kind={'serif'} />,
          onSelect: () => {},
        },
        {
          name: 'Slab',
          icon: () => <FontStyleButton kind={'slab'} size={16} />,
          iconBig: () => <FontStyleButton kind={'slab'} />,
          onSelect: () => {},
        },
        {
          name: 'Monospace',
          iconBig: () => <FontStyleButton kind={'mono'} />,
          onSelect: () => {},
        },
        // {
        //   name: 'Custom typeface separator',
        //   sep: true,
        // },
        {
          name: 'Custom typeface',
          expand: 10,
          icon: () => <FontStyleIcon width={15} height={15} />,
          children: [
            {
              name: 'Typeface',
              // icon: () => <FontStyleIcon width={15} height={15} />,
              icon: () => <FontFamilyIcon width={15} height={15} />,
              onSelect: () => {},
            },
            {
              name: 'Text size',
              icon: () => <FontSizeIcon width={15} height={15} />,
              onSelect: () => {},
            },
            {
              name: 'Letter spacing',
              icon: () => <LetterSpacingIcon width={15} height={15} />,
              onSelect: () => {},
            },
            {
              name: 'Word spacing',
              icon: () => <LetterSpacingIcon width={15} height={15} />,
              onSelect: () => {},
            },
            {
              name: 'Caps separator',
              sep: true,
            },
            {
              name: 'Large caps',
              icon: () => <LetterCaseUppercaseIcon width={15} height={15} />,
              onSelect: () => {},
            },
            {
              name: 'Small caps',
              icon: () => <LetterCaseLowercaseIcon width={15} height={15} />,
              onSelect: () => {},
            },
          ],
        },
      ],
    },
    {
      name: 'Modify separator',
      sep: true,
    },
    {
      name: 'Modify',
      expand: 3,
      onSelect: () => {},
      children: [
        {
          name: 'Pick layer',
          right: () => (
            <Code size={-1} gray>
              9+
            </Code>
          ),
          more: true,
          icon: () => <LayersIcon width={15} height={15} />,
          onSelect: () => {},
        },
        {
          name: 'Erase formatting',
          danger: true,
          icon: () => <EraserIcon width={16} height={16} />,
          onSelect: () => {},
        },
        {
          name: 'Delete all in range',
          danger: true,
          more: true,
          icon: () => <TrashIcon width={16} height={16} />,
          onSelect: () => {},
        },
      ],
    },
    {
      name: 'Clipboard separator',
      sep: true,
    },
    {
      name: 'Copy, cut, and paste',
      // icon: () => <ClipboardCopyIcon width={15} height={15} />,
      icon: () => <CopyIcon width={16} height={16} />,
      expand: 0,
      children: [
        {
          id: 'copy-menu',
          name: 'Copy',
          // icon: () => <ClipboardCopyIcon width={15} height={15} />,
          icon: () => <ClipboardCopyIcon width={15} height={15} />,
          expand: 5,
          children: [
            {
              name: 'Copy',
              icon: () => <ClipboardCopyIcon width={15} height={15} />,
              onSelect: () => {},
            },
            {
              name: 'Copy text only',
              icon: () => <ClipboardCopyIcon width={15} height={15} />,
              onSelect: () => {},
            },
            {
              name: 'Copy as Markdown',
              icon: () => <ClipboardCopyIcon width={15} height={15} />,
              right: () => <MarkdownIcon width={16} height={16} style={{opacity: 0.5}} />,
              onSelect: () => {},
            },
            {
              name: 'Copy as HTML',
              icon: () => <ClipboardCopyIcon width={15} height={15} />,
              right: () => <Html5Icon width={14} height={14} style={{opacity: 0.5}} />,
              onSelect: () => {},
            },
          ],
        },
        {
          name: 'Cut separator',
          sep: true,
        },
        {
          id: 'cut-menu',
          name: 'Cut',
          // icon: () => <ClipboardCopyIcon width={15} height={15} />,
          icon: () => <ScissorsIcon width={16} height={16} />,
          expand: 5,
          children: [
            {
              name: 'Cut',
              danger: true,
              icon: () => <ScissorsIcon width={16} height={16} />,
              onSelect: () => {},
            },
            {
              name: 'Cut text only',
              danger: true,
              icon: () => <ScissorsIcon width={16} height={16} />,
              onSelect: () => {},
            },
            {
              name: 'Cut as Markdown',
              danger: true,
              icon: () => <ScissorsIcon width={16} height={16} />,
              right: () => <MarkdownIcon width={16} height={16} style={{opacity: 0.5}} />,
              onSelect: () => {},
            },
            {
              name: 'Cut as HTML',
              danger: true,
              icon: () => <ScissorsIcon width={16} height={16} />,
              right: () => <Html5Icon width={14} height={14} style={{opacity: 0.5}} />,
              onSelect: () => {},
            },
          ],
        },
        {
          name: 'Paste separator',
          sep: true,
        },
        {
          id: 'paste-menu',
          name: 'Paste',
          icon: () => <ClipboardIcon width={15} height={15} />,
          expand: 5,
          children: [
            {
              name: 'Paste',
              icon: () => <ClipboardIcon width={15} height={15} />,
              onSelect: () => {},
            },
            {
              name: 'Paste text only',
              icon: () => <ClipboardIcon width={15} height={15} />,
              onSelect: () => {},
            },
            {
              name: 'Paste formatting',
              icon: () => <ClipboardIcon width={15} height={15} />,
              onSelect: () => {},
            },
          ],
        },
      ],
    },
    {
      name: 'Insert',
      icon: () => <BetweenVerticalEndIcon width={16} height={16} />,
      children: [
        {
          name: 'Smart chip',
          icon: () => <ButtonIcon width={15} height={15} />,
          children: [
            {
              name: 'Date',
              icon: () => <CalendarIcon width={15} height={15} />,
              onSelect: () => {},
            },
            {
              name: 'AI chip',
              icon: () => <SecondBrainIcon style={{color: 'purple'}} width={16} height={16} />,
              onSelect: () => {},
            },
            {
              name: 'Solana wallet',
              icon: () => <WalletIcon width={16} height={16} />,
              onSelect: () => {},
            },
            {
              name: 'Dropdown',
              icon: () => <DropdownMenuIcon width={15} height={15} />,
              children: [
                {
                  name: 'Create new',
                  icon: () => <PlusIcon width={15} height={15} />,
                  onSelect: () => {},
                },
                {
                  name: 'Document dropdowns separator',
                  sep: true,
                },
                {
                  name: 'Document dropdowns',
                  expand: 8,
                  onSelect: () => {},
                  children: [
                    {
                      name: 'Configuration 1',
                      icon: () => <DropdownMenuIcon width={15} height={15} />,
                      onSelect: () => {},
                    },
                    {
                      name: 'Configuration 2',
                      icon: () => <DropdownMenuIcon width={15} height={15} />,
                      onSelect: () => {},
                    },
                  ],
                },
                {
                  name: 'Presets dropdowns separator',
                  sep: true,
                },
                {
                  name: 'Presets dropdowns',
                  expand: 8,
                  onSelect: () => {},
                  children: [
                    {
                      name: 'Project status',
                      icon: () => <DropdownMenuIcon width={15} height={15} />,
                      onSelect: () => {},
                    },
                    {
                      name: 'Review status',
                      icon: () => <DropdownMenuIcon width={15} height={15} />,
                      onSelect: () => {},
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: 'Link',
          // icon: () => <LinkIcon width={15} height={15} />,
          icon: () => <LinkIcon width={15} height={15} />,
          active: {
            getSnapshot: () => true,
            subscribe: () => () => {},
          },
          onSelect: () => {},
        },
        {
          name: 'Reference',
          icon: () => <SewingPinIcon width={15} height={15} />,
          onSelect: () => {},
        },
        {
          name: 'File',
          icon: () => <FileIcon width={15} height={15} />,
          onSelect: () => {},
        },
        {
          name: 'Template',
          text: 'building blocks',
          icon: () => <TemplateIcon width={16} height={16} />,
          children: [
            {
              name: 'Meeting notes',
              onSelect: () => {},
            },
            {
              name: 'Email draft (created by AI)',
              onSelect: () => {},
            },
            {
              name: 'Product roadmap',
              onSelect: () => {},
            },
            {
              name: 'Review tracker',
              onSelect: () => {},
            },
            {
              name: 'Project assets',
              onSelect: () => {},
            },
            {
              name: 'Content launch tracker',
              onSelect: () => {},
            },
          ],
        },
        {
          name: 'On-screen keyboard',
          icon: () => <RadixKeyboardIcon width={15} height={15} />,
          onSelect: () => {},
        },
        {
          name: 'Emoji',
          icon: () => <SmilePlusIcon width={16} height={16} />,
          onSelect: () => {},
        },
        {
          name: 'Special characters',
          icon: () => <OmegaIcon width={16} height={16} />,
          onSelect: () => {},
        },
        {
          name: 'Variable',
          icon: () => <VariableIcon width={16} height={16} />,
          onSelect: () => {},
        },
      ],
    },
    {
      name: 'Developer tools',
      danger: true,
      icon: () => <SquareChevronRightIcon width={16} height={16} />,
      onSelect: () => {},
    },
  ],
};

export const blockElement: MenuItem = {
  name: 'Block element',
  children: [
    {
      name: 'Text blocks',
      expand: 3,
      children: [
        {
          name: 'Paragraph',
          // icon: () => <TypeIcon width={16} height={16} />,
          icon: () => <PilcrowIcon width={16} height={16} />,
          // icon: () => <PilcrowIcon width={15} height={15} />,
          onSelect: () => {},
        },
        {
          name: 'Blockquote',
          icon: () => <QuoteIcon width={16} height={16} />,
          onSelect: () => {},
        },
        {
          name: 'Code block',
          // icon: () => <CodeIcon width={16} height={16} />,
          icon: () => <CodeIcon width={16} height={16} />,
          onSelect: () => {},
        },
        {
          name: 'Math block',
          icon: () => <MathBlockIcon width={16} height={16} />,
          onSelect: () => {},
        },
        {
          name: 'Pre-formatted',
          icon: () => <TypeIcon width={16} height={16} />,
          onSelect: () => {},
        },
      ],
    },
    {
      name: 'Headings separator',
      sep: true,
    },
    {
      name: 'Headings',
      expand: 3,
      children: [
        {
          name: 'Heading 1',
          icon: () => <H1Icon width={16} height={16} />,
          // icon: () => <H1Icon width={16} height={16} />,
          onSelect: () => {},
        },
        {
          name: 'Heading 2',
          icon: () => <H2Icon width={16} height={16} />,
          onSelect: () => {},
        },
        {
          name: 'Heading 3',
          icon: () => <H3Icon width={16} height={16} />,
          onSelect: () => {},
        },
        {
          name: 'Heading 4',
          icon: () => <H4Icon width={16} height={16} />,
          onSelect: () => {},
        },
        {
          name: 'Heading 5',
          icon: () => <H5Icon width={16} height={16} />,
          onSelect: () => {},
        },
        {
          name: 'Heading 6',
          icon: () => <H6Icon width={16} height={16} />,
          onSelect: () => {},
        },
        {
          sepBefore: true,
          name: 'Title',
          icon: () => <TypeIcon width={16} height={16} />,
          onSelect: () => {},
        },
        {
          name: 'Sub-title',
          icon: () => <TypeIcon width={16} height={16} />,
          onSelect: () => {},
        },
      ],
    },
    {
      sepBefore: true,
      name: 'Lists',
      expand: 3,
      children: [
        {
          name: 'Bullet list',
          // icon: () => <ListBulletedIcon width={16} height={16} />,
          icon: () => <ListBulletedIcon width={16} height={16} />,
          onSelect: () => {},
        },
        {
          name: 'Numbered list',
          icon: () => <ListNumberedIcon width={16} height={16} />,
          onSelect: () => {},
        },
        {
          name: 'Task list',
          icon: () => <ListCheckedIcon width={16} height={16} />,
          onSelect: () => {},
        },
      ],
    },
    secondBrain(),
    {
      name: 'Layouts separator',
      sep: true,
    },
    {
      name: 'Layouts',
      expand: 0,
      icon: () => <LayoutIcon width={16} height={16} />,
      children: [
        {
          name: 'Table',
          icon: () => <TableIcon width={16} height={16} />,
          onSelect: () => {},
        },
        {
          name: 'Columns',
          icon: () => <ColumnsIcon width={16} height={16} />,
          onSelect: () => {},
        },
      ],
    },
    {
      name: 'Embed',
      expand: 0,
      icon: () => <ImageInPictureIcon width={16} height={16} />,
      children: [
        {
          name: 'Image',
          icon: () => <PhotoScanIcon width={16} height={16} />,
          onSelect: () => {},
        },
        {
          name: 'File',
          icon: () => <TablerFileIcon width={16} height={16} />,
          onSelect: () => {},
        },
      ],
    },
    Object.assign(annotations(), {expand: 0}),
  ],
};
