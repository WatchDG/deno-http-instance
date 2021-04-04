import { request, ResultFail, ResultOk } from "./deps.ts";
import type { ResultFAIL, ResultOK } from "./deps.ts";

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

  private static parseBody<ResponseType>(
    headers: Headers,
    body?: ArrayBuffer,
  ): ResultOK<ResponseType> | ResultFAIL<Error> {
    try {
      const contentType = headers.get("content-type");
      if (body && contentType) {
        if (contentType.includes("text/html")) {
          const textDecoder = new TextDecoder();
          return ResultOk(textDecoder.decode(body) as unknown as ResponseType);
        }
        if (contentType.includes("application/json")) {
          const textDecoder = new TextDecoder();
          return ResultOk(JSON.parse(textDecoder.decode(body)));
        }
      }
      return ResultOk(void 0 as unknown as ResponseType);
    } catch (error) {
      return ResultOk(error);
    }
  }

  async get<ResponseType>(
    path: string,
    options: RequestOptions = {},
  ): Promise<ResultOK<Response<ResponseType>> | ResultFAIL<Error>> {
    try {
      const _params = new URLSearchParams(
        Object.assign(this.params, options.params),
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
      return ResultOk({ status, headers, data });
    } catch (error) {
      return ResultFail(error);
    }
  }
}
