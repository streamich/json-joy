import * as React from 'react';
import {useT} from 'use-t';
import BasicButton, {type BasicButtonProps} from '../BasicButton';
import {BasicTooltip} from '../../4-card/BasicTooltip';
import FlipHorizontal from '../../icons/interactive/FlipHorizontal';
import {Iconista} from '../../icons/Iconista';
import {Popup} from '../../4-card/Popup';
import {ContextMenu} from '../../4-card/ContextMenu';
import {Sidetip} from '../../1-inline/Sidetip';

const trashIcon = <Iconista set="bootstrap" icon="trash2" width={16} height={16} />;
const trashIconAnimated = <FlipHorizontal>{trashIcon}</FlipHorizontal>;

export interface BasicButtonDeleteProps extends BasicButtonProps {
  tooltip?: boolean | React.ReactNode;
  onConfirm?: () => void;
}

export const BasicButtonDelete: React.FC<BasicButtonDeleteProps> = ({tooltip, onConfirm, ...rest}) => {
  const [t] = useT();
  const title = t('Delete');

  let element = (
    <BasicButton title={title} {...rest}>
      {trashIconAnimated}
    </BasicButton>
  );

  if (tooltip) {
    element = (
      <BasicTooltip
        renderTooltip={() => (tooltip === true ? title : tooltip)}
        onClick={onConfirm ? () => {} : rest.onClick}
      >
        {element}
      </BasicTooltip>
    );
  }

  if (onConfirm) {
    element = (
      <Popup
        renderContext={({onEsc}) => (
          <ContextMenu
            inset
            onEsc={onEsc}
            menu={{
              name: 'Confirm delete',
              minWidth: 240,
              children: [
                {
                  name: 'Cancel',
                  onSelect: () => {},
                },
                {
                  name: 'Delete',
                  onSelect: onConfirm,
                  danger: true,
                  right: () => <Sidetip small>{t('Are you sure?')}</Sidetip>,
                  // icon: () => <Iconista set="bootstrap" icon="lightning" width={16} height={16} />,
                  // icon: () => <svg width={16} height={16} viewBox="0 0 640 640"><path d="M480 208C480 128.5 408.4 64 320 64C231.6 64 160 128.5 160 208C160 255.1 185.1 296.9 224 323.2L224 352C224 369.7 238.3 384 256 384L384 384C401.7 384 416 369.7 416 352L416 323.2C454.9 296.9 480 255.1 480 208zM256 192C273.7 192 288 206.3 288 224C288 241.7 273.7 256 256 256C238.3 256 224 241.7 224 224C224 206.3 238.3 192 256 192zM352 224C352 206.3 366.3 192 384 192C401.7 192 416 206.3 416 224C416 241.7 401.7 256 384 256C366.3 256 352 241.7 352 224zM541.5 403.7C534.7 387.4 516 379.7 499.7 386.5L320 461.3L140.3 386.5C124 379.7 105.3 387.4 98.5 403.7C91.7 420 99.4 438.7 115.7 445.5L236.8 496L115.7 546.5C99.4 553.3 91.7 572 98.5 588.3C105.3 604.6 124 612.3 140.3 605.5L320 530.7L499.7 605.5C516 612.3 534.7 604.6 541.5 588.3C548.3 572 540.6 553.3 524.3 546.5L403.2 496L524.3 445.5C540.6 438.7 548.3 420 541.5 403.7z"/></svg>,
                  icon: () => <svg width={16} height={16} style={{fill: 'currentColor'}} viewBox="0 0 640 640"><path d="M480 491.4C538.5 447.4 576 379.8 576 304C576 171.5 461.4 64 320 64C178.6 64 64 171.5 64 304C64 379.8 101.5 447.4 160 491.4L160 528C160 554.5 181.5 576 208 576L240 576L240 536C240 522.7 250.7 512 264 512C277.3 512 288 522.7 288 536L288 576L352 576L352 536C352 522.7 362.7 512 376 512C389.3 512 400 522.7 400 536L400 576L432 576C458.5 576 480 554.5 480 528L480 491.4zM160 320C160 284.7 188.7 256 224 256C259.3 256 288 284.7 288 320C288 355.3 259.3 384 224 384C188.7 384 160 355.3 160 320zM416 256C451.3 256 480 284.7 480 320C480 355.3 451.3 384 416 384C380.7 384 352 355.3 352 320C352 284.7 380.7 256 416 256z"/></svg>,
                },
              ],
            }}
          />
        )}
      >
        {element}
      </Popup>
    );
  }

  return element;
};
