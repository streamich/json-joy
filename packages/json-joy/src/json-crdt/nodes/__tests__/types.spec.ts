import type {ConNode, ValNode, VecNode, ArrNode, BinNode, ObjNode, StrNode} from '..';
import type {JsonNodeView} from '../types';

test('can infer view type of CRDT nodes', () => {
  type N1 = ConNode<number>;
  type N2 = ConNode<boolean>;
  type N3 = ConNode<string>;
  type N4 = ConNode<{foo: 'bar'}>;
  type N5 = ValNode<N1>;
  type N6 = ValNode<N4>;
  type N7 = ValNode<N6>;
  type N8 = StrNode;
  type N9 = BinNode;
  type N10 = ArrNode<N5>;
  type N11 = ArrNode<N5 | N2>;
  type N13 = VecNode<[N1, N2, N8, N11]>;
  type N14 = ObjNode<{
    n1: N1;
    n2: N2;
    n3: N3;
    n4: N4;
    n5: N5;
    n6: N6;
    n7: N7;
    n8: N8;
    n9: N9;
    n10: N10;
    n11: N11;
    n13: N13;
  }>;
  type View = JsonNodeView<N14>;
  const _a: View = {
    n1: 123,
    n2: true,
    n3: 'foo',
    n4: {foo: 'bar'},
    n5: 123,
    n6: {foo: 'bar'},
    n7: {foo: 'bar'},
    n8: 'foo',
    n9: Uint8Array.from([1, 2, 3]),
    n10: [123, 123],
    n11: [123, true, 123],
    n13: [123, true, 'foo', [123, true, true]],
  };
});
