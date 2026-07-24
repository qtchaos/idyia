import { auth } from "$lib/server/auth";
import { getUserRole } from "$lib/server/queries";
import type { Handle } from "@sveltejs/kit";

// Cloudflare Rate Limiting bindings (declared in wrangler.toml). Undefined
// outside of the Cloudflare runtime (e.g. local `vite preview` without
// wrangler), in which case throttling is skipped rather than failing closed.
function pickLimiter(event: Parameters<Handle>[0]["event"]) {
  const { pathname } = event.url;
  if (pathname.startsWith("/api/auth/")) return event.platform?.env?.AUTH_RATE_LIMITER;
  if (pathname.startsWith("/api/companies") || pathname === "/sitemap.xml") {
    return event.platform?.env?.API_RATE_LIMITER;
  }
  // Form actions (?/create, ?/addAlternative, etc.) are all POSTs and don't
  // go through /api/, but are just as spammable — throttle them too.
  if (
    event.request.method === "POST" &&
    (pathname.startsWith("/submit") ||
      pathname.startsWith("/companies/") ||
      pathname.startsWith("/admin/"))
  ) {
    return event.platform?.env?.WRITE_RATE_LIMITER;
  }
  return undefined;
}

export const handle: Handle = async ({ event, resolve }) => {
  const limiter = pickLimiter(event);
  if (limiter) {
    const { success } = await limiter.limit({ key: event.getClientAddress() });
    if (!success) {
      return new Response("Too many requests", { status: 429 });
    }
  }

  const session = await auth.api.getSession({ headers: event.request.headers });

  if (session) {
    event.locals.user = session.user;
    event.locals.session = session.session;
    event.locals.role = await getUserRole(session.user.id);
  } else {
    event.locals.user = null;
    event.locals.session = null;
    event.locals.role = null;
  }

  return resolve(event);
};
