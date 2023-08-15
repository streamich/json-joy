/**
 * Run with:
 *
 *     npx ts-node src/json-random/__demos__/json-random.ts
 */

import {RandomJson} from '../../json-random';

const json1 = RandomJson.generate();
console.log(json1); // tslint:disable-line no-console
// {
//   '38': "'@9_nO'Mr2kNsk",
//   ']Io': 'ek_(3hS_voW|4',
//   O55y3: 381613794.8379983,
//   'nWiO8W2hkQ(': false,
//   'r,5^0K!?c': true,
//   '믊㶋搀焟㰏䶨⃷쎨躡': 124288683.18213326,
//   'G;l{VueC(#\\': 90848872.89389054,
//   '%dP|': 172689822.92919666,
//   'Z``<B(sHK': true,
//   '扩': 355506432.3973469,
//   '#a$$2T(G"Mh*g': {
//     ']|qy': 708400045.4802666,
//     "ec'\\#a#": null,
//     '%Cv8)': -8847104755395191,
//     ':+\\is': null,
//     ';U?ry#': { 'k-%=kGFC4G': "#'l^A+5", '쥇芯徇艇꽉䡸': 33104 },
//     'LaD:3H)B!#mjG=': 99166386.63603616,
//     'y:1n$1M': '|+5#-',
//     `'u@3K$"`: 6543898221898499
//   },
//   '35%%WK4"Zz/DV': '_9|',
//   KmAT_: '/!',
//   '>>?7.(0': '鿞虠制�紉蓊澡඾嘍皽퀌࠻ꏙ۽',
//   '9#zw;1Grn=95Csj|': {
//     '4r::`32,': 606175517.8053282,
//     '#vp': 833875564.9460341,
//     ']bSg2%Pnh>': 916851127.8107322,
//     ',a}I,XOTJo}sxp6': true,
//     '?D[f': 218903673.91954625
//   },
//   yM: ',b7`wZ m9u',
//   'f3G!vM-': 856162337.7339423
// }

const json2 = RandomJson.generate({
  nodeCount: 5,
});
console.log(json2); // tslint:disable-line no-console
// {
//   '?)DClmRrUZAg8z>8': [ null, 596640662.4073832, 82241937.12592442 ],
//   '}geJx8\\u_s': 27895
// }

const json3 = RandomJson.generate({
  nodeCount: 5,
  rootNode: 'array',
});
console.log(json3); // tslint:disable-line no-console
// [
//   421841709.15660113,
//   641343038.74181,
//   { 'SQ6QQ<Dmvh!Qowug': '8' },
//   '*Qc7=J=}|@f!!'
// ]

const json4 = RandomJson.generate({
  nodeCount: 6,
  odds: {
    array: 0,
    object: 10,
    string: 10,
    boolean: 0,
    null: 0,
    number: 0,
  } as any,
});
console.log(json4); // tslint:disable-line no-console
// {
//   'ꢗᑨ䣥ꩇ쫃죄苑𥳐ဂ⑏': ';@Vb',
//   B1s: "'Yk5!E?8[ILNETL",
//   '_`17X^8wu^n': { X: {}, 'x"': {} },
//   '忶': ',Q#$7lcuIBrIW'
// }

const json5 = RandomJson.genString();
console.log(json5); // tslint:disable-line no-console
// %r&VwD^Zw

const json6 = RandomJson.genNumber();
console.log(json6); // tslint:disable-line no-console
// 820038137.7642472

const json7 = RandomJson.genObject();
console.log(json7); // tslint:disable-line no-console
// {
//   'F#D2o-YUMz_c': 932708949530172,
//   '(K0&%lE[ta"*R}@J': '05rw{Rz-9+z0R8$',
//   gX: 'y',
//   '`c8wh_=0.>': 'Q{Zi',
//   'GPo/.@': 623441950.4015203,
//   'uvUNV+a0Vj': []
// }

const json8 = RandomJson.genArray();
console.log(json8); // tslint:disable-line no-console
// [ 'BYTvAq+k', [], [ '&XT93Y', '{LN\\!P5SQ}0>&rZ%' ], null ]
