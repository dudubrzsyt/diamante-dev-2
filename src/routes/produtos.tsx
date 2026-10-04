import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { ContactForm } from "@/components/ContactForm";
import productsImg from "@/assets/products-steel.jpg";
import { absoluteUrl, breadcrumbSchema, itemListSchema } from "@/lib/seo";

export const Route = createFileRoute("/produtos")({
  head: () => ({
    meta: [
      { title: "Produtos de ferro e aço — BLL do Brasil" },
      { name: "description", content: "Vergalhões, chapas, perfis especiais, canaletas metálicas, porta-paletes, telas e treliças para indústria e construção." },
      { property: "og:title", content: "Produtos de ferro e aço — BLL do Brasil" },
      { property: "og:description", content: "Catálogo de ferro, aço e estruturas metálicas sob medida." },
      { property: "og:url", content: absoluteUrl("/produtos") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/produtos") }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          breadcrumbSchema([{ name: "Início", path: "/" }, { name: "Produtos", path: "/produtos" }]),
          itemListSchema(PRODUTOS.map((product) => ({ name: product.t, description: product.d })), "/produtos"),
        ],
      }),
    }],
  }),
  component: Produtos,
});

const PRODUTOS = [
  { t: "Vergalhão CA-50", d: "Aço nervurado para concreto armado. Bitolas de 5 a 32mm.", tag: "Mais vendido" },
  { t: "Vergalhão CA-60", d: "Aço trefilado para estribos e armaduras secundárias.", tag: null },
  { t: "Perfil U / Cantoneira", d: "Perfis laminados a quente para estruturas metálicas.", tag: null },
  { t: "Tela soldada", d: "Tela Q92 a Q503 para pisos, lajes e contrapisos.", tag: null },
  { t: "Treliça TR", d: "Treliças TR para lajes pré-fabricadas. Diversas alturas.", tag: "Pronta entrega" },
  { t: "Chapas de aço", d: "Chapas pretas, galvanizadas e xadrez em várias espessuras.", tag: null },
  { t: "Perfis especiais", d: "Perfis personalizados fabricados conforme a necessidade do projeto.", tag: "Sob medida" },
  { t: "Canaletas metálicas", d: "Canaletas resistentes para drenagem e infraestrutura de postos de combustíveis.", tag: null },
  { t: "Estruturas porta-paletes", d: "Soluções convencionais e personalizadas para armazenamento industrial.", tag: null },
  { t: "Tubos industriais", d: "Tubos redondos, quadrados e retangulares.", tag: null },
  { t: "Arame recozido", d: "Arame 18 BWG para amarração e construção em geral.", tag: null },
];

function Produtos() {
  return (
    <PageShell
      eyebrow="Catálogo"
      title={<>Tudo em <span className="text-gradient-yellow">ferro e aço</span></>}
      description="Além do estoque de ferro e aço, a BLL do Brasil fabrica perfis especiais, canaletas para postos e estruturas porta-paletes sob medida."
    >
      <section className="mx-auto max-w-7xl px-6">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {PRODUTOS.map((p, i) => (
            <article
              key={p.t}
              style={{ animationDelay: `${i * 60}ms` }}
              className="group glass animate-slam relative overflow-hidden rounded-3xl p-7 transition-transform hover:-translate-y-1"
            >
              {p.tag && (
                <span className="absolute right-4 top-4 rounded-full bg-brand-yellow px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-brand-black">
                  {p.tag}
                </span>
              )}
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-yellow/15 text-brand-yellow ring-1 ring-brand-yellow/40">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="9" width="18" height="6" rx="1" />
                  <path d="M3 12h18" />
                </svg>
              </div>
              <h3 className="mt-5 text-2xl font-black">{p.t}</h3>
              <p className="mt-2 text-sm font-bold text-muted-foreground">{p.d}</p>
              <p className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-brand-yellow">
                Solicitar cotação →
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative mx-auto mt-24 max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-3xl border border-white/10">
          <img src={productsImg} alt="Estoque" loading="lazy" width={1280} height={960} className="h-[40vh] w-full object-cover md:h-[55vh]" />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-transparent" />
          <div className="absolute bottom-8 left-6 right-6 max-w-xl text-white sm:left-8 sm:right-auto">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-brand-yellow drop-shadow-sm">Capacidade</p>
            <h3 className="mt-2 text-3xl font-black md:text-5xl">+12 mil toneladas em estoque</h3>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-4xl px-6 pb-16">
        <ContactForm
          title="Cotação personalizada"
          subtitle="Informe os itens e quantidades. Retornamos em até 24h úteis com preço fechado."
        />
      </section>
    </PageShell>
  );
}
