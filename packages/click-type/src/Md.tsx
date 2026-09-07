import {Markdown} from '@jsonjoy.com/ui/lib/markdown';
import * as React from 'react';

export interface MdProps {
  src?: string;
}

/**
 * Renders a short text field (title, description, ...) as inline Markdown using
 * the shared `@jsonjoy.com/ui` renderer, so backticks, links, emphasis, etc.
 * render properly. Returns `null` for empty input.
 */
export const Md: React.FC<MdProps> = ({src}) => (src ? <Markdown inline src={src} /> : null);
