import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { ContactForm } from "@/components/ContactForm";
import { Phone, Mail, MapPin, Clock, ArrowRight, Zap } from "lucide-react";
import { absoluteUrl } from "@/lib/seo";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato e orçamento — BLL do Brasil" },
      { name: "description", content: "Fale com a BLL do Brasil para cotar corte, dobra, perfis especiais, canaletas, porta-paletes e estruturas metálicas." },
      { property: "og:title", content: "Contato e orçamento — BLL do Brasil" },
      { property: "og:description", content: "Cotações e atendimento comercial em até 24h úteis." },
      { property: "og:url", content: absoluteUrl("/contato") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/contato") }],
  }),
  component: Contato,
});

function Contato() {
  const mapUrl = "https://www.google.com/maps/search/?api=1&query=Av.+Das+Na%C3%A7%C3%B5es+Unidas%2C+20925%2C+S%C3%A3o+Paulo%2C+SP";
  const mapEmbedUrl = "https://www.google.com/maps?q=Av.+Das+Na%C3%A7%C3%B5es+Unidas%2C+20925%2C+S%C3%A3o+Paulo%2C+SP&output=embed";
  
  const items = [
    { i: Phone, t: "Telefone", d: "(11) 5522-9775", href: "tel:+551155229775", badge: "Rápido" },
    { i: Phone, t: "WhatsApp", d: "(11) 99217-9989", href: "https://wa.me/5511992179989", badge: "24h" },
    { i: Mail, t: "Email", d: "vendas@blldobrasil.com.br", href: "mailto:vendas@blldobrasil.com.br", badge: "Formal" },
    { i: MapPin, t: "Endereço", d: "Av. das Nações Unidas, 20925 - Jurubatuba, São Paulo - SP, 04795-100", href: mapUrl, badge: "São Paulo" },
    { i: Clock, t: "Horário", d: "Segunda a Quinta: 08:00 às 18:00h Sexta-feira: 08:00 às 17:00h Sábado e Domingo: Fechado", href: "#", badge: "Disponível" },
  ];

  return (
    <PageShell
      eyebrow="Contato"
      title={<>Vamos <span className="text-gradient-yellow">conversar.</span></>}
      description="Equipe comercial pronta para atender em todo o Brasil. Cotações respondidas em até 24h úteis."
    >
      {/* Linha decorativa top */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-brand-yellow/30 to-transparent" />
      </div>

      {/* Seção de contato principal */}
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:gap-10">
          {/* Cards de contato */}
          <div className="space-y-3 sm:space-y-4">
            {items.map((it, i) => (
              <div
                key={it.t}
                style={{ 
                  animationDelay: `${i * 70}ms`,
                } as React.CSSProperties}
                className="animate-fade-in-up"
              >
                <a
                  href={it.href}
                  className="group relative flex w-full items-start gap-3 overflow-hidden rounded-2xl border border-brand-yellow/20 bg-gradient-to-br from-brand-yellow/5 to-transparent p-4 transition-all duration-300 hover:border-brand-yellow/50 hover:bg-brand-yellow/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-yellow/10 sm:gap-4 sm:p-5"
                >
                  {/* Fundo animado no hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-yellow/0 via-brand-yellow/10 to-brand-yellow/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  
                  {/* Ícone */}
                  <div className="relative mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-yellow text-brand-black transition-transform duration-300 group-hover:scale-110 sm:h-12 sm:w-12">
                    <it.i size={20} strokeWidth={2.4} className="transition-transform group-hover:rotate-12" />
                  </div>

                  {/* Conteúdo */}
                  <div className="relative min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-brand-yellow sm:text-[11px]">
                        {it.t}
                      </p>
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-yellow/20 px-2 py-0.5 transition-all group-hover:bg-brand-yellow/30">
                        <Zap size={10} className="text-brand-yellow flex-shrink-0" />
                        <span className="text-[8px] font-bold uppercase text-brand-yellow whitespace-nowrap">{it.badge}</span>
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm font-bold leading-snug text-white transition-colors group-hover:text-brand-yellow sm:text-base">
                      {it.d}
                    </p>
                  </div>

                  {/* Arrow icon */}
                  <div className="relative mt-1 flex-shrink-0 opacity-0 transition-all duration-300 group-hover:opacity-100">
                    <ArrowRight size={18} className="text-brand-yellow transition-transform group-hover:translate-x-1" />
                  </div>
                </a>
              </div>
            ))}
          </div>

          {/* Formulário */}
          <div className="overflow-hidden rounded-2xl border border-brand-yellow/20 bg-gradient-to-br from-brand-yellow/5 to-transparent p-4 transition-all duration-300 hover:border-brand-yellow/30 hover:shadow-lg hover:shadow-brand-yellow/5 sm:p-6">
            <div className="mb-5 flex items-center gap-3 sm:mb-6">
              <div className="h-px flex-1 bg-gradient-to-r from-brand-yellow/50 to-transparent" />
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-yellow whitespace-nowrap">Enviar mensagem</p>
              <div className="h-px flex-1 bg-gradient-to-l from-brand-yellow/50 to-transparent" />
            </div>
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Linha decorativa middle */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-brand-yellow/20 to-transparent" />
      </div>

      {/* Seção do mapa */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        {/* Header do mapa */}
        <div className="mb-8 space-y-4 sm:mb-10 sm:space-y-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-brand-yellow flex-shrink-0" />
                <p className="text-xs font-black uppercase tracking-[0.25em] text-brand-yellow">Localização</p>
              </div>
              <h2 className="max-w-md text-2xl font-black leading-tight sm:text-3xl">
                Atendimento em todo o <span className="text-gradient-yellow">Brasil</span>
              </h2>
            </div>
            <a 
              href={mapUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="group inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-brand-yellow transition-all hover:gap-3"
            >
              Ver no Maps
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>

        {/* Mapa com efeitos */}
        <div className="group relative overflow-hidden rounded-2xl border border-brand-yellow/30 bg-brand-yellow/10 p-1 shadow-xl shadow-brand-yellow/10 transition-all duration-500 hover:shadow-2xl hover:shadow-brand-yellow/20 sm:rounded-3xl">
          {/* Efeito de brilho top */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 rounded-full bg-linear-to-r from-transparent via-brand-yellow/50 to-transparent opacity-60 transition-opacity group-hover:opacity-100" />
          
          {/* Efeito lateral */}
          <div className="pointer-events-none absolute -inset-y-10 -left-10 w-20 bg-brand-yellow/5 blur-3xl" />
          
          {/* Container do iframe */}
          <div className="relative overflow-hidden rounded-xl sm:rounded-[1.35rem]">
            <iframe
              title="Mapa Nova Bll do Brasil"
              className="h-64 w-full border-0 sm:h-96"
              src={mapEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              style={{ borderRadius: 'inherit' }}
            />
          </div>
        </div>

        {/* Info complementar */}
        <div className="mt-8 grid gap-3 sm:grid-cols-3 sm:gap-4">
          {[
            { icon: Clock, label: "Resposta rápida", value: "Até 24h úteis", color: "from-brand-yellow/10 to-transparent" },
            { icon: Zap, label: "Múltiplos canais", value: "Tel • Email • Chat", color: "from-brand-yellow/10 to-transparent" },
            { icon: Phone, label: "Pronto para ajudar", value: "Seg a Sáb", color: "from-brand-yellow/10 to-transparent" },
                    ].map((info, i) => (
            <div
              key={i}
              style={{
                animationDelay: `${300 + i * 100}ms`,
                backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))`
              }}
              className="animate-fade-in-up flex items-center gap-3 rounded-lg border border-brand-yellow/20 bg-gradient-to-br p-4 transition-all duration-300 hover:border-brand-yellow/40 hover:shadow-lg hover:shadow-brand-yellow/10 sm:gap-4"
            >

              <info.icon size={18} className="text-brand-yellow flex-shrink-0 sm:size-5" />
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase text-brand-yellow/60 sm:text-[11px]">{info.label}</p>
                <p className="text-xs font-bold text-white sm:text-sm">{info.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Linha decorativa bottom */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 pb-8 sm:pb-12">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-brand-yellow/20 to-transparent" />
      </div>

      {/* CSS para animações */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in-up {
            animation: none;
            opacity: 1;
          }
        }
      `}</style>
    </PageShell>
  );
}