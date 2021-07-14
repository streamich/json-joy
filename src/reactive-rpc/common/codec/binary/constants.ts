export const enum MessageCode {
  RequestData = 0b000,
  RequestComplete = 0b001,
  RequestError = 0b010,
  RequestUnsubscribe = 0b11111110,

  Notification = 0b011,

  ResponseData = 0b100,
  ResponseComplete = 0b101,
  ResponseError = 0b110,
  ResponseUnsubscribe = 0b11111111,
}
