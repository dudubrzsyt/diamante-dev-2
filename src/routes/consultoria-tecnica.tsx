import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, ClipboardCheck, Gauge, MessageCircle } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { PageShell } from "@/components/PageShell";
import { absoluteUrl } from "@/lib/seo";
import { whatsappLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/consultoria-tecnica")({
  head: () => ({ meta: [{ title: "Consultoria Técnica em Aço — Nova Bll do Brasil" }, { name: "description", content: "Orientação comercial e técnica para escolher bitolas, quantidades e soluções de aço para sua obra." }, { property: "og:url", content: absoluteUrl("/consultoria-tecnica") }], links: [{ rel: "canonical", href: absoluteUrl("/consultoria-tecnica") }] }),
  component: ConsultoriaTecnica,
});

function ConsultoriaTecnica() {
  return <PageShell eyebrow="Suporte especializado" title={<>Decida melhor antes de comprar <span className="text-gradient-yellow">o aço.</span></>} description="Tire dúvidas sobre aplicação, quantidade, bitola e organização do pedido com uma equipe acostumada à rotina de obras."><section className="mx-auto max-w-7xl px-3 sm:px-6"><div className="rounded-3xl border border-brand-yellow/35 bg-brand-yellow/10 p-6 sm:p-10 md:p-14"><p className="text-xs font-black uppercase tracking-[0.25em] text-brand-yellow">Conversa objetiva</p><h2 className="mt-4 max-w-3xl text-3xl font-black sm:text-5xl">A informação certa evita compra errada e retrabalho.</h2><p className="mt-5 max-w-2xl text-sm font-bold leading-relaxed text-muted-foreground sm:text-base">Envie sua dúvida, lista ou projeto. A equipe ajuda a organizar o próximo passo da cotação.</p><a href={whatsappLink("Olá! Preciso de orientação técnica para comprar aço.")} target="_blank" rel="noreferrer" className="btn-hero btn-hero-hover mt-8">Falar com especialista <ArrowRight size={18} /></a></div></section><section className="mx-auto mt-16 grid max-w-7xl gap-4 px-3 sm:mt-20 sm:grid-cols-3 sm:px-6"><Info icon={Gauge} title="Bitola e aplicação" text="Entenda as opções adequadas para cada uso e etapa." /><Info icon={ClipboardCheck} title="Lista organizada" text="Estruture quantidades e itens para cotar com mais precisão." /><Info icon={MessageCircle} title="Retorno rápido" text="Continue a conversa pelo WhatsApp no mesmo atendimento." /></section><section className="mx-auto mt-16 max-w-4xl px-3 pb-16 sm:mt-20 sm:px-6"><ContactForm title="Fale com nossa equipe" subtitle="Descreva a dúvida ou necessidade da obra para receber uma orientação inicial." /></section></PageShell>;
}

function Info({ icon: Icon, title, text }: { icon: typeof Gauge; title: string; text: string }) { return <div className="glass rounded-2xl p-6"><div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-yellow text-brand-black"><Icon size={22} /></div><h2 className="mt-5 text-xl font-black">{title}</h2><p className="mt-2 text-sm font-bold leading-relaxed text-muted-foreground">{text}</p></div>; }
