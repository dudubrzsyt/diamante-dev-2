import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Building2, CalendarClock, FileCheck2, Truck } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { PageShell } from "@/components/PageShell";
import { absoluteUrl } from "@/lib/seo";
import { whatsappLink } from "@/lib/whatsapp";

const WHATSAPP_MESSAGE = "Olá! Sou de uma construtora e quero falar sobre fornecimento recorrente de aço.";

export const Route = createFileRoute("/solucoes-para-construtoras")({
  head: () => ({
    meta: [
      { title: "Soluções para construtoras — BLL do Brasil" },
      { name: "description", content: "Fornecimento de aço, corte e dobra e entrega programada para construtoras, empreiteiras e obras de médio e grande porte." },
      { property: "og:title", content: "Soluções para construtoras — BLL do Brasil" },
      { property: "og:description", content: "Planeje o abastecimento da obra com uma equipe técnica e comercial próxima." },
      { property: "og:url", content: absoluteUrl("/solucoes-para-construtoras") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/solucoes-para-construtoras") }],
  }),
  component: SolucoesParaConstrutoras,
});

function SolucoesParaConstrutoras() {
  return <PageShell eyebrow="Atendimento B2B" title={<>Aço no ritmo da obra. <span className="text-gradient-yellow">Sem surpresa no caminho.</span></>} description="A Nova Bll ajuda construtoras e empreiteiras a organizar compras, produção e entregas para cada fase do cronograma."><section className="mx-auto max-w-7xl px-3 sm:px-6"><div className="glass rounded-3xl p-6 sm:p-10 md:p-14"><div className="max-w-3xl"><p className="text-xs font-black uppercase tracking-[0.25em] text-brand-yellow">Parceria de fornecimento</p><h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">Mais previsibilidade para comprar, receber e construir.</h2><p className="mt-5 text-sm font-bold leading-relaxed text-muted-foreground sm:text-base">Centralize o fornecimento de ferro e aço com suporte comercial, conferência técnica e entregas planejadas para o avanço real da obra.</p><a href={whatsappLink(WHATSAPP_MESSAGE)} target="_blank" rel="noreferrer" className="btn-hero btn-hero-hover mt-8">Falar com a equipe comercial <ArrowRight size={18} /></a></div></div></section><section className="mx-auto mt-16 grid max-w-7xl gap-4 px-3 sm:mt-20 sm:grid-cols-2 sm:px-6 lg:grid-cols-4"><Advantage icon={Building2} title="Atendimento próximo" text="Um canal comercial para acompanhar suas necessidades de cada obra." /><Advantage icon={CalendarClock} title="Compra programada" text="Organize pedidos de acordo com as próximas etapas do cronograma." /><Advantage icon={FileCheck2} title="Rastreabilidade" text="Materiais conferidos, documentação e certificados sob solicitação." /><Advantage icon={Truck} title="Entrega coordenada" text="Logística alinhada para reduzir espera e estoque parado no canteiro." /></section><section className="mx-auto mt-16 grid max-w-7xl gap-6 px-3 sm:mt-20 sm:px-6 md:grid-cols-2"><div className="rounded-3xl border border-brand-yellow/35 bg-brand-yellow/10 p-6 sm:p-8"><p className="text-xs font-black uppercase tracking-[0.25em] text-brand-yellow">Para começar</p><h2 className="mt-3 text-3xl font-black">Tenha uma cotação que entende a sua operação.</h2><p className="mt-4 text-sm font-bold leading-relaxed text-muted-foreground">Informe o tipo de obra, cidade, volume aproximado e prazo. A equipe retorna pelo canal mais rápido para você.</p></div><ContactForm title="Abra uma conversa comercial" subtitle="Ideal para construtoras, empreiteiras e compras recorrentes." compact /></section></PageShell>;
}

function Advantage({ icon: Icon, title, text }: { icon: typeof Building2; title: string; text: string }) { return <div className="glass rounded-2xl p-5"><div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-yellow text-brand-black"><Icon size={21} /></div><h2 className="mt-4 text-lg font-black">{title}</h2><p className="mt-2 text-sm font-bold leading-relaxed text-muted-foreground">{text}</p></div>; }
