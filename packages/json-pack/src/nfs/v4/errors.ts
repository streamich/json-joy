export class Nfsv4DecodingError extends Error {
  constructor(message?: string) {
    super(message ? 'NFSv4_DECODING: ' + message : 'NFSv4_DECODING');
  }
}

export class Nfsv4EncodingError extends Error {
  constructor(message?: string) {
    super(message ? 'NFSv4_ENCODING: ' + message : 'NFSv4_ENCODING');
  }
}
