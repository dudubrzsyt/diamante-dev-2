import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { ContactForm } from "@/components/ContactForm";
import { Truck, Ruler, Hammer, ShieldCheck, Scissors, ClipboardList, Factory, Fuel, Warehouse } from "lucide-react";
import workerImg from "@/assets/services-worker.jpg";
import { absoluteUrl, breadcrumbSchema, serviceSchema } from "@/lib/seo";

export const Route = createFileRoute("/servicos")({
  head: () => ({
    meta: [
      { title: "Serviços industriais — BLL do Brasil" },
      { name: "description", content: "Corte e dobra de chapas, perfis especiais, canaletas para postos, porta-paletes e estruturas metálicas sob medida." },
      { property: "og:title", content: "Serviços industriais — BLL do Brasil" },
      { property: "og:description", content: "Soluções sob medida em corte, dobra e fabricação de estruturas metálicas." },
      { property: "og:url", content: absoluteUrl("/servicos") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/servicos") }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          breadcrumbSchema([{ name: "Início", path: "/" }, { name: "Serviços", path: "/servicos" }]),
          serviceSchema("Corte, dobra e fabricação de estruturas metálicas", "Serviços de corte e dobra de chapas, perfis especiais, canaletas para postos e estruturas porta-paletes sob medida.", "/servicos"),
        ],
      }),
    }],
  }),
  component: Servicos,
});

const SERVICOS = [
  { i: Scissors, t: "Corte de chapas", d: "Corte de chapas metálicas com alta precisão para estruturas, equipamentos industriais, construção civil, componentes especiais e projetos personalizados." },
  { i: Ruler, t: "Dobra de chapas", d: "Dobra de chapas com elevado padrão de qualidade para peças e componentes de diferentes dimensões." },
  { i: Factory, t: "Perfis especiais", d: "Desenvolvimento e fabricação de perfis personalizados para construção civil, indústria, logística, infraestrutura e agronegócio." },
  { i: Fuel, t: "Canaletas para postos", d: "Canaletas metálicas sob medida para drenagem, áreas de abastecimento e pistas de circulação." },
  { i: Warehouse, t: "Porta-paletes", d: "Fabricação de estruturas para armazenamento industrial, com soluções convencionais, personalizadas e expansões." },
  { i: ClipboardList, t: "Armaduras sob medida", d: "Produção de armaduras montadas em fábrica para lajes, pilares, vigas e blocos, conforme o projeto." },
  { i: Truck, t: "Entrega industrial", d: "Fabricação, separação e entrega programada para clientes industriais, comerciais, logísticos e da construção civil." },
  { i: ShieldCheck, t: "Qualidade e precisão", d: "Conferência técnica, fabricação sob medida e compromisso com a qualidade e o prazo de cada projeto." },
  { i: Hammer, t: "Logística sob medida", d: "Planejamento de produção e entregas para reduzir desperdícios, esperas e estoque parado." },
];

const SEGMENTOS = ["Indústrias", "Centros logísticos", "Distribuidoras", "Construção civil", "Postos de combustíveis", "Comércio e serviços"];

function Servicos() {
  return (
    <PageShell
      eyebrow="Serviços"
      title={<>Mais que matéria prima. <span className="text-gradient-yellow">Solução completa.</span></>}
      description="Do projeto à entrega, atuamos como extensão da sua obra. Equipe técnica, frota e fábrica de corte e dobra."
    >
      <section className="mx-auto max-w-7xl px-6">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {SERVICOS.map((s, i) => (
            <div
              key={s.t}
              style={{ animationDelay: `${i * 70}ms` }}
              className="group glass animate-slam rounded-3xl p-7 transition-transform hover:-translate-y-1"
            >
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-yellow text-brand-black transition-transform group-hover:scale-110">
                <s.i size={26} strokeWidth={2.5} />
              </div>
              <h3 className="mt-6 text-2xl font-black">{s.t}</h3>
              <p className="mt-2 text-sm font-bold text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-7xl px-3 sm:px-6">
        <div className="grid gap-8 rounded-3xl border border-brand-yellow/25 bg-brand-yellow/10 p-6 sm:p-10 md:grid-cols-[1fr_1.2fr] md:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-brand-yellow">BLL do Brasil</p>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">Soluções em corte, dobra e fabricação de estruturas metálicas.</h2>
            <p className="mt-4 text-sm font-bold leading-relaxed text-muted-foreground">Atendemos projetos sob medida com qualidade, precisão e cumprimento de prazos.</p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-brand-yellow">Segmentos atendidos</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {SEGMENTOS.map((segmento) => <p key={segmento} className="flex items-center gap-3 text-sm font-black"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-yellow text-brand-black">✓</span>{segmento}</p>)}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-7xl px-6">
        <div className="grid items-center gap-10 overflow-hidden rounded-3xl border border-white/10 bg-card md:grid-cols-2">
          <div className="relative h-[40vh] md:h-[60vh]">
            <img src={workerImg} alt="Profissional da Nova Bll do Brasil" loading="lazy" width={1280} height={960} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/30 to-transparent md:bg-gradient-to-r" />
          </div>
          <div className="p-8 md:p-12">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-brand-yellow">Processo</p>
            <h3 className="mt-3 text-4xl font-black leading-tight md:text-5xl">Do pedido à obra em <span className="text-gradient-yellow">24 horas</span>.</h3>
            <ol className="mt-8 space-y-5">
              {[
                "Cotação personalizada em até 1h útil",
                "Conferência técnica e validação do pedido",
                "Corte, dobra e separação na fábrica",
                "Entrega programada com Munck na obra",
              ].map((step, i) => (
                <li key={step} className="flex items-start gap-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-yellow text-sm font-black text-brand-black">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="pt-1.5 text-sm font-bold">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-16 grid max-w-7xl gap-4 px-3 sm:mt-20 sm:grid-cols-2 sm:px-6">
        <Link to="/corte-e-dobra" className="glass group rounded-2xl p-6 transition-transform hover:-translate-y-1 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-brand-yellow">Mais procurado</p>
          <h2 className="mt-3 text-2xl font-black">Corte e dobra sob medida</h2>
          <p className="mt-2 text-sm font-bold leading-relaxed text-muted-foreground">Receba o aço pronto para montar, com menos desperdício e mais produtividade.</p>
          <span className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-brand-yellow group-hover:text-brand-black">Conhecer serviço <span aria-hidden>→</span></span>
        </Link>
        <Link to="/armaduras-prontas" className="glass group rounded-2xl p-6 transition-transform hover:-translate-y-1 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-brand-yellow">Para obras organizadas</p>
          <h2 className="mt-3 text-2xl font-black">Armaduras prontas</h2>
          <p className="mt-2 text-sm font-bold leading-relaxed text-muted-foreground">Peças identificadas e separadas conforme o avanço da sua obra.</p>
          <span className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-brand-yellow group-hover:text-brand-black">Ver solução <span aria-hidden>→</span></span>
        </Link>
      </section>

      <section className="mx-auto mt-24 max-w-4xl px-6 pb-16">
        <ContactForm title="Solicite um orçamento de serviço" subtitle="Descreva sua necessidade. Equipe técnica retorna no mesmo dia." />
      </section>
    </PageShell>
  );
}
