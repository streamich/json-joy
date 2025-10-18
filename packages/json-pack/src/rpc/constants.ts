/**
 * ONC RPC Protocol Constants
 * Supports RFC 1057, RFC 1831, and RFC 5531
 */

/**
 * Message type enumeration
 * @see RFC 1057 Section 8
 * @see RFC 1831 Section 8
 * @see RFC 5531 Section 9
 */
export const enum RpcMsgType {
  CALL = 0,
  REPLY = 1,
}

/**
 * Reply status enumeration
 * @see RFC 1057 Section 8
 * @see RFC 1831 Section 8
 * @see RFC 5531 Section 9
 */
export const enum RpcReplyStat {
  MSG_ACCEPTED = 0,
  MSG_DENIED = 1,
}

/**
 * Accept status values for accepted RPC replies
 * @see RFC 1057 Section 8 (values 0-4)
 * @see RFC 1831 Section 8 (values 0-4)
 * @see RFC 5531 Section 9 (added SYSTEM_ERR = 5)
 */
export const enum RpcAcceptStat {
  SUCCESS = 0, // RFC 1057
  PROG_UNAVAIL = 1, // RFC 1057
  PROG_MISMATCH = 2, // RFC 1057
  PROC_UNAVAIL = 3, // RFC 1057
  GARBAGE_ARGS = 4, // RFC 1057
  SYSTEM_ERR = 5, // RFC 5531
}

/**
 * Reject status enumeration
 * @see RFC 1057 Section 8
 * @see RFC 1831 Section 8
 * @see RFC 5531 Section 9
 */
export const enum RpcRejectStat {
  RPC_MISMATCH = 0,
  AUTH_ERROR = 1,
}

/**
 * Authentication status values for rejected RPC calls
 * @see RFC 1057 Section 9 (values 1-5)
 * @see RFC 1831 Section 9 (values 1-5)
 * @see RFC 5531 Section 10 (expanded with values 0, 6-14 for RPCSEC_GSS support)
 */
export const enum RpcAuthStat {
  AUTH_OK = 0, // RFC 5531
  AUTH_BADCRED = 1, // RFC 1057
  AUTH_REJECTEDCRED = 2, // RFC 1057
  AUTH_BADVERF = 3, // RFC 1057
  AUTH_REJECTEDVERF = 4, // RFC 1057
  AUTH_TOOWEAK = 5, // RFC 1057
  AUTH_INVALIDRESP = 6, // RFC 5531
  AUTH_FAILED = 7, // RFC 5531
  AUTH_KERB_GENERIC = 8, // RFC 5531
  AUTH_TIMEEXPIRE = 9, // RFC 5531
  AUTH_TKT_FILE = 10, // RFC 5531
  AUTH_DECODE = 11, // RFC 5531
  AUTH_NET_ADDR = 12, // RFC 5531
  RPCSEC_GSS_CREDPROBLEM = 13, // RFC 5531
  RPCSEC_GSS_CTXPROBLEM = 14, // RFC 5531
}

/**
 * Authentication flavor numbers
 * @see RFC 1057 Section 9 (AUTH_NULL, AUTH_UNIX, AUTH_SHORT, AUTH_DES)
 * @see RFC 1831 Section 9, Appendix A (renamed AUTH_NULL->AUTH_NONE, AUTH_UNIX->AUTH_SYS)
 * @see RFC 5531 Section 10, Appendix C (added AUTH_KERB, AUTH_RSA, RPCSEC_GSS)
 *
 * Note: Old names (AUTH_NULL, AUTH_UNIX, AUTH_DES) maintained for backward compatibility
 */
export const enum RpcAuthFlavor {
  AUTH_NONE = 0, // RFC 1831 (renamed from AUTH_NULL in RFC 1057)
  AUTH_SYS = 1, // RFC 1831 (renamed from AUTH_UNIX in RFC 1057)
  AUTH_SHORT = 2, // RFC 1057
  AUTH_DH = 3, // RFC 5531 (obsolete, was AUTH_DES in RFC 1057)
  AUTH_KERB = 4, // RFC 5531
  AUTH_RSA = 5, // RFC 5531
  RPCSEC_GSS = 6, // RFC 5531 (RFC 2203, RFC 5403)
  AUTH_NULL = 0, // RFC 1057 (alias for AUTH_NONE)
  AUTH_UNIX = 1, // RFC 1057 (alias for AUTH_SYS)
  AUTH_DES = 3, // RFC 1057 (alias for AUTH_DH)
}

/**
 * RPC protocol version (all RFCs use version 2)
 * @see RFC 1057 Section 8
 * @see RFC 1831 Section 8
 * @see RFC 5531 Section 9
 */
export const RPC_VERSION = 2;
