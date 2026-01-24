import * as React from 'react';
const emojiJs = require('emoji-js'); // eslint-disable-line

const emoji = new emojiJs();
emoji.replace_mode = 'unified';

export interface EmojiInlineProps {
  source: string;
  renderVoid?: (text: string) => React.ReactElement | null;
}

const renderVoidDefault = (source: React.ReactNode) => <span>{source}</span>;

export const EmojiInline: React.FC<EmojiInlineProps> = React.memo(({source, renderVoid = renderVoidDefault}) => {
  const text = ':' + source + ':';
  const icon = emoji.replace_colons(text);

  if (icon === source) {
    return renderVoid(text) || null;
  }

  return <span>{icon}</span>;
});

export default EmojiInline;
