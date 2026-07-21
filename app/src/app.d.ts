import type { Role } from "$lib/server/db/schema";

declare global {
  namespace App {
    interface Locals {
      user: import("better-auth").User | null;
      session: import("better-auth").Session | null;
      role: Role | null;
    }
  }
}

export {};
