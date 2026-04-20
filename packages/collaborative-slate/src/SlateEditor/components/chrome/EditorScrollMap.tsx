import * as React from 'react';
import {Marker, useScrollArea} from '@jsonjoy.com/ui/lib/4-card/ScrollArea';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {useSyncStore} from '@jsonjoy.com/ui/lib/hooks/useSyncStore';
import {measureScrollMapMarkers} from '../../behavior/scroll-map';
import type {Editor} from 'slate';

export interface EditorScrollMapProps {
  editor: Editor;
  contentVersion: number;
}

export const EditorScrollMap: React.FC<EditorScrollMapProps> = ({editor, contentVersion}) => {
  const styles = useStyles();
  const scrollArea = useScrollArea();
  const scrollHeight = useSyncStore(scrollArea.scrollHeight$);
  const clientHeight = useSyncStore(scrollArea.clientHeight$);
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
  }, [clientHeight, contentVersion, editor, scrollArea, scrollHeight, styles.light]);

  if (!markers.length) return null;

  return (
    <>
      {markers.map((marker) => (
        <Marker
          key={marker.key}
          position={marker.position}
          color={marker.color}
          height={marker.height}
          style={{
            borderRadius: 1,
            left: marker.left ?? 1,
            right: marker.right ?? 1,
          }}
        />
      ))}
    </>
  );
};