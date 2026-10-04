import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Check, Ruler, ShieldCheck } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { PageShell } from "@/components/PageShell";
import productsImg from "@/assets/products-steel.jpg";
import { absoluteUrl } from "@/lib/seo";
import { whatsappLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/vergalhao-ca-50")({
  head: () => ({ meta: [{ title: "Vergalhão CA-50 — Nova Bll Ferro e Aço" }, { name: "description", content: "Vergalhão CA-50 nervurado para concreto armado, com bitolas variadas, certificado e pronta entrega." }, { property: "og:url", content: absoluteUrl("/vergalhao-ca-50") }], links: [{ rel: "canonical", href: absoluteUrl("/vergalhao-ca-50") }] }),
  component: VergalhaoCA50,
});

function VergalhaoCA50() {
  return <PageShell eyebrow="Produto mais procurado" title={<>Vergalhão CA-50 para uma estrutura <span className="text-gradient-yellow">mais forte.</span></>} description="Aço nervurado para concreto armado, com procedência, variedade de bitolas e apoio comercial para sua compra."><section className="mx-auto grid max-w-7xl gap-6 px-3 sm:px-6 lg:grid-cols-2"><div className="relative min-h-[24rem] overflow-hidden rounded-3xl"><img src={productsImg} alt="Estoque de vergalhões de aço" width={1280} height={960} className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" /><div className="absolute bottom-0 p-6 text-white sm:p-8"><p className="text-xs font-black uppercase tracking-[0.25em] text-brand-yellow">Pronta entrega</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">Bitolas para diferentes etapas da obra.</h2></div></div><div className="glass rounded-3xl p-6 sm:p-8"><div className="grid gap-5">{[{ icon: ShieldCheck, text: "Certificação e lote rastreável" }, { icon: Ruler, text: "Bitolas de 5 a 32 mm" }, { icon: Check, text: "Conferência antes da entrega" }].map(({ icon: Icon, text }) => <p key={text} className="flex items-center gap-3 text-sm font-bold"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-yellow text-brand-black"><Icon size={20} /></span>{text}</p>)}</div><a href={whatsappLink("Olá! Quero cotar vergalhão CA-50 para minha obra.")} target="_blank" rel="noreferrer" className="btn-hero btn-hero-hover mt-8 w-full">Cotar pelo WhatsApp <ArrowRight size={18} /></a></div></section><section className="mx-auto mt-16 max-w-4xl px-3 pb-16 sm:mt-20 sm:px-6"><ContactForm title="Consulte disponibilidade e preço" subtitle="Informe bitola, quantidade e cidade de entrega para receber uma cotação." /></section></PageShell>;
}
