import {Cid} from '../Cid';
import {Multicodec} from '../constants';

describe('CID v0', () => {
  test('can decode a sample CID', () => {
    const txt = 'QmPK1s3pNYLi9ERiq3BDxKa4XosgWwFRQUydHUtz4YgpqB';
    const cid = Cid.fromText(txt);
    expect(cid.v).toBe(0);
    expect(cid.contentType).toBe(Multicodec.DagPb);
    expect(cid.hash.type()).toBe(Multicodec.Sha2_256);
    expect(cid.hash.length()).toBe(32);
    expect(cid.hash.value()).toEqual(new Uint8Array([14, 112, 113, 197, 157, 243, 185, 69, 77, 29, 24, 161, 82, 112, 170, 54, 213, 79, 137, 96, 106, 87, 109, 198, 33, 117, 122, 253, 68, 173, 29, 46]));
  });

  test('can encode a sample CID back', () => {
    const txt = 'QmPK1s3pNYLi9ERiq3BDxKa4XosgWwFRQUydHUtz4YgpqB';
    const cid = Cid.fromText(txt);
    const txt2 = cid.toTextV0();
    expect(txt2).toEqual(txt);
  });
});
