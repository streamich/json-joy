// import * as React from 'react';
// import {rule} from 'nano-theme';
// import {useT} from 'use-t';
// import useWindowSize from 'react-use/lib/useWindowSize';

// const breakpoint = 1100;

// const products = sitemap.children.find(p => p.slug === 'products');

// const blockClass = rule({
//   pad: '72px 0 0',
//   marb: '75vh'
// });

// const paddingClass = rule({
//   d: 'flex',
//   flexWrap: 'wrap',
//   justifyContent: 'space-between',
//   w: '100%',
//   maxW: SITE_WIDTH + 'px',
//   bxz: 'border-box',
//   mar: '0 auto',
//   pad: '0 0 36px 0',
// });

// const sectionClass = rule({
//   pad: '36px 0 0',
//   w: '190px',
// });

// const sectionHeadingClass = rule({
//   ...theme.font.ui2Bold,
//   fz: '10px',
//   col: theme.g(0.5),
//   textTransform: 'uppercase',
// });

// const sectionListClass = rule({
//   listStyle: 'none',
//   pad: '14px 0 0',
//   mar: 0,
//   li: {
//     ...theme.font.ui2.mid,
//     fw: 500,
//     d: 'flex',
//     fz: '14px',
//     h: '36px',
//     alignItems: 'center',
//     p: {
//       pad: 0,
//       mar: 0,
//       a: {
//         pad: '3px 0',
//         col: theme.g(0.3),
//         bdb: `1px solid transparent`,
//         '&:hover': {
//           col: theme.g(0.1),
//           bdb: `1px solid ${theme.g(0.7)}`,
//         },
//       },
//     },
//     [`@media (max-width: ${breakpoint}px)`]: {
//       h: '24px',
//     },
//   },
// });

// const bottomClass = rule({
//   ...theme.font.ui,
//   fz: '14px',
//   col: theme.g(0.5),
//   d: 'flex',
//   flexWrap: 'wrap',
//   justifyContent: 'space-between',
//   pad: '12px 0',
//   a: {
//     d: 'inline-block',
//     whiteSpace: 'nowrap',
//     pad: '3px 0',
//     mar: '12px 32px 12px 0',
//     col: theme.g(0.5),
//     bdb: `1px solid transparent`,
//     '&:hover': {
//       col: theme.g(0.3),
//       bdb: `1px solid ${theme.g(0.75)}`,
//     },
//   },
// });

// export interface FooterSectionItemProps {
//   children: React.ReactNode;
// }

// export const FooterSectionItem: React.FC<FooterSectionItemProps> = ({children}) => {

//   return (
//     <li key={to}>
//       <p>
//         <Link a to={to}>
//           {name}
//         </Link>
//       </p>
//     </li>
//   );
// };
