import {ProxyNodeArray, ProxyNodeBinary, ProxyNodeConst, ProxyNodeObject, ProxyNodeString, ProxyNodeValue, ProxyNodeVector, ViewOfProxyNode} from "../types";


test('ViewOfProxyNode<T> cna infer type from proxy nodes', () => {
  type N1 = ProxyNodeConst<123>;
  type N2 = ProxyNodeString;
  type N3 = ProxyNodeBinary;
  type N4 = ProxyNodeValue<N1>;
  type N5 = ProxyNodeVector<[N1, N2, N3, N4]>;
  type N6 = ProxyNodeObject<{
    n1: N1;
    n2: N2;
    n3: N3;
    n4: N4;
    n5: N5;
  }>;
  type N7 = ProxyNodeArray<[N1, ProxyNodeValue<ProxyNodeConst<true>>, N2, N3, N4, N5, N6]>;
  type TheView = ViewOfProxyNode<N7>;
  const view: TheView = [
    123,
    true,
    'asdf',
    Uint8Array.from([1, 2, 3]),
    123,
    [123, 'asdf', Uint8Array.from([1, 2, 3]), 123],
    {
      n1: 123,
      n2: 'asdf',
      n3: Uint8Array.from([1, 2, 3]),
      n4: 123,
      n5: [123, 'asdf', Uint8Array.from([1, 2, 3]), 123],
    },
  ];
});
