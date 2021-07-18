export enum RpcServerError {
  Unknown = 0,
  IdTaken = 1,
  TooManyActiveCalls = 2,
  InvalidData = 3,
  InvalidMethodName = 4,
  InvalidNotificationName = 5,
  NoMethodSpecified = 6,
  MethodNotFound = 7,
  ErrorForStaticMethod = 8,
  Stop = 9,
  Disconnect = 10,
}
