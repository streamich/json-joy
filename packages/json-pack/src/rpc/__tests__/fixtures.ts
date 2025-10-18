import {RpcAuthFlavor, RpcAcceptStat, RpcRejectStat, RpcAuthStat, RPC_VERSION} from '../constants';

/**
 * Real-world RPC message fixtures based on RFC 1057 and NFS implementations.
 * All fixtures are byte-for-byte representations of actual RPC messages.
 */

export interface RpcFixture {
  name: string;
  description: string;
  bytes: Uint8Array;
  expected: {
    xid: number;
    type: 'CALL' | 'REPLY';
    [key: string]: any;
  };
}

/**
 * Adds RFC 1057 record marking to a raw RPC message payload.
 * The record mark is a 4-byte header with the high bit set (last fragment)
 * and the lower 31 bits containing the fragment length.
 */
export function addRecordMarking(payload: Uint8Array): Uint8Array {
  const length = payload.length;
  const header = 0x80000000 | length;
  const result = new Uint8Array(4 + length);
  const view = new DataView(result.buffer);
  view.setUint32(0, header, false);
  result.set(payload, 4);
  return result;
}

/**
 * NFS NULL procedure call - simplest RPC call
 * Source: Common NFS implementations
 */
export const NFS_NULL_CALL: RpcFixture = {
  name: 'NFS NULL CALL',
  description: 'NFS NULL procedure call with AUTH_NULL credentials',
  bytes: new Uint8Array([
    0x00,
    0x00,
    0x00,
    0x01, // XID: 1
    0x00,
    0x00,
    0x00,
    0x00, // msg_type: CALL (0)
    0x00,
    0x00,
    0x00,
    0x02, // rpcvers: 2
    0x00,
    0x01,
    0x86,
    0xa3, // prog: 100003 (NFS)
    0x00,
    0x00,
    0x00,
    0x03, // vers: 3
    0x00,
    0x00,
    0x00,
    0x00, // proc: 0 (NULL)
    0x00,
    0x00,
    0x00,
    0x00, // cred: AUTH_NULL
    0x00,
    0x00,
    0x00,
    0x00, // cred length: 0
    0x00,
    0x00,
    0x00,
    0x00, // verf: AUTH_NULL
    0x00,
    0x00,
    0x00,
    0x00, // verf length: 0
  ]),
  expected: {
    xid: 1,
    type: 'CALL',
    rpcvers: RPC_VERSION,
    prog: 100003,
    vers: 3,
    proc: 0,
    credFlavor: RpcAuthFlavor.AUTH_NULL,
    verfFlavor: RpcAuthFlavor.AUTH_NULL,
  },
};

/**
 * Portmapper GETPORT call
 * Source: RFC 1057, Section A.2
 */
export const PORTMAP_GETPORT: RpcFixture = {
  name: 'PORTMAP GETPORT',
  description: 'Portmapper GETPORT procedure call',
  bytes: new Uint8Array([
    0x00,
    0x00,
    0x00,
    0x9c, // XID: 156
    0x00,
    0x00,
    0x00,
    0x00, // msg_type: CALL (0)
    0x00,
    0x00,
    0x00,
    0x02, // rpcvers: 2
    0x00,
    0x01,
    0x86,
    0xa0, // prog: 100000 (PORTMAP)
    0x00,
    0x00,
    0x00,
    0x02, // vers: 2
    0x00,
    0x00,
    0x00,
    0x03, // proc: 3 (GETPORT)
    0x00,
    0x00,
    0x00,
    0x00, // cred: AUTH_NULL
    0x00,
    0x00,
    0x00,
    0x00, // cred length: 0
    0x00,
    0x00,
    0x00,
    0x00, // verf: AUTH_NULL
    0x00,
    0x00,
    0x00,
    0x00, // verf length: 0
    // Parameters: prog=100003, vers=3, prot=17, port=0
    0x00,
    0x01,
    0x86,
    0xa3, // prog: 100003
    0x00,
    0x00,
    0x00,
    0x03, // vers: 3
    0x00,
    0x00,
    0x00,
    0x11, // protocol: 17 (UDP)
    0x00,
    0x00,
    0x00,
    0x00, // port: 0
  ]),
  expected: {
    xid: 156,
    type: 'CALL',
    rpcvers: RPC_VERSION,
    prog: 100000,
    vers: 2,
    proc: 3,
    credFlavor: RpcAuthFlavor.AUTH_NULL,
    verfFlavor: RpcAuthFlavor.AUTH_NULL,
  },
};

/**
 * RPC call with AUTH_UNIX credentials
 * Source: RFC 1057, Section 9.2
 */
export const CALL_WITH_AUTH_UNIX: RpcFixture = {
  name: 'CALL with AUTH_UNIX',
  description: 'RPC call with AUTH_UNIX credentials (uid=1000, gid=1000)',
  bytes: new Uint8Array([
    0x00,
    0x00,
    0x04,
    0xd2, // XID: 1234
    0x00,
    0x00,
    0x00,
    0x00, // msg_type: CALL (0)
    0x00,
    0x00,
    0x00,
    0x02, // rpcvers: 2
    0x00,
    0x01,
    0x86,
    0xa3, // prog: 100003 (NFS)
    0x00,
    0x00,
    0x00,
    0x03, // vers: 3
    0x00,
    0x00,
    0x00,
    0x01, // proc: 1
    0x00,
    0x00,
    0x00,
    0x01, // cred: AUTH_UNIX
    0x00,
    0x00,
    0x00,
    0x18, // cred length: 24
    // AUTH_UNIX data (24 bytes)
    0x00,
    0x00,
    0x00,
    0x00, // stamp: 0
    0x00,
    0x00,
    0x00,
    0x04, // machine name length: 4
    0x74,
    0x65,
    0x73,
    0x74, // machine name: "test"
    0x00,
    0x00,
    0x03,
    0xe8, // uid: 1000
    0x00,
    0x00,
    0x03,
    0xe8, // gid: 1000
    0x00,
    0x00,
    0x00,
    0x00, // gids length: 0
    0x00,
    0x00,
    0x00,
    0x00, // verf: AUTH_NULL
    0x00,
    0x00,
    0x00,
    0x00, // verf length: 0
  ]),
  expected: {
    xid: 1234,
    type: 'CALL',
    rpcvers: RPC_VERSION,
    prog: 100003,
    vers: 3,
    proc: 1,
    credFlavor: RpcAuthFlavor.AUTH_UNIX,
    verfFlavor: RpcAuthFlavor.AUTH_NULL,
  },
};

/**
 * Successful RPC reply (no result data)
 * Source: RFC 1057, Section A.3
 * Note: Result data is not included as it should be handled separately by the application
 */
export const SUCCESS_REPLY: RpcFixture = {
  name: 'SUCCESS REPLY',
  description: 'Successful RPC reply without result data',
  bytes: new Uint8Array([
    0x00,
    0x00,
    0x00,
    0x9c, // XID: 156
    0x00,
    0x00,
    0x00,
    0x01, // msg_type: REPLY (1)
    0x00,
    0x00,
    0x00,
    0x00, // reply_stat: MSG_ACCEPTED (0)
    0x00,
    0x00,
    0x00,
    0x00, // verf: AUTH_NULL
    0x00,
    0x00,
    0x00,
    0x00, // verf length: 0
    0x00,
    0x00,
    0x00,
    0x00, // accept_stat: SUCCESS (0)
  ]),
  expected: {
    xid: 156,
    type: 'REPLY',
    replyStat: 'MSG_ACCEPTED',
    acceptStat: RpcAcceptStat.SUCCESS,
    verfFlavor: RpcAuthFlavor.AUTH_NULL,
  },
};

/**
 * PROG_UNAVAIL reply
 */
export const PROG_UNAVAIL_REPLY: RpcFixture = {
  name: 'PROG_UNAVAIL REPLY',
  description: 'Reply indicating program unavailable',
  bytes: new Uint8Array([
    0x00,
    0x00,
    0x00,
    0x42, // XID: 66
    0x00,
    0x00,
    0x00,
    0x01, // msg_type: REPLY (1)
    0x00,
    0x00,
    0x00,
    0x00, // reply_stat: MSG_ACCEPTED (0)
    0x00,
    0x00,
    0x00,
    0x00, // verf: AUTH_NULL
    0x00,
    0x00,
    0x00,
    0x00, // verf length: 0
    0x00,
    0x00,
    0x00,
    0x01, // accept_stat: PROG_UNAVAIL (1)
  ]),
  expected: {
    xid: 66,
    type: 'REPLY',
    replyStat: 'MSG_ACCEPTED',
    acceptStat: RpcAcceptStat.PROG_UNAVAIL,
    verfFlavor: RpcAuthFlavor.AUTH_NULL,
  },
};

/**
 * PROG_MISMATCH reply
 */
export const PROG_MISMATCH_REPLY: RpcFixture = {
  name: 'PROG_MISMATCH REPLY',
  description: 'Reply indicating program version mismatch',
  bytes: new Uint8Array([
    0x00,
    0x00,
    0x01,
    0x00, // XID: 256
    0x00,
    0x00,
    0x00,
    0x01, // msg_type: REPLY (1)
    0x00,
    0x00,
    0x00,
    0x00, // reply_stat: MSG_ACCEPTED (0)
    0x00,
    0x00,
    0x00,
    0x00, // verf: AUTH_NULL
    0x00,
    0x00,
    0x00,
    0x00, // verf length: 0
    0x00,
    0x00,
    0x00,
    0x02, // accept_stat: PROG_MISMATCH (2)
    0x00,
    0x00,
    0x00,
    0x02, // low version: 2
    0x00,
    0x00,
    0x00,
    0x03, // high version: 3
  ]),
  expected: {
    xid: 256,
    type: 'REPLY',
    replyStat: 'MSG_ACCEPTED',
    acceptStat: RpcAcceptStat.PROG_MISMATCH,
    verfFlavor: RpcAuthFlavor.AUTH_NULL,
    mismatchLow: 2,
    mismatchHigh: 3,
  },
};

/**
 * PROC_UNAVAIL reply
 */
export const PROC_UNAVAIL_REPLY: RpcFixture = {
  name: 'PROC_UNAVAIL REPLY',
  description: 'Reply indicating procedure unavailable',
  bytes: new Uint8Array([
    0x00,
    0x00,
    0x00,
    0x55, // XID: 85
    0x00,
    0x00,
    0x00,
    0x01, // msg_type: REPLY (1)
    0x00,
    0x00,
    0x00,
    0x00, // reply_stat: MSG_ACCEPTED (0)
    0x00,
    0x00,
    0x00,
    0x00, // verf: AUTH_NULL
    0x00,
    0x00,
    0x00,
    0x00, // verf length: 0
    0x00,
    0x00,
    0x00,
    0x03, // accept_stat: PROC_UNAVAIL (3)
  ]),
  expected: {
    xid: 85,
    type: 'REPLY',
    replyStat: 'MSG_ACCEPTED',
    acceptStat: RpcAcceptStat.PROC_UNAVAIL,
    verfFlavor: RpcAuthFlavor.AUTH_NULL,
  },
};

/**
 * GARBAGE_ARGS reply
 */
export const GARBAGE_ARGS_REPLY: RpcFixture = {
  name: 'GARBAGE_ARGS REPLY',
  description: 'Reply indicating garbage arguments',
  bytes: new Uint8Array([
    0x00,
    0x00,
    0x00,
    0x99, // XID: 153
    0x00,
    0x00,
    0x00,
    0x01, // msg_type: REPLY (1)
    0x00,
    0x00,
    0x00,
    0x00, // reply_stat: MSG_ACCEPTED (0)
    0x00,
    0x00,
    0x00,
    0x00, // verf: AUTH_NULL
    0x00,
    0x00,
    0x00,
    0x00, // verf length: 0
    0x00,
    0x00,
    0x00,
    0x04, // accept_stat: GARBAGE_ARGS (4)
  ]),
  expected: {
    xid: 153,
    type: 'REPLY',
    replyStat: 'MSG_ACCEPTED',
    acceptStat: RpcAcceptStat.GARBAGE_ARGS,
    verfFlavor: RpcAuthFlavor.AUTH_NULL,
  },
};

/**
 * RPC_MISMATCH rejected reply
 */
export const RPC_MISMATCH_REPLY: RpcFixture = {
  name: 'RPC_MISMATCH REPLY',
  description: 'Rejected reply due to RPC version mismatch',
  bytes: new Uint8Array([
    0x00,
    0x00,
    0x00,
    0x77, // XID: 119
    0x00,
    0x00,
    0x00,
    0x01, // msg_type: REPLY (1)
    0x00,
    0x00,
    0x00,
    0x01, // reply_stat: MSG_DENIED (1)
    0x00,
    0x00,
    0x00,
    0x00, // reject_stat: RPC_MISMATCH (0)
    0x00,
    0x00,
    0x00,
    0x02, // low version: 2
    0x00,
    0x00,
    0x00,
    0x02, // high version: 2
  ]),
  expected: {
    xid: 119,
    type: 'REPLY',
    replyStat: 'MSG_DENIED',
    rejectStat: RpcRejectStat.RPC_MISMATCH,
    mismatchLow: 2,
    mismatchHigh: 2,
  },
};

/**
 * AUTH_ERROR rejected reply with AUTH_BADCRED
 */
export const AUTH_BADCRED_REPLY: RpcFixture = {
  name: 'AUTH_BADCRED REPLY',
  description: 'Rejected reply due to bad credentials',
  bytes: new Uint8Array([
    0x00,
    0x00,
    0x00,
    0xaa, // XID: 170
    0x00,
    0x00,
    0x00,
    0x01, // msg_type: REPLY (1)
    0x00,
    0x00,
    0x00,
    0x01, // reply_stat: MSG_DENIED (1)
    0x00,
    0x00,
    0x00,
    0x01, // reject_stat: AUTH_ERROR (1)
    0x00,
    0x00,
    0x00,
    0x01, // auth_stat: AUTH_BADCRED (1)
  ]),
  expected: {
    xid: 170,
    type: 'REPLY',
    replyStat: 'MSG_DENIED',
    rejectStat: RpcRejectStat.AUTH_ERROR,
    authStat: RpcAuthStat.AUTH_BADCRED,
  },
};

/**
 * AUTH_ERROR rejected reply with AUTH_TOOWEAK
 */
export const AUTH_TOOWEAK_REPLY: RpcFixture = {
  name: 'AUTH_TOOWEAK REPLY',
  description: 'Rejected reply due to weak authentication',
  bytes: new Uint8Array([
    0x00,
    0x00,
    0x00,
    0xbb, // XID: 187
    0x00,
    0x00,
    0x00,
    0x01, // msg_type: REPLY (1)
    0x00,
    0x00,
    0x00,
    0x01, // reply_stat: MSG_DENIED (1)
    0x00,
    0x00,
    0x00,
    0x01, // reject_stat: AUTH_ERROR (1)
    0x00,
    0x00,
    0x00,
    0x05, // auth_stat: AUTH_TOOWEAK (5)
  ]),
  expected: {
    xid: 187,
    type: 'REPLY',
    replyStat: 'MSG_DENIED',
    rejectStat: RpcRejectStat.AUTH_ERROR,
    authStat: RpcAuthStat.AUTH_TOOWEAK,
  },
};

/**
 * Call with non-aligned auth body (tests XDR padding)
 */
export const CALL_WITH_PADDING_1BYTE: RpcFixture = {
  name: 'CALL with 1-byte auth (3-byte padding)',
  description: 'RPC call with 1-byte auth body requiring 3 bytes padding',
  bytes: new Uint8Array([
    0x00,
    0x00,
    0x11,
    0x11, // XID: 4369
    0x00,
    0x00,
    0x00,
    0x00, // msg_type: CALL (0)
    0x00,
    0x00,
    0x00,
    0x02, // rpcvers: 2
    0x00,
    0x00,
    0x00,
    0x64, // prog: 100
    0x00,
    0x00,
    0x00,
    0x01, // vers: 1
    0x00,
    0x00,
    0x00,
    0x00, // proc: 0
    0x00,
    0x00,
    0x00,
    0x01, // cred: AUTH_UNIX
    0x00,
    0x00,
    0x00,
    0x01, // cred length: 1
    0x42,
    0x00,
    0x00,
    0x00, // cred body: [0x42] + 3 padding bytes
    0x00,
    0x00,
    0x00,
    0x00, // verf: AUTH_NULL
    0x00,
    0x00,
    0x00,
    0x00, // verf length: 0
  ]),
  expected: {
    xid: 4369,
    type: 'CALL',
    rpcvers: RPC_VERSION,
    prog: 100,
    vers: 1,
    proc: 0,
    credFlavor: RpcAuthFlavor.AUTH_UNIX,
    credBodyLength: 1,
    verfFlavor: RpcAuthFlavor.AUTH_NULL,
  },
};

/**
 * Call with 2-byte auth body (tests XDR padding)
 */
export const CALL_WITH_PADDING_2BYTE: RpcFixture = {
  name: 'CALL with 2-byte auth (2-byte padding)',
  description: 'RPC call with 2-byte auth body requiring 2 bytes padding',
  bytes: new Uint8Array([
    0x00,
    0x00,
    0x22,
    0x22, // XID: 8738
    0x00,
    0x00,
    0x00,
    0x00, // msg_type: CALL (0)
    0x00,
    0x00,
    0x00,
    0x02, // rpcvers: 2
    0x00,
    0x00,
    0x00,
    0x64, // prog: 100
    0x00,
    0x00,
    0x00,
    0x01, // vers: 1
    0x00,
    0x00,
    0x00,
    0x00, // proc: 0
    0x00,
    0x00,
    0x00,
    0x01, // cred: AUTH_UNIX
    0x00,
    0x00,
    0x00,
    0x02, // cred length: 2
    0x12,
    0x34,
    0x00,
    0x00, // cred body: [0x12, 0x34] + 2 padding bytes
    0x00,
    0x00,
    0x00,
    0x00, // verf: AUTH_NULL
    0x00,
    0x00,
    0x00,
    0x00, // verf length: 0
  ]),
  expected: {
    xid: 8738,
    type: 'CALL',
    rpcvers: RPC_VERSION,
    prog: 100,
    vers: 1,
    proc: 0,
    credFlavor: RpcAuthFlavor.AUTH_UNIX,
    credBodyLength: 2,
    verfFlavor: RpcAuthFlavor.AUTH_NULL,
  },
};

/**
 * Call with 3-byte auth body (tests XDR padding)
 */
export const CALL_WITH_PADDING_3BYTE: RpcFixture = {
  name: 'CALL with 3-byte auth (1-byte padding)',
  description: 'RPC call with 3-byte auth body requiring 1 byte padding',
  bytes: new Uint8Array([
    0x00,
    0x00,
    0x33,
    0x33, // XID: 13107
    0x00,
    0x00,
    0x00,
    0x00, // msg_type: CALL (0)
    0x00,
    0x00,
    0x00,
    0x02, // rpcvers: 2
    0x00,
    0x00,
    0x00,
    0x64, // prog: 100
    0x00,
    0x00,
    0x00,
    0x01, // vers: 1
    0x00,
    0x00,
    0x00,
    0x00, // proc: 0
    0x00,
    0x00,
    0x00,
    0x01, // cred: AUTH_UNIX
    0x00,
    0x00,
    0x00,
    0x03, // cred length: 3
    0x12,
    0x34,
    0x56,
    0x00, // cred body: [0x12, 0x34, 0x56] + 1 padding byte
    0x00,
    0x00,
    0x00,
    0x00, // verf: AUTH_NULL
    0x00,
    0x00,
    0x00,
    0x00, // verf length: 0
  ]),
  expected: {
    xid: 13107,
    type: 'CALL',
    rpcvers: RPC_VERSION,
    prog: 100,
    vers: 1,
    proc: 0,
    credFlavor: RpcAuthFlavor.AUTH_UNIX,
    credBodyLength: 3,
    verfFlavor: RpcAuthFlavor.AUTH_NULL,
  },
};

/**
 * All fixtures for easy iteration in tests
 */
export const ALL_FIXTURES: RpcFixture[] = [
  NFS_NULL_CALL,
  PORTMAP_GETPORT,
  CALL_WITH_AUTH_UNIX,
  SUCCESS_REPLY,
  PROG_UNAVAIL_REPLY,
  PROG_MISMATCH_REPLY,
  PROC_UNAVAIL_REPLY,
  GARBAGE_ARGS_REPLY,
  RPC_MISMATCH_REPLY,
  AUTH_BADCRED_REPLY,
  AUTH_TOOWEAK_REPLY,
  CALL_WITH_PADDING_1BYTE,
  CALL_WITH_PADDING_2BYTE,
  CALL_WITH_PADDING_3BYTE,
];

/**
 * CALL fixtures only
 */
export const CALL_FIXTURES = ALL_FIXTURES.filter((f) => f.expected.type === 'CALL');

/**
 * REPLY fixtures only
 */
export const REPLY_FIXTURES = ALL_FIXTURES.filter((f) => f.expected.type === 'REPLY');
