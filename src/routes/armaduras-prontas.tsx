import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Layers3, PackageCheck, Send } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { PageShell } from "@/components/PageShell";
import productsImg from "@/assets/products-steel.jpg";
import { absoluteUrl } from "@/lib/seo";
import { whatsappLink } from "@/lib/whatsapp";

const WHATSAPP_MESSAGE = "Olá! Quero cotar armaduras prontas para minha obra.";

export const Route = createFileRoute("/armaduras-prontas")({
  head: () => ({
    meta: [
      { title: "Armaduras prontas para obras — BLL do Brasil" },
      { name: "description", content: "Armaduras prontas para lajes, vigas, pilares e fundações, produzidas conforme o projeto e entregues organizadas para montagem." },
      { property: "og:title", content: "Armaduras prontas para obras — BLL do Brasil" },
      { property: "og:description", content: "Mais organização e velocidade para a montagem da sua estrutura." },
      { property: "og:url", content: absoluteUrl("/armaduras-prontas") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/armaduras-prontas") }],
  }),
  component: ArmadurasProntas,
});

function ArmadurasProntas() {
  return <PageShell eyebrow="Estrutura pronta" title={<>Sua equipe monta mais. <span className="text-gradient-yellow">Sua obra avança.</span></>} description="Produzimos armaduras conforme o projeto estrutural e entregamos tudo identificado, separado e pronto para a montagem no canteiro."><section className="mx-auto max-w-7xl px-3 sm:px-6"><div className="relative min-h-[27rem] overflow-hidden rounded-3xl border border-white/15"><img src={productsImg} alt="Estoque de aço preparado para obras" width={1280} height={960} className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/45 to-transparent" /><div className="relative max-w-2xl p-6 text-white sm:p-10 md:p-14"><p className="text-xs font-black uppercase tracking-[0.25em] text-brand-yellow">Do projeto à montagem</p><h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">Menos improviso. Mais produtividade.</h2><p className="mt-5 max-w-xl text-sm font-semibold leading-relaxed text-white/85 sm:text-base">Para construtoras, empreiteiros e obras que precisam controlar prazo, material e equipe em cada etapa.</p><a href={whatsappLink(WHATSAPP_MESSAGE)} target="_blank" rel="noreferrer" className="btn-hero btn-hero-hover mt-8">Cotar armaduras <ArrowRight size={18} /></a></div></div></section><section className="mx-auto mt-16 grid max-w-7xl gap-4 px-3 sm:mt-20 sm:grid-cols-3 sm:px-6"><Benefit icon={Layers3} title="Para cada etapa" text="Lajes, vigas, pilares, blocos e fundações conforme o detalhamento." /><Benefit icon={PackageCheck} title="Tudo identificado" text="Peças separadas para facilitar a conferência e a montagem no canteiro." /><Benefit icon={Send} title="Entrega combinada" text="Programação alinhada ao cronograma para não deixar material parado." /></section><section className="mx-auto mt-16 grid max-w-7xl gap-6 px-3 sm:mt-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]"><div className="glass rounded-3xl p-6 sm:p-8"><p className="text-xs font-black uppercase tracking-[0.25em] text-brand-yellow">Como funciona</p><ol className="mt-6 grid gap-5">{["Você envia o projeto ou quantitativo", "Nossa equipe confere medidas e quantidades", "Produzimos e identificamos as peças", "Entregamos conforme a sequência da obra"].map((step, index) => <li key={step} className="flex items-start gap-3 text-sm font-bold leading-relaxed"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-yellow text-xs font-black text-brand-black">{index + 1}</span>{step}</li>)}</ol><Link to="/corte-e-dobra" className="mt-7 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-brand-yellow hover:text-brand-black">Conheça o corte e dobra <ArrowRight size={16} /></Link></div><div className="glass rounded-3xl p-6 sm:p-8"><p className="text-xs font-black uppercase tracking-[0.25em] text-brand-yellow">Fale com a equipe</p><h2 className="mt-3 text-3xl font-black">Mande o projeto e receba uma orientação rápida.</h2><p className="mt-3 text-sm font-bold leading-relaxed text-muted-foreground">Mesmo que o material ainda não esteja fechado, nossa equipe ajuda a organizar as informações para uma cotação mais precisa.</p><div className="mt-6 grid gap-3 text-sm font-bold">{["Projeto estrutural ou lista de corte", "Quantidade de peças e bitolas", "Cidade e prazo desejado"].map((item) => <p key={item} className="flex items-center gap-2"><Check size={17} className="text-brand-yellow" />{item}</p>)}</div></div></section><section className="mx-auto mt-16 max-w-4xl px-3 pb-16 sm:mt-20 sm:px-6"><ContactForm title="Solicite uma cotação de armaduras" subtitle="Descreva sua obra e informe como prefere receber o retorno." /></section></PageShell>;
}

function Benefit({ icon: Icon, title, text }: { icon: typeof Layers3; title: string; text: string }) { return <div className="glass rounded-2xl p-6"><div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-yellow text-brand-black"><Icon size={23} /></div><h2 className="mt-5 text-xl font-black">{title}</h2><p className="mt-2 text-sm font-bold leading-relaxed text-muted-foreground">{text}</p></div>; }
