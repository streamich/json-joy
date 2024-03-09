/**
 * @see https://github.com/multiformats/multicodec/blob/master/table.csv
 */
export const enum Multicodec {
  CidV1 = 0x01,
  CidV2 = 0x02,
  CidV3 = 0x03,
  Sha2_256 = 0x12,
  Cbor = 0x51,
  Raw = 0x55,
  DagPb = 0x70,
  DagCbor = 0x71,
  Libp2pKey = 0x72,
  GitRaw = 0x78,
  TorrentInfo = 0x7b,
  TorrentFile = 0x7c,
  DagJose = 0x85,
  DagCose = 0x86,
  DagJson = 0x0129,
  Json = 0x0200,
}

export const enum MulticodecIpld {
  Cbor = Multicodec.Cbor,
  Raw = Multicodec.Raw,
  DagPb = Multicodec.DagPb,
  DagCbor = Multicodec.DagCbor,
  Libp2pKey = Multicodec.Libp2pKey,
  GitRaw = Multicodec.GitRaw,
  TorrentInfo = Multicodec.TorrentInfo,
  TorrentFile = Multicodec.TorrentFile,
  DagJose = Multicodec.DagJose,
  DagCose = Multicodec.DagCose,
  DagJson = Multicodec.DagJson,
  Json = Multicodec.Json,
}
