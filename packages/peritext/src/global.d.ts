import type {MathfieldElement} from "mathlive";

// biome-ignore lint/style/noNamespace: required module ambient declarations
declare module 'mathlive/fonts.css' {}
// biome-ignore lint/style/noNamespace: required module ambient declarations
declare module 'mathlive/static.css' {}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': React.DetailedHTMLProps<React.HTMLAttributes<MathfieldElement>, MathfieldElement>;
    }
  }
}
