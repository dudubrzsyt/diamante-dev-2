import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import logoImg from "../assets/logo.jpeg";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { absoluteUrl, ORGANIZATION_ID, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "../lib/seo";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { FloatingBubbles } from "../components/FloatingBubbles";
import { AnalyticsTracker } from "../components/AnalyticsTracker";
import { Analytics } from "@vercel/analytics/react"


function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-black text-brand-yellow">404</h1>
        <h2 className="mt-4 text-xl font-black uppercase tracking-wider">Página não encontrada</h2>
        <p className="mt-2 text-sm font-bold text-muted-foreground">
          O conteúdo que você procura foi movido ou não existe mais.
        </p>
        <div className="mt-6">
          <Link to="/" className="btn-hero btn-hero-hover">Voltar ao início</Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-black uppercase tracking-wider">Algo deu errado</h1>
        <p className="mt-2 text-sm font-bold text-muted-foreground">
          Tente recarregar ou voltar para a página inicial.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="btn-hero btn-hero-hover"
          >
            Tentar novamente
          </button>
          <a href="/" className="btn-ghost-yellow">Início</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${SITE_NAME} — Corte, dobra e estruturas metálicas` },
      { name: "description", content: SITE_DESCRIPTION },
      { name: "author", content: SITE_NAME },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { name: "googlebot", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { property: "og:title", content: `${SITE_NAME} — Corte, dobra e estruturas metálicas` },
      { property: "og:description", content: SITE_DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: absoluteUrl("/") },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:image", content: absoluteUrl(logoImg) },
      { property: "og:image:alt", content: "Logo BLL do Brasil" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: `${SITE_NAME} — Corte, dobra e estruturas metálicas` },
      { name: "twitter:description", content: SITE_DESCRIPTION },
      { name: "twitter:image", content: absoluteUrl(logoImg) },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: logoImg },
      { rel: "canonical", href: absoluteUrl("/") },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": ORGANIZATION_ID,
              name: SITE_NAME,
              url: SITE_URL,
              logo: absoluteUrl(logoImg),
              description: SITE_DESCRIPTION,
              email: "vendas@blldobrasil.com.be",
              areaServed: "BR",
              sameAs: ["https://www.instagram.com/novablldobrasil/?hl=en"],
            },
            {
              "@type": "LocalBusiness",
              "@id": `${SITE_URL}/#localbusiness`,
              parentOrganization: { "@id": ORGANIZATION_ID },
              name: SITE_NAME,
              url: SITE_URL,
              image: absoluteUrl(logoImg),
              telephone: "+55-11-5522-9775",
              email: "vendas@blldobrasil.com.br",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Av. Das Nações Unidas, 20925",
                addressLocality: "São Paulo",
                addressRegion: "SP",
                addressCountry: "BR",
              },
              areaServed: "Brasil",
              priceRange: "$$",
              knowsAbout: ["Corte de chapas", "Dobra de chapas", "Perfis especiais", "Canaletas para postos de combustíveis", "Porta-paletes"],
            },
            {
              "@type": "WebSite",
              name: SITE_NAME,
              url: SITE_URL,
              inLanguage: "pt-BR",
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Header />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
      <FloatingBubbles />
      <AnalyticsTracker />
      <Analytics /> 
    </QueryClientProvider>
    
  );
}
