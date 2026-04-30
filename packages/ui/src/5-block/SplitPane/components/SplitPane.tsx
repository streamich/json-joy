import * as React from 'react';
import type {CSSProperties, ReactElement} from 'react';
import {Children, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {SplitPaneProps, PaneProps, ResizeEvent} from '../types';
import {Pane} from './Pane';
import {Divider, WIDTH as DIVIDER_WIDTH} from './Divider';
import {useResizer} from '../hooks/useResizer';
import {useKeyboardResize} from '../hooks/useKeyboardResize';
import {convertToPixels, distributeSizes} from '../utils/calculations';
import {cn} from '../utils/classNames';

const DEFAULT_CLASSNAME = 'split-pane';
const MIN_PANES = 2;

/**
 * A flexible split pane component that allows resizable pane layouts.
 *
 * Supports horizontal (side-by-side) and vertical (stacked) layouts with
 * mouse, touch, and keyboard interactions. Fully accessible with ARIA attributes.
 *
 * @example
 * ```tsx
 * // Basic horizontal split
 * <SplitPane direction="horizontal">
 *   <Pane minSize="200px" defaultSize="300px">
 *     <Sidebar />
 *   </Pane>
 *   <Pane>
 *     <MainContent />
 *   </Pane>
 * </SplitPane>
 *
 * // Controlled mode with state
 * const [sizes, setSizes] = useState([300, 500]);
 * <SplitPane onResize={setSizes}>
 *   <Pane size={sizes[0]}>Left</Pane>
 *   <Pane size={sizes[1]}>Right</Pane>
 * </SplitPane>
 * ```
 */
export const SplitPane: React.FC<SplitPaneProps> = (props) => {
  const {
    direction = 'horizontal',
    resizable = true,
    snapPoints,
    snapTolerance = 10,
    step,
    onResizeStart,
    onResize,
    onResizeEnd,
    onEl,
    className,
    style,
    divider: CustomDivider,
    dividerStyle,
    dividerClassName,
    dividerSize = DIVIDER_WIDTH,
    children,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState(0);
  const prevContainerSizeRef = useRef(0);

  // Extract pane configuration from children - memoized to avoid recreating on every render
  const paneConfigs = useMemo(() => {
    const paneElements = Children.toArray(children).filter(
      (child): child is ReactElement<PaneProps> => typeof child === 'object' && child !== null && 'props' in child,
    );

    return paneElements.map((pane) => ({
      props: pane.props,
      size: pane.props.size,
      defaultSize: pane.props.defaultSize,
      minSize: pane.props.minSize ?? 0,
      maxSize: pane.props.maxSize ?? Infinity,
      hidden: !!pane.props.hidden,
    }));
  }, [children]);

  const paneCount = paneConfigs.length;
  const visiblePaneIndexes = useMemo(
    () =>
      paneConfigs.reduce<number[]>((indexes, config, index) => {
        if (!config.hidden) {
          indexes.push(index);
        }
        return indexes;
      }, []),
    [paneConfigs],
  );
  const visiblePaneCount = visiblePaneIndexes.length;
  const visiblePaneConfigs = useMemo(
    () => visiblePaneIndexes.map((index) => paneConfigs[index]),
    [paneConfigs, visiblePaneIndexes],
  );
  const visiblePaneSignature = useMemo(() => visiblePaneIndexes.join(','), [visiblePaneIndexes]);
  const paneIndexToVisibleIndex = useMemo(() => {
    const indexMap = new Map<number, number>();

    visiblePaneIndexes.forEach((paneIndex, visibleIndex) => {
      indexMap.set(paneIndex, visibleIndex);
    });

    return indexMap;
  }, [visiblePaneIndexes]);
  const warnedRef = useRef(false);

  // Warn once if fewer than 2 panes
  if (paneCount < MIN_PANES && !warnedRef.current) {
    warnedRef.current = true;
    console.warn(`SplitPane requires at least ${MIN_PANES} Pane children. Received ${paneCount}.`);
  }

  // Calculate min/max sizes from pane configs
  const {minSizes, maxSizes} = useMemo(() => {
    if (containerSize === 0) {
      return {
        minSizes: new Array(visiblePaneCount).fill(0),
        maxSizes: new Array(visiblePaneCount).fill(Infinity),
      };
    }

    const mins: number[] = [];
    const maxs: number[] = [];

    visiblePaneConfigs.forEach((config) => {
      mins.push(convertToPixels(config.minSize, containerSize));
      maxs.push(config.maxSize === Infinity ? Infinity : convertToPixels(config.maxSize, containerSize));
    });

    return {minSizes: mins, maxSizes: maxs};
  }, [containerSize, visiblePaneCount, visiblePaneConfigs]);

  // Calculate initial sizes from pane configs
  const calculateInitialSizes = useCallback(
    (containerSz: number): number[] => {
      if (visiblePaneCount === 0) {
        return [];
      }

      if (containerSz === 0) {
        return new Array(visiblePaneCount).fill(0);
      }

      // Account for divider widths when calculating available space
      const totalDividerWidth = dividerSize * Math.max(visiblePaneCount - 1, 0);
      const availableSpace = Math.max(containerSz - totalDividerWidth, 0);

      // First pass: calculate sizes for panes with explicit sizes
      const sizes: (number | null)[] = visiblePaneConfigs.map((config) => {
        const paneSize = config.size ?? config.defaultSize;
        if (paneSize !== undefined) {
          return convertToPixels(paneSize, availableSpace);
        }
        return null; // Mark as needing auto-size
      });

      // Calculate remaining space and distribute to auto-sized panes
      const explicitTotal = sizes.reduce<number>((sum, size) => sum + (size ?? 0), 0);
      const autoSizedCount = sizes.filter((s) => s === null).length;
      const remainingSpace = availableSpace - explicitTotal;
      const autoSize = autoSizedCount > 0 ? remainingSpace / autoSizedCount : 0;

      // Second pass: fill in auto-sized panes
      return sizes.map((size) => (size === null ? autoSize : size));
    },
    [visiblePaneCount, visiblePaneConfigs, dividerSize],
  );

  const [paneLayout, setPaneLayout] = useState<{signature: string; sizes: number[]}>(() => ({
    signature: visiblePaneSignature,
    sizes: calculateInitialSizes(containerSize),
  }));
  const paneSizes =
    paneLayout.signature === visiblePaneSignature ? paneLayout.sizes : calculateInitialSizes(containerSize);

  // Sync paneSizes with controlled size props when they change
  // This handles the case where parent state is reset (e.g., clicking a "Reset" button)
  useEffect(() => {
    if (containerSize === 0) return;

    // Check if any pane has a controlled size prop
    // Calculate what sizes should be based on current props
    const expectedSizes = calculateInitialSizes(containerSize);
    const hasControlledSizes = visiblePaneConfigs.some((config) => config.size !== undefined);

    setPaneLayout((currentLayout) => {
      const paneStructureChanged =
        currentLayout.signature !== visiblePaneSignature || currentLayout.sizes.length !== expectedSizes.length;

      if (paneStructureChanged) {
        return {
          signature: visiblePaneSignature,
          sizes: expectedSizes,
        };
      }

      if (!hasControlledSizes) {
        return currentLayout;
      }

      const sizesMatch =
        currentLayout.sizes.length === expectedSizes.length &&
        currentLayout.sizes.every((size, i) => size === expectedSizes[i]);

      return sizesMatch
        ? currentLayout
        : {
            signature: visiblePaneSignature,
            sizes: expectedSizes,
          };
    });
  }, [containerSize, visiblePaneConfigs, visiblePaneSignature, calculateInitialSizes]);

  // Handle container size changes
  // For controlled panes: maintain fixed pixel sizes from props
  // For uncontrolled panes: distribute proportionally
  const handleContainerSizeChange = useCallback(
    (newContainerSize: number) => {
      const prevSize = prevContainerSizeRef.current;
      prevContainerSizeRef.current = newContainerSize;

      if (newContainerSize === 0) return;

      // Check if any pane has a controlled size prop
      const hasControlledSizes = visiblePaneConfigs.some((config) => config.size !== undefined);

      // Calculate available space after accounting for dividers
      const totalDividerWidth = dividerSize * Math.max(visiblePaneCount - 1, 0);
      const availableSpace = Math.max(newContainerSize - totalDividerWidth, 0);

      setPaneLayout((currentLayout) => {
        const currentSizes =
          currentLayout.signature === visiblePaneSignature
            ? currentLayout.sizes
            : calculateInitialSizes(newContainerSize);

        // If sizes are uninitialized or pane count changed
        if (currentSizes.every((s) => s === 0) || currentSizes.length !== visiblePaneCount) {
          return {
            signature: visiblePaneSignature,
            sizes: calculateInitialSizes(newContainerSize),
          };
        }

        // If container size changed
        if (prevSize > 0 && prevSize !== newContainerSize) {
          // For controlled panes, recalculate from props to maintain fixed sizes
          if (hasControlledSizes) {
            return {
              signature: visiblePaneSignature,
              sizes: calculateInitialSizes(newContainerSize),
            };
          }
          // For uncontrolled panes, distribute proportionally using available space
          return {
            signature: visiblePaneSignature,
            sizes: distributeSizes(currentSizes, availableSpace),
          };
        }

        // First measurement - use initial sizes
        if (prevSize === 0) {
          return {
            signature: visiblePaneSignature,
            sizes: calculateInitialSizes(newContainerSize),
          };
        }

        return currentLayout;
      });
    },
    [visiblePaneConfigs, visiblePaneCount, visiblePaneSignature, calculateInitialSizes, dividerSize],
  );

  // Track the last observed container size to detect meaningful changes
  const lastObservedSizeRef = useRef(0);

  // Measure container size with ResizeObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSizeFromRect = (rect: {width: number; height: number}) => {
      const rawSize = direction === 'horizontal' ? rect.width : rect.height;
      // Round to nearest integer to prevent sub-pixel variations from causing
      // resize feedback loops (fixes #873)
      const size = Math.round(rawSize);
      if (size > 0 && size !== lastObservedSizeRef.current) {
        lastObservedSizeRef.current = size;
        setContainerSize(size);
        handleContainerSizeChange(size);
      }
    };

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        updateSizeFromRect(entry.contentRect);
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [direction, handleContainerSizeChange]);

  // Handle resize callback
  const handleResize = useCallback(
    (newSizes: number[], event: ResizeEvent) => {
      setPaneLayout({signature: visiblePaneSignature, sizes: newSizes});
      onResize?.(newSizes, event);
    },
    [onResize, visiblePaneSignature],
  );

  // Resizer hook
  const {isDragging, currentSizes, handlePointerDown} = useResizer({
    direction,
    sizes: paneSizes,
    minSizes,
    maxSizes,
    snapPoints,
    snapTolerance,
    step,
    onResizeStart,
    onResize: handleResize,
    onResizeEnd,
  });

  const renderedSizes = isDragging ? currentSizes : paneSizes;

  // Keyboard resize hook
  const {handleKeyDown} = useKeyboardResize({
    direction,
    sizes: currentSizes,
    minSizes,
    maxSizes,
    step,
    onResize: handleResize,
    onResizeEnd,
  });

  // Deprecated handlers for backwards compatibility
  // These delegate to the pointer handler so custom dividers using old props still work
  const createMouseDownHandler = useCallback(
    (index: number) => (e: React.MouseEvent) => {
      // Create a synthetic pointer event from the mouse event
      const pointerEvent = {
        ...e,
        pointerId: 1,
        pointerType: 'mouse',
        nativeEvent: e.nativeEvent,
      } as unknown as React.PointerEvent;
      handlePointerDown(index)(pointerEvent);
    },
    [handlePointerDown],
  );

  const createTouchStartHandler = useCallback(
    (index: number) => (e: React.TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      // Create a synthetic pointer event from the touch event
      const pointerEvent = {
        ...e,
        clientX: touch.clientX,
        clientY: touch.clientY,
        pointerId: touch.identifier,
        pointerType: 'touch',
        nativeEvent: e.nativeEvent,
      } as unknown as React.PointerEvent;
      handlePointerDown(index)(pointerEvent);
    },
    [handlePointerDown],
  );

  // Touch end is now a no-op since pointer events handle cleanup
  const handleTouchEnd = useCallback(() => {
    // No-op - pointer events handle the end of drag
  }, []);

  // Container styles
  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: direction === 'horizontal' ? 'row' : 'column',
    height: '100%',
    width: '100%',
    position: 'relative',
    ...style,
  };

  const containerClassName = cn(DEFAULT_CLASSNAME, direction, className);

  // Render panes and dividers
  const renderChildren = () => {
    if (visiblePaneCount === 0) {
      return null;
    }

    const elements: React.ReactElement[] = [];

    paneConfigs.forEach((config, index) => {
      const visibleIndex = paneIndexToVisibleIndex.get(index);
      const paneSize = visibleIndex === undefined ? 0 : (renderedSizes[visibleIndex] ?? 0);

      const paneStyle: CSSProperties = {
        ...(direction === 'horizontal'
          ? {width: `${paneSize}px`, height: '100%'}
          : {height: `${paneSize}px`, width: '100%'}),
        ...config.props.style,
        ...(config.hidden ? {display: 'none'} : undefined),
      };

      // Render pane
      elements.push(
        <Pane key={`pane-${index}`} {...config.props} style={paneStyle}>
          {config.props.children}
        </Pane>,
      );

      // Render dividers between visible panes only.
      if (visibleIndex !== undefined && visibleIndex < visiblePaneCount - 1) {
        const DividerComponent = CustomDivider ?? Divider;
        const dividerMinSize = minSizes[visibleIndex];
        const dividerMaxSize = maxSizes[visibleIndex];

        elements.push(
          <DividerComponent
            key={`divider-${index}`}
            direction={direction}
            index={visibleIndex}
            isDragging={isDragging}
            disabled={!resizable}
            onPointerDown={handlePointerDown(visibleIndex)}
            onMouseDown={createMouseDownHandler(visibleIndex)}
            onTouchStart={createTouchStartHandler(visibleIndex)}
            onTouchEnd={handleTouchEnd}
            onKeyDown={handleKeyDown(visibleIndex)}
            className={dividerClassName}
            style={dividerStyle}
            currentSize={paneSize}
            minSize={dividerMinSize}
            maxSize={dividerMaxSize === Infinity ? undefined : dividerMaxSize}
          />,
        );
      }
    });

    return elements;
  };

  return (
    <div ref={(el) => {
      containerRef.current = el;
      onEl?.(el);
    }} className={containerClassName} style={containerStyle}>
      {containerSize > 0 && renderChildren()}
    </div>
  );
};
