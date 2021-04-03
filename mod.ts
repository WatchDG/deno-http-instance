import { request, ResultFail, ResultOk } from "./deps.ts";
import type { ResultFAIL, ResultOK } from "./deps.ts";

type Options = {
  baseUrl: URL;
  headers?: HeadersInit;
};

type RequestOptions = {
  headers?: HeadersInit;
};

type PrepareURLOptions = {
  path: string;
};

type Response<ResponseType> = {
  status: number;
  headers: Headers;
  data?: ResponseType;
};

export class Instance {
  private readonly baseUrl: URL;
  private readonly headers: Headers;

  constructor(options: Options) {
    const { baseUrl } = options;
    this.baseUrl = baseUrl;
    this.headers = new Headers(options.headers ?? {});
  }

  private static prepareURL(
    url: URL,
    options: PrepareURLOptions,
  ): URL {
    const newUrl = new URL(url.toString());
    newUrl.pathname += options.path;
    return newUrl;
  }

  private static parseBody<ResponseType>(
    headers: Headers,
    body?: ArrayBuffer,
  ): ResultOK<ResponseType> | ResultFAIL<Error> {
    try {
      const contentType = headers.get("content-type");
      console.log(contentType);
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
      const url = Instance.prepareURL(this.baseUrl, { path });
      const _headers = new Headers(
        Object.assign(this.headers, options.headers),
      );
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
