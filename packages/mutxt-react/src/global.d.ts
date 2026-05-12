import type {MathfieldElement} from 'mathlive';

declare module 'mathlive/fonts.css' {}
declare module 'mathlive/static.css' {}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': React.DetailedHTMLProps<React.HTMLAttributes<MathfieldElement>, MathfieldElement>;
      'math-span': React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
    }
  }
}
