export const enum CompactMessageType {
  RequestData = 0,
  RequestComplete = 1,
  RequestError = 2,
  RequestUnsubscribe = 3,

  ResponseData = 4,
  ResponseComplete = 5,
  ResponseError = 6,
  ResponseUnsubscribe = 7,

  Notification = 8,
}
