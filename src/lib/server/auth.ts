import { env } from "$env/dynamic/private";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { captcha } from "better-auth/plugins";
import { db } from "./db/index";
import * as schema from "./db/schema";

// Defer betterAuth() initialization to the first request, same pattern as db.
// betterAuth() throws at module-eval time when BETTER_AUTH_SECRET isn't in the
// build environment (SvelteKit's post-build analyse phase).
let _auth: ReturnType<typeof betterAuth> | undefined;

function getAuth() {
  if (!_auth) {
    _auth = betterAuth({
      database: drizzleAdapter(db, {
        provider: "sqlite",
        schema: {
          user: schema.user,
          session: schema.session,
          account: schema.account,
          verification: schema.verification,
        },
      }),
      emailAndPassword: {
        enabled: true,
      },
      socialProviders: {
        discord: {
          clientId: env.DISCORD_CLIENT_ID ?? "",
          clientSecret: env.DISCORD_CLIENT_SECRET ?? "",
        },
      },
      plugins: env.TURNSTILE_SECRET_KEY
        ? [captcha({ provider: "cloudflare-turnstile", secretKey: env.TURNSTILE_SECRET_KEY })]
        : [],
      trustedOrigins: ["http://localhost:5173", "https://localhost:5174"],
    });
  }
  return _auth;
}

export const auth = new Proxy({} as ReturnType<typeof betterAuth>, {
  get(_target, prop, receiver) {
    return Reflect.get(getAuth() as object, prop, receiver);
  },
});
