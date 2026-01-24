// import * as React from 'react';
// import {storiesOf} from '@storybook/react';
// import Board from '..';

// storiesOf('Markdown|Components/Chess/Board', module)
//   .add('Blank', () => <Board />)
//   .add('[noRuler]', () => <Board noRuler />)
//   .add('Blank, 300px', () => (
//     <div style={{width: 300}}>
//       <Board />
//     </div>
//   ))
//   .add('With line', () => (
//     <div style={{width: 300}}>
//       <Board
//         lines={[
//           {
//             from: [3, 4],
//             to: [4, 3],
//             body: '-',
//             tipTo: '>',
//           },
//         ]}
//       />
//     </div>
//   ))
//   .add('All lines', () => (
//     <div style={{width: 500}}>
//       <Board
//         lines={[
//           {
//             from: [0, 0],
//             to: [0, 1],
//             body: '-',
//             tipTo: '>',
//           },
//           {
//             from: [1, 0],
//             to: [1, 1],
//             body: '-',
//             tipTo: '>',
//             tipFrom: '>',
//             color: 'red',
//           },
//           {
//             from: [2, 0],
//             to: [2, 1],
//             body: '--',
//             tipTo: '>',
//             tipFrom: '>',
//             color: '#000',
//           },
//           {
//             from: [3, 0],
//             to: [3, 1],
//             body: '----',
//             tipTo: '>',
//             tipFrom: '>',
//           },
//           {
//             from: [4, 0],
//             to: [4, 1],
//             body: '-----',
//             tipTo: '>',
//             tipFrom: '>',
//           },
//           {
//             from: [5, 0],
//             to: [5, 1],
//             body: '------',
//             tipTo: '>',
//             tipFrom: '>',
//           },
//           {
//             from: [6, 0],
//             to: [6, 1],
//             body: '=',
//             tipTo: '>',
//             tipFrom: '>',
//           },
//           {
//             from: [7, 0],
//             to: [7, 1],
//             body: '==',
//             tipTo: '>',
//             tipFrom: '>',
//           },
//           {
//             from: [0, 2],
//             to: [0, 3],
//             body: '===',
//             tipTo: '>',
//             tipFrom: '>',
//           },
//           {
//             from: [1, 2],
//             to: [1, 3],
//             body: '====',
//             tipTo: '>',
//             tipFrom: '>',
//           },
//           {
//             from: [2, 2],
//             to: [2, 3],
//             body: '=====',
//             tipTo: '>',
//             tipFrom: '>',
//           },
//           {
//             from: [3, 2],
//             to: [3, 3],
//             body: '=====',
//             tipTo: 'o',
//             tipFrom: 'o',
//           },
//           {
//             from: [4, 2],
//             to: [4, 3],
//             body: '=====',
//             tipTo: 'O',
//             tipFrom: 'O',
//           },
//           {
//             from: [5, 2],
//             to: [5, 3],
//             body: '=====',
//             tipTo: 'O',
//             tipFrom: 'O',
//             opacity: 1,
//           },
//           {
//             from: [6, 2],
//             to: [6, 3],
//             body: '=====',
//             tipTo: 'O',
//             tipFrom: 'O',
//             opacity: 0.1,
//           },
//           {
//             from: [2, 5],
//             to: [0, 7],
//             body: '===',
//             tipTo: '>',
//             color: 'yellow',
//           },
//         ]}
//       />
//     </div>
//   ))
//   .add('Pieces', () => (
//     <div style={{width: 300}}>
//       <Board
//         squares={[
//           {
//             xy: [0, 0],
//             piece: 'r',
//           },
//         ]}
//       />
//     </div>
//   ))
//   .add('Starting position', () => (
//     <div style={{width: 300}}>
//       <Board
//         squares={[
//           {xy: [0, 0], piece: 'R'},
//           {xy: [1, 0], piece: 'N'},
//           {xy: [2, 0], piece: 'B'},
//           {xy: [3, 0], piece: 'Q'},
//           {xy: [4, 0], piece: 'K'},
//           {xy: [5, 0], piece: 'B'},
//           {xy: [6, 0], piece: 'N'},
//           {xy: [7, 0], piece: 'R'},
//           {xy: [0, 1], piece: 'P'},
//           {xy: [1, 1], piece: 'P'},
//           {xy: [2, 1], piece: 'P'},
//           {xy: [3, 1], piece: 'P'},
//           {xy: [4, 1], piece: 'P'},
//           {xy: [5, 1], piece: 'P'},
//           {xy: [6, 1], piece: 'P'},
//           {xy: [7, 1], piece: 'P'},

//           {xy: [0, 7], piece: 'r'},
//           {xy: [1, 7], piece: 'n'},
//           {xy: [2, 7], piece: 'b'},
//           {xy: [3, 7], piece: 'q'},
//           {xy: [4, 7], piece: 'k'},
//           {xy: [5, 7], piece: 'b'},
//           {xy: [6, 7], piece: 'n'},
//           {xy: [7, 7], piece: 'r'},
//           {xy: [0, 6], piece: 'p'},
//           {xy: [1, 6], piece: 'p'},
//           {xy: [2, 6], piece: 'p'},
//           {xy: [3, 6], piece: 'p'},
//           {xy: [4, 6], piece: 'p'},
//           {xy: [5, 6], piece: 'p'},
//           {xy: [6, 6], piece: 'p'},
//           {xy: [7, 6], piece: 'p'},
//         ]}
//       />
//     </div>
//   ))
//   .add('Square border', () => (
//     <div style={{width: 300}}>
//       <Board
//         squares={[
//           {
//             xy: [4, 4],
//             borderLeft: true,
//             borderRight: true,
//             borderTop: true,
//             borderBottom: true,
//           },
//         ]}
//       />
//     </div>
//   ))
//   .add('Borders', () => (
//     <div style={{width: 300}}>
//       <Board
//         borders={[
//           {
//             xy: [4, 4],
//             segments: 'ddsawwas',
//           },
//         ]}
//       />
//     </div>
//   ));
