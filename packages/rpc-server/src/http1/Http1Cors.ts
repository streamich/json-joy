import type * as http from 'http';

export interface CorsOpts {
  /**
   * Value of the `Access-Control-Allow-Origin` header, `'*'` by default. Set to
   * `true` to echo back the request `Origin` header instead, which is what
   * browsers require when credentials are enabled.
   */
  origin?: string | true;

  /** Value of `Access-Control-Allow-Methods`, sent on preflight responses. */
  methods?: string;

  /**
   * Value of `Access-Control-Allow-Headers`, sent on preflight responses. Must
   * list `Content-Type`: the `application/x.rpc.*` media types this server
   * negotiates are not CORS-safelisted, so the preflight fails without it.
   */
  headers?: string;

  /** Value of `Access-Control-Expose-Headers`. Omitted when empty. */
  expose?: string;

  /** Whether to send `Access-Control-Allow-Credentials: true`. */
  credentials?: boolean;

  /** Value of `Access-Control-Max-Age`, in seconds. Defaults to 86400. */
  maxAge?: number;
}

const DEFAULT_METHODS = 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
const DEFAULT_HEADERS = 'Content-Type, Authorization';

export class Http1Cors {
  public readonly origin: string;
  public readonly echo: boolean;
  public readonly credentials: boolean;
  public readonly methods: string;
  public readonly headers: string;
  public readonly expose: string;
  public readonly maxAge: string;

  constructor(opts: CorsOpts = {}) {
    const credentials = !!opts.credentials;
    const origin = opts.origin ?? '*';
    // Browsers reject a wildcard origin on a credentialed response.
    const echo = origin === true || (credentials && origin === '*');
    this.echo = echo;
    this.origin = echo ? '' : (origin as string);
    this.credentials = credentials;
    this.methods = opts.methods ?? DEFAULT_METHODS;
    this.headers = opts.headers ?? DEFAULT_HEADERS;
    this.expose = opts.expose ?? '';
    this.maxAge = String(opts.maxAge ?? 86400);
  }

  /** Headers every cross-origin response needs, preflight or not. */
  public apply(req: http.IncomingMessage, res: http.ServerResponse): void {
    let origin = this.origin;
    if (this.echo) {
      const header = req.headers.origin;
      if (typeof header !== 'string') return;
      origin = header;
      const vary = res.getHeader('Vary');
      res.setHeader('Vary', vary ? vary + ', Origin' : 'Origin');
    }
    res.setHeader('Access-Control-Allow-Origin', origin);
    if (this.credentials) res.setHeader('Access-Control-Allow-Credentials', 'true');
    const expose = this.expose;
    if (expose) res.setHeader('Access-Control-Expose-Headers', expose);
  }

  /** Headers only a preflight response needs, on top of {@link Http1Cors.apply}. */
  public preflight(res: http.ServerResponse): void {
    res.setHeader('Access-Control-Allow-Methods', this.methods);
    res.setHeader('Access-Control-Allow-Headers', this.headers);
    res.setHeader('Access-Control-Max-Age', this.maxAge);
  }
}
