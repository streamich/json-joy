// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {Paper} from 'nice-ui/lib/4-card/Paper';
import {Flex} from 'nice-ui/lib/3-list-item/Flex';
import {BasicButton} from '../../../components/BasicButton';
import {Sidetip} from 'nice-ui/lib/1-inline/Sidetip';
import {Code} from 'nice-ui/lib/1-inline/Code';
import {Iconista} from 'nice-ui/lib/icons/Iconista';
import {ToolbarMenu} from 'nice-ui/lib/4-card/Toolbar/ToolbarMenu';
import {FontStyleButton} from 'nice-ui/lib/2-inline-block/FontStyleButton';
import {keyframes, rule} from 'nano-theme';
import type {MenuItem} from 'nice-ui/lib/4-card/StructuralMenu/types';
import {inlineText} from '../menus/menus';

const introAnimation = keyframes({
  from: {
    tr: 'scale(.9)',
  },
  to: {
    tr: 'scale(1)',
  },
});

const blockClass = rule({
  an: introAnimation + ' .1s forwards',
});

// biome-ignore lint: empty interface
export type CaretToolbarProps = {};

export const CaretToolbar: React.FC<CaretToolbarProps> = () => {
  return (
    // <div style={{transform: 'translate(-50%,0)'}}>
    <ToolbarMenu menu={inlineText} />
    // </div>
  );
  // return (
  //   <Paper hoverElevate level={3} className={blockClass}>
  //     <Flex style={{alignItems: 'center', columnGap: 4, rowGap: 4, padding: 4, color: 'black'}}>
  //       <BasicButton size={32} width={30} radius={5} onClick={() => {}}>
  //         <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
  //           <path
  //             d="M5.10505 12C4.70805 12 4.4236 11.912 4.25171 11.736C4.0839 11.5559 4 11.2715 4 10.8827V4.11733C4 3.72033 4.08595 3.43588 4.25784 3.26398C4.43383 3.08799 4.71623 3 5.10505 3C6.42741 3 8.25591 3 9.02852 3C10.1373 3 11.0539 3.98153 11.0539 5.1846C11.0539 6.08501 10.6037 6.81855 9.70327 7.23602C10.8657 7.44851 11.5176 8.62787 11.5176 9.48128C11.5176 10.5125 10.9902 12 9.27734 12C8.77742 12 6.42626 12 5.10505 12ZM8.37891 8.00341H5.8V10.631H8.37891C8.9 10.631 9.6296 10.1211 9.6296 9.29877C9.6296 8.47643 8.9 8.00341 8.37891 8.00341ZM5.8 4.36903V6.69577H8.17969C8.53906 6.69577 9.27734 6.35939 9.27734 5.50002C9.27734 4.64064 8.48047 4.36903 8.17969 4.36903H5.8Z"
  //             fill="currentColor"
  //           />
  //         </svg>
  //       </BasicButton>
  //       <BasicButton size={32} width={30} radius={5} onClick={() => {}}>
  //         <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
  //           <path
  //             d="M5.67494 3.50017C5.67494 3.25164 5.87641 3.05017 6.12494 3.05017H10.6249C10.8735 3.05017 11.0749 3.25164 11.0749 3.50017C11.0749 3.7487 10.8735 3.95017 10.6249 3.95017H9.00587L7.2309 11.05H8.87493C9.12345 11.05 9.32493 11.2515 9.32493 11.5C9.32493 11.7486 9.12345 11.95 8.87493 11.95H4.37493C4.1264 11.95 3.92493 11.7486 3.92493 11.5C3.92493 11.2515 4.1264 11.05 4.37493 11.05H5.99397L7.76894 3.95017H6.12494C5.87641 3.95017 5.67494 3.7487 5.67494 3.50017Z"
  //             fill="currentColor"
  //             fillRule="evenodd"
  //             clipRule="evenodd"
  //           />
  //         </svg>
  //       </BasicButton>
  //       <BasicButton size={32} width={30} radius={5} onClick={() => {}}>
  //         <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
  //           <path
  //             d="M5.00001 2.75C5.00001 2.47386 4.77615 2.25 4.50001 2.25C4.22387 2.25 4.00001 2.47386 4.00001 2.75V8.05C4.00001 9.983 5.56702 11.55 7.50001 11.55C9.43301 11.55 11 9.983 11 8.05V2.75C11 2.47386 10.7762 2.25 10.5 2.25C10.2239 2.25 10 2.47386 10 2.75V8.05C10 9.43071 8.88072 10.55 7.50001 10.55C6.1193 10.55 5.00001 9.43071 5.00001 8.05V2.75ZM3.49998 13.1001C3.27906 13.1001 3.09998 13.2791 3.09998 13.5001C3.09998 13.721 3.27906 13.9001 3.49998 13.9001H11.5C11.7209 13.9001 11.9 13.721 11.9 13.5001C11.9 13.2791 11.7209 13.1001 11.5 13.1001H3.49998Z"
  //             fill="currentColor"
  //             fillRule="evenodd"
  //             clipRule="evenodd"
  //           />
  //         </svg>
  //       </BasicButton>
  //       <BasicButton size={32} width={30} radius={5} onClick={() => {}}>
  //         <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
  //           <path
  //             d="M1.03791 9.98075C0.934777 9.6583 1.11603 9.37719 1.40005 9.24871C1.68408 9.12022 2.09463 9.13412 2.27071 9.45426C2.85393 10.5147 3.64599 10.7282 4.48665 10.7282C5.52721 10.7282 6.29659 10.2615 6.29659 9.45426C6.29659 8.8047 5.9119 8.46416 4.87134 8.14253L4.15872 7.92181C2.64518 7.44883 1.88842 6.69206 1.88842 5.45601C1.88842 3.79743 3.27583 2.6875 5.24342 2.6875C6.91733 2.6875 7.97409 3.33536 8.43833 4.31065C8.57087 4.58909 8.57614 4.91294 8.22794 5.19114C7.87974 5.46934 7.52351 5.34799 7.23327 5.03839C6.47215 4.22653 5.99545 4.04968 5.25604 4.04968C4.1398 4.04968 3.547 4.63618 3.547 5.27943C3.547 5.86592 3.96322 6.23169 4.94702 6.5344L5.67856 6.76143C7.22994 7.23441 7.97409 7.95964 7.97409 9.17047C7.97409 10.7723 6.69389 12.0903 4.46143 12.0903C2.86612 12.0903 1.40005 11.1131 1.03791 9.98075ZM11.8491 8.77985C10.661 8.39543 10.1649 7.86114 10.1649 6.98805C10.1649 5.86736 11.1636 5.04639 12.6128 5.04639C13.8546 5.04639 14.6629 5.63345 14.9778 6.6346C15.0443 6.84599 14.9593 6.98006 14.7475 7.0491C14.5394 7.11697 14.3176 7.09974 14.238 6.89611C13.9356 6.12273 13.352 5.76311 12.5998 5.76311C11.6467 5.76311 11.0135 6.25178 11.0135 6.91638C11.0135 7.45066 11.3464 7.75038 12.2473 8.04358L12.8348 8.23254C14.062 8.62999 14.5516 9.13821 14.5516 10.0178C14.5516 11.1972 13.481 12.0442 11.9927 12.0442C10.6439 12.0442 9.65644 11.2809 9.41979 10.3361C9.36535 10.1188 9.41192 10.0287 9.70039 9.96184C9.98886 9.89499 10.0714 9.89918 10.1715 10.1369C10.4555 10.8114 11.1531 11.3275 12.0318 11.3275C12.9914 11.3275 13.6834 10.7802 13.6834 10.0634C13.6834 9.53567 13.3961 9.28807 12.4366 8.97532L11.8491 8.77985Z"
  //             fill="currentColor"
  //             fillRule="evenodd"
  //             clipRule="evenodd"
  //           />
  //         </svg>
  //       </BasicButton>
  //     </Flex>
  //   </Paper>
  // );
};
