import * as line from '../line';
import {assertDiff} from './line';

describe('diff', () => {
  test('delete all lines', () => {
    const src = [
      '{"id": "xxx-xxxxxxx", "name": "Hello, world"}',
      '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}',
      '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}',
      '{"id": "abc", "name": "Merry Jane"}',
    ];
    const dst: string[] = [];
    const patch = line.diff(src, dst);
    expect(patch).toEqual([
      [-1, 0, -1],
      [-1, 1, -1],
      [-1, 2, -1],
      [-1, 3, -1],
    ]);
  });

  test('delete all but first line', () => {
    const src = [
      '{"id": "xxx-xxxxxxx", "name": "Hello, world"}',
      '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}',
      '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}',
      '{"id": "abc", "name": "Merry Jane"}',
    ];
    const dst = ['{"id": "xxx-xxxxxxx", "name": "Hello, world"}'];
    const patch = line.diff(src, dst);
    expect(patch).toEqual([
      [0, 0, 0],
      [-1, 1, 0],
      [-1, 2, 0],
      [-1, 3, 0],
    ]);
  });

  test('delete all but middle lines line', () => {
    const src = [
      '{"id": "xxx-xxxxxxx", "name": "Hello, world"}',
      '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}',
      '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}',
      '{"id": "abc", "name": "Merry Jane"}',
    ];
    const dst = ['{"id": "xxx-yyyyyyy", "name": "Joe Doe"}', '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}'];
    const patch = line.diff(src, dst);
    expect(patch).toEqual([
      [-1, 0, -1],
      [0, 1, 0],
      [0, 2, 1],
      [-1, 3, 1],
    ]);
  });

  test('delete all but the last line', () => {
    const src = [
      '{"id": "xxx-xxxxxxx", "name": "Hello, world"}',
      '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}',
      '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}',
      '{"id": "abc", "name": "Merry Jane"}',
    ];
    const dst = ['{"id": "abc", "name": "Merry Jane"}'];
    const patch = line.diff(src, dst);
    expect(patch).toEqual([
      [-1, 0, -1],
      [-1, 1, -1],
      [-1, 2, -1],
      [0, 3, 0],
    ]);
  });

  test('normalize line beginnings (delete two middle ones)', () => {
    const src = [
      '{"id": "xxx-xxxxxxx", "name": "Hello, world"}',
      '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}',
      '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}',
      '{"id": "abc", "name": "Merry Jane"}',
    ];
    const dst = ['{"id": "xxx-xxxxxxx", "name": "Hello, world"}', '{"id": "abc", "name": "Merry Jane"}'];
    const patch = line.diff(src, dst);
    expect(patch).toEqual([
      [0, 0, 0],
      [-1, 1, 0],
      [-1, 2, 0],
      [0, 3, 1],
    ]);
  });

  test('normalize line endings', () => {
    const src = [
      '{"id": "xxx-xxxxxxx", "name": "hello world!"}',
      '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}',
      '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}',
      '{"id": "abc", "name": "Merry Jane"}',
    ];
    const dst = ['{"id": "xxx-xxxxxxx", "name": "Hello, world"}', '{"id": "abc", "name": "Merry Jane!"}'];
    const patch = line.diff(src, dst);
    expect(patch).toEqual([
      [2, 0, 0],
      [-1, 1, 0],
      [-1, 2, 0],
      [2, 3, 1],
    ]);
  });

  test('move first line to the end', () => {
    const src = [
      '{"id": "xxx-xxxxxxx", "name": "Hello, world"}',
      '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}',
      '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}',
      '{"id": "abc", "name": "Merry Jane"}',
    ];
    const dst = [
      '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}',
      '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}',
      '{"id": "abc", "name": "Merry Jane"}',
      '{"id": "xxx-xxxxxxx", "name": "Hello, world"}',
    ];
    const patch = line.diff(src, dst);
    expect(patch).toEqual([
      [-1, 0, -1],
      [0, 1, 0],
      [0, 2, 1],
      [0, 3, 2],
      [1, 3, 3],
    ]);
  });

  test('move second line to the end', () => {
    const src = [
      '{"id": "xxx-xxxxxxx", "name": "Hello, world"}',
      '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}',
      '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}',
      '{"id": "abc", "name": "Merry Jane"}',
    ];
    const dst = [
      '{"id": "xxx-xxxxxxx", "name": "Hello, world"}',
      '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}',
      '{"id": "abc", "name": "Merry Jane"}',
      '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}',
    ];
    const patch = line.diff(src, dst);
    expect(patch).toEqual([
      [0, 0, 0],
      [-1, 1, 0],
      [0, 2, 1],
      [0, 3, 2],
      [1, 3, 3],
    ]);
  });

  test('swap third and fourth lines', () => {
    const src = [
      '{"id": "xxx-xxxxxxx", "name": "Hello, world"}',
      '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}',
      '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}',
      '{"id": "abc", "name": "Merry Jane"}',
    ];
    const dst = [
      '{"id": "xxx-xxxxxxx", "name": "Hello, world"}',
      '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}',
      '{"id": "abc", "name": "Merry Jane"}',
      '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}',
    ];
    const patch = line.diff(src, dst);
    expect(patch).toEqual([
      [0, 0, 0],
      [0, 1, 1],
      [1, 1, 2],
      [0, 2, 3],
      [-1, 3, 3],
    ]);
  });

  test('move last line to the beginning', () => {
    const src = [
      '{"id": "xxx-xxxxxxx", "name": "Hello, world"}',
      '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}',
      '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}',
      '{"id": "abc", "name": "Merry Jane"}',
    ];
    const dst = [
      '{"id": "abc", "name": "Merry Jane"}',
      '{"id": "xxx-xxxxxxx", "name": "Hello, world"}',
      '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}',
      '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}',
    ];
    const patch = line.diff(src, dst);
    expect(patch).toEqual([
      [1, -1, 0],
      [0, 0, 1],
      [0, 1, 2],
      [0, 2, 3],
      [-1, 3, 3],
    ]);
  });

  test('move second to last line to the beginning', () => {
    const src = [
      '{"id": "xxx-xxxxxxx", "name": "Hello, world"}',
      '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}',
      '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}',
      '{"id": "abc", "name": "Merry Jane"}',
    ];
    const dst = [
      '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}',
      '{"id": "xxx-xxxxxxx", "name": "Hello, world"}',
      '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}',
      '{"id": "abc", "name": "Merry Jane"}',
    ];
    const patch = line.diff(src, dst);
    expect(patch).toEqual([
      [1, -1, 0],
      [0, 0, 1],
      [0, 1, 2],
      [-1, 2, 2],
      [0, 3, 3],
    ]);
  });

  test('swap first and second lines', () => {
    const src = [
      '{"id": "xxx-xxxxxxx", "name": "Hello, world!!!!!!!!!!!!!!!!!!!!!!!!!"}',
      '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}',
      '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}',
      '{"id": "abc", "name": "Merry Jane"}',
    ];
    const dst = [
      '{"id": "xxx-yyyyyyy", "name": "Joe Doe"}',
      '{"id": "xxx-xxxxxxx", "name": "Hello, world!!!!!!!!!!!!!!!!!!!!!!!!!"}',
      '{"id": "lkasdjflkasjdf", "name": "Winston Churchill"}',
      '{"id": "abc", "name": "Merry Jane"}',
    ];
    const patch = line.diff(src, dst);
    expect(patch).toEqual([
      [1, -1, 0],
      [0, 0, 1],
      [-1, 1, 1],
      [0, 2, 2],
      [0, 3, 3],
    ]);
  });

  test('fuze two elements into one', () => {
    const src = [
      '{"asdfasdfasdf": 2398239234, "aaaa": "aaaaaaa"}',
      '{"bbbb": "bbbbbbbbbbbbbbb", "cccc": "ccccccccccccccccc"}',
      '{"this": "is a test", "number": 1234567890}',
    ];
    const dst = ['{"aaaa": "aaaaaaa", "bbbb": "bbbbbbbbbbbbbbb"}', '{"this": "is a test", "number": 1234567890}'];
    const patch = line.diff(src, dst);
    expect(patch).toEqual([
      [-1, 0, -1],
      [2, 1, 0],
      [0, 2, 1],
    ]);
  });

  test('split two elements into one', () => {
    const src = ['{"aaaa": "aaaaaaa", "bbbb": "bbbbbbbbbbbbbbb"}', '{"this": "is a test", "number": 1234567890}'];
    const dst = [
      '{"asdfasdfasdf": 2398239234, "aaaa": "aaaaaaa"}',
      '{"bbbb": "bbbbbbbbbbbbbbb", "cccc": "ccccccccccccccccc"}',
      '{"this": "is a test", "number": 1234567890}',
    ];
    const patch = line.diff(src, dst);
    expect(patch).toEqual([
      [1, -1, 0],
      [2, 0, 1],
      [0, 1, 2],
    ]);
  });

  test('various examples', () => {
    assertDiff(['0', '1', '3', 'x', 'y', '4', '5'], ['1', '2', '3', '4', 'a', 'b', 'c', '5']);
    assertDiff(['a', 'x'], ['b', 'c', 'd']);
    assertDiff([], []);
    assertDiff(['1'], []);
    assertDiff([], ['1']);
    assertDiff(['1'], ['1']);
    assertDiff(['1', '2'], ['1', '2']);
    assertDiff(['1', '2'], ['1', '3', '2']);
    assertDiff(['1', '3', '2'], ['1', '2']);
    assertDiff(['1', '2', '3', '4', '5', '6', '7'], ['0', '1', '2', '5', 'x', 'y', 'z', 'a', 'b', '7', '8']);
    assertDiff([], ['1']);
    assertDiff([], []);
    assertDiff(['1'], ['1']);
    assertDiff(['1', '1'], ['1', '1']);
    assertDiff(['1', '1', '2'], ['1', '1', '2']);
    assertDiff(['1', '1', '2'], ['1', '1']);
    assertDiff(['1', '2', '3'], ['1', '3']);
    assertDiff(['1', '2', '3'], ['2', '3']);
    assertDiff(['b', 'a'], ['7', '3', 'd', '7', '9', '9', '9']);
    assertDiff(['1'], []);
    assertDiff(['1', '{}'], []);
    assertDiff(['1', '2', '3', '4', '5', '6'], ['3']);
    assertDiff(['1', '2', '3'], ['2', '3']);
    assertDiff(['1', '2', '3'], ['1', '3']);
    assertDiff(['1', '2', '3'], ['1', '2']);
    assertDiff(['1', '2', '3', '4'], ['3', '4']);
    assertDiff(['1', '2'], ['1']);
    assertDiff(['1', '2'], ['2']);
    assertDiff(['1', '2', '3', '3', '5', '{a:4}', '5', '"6"'], ['1', '2', '3', '5', '{a:4}', '5', '"6"', '6']);
    assertDiff(['0', '1'], ['xyz']);

    assertDiff(['[]'], ['[1]']);
    assertDiff(['1', '[]'], ['1', '[1]']);
    assertDiff(['1', '2', '3'], ['1', '[2]', '3']);
    assertDiff(['1', '[1,2,3,4]', '3'], ['1', '[1,3,455]', '3']);
    assertDiff(['1', '[1,2,3,4]', '3'], ['1', '[1,3,455]', '[3]']);
    assertDiff(['1', '[1,2,3,4]', '3'], ['1', '[1,2,3,5]', '3']);
    assertDiff(['1', '[1,2,3,4]', '3'], ['1', '[1,4,3,5]', '3']);
    assertDiff(['[2]'], ['1', '2', '3']);
  });

  test('fuzzer - 1', () => {
    const src = [
      '{"KW*V":"Wj6/Y1mgmm6n","uP1`NNND":{")zR8r|^KR":{}},"YYyO7.+>#.6AQ?U":"1%EA(q+S!}*","b\\nyc*o.":487228790.90332836}',
      '{"CO:_":238498277.2025599,"Gu4":{"pv`6^#.%9ka1*":true},"(x@cpBcAWb!_\\"{":963865518.3697702,"/Pda+3}:s(/sG{":"fj`({"}',
      '{".yk_":201,"KV1C":"yq#Af","b+Cö.EOa":["DDDDDDDDDDDDDDDD"],"%":[]}',
    ];
    const dst = [
      '{"Vv.FuN3P}K4*>;":false,".7gC":701259576.4875442,"3r;yV6<;$2i)+Fl":"TS7A1-WLm|U\'Exo","&G/$Ikre-aE`MsL":158207813.24797496,"i|":1927223283245736}',
    ];
    const patch = line.diff(src, dst);
    expect(patch).toEqual([
      [-1, 0, -1],
      [2, 1, 0],
      [-1, 2, 0],
    ]);
  });

  test('fuzzer - 2 (simplified)', () => {
    const src = [
      '{asdfasdfasdf}',
      '{12341234123412341234}',
      '{zzzzzzzzzzzzzzzzzz}',
      '{12341234123412341234}',
      '{00000000000000000000}',
      '{12341234123412341234}',
    ];
    const dst = ['{asdfasdfasdf}', '{zzzzzzzzzzzzzzzzzz}', '{00000000000000000000}'];
    const patch = line.diff(src, dst);
    expect(patch).toEqual([
      [0, 0, 0],
      [-1, 1, 0],
      [0, 2, 1],
      [-1, 3, 1],
      [0, 4, 2],
      [-1, 5, 2],
    ]);
  });

  test('fuzzer - 2', () => {
    const src = [
      '{"qED5<awEr":"_gHl_\\\\+","_`":[],"6X":null,"%48l KyT3M]Eotd":-6409426829312515,"nvxKtO.2Nkq-X":{}}',
      '{"uP)+":"8","DcGl^1iAx}uE":188611474.7459,"03 B-Z":939556741.5467653,"KkMot\\"LI%QOq":[true]}',
      `{"c25}_Q/jJsc":"JE4\\\\{","f} ":"\\"D='qW]Lq#v^","md{*%1y[":81520766.60595253,"e[3OT]-N-!*g90K1":320733106.7235495,"\\"yteVM6&PI":"8fC Og8:+6(A"}`,
      '{"T{Ugtn}B-]Wm`ZK":{"*VJlpfRw":697504436.1312399},"s.BOS9;bv_ZA3oD":{},"|Ir":[879007792.6766524]}',
      '{"K!Lr|=PykM":"Q8W6","{K. i`e{;M{)C=@b":-97,"+[":";\'}HLR4Q2To:Gw>","Zoypj-Ock^\'":714499113.6419818,"j::O\\"ON.^iud#":{}}',
      '{"{\\\\^]wa":[",M/u= |Nu=,2J"],"\\\\D6;;h-,O\\\\-|":181373753.3018791,"[n6[!Z)4":"6H:p-N(uM","sK\\\\8C":[]}',
    ];
    const dst = [
      '{"qED5<awEr":"_gHl_\\\\+","_`":[],"6X":null,"%48l KyT3M]Eotd":-6409426829312515,"nvxKtO.2Nkq-X":{}}',
      `{"c25}_Q/jJsc":"JE4\\\\{","f} ":"\\"D='qW]Lq#v^","md{*%1y[":81520766.60595253,"e[3OT]-N-!*g90K1":320733106.7235495,"\\"yteVM6&PI":"8fC Og8:+6(A"}`,
      '{"K!Lr|=PykM":"Q8W6","{K. i`e{;M{)C=@b":-97,"+[":";\'}HLR4Q2To:Gw>","Zoypj-Ock^\'":714499113.6419818,"j::O\\"ON.^iud#":{}}',
    ];
    const patch = line.diff(src, dst);
    expect(patch).toEqual([
      [0, 0, 0],
      [-1, 1, 0],
      [0, 2, 1],
      [-1, 3, 1],
      [0, 4, 2],
      [-1, 5, 2],
    ]);
  });

  test('fuzzer - 3', () => {
    const src = [
      '{aaaaaaaaaaa}',
      '{bbbbbbbbbbb}',
      '{"75":259538477846144,"dadqM`0I":322795818.54331195,"<":"f*ßlwäm&=_y@w\\n","53aghXOyD%lC2":373122194.60806453,"\\\\9=M!\\"\\\\Tl-":"r.VdPY`mOQ"}',
      '{11111111111111111111}',
    ];
    const dst = [
      '{"\\\\ 3[9}0dz+FaW\\"M":"rX?","P.Ed-s-VgiQDuNk":"18","}56zyy3FnC":["<lmi",-3889491443023091]}',
      '{"75":259538477846144,"dadqM`0I":322795818.54331195,"<":"f*ßlwäm&=_y@w\\n","53aghXOyD%lC2":373122194.60806453,"\\\\9=M!\\"\\\\Tl-":"r.VdPY`mOQ"}',
      '{222222222222222222222}',
    ];
    const patch = line.diff(src, dst).map((x) => [x[0], x[1], x[2]]);
    expect(patch).toEqual([
      [-1, 0, -1],
      [2, 1, 0],
      [0, 2, 1],
      [2, 3, 2],
    ]);
  });

  test('fuzzer - 4', () => {
    const src = [
      '{"fE#vTih,M!q+TTR":-8702114011119315,"`F\\"M9":true,"]9+FC9f{48NnX":{"+\\\\]IQ7":"a;br-^_m"},"s&":"%n18QdrUewc8Nh8<"}',
      '{"<\\"R}d\\"HY65":[53195032.194879085,710289417.4711887],"WH]":"qqqqqqqqqq","W&0fQhOd8":96664625.24402197}',
      '{"!2{:XVc3":[814507837.3286607,"A+m+}=p$Y&T"],"?[Tks9wg,pRLz.G":[[]]}',
      '{"X^бbAq,":247853730.363063,"+ Mkjq_":-7253373307869407,"`J\\"[^)W KVFk":{"I&a?\\\\\\"1q\\\\":{"66666666666666":">}v1I7y48`JJIG5{"}}}',
    ];
    const dst = [
      '{"fE#vTih,M!q+TTR":-8702114011119315,"`F\\"M9":true,"]9+FC9f{48NnX":{"+\\\\]IQ7":"a;br-^_m"},"s&":"%n18QdrUewc8Nh8<"}',
      '{"!2{:XVc3":[814507837.3286607,"A+m+}=p$Y&T"],"?[Tks9wg,pRLz.G":[[]]}',
      `{"}'-":["o=^\\\\tXk@4",false],"*nF(tbVE=L\\"LiA":-17541,"5a,?p8=]TBLT_x^":916988130.3227228}`,
      `{"+.i5D's>W4#EJ%7B":">IYF9h","IeK?Dg{/3>hq7\\\\B[":64967,"KI,cnб!Ty%":2913242861126036,"rv9O@j":false,"dj":"N>"}`,
    ];
    const patch = line.diff(src, dst).map((x) => [x[0], x[1], x[2]]);
    expect(patch).toEqual([
      [0, 0, 0],
      [-1, 1, 0],
      [0, 2, 1],
      [1, 2, 2],
      [2, 3, 3],
    ]);
  });

  test('fuzzer - 5', () => {
    const src = [
      '{"1111":[true,true],"111111111111111":-34785,"YRb#H`%Q`9yQ;":"S@>/8#"}',
      '{"$?":145566270.31451553,"&;\\\\V":729010872.7196132,"B4Xm[[X4":"WLFBc>*popRot]Y",") 8a%d@":811080332.6947087,"LnRab_vKhgz":"%"}',
    ];
    const dst = [
      `{"YC9rf7Kg3fI(":"=aEe5Jw7R)m\\\\0Q","b-)-xPNm3":"1%","MHPcv?h\\"'j\\\\z;$?>":[],"LybE:":"|xWDk9r|s%:O0%(","/y@Uz433>:l[%":true}`,
      '{"1111":[true,true],"111111111111111":-34785,"YRb#H`%Q`9yQ;":"S@>/8#"}',
    ];
    const patch = line.diff(src, dst).map((x) => [x[0], x[1], x[2]]);
    // console.log(patch);
    expect(patch).toEqual([
      [1, -1, 0],
      [2, 0, 1],
      [-1, 1, 1],
    ]);
  });

  test('fuzzer - 6', () => {
    const src = ['-19', 'm3uzl6', 'j8b0po', '[m3uz5c;]'];
    const dst = ['[1e;3;{o47l5:3f,};]', '[-q;1;]', 'o', '[-t;]'];
    assertDiff(src, dst);
    assertDiff(dst, src);
  });

  test('fuzzer - 7', () => {
    const src = ['32', '110', '43444', '4431', '22'];
    const dst = ['1131', '11011', '12323', '1230', '1'];
    assertDiff(src, dst);
    assertDiff(dst, src);
  });

  test('fuzzer - 8', () => {
    const src = ['2123', '04', '1233', '3301'];
    const dst = ['204'];
    assertDiff(src, dst);
    assertDiff(dst, src);
  });

  test('fuzzer - 9', () => {
    const src = ['2212', '3', '312', '3421', '04022'];
    const dst = ['2', '2', '20', '4334'];
    assertDiff(src, dst);
    assertDiff(dst, src);
  });

  test('fuzzer - 10', () => {
    const src = ['11906'];
    const dst = ['09252', '', '53277', '3', ''];
    assertDiff(src, dst);
    assertDiff(dst, src);
  });

  test('fuzzer - 11', () => {
    const src = ['046', '6095'];
    const dst = ['', '', '082', '98'];
    assertDiff(src, dst);
    assertDiff(dst, src);
  });

  test('fuzzer - 12', () => {
    const src = ['', '7', '20', '09'];
    const dst = ['', ''];
    assertDiff(src, dst);
    assertDiff(dst, src);
  });

  test('fuzzer - 13', () => {
    const src = [''];
    const dst: string[] = [];
    assertDiff(src, dst);
    assertDiff(dst, src);
    assertDiff(dst, dst);
    assertDiff(src, src);
  });
});
