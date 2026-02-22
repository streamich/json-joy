import * as React from 'react';
import boardTheme from './theme';
import type {IBoardLayout} from './types';
import {PIECES, squareWidth, borderWidth, borderColor, borderOpacity} from './constants';

const h = React.createElement;

function mapColor(color: string): string {
  color = color || 'green';
  switch (color) {
    case 'green':
      color = '#52aa05';
      break;
    case 'red':
      color = '#c6140d';
      break;
  }

  return color;
}

let globalMarkerId = 0;

export interface BoardProps extends IBoardLayout {
  size?: undefined | -3 | -2 | -1 | 0 | 1 | 2 | 3;
  noRuler?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onRightClick?: (e: React.MouseEvent) => void;
}

export type IBoardState = {};

export class Board extends React.Component<BoardProps, IBoardState> {
  static lineCnt = 0;

  shouldComponentUpdate(nextProps: any) {
    return JSON.stringify(nextProps) !== JSON.stringify(this.props);
  }

  renderCheckers() {
    const checkers: React.ReactElement<any>[] = [];
    for (let i = 0; i < 8; i++) {
      for (let j = (i + 1) % 2; j < 8; j += 2) {
        // Draw black squares.
        checkers.push(
          <rect
            key={`checker-${i},${j}`}
            x={squareWidth * j}
            y={squareWidth * i}
            height={squareWidth}
            width={squareWidth}
            style={{fill: boardTheme.black}}
          />,
        );
      }
    }
    return checkers;
  }

  renderRuler() {
    const {noRuler} = this.props;
    const ruler: React.ReactElement<any>[] = [];
    if (noRuler) return ruler;

    const rulerStyle: React.CSSProperties = {
      fontFamily: 'Open Sans,sans',
      fontWeight: 'bold',
      textAlign: 'center',
      lineHeight: squareWidth * 0.25,
      fontSize: squareWidth * 0.21,
    };
    for (let i = 0; i < 8; i++) {
      ruler.push(
        <text
          x="1.2"
          y={squareWidth * i + 3.7}
          style={{fill: i % 2 ? '#fff' : '#000', opacity: i % 2 ? 0.5 : 0.4, ...rulerStyle}}
          key={'ruler-x' + i}
        >
          {8 - i}
        </text>,
      );
      ruler.push(
        <text
          y="98.5"
          x={squareWidth * i + 9.5}
          style={{fill: i % 2 ? '#000' : '#fff', opacity: i % 2 ? 0.4 : 0.5, ...rulerStyle}}
          key={'ruler-y' + i}
        >
          {(i + 10).toString(18)}
        </text>,
      );
    }
    return ruler;
  }

  renderLines() {
    const {props} = this;
    const markers: React.ReactElement<any>[] = [];
    const lines: React.ReactElement<any>[] = [];

    if (props.lines && props.lines.length) {
      for (let i = 0; i < props.lines.length; i++) {
        const line = props.lines[i];
        const {from, to, tipFrom, tipTo, body} = line;
        const color = mapColor(line.color || 'green');
        const opacity = line.opacity || 0.8;
        const strokeWidth = body ? (body[0] === '=' ? 8 : 3) / body.length : 3;
        let tipToId: string | undefined;
        let tipFromId: string | undefined;

        if (tipTo) {
          tipToId = 'board-marker-' + globalMarkerId++;

          if (tipTo === 'o' || tipTo === 'O') {
            markers.push(
              <marker
                key={'line-' + i}
                id={tipToId}
                markerWidth="10"
                markerHeight="10"
                refX="3"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
                viewBox="0 0 25 25"
              >
                <circle cx="3" cy="3" r={tipTo === 'o' ? 2 : 3} fill={color} />
              </marker>,
            );
          } else {
            const size = 25 - tipTo.length * 2;

            markers.push(
              <marker
                key={'line-' + i}
                id={tipToId}
                markerWidth="10"
                markerHeight="10"
                refX="2.7"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
                viewBox={`0 0 ${size} ${size}`}
              >
                <path d="M0,0 L0,6 L4.5,3 z" fill={color} />
              </marker>,
            );
          }
        }

        if (tipFrom) {
          tipFromId = 'board-marker-' + globalMarkerId++;

          if (tipFrom === 'o' || tipFrom === 'O') {
            markers.push(
              <marker
                key={'line-' + i}
                id={tipFromId}
                markerWidth="10"
                markerHeight="10"
                refX="3"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
                viewBox="0 0 25 25"
              >
                <circle cx="3" cy="3" r={tipFrom === 'o' ? 2 : 3} fill={color} />
              </marker>,
            );
          } else {
            const size = 25 - tipFrom.length * 2;

            markers.push(
              <marker
                key={'line-' + i}
                id={tipFromId}
                markerWidth="10"
                markerHeight="10"
                refX="2.7"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
                viewBox={`0 0 ${size} ${size}`}
              >
                <path d="M4.5,0 L4.5,6 L0,3 z" fill={color} />
              </marker>,
            );
          }
        }

        const lineProps = {
          key: `line-${i}`,
          x1: (0.5 + from[0]) * squareWidth,
          y1: (7.5 - from[1]) * squareWidth,
          x2: (0.5 + to[0]) * squareWidth,
          y2: (7.5 - to[1]) * squareWidth,
          markerStart: tipFromId ? `url(#${tipFromId})` : undefined,
          markerEnd: tipToId ? `url(#${tipToId})` : undefined,
          stroke: color,
          strokeWidth: strokeWidth,
          style: {opacity},
        };

        lines.push(h('line', lineProps));
      }
    }

    return [markers, lines];
  }

  renderFigures() {
    const figures: React.ReactElement<any>[] = [];
    const {props} = this;
    if (props.squares instanceof Array) {
      for (let i = 0; i < props.squares.length; i++) {
        const square = props.squares[i];
        if (square.piece) {
          figures.push(
            <image
              key={'figure-' + i}
              x={squareWidth * square.xy[0]}
              y={squareWidth * (7 - square.xy[1])}
              width={squareWidth}
              height={squareWidth}
              xlinkHref={PIECES[square.piece]}
              style={{opacity: square.pieceOpacity || 1}}
            />,
          );
        }
      }
    }
    return figures;
  }

  renderHighlights() {
    const {props} = this;
    const highlights: React.ReactElement<any>[] = [];
    if (props.squares instanceof Array) {
      for (let i = 0; i < props.squares.length; i++) {
        const square = props.squares[i];

        if (
          square.color ||
          (!square.piece && !square.borderTop && !square.borderRight && !square.borderBottom && !square.borderLeft)
        ) {
          highlights.push(
            <rect
              key={'highlight-' + i}
              x={square.xy[0] * squareWidth}
              y={(7 - square.xy[1]) * squareWidth}
              height={squareWidth}
              width={squareWidth}
              style={{fill: mapColor(square.color ?? ''), opacity: square.opacity || 0.35}}
            />,
          );
        }
        if (square.borderTop) {
          highlights.push(
            <rect
              key={'highlight-' + i}
              x={square.xy[0] * squareWidth}
              y={(7 - square.xy[1]) * squareWidth}
              height={squareWidth * borderWidth}
              width={squareWidth}
              style={{fill: borderColor, opacity: borderOpacity}}
            />,
          );
        }
        if (square.borderRight) {
          highlights.push(
            <rect
              key={'highlight-' + i}
              x={(square.xy[0] + 1 - borderWidth) * squareWidth}
              y={(7 - square.xy[1]) * squareWidth}
              height={squareWidth}
              width={squareWidth * borderWidth}
              style={{fill: borderColor, opacity: borderOpacity}}
            />,
          );
        }
        if (square.borderBottom) {
          highlights.push(
            <rect
              key={'highlight-' + i}
              x={square.xy[0] * squareWidth}
              y={(8 - square.xy[1] - borderWidth) * squareWidth}
              height={squareWidth * borderWidth}
              width={squareWidth}
              style={{fill: borderColor, opacity: borderOpacity}}
            />,
          );
        }
        if (square.borderLeft) {
          highlights.push(
            <rect
              key={'highlight-' + i}
              x={square.xy[0] * squareWidth}
              y={(7 - square.xy[1]) * squareWidth}
              height={squareWidth}
              width={squareWidth * borderWidth}
              style={{fill: borderColor, opacity: borderOpacity}}
            />,
          );
        }
      }
    }
    return highlights;
  }

  renderBorders() {
    const {props} = this;
    const borders: React.ReactElement<any>[] = [];

    if (props.borders instanceof Array) {
      for (let i = 0; i < props.borders.length; i++) {
        const border = props.borders[i];
        let stepLength = squareWidth;

        if (border.segmentSize) stepLength *= border.segmentSize;

        let offsetX = 0;
        let offsetY = 0;

        if (border.offset) {
          offsetX = border.offset[0];
          offsetY = border.offset[1];
        }

        let d = `M${(border.xy[0] + offsetX) * squareWidth} ${(7 - border.xy[1] + offsetY) * squareWidth} l`;

        for (let j = 0; j < border.segments.length; j++) {
          switch (border.segments[j]) {
            case 'd':
              d += stepLength + ' 0 ';
              break;
            case 's':
              d += '0 ' + stepLength + ' ';
              break;
            case 'a':
              d += -stepLength + ' 0 ';
              break;
            case 'w':
              d += '0 ' + -stepLength + ' ';
              break;
          }
        }

        const strokeWidth = 1.8 * (border.width || 1);
        const strokeColor = mapColor(border.color || 'orange');
        const strokeOpacity = border.opacity || 0.75;
        const fillColor = border.fillColor || 'none';
        const fillOpacity = border.fillOpacity || 0.4;

        borders.push(
          <path
            key={'border-' + i}
            d={d}
            strokeLinejoin="round"
            style={{
              strokeWidth,
              stroke: strokeColor,
              strokeOpacity,
              fill: fillColor,
              fillOpacity,
            }}
          />,
        );
      }
    }

    return borders;
  }

  render() {
    const [markers, lines] = this.renderLines();
    return (
      <svg viewBox="0 0 100 100">
        <defs>{markers}</defs>
        <rect x="0" y="0" height="100" width="100" style={{fill: boardTheme.white}} />
        {this.renderCheckers()}
        {this.renderHighlights()}
        {this.renderBorders()}
        {this.renderFigures()}
        {this.renderRuler()}
        {lines}
      </svg>
    );
  }
}

export default Board;
