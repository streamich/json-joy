import * as React from 'react';
import {Caret} from './Caret';
import type {RenderLeafProps} from 'slate-react';
import type {PresenceDecoration} from './types';

type LeafProps = RenderLeafProps & {leaf: RenderLeafProps['leaf'] & PresenceDecoration};

/**
 * A `renderLeaf` component that layers remote presence visuals (caret +
 * selection highlight) on top of the app's own leaf rendering.
 *
 * Wrap your existing `renderLeaf` with {@link withPresenceLeaf} for the
 * easiest integration, or use this component directly if you prefer manual
 * control.
 */
export const PresenceLeaf = ({attributes, children, leaf}: LeafProps): React.JSX.Element => {
  const highlight = leaf.presenceHighlight;
  const caret = leaf.presenceCaret;

  const style: React.CSSProperties | undefined = highlight ? {backgroundColor: highlight} : undefined;

  return (
    <span {...attributes} style={style}>
      {caret ? <Caret info={caret} /> : null}
      {children}
    </span>
  );
};

type RenderLeafFn = (props: RenderLeafProps) => React.JSX.Element;

/**
 * Higher-order function that wraps an application's `renderLeaf` component to
 * also render remote-presence caret and selection-highlight decorations.
 *
 * Usage:
 *
 * ```tsx
 * const renderLeaf = withPresenceLeaf((props) => <MyLeaf {...props} />);
 * <Editable renderLeaf={renderLeaf} />
 * ```
 */
export const withPresenceLeaf = (AppLeaf: RenderLeafFn): RenderLeafFn => {
  const Wrapped: RenderLeafFn = (props) => {
    const leaf = props.leaf as RenderLeafProps['leaf'] & PresenceDecoration;
    const highlight = leaf.presenceHighlight;
    const caret = leaf.presenceCaret;

    // If no presence decorations on this leaf, just render the app leaf.
    if (!highlight && !caret) return <AppLeaf {...props} />;

    // Wrap the app's leaf output with presence visuals.
    const style: React.CSSProperties | undefined = highlight ? {backgroundColor: highlight} : undefined;

    return (
      <span {...props.attributes} style={style}>
        {caret ? <Caret info={caret} /> : null}
        <AppLeaf {...props} />
      </span>
    );
  };
  return Wrapped;
};
