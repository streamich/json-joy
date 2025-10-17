export class Nfsv3DecodingError extends Error {
  constructor(message?: string) {
    super(message ? 'NFSv3_DECODING: ' + message : 'NFSv3_DECODING');
  }
}

export class Nfsv3EncodingError extends Error {
  constructor(message?: string) {
    super(message ? 'NFSv3_ENCODING: ' + message : 'NFSv3_ENCODING');
  }
}
