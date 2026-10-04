import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { ContactForm } from "@/components/ContactForm";
import aboutImg from "@/assets/about-warehouse.jpg";
import { absoluteUrl } from "@/lib/seo";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Quem Somos — BLL do Brasil" },
      { name: "description", content: "A BLL do Brasil oferece corte e dobra de chapas, perfis especiais, canaletas para postos e estruturas para armazenamento industrial." },
      { property: "og:title", content: "Quem Somos — BLL do Brasil" },
      { property: "og:description", content: "Soluções sob medida em corte, dobra e fabricação de estruturas metálicas." },
      { property: "og:url", content: absoluteUrl("/sobre") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/sobre") }],
  }),
  component: Sobre,
});

function Sobre() {
  return (
    <PageShell
      eyebrow="Quem somos"
      title={<>Soluções que transformam <span className="text-gradient-yellow">metal em resultado.</span></>}
      description="A BLL do Brasil é especializada em corte e dobra de chapas metálicas, fabricação de perfis especiais, canaletas para postos de combustíveis e estruturas para armazenamento industrial."
    >
      <section className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className="relative overflow-hidden rounded-[1.4rem] border border-white/10 sm:rounded-3xl">
          <img src={aboutImg} alt="Galpão Nova Bll" loading="lazy" width={1280} height={960} className="h-[44vh] w-full object-cover sm:h-[50vh] md:h-[65vh]" />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 grid gap-3 p-4 sm:grid-cols-2 sm:gap-4 sm:p-6 md:grid-cols-4 md:gap-6 md:p-12">
            {[
              { n: "15+", l: "anos no mercado" },
              { n: "2.500", l: "obras atendidas" },
              { n: "12k", l: "toneladas em estoque" },
              { n: "98%", l: "entregas no prazo" },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl border border-white/20 bg-black/30 p-3 text-white backdrop-blur-sm sm:p-4">
                <p className="text-2xl font-black text-brand-yellow sm:text-3xl md:text-5xl">{s.n}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/75">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-16 grid max-w-7xl gap-4 px-3 sm:mt-20 sm:gap-6 sm:px-6 md:mt-24 md:grid-cols-3 md:gap-10">
        {[
          { t: "Especialidade", d: "Corte e dobra de chapas metálicas, perfis especiais, canaletas e estruturas de armazenamento industrial." },
          { t: "Compromisso", d: "Qualidade, precisão e cumprimento de prazos em cada projeto, do atendimento à fabricação." },
          { t: "Atendimento", d: "Soluções sob medida para os setores industrial, comercial, logístico, construção civil e postos de combustíveis." },
        ].map((b) => (
          <div key={b.t} className="glass rounded-[1.35rem] p-5 sm:rounded-3xl sm:p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-yellow sm:text-xs">{b.t}</p>
            <p className="mt-3 text-base font-bold leading-relaxed sm:mt-4 sm:text-lg">{b.d}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto mt-16 max-w-4xl px-3 pb-12 sm:mt-20 sm:px-6 sm:pb-16">
        <ContactForm title="Quer trabalhar com a gente?" subtitle="Envie sua mensagem. Parcerias, currículos e propostas comerciais." />
      </section>
    </PageShell>
  );
}
