import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { SITE_URL } from "../lib/seo";

const BASE_URL = SITE_URL.replace(/\/$/, "");

interface SitemapEntry {
  path: string;
  changefreq?: "weekly" | "monthly";
  priority?: string;
  lastmod?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/produtos", changefreq: "weekly", priority: "0.9" },
          { path: "/servicos", changefreq: "monthly", priority: "0.8" },
          { path: "/corte-e-dobra", changefreq: "weekly", priority: "0.95" },
          { path: "/armaduras-prontas", changefreq: "weekly", priority: "0.9" },
          { path: "/solucoes-para-construtoras", changefreq: "monthly", priority: "0.85" },
          { path: "/vergalhao-ca-50", changefreq: "weekly", priority: "0.85" },
          { path: "/entrega-de-aco", changefreq: "monthly", priority: "0.8" },
          { path: "/consultoria-tecnica", changefreq: "monthly", priority: "0.75" },
          { path: "/orcamento-de-aco", changefreq: "weekly", priority: "0.95" },
          { path: "/sobre", changefreq: "monthly", priority: "0.6" },
          { path: "/contato", changefreq: "monthly", priority: "0.7" },
        ];

        const urls = entries
          .map(
            (e) =>
              `  <url>\n    <loc>${BASE_URL}${e.path}</loc>${e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : ""}\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`,
          )
          .join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
