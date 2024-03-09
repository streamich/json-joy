import {Cid} from '../Cid';
import {Multicodec, MulticodecIpld} from '../constants';

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

describe('CID v1', () => {
  test('can convert CID v0 to v1', () => {
    const txt = 'QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR';
    const cid = Cid.fromText(txt);
    const cid2 = cid.toV1();
    expect(cid2.toText('base32')).toEqual('bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi');
  });

  test('can convert CID v1 to v2', () => {
    const txt = 'bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku';
    const cid = Cid.fromText(txt);
    const cid2 = cid.toV0();
    expect(cid2.toText()).toEqual('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n');
  });

  test('can decode a sample CID', () => {
    const txt = 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi';
    const cid = Cid.fromText(txt);
    expect(cid.v).toBe(1);
    expect(cid.contentType).toBe(Multicodec.DagPb);
    expect(cid.hash.type()).toBe(Multicodec.Sha2_256);
    expect(cid.hash.length()).toBe(32);
    expect(cid.hash.value()).toEqual(new Uint8Array([
      195, 196, 115,  62, 200, 175,
      253,   6, 207, 158, 159, 245,  15, 252,
      107, 205,  46, 200,  90,  97, 112,   0,
      75, 183,   9, 102, 156,  49, 222, 148,
      57,  26
    ]));
  });

  test('can encode a sample CID back', () => {
    const txt = 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi';
    const cid = Cid.fromText(txt);
    const txt2 = cid.toText('base32');
    expect(txt2).toEqual(txt);
  });

  test('can create a CID from data', async () => {
    const text = 'Merkle–Damgård';
    const data = new TextEncoder().encode(text);
    const cid = await Cid.fromData(data);
    expect(cid.v).toBe(1);
    expect(cid.contentType).toBe(MulticodecIpld.Raw);
    expect(cid.toText('base16')).toBe('f01551220' + '41dd7b6443542e75701aa98a0c235951a28a0d851b11564d20022ab11d2589a8');
  });
});
