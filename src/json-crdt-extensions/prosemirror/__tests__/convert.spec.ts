import {NodeToViewRange} from '../convert';
import {node1} from "./fixtures";

describe('toViewRange()', () => {
  test('can convert a two-block document', () => {
    const viewRange = NodeToViewRange.convert(node1);
    console.log(JSON.stringify(viewRange, null, 2));
    // expect(viewRange).toEqual([
    //   'this is the footer for your site\nasdfaasdf asdf',
    //   0,
    //   [
    //     [0, 0, 0, 'heading', {level: 1}],
    //     [1, 0, 0, 'paragraph']
    //   ]
    // ]);
  });
});
