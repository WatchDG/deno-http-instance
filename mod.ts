import { ok, request, tryCatch, tryCatchAsync } from "./deps.ts";
import type { Result, ResultAsync } from "./deps.ts";

type Options = {
  baseUrl: URL;
  headers?: HeadersInit;
  params?: URLSearchParams;
};

type RequestOptions = {
  headers?: HeadersInit;
  params?: URLSearchParams;
};

type PrepareURLOptions = {
  path: string;
  params: URLSearchParams;
};

type Response<ResponseType> = {
  status: number;
  headers: Headers;
  data?: ResponseType;
};

export class Instance {
  private readonly baseUrl: URL;
  private readonly headers: Headers;
  private readonly params: URLSearchParams;

  constructor(options: Options) {
    const { baseUrl } = options;
    this.baseUrl = baseUrl;
    this.headers = new Headers(options.headers ?? {});
    this.params = new URLSearchParams(options.params ?? {});
  }

  private static prepareURL(
    url: URL,
    options: PrepareURLOptions,
  ): URL {
    const newUrl = new URL(url.toString());
    newUrl.pathname += options.path;
    newUrl.search = options.params.toString();
    return newUrl;
  }

  @tryCatch
  private static parseBody<ResponseType>(
    headers: Headers,
    body?: ArrayBuffer,
  ): Result<ResponseType, Error> {
    const contentType = headers.get("content-type");
    if (body && contentType) {
      if (contentType.includes("text/html")) {
        const textDecoder = new TextDecoder();
        return ok(textDecoder.decode(body) as unknown as ResponseType);
      }
      if (contentType.includes("application/json")) {
        const textDecoder = new TextDecoder();
        return ok(JSON.parse(textDecoder.decode(body)));
      }
    }
    return ok(void 0 as unknown as ResponseType);
  }

  @tryCatchAsync
  async get<ResponseType>(
    path: string,
    options: RequestOptions = {},
  ): ResultAsync<Response<ResponseType>, Error> {
    const _params = new URLSearchParams(
      Object.assign(
        Object.fromEntries(
          options.params?.entries() ?? new URLSearchParams().entries(),
        ),
        Object.fromEntries(this.params.entries()),
      ),
    );
    const _headers = new Headers(
      Object.assign(this.headers, options.headers),
    );
    const url = Instance.prepareURL(this.baseUrl, {
      path,
      params: _params,
    });
    const { status, headers, body } = (await request(url.toString(), {
      method: "GET",
      headers: _headers,
    })).unwrap();
    const data = (await Instance.parseBody<ResponseType>(headers, body))
      .unwrap();
    return ok({ status, headers, data });
  }
}
