import type { Role } from "$lib/server/db/schema";
import type { RateLimit } from "@cloudflare/workers-types";

declare global {
  namespace App {
    interface Locals {
      user: import("better-auth").User | null;
      session: import("better-auth").Session | null;
      role: Role | null;
    }
    interface Platform {
      env: {
        AUTH_RATE_LIMITER: RateLimit;
        API_RATE_LIMITER: RateLimit;
      };
    }
  }
}

export {};
