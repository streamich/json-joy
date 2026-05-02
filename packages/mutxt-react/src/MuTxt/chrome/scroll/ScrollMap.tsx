import * as React from 'react';
import {keyframes, rule} from 'nano-theme';
import {Marker, useScrollArea} from '@jsonjoy.com/ui/lib/4-card/ScrollArea';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {useSyncStore} from '@jsonjoy.com/ui/lib/hooks/useSyncStore';
import {measureScrollMapMarkers} from '../../behavior/scroll-map';
import {useMuTxt} from '../../context';
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

export interface ScrollMapProps {
  editor: Editor;
}

export const ScrollMap: React.FC<ScrollMapProps> = ({editor}) => {
  const state = useMuTxt();
  const styles = useStyles();
  const scrollArea = useScrollArea();
  const scrollHeight = useSyncStore(scrollArea.scrollHeight$);
  const clientHeight = useSyncStore(scrollArea.clientHeight$);
  const focused = state.focused.use();
  state.wnd.use();
  const version = state.version.use();
  const cursor = state.cursor.use();
  const scrollVersion = state.scrollVersion.use();
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
  }, [clientHeight, editor, focused, scrollArea, scrollHeight, styles.light, version, scrollVersion, cursor]);

  if (!markers.length) return null;

  return (
    <>
      {markers.map((marker) => {
        const {variant = 'left'} = marker;
        if (variant === 'selection') {
          return (
            <Marker key={marker.key} position={marker.position} height={marker.height}>
              {(markerStyle) => (
                <div
                  className={selectionMarkerClass}
                  style={{
                    position: 'absolute',
                    ...markerStyle,
                    left: 0,
                    right: 0,
                    borderRadius: 0,
                  }}
                />
              )}
            </Marker>
          );
        }

        return (
          <Marker
            key={marker.key}
            position={marker.position}
            color={marker.color}
            height={marker.height}
            style={{
              left: variant === 'right' ? 6 : 1,
              right: variant === 'left' ? 6 : 1,
              borderRadius: 1,
            }}
          />
        );
      })}
    </>
  );
};
