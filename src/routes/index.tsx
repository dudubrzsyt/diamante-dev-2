import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, Check, ChevronDown, ClipboardCheck, Clock, Gem, MessageCircle, Rocket, Search, ShieldCheck, Smartphone, Star, X } from "lucide-react";
import { absoluteUrl } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Diamante Dev — Sites que geram resultado" },
      { name: "description", content: "Criamos sites rápidos, bonitos e feitos para trazer clientes para o seu negócio. Veja os planos, os valores e por que cada site se paga." },
      { property: "og:title", content: "Diamante Dev — Sites que geram resultado" },
      { property: "og:description", content: "Sites profissionais que aparecem no Google, funcionam no celular e transformam visitas em clientes." },
      { property: "og:url", content: absoluteUrl("/") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/") }],
  }),
  component: Home,
});

/* ===== AJUSTE AQUI ===== */
const WHATS = "https://wa.me/5511990047011"; // seu WhatsApp
const INTERNAL = ["/contato", "/sobre"]; // rotas que usam <Link>
/* VALORES E PRAZOS SÃO EXEMPLOS: ajuste aqui e a página inteira se atualiza. */
const PLANS = [
  { n: "Essencial", p: 1500, f: "Para quem está começando e quer ser encontrado.", list: ["Página única, direta e bonita", "Funciona perfeito no celular", "Botão de WhatsApp para o cliente chamar", "Site publicado e no ar"], why: "Cobre o básico para você parar de perder cliente para quem já tem site." },
  { n: "Profissional", p: 5000, hot: true, f: "Para quem quer vender mais todos os meses.", list: ["Até 6 páginas (início, serviços, sobre, contato…)", "Textos escritos para convencer", "Aparece no Google", "Carrega em instantes", "Animações que prendem a atenção", "1 mês de suporte"], why: "Aqui o site deixa de ser cartão de visita e vira um vendedor que trabalha 24 horas." },
  { n: "Premium", p: 12000, f: "Para marcas que querem ser lembradas.", list: ["Tudo do Profissional", "Design 100% exclusivo", "Efeitos 3D e animações avançadas", "Loja virtual ou agendamento online", "Painel para você editar sozinho", "3 meses de suporte"], why: "Para quem quer passar valor no primeiro olhar e se destacar dos concorrentes." },
];
const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

const CSS = `
@property --a{syntax:"<angle>";inherits:false;initial-value:0deg}
.dd{--bg:#fff;--card:#fff;--glass:rgba(255,255,255,.8);--ink:#161d26;--mut:#414d5c;--line:#d5dbdb;--blue:#0972d3;--tint:#e6f2fc;--hov:#2e3c50;--top:#232f3e;--band:linear-gradient(120deg,#dfe8fb,#efe3fb,#d6f1fb,#dfe8fb);font-family:"Amazon Ember","Helvetica Neue",Roboto,Arial,sans-serif;color:var(--ink);background:var(--bg);-webkit-font-smoothing:antialiased;overflow-x:clip;transition:background .4s,color .4s}
:is(.dark,[data-theme=dark],[data-mode=dark]) .dd{--bg:#04060b;--card:#0b111c;--glass:rgba(11,17,28,.78);--ink:#f3f6fb;--mut:#a9b6c9;--line:#1f2b3d;--blue:#62adff;--tint:#10243d;--hov:#d6e2f3;--top:#090d14;--band:linear-gradient(120deg,#0a1530,#1d0f36,#082a3a,#0a1530)}
.dd *{box-sizing:border-box}
.dd-w{max-width:1440px;margin:0 auto;padding:0 clamp(20px,4vw,56px)}
.dd-sec{padding:clamp(72px,9vw,136px) 0}
.dd-h1{font-size:clamp(2.3rem,5.4vw,4.7rem);font-weight:500;line-height:1.05;letter-spacing:-.025em}
.dd-h2{font-size:clamp(1.9rem,3.9vw,3.3rem);font-weight:500;line-height:1.1;letter-spacing:-.02em}
.dd-lead{font-size:clamp(1.1rem,1.6vw,1.4rem);line-height:1.55;color:var(--mut)}
.dd-p{font-size:1.05rem;line-height:1.6;color:var(--mut)}
.dd-top{background:var(--top);color:#fff}
.dd-tb{display:inline-flex;align-items:center;gap:7px;padding:18px 8px;font-weight:500;font-size:.98rem;color:#fff;white-space:nowrap}
.dd-tb:hover{text-decoration:underline}
.dd-nav{position:sticky;top:0;z-index:50;background:color-mix(in srgb,var(--bg) 92%,transparent);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}
.dd-nl{position:relative;display:inline-flex;align-items:center;gap:6px;padding:14px 18px;font-weight:500;font-size:1.04rem}
.dd-nl::after{content:"";position:absolute;left:18px;right:18px;bottom:6px;height:3px;border-radius:3px;background:linear-gradient(90deg,#3f73e0,#a855f7,#22d3ee);transform:scaleX(0);transform-origin:left;transition:transform .3s}
.dd-nl:hover::after{transform:scaleX(1)}
.dd-pop{position:absolute;top:100%;left:0;margin-top:10px;min-width:320px;z-index:70;background:var(--card);color:var(--ink);border:1px solid var(--line);border-radius:16px;padding:8px;box-shadow:0 28px 70px -18px rgba(9,30,66,.55);animation:ddpop .28s cubic-bezier(.2,.9,.3,1.25)}
.dd-pop::before{content:"";position:absolute;left:0;right:0;top:-14px;height:14px}
.dd-pop.r{left:auto;right:0}
.dd-it{display:flex;width:100%;align-items:center;justify-content:space-between;gap:14px;padding:12px 16px;border-radius:12px;text-align:left;font-weight:500;color:var(--ink);transition:background .15s,padding .2s}
.dd-it:hover{background:var(--tint);padding-left:22px}
.dd-it small{display:block;margin-top:2px;font-size:.82rem;font-weight:400;color:var(--mut)}
@keyframes ddpop{from{opacity:0;transform:translateY(14px) scale(.94);filter:blur(6px)}}
.dd-hero{position:relative;overflow:hidden;isolation:isolate;padding:clamp(72px,9vw,136px) 0 clamp(190px,20vw,310px);background:linear-gradient(125deg,#3f73e0,#7d93e8 35%,#b4a5f1 70%,#d6c6f8);background-size:220% 220%;animation:ddg 16s ease-in-out infinite}
.dd-hero>.bl{position:absolute;z-index:-1;border-radius:50%;filter:blur(80px);opacity:.7;pointer-events:none}
.bl1{width:46vw;height:46vw;left:-12vw;top:-16vw;background:#22d3ee;animation:ddm1 11s ease-in-out infinite alternate}
.bl2{width:40vw;height:40vw;right:-10vw;top:10%;background:#f472b6;animation:ddm2 13s ease-in-out infinite alternate}
.bl3{width:36vw;height:36vw;left:30%;bottom:-14vw;background:#a855f7;animation:ddm3 15s ease-in-out infinite alternate}
.dd-first{padding-top:calc(var(--header-h,0px) + clamp(40px,6vw,96px))}
.dd [id]{scroll-margin-top:calc(var(--header-h,112px) + 12px)}
@keyframes ddg{50%{background-position:100% 100%}}
@keyframes ddm1{to{transform:translate(22vw,14vw) scale(1.3)}}
@keyframes ddm2{to{transform:translate(-20vw,18vw) scale(1.2)}}
@keyframes ddm3{to{transform:translate(-26vw,-8vw) scale(1.35)}}
.dd-card{position:relative;background:var(--glass);-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);border-radius:20px;padding:clamp(28px,4.4vw,68px);box-shadow:0 30px 80px -24px rgba(22,29,38,.5)}
.dd-card::before,.dd-tile::before{content:"";position:absolute;inset:-2px;border-radius:inherit;padding:2px;pointer-events:none;background:conic-gradient(from var(--a),#3f73e0,#a855f7,#22d3ee,#f472b6,#fbbf24,#3f73e0);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;animation:dda 4s linear infinite;opacity:.75}
.dd-tile::before{opacity:0;transition:opacity .3s}
@keyframes dda{to{--a:360deg}}
.dd-btn,.dd-btn-o,.dd-btn-w{position:relative;isolation:isolate;display:inline-flex;align-items:center;justify-content:center;gap:10px;border-radius:999px;font-weight:700;font-size:1.1rem;padding:17px 36px;transition:transform .25s,background .25s,color .25s;cursor:pointer;text-align:center}
.dd-btn{background:var(--ink);color:var(--bg)}
.dd-btn-o{background:transparent;color:var(--ink);box-shadow:inset 0 0 0 2px var(--ink)}
.dd-btn-o:hover{background:var(--ink);color:var(--bg)}
.dd-btn-w{background:#fff;color:#161d26}
.dd-btn::before,.dd-btn-w::before,.dd-btn-o::before{content:"";position:absolute;inset:-4px;z-index:-1;border-radius:inherit;background:conic-gradient(from var(--a),#3f73e0,#a855f7,#22d3ee,#f472b6,#3f73e0);filter:blur(9px);opacity:.5;transition:opacity .3s;animation:dda 3s linear infinite}
.dd-btn-o::before{opacity:0}
.dd-btn:hover,.dd-btn-w:hover,.dd-btn-o:hover{transform:translateY(-3px) scale(1.03)}
.dd-btn:hover::before,.dd-btn-w:hover::before,.dd-btn-o:hover::before{opacity:1}
.dd :is(a,button,summary,input):focus-visible{outline:3px solid var(--blue);outline-offset:3px}
.dd-curve{position:relative;z-index:1;margin-top:calc(-1*clamp(96px,11vw,170px));background:var(--bg);border-radius:clamp(48px,8vw,136px) clamp(48px,8vw,136px) 0 0;padding-top:clamp(64px,8vw,112px);transition:background .4s}
.dd-tile{position:relative;background:var(--card);border:1px solid var(--line);border-radius:22px;padding:clamp(24px,2.6vw,38px);height:100%;transition:transform .3s,box-shadow .3s,background .4s}
.dd-tile.hv:hover,.dd-tile.hot{transform:translateY(-8px);box-shadow:0 26px 60px -22px rgba(76,125,255,.55)}
.dd-tile.hv:hover::before,.dd-tile.hot::before{opacity:1}
.dd-ico{display:grid;place-items:center;width:60px;height:60px;border-radius:999px;background:var(--tint);color:var(--blue);transition:transform .35s,background .35s}
.dd-tile:hover .dd-ico{transform:rotate(-12deg) scale(1.15);background:linear-gradient(135deg,#3f73e0,#a855f7);color:#fff}
.dd-tick{display:grid;place-items:center;flex:none;width:24px;height:24px;border-radius:999px;background:var(--tint);color:var(--blue);margin-top:1px}
.dd-band{position:relative;background:var(--band);background-size:300% 300%;animation:ddg 14s ease-in-out infinite}
.dd-glass{background:var(--glass);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border:1px solid var(--line);border-radius:22px;box-shadow:0 24px 60px -26px rgba(22,29,38,.45)}
.dd-dark{position:relative;overflow:hidden;color:#fff;background:radial-gradient(70% 90% at 90% 20%,rgba(76,125,255,.5),transparent 65%),radial-gradient(50% 60% at 0% 100%,rgba(168,85,247,.35),transparent 70%),#0a1424}
.dd-dark .dd-p{color:#c5d0e0}
.dd-phone{position:relative;margin:0 auto;width:min(74vw,330px);aspect-ratio:9/18.5;border-radius:44px;border:8px solid #2c3a52;overflow:hidden;background:linear-gradient(160deg,#4a7be0,#9a8cf0 55%,#f0a6e0);background-size:200% 200%;animation:ddg 8s ease-in-out infinite;box-shadow:0 50px 110px -30px rgba(76,125,255,.85)}
.dd-range{width:100%;margin-top:14px;accent-color:#0972d3}
.dd-rv{opacity:0;transform:translateY(70px) scale(.93);filter:blur(8px);transition:opacity .75s cubic-bezier(.2,.8,.2,1),transform .75s cubic-bezier(.2,.8,.2,1),filter .75s}
.dd-rv.in{opacity:1;transform:none;filter:none}
.dd-float{animation:ddf 6s ease-in-out infinite}
@keyframes ddf{50%{transform:translateY(-16px) rotate(.8deg)}}
.dd-draw{stroke-dasharray:900;stroke-dashoffset:900;animation:dddr 2.6s .3s ease-out forwards}
@keyframes dddr{to{stroke-dashoffset:0}}
.dd-dot{transform-box:fill-box;transform-origin:center;animation:ddpl 2.4s ease-in-out infinite}
@keyframes ddpl{50%{transform:scale(1.5)}}
.dd-slam{animation:ddsl .9s cubic-bezier(.2,.9,.2,1) both}
@keyframes ddsl{from{opacity:0;transform:translateY(60px) scale(.9);filter:blur(10px)}}
.dd-fab>button{position:relative;display:grid;place-items:center;width:68px;height:68px;border-radius:18px;background:#161d26;color:#fff;border:1px solid #2b3a52;box-shadow:0 14px 34px -8px rgba(0,0,0,.6);transition:transform .25s}
.dd-fab>button::after{content:"";position:absolute;inset:0;border-radius:inherit;border:2px solid #62adff;animation:ddrg 2.2s ease-out infinite}
.dd-fab>button:hover{transform:scale(1.1) rotate(-6deg)}
@keyframes ddrg{to{transform:scale(1.5);opacity:0}}
.dd details[open] .dd-chev,.dd-chev.rot{transform:rotate(180deg)}
.dd-chev{transition:transform .25s}
.dd summary::-webkit-details-marker{display:none}
@media (prefers-reduced-motion:reduce){.dd *,.dd *::before,.dd *::after{animation:none!important;transition:none!important}.dd-rv{opacity:1;transform:none;filter:none}.dd-draw{stroke-dashoffset:0}}
`;

function Home() {
  return (
    <main className="dd">
      <style>{CSS}</style>
      <Hero />
      <Stats />
      <Included />
      <Showcase />
      <Segments />
      <Calc />
      <Plans />
      <Compare />
      <Steps />
      <Faq />
      <QuoteCta />
      <Contact />
    </main>
  );
}

/* ---------- utilitários ---------- */
function A({ h, children, className, onClick }: { h: string; children: ReactNode; className?: string; onClick?: () => void }) {
  if (INTERNAL.includes(h)) return <Link to={h as "/contato"} className={className} onClick={onClick}>{children}</Link>;
  const ext = h.startsWith("http");
  return <a href={h} className={className} onClick={onClick} {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{children}</a>;
}

function Reveal({ children, d = 0, className = "" }: { children: ReactNode; d?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setS(1);
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setS(2); io.disconnect(); } }, { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} style={{ transitionDelay: `${d}ms` }} className={`${s ? "dd-rv" : ""} ${s === 2 ? "in" : ""} ${className}`}>{children}</div>;
}

const Tick = () => <span className="dd-tick"><Check size={15} strokeWidth={3} /></span>;
const Aurora = () => <><i className="bl bl1" /><i className="bl bl2" /><i className="bl bl3" /></>;
const Sec = ({ id, className = "", children }: { id?: string; className?: string; children: ReactNode }) => (
  <section id={id} className={`dd-sec scroll-mt-28 ${className}`}><div className="dd-w">{children}</div></section>
);

/* ---------- ilustração do hero ---------- */
function Art() {
  const paths: { d: string; a: [number, number]; b: [number, number] }[] = [
    { d: "M110 150 C170 90 230 140 200 200 S120 260 170 320", a: [110, 150], b: [170, 320] },
    { d: "M330 70 C400 60 440 130 390 170 S300 190 330 250", a: [330, 70], b: [330, 250] },
    { d: "M430 220 C480 250 440 330 380 320 S330 400 400 430", a: [430, 220], b: [400, 430] },
    { d: "M150 400 C110 340 190 330 240 360 S300 440 250 460", a: [150, 400], b: [250, 460] },
    { d: "M220 90 C260 40 300 80 280 120", a: [220, 90], b: [280, 120] },
    { d: "M80 260 C70 320 120 350 160 330", a: [80, 260], b: [160, 330] },
    { d: "M290 290 C340 330 360 270 410 300", a: [290, 290], b: [410, 300] },
  ];
  return (
    <svg viewBox="0 0 540 540" className="dd-float h-auto w-full max-w-[680px]" aria-hidden>
      <defs><radialGradient id="ddg" cx=".38" cy=".32" r=".85"><stop offset="0" stopColor="#b4e8fc" /><stop offset="1" stopColor="#6cc6f2" /></radialGradient></defs>
      <circle cx="270" cy="250" r="230" fill="url(#ddg)" />
      <g fill="none" stroke="#10151c" strokeWidth="2.6" strokeLinecap="round">{paths.map((p) => <path key={p.d} d={p.d} className="dd-draw" />)}</g>
      <g fill="#0a4fc4">{paths.flatMap((p) => [p.a, p.b]).map(([x, y], i) => <circle key={`${x}-${y}`} cx={x} cy={y} r="11" className="dd-dot" style={{ animationDelay: `${i * 160}ms` }} />)}</g>
      <path d="M330 540 a85 85 0 0 1 170 0z" fill="#a855f7" />
      <g transform="rotate(26 440 430)">
        <rect x="408" y="310" width="38" height="190" rx="19" fill="#b4bfce" /><rect x="452" y="300" width="38" height="200" rx="19" fill="#94a3b8" />
        <circle cx="427" cy="329" r="9" fill="#9fd9fb" /><circle cx="471" cy="320" r="9" fill="#f9b4e6" />
      </g>
    </svg>
  );
}

/* ---------- seções ---------- */
function Hero() {
  return (
    <section className="dd-hero dd-first">
      <Aurora />
      <div className="dd-w relative grid items-center gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,.8fr)]">
        <div className="dd-card dd-slam">
          <p className="mb-5 font-bold text-[color:var(--blue)]">Diamante Dev · sites profissionais desde 2025</p>
          <h1 className="dd-h1">Sites que trazem clientes e fazem o seu negócio crescer</h1>
          <p className="dd-lead mt-7 max-w-2xl">Hoje, antes de ligar ou visitar a loja, o cliente procura você no Google. Criamos o site que aparece, passa confiança e faz o telefone tocar. Rápido, bonito e pronto para o celular.</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a href="#planos" className="dd-btn">Ver planos e valores</a>
            <Link to="/contato" className="dd-btn-o">Pedir orçamento grátis</Link>
          </div>
        </div>
        <div className="dd-slam flex justify-center lg:justify-end" style={{ animationDelay: ".2s" }}><Art /></div>
      </div>
    </section>
  );
}

function Stats() {
  const s = [["32 dias", "em média, para o site ir ao ar"], ["100%", "do site é seu, sem ficar preso a ninguém"], ["24h", "para você receber resposta no WhatsApp"]];
  return (
    <div className="dd-curve">
      <div className="dd-w pb-4">
        <div className="grid gap-10 sm:grid-cols-3">
          {s.map(([n, l], k) => (
            <Reveal key={n} d={k * 110}>
              <div className="border-l-4 border-[color:var(--blue)] pl-6">
                <p className="text-[clamp(3rem,6vw,5rem)] font-medium leading-none tracking-tight">{n}</p>
                <p className="dd-p mt-3 max-w-[24ch]">{l}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}

function Included() {
  const items = [
    { i: Search, t: "Seus clientes encontram você", d: "Preparamos o site para aparecer quando alguém pesquisa o que você vende, na sua região." },
    { i: Rocket, t: "Abre em instantes", d: "Quem espera demais fecha a página. O nosso carrega rápido, e você não perde a visita." },
    { i: Smartphone, t: "Perfeito no celular", d: "A maioria das pessoas navega pelo celular. Por isso começamos o projeto por ele." },
    { i: ShieldCheck, t: "Passa confiança", d: "Um site bem feito mostra que sua empresa é séria, e o cliente se sente seguro para comprar." },
    { i: MessageCircle, t: "Contato em um toque", d: "Botões de WhatsApp e ligação nos lugares certos, para o interessado chamar na hora." },
    { i: Gem, t: "Visual só seu", d: "Design com a cara da sua marca, sem modelo pronto igual ao de todo mundo." },
  ];
  return (
    <Sec id="incluso">
      <Reveal className="mb-14 max-w-4xl">
        <h2 className="dd-h2">Você não paga por “um site”. Paga por clientes novos.</h2>
        <p className="dd-lead mt-6">É isso que está dentro do valor de cada projeto. Cada item existe por um motivo: fazer o seu site vender.</p>
      </Reveal>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, k) => (
          <Reveal key={it.t} d={k * 80}>
            <div className="dd-tile hv">
              <div className="dd-ico"><it.i size={28} /></div>
              <h3 className="mt-6 text-2xl font-bold">{it.t}</h3>
              <p className="dd-p mt-3">{it.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Sec>
  );
}

function Showcase() {
  const pts = ["Você vê o desenho antes de ele ser construído", "O site é 100% seu, sem ficar preso a ninguém", "Pagamento único pela criação"];
  return (
    <section id="vitrine" className="dd-dark dd-sec scroll-mt-28">
      <div className="dd-w grid items-center gap-16 md:grid-cols-2">
        <Reveal>
          <h2 className="dd-h2">Seu site, do jeito que o cliente vai ver</h2>
          <p className="dd-p mt-6 max-w-lg text-xl">Antes de qualquer coisa ir ao ar, você enxerga o resultado. Sem surpresa, sem “depois a gente ajeita”.</p>
          <ul className="mt-9 space-y-5 text-lg">{pts.map((x) => <li key={x} className="flex items-start gap-4 font-medium"><Tick />{x}</li>)}</ul>
          <Link to="/contato" className="dd-btn-w mt-12">Quero ver o meu site</Link>
        </Reveal>
        <Reveal d={140}>
          <div className="dd-phone dd-float">
            <div className="absolute left-1/2 top-2 h-4 w-24 -translate-x-1/2 rounded-full bg-black/60" />
            <div className="relative flex h-full flex-col justify-end gap-3 p-6 pb-10">
              <p className="text-4xl font-medium leading-none">Sua marca</p>
              <p className="text-sm leading-relaxed text-white/90">Em 3 segundos o cliente entende o que você faz e como te chamar.</p>
              <span className="rounded-full bg-[#161d26] px-4 py-3.5 text-center text-sm font-bold text-white">Chamar no WhatsApp</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Segments() {
  const a = [
    ["Clínicas e consultórios", "Pacientes encontram você, conhecem a equipe e marcam consulta pelo WhatsApp."],
    ["Restaurantes e cafés", "Cardápio bonito, endereço no mapa e pedido a um toque."],
    ["Lojas e comércio", "Mostre seus produtos 24 horas por dia e receba contato mesmo com a loja fechada."],
    ["Advogados e contadores", "Passe autoridade e segurança antes mesmo da primeira conversa."],
    ["Prestadores de serviço", "Eletricistas, designers, fotógrafos: mostre seu trabalho e receba pedidos de orçamento."],
    ["Indústrias e construtoras", "Apresente sua estrutura e seja lembrado quando o cliente for pedir cotação."],
  ];
  return (
    <Sec id="segmentos">
      <Reveal className="mb-14 max-w-4xl"><h2 className="dd-h2">Feito para o seu tipo de negócio</h2></Reveal>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {a.map(([t, d], k) => (
          <Reveal key={t} d={k * 80}>
            <Link to="/contato" className="dd-tile hv block">
              <h3 className="text-2xl font-bold">{t}</h3>
              <p className="dd-p mt-3">{d}</p>
              <span className="mt-6 inline-flex items-center gap-2 font-bold text-[color:var(--blue)]">Quero um site assim <ArrowRight size={18} /></span>
            </Link>
          </Reveal>
        ))}
      </div>
    </Sec>
  );
}

function Calc() {
  const [ticket, setTicket] = useState(300);
  const [cli, setCli] = useState(5);
  const price = PLANS[1].p;
  const gain = ticket * cli;
  const months = price / gain;
  const when = months <= 1 ? "já no primeiro mês" : `em cerca de ${Math.ceil(months)} meses`;
  const year = gain * 12 - price;
  return (
    <Sec id="calculadora" className="dd-band">
      <div className="grid items-center gap-14 md:grid-cols-2">
        <Reveal>
          <h2 className="dd-h2">Quanto tempo o site leva para se pagar?</h2>
          <p className="dd-lead mt-5">Mexa nos controles com a realidade do seu negócio e veja a conta, com o plano Profissional ({brl(price)}).</p>
          <label className="mt-10 block text-lg font-bold">Quanto você ganha em uma venda? <span className="text-[color:var(--blue)]">{brl(ticket)}</span>
            <input type="range" min={50} max={5000} step={50} value={ticket} onChange={(e) => setTicket(+e.target.value)} className="dd-range" />
          </label>
          <label className="mt-8 block text-lg font-bold">Clientes novos que o site pode trazer por mês: <span className="text-[color:var(--blue)]">{cli}</span>
            <input type="range" min={1} max={30} value={cli} onChange={(e) => setCli(+e.target.value)} className="dd-range" />
          </label>
        </Reveal>
        <Reveal d={140}>
          <div className="dd-glass p-9 text-center sm:p-14" aria-live="polite">
            <p className="font-bold text-[color:var(--mut)]">O site se paga</p>
            <p className="mt-3 text-4xl font-medium tracking-tight sm:text-6xl">{when}</p>
            <div className="mx-auto my-8 h-px w-28 bg-[color:var(--line)]" />
            <p className="dd-p">Em 12 meses, sobram cerca de</p>
            <p className="mt-1 text-5xl font-medium text-[color:var(--blue)]">{year > 0 ? brl(year) : "—"}</p>
            <p className="mt-8 text-sm text-[color:var(--mut)]">Simulação ilustrativa. O resultado real depende do seu negócio e do seu atendimento.</p>
          </div>
        </Reveal>
      </div>
    </Sec>
  );
}

function Plans() {
  return (
    <Sec id="planos">
      <Reveal className="mb-16 max-w-3xl">
        <h2 className="dd-h2">Escolha o site certo para o seu momento</h2>
        <p className="dd-lead mt-6">Valores claros, pagamento único pela criação e sem letra miúda. Em cada plano explicamos o motivo do valor.</p>
      </Reveal>
      <div className="grid gap-7 md:grid-cols-3">
        {PLANS.map((pl, k) => (
          <Reveal key={pl.n} d={k * 110}>
            <div className={`dd-tile hv flex flex-col ${pl.hot ? "hot" : ""}`}>
              {pl.hot && <span className="absolute -top-4 left-8 rounded-full bg-[color:var(--ink)] px-5 py-1.5 text-sm font-bold text-[color:var(--bg)]">Mais escolhido</span>}
              <h3 className="text-3xl font-bold">{pl.n}</h3>
              <p className="dd-p mt-2">{pl.f}</p>
              <p className="mt-8 text-[clamp(2.8rem,4.5vw,4rem)] font-medium leading-none tracking-tight">{brl(pl.p)}</p>
              <p className="mt-2 text-sm text-[color:var(--mut)]">pagamento único pela criação</p>
              <ul className="mt-8 flex-1 space-y-4">{pl.list.map((x) => <li key={x} className="flex gap-3"><Tick />{x}</li>)}</ul>
              <p className="mt-8 rounded-2xl bg-[color:var(--tint)] p-5 text-[.92rem] leading-relaxed text-[color:var(--mut)]"><b className="text-[color:var(--ink)]">Por que esse valor?</b> {pl.why}</p>
              <Link to="/contato" className={`mt-7 w-full ${pl.hot ? "dd-btn" : "dd-btn-o"}`}>Quero o {pl.n}</Link>
            </div>
          </Reveal>
        ))}
      </div>
    </Sec>
  );
}

function Compare() {
  const rows = [
    ["Velocidade", "Demora e o cliente desiste", "Abre em instantes"],
    ["No celular", "Fica torto ou minúsculo", "Pensado primeiro para o celular"],
    ["No Google", "Ninguém encontra", "Preparado para ser encontrado"],
    ["Visual", "Igual ao de todo mundo", "Único, com a cara da sua marca"],
    ["Resultado", "Fica parado, só “existe”", "Feito para gerar contatos"],
  ];
  return (
    <Sec id="comparar" className="dd-band">
      <Reveal><h2 className="dd-h2 max-w-4xl">O barato sai caro quando o site não traz ninguém</h2></Reveal>
      <Reveal d={100} className="mt-12 overflow-x-auto">
        <div className="dd-glass min-w-[640px] overflow-hidden text-base">
          <div className="grid grid-cols-3 gap-4 p-6 text-lg font-bold"><span /><span className="text-[color:var(--mut)]">Site barato</span><span className="text-[color:var(--blue)]">Diamante Dev</span></div>
          {rows.map(([a, b, c]) => (
            <div key={a} className="grid grid-cols-3 items-center gap-4 border-t border-[color:var(--line)] p-6">
              <span className="font-bold">{a}</span><span className="text-[color:var(--mut)]">{b}</span><span className="flex gap-3 font-medium"><Tick />{c}</span>
            </div>
          ))}
        </div>
      </Reveal>
    </Sec>
  );
}

function Steps() {
  const s = [
    ["Conversa", "Você conta sobre o seu negócio e o que quer alcançar. Sem termos difíceis."],
    ["Desenho", "Mostramos como o site vai ficar, antes de construir."],
    ["Ajustes", "Você pede o que quiser mudar, até ficar do jeito certo."],
    ["No ar", "Publicamos o site e deixamos tudo funcionando para você."],
  ];
  return (
    <Sec id="como">
      <Reveal className="mb-14"><h2 className="dd-h2">Como funciona, do começo ao fim</h2></Reveal>
      <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {s.map(([t, d], k) => (
          <Reveal key={t} d={k * 100}>
            <li className="dd-tile hv list-none">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-[color:var(--ink)] text-xl font-bold text-[color:var(--bg)]">{k + 1}</span>
              <h3 className="mt-6 text-2xl font-bold">{t}</h3>
              <p className="dd-p mt-3">{d}</p>
            </li>
          </Reveal>
        ))}
      </ol>
    </Sec>
  );
}

function Faq() {
  const q = [
    ["Por que não fazer um site grátis, sozinho?", "Dá para fazer, mas o resultado costuma ser lento, igual ao de todo mundo e difícil de achar no Google. O nosso trabalho é fazer o site vender, e não só existir."],
    ["Em quanto tempo meu site fica pronto?", "Em média, em cerca de 32 dias, dependendo do plano e de quanto rápido você nos envia fotos e informações."],
    ["O site vai funcionar no celular?", "Sim. Ele é pensado primeiro para o celular e testado em telas de vários tamanhos."],
    ["E se eu não gostar do desenho?", "Você vê como o site vai ficar antes de ele ser construído e pede ajustes até ficar certo."],
  ];
  return (
    <section id="faq" className="scroll-mt-28 pb-28">
      <div className="dd-w max-w-4xl">
        <Reveal><h2 className="dd-h2 mb-10">Dúvidas comuns</h2></Reveal>
        <div className="divide-y divide-[color:var(--line)] border-y border-[color:var(--line)]">
          {q.map(([a, b]) => (
            <details key={a} className="py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-xl font-bold">{a}<ChevronDown className="dd-chev shrink-0 text-[color:var(--blue)]" size={26} /></summary>
              <p className="dd-p mt-4 max-w-[64ch]">{b}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function QuoteCta() {
  return (
    <section className="dd-hero !pb-[clamp(72px,9vw,136px)]">
      <Aurora />
      <div className="dd-w relative grid items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)]">
        <Reveal className="text-white">
          <h2 className="dd-h2">Seu próximo cliente já está procurando por você</h2>
          <p className="mt-6 max-w-lg text-xl leading-relaxed text-white/90">Conte sobre o seu negócio e receba uma proposta clara, com o valor e o que está incluso.</p>
          <ul className="mt-9 space-y-5 text-lg font-medium">
            <li className="flex items-center gap-3"><ClipboardCheck size={22} /> Orçamento sem compromisso</li>
            <li className="flex items-center gap-3"><Clock size={22} /> Resposta em até 24 horas úteis</li>
            <li className="flex items-center gap-3"><ShieldCheck size={22} /> O site é seu, de verdade</li>
          </ul>
        </Reveal>
        <Reveal d={140}>
          <div className="dd-card">
            <h3 className="text-3xl font-medium sm:text-4xl">Fale direto com a equipe</h3>
            <p className="dd-p mt-3">Quanto mais você contar, mais certeira será a proposta.</p>
            <ul className="mt-7 space-y-4">{["Qual é o seu negócio", "O que você quer que o site faça", "Prazo que você precisa"].map((x) => <li key={x} className="flex gap-3 font-medium"><Tick />{x}</li>)}</ul>
            <Link to="/contato" className="dd-btn mt-9 w-full">Pedir orçamento grátis <ArrowRight size={20} /></Link>
            <Link to="/sobre" className="mt-5 block text-center font-bold text-[color:var(--blue)] hover:underline">Conhecer a Diamante Dev</Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- botões laterais (igual ao print da AWS) ---------- */
function Contact() {
  const [o, setO] = useState(false);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setO(false); };
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, []);
  return (
    <>
      <a href="#planos" aria-label="Ver planos" className="fixed right-0 top-[46%] z-50 grid h-12 w-12 place-items-center rounded-l-xl border border-r-0 border-[color:var(--line)] bg-[color:var(--card)] text-[color:var(--ink)] shadow-lg transition-transform hover:-translate-x-1">
        <Star size={22} />
      </a>
      <div className="dd-fab fixed bottom-[calc(230px+env(safe-area-inset-bottom))] right-4 z-[60] xl:bottom-60 xl:right-5">

        {o && (
          <div className="dd-pop r !bottom-[84px] !top-auto !mt-0 w-[min(90vw,340px)] !p-5">
            <p className="text-xl font-bold">Fale com a Diamante Dev</p>
            <p className="dd-p mt-1 text-sm">Resposta em até 24 horas úteis.</p>
            <div className="mt-4 grid gap-3">
              <A h={WHATS} className="dd-btn !py-3.5 !text-base">Falar no WhatsApp</A>
              <A h="/contato" className="dd-btn-o !py-3.5 !text-base" onClick={() => setO(false)}>Pedir orçamento</A>
            </div>
          </div>
        )}
        <button type="button" aria-label="Contato" aria-expanded={o} onClick={() => setO(!o)}>{o ? <X size={28} /> : <MessageCircle size={30} />}</button>
      </div>
    </>
  );
}