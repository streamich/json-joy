export const DESCRIPTION = `
This demo showcases synchronization of two text areas using
the \`CollaborativeInput\` component from \`@jsonjoy.com/collaborative-input-react\` package.
You can type in either text
area, and the changes will be reflected in both areas after synchronization.
Use the top bar buttons to manually synchronize or adjust auto-sync settings.

The \`<CollaborativeInput>\` React component binds a JSON CRDT "str" node to
either \`<input>\` or \`<textarea>\` DOM element. You provide the JSON "str" node
via the \`str\` prop, and a render prop \`input\` that receives a \`ref\` to be
attached to the desired DOM element:

\`\`\`jsx
import {CollaborativeInput} from '@jsonjoy.com/collaborative-input-react';

<CollaborativeInput
  str={() => model.api.str(['text'])}
  input={(connect) => <textarea ref={connect} />}
/>
\`\`\`
`;
