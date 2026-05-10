import * as React from 'react';
import useDropArea from 'react-use/lib/useDropArea';
import {drule, rule} from 'nano-theme';
import {useStyles} from '../../styles/context';
import {Paper} from '../../4-card/Paper';
import {Text} from '../../1-inline/Text';
import {DropAreaState} from './state';
import type {DropAreaProps} from './types';

const blockClass = rule({
  bxz: 'border-box',
  pd: '8px',
});

const areaClass = drule({
  d: 'flex',
  fld: 'column',
  ai: 'center',
  jc: 'center',
  gap: '12px',
  bdrad: '8px',
  cur: 'pointer',
  ta: 'center',
  svg: {
    stroke: 'currentColor',
  },
  '&:hover svg': {
    stroke: 'currentColor',
  },
});

const inputClass = rule({
  d: 'none',
});

/**
 * A reusable drop zone with built-in dashed-border styling and hover
 * affordances. Forwards dropped files to {@link DropAreaProps.onFiles}, and
 * by default opens a native file picker when clicked.
 *
 * The state is exposed via the `state` prop (or via
 * {@link DropAreaProps.onState}) so consumers can render a custom
 * "Choose file…" button outside the drop zone while reusing the same
 * picker logic — call {@link DropAreaState.pick} to open the file picker
 * programmatically.
 *
 * Pass any {@link React.ReactNode} as children to customize the inner
 * label (e.g. an icon paired with text).
 *
 * @example
 * ```tsx
 * <DropArea onFiles={(files) => upload(files)}>
 *   <Iconista set="lucide" icon="upload" width={24} height={24} />
 *   <span>Drop a file here, or click to pick</span>
 * </DropArea>
 * ```
 *
 * @example
 * ```tsx
 * const state = React.useMemo(() => new DropAreaState(upload), []);
 * <DropArea state={state} />
 * <button onClick={state.pick}>Choose file…</button>
 * ```
 */
export const DropArea: React.FC<DropAreaProps> = ({
  state: stateProp,
  onState,
  onFiles,
  onUri,
  onText,
  multiple = true,
  accept,
  clickToPick = true,
  onClick,
  compact,
  paper = true,
  children,
  className,
  style,
}) => {
  const stateRef = React.useRef<DropAreaState | null>(stateProp ?? null);
  if (!stateRef.current) stateRef.current = stateProp ?? new DropAreaState();
  const state = stateRef.current;

  if (onFiles !== undefined) state.onFiles = onFiles;
  if (onUri !== undefined) state.onUri = onUri;
  if (onText !== undefined) state.onText = onText;
  state.multiple = multiple;
  state.accept = accept;

  React.useEffect(() => {
    onState?.(state);
  }, [state, onState]);

  const styles = useStyles();
  const over = state.over.use();

  const [bond, area] = useDropArea({
    onFiles: (files) => state.onFiles?.(files),
    onUri: (uri) => state.onUri?.(uri),
    onText: (text) => state.onText?.(text),
  });

  React.useEffect(() => {
    if (area.over !== state.over.value) state.over.set(area.over);
  }, [area.over, state]);

  const link = styles.col.get('link', 'solid-1');
  const verticalPadding = compact ? 16 : 32;
  const dashed = over ? `1px dashed ${link}` : `1px dashed ${styles.g(0.82)}`;
  const bg = over ? 'rgba(0,128,255,.04)' : styles.g(1, .5);

  const areaCls = areaClass({
    pd: `${verticalPadding}px 8px`,
    bd: dashed,
    bg,
    '&:hover': {
      bd: `1px dashed ${link}`,
      bg: 'rgba(0,128,255,.04)',
      col: link,
    },
  });

  const content = children ?? (
    <Text font={'ui3'} size={-1} style={{pointerEvents: 'none'}}>
      Click or drop files here
    </Text>
  );

  const area$ = (
    // biome-ignore lint/a11y/useKeyWithClickEvents: click triggers file input, keyboard accessible via the input itself
    <div
      {...bond}
      className={paper ? areaCls : areaCls + (className ? ` ${className}` : '')}
      style={paper ? undefined : style}
      onClick={onClick ?? (clickToPick ? state.pick : undefined)}
    >
      {content}
      <input
        type="file"
        ref={state.setInputEl}
        multiple={multiple}
        accept={accept}
        className={inputClass}
        onChange={(ev) => {
          const input = ev.currentTarget;
          const files = input.files;
          if (files && files.length) state.onFiles?.(Array.from(files));
          input.value = '';
        }}
      />
    </div>
  );

  if (!paper) return area$;

  return (
    <Paper
      className={blockClass + (className ? ` ${className}` : '')}
      round
      contrast
      style={{padding: compact ? 4 : undefined, ...style}}
    >
      {area$}
    </Paper>
  );
};
