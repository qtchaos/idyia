import { type Static, type TSchema, Type, FormatRegistry } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { error } from "@sveltejs/kit";

// ─── URL format ───────────────────────────────────────────────────────────────
// Restricts submitted URLs to http/https so they can't carry a `javascript:`
// (or other) payload into an <a href> / <img src> that admins/moderators click
// while reviewing submissions.
if (!FormatRegistry.Has("http-url")) {
  FormatRegistry.Set("http-url", (value) => {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  });
}

// ─── Shared value schemas ─────────────────────────────────────────────────────

export const CompanyTypeSchema = Type.Union([
  Type.Literal("restaurant"),
  Type.Literal("food"),
  Type.Literal("saas"),
  Type.Literal("government"),
  Type.Literal("institution"),
  Type.Literal("retail"),
  Type.Literal("finance"),
  Type.Literal("healthcare"),
  Type.Literal("media"),
  Type.Literal("education"),
  Type.Literal("other"),
]);

export const CompanySizeSchema = Type.Union([
  Type.Literal("A"),
  Type.Literal("B"),
  Type.Literal("C"),
  Type.Literal("D"),
  Type.Literal("E"),
  Type.Literal("F"),
  Type.Literal("G"),
  Type.Literal("H"),
  Type.Literal("I"),
]);

export const RoleSchema = Type.Union([
  Type.Literal("contributor"),
  Type.Literal("trusted_contributor"),
  Type.Literal("moderator"),
  Type.Literal("admin"),
]);

// ─── Request schemas ──────────────────────────────────────────────────────────

export const CompaniesQuerySchema = Type.Object({
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 50 })),
  offset: Type.Optional(Type.Integer({ minimum: 0, default: 0 })),
  sort: Type.Optional(
    Type.Union(
      [
        Type.Literal("name"),
        Type.Literal("company_type"),
        Type.Literal("company_size"),
        Type.Literal("created_at"),
      ],
      { default: "created_at" },
    ),
  ),
  dir: Type.Optional(Type.Union([Type.Literal("asc"), Type.Literal("desc")], { default: "desc" })),
  q: Type.Optional(Type.String({ maxLength: 200 })),
  type: Type.Optional(Type.String({ maxLength: 50 })),
  size: Type.Optional(Type.String({ maxLength: 10 })),
  country: Type.Optional(Type.String({ maxLength: 100 })),
});

export const SearchQuerySchema = Type.Object({
  q: Type.Optional(Type.String({ maxLength: 200, default: "" })),
});

// Nullable + optional: the field may be absent (don't update) or explicitly null (clear it)
const NullableStr = (max: number) =>
  Type.Optional(Type.Union([Type.String({ maxLength: max }), Type.Null()]));
const NullableUrl = (max: number) =>
  Type.Optional(Type.Union([Type.String({ maxLength: max, format: "http-url" }), Type.Null()]));

export const CompanyPatchSchema = Type.Object({
  status: Type.Optional(Type.Union([Type.Literal("approved"), Type.Literal("rejected")])),
  name: NullableStr(255),
  registeredName: NullableStr(255),
  registryUrl: NullableUrl(500),
  website: NullableUrl(500),
  companyType: Type.Optional(CompanyTypeSchema),
  description: NullableStr(2000),
  companySize: Type.Optional(CompanySizeSchema),
  country: NullableStr(100),
  imageUrl: NullableUrl(500),
  imageOrigin: NullableUrl(500),
});

export const UserPatchSchema = Type.Object({
  role: RoleSchema,
});

const Str = (max: number) => Type.String({ minLength: 1, maxLength: max });
const OptStr = (max: number) => Type.Optional(Type.String({ maxLength: max }));
const UrlStr = (max: number) => Type.String({ minLength: 1, maxLength: max, format: "http-url" });
const OptUrlStr = (max: number) => Type.Optional(Type.String({ maxLength: max, format: "http-url" }));

export const CompanyCreateSchema = Type.Object({
  name: Str(255),
  website: UrlStr(500),
  companyType: CompanyTypeSchema,
  description: Str(2000),
  companySize: CompanySizeSchema,
  country: OptStr(100),
  registeredName: OptStr(255),
  registryUrl: OptUrlStr(500),
  imageOrigin: OptUrlStr(500),
});

export const CompanyAmendSchema = Type.Object({
  companyId: Str(36),
  description: OptStr(2000),
  imageOrigin: OptUrlStr(500),
});

// ─── Exported static types ────────────────────────────────────────────────────

export type CompaniesQuery = Static<typeof CompaniesQuerySchema>;
export type CompanyPatch = Static<typeof CompanyPatchSchema>;
export type UserPatch = Static<typeof UserPatchSchema>;
export type CompanyCreate = Static<typeof CompanyCreateSchema>;
export type CompanyAmend = Static<typeof CompanyAmendSchema>;

// ─── Validation helpers ───────────────────────────────────────────────────────

/**
 * Validate data against a TypeBox schema.
 * Applies schema defaults then coerces types (e.g. "50" → 50) before checking.
 * Throws `error(400, "<field>: <message>")` on the first validation failure.
 */
export function validate<T extends TSchema>(schema: T, data: unknown): Static<T> {
  const value = Value.Convert(schema, Value.Default(schema, data ?? {}));
  if (!Value.Check(schema, value)) {
    const [first] = Value.Errors(schema, value);
    const field = first.path.replace(/^\//, "") || "body";
    throw error(400, `${field}: ${first.message}`);
  }
  return value as Static<T>;
}

/**
 * Like `validate`, but returns a result object instead of throwing.
 * Intended for SvelteKit form actions that use `return fail()`.
 */
export function validateForm<T extends TSchema>(
  schema: T,
  data: unknown,
): { ok: true; value: Static<T> } | { ok: false; error: string } {
  const value = Value.Convert(schema, Value.Default(schema, data ?? {}));
  if (!Value.Check(schema, value)) {
    const [first] = Value.Errors(schema, value);
    const field = first.path.replace(/^\//, "") || "body";
    return { ok: false, error: `${field}: ${first.message}` };
  }
  return { ok: true, value: value as Static<T> };
}

/**
 * Convert a `FormData` instance to a plain object for use with `validate` / `validateForm`.
 * Empty strings are converted to `undefined` so optional schema fields work correctly.
 */
export function fromFormData(data: FormData): Record<string, string | undefined> {
  const result: Record<string, string | undefined> = {};
  for (const [key, val] of data.entries()) {
    if (typeof val === "string") {
      result[key] = val.trim() || undefined;
    }
  }
  return result;
}
