import * as React from 'react';

export interface VoidSelectionOverlayProps {
  selected: boolean;
}

export const VoidSelectionOverlay: React.FC<VoidSelectionOverlayProps> = ({selected}) => {
  if (!selected) return null;
  return (
    <div
      contentEditable={false}
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 'inherit',
        background: 'rgba(0, 127, 255, 0.18)',
        pointerEvents: 'none',
      }}
    />
  );
};
