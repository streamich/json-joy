import {md} from '@jsonjoy.com/ui/lib/markdown/parser';

const markdown = require('./text.md').default;
export const text = md(markdown);
