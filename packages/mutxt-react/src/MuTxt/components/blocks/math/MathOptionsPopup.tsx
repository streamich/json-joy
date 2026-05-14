import * as React from 'react';
import {MathOptions2} from './MathOptions2';
import type {MathElement as MathElementType} from '../../../types';

export interface MathOptionsPopupProps {
  element: MathElementType;
  closePopup?: () => void;
}

export const MathOptionsPopup: React.FC<MathOptionsPopupProps> = ({element, closePopup}) => {
  return <MathOptions2 element={element} closePopup={closePopup} />;
};
