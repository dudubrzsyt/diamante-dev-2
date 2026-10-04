import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Check, Ruler, Scissors, Truck } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { PageShell } from "@/components/PageShell";
import workerImg from "@/assets/services-worker.jpg";
import { absoluteUrl, breadcrumbSchema, serviceSchema } from "@/lib/seo";
import { whatsappLink } from "@/lib/whatsapp";

const WHATSAPP_MESSAGE = "Olá! Quero solicitar um orçamento de corte e dobra de chapas.";

export const Route = createFileRoute("/corte-e-dobra")({
  head: () => ({
    meta: [
      { title: "Corte e Dobra de Chapas — BLL do Brasil" },
      { name: "description", content: "Corte e dobra de chapas metálicas com alta precisão para estruturas, equipamentos industriais, construção civil e projetos personalizados." },
      { property: "og:title", content: "Corte e Dobra de Ferro — Nova Bll do Brasil" },
      { property: "og:description", content: "Peças prontas para montar, produzidas conforme seu projeto estrutural." },
      { property: "og:url", content: absoluteUrl("/corte-e-dobra") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/corte-e-dobra") }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          breadcrumbSchema([{ name: "Início", path: "/" }, { name: "Serviços", path: "/servicos" }, { name: "Corte e dobra", path: "/corte-e-dobra" }]),
          serviceSchema("Corte e dobra de chapas metálicas", "Corte e dobra de chapas para estruturas, equipamentos industriais, construção civil, componentes especiais e projetos personalizados.", "/corte-e-dobra"),
        ],
      }),
    }],
  }),
  component: CorteEDobra,
});

function CorteEDobra() {
  return (
    <PageShell eyebrow="Serviço especializado" title={<>Corte e dobra para sua obra <span className="text-gradient-yellow">render mais.</span></>} description="Receba chapas metálicas cortadas e dobradas conforme o projeto. Mais precisão, menos desperdício e soluções para estruturas, equipamentos industriais, construção civil e componentes especiais.">
      <section className="mx-auto grid max-w-7xl gap-6 px-3 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
        <div className="relative min-h-[25rem] overflow-hidden rounded-3xl border border-white/15">
          <img src={workerImg} alt="Profissional preparando chapas metálicas para corte e dobra" width={1280} height={960} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8"><p className="text-xs font-black uppercase tracking-[0.25em] text-brand-yellow">Produção sob medida</p><h2 className="mt-3 max-w-lg text-3xl font-black leading-tight sm:text-4xl">A peça chega pronta para a montagem.</h2></div>
        </div>
        <div className="glass rounded-3xl p-6 sm:p-8"><p className="text-xs font-black uppercase tracking-[0.25em] text-brand-yellow">O que você ganha</p><ul className="mt-6 grid gap-4">{["Corte e dobra conforme lista, medidas ou projeto", "Aplicação em estruturas, equipamentos e construção civil", "Peças personalizadas com menos sobra e retrabalho", "Conferência técnica antes da fabricação"].map((item) => <li key={item} className="flex items-start gap-3 text-sm font-bold leading-relaxed"><span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-yellow text-brand-black"><Check size={15} strokeWidth={3} /></span>{item}</li>)}</ul><a href={whatsappLink(WHATSAPP_MESSAGE)} target="_blank" rel="noreferrer" className="btn-hero btn-hero-hover mt-8 w-full">Pedir orçamento pelo WhatsApp <ArrowRight size={18} /></a></div>
      </section>
      <section className="mx-auto mt-16 grid max-w-7xl gap-4 px-3 sm:mt-20 sm:grid-cols-3 sm:px-6"><Feature icon={Ruler} title="Conforme o projeto" text="Envie a lista de corte, o projeto ou as medidas da sua necessidade." /><Feature icon={Scissors} title="Precisão na produção" text="Nossa equipe confere bitolas, medidas e quantidades antes de fabricar." /><Feature icon={Truck} title="Entrega programada" text="Receba o material organizado no prazo combinado com sua obra." /></section>
      <section className="mx-auto mt-16 max-w-4xl px-3 pb-16 sm:mt-20 sm:px-6"><ContactForm title="Envie os detalhes da sua obra" subtitle="Conte o que precisa. Nossa equipe responde e também pode continuar o atendimento pelo WhatsApp." /></section>
    </PageShell>
  );
}

function Feature({ icon: Icon, title, text }: { icon: typeof Ruler; title: string; text: string }) {
  return <div className="glass rounded-2xl p-6"><div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-yellow text-brand-black"><Icon size={23} /></div><h2 className="mt-5 text-xl font-black">{title}</h2><p className="mt-2 text-sm font-bold leading-relaxed text-muted-foreground">{text}</p></div>;
}
