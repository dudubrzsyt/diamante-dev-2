import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, Check, Clock, Globe, Mail, MessageCircle, ShieldCheck } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { absoluteUrl } from "@/lib/seo";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato e orçamento — Diamante Dev" },
      { name: "description", content: "Fale com a Diamante Dev pelo WhatsApp, e-mail ou Instagram. Atendimento 100% online em todo o Brasil, com resposta em até 24h úteis." },
      { property: "og:title", content: "Contato e orçamento — Diamante Dev" },
      { property: "og:description", content: "Atendimento online em todo o Brasil. Peça seu orçamento e receba resposta em até 24h úteis." },
      { property: "og:url", content: absoluteUrl("/contato") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/contato") }],
  }),
  component: Contato,
});

/* ===== AJUSTE AQUI ===== */
const WHATS = "https://wa.me/5511990047011?text=" + encodeURIComponent("Olá! Vim pelo site da Diamante Dev e quero um orçamento.");
const WHATS_TXT = "(11) 99004-7011";
const INSTAGRAM = "https://www.instagram.com/igoreduardo.dev/?hl=en"; // <- COLOQUE O LINK DO SEU INSTAGRAM AQUI
const INSTA_USER = "@igoreduardo.dev"; // <- e o @ que aparece no botão
const EMAIL = "contato@diamantedev.com.br";
const X = { target: "_blank", rel: "noopener noreferrer" } as const;

const CSS = `
@property --a{syntax:"<angle>";inherits:false;initial-value:0deg}
.dd{--bg:#fff;--card:#fff;--glass:rgba(255,255,255,.8);--ink:#161d26;--mut:#414d5c;--line:#d5dbdb;--blue:#0972d3;--tint:#e6f2fc;--band:linear-gradient(120deg,#dfe8fb,#efe3fb,#d6f1fb,#dfe8fb);font-family:"Amazon Ember","Helvetica Neue",Roboto,Arial,sans-serif;color:var(--ink);background:var(--bg);-webkit-font-smoothing:antialiased;overflow-x:clip;transition:background .4s,color .4s}
:is(.dark,[data-theme=dark],[data-mode=dark]) .dd{--bg:#04060b;--card:#0b111c;--glass:rgba(11,17,28,.78);--ink:#f3f6fb;--mut:#a9b6c9;--line:#1f2b3d;--blue:#62adff;--tint:#10243d;--band:linear-gradient(120deg,#0a1530,#1d0f36,#082a3a,#0a1530)}
.dd *{box-sizing:border-box}
.dd-w{max-width:1440px;margin:0 auto;padding:0 clamp(20px,4vw,56px)}
.dd-sec{padding:clamp(72px,9vw,136px) 0}
.dd-h1{font-size:clamp(2.3rem,5.4vw,4.7rem);font-weight:500;line-height:1.05;letter-spacing:-.025em}
.dd-h2{font-size:clamp(1.9rem,3.9vw,3.3rem);font-weight:500;line-height:1.1;letter-spacing:-.02em}
.dd-lead{font-size:clamp(1.1rem,1.6vw,1.4rem);line-height:1.55;color:var(--mut)}
.dd-p{font-size:1.05rem;line-height:1.6;color:var(--mut)}
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
.dd-card{position:relative;background:var(--glass);-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);border-radius:20px;padding:clamp(24px,4.4vw,68px);box-shadow:0 30px 80px -24px rgba(22,29,38,.5)}
.dd-online{position:relative;border-radius:28px;color:#fff;padding:clamp(26px,5vw,76px);background:radial-gradient(60% 80% at 100% 0%,rgba(76,125,255,.55),transparent 65%),radial-gradient(50% 70% at 0% 100%,rgba(168,85,247,.45),transparent 70%),#0a1424;box-shadow:0 40px 100px -30px rgba(76,125,255,.7)}
.dd-card::before,.dd-tile::before,.dd-online::before{content:"";position:absolute;inset:-2px;border-radius:inherit;padding:2px;pointer-events:none;background:conic-gradient(from var(--a),#3f73e0,#a855f7,#22d3ee,#f472b6,#fbbf24,#3f73e0);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;animation:dda 4s linear infinite;opacity:.8}
.dd-tile::before{opacity:0;transition:opacity .3s}
@keyframes dda{to{--a:360deg}}
.dd-btn,.dd-btn-o,.dd-btn-w{position:relative;isolation:isolate;display:inline-flex;align-items:center;justify-content:center;gap:10px;border-radius:999px;font-weight:700;font-size:1.1rem;padding:17px 36px;transition:transform .25s,background .25s,color .25s;cursor:pointer;text-align:center}
.dd-btn{background:var(--ink);color:var(--bg)}
.dd-btn-o{background:transparent;color:var(--ink);box-shadow:inset 0 0 0 2px var(--ink)}
.dd-btn-o:hover{background:var(--ink);color:var(--bg)}
.dd-btn-w{background:#fff;color:#161d26}
.dd-btn::before,.dd-btn-w::before,.dd-btn-o::before{content:"";position:absolute;inset:-4px;z-index:-1;border-radius:inherit;background:conic-gradient(from var(--a),#3f73e0,#a855f7,#22d3ee,#f472b6,#3f73e0);filter:blur(9px);opacity:.5;transition:opacity .3s;animation:dda 3s linear infinite}
.dd-btn-o::before{opacity:0}
.dd-btn:hover,.dd-btn-w:hover,.dd-btn-o:hover{transform:translateY(-3px) scale(1.04)}
.dd-btn:hover::before,.dd-btn-w:hover::before,.dd-btn-o:hover::before{opacity:1}
.dd :is(a,button,summary,input,textarea,select):focus-visible{outline:3px solid var(--blue);outline-offset:3px}
.dd-curve{position:relative;z-index:1;margin-top:calc(-1*clamp(96px,11vw,170px));background:var(--bg);border-radius:clamp(48px,8vw,136px) clamp(48px,8vw,136px) 0 0;padding-top:clamp(64px,8vw,112px);transition:background .4s}
.dd-tile{position:relative;background:var(--card);border:1px solid var(--line);border-radius:22px;padding:clamp(24px,2.6vw,38px);height:100%;transition:transform .3s,box-shadow .3s,background .4s}
.dd-tile.hv:hover,.dd-tile.hot{transform:translateY(-8px);box-shadow:0 26px 60px -22px rgba(76,125,255,.55)}
.dd-tile.hv:hover::before,.dd-tile.hot::before{opacity:1}
.dd-tile.hv::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:linear-gradient(115deg,transparent 40%,rgba(76,125,255,.22) 50%,transparent 60%) 150% 0/250% 100% no-repeat;transition:background-position .9s}
.dd-tile.hv:hover::after{background-position:-50% 0}
.dd-ico{display:grid;place-items:center;width:64px;height:64px;border-radius:999px;background:var(--tint);color:var(--blue);transition:transform .35s,background .35s}
.dd-tile:hover .dd-ico{transform:rotate(-12deg) scale(1.2);background:linear-gradient(135deg,#3f73e0,#a855f7);color:#fff}
.dd-tick{display:grid;place-items:center;flex:none;width:24px;height:24px;border-radius:999px;background:var(--tint);color:var(--blue);margin-top:1px}
.dd-band{position:relative;background:var(--band);background-size:300% 300%;animation:ddg 14s ease-in-out infinite}
.dd-phone{position:relative;margin:0 auto;width:min(74vw,330px);aspect-ratio:9/18.5;border-radius:44px;border:8px solid #2c3a52;overflow:hidden;background:linear-gradient(160deg,#4a7be0,#9a8cf0 55%,#f0a6e0);background-size:200% 200%;animation:ddg 8s ease-in-out infinite;box-shadow:0 50px 110px -30px rgba(76,125,255,.85)}
.dd-rv{opacity:0;transform:translateY(70px) scale(.93);filter:blur(8px);transition:opacity .75s cubic-bezier(.2,.8,.2,1),transform .75s cubic-bezier(.2,.8,.2,1),filter .75s}
.dd-rv.in{opacity:1;transform:none;filter:none}
.dd-float{animation:ddf 6s ease-in-out infinite}
@keyframes ddf{50%{transform:translateY(-16px) rotate(.8deg)}}
.dd-slam{animation:ddsl .9s cubic-bezier(.2,.9,.2,1) both}
@keyframes ddsl{from{opacity:0;transform:translateY(60px) scale(.9);filter:blur(10px)}}
.dd-fab>a{position:relative;display:grid;place-items:center;width:68px;height:68px;border-radius:18px;background:#161d26;color:#fff;border:1px solid #2b3a52;box-shadow:0 14px 34px -8px rgba(0,0,0,.6);transition:transform .25s}
.dd-fab>a::after{content:"";position:absolute;inset:0;border-radius:inherit;border:2px solid #62adff;animation:ddrg 2.2s ease-out infinite}
.dd-fab>a:hover{transform:scale(1.1) rotate(-6deg)}
@keyframes ddrg{to{transform:scale(1.5);opacity:0}}
.dd-grad{background:linear-gradient(90deg,#3f73e0,#a855f7,#22d3ee,#f472b6,#3f73e0);background-size:300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:ddtx 5s linear infinite}
@keyframes ddtx{to{background-position:300% 0}}
.dd-live{display:inline-flex;align-items:center;gap:12px;border-radius:999px;padding:11px 22px;background:#0b3d24;color:#bbf7d0;font-weight:800;font-size:.82rem;letter-spacing:.16em;text-transform:uppercase;box-shadow:0 0 0 1px #22c55e66,0 10px 30px -8px #22c55e88}
.dd-live i{position:relative;flex:none;width:12px;height:12px;border-radius:50%;background:#22c55e}
.dd-live i::after{content:"";position:absolute;inset:0;border-radius:50%;background:#22c55e;animation:ddpn 1.6s ease-out infinite}
@keyframes ddpn{to{transform:scale(3.4);opacity:0}}
.dd-orb{position:relative;display:grid;place-items:center;width:min(66vw,300px);aspect-ratio:1;margin:0 auto}
.dd-orb i{position:absolute;border-radius:50%;border:2px dashed rgba(255,255,255,.4);animation:ddsp 16s linear infinite}
.dd-orb i:nth-child(1){inset:0}
.dd-orb i:nth-child(2){inset:14%;animation-duration:10s;animation-direction:reverse;border-color:rgba(98,173,255,.75)}
.dd-orb i:nth-child(3){inset:28%;animation-duration:6s;border-style:solid;border-color:rgba(168,85,247,.75)}
.dd-orb i::after{content:"";position:absolute;top:-7px;left:50%;width:12px;height:12px;margin-left:-6px;border-radius:50%;background:#22d3ee;box-shadow:0 0 18px #22d3ee}
.dd-orb span{position:relative;display:grid;place-items:center;width:34%;aspect-ratio:1;border-radius:50%;background:linear-gradient(135deg,#3f73e0,#a855f7);animation:ddbt 2.2s ease-in-out infinite}
@keyframes ddsp{to{transform:rotate(360deg)}}
@keyframes ddbt{50%{transform:scale(1.14)}}
.dd-marq{overflow:hidden;white-space:nowrap;padding:clamp(18px,3vw,34px) 0}
.dd-mqt{display:flex;width:max-content;animation:ddmq 26s linear infinite}
.dd-marq:hover .dd-mqt{animation-play-state:paused}
.dd-mqt>div{display:flex;flex:none;gap:2.5rem;padding-right:2.5rem;font-size:clamp(1.5rem,3.8vw,3.2rem);font-weight:800;text-transform:uppercase;letter-spacing:-.01em}
.dd-mqt b{color:var(--blue)}
@keyframes ddmq{to{transform:translateX(-50%)}}
.dd-b{opacity:0;animation:ddb .6s cubic-bezier(.2,.9,.3,1.3) forwards}
@keyframes ddb{from{opacity:0;transform:translateY(26px) scale(.8)}to{opacity:1;transform:none}}
.dd-ty{display:inline-flex;gap:5px}
.dd-ty i{width:8px;height:8px;border-radius:50%;background:#161d26;animation:ddty 1s ease-in-out infinite}
.dd-ty i:nth-child(2){animation-delay:.15s}
.dd-ty i:nth-child(3){animation-delay:.3s}
@keyframes ddty{50%{transform:translateY(-6px);opacity:.45}}
.dd-wig{animation:ddwg 2.6s ease-in-out infinite}
@keyframes ddwg{0%,60%,100%{transform:rotate(0)}10%,30%{transform:rotate(-14deg)}20%,40%{transform:rotate(14deg)}}
@media (prefers-reduced-motion:reduce){.dd *,.dd *::before,.dd *::after{animation:none!important;transition:none!important}.dd-rv,.dd-b{opacity:1;transform:none;filter:none}}
`;

function Contato() {
  return (
    <main className="dd">
      <style>{CSS}</style>
      <Hero />
      <Stats />
      <Online />
      <Channels />
      <Marquee />
      <Message />
      <FinalCta />
      <Fab />
    </main>
  );
}

/* ---------- utilitários ---------- */
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
const Insta = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".6" fill="currentColor" />
  </svg>
);

/* ---------- mockup de conversa ---------- */
function Chat() {
  return (
    <div className="dd-phone dd-float" aria-hidden>
      <div className="absolute left-1/2 top-2 h-4 w-24 -translate-x-1/2 rounded-full bg-black/60" />
      <div className="flex h-full flex-col justify-end gap-3 p-5 pb-8 text-sm font-medium">
        <p className="mb-auto mt-8 flex items-center gap-3 font-bold text-white">
          <span className="dd-live !gap-2 !px-3 !py-1.5 !text-[10px]"><i />online</span>Diamante Dev
        </p>
        <span className="dd-b self-end rounded-2xl rounded-br-sm bg-white px-4 py-3 text-[#161d26]" style={{ animationDelay: ".6s" }}>Oi! Quero um site para o meu negócio.</span>
        <span className="dd-b self-start rounded-2xl rounded-bl-sm bg-[#161d26] px-4 py-3 text-white" style={{ animationDelay: "1.5s" }}>Claro! Me conta o que você faz e já preparo a proposta.</span>
        <span className="dd-b dd-ty self-end rounded-2xl rounded-br-sm bg-white px-4 py-4" style={{ animationDelay: "2.4s" }}><i /><i /><i /></span>
      </div>
    </div>
  );
}

/* ---------- seções ---------- */
function Hero() {
  return (
    <section className="dd-hero dd-first">
      <Aurora />
      <div className="dd-w relative grid items-center gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,.8fr)]">
        <div className="dd-card dd-slam">
          <span className="dd-live"><i />Atendimento online</span>
          <h1 className="dd-h1 mt-6">Vamos <span className="dd-grad">conversar</span> sobre o seu site?</h1>
          <p className="dd-lead mt-7 max-w-2xl">Atendemos 100% online, em todo o Brasil. Chame no WhatsApp, mande um e-mail ou fale pelo Instagram e receba uma proposta clara em até 24 horas úteis.</p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <a href={WHATS} {...X} className="dd-btn w-full sm:w-auto"><MessageCircle size={22} />Chamar no WhatsApp</a>
            <a href={INSTAGRAM} {...X} className="dd-btn-o w-full sm:w-auto"><Insta size={22} />Instagram</a>
          </div>
        </div>
        <div className="dd-slam flex justify-center lg:justify-end" style={{ animationDelay: ".2s" }}><Chat /></div>
      </div>
    </section>
  );
}

function Stats() {
  const s = [["24h", "úteis para você receber a resposta"], ["100%", "online, sem precisar sair de casa"], ["Brasil", "inteiro: atendemos onde você estiver"]];
  return (
    <div className="dd-curve">
      <div className="dd-w pb-4">
        <div className="grid gap-10 sm:grid-cols-3">
          {s.map(([n, l], k) => (
            <Reveal key={n} d={k * 110}>
              <div className="border-l-4 border-[color:var(--blue)] pl-6">
                <p className="text-[clamp(2.8rem,6vw,5rem)] font-medium leading-none tracking-tight">{n}</p>
                <p className="dd-p mt-3 max-w-[24ch]">{l}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}

function Online() {
  return (
    <Sec id="online">
      <Reveal>
        <div className="dd-online grid items-center gap-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,.7fr)]">
          <div>
            <span className="dd-live"><i />Atendimento online</span>
            <h2 className="dd-h2 mt-7">Atendimento <span className="dd-grad">100% online</span>, onde você estiver</h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85 sm:text-xl">Sem deslocamento, sem fila e sem perder tempo. Conversamos pelo WhatsApp ou e-mail e levamos o seu projeto do primeiro contato até o site no ar.</p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <a href={WHATS} {...X} className="dd-btn-w w-full sm:w-auto"><MessageCircle size={22} />Falar agora</a>
            </div>
          </div>
          <div className="dd-orb" aria-hidden><i /><i /><i /><span><Globe size={44} color="#fff" /></span></div>
        </div>
      </Reveal>
    </Sec>
  );
}

function Channels() {
  const c = [
    { i: MessageCircle, t: "WhatsApp", d: WHATS_TXT, s: "O jeito mais rápido de falar com a gente.", h: WHATS, hot: true },
    { i: Mail, t: "E-mail", d: EMAIL, s: "Ideal para mandar detalhes e referências.", h: `mailto:${EMAIL}` },
    { i: Insta, t: "Instagram", d: INSTA_USER, s: "Veja nossos projetos e mande uma mensagem.", h: INSTAGRAM },
  ];
  return (
    <Sec id="canais" className="!pt-0">
      <Reveal className="mb-14 max-w-4xl">
        <h2 className="dd-h2">Escolha como prefere falar com a gente</h2>
        <p className="dd-lead mt-6">Três canais, a mesma atenção. Resposta em até 24 horas úteis.</p>
      </Reveal>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {c.map((x, k) => (
          <Reveal key={x.t} d={k * 110} className={k === 2 ? "md:col-span-2 lg:col-span-1" : ""}>
            <a href={x.h} {...(x.h.startsWith("http") ? X : {})} className={`dd-tile hv group flex h-full flex-col ${x.hot ? "hot" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="dd-ico"><x.i size={30} /></div>
                {x.hot && <span className="rounded-full bg-[color:var(--ink)] px-4 py-1.5 text-sm font-bold text-[color:var(--bg)]">Mais rápido</span>}
              </div>
              <h3 className="mt-6 text-2xl font-bold">{x.t}</h3>
              <p className="mt-2 text-xl font-medium [overflow-wrap:anywhere] sm:text-2xl">{x.d}</p>
              <p className="dd-p mt-3 flex-1">{x.s}</p>
              <span className="mt-7 inline-flex items-center gap-2 font-bold text-[color:var(--blue)]">Abrir <ArrowRight size={18} className="transition-transform group-hover:translate-x-2" /></span>
            </a>
          </Reveal>
        ))}
      </div>
    </Sec>
  );
}

function Marquee() {
  const w = ["Atendimento online", "Todo o Brasil", "Resposta em até 24h", "WhatsApp", "Orçamento grátis"];
  return (
    <div className="dd-marq dd-band" aria-hidden>
      <div className="dd-mqt">
        {[0, 1].map((n) => <div key={n}>{w.map((x) => <span key={x}>{x} <b>✦</b></span>)}</div>)}
      </div>
    </div>
  );
}

function Message() {
  return (
    <Sec id="mensagem">
      <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] lg:gap-16">
        <Reveal>
          <h2 className="dd-h2">Prefere escrever por aqui? Mande sua mensagem</h2>
          <p className="dd-lead mt-5">Quanto mais você contar, mais certeira será a proposta.</p>
          <ul className="mt-9 space-y-5 text-lg">
            {["Qual é o seu negócio", "O que você quer que o site faça", "Prazo que você precisa"].map((x) => <li key={x} className="flex items-start gap-4 font-medium"><Tick />{x}</li>)}
          </ul>
          <div className="mt-10 flex flex-col gap-4 font-bold sm:flex-row sm:flex-wrap sm:gap-x-10">
            <span className="flex items-center gap-3"><ShieldCheck size={22} className="text-[color:var(--blue)]" />Orçamento sem compromisso</span>
            <span className="flex items-center gap-3"><Clock size={22} className="text-[color:var(--blue)]" />Resposta em até 24h úteis</span>
          </div>
        </Reveal>
        <Reveal d={140}>
          <div className="dd-online !p-5 sm:!p-10">
            <p className="mb-6 text-2xl font-bold sm:text-3xl">Enviar mensagem</p>
            <ContactForm />
          </div>
        </Reveal>
      </div>
    </Sec>
  );
}

function FinalCta() {
  return (
    <section className="dd-hero !pb-[clamp(72px,9vw,136px)]">
      <Aurora />
      <div className="dd-w relative">
        <Reveal className="mx-auto max-w-4xl text-center text-white">
          <h2 className="dd-h2">Seu próximo cliente está a uma mensagem de distância</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/90 sm:text-xl">Atendimento online, proposta clara e o site 100% seu. Escolha o canal e chame agora.</p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <a href={WHATS} {...X} className="dd-btn-w w-full sm:w-auto"><MessageCircle size={22} />WhatsApp</a>
            <a href={INSTAGRAM} {...X} className="dd-btn w-full sm:w-auto"><Insta size={22} />Instagram</a>
          </div>
          <Link to="/" hash="planos" className="mt-9 inline-flex items-center gap-2 font-bold underline underline-offset-4">Ver planos e valores <ArrowRight size={18} /></Link>
        </Reveal>
      </div>
    </section>
  );
}

function Fab() {
  return (
    <div className="dd-fab fixed bottom-[calc(92px+env(safe-area-inset-bottom))] right-4 z-[60] xl:bottom-5 xl:right-5">
      <a href={WHATS} {...X} aria-label="Chamar no WhatsApp"><MessageCircle size={30} className="dd-wig" /></a>
    </div>
  );
}