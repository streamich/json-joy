import {tick} from '../../../../json-crdt-patch/clock';
import {Model} from '../../../../json-crdt/model';
import {Peritext} from '../../Peritext';
import type {Point} from '../../rga/Point';
import {Anchor} from '../../rga/constants';
import {setupNumbersWithTombstonesKit} from '../../__tests__/setup';
import type {Chunk} from '../../../../json-crdt/nodes/rga';

const setup = () => {
  const model = Model.create();
  const api = model.api;
  api.set({
    text: '',
    slices: [],
  });
  api.str(['text']).ins(0, 'wworld');
  api.str(['text']).ins(0, 'helo ');
  api.str(['text']).ins(2, 'l');
  api.str(['text']).del(7, 1);
  const peritext = new Peritext(model, api.str(['text']).node, api.arr(['slices']).node);
  const {overlay} = peritext;
  return {model, peritext, overlay};
};

describe('.chunkSlices0()', () => {
  test('can iterate through all chunk chunks', () => {
    const {peritext, overlay} = setup();
    const chunk1 = peritext.str.first();
    const chunk2 = peritext.str.last();
    let str = '';
    const point1 = peritext.point(chunk1!.id, Anchor.Before);
    const point2 = peritext.point(tick(chunk2!.id, chunk2!.span - 1), Anchor.After);
    overlay.chunkSlices0(undefined, point1, point2, (chunk, off, len) => {
      str += (chunk.data as string).slice(off, off + len);
    });
    expect(str).toBe('hello world');
  });

  test('can skip first character using "After" anchor attachment', () => {
    const {peritext, overlay} = setup();
    const chunk1 = peritext.str.first();
    const chunk2 = peritext.str.last();
    let str = '';
    const point1 = peritext.point(chunk1!.id, Anchor.After);
    const point2 = peritext.point(tick(chunk2!.id, chunk2!.span - 1), Anchor.After);
    overlay.chunkSlices0(undefined, point1, point2, (chunk, off, len) => {
      str += (chunk.data as string).slice(off, off + len);
    });
    expect(str).toBe('ello world');
  });

  test('can skip last character using "Before" anchor attachment', () => {
    const {peritext, overlay} = setup();
    const chunk1 = peritext.str.first();
    const chunk2 = peritext.str.last();
    let str = '';
    const point1 = peritext.point(chunk1!.id, Anchor.After);
    const point2 = peritext.point(tick(chunk2!.id, chunk2!.span - 1), Anchor.Before);
    overlay.chunkSlices0(undefined, point1, point2, (chunk, off, len) => {
      str += (chunk.data as string).slice(off, off + len);
    });
    expect(str).toBe('ello worl');
  });

  test('can skip first chunk, by anchoring to the end of it', () => {
    const {peritext, overlay} = setup();
    const chunk1 = peritext.str.first();
    const chunk2 = peritext.str.last();
    let str = '';
    const endOfFirstChunk = peritext.point(tick(chunk1!.id, chunk1!.span - 1), Anchor.After);
    const point2 = peritext.point(tick(chunk2!.id, chunk2!.span - 1), Anchor.After);
    overlay.chunkSlices0(undefined, endOfFirstChunk, point2, (chunk, off, len) => {
      str += (chunk.data as string).slice(off, off + len);
    });
    expect(str).toBe(peritext.strApi().view().slice(chunk1!.span));
  });

  test('can skip first chunk, by anchoring to the beginning of second chunk', () => {
    const {peritext, overlay} = setup();
    const firstChunk = peritext.str.first()!;
    const secondChunk = peritext.str.next(firstChunk)!;
    const lastChunk = peritext.str.last()!;
    let str = '';
    const startOfChunkTwo = peritext.point(secondChunk.id, Anchor.Before);
    const point2 = peritext.point(tick(lastChunk!.id, lastChunk!.span - 1), Anchor.After);
    overlay.chunkSlices0(undefined, startOfChunkTwo, point2, (chunk, off, len) => {
      str += (chunk.data as string).slice(off, off + len);
    });
    expect(str).toBe(peritext.strApi().view().slice(firstChunk.span));
  });

  test('can skip one character of the second chunk', () => {
    const {peritext, overlay} = setup();
    const firstChunk = peritext.str.first()!;
    const secondChunk = peritext.str.next(firstChunk)!;
    const lastChunk = peritext.str.last()!;
    let str = '';
    const startOfChunkTwo = peritext.point(secondChunk.id, Anchor.After);
    const point2 = peritext.point(tick(lastChunk!.id, lastChunk!.span - 1), Anchor.After);
    overlay.chunkSlices0(undefined, startOfChunkTwo, point2, (chunk, off, len) => {
      str += (chunk.data as string).slice(off, off + len);
    });
    expect(str).toBe(
      peritext
        .strApi()
        .view()
        .slice(firstChunk.span + 1),
    );
  });

  const testAllPossibleChunkPointCombinations = (peritext: Peritext) => {
    test('can generate slices for all possible chunk point combinations', () => {
      const overlay = peritext.overlay;
      let chunk1 = peritext.str.first();
      const getText = (p1: Point, p2: Point) => {
        let str = '';
        overlay.chunkSlices0(undefined, p1, p2, (chunk, off, len) => {
          str += (chunk.data as string).slice(off, off + len);
        });
        return str;
      };
      while (chunk1) {
        if (chunk1.del) {
          chunk1 = peritext.str.next(chunk1);
          continue;
        }
        let chunk2: Chunk<string> | undefined = chunk1;
        while (chunk2) {
          if (chunk2.del) {
            chunk2 = peritext.str.next(chunk2);
            continue;
          }
          if (chunk1 === chunk2) {
            for (let i = 0; i < chunk1.span; i++) {
              for (let j = i; j < chunk1.span; j++) {
                let point1 = peritext.point(tick(chunk1.id, i), Anchor.Before);
                let point2 = peritext.point(tick(chunk1.id, j), Anchor.After);
                let str1 = getText(point1, point2);
                let str2 = (chunk1.data as string).slice(i, j + 1);
                expect(str1).toBe(str2);
                point1 = peritext.point(tick(chunk1.id, i), Anchor.Before);
                point2 = peritext.point(tick(chunk1.id, j), Anchor.Before);
                str1 = getText(point1, point2);
                str2 = (chunk1.data as string).slice(i, j);
                expect(str1).toBe(str2);
                point1 = peritext.point(tick(chunk1.id, i), Anchor.After);
                point2 = peritext.point(tick(chunk1.id, j), Anchor.After);
                str1 = getText(point1, point2);
                str2 = (chunk1.data as string).slice(i + 1, j + 1);
                expect(str1).toBe(str2);
                point1 = peritext.point(tick(chunk1.id, i), Anchor.After);
                point2 = peritext.point(tick(chunk1.id, j), Anchor.Before);
                str1 = getText(point1, point2);
                str2 = i >= j ? '' : (chunk1.data as string).slice(i + 1, j);
                expect(str1).toBe(str2);
              }
            }
          } else {
            for (let i = 0; i < chunk1.span; i++) {
              for (let j = 0; j < chunk2.span; j++) {
                let point1 = peritext.point(tick(chunk1.id, i), Anchor.Before);
                let point2 = peritext.point(tick(chunk2.id, j), Anchor.After);
                let str1 = getText(point1, point2);
                let str2 = chunk1.data!.slice(i);
                let chunk3 = peritext.str.next(chunk1);
                while (chunk3 && chunk3 !== chunk2) {
                  if (!chunk3.del) {
                    str2 += chunk3.data!;
                  }
                  chunk3 = peritext.str.next(chunk3);
                }
                str2 += chunk2.data!.slice(0, j + 1);
                expect(str1).toBe(str2);
                point1 = peritext.point(tick(chunk1.id, i), Anchor.Before);
                point2 = peritext.point(tick(chunk2.id, j), Anchor.Before);
                str1 = getText(point1, point2);
                str2 = chunk1.data!.slice(i);
                chunk3 = peritext.str.next(chunk1);
                while (chunk3 && chunk3 !== chunk2) {
                  if (!chunk3.del) {
                    str2 += chunk3.data!;
                  }
                  chunk3 = peritext.str.next(chunk3);
                }
                str2 += chunk2.data!.slice(0, j);
                expect(str1).toBe(str2);
                point1 = peritext.point(tick(chunk1.id, i), Anchor.After);
                point2 = peritext.point(tick(chunk2.id, j), Anchor.Before);
                str1 = getText(point1, point2);
                str2 = chunk1.data!.slice(i + 1);
                chunk3 = peritext.str.next(chunk1);
                while (chunk3 && chunk3 !== chunk2) {
                  if (!chunk3.del) {
                    str2 += chunk3.data!;
                  }
                  chunk3 = peritext.str.next(chunk3);
                }
                str2 += chunk2.data!.slice(0, j);
                expect(str1).toBe(str2);
                point1 = peritext.point(tick(chunk1.id, i), Anchor.After);
                point2 = peritext.point(tick(chunk2.id, j), Anchor.After);
                str1 = getText(point1, point2);
                str2 = chunk1.data!.slice(i + 1);
                chunk3 = peritext.str.next(chunk1);
                while (chunk3 && chunk3 !== chunk2) {
                  if (!chunk3.del) {
                    str2 += chunk3.data!;
                  }
                  chunk3 = peritext.str.next(chunk3);
                }
                str2 += chunk2.data!.slice(0, j + 1);
                expect(str1).toBe(str2);
              }
            }
          }
          chunk2 = peritext.str.next(chunk2);
        }
        chunk1 = peritext.str.next(chunk1);
      }
    });
  };

  describe('with hello world text', () => {
    const {peritext} = setup();
    testAllPossibleChunkPointCombinations(peritext);
  });

  describe('with "integer list" text', () => {
    const {peritext} = setupNumbersWithTombstonesKit();
    testAllPossibleChunkPointCombinations(peritext);
  });
});
