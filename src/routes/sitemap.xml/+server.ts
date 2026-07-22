import { getAllApprovedCompanies } from "$lib/server/queries";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url }) => {
  const origin = url.origin;
  const companies = await getAllApprovedCompanies();

  const entries = companies
    .map((c) => {
      const lastmod = c.updatedAt ? new Date(c.updatedAt).toISOString().split("T")[0] : undefined;
      return [
        `  <url>`,
        `    <loc>${origin}/companies/${c.id}</loc>`,
        lastmod ? `    <lastmod>${lastmod}</lastmod>` : "",
        `    <changefreq>monthly</changefreq>`,
        `  </url>`,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${origin}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${entries}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
