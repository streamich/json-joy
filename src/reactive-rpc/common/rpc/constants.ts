export enum RpcServerError {
  Unknown = 0,
  IdTaken = 1,
  TooManyActiveCalls = 2,
  InvalidData = 3,
  NoMethodSpecified = 4,
  MethodNotFound = 5,
  ErrorForStaticMethod = 6,
  Stop = 7,
  Disconnect = 8,
}
