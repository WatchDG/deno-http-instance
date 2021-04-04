export {
  ResultOk,
  tryCatch,
  tryCatchAsync,
} from "https://deno.land/x/result@3.1.3/mod.ts";
import { types } from "https://deno.land/x/result@3.1.3/mod.ts";
export type Result<DataType, ErrorType> = types.Result<DataType, ErrorType>;
export type ResultAsync<DataType, ErrorType> = types.ResultAsync<
  DataType,
  ErrorType
>;
export { request } from "https://deno.land/x/http_request@2.1.0/mod.ts";
