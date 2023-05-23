export const enum BinaryMessageType {
  Notification = 0b000,
  RequestData = 0b001,
  RequestComplete = 0b010,
  RequestError = 0b011,
  ResponseData = 0b100,
  ResponseComplete = 0b101,
  ResponseError = 0b110,
  Control = 0b111,
}
