import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, CalendarClock, MapPin, Truck } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { PageShell } from "@/components/PageShell";
import { absoluteUrl } from "@/lib/seo";
import { whatsappLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/entrega-de-aco")({
  head: () => ({ meta: [{ title: "Entrega de Aço para Obras — Nova Bll do Brasil" }, { name: "description", content: "Entrega de ferro e aço programada para sua obra, com logística combinada, atendimento comercial e cobertura regional." }, { property: "og:url", content: absoluteUrl("/entrega-de-aco") }], links: [{ rel: "canonical", href: absoluteUrl("/entrega-de-aco") }] }),
  component: EntregaDeAco,
});

function EntregaDeAco() {
  return <PageShell eyebrow="Logística de obra" title={<>O material chega no prazo para a obra <span className="text-gradient-yellow">não parar.</span></>} description="Combine quantidade, endereço e janela de recebimento com uma equipe que entende a rotina do canteiro."><section className="mx-auto max-w-5xl px-3 sm:px-6"><div className="glass rounded-3xl p-6 sm:p-10 md:p-14"><p className="text-xs font-black uppercase tracking-[0.25em] text-brand-yellow">Entrega planejada</p><h2 className="mt-4 max-w-3xl text-3xl font-black sm:text-5xl">Compra certa, transporte organizado e menos espera.</h2><p className="mt-5 max-w-2xl text-sm font-bold leading-relaxed text-muted-foreground sm:text-base">Nossa equipe coordena o envio conforme o volume, a região e a condição de acesso da sua obra.</p><a href={whatsappLink("Olá! Quero consultar entrega de aço para minha obra.")} target="_blank" rel="noreferrer" className="btn-hero btn-hero-hover mt-8">Consultar pelo WhatsApp <ArrowRight size={18} /></a></div></section><section className="mx-auto mt-16 grid max-w-7xl gap-4 px-3 sm:mt-20 sm:grid-cols-3 sm:px-6"><Info icon={Truck} title="Carga adequada" text="Organização do material para facilitar descarga e conferência." /><Info icon={CalendarClock} title="Janela combinada" text="Alinhe a chegada ao cronograma e à disponibilidade da equipe." /><Info icon={MapPin} title="Destino confirmado" text="Informe cidade, endereço e condições de acesso do canteiro." /></section><section className="mx-auto mt-16 max-w-4xl px-3 pb-16 sm:mt-20 sm:px-6"><ContactForm title="Calcule sua entrega" subtitle="Envie os dados da obra e retornaremos com as opções disponíveis." /></section></PageShell>;
}

function Info({ icon: Icon, title, text }: { icon: typeof Truck; title: string; text: string }) { return <div className="glass rounded-2xl p-6"><div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-yellow text-brand-black"><Icon size={22} /></div><h2 className="mt-5 text-xl font-black">{title}</h2><p className="mt-2 text-sm font-bold leading-relaxed text-muted-foreground">{text}</p></div>; }
