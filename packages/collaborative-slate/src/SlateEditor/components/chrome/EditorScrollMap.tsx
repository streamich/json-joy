import * as React from 'react';
import {keyframes, rule} from 'nano-theme';
import {Marker, useScrollArea} from '@jsonjoy.com/ui/lib/4-card/ScrollArea';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {useSyncStore} from '@jsonjoy.com/ui/lib/hooks/useSyncStore';
import {measureScrollMapMarkers} from '../../behavior/scroll-map';
import {useSlateEditorState} from '../../context';
import type {Editor} from 'slate';

const selectionMarkerBlink = keyframes({
  '0%': {opacity: 1},
  '50%': {opacity: 0.22},
  '100%': {opacity: 1},
});

const selectionMarkerClass = rule({
  // bd: '1px dashed #000',
  bd: '1px dashed #07f',
  bg: 'rgba(7,122,255,.22)',
  bxz: 'border-box',
  minH: '2px',
  trs: 'height .1s ease-out, top .1s ease-out, bottom .1s ease-out',
  animation: `${selectionMarkerBlink} .5s step-start infinite`,
  zIndex: 1,
});

export interface EditorScrollMapProps {
  editor: Editor;
}

export const EditorScrollMap: React.FC<EditorScrollMapProps> = ({editor}) => {
  const state = useSlateEditorState();
  const styles = useStyles();
  const scrollArea = useScrollArea();
  const scrollHeight = useSyncStore(scrollArea.scrollHeight$);
  const clientHeight = useSyncStore(scrollArea.clientHeight$);
  const version = state.scrollMapVersion.use();
  const [markers, setMarkers] = React.useState<ReturnType<typeof measureScrollMapMarkers>>([]);

  React.useLayoutEffect(() => {
    if (!scrollArea.viewportEl || scrollHeight <= clientHeight || scrollHeight <= 0) {
      setMarkers([]);
      return;
    }

    const viewportEl = scrollArea.viewportEl;
    const frame = requestAnimationFrame(() => {
      const railHeight = scrollArea.railEl?.clientHeight ?? clientHeight;
      setMarkers(measureScrollMapMarkers(editor, viewportEl, scrollHeight, railHeight, styles.light ?? true));
    });

    return () => cancelAnimationFrame(frame);
  }, [clientHeight, editor, scrollArea, scrollHeight, styles.light, version]);

  if (!markers.length) return null;

  return (
    <>
      {markers.map((marker) => {
        const {variant = 'left'} = marker;
        return (
          <Marker
            key={marker.key}
            position={marker.position}
            color={marker.color}
            height={marker.height}
            className={variant === 'selection' ? selectionMarkerClass : undefined}
            style={{
              left: variant === 'selection' ? 0 : variant === 'right' ? 6 : 1,
              right: variant === 'selection' ? 0 : variant === 'left' ? 6 : 1,
              background: variant === 'selection' ? void 0 : marker.color,
              borderRadius: variant === 'selection' ? 0 : 1,
            }}
          />
        );
      })}
    </>
  );
};