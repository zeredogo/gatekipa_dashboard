import { NextRequest } from "next/server";
import { proxy, config as proxyConfig } from "./proxy";

// Next.js requires the middleware entry point to be named `middleware`
// and the matcher to be exported as `config` from this exact file.
export function middleware(req: NextRequest) {
  return proxy(req);
}

export const config = proxyConfig;
