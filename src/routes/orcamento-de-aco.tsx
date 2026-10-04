import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, MessageCircle } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { PageShell } from "@/components/PageShell";
import { absoluteUrl } from "@/lib/seo";
import { whatsappLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/orcamento-de-aco")({
  head: () => ({ meta: [{ title: "Orçamento de Ferro e Aço — Nova Bll" }, { name: "description", content: "Solicite orçamento de ferro, aço, corte, dobra e entrega para sua obra com atendimento rápido pelo WhatsApp." }, { property: "og:url", content: absoluteUrl("/orcamento-de-aco") }], links: [{ rel: "canonical", href: absoluteUrl("/orcamento-de-aco") }] }),
  component: OrcamentoDeAco,
});

function OrcamentoDeAco() {
  return <PageShell eyebrow="Comece agora" title={<>Seu orçamento de aço começa <span className="text-gradient-yellow">aqui.</span></>} description="Envie os itens, quantidades e prazo. A equipe comercial retorna com uma cotação clara e segue o atendimento pelo WhatsApp."><section className="mx-auto grid max-w-7xl gap-6 px-3 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]"><div className="glass rounded-3xl p-6 sm:p-8"><MessageCircle className="text-brand-yellow" size={34} /><h2 className="mt-5 text-3xl font-black">Resposta rápida pelo canal que você já usa.</h2><p className="mt-4 text-sm font-bold leading-relaxed text-muted-foreground">Para agilizar, tenha em mãos:</p><ul className="mt-5 grid gap-3 text-sm font-bold">{["Itens e bitolas", "Quantidade aproximada", "Cidade da obra", "Prazo desejado"].map((item) => <li key={item} className="flex items-center gap-2"><Check size={17} className="text-brand-yellow" />{item}</li>)}</ul><a href={whatsappLink("Olá! Quero solicitar um orçamento de ferro e aço.")} target="_blank" rel="noreferrer" className="btn-hero btn-hero-hover mt-8 w-full">Abrir WhatsApp <ArrowRight size={18} /></a><Link to="/produtos" className="mt-5 inline-flex text-xs font-black uppercase tracking-[0.16em] text-brand-yellow">Ver produtos disponíveis</Link></div><ContactForm title="Solicite sua cotação" subtitle="Preencha os dados e nossa equipe continua o atendimento pelo WhatsApp." /></section></PageShell>;
}
