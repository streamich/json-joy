import {parse, parseExtended} from '../parser';

describe('parse()', () => {
  test('parses starting position', () => {
    const result = parse('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    expect(result).toEqual([
      [0, 0, 'br'],
      [0, 1, 'bn'],
      [0, 2, 'bb'],
      [0, 3, 'bq'],
      [0, 4, 'bk'],
      [0, 5, 'bb'],
      [0, 6, 'bn'],
      [0, 7, 'br'],
      [1, 0, 'bp'],
      [1, 1, 'bp'],
      [1, 2, 'bp'],
      [1, 3, 'bp'],
      [1, 4, 'bp'],
      [1, 5, 'bp'],
      [1, 6, 'bp'],
      [1, 7, 'bp'],
      [6, 0, 'wp'],
      [6, 1, 'wp'],
      [6, 2, 'wp'],
      [6, 3, 'wp'],
      [6, 4, 'wp'],
      [6, 5, 'wp'],
      [6, 6, 'wp'],
      [6, 7, 'wp'],
      [7, 0, 'wr'],
      [7, 1, 'wn'],
      [7, 2, 'wb'],
      [7, 3, 'wq'],
      [7, 4, 'wk'],
      [7, 5, 'wb'],
      [7, 6, 'wn'],
      [7, 7, 'wr'],
    ]);
  });
});

describe('parseExtended()', () => {
  test('parses starting position', () => {
    const result = parseExtended('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    expect(result).toMatchSnapshot();
  });

  test('parses lines', () => {
    const result = parseExtended('a1-->>a2\ne4 <-> g7');
    expect(result.lines).toHaveLength(2);
    expect(result.lines![0]).toEqual({
      from: [0, 0],
      tipFrom: '',
      body: '--',
      tipTo: '>>',
      to: [0, 1],
    });
    expect(result.lines![1]).toEqual({
      from: [4, 3],
      tipFrom: '<',
      body: '-',
      tipTo: '>',
      to: [6, 6],
    });
  });

  test('can add background color to existing piece square', () => {
    const result = parseExtended('K\na1:red');
    expect(result.squares![0]).toEqual({
      xy: [0, 7],
      color: 'red',
      piece: 'K',
    });
  });

  test('can add color to a square', () => {
    const result = parseExtended('b2:red');
    expect(result.squares![0]).toEqual({
      xy: [1, 6],
      color: 'red',
    });
  });
});
