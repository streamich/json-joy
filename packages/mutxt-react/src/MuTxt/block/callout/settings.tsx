import * as React from 'react';
import type {Styles} from '@jsonjoy.com/ui/lib/styles/Styles';
import NoteIcon__svg from 'iconista/lib/react/lineicons/notebook-1';
import TipIcon__svg from 'iconista/lib/react/lucide/lightbulb';
import WarningIcon__svg from 'iconista/lib/react/lucide/triangle-alert';
import DangerIcon__svg from 'iconista/lib/react/lucide/octagon-alert';
import ImportantIcon__svg from 'iconista/lib/react/lucide/star';
import QuoteIcon__svg from 'iconista/lib/react/lucide/quote';

const NoteIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <NoteIcon__svg width={16} height={16} {...props} />;
const TipIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <TipIcon__svg width={16} height={16} {...props} />;
const WarningIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <WarningIcon__svg width={16} height={16} {...props} />;
const DangerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <DangerIcon__svg width={16} height={16} {...props} />;
const ImportantIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <ImportantIcon__svg width={16} height={16} {...props} />;
const QuoteIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <QuoteIcon__svg width={16} height={16} {...props} />;

/**
 * Semantic flavor of a callout. Each variant maps to one of the `Styles`
 * theme colors so light/dark themes stay coherent without hard-coded hex.
 */
export type CalloutVariant = 'note' | 'tip' | 'warning' | 'danger' | 'important' | 'quote';

export const DEFAULT_VARIANT: CalloutVariant = 'note';

/** Title rendered when the element's `title` is unset (auto mode). */
export const VARIANT_TITLE: Record<CalloutVariant, string> = {
  note: 'Note',
  tip: 'Tip',
  warning: 'Warning',
  danger: 'Danger',
  important: 'Important',
  quote: 'Quote',
};

/** Iconista components rendered when the user has not set a custom `icon`. */
export const VARIANT_ICONS: Record<CalloutVariant, React.FC<{style?: React.CSSProperties}>> = {
  note: NoteIcon,
  tip: TipIcon,
  warning: WarningIcon,
  danger: DangerIcon,
  important: ImportantIcon,
  quote: QuoteIcon,
};

export const CALLOUT_VARIANTS: CalloutVariant[] = [
  'note',
  'tip',
  'warning',
  'danger',
  'important',
  'quote',
];

export const CALLOUT_VARIANT_LABEL: Record<CalloutVariant, string> = {
  note: 'Note',
  tip: 'Tip',
  warning: 'Warning',
  danger: 'Danger',
  important: 'Important',
  quote: 'Quote',
};

/** Resolve the accent color for a semantic callout variant. */
export const getVariantAccent = (styles: Styles, variant: CalloutVariant): string => {
  switch (variant) {
    case 'note':
      return styles.info + '';
    case 'tip':
      return styles.positive + '';
    case 'warning':
      return styles.warning + '';
    case 'danger':
      return styles.negative + '';
    case 'important':
      return styles.important + '';
    case 'quote':
      return styles.grey + '';
  }
};

export const isCalloutVariant = (v?: string): v is CalloutVariant =>
  v === 'note' ||
  v === 'tip' ||
  v === 'warning' ||
  v === 'danger' ||
  v === 'important' ||
  v === 'quote';

export const getCalloutVariant = (v?: string): CalloutVariant =>
  isCalloutVariant(v) ? v : DEFAULT_VARIANT;
