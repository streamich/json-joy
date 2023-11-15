export type RecognizedString =
  | string
  | ArrayBuffer
  | Uint8Array
  | Int8Array
  | Uint16Array
  | Int16Array
  | Uint32Array
  | Int32Array
  | Float32Array
  | Float64Array;

export interface HttpRequest {
  /** Returns the lowercased header value or empty string. */
  getHeader(lowerCaseKey: RecognizedString): string;
  /** Returns the URL including initial /slash */
  getUrl(): string;
  /** Returns the HTTP method, useful for "any" routes. */
  getMethod(): string;
  /** Returns the raw querystring (the part of URL after ? sign) or empty string. */
  getQuery(): string;
  /** Returns a decoded query parameter value or empty string. */
  getQuery(key: string): string;
}

export interface HttpResponse {
  /**
   * Writes the HTTP status message such as "200 OK".
   * This has to be called first in any response, otherwise
   * it will be called automatically with "200 OK".
   *
   * If you want to send custom headers in a WebSocket
   * upgrade response, you have to call writeStatus with
   * "101 Switching Protocols" before you call writeHeader,
   * otherwise your first call to writeHeader will call
   * writeStatus with "200 OK" and the upgrade will fail.
   *
   * As you can imagine, we format outgoing responses in a linear
   * buffer, not in a hash table. You can read about this in
   * the user manual under "corking".
   */
  writeStatus(status: RecognizedString): HttpResponse;
  /**
   * Writes key and value to HTTP response.
   * See writeStatus and corking.
   */
  writeHeader(key: RecognizedString, value: RecognizedString): HttpResponse;
  /** Enters or continues chunked encoding mode. Writes part of the response. End with zero length write. Returns true if no backpressure was added. */
  write(chunk: RecognizedString): boolean;
  /** Ends this response by copying the contents of body. */
  end(body?: RecognizedString, closeConnection?: boolean): HttpResponse;
  /** Immediately force closes the connection. Any onAborted callback will run. */
  close(): HttpResponse;
  /**
   * Every HttpResponse MUST have an attached abort handler IF you do not respond
   * to it immediately inside of the callback. Returning from an Http request handler
   * without attaching (by calling onAborted) an abort handler is ill-use and will terminate.
   * When this event emits, the response has been aborted and may not be used.
   */
  onAborted(handler: () => void): HttpResponse;
  /**
   * Handler for reading data from POST and such requests. You MUST copy the
   * data of chunk if isLast is not true. We Neuter ArrayBuffers on return,
   * making it zero length.
   */
  onData(handler: (chunk: ArrayBuffer, isLast: boolean) => void): HttpResponse;
  /** Returns the remote IP address as text. */
  getRemoteAddressAsText(): ArrayBuffer;
  /** Corking a response is a performance improvement in both CPU and network, as you ready the IO system for writing multiple chunks at once.
   * By default, you're corked in the immediately executing top portion of the route handler. In all other cases, such as when returning from
   * await, or when being called back from an async database request or anything that isn't directly executing in the route handler, you'll want
   * to cork before calling writeStatus, writeHeader or just write. Corking takes a callback in which you execute the writeHeader, writeStatus and
   * such calls, in one atomic IO operation. This is important, not only for TCP but definitely for TLS where each write would otherwise result
   * in one TLS block being sent off, each with one send syscall.
   *
   * Example usage:
   *
   * res.cork(() => {
   *   res.writeStatus("200 OK").writeHeader("Some", "Value").write("Hello world!");
   * });
   */
  cork(cb: () => void): HttpResponse;
  /** Upgrades a HttpResponse to a WebSocket. See UpgradeAsync, UpgradeSync example files. */
  upgrade<T>(
    userData: T,
    secWebSocketKey: RecognizedString,
    secWebSocketProtocol: RecognizedString,
    secWebSocketExtensions: RecognizedString,
    context: unknown,
  ): void;
  /** Arbitrary user data may be attached to this object */
  [key: string]: any;
}

/** TemplatedApp is either an SSL or non-SSL app. See App for more info, read user manual. */
export interface TemplatedApp {
  /** Listens to hostname & port. Callback hands either false or a listen socket. */
  listen(host: RecognizedString, port: number, cb: (listenSocket: unknown) => void): TemplatedApp;
  /** Registers an HTTP GET handler matching specified URL pattern. */
  get(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => void): TemplatedApp;
  /** Registers an HTTP POST handler matching specified URL pattern. */
  post(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => void): TemplatedApp;
  /** Registers an HTTP OPTIONS handler matching specified URL pattern. */
  options(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => void): TemplatedApp;
  /** Registers an HTTP DELETE handler matching specified URL pattern. */
  del(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => void): TemplatedApp;
  /** Registers an HTTP PATCH handler matching specified URL pattern. */
  patch(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => void): TemplatedApp;
  /** Registers an HTTP PUT handler matching specified URL pattern. */
  put(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => void): TemplatedApp;
  /** Registers an HTTP HEAD handler matching specified URL pattern. */
  head(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => void): TemplatedApp;
  /** Registers an HTTP CONNECT handler matching specified URL pattern. */
  connect(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => void): TemplatedApp;
  /** Registers an HTTP TRACE handler matching specified URL pattern. */
  trace(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => void): TemplatedApp;
  /** Registers an HTTP handler matching specified URL pattern on any HTTP method. */
  any(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => void): TemplatedApp;
  /** Registers a handler matching specified URL pattern where WebSocket upgrade requests are caught. */
  ws(pattern: RecognizedString, behavior: WebSocketBehavior): TemplatedApp;
}

/** A structure holding settings and handlers for a WebSocket URL route handler. */
export interface WebSocketBehavior {
  /** Maximum length of received message. If a client tries to send you a message larger than this, the connection is immediately closed. Defaults to 16 * 1024. */
  maxPayloadLength?: number;
  /** Maximum amount of seconds that may pass without sending or getting a message. Connection is closed if this timeout passes. Resolution (granularity) for timeouts are typically 4 seconds, rounded to closest.
   * Disable by using 0. Defaults to 120.
   */
  idleTimeout?: number;
  /** What permessage-deflate compression to use. uWS.DISABLED, uWS.SHARED_COMPRESSOR or any of the uWS.DEDICATED_COMPRESSOR_xxxKB. Defaults to uWS.DISABLED. */
  compression?: number;
  /** Maximum length of allowed backpressure per socket when publishing or sending messages. Slow receivers with too high backpressure will be skipped until they catch up or timeout. Defaults to 1024 * 1024. */
  maxBackpressure?: number;
  /** Whether or not we should automatically send pings to uphold a stable connection given whatever idleTimeout. */
  sendPingsAutomatically?: boolean;
  /** Upgrade handler used to intercept HTTP upgrade requests and potentially upgrade to WebSocket.
   * See UpgradeAsync and UpgradeSync example files.
   */
  upgrade?: (res: HttpResponse, req: HttpRequest, context: unknown) => void;
  /** Handler for new WebSocket connection. WebSocket is valid from open to close, no errors. */
  open?: (ws: WebSocket) => void;
  /** Handler for a WebSocket message. Messages are given as ArrayBuffer no matter if they are binary or not. Given ArrayBuffer is valid during the lifetime of this callback (until first await or return) and will be neutered. */
  message?: (ws: WebSocket, message: ArrayBuffer, isBinary: boolean) => void;
  /** Handler for when WebSocket backpressure drains. Check ws.getBufferedAmount(). Use this to guide / drive your backpressure throttling. */
  drain?: (ws: WebSocket) => void;
  /** Handler for close event, no matter if error, timeout or graceful close. You may not use WebSocket after this event. Do not send on this WebSocket from within here, it is closed. */
  close?: (ws: WebSocket, code: number, message: ArrayBuffer) => void;
  /** Handler for received ping control message. You do not need to handle this, pong messages are automatically sent as per the standard. */
  ping?: (ws: WebSocket, message: ArrayBuffer) => void;
  /** Handler for received pong control message. */
  pong?: (ws: WebSocket, message: ArrayBuffer) => void;
}

/** A WebSocket connection that is valid from open to close event.
 * Read more about this in the user manual.
 */
export interface WebSocket {
  /** Sends a message. Returns 1 for success, 2 for dropped due to backpressure limit, and 0 for built up backpressure that will drain over time. You can check backpressure before or after sending by calling getBufferedAmount().
   *
   * Make sure you properly understand the concept of backpressure. Check the backpressure example file.
   */
  send(message: RecognizedString, isBinary?: boolean, compress?: boolean): number;
  /** Returns the bytes buffered in backpressure. This is similar to the bufferedAmount property in the browser counterpart.
   * Check backpressure example.
   */
  getBufferedAmount(): number;
  /** Gracefully closes this WebSocket. Immediately calls the close handler.
   * A WebSocket close message is sent with code and shortMessage.
   */
  end(code?: number, shortMessage?: RecognizedString): void;
  /** Forcefully closes this WebSocket. Immediately calls the close handler.
   * No WebSocket close message is sent.
   */
  close(): void;
  /** Sends a ping control message. Returns sendStatus similar to WebSocket.send (regarding backpressure). This helper function correlates to WebSocket::send(message, uWS::OpCode::PING, ...) in C++. */
  ping(message?: RecognizedString): number;
  /** Subscribe to a topic. */
  subscribe(topic: RecognizedString): boolean;
  /** Unsubscribe from a topic. Returns true on success, if the WebSocket was subscribed. */
  unsubscribe(topic: RecognizedString): boolean;
  /** Returns whether this websocket is subscribed to topic. */
  isSubscribed(topic: RecognizedString): boolean;
  /** Returns a list of topics this websocket is subscribed to. */
  getTopics(): string[];
  /** Publish a message under topic. Backpressure is managed according to maxBackpressure, closeOnBackpressureLimit settings.
   * Order is guaranteed since v20.
   */
  publish(topic: RecognizedString, message: RecognizedString, isBinary?: boolean, compress?: boolean): boolean;
  /** See HttpResponse.cork. Takes a function in which the socket is corked (packing many sends into one single syscall/SSL block) */
  cork(cb: () => void): WebSocket;
  /** Returns the remote IP address. Note that the returned IP is binary, not text.
   *
   * IPv4 is 4 byte long and can be converted to text by printing every byte as a digit between 0 and 255.
   * IPv6 is 16 byte long and can be converted to text in similar ways, but you typically print digits in HEX.
   *
   * See getRemoteAddressAsText() for a text version.
   */
  getRemoteAddress(): ArrayBuffer;
  /** Returns the remote IP address as text. See RecognizedString. */
  getRemoteAddressAsText(): ArrayBuffer;
  /** Arbitrary user data may be attached to this object. In C++ this is done by using getUserData(). */
  [key: string]: any;
}
