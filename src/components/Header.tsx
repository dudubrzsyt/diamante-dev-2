import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown, FileText, Globe, Home, LayoutGrid, Menu, Search, UserRound, X } from "lucide-react";

/* ===== AJUSTE AQUI ===== */
const WHATS = "https://wa.me/5511999999999"; // seu WhatsApp
export const LOGIN = "/login"; // rota de login
export const SIGNUP = "/criar-conta"; // rota de criar conta
export const NAV = [
  { to: "/", label: "Início" },
  { to: "/produtos", label: "Produtos" },
  { to: "/servicos", label: "Serviços" },
  { to: "/comunidade", label: "Comunidade" },
  { to: "/corte-e-dobra", label: "Corte e dobra" },
  { to: "/armaduras-prontas", label: "Armaduras prontas" },
  { to: "/solucoes-para-construtoras", label: "Para construtoras" },
  { to: "/vergalhao-ca-50", label: "Vergalhão CA-50" },
  { to: "/entrega-de-aco", label: "Entrega de aço" },
  { to: "/consultoria-tecnica", label: "Consultoria" },
  { to: "/orcamento-de-aco", label: "Orçamento" },
  { to: "/sobre", label: "Sobre" },
  { to: "/contato", label: "Contato" },
] as const;
export const ROUTES: string[] = [...NAV.map((i) => i.to), "/perfil"]; // rotas que usam <Link>

/* ===== IDIOMA GLOBAL =====
   Salva em localStorage("lang"), atualiza <html lang> e avisa o site pelo evento "dd:lang".
   Em qualquer página: import { useLang } from "@/components/Header"; const [lang] = useLang(); */
export type L = "pt" | "en" | "es";
export const LANGS: [L, string][] = [["pt", "Português"], ["en", "English"], ["es", "Español"]];
const T = {
  pt: { contact: "Entre em contato conosco", port: "Portfólio", support: "Suporte", account: "Minha conta", home: "Início", discover: "Descubra", products: "Planos", solutions: "Soluções", pricing: "Preços", resources: "Recursos", search: "Pesquisar", ph: "Pesquisar páginas e seções", login: "Fazer login", signup: "Criar conta", wa: "Falar no WhatsApp", quote: "Pedir orçamento", none: "Nada encontrado. Fale com a equipe.", menu: "Menu", more: "Mais", all: "Todas as páginas", profile: "Meu perfil" },
  en: { contact: "Contact us", port: "Portfolio", support: "Support", account: "My account", home: "Home", discover: "Discover", products: "Plans", solutions: "Solutions", pricing: "Pricing", resources: "Resources", search: "Search", ph: "Search pages and sections", login: "Sign in", signup: "Create account", wa: "Chat on WhatsApp", quote: "Get a quote", none: "Nothing found. Talk to our team.", menu: "Menu", more: "More", all: "All pages", profile: "My profile" },
  es: { contact: "Contáctenos", port: "Portafolio", support: "Soporte", account: "Mi cuenta", home: "Inicio", discover: "Descubre", products: "Planes", solutions: "Soluciones", pricing: "Precios", resources: "Recursos", search: "Buscar", ph: "Buscar páginas y secciones", login: "Iniciar sesión", signup: "Crear cuenta", wa: "Hablar por WhatsApp", quote: "Pedir presupuesto", none: "Nada encontrado. Habla con el equipo.", menu: "Menú", more: "Más", all: "Todas las páginas", profile: "Mi perfil" },
};
export function useLang(): [L, (l: L) => void] {
  const [l, setL] = useState<L>("pt");
  useEffect(() => {
    try { const s = localStorage.getItem("lang") as L | null; if (s && s in T) setL(s); } catch { /* sem storage */ }
    const h = (e: Event) => setL((e as CustomEvent<L>).detail);
    window.addEventListener("dd:lang", h);
    return () => window.removeEventListener("dd:lang", h);
  }, []);
  const set = (n: L) => {
    try { localStorage.setItem("lang", n); } catch { /* sem storage */ }
    document.documentElement.lang = n === "pt" ? "pt-BR" : n;
    window.dispatchEvent(new CustomEvent("dd:lang", { detail: n }));
    setL(n);
  };
  return [l, set];
}

/* ===== MENUS: [título, destino, descrição]. "/#id" leva à seção da home, de qualquer página ===== */
type Sub = [string, string, string];
const MENU: { k: "discover" | "products" | "solutions" | "pricing" | "resources"; sub: Sub[] }[] = [
  { k: "discover", sub: [["Por que a Diamante Dev", "/#incluso", "Sites feitos para trazer cliente"], ["Seu site no celular", "/#vitrine", "Veja o resultado antes de ir ao ar"], ["Como funciona", "/#como", "Do primeiro contato ao site no ar"], ["Sobre a equipe", "/sobre", "Quem está por trás da Diamante"]] },
  { k: "products", sub: [["Essencial", "/#planos", "Para ser encontrado"], ["Profissional", "/#planos", "Para vender todo mês"], ["Premium", "/#planos", "Para marcas que querem ser lembradas"], ["Todos os produtos", "/produtos", "Veja tudo o que oferecemos"]] },
  { k: "solutions", sub: [["Serviços", "/servicos", "O que fazemos pelo seu negócio"], ["Segmentos atendidos", "/#segmentos", "Clínicas, lojas, restaurantes e mais"], ["Site barato x Diamante", "/#comparar", "Veja a diferença lado a lado"]] },
  { k: "pricing", sub: [["Planos e valores", "/#planos", "Pagamento único, sem letra miúda"], ["Calculadora de retorno", "/#calculadora", "Em quanto tempo o site se paga"], ["Pedir orçamento grátis", "/contato", "Proposta clara, sem compromisso"]] },
  { k: "resources", sub: [["Comunidade", "/comunidade", "Conteúdo e novidades"], ["Perguntas frequentes", "/#faq", "Tire suas dúvidas"], ["Falar no WhatsApp", WHATS, "Resposta em até 24 horas úteis"], ["Meu perfil", "/perfil", "Sua conta e seus dados"]] },
];

const plain = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const CSS = `
@property --a{syntax:"<angle>";inherits:false;initial-value:0deg}
.dh{--bg:#fff;--card:#fff;--ink:#161d26;--mut:#414d5c;--line:#d5dbdb;--blue:#0972d3;--tint:#e6f2fc;--top:#232f3e;--glass:rgba(255,255,255,.52);--rim:rgba(255,255,255,.75);--hi:rgba(255,255,255,.95);--lo:rgba(0,0,0,.07);--pill:rgba(60,60,67,.16);font-family:"Amazon Ember","Helvetica Neue",Roboto,Arial,sans-serif;color:var(--ink);-webkit-font-smoothing:antialiased}
:is(.dark,[data-theme=dark],[data-mode=dark]) .dh{--bg:#04060b;--card:#0b111c;--ink:#f3f6fb;--mut:#a9b6c9;--line:#1f2b3d;--blue:#62adff;--tint:#10243d;--top:#090d14;--glass:rgba(26,28,34,.5);--rim:rgba(255,255,255,.2);--hi:rgba(255,255,255,.3);--lo:rgba(255,255,255,.06);--pill:rgba(255,255,255,.2)}
.dh *{box-sizing:border-box}
.dh-w{max-width:1440px;margin:0 auto;padding:0 clamp(16px,4vw,56px)}
.dh-top{background:var(--top);color:#fff;border-bottom:1px solid rgba(255,255,255,.07)}
.dh-tb{display:inline-flex;align-items:center;gap:7px;padding:10px 8px;font-weight:500;font-size:.93rem;color:#fff;white-space:nowrap;transition:color .2s}
.dh-tb:hover{color:#8ec5ff;text-decoration:underline}
.dh-nav{position:relative;background:color-mix(in srgb,var(--bg) 94%,transparent);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border-bottom:1px solid var(--line);transition:box-shadow .3s,background .4s}
.dh-nav.sc{box-shadow:0 16px 36px -20px rgba(9,30,66,.55)}
.dh-nl{position:relative;display:inline-flex;align-items:center;gap:6px;padding:14px 16px;font-weight:500;font-size:1.03rem;color:var(--ink);white-space:nowrap}
.dh-nl::after{content:"";position:absolute;left:16px;right:16px;bottom:5px;height:3px;border-radius:3px;background:linear-gradient(90deg,#3f73e0,#a855f7,#22d3ee);transform:scaleX(0);transform-origin:left;transition:transform .3s}
.dh-nl:hover::after,.dh-nl.on::after{transform:scaleX(1)}
.dh-pop{position:absolute;top:100%;left:0;margin-top:10px;min-width:330px;z-index:70;background:var(--card);color:var(--ink);border:1px solid var(--line);border-radius:16px;padding:8px;box-shadow:0 28px 70px -18px rgba(9,30,66,.55);animation:dhpop .28s cubic-bezier(.2,.9,.3,1.25)}
.dh-pop::before{content:"";position:absolute;left:0;right:0;top:-14px;height:14px}
.dh-pop.r{left:auto;right:0}
.dh-it{display:flex;width:100%;align-items:center;justify-content:space-between;gap:14px;padding:12px 16px;border-radius:12px;text-align:left;font-weight:500;color:var(--ink);transition:background .15s,padding .2s}
.dh-it:hover{background:var(--tint);padding-left:22px}
.dh-it small{display:block;margin-top:2px;font-size:.82rem;font-weight:400;color:var(--mut)}
@keyframes dhpop{from{opacity:0;transform:translateY(14px) scale(.94);filter:blur(6px)}}
.dh-btn,.dh-btn-o{position:relative;isolation:isolate;display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:999px;font-weight:700;font-size:1rem;padding:13px 28px;white-space:nowrap;transition:transform .25s,background .25s,color .25s}
.dh-btn{background:var(--ink);color:var(--bg)}
.dh-btn-o{color:var(--ink);box-shadow:inset 0 0 0 2px var(--ink)}
.dh-btn-o:hover{background:var(--ink);color:var(--bg)}
.dh-btn::before{content:"";position:absolute;inset:-4px;z-index:-1;border-radius:inherit;background:conic-gradient(from var(--a),#3f73e0,#a855f7,#22d3ee,#f472b6,#3f73e0);filter:blur(9px);opacity:.5;transition:opacity .3s;animation:dha 3s linear infinite}
.dh-btn:hover::before{opacity:1}
.dh-btn:hover,.dh-btn-o:hover{transform:translateY(-2px) scale(1.03)}
@keyframes dha{to{--a:360deg}}
.dh-it.on{background:var(--tint);color:var(--blue)}
.dh-it small:empty{display:none}
.dh-nav::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:3px;background:linear-gradient(90deg,#3f73e0,#a855f7,#22d3ee,#f472b6,#fbbf24,#3f73e0);background-size:300% 100%;animation:dhfl 6s linear infinite}
@keyframes dhfl{to{background-position:300% 0}}
@keyframes dhfw{to{background-position:200% 0}}
.dh-logo{display:grid;place-items:center;flex:none;width:48px;height:48px;border-radius:15px;padding:2px;background:conic-gradient(from var(--a),#3f73e0,#a855f7,#22d3ee,#f472b6,#3f73e0);animation:dha 4s linear infinite;transition:transform .3s}
.dh-logo img{width:100%;height:100%;border-radius:13px;object-fit:cover;background:var(--bg)}
.dh-logo:hover{transform:rotate(-6deg) scale(1.07)}
.dh-word{position:relative;display:inline-block;padding-bottom:11px;font-size:clamp(1.2rem,4.4vw,1.85rem);font-weight:700;letter-spacing:-.03em;line-height:1;text-transform:lowercase;color:var(--ink);white-space:nowrap}
.dh-word b{font-weight:700;background:linear-gradient(90deg,#3f73e0,#a855f7,#f472b6,#3f73e0);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:dhfw 5s linear infinite}
.dh-word svg{position:absolute;left:0;bottom:0;width:100%;height:10px}
.dh-wide{width:min(94vw,860px);display:grid;grid-template-columns:repeat(3,1fr);gap:2px 8px;padding:12px}
.dh-cap{grid-column:1/-1;padding:8px 16px 10px;font-size:.85rem;font-weight:700;color:var(--mut)}
.dh-chip{display:flex;min-height:48px;align-items:center;justify-content:center;padding:8px;border:1px solid var(--line);border-radius:12px;text-align:center;font-weight:600;font-size:.95rem;color:var(--ink);transition:background .2s,color .2s,transform .2s}
.dh-chip:hover{background:var(--tint);transform:translateY(-2px)}
.dh-chip.on{background:var(--ink);color:var(--bg);border-color:var(--ink)}
@media(max-width:900px){.dh-wide{grid-template-columns:repeat(2,1fr)}}
.dh .dh-hsm,.dh .dh-hmd,.dh .dh-hlg,.dh .dh-h2xl{display:none}
@media(min-width:640px){.dh .dh-hsm{display:inline-flex}}
@media(min-width:768px){.dh .dh-hmd{display:inline-flex}}
@media(min-width:1024px){.dh .dh-hlg{display:inline-flex}}
@media(min-width:1536px){.dh .dh-h2xl{display:inline-flex}}
@media(min-width:1280px){.dh .dh-menu,.dh .dh-dock,.dh .dh-sheet,.dh .dh-scrim{display:none}}
@media(max-width:639px){.dh .dh-top .dh-tb{padding:6px;font-size:.82rem}.dh-nav::after{height:2px}}
.dh-menu{display:inline-flex;align-items:center;gap:8px;height:38px;padding:0 12px;border-radius:999px;border:1px solid var(--line);background:var(--tint);color:var(--ink);font-weight:600;font-size:.95rem;transition:transform .18s,background .2s;-webkit-tap-highlight-color:transparent}
.dh-menu:active{transform:scale(.92)}
@media(min-width:640px){.dh-menu{height:44px;padding:0 18px}}
.dh-scrim{position:fixed;inset:0;z-index:-10;background:rgba(0,0,0,.42);animation:dhfd .2s ease-out}
@keyframes dhfd{from{opacity:0}}
.dh-sheet{position:fixed;left:8px;right:8px;bottom:calc(86px + env(safe-area-inset-bottom));z-index:55;max-height:min(72svh,640px);overflow-y:auto;overscroll-behavior:contain;padding:10px 16px 16px;border-radius:28px;background:var(--card);border:1px solid var(--line);box-shadow:0 30px 80px -20px rgba(0,0,0,.6);animation:dhsh .26s cubic-bezier(.2,.9,.3,1);will-change:transform,opacity}
@media(min-width:640px){.dh-sheet{left:50%;right:auto;width:min(560px,calc(100% - 32px));margin-left:calc(min(560px,100% - 32px)/-2)}}
@keyframes dhsh{from{opacity:0;transform:translateY(26px) scale(.97)}}
.dh-grab{display:block;width:40px;height:5px;margin:0 auto 10px;border-radius:5px;background:var(--line)}
.dh-dock{position:fixed;left:50%;bottom:calc(10px + env(safe-area-inset-bottom));z-index:60;width:min(calc(100% - 24px),440px);height:64px;padding:6px;display:grid;grid-template-columns:repeat(5,1fr);border-radius:999px;transform:translate(-50%,0);background:var(--glass);-webkit-backdrop-filter:blur(22px) saturate(1.9) brightness(1.06);backdrop-filter:blur(22px) saturate(1.9) brightness(1.06);border:1px solid var(--rim);box-shadow:inset 0 1px 1px var(--hi),inset 0 -1px 1px var(--lo),0 18px 40px -14px rgba(0,0,0,.5),0 2px 8px rgba(0,0,0,.12);transition:transform .4s cubic-bezier(.3,1.2,.5,1),opacity .25s}
.dh-dock::before{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(180deg,rgba(255,255,255,.4),transparent 48%);opacity:.55;pointer-events:none}
.dh-dock.hide{transform:translate(-50%,150%);opacity:0}
.dh-ind{position:absolute;left:6px;top:6px;bottom:6px;width:calc((100% - 12px)/5);border-radius:999px;background:var(--pill);box-shadow:inset 0 1px 1px var(--hi),0 2px 10px rgba(0,0,0,.1);transition:transform .45s cubic-bezier(.3,1.35,.5,1),opacity .2s;will-change:transform}
.dh-cell{position:relative;z-index:1;display:grid;place-items:center;border-radius:999px;color:var(--ink);-webkit-tap-highlight-color:transparent;transition:transform .2s cubic-bezier(.3,1.5,.5,1)}
.dh-cell:active{transform:scale(.84)}
.dh-av{width:30px;height:30px;border-radius:999px;object-fit:cover;box-shadow:0 0 0 2px var(--ink)}
.dh-slam{animation:dhsl .5s cubic-bezier(.2,.9,.2,1) both}
@keyframes dhsl{from{opacity:0;transform:translateY(24px) scale(.96);filter:blur(6px)}}
.dh-chev{transition:transform .25s}
.dh-chev.rot,.dh details[open] .dh-chev{transform:rotate(180deg)}
.dh summary::-webkit-details-marker{display:none}
.dh :is(a,button,summary,input):focus-visible{outline:3px solid var(--blue);outline-offset:3px}
@media (prefers-reduced-motion:reduce){.dh *,.dh *::before,.dh *::after{animation:none!important;transition:none!important}}
`;

/* ---------- utilitários ---------- */
function A({ h, children, className, onClick }: { h: string; children: ReactNode; className?: string; onClick?: () => void }) {
  if (h.startsWith("/#")) return <Link to="/" hash={h.slice(2)} className={className} onClick={onClick}>{children}</Link>;
  if (ROUTES.includes(h)) return <Link to={h as "/"} className={className} onClick={onClick}>{children}</Link>;
  const ext = h.startsWith("http");
  return <a href={h} className={className} onClick={onClick} {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{children}</a>;
}

function Drop({ label, children, align = "left", btn, wrap = "", pop = "" }: { label: ReactNode; children: ReactNode; align?: "left" | "right"; btn: string; wrap?: string; pop?: string }) {
  const [o, setO] = useState(false);
  const r = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const f = (e: MouseEvent) => { if (r.current && !r.current.contains(e.target as Node)) setO(false); };
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setO(false); };
    document.addEventListener("mousedown", f);
    window.addEventListener("keydown", k);
    return () => { document.removeEventListener("mousedown", f); window.removeEventListener("keydown", k); };
  }, []);
  return (
    <div ref={r} className={`relative ${wrap}`} onMouseEnter={() => setO(true)} onMouseLeave={() => setO(false)}>
      <button type="button" className={btn} aria-expanded={o} aria-haspopup="true" onClick={() => setO(true)}>
        {label}<ChevronDown size={15} className={`dh-chev ${o ? "rot" : ""}`} />
      </button>
      {o && <div className={`dh-pop ${align === "right" ? "r" : ""} ${pop}`} onClick={() => setO(false)}>{children}</div>}
    </div>
  );
}

/* ---------- header ---------- */
export function Header() {
  const [lang, setLang] = useLang();
  const t = T[lang];
  const [open, setOpen] = useState(false);
  const [find, setFind] = useState(false);
  const [q, setQ] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [photo, setPhoto] = useState("");
  const [hideDock, setHideDock] = useState(false);
  const lastY = useRef(0);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const barRef = useRef<HTMLDivElement>(null);

  const all = useMemo(() => {
    const seen = new Set<string>();
    return [...MENU.flatMap((m) => m.sub), ...NAV.map((i): Sub => [i.label, i.to, ""])].filter(([n]) => !seen.has(n) && !!seen.add(n));
  }, []);
  const results = useMemo(() => {
    const n = plain(q.trim());
    return n ? all.filter(([a, , d]) => plain(a + " " + d).includes(n)) : all;
  }, [q, all]);

  const closeAll = () => { setOpen(false); setFind(false); setQ(""); };
  const go = (h: string) => {
    if (h.startsWith("http")) window.open(h, "_blank", "noopener");
    else if (h.startsWith("/#")) navigate({ to: "/", hash: h.slice(2) });
    else if (ROUTES.includes(h)) navigate({ to: h as "/" });
    else window.location.href = h;
  };

  /* fecha tudo ao trocar de página */
  useEffect(() => { closeAll(); }, [pathname]);

  /* publica a altura real (barra escura + menu) em --header-h: use nas páginas como padding-top */
  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const publish = () => document.documentElement.style.setProperty("--header-h", `${el.offsetHeight}px`);
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* foto do perfil (mesma chave que o resto do site) */
  useEffect(() => {
    try {
      const p = localStorage.getItem("nova-bill-profile");
      if (p) setPhoto((JSON.parse(p) as { photo?: string }).photo || "");
    } catch { /* perfil inválido: segue sem foto */ }
    const on = (e: Event) => setPhoto((e as CustomEvent<{ photo?: string }>).detail?.photo || "");
    window.addEventListener("nova-bill-profile-updated", on);
    return () => window.removeEventListener("nova-bill-profile-updated", on);
  }, []);

  /* trava a rolagem do fundo com o menu mobile aberto */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => {
    const on = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      const d = y - lastY.current;
      if (Math.abs(d) > 10) { setHideDock(d > 0 && y > 160); lastY.current = y; }
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAll();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen(false); setFind((v) => !v); }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  const langName = LANGS.find(([k]) => k === lang)![1];
  const idx = open ? 1 : find ? 3 : pathname === "/" ? 0 : pathname === "/contato" ? 2 : pathname === "/perfil" ? 4 : -1;

  return (
    <header className="dh fixed inset-x-0 top-0 z-50">
      <style>{CSS}</style>
      <div ref={barRef}>
        {/* barra escura (sempre visível) */}
        <div className="dh-top">
          <div className="dh-w flex items-center justify-end gap-1 md:gap-4">
            <Drop align="right" btn="dh-tb" label={<><Globe size={17} />{langName}</>}>
              {LANGS.map(([k, n]) => (
                <button key={k} type="button" className="dh-it" onClick={() => setLang(k)}>{n}{k === lang && <Check size={17} className="text-[color:var(--blue)]" />}</button>
              ))}
            </Drop>
            <A h="/contato" className="dh-tb dh-hmd">{t.contact}</A>
            <A h="/#vitrine" className="dh-tb dh-hlg">{t.port}</A>
            <Drop align="right" wrap="hidden md:block" btn="dh-tb" label={t.support}>
              <A h={WHATS} className="dh-it">{t.wa}</A>
              <A h="/contato" className="dh-it">{t.quote}</A>
              <A h="/#faq" className="dh-it">FAQ</A>
            </Drop>
            <Drop align="right" wrap="hidden md:block" btn="dh-tb" label={t.account}>
              <A h={LOGIN} className="dh-it">{t.login}</A>
              <A h={SIGNUP} className="dh-it">{t.signup}</A>
              <A h="/perfil" className="dh-it">{t.profile}</A>
            </Drop>
            <Link to="/perfil" aria-label={t.profile} title={t.profile} className="mr-0.5 grid h-8 w-8 max-sm:h-7 max-sm:w-7 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-white text-white transition-transform hover:scale-110">
              {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : <UserRound size={17} />}
            </Link>
          </div>
        </div>

        {/* navegação principal */}
        <nav aria-label="Principal" className={`dh-nav ${scrolled ? "sc" : ""}`}>
          <div className={`dh-w relative flex items-center gap-3 transition-[height] duration-300 ${scrolled ? "h-[50px] sm:h-[62px] xl:h-[78px]" : "h-[56px] sm:h-[70px] xl:h-[94px]"}`}>
            <Link to="/" onClick={closeAll} aria-label="Diamante Dev — início" className="mr-1 flex shrink-0 items-center gap-3 xl:mr-4">
              
              <span className="dh-word">
                diamante<b> dev</b>
                <svg viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden>
                  <defs><linearGradient id="dhlg"><stop offset="0" stopColor="#3f73e0" /><stop offset=".5" stopColor="#a855f7" /><stop offset="1" stopColor="#f472b6" /></linearGradient></defs>
                  <path d="M2 2 Q50 13 98 2" fill="none" stroke="url(#dhlg)" strokeWidth="3.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                </svg>
              </span>
            </Link>

            <div className="hidden items-center xl:flex">
              <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "on" }} className="dh-nl">{t.home}</Link>
              <span aria-hidden className="mx-2 h-9 w-px bg-[color:var(--line)]" />
              {MENU.map((it) => (
                <Drop key={it.k} btn="dh-nl" label={t[it.k]}>
                  {it.sub.map(([n, h, d]) => <A key={n} h={h} className="dh-it"><span>{n}<small>{d}</small></span></A>)}
                </Drop>
              ))}
              <Drop btn="dh-nl" align="right" pop="dh-wide" label={t.more}>
                <p className="dh-cap">{t.all}</p>
                {NAV.map((i) => (
                  <Link key={i.to} to={i.to} activeOptions={{ exact: i.to === "/" }} activeProps={{ className: "on" }} className="dh-it">{i.label}</Link>
                ))}
              </Drop>
            </div>

            <div className="ml-auto flex items-center gap-2 xl:gap-3">
              <button type="button" aria-label={t.search} aria-expanded={find} title={`${t.search} (Ctrl+K)`} onClick={() => { setOpen(false); setFind((v) => !v); }} className="dh-nl dh-hsm !px-3">
                <Search size={20} /><span className="hidden 2xl:inline">{t.search}</span>
              </button>
              <A h={LOGIN} className="dh-nl dh-h2xl">{t.login}</A>
              <A h={SIGNUP} className="dh-btn dh-hsm">{t.signup}</A>
              <button type="button" aria-label={t.menu} aria-expanded={open} aria-controls="dh-mobile" onClick={() => { setFind(false); setOpen((v) => !v); }} className="dh-menu">
                {open ? <X size={20} /> : <Menu size={20} />}<span className="max-sm:hidden">{t.menu}</span>
              </button>
            </div>

            {find && (
              <>
                <button type="button" aria-label="Fechar pesquisa" tabIndex={-1} onClick={closeAll} className="fixed inset-0 -z-10 cursor-default bg-black/30 backdrop-blur-[2px]" />
                <div className="dh-slam absolute inset-x-[clamp(8px,3vw,40px)] top-full z-10 mt-2 rounded-2xl border border-[color:var(--line)] bg-[color:var(--card)] p-4 shadow-2xl">
                  <form onSubmit={(e) => { e.preventDefault(); if (results[0]) { go(results[0][1]); closeAll(); } }} className="flex items-center gap-3 rounded-xl border border-[color:var(--line)] px-4 py-3 transition-colors focus-within:border-[color:var(--blue)]">
                    <Search size={19} className="shrink-0 text-[color:var(--blue)]" />
                    <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.ph} className="w-full min-w-0 bg-transparent font-medium outline-none placeholder:text-[color:var(--mut)]" />
                    <kbd className="hidden rounded border border-[color:var(--line)] px-1.5 py-0.5 text-[11px] text-[color:var(--mut)] sm:block">Esc</kbd>
                  </form>
                  <div className="mt-3 grid max-h-[52svh] gap-1 overflow-y-auto sm:grid-cols-2 xl:grid-cols-3">
                    {results.map(([n, h, d]) => <A key={n} h={h} className="dh-it" onClick={closeAll}><span>{n}<small>{d}</small></span></A>)}
                  </div>
                  {!results.length && <A h="/contato" className="dh-it" onClick={closeAll}>{t.none}</A>}
                </div>
              </>
            )}
          </div>
        </nav>
      </div>

      {/* menu de páginas no mobile/tablet: folha que sobe de baixo, perto do polegar */}
      {open && (
        <div>
          <button type="button" aria-label="Fechar menu" tabIndex={-1} onClick={closeAll} className="dh-scrim" />
          <div id="dh-mobile" role="dialog" aria-label={t.menu} className="dh-sheet">
            <span className="dh-grab" aria-hidden />
            <p className="dh-cap">{t.all}</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {NAV.map((i) => (
                <Link key={i.to} to={i.to} onClick={closeAll} activeOptions={{ exact: i.to === "/" }} activeProps={{ className: "on" }} className="dh-chip">{i.label}</Link>
              ))}
            </div>
            <div className="mt-3">
              {MENU.map((it) => (
                <details key={it.k} className="border-b border-[color:var(--line)]">
                  <summary className="flex cursor-pointer list-none items-center justify-between py-3.5 text-base font-bold">{t[it.k]}<ChevronDown size={19} className="dh-chev" /></summary>
                  <div className="pb-2">{it.sub.map(([n, h, d]) => <A key={n} h={h} className="dh-it" onClick={closeAll}><span>{n}<small>{d}</small></span></A>)}</div>
                </details>
              ))}
            </div>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              <A h={SIGNUP} className="dh-btn" onClick={closeAll}>{t.signup}</A>
              <A h={LOGIN} className="dh-btn-o" onClick={closeAll}>{t.login}</A>
            </div>
          </div>
        </div>
      )}

      {/* atalhos rápidos em vidro (estilo iOS 26 / Instagram): Início · Páginas · Orçamento · Busca · Perfil */}
      <nav aria-label="Atalhos" className={`dh-dock ${hideDock && !open && !find ? "hide" : ""}`}>
        <span aria-hidden className="dh-ind" style={{ transform: `translateX(${Math.max(idx, 0) * 100}%)`, opacity: idx < 0 ? 0 : 1 }} />
        <Link to="/" onClick={closeAll} aria-label={t.home} title={t.home} aria-current={idx === 0 ? "page" : undefined} className="dh-cell"><Home size={25} strokeWidth={idx === 0 ? 2.5 : 1.9} /></Link>
        <button type="button" aria-label={t.menu} title={t.menu} aria-expanded={open} aria-controls="dh-mobile" onClick={() => { setFind(false); setOpen((v) => !v); }} className="dh-cell"><LayoutGrid size={24} strokeWidth={idx === 1 ? 2.5 : 1.9} /></button>
        <Link to="/contato" onClick={closeAll} aria-label={t.quote} title={t.quote} aria-current={idx === 2 ? "page" : undefined} className="dh-cell"><FileText size={25} strokeWidth={idx === 2 ? 2.5 : 1.9} color="var(--blue)" /></Link>
        <button type="button" aria-label={t.search} title={t.search} aria-expanded={find} onClick={() => { setOpen(false); setFind((v) => !v); }} className="dh-cell"><Search size={25} strokeWidth={idx === 3 ? 2.5 : 1.9} /></button>
        <Link to="/perfil" onClick={closeAll} aria-label={t.profile} title={t.profile} aria-current={idx === 4 ? "page" : undefined} className="dh-cell">
          {photo ? <img src={photo} alt="" className="dh-av" /> : <UserRound size={25} strokeWidth={idx === 4 ? 2.5 : 1.9} />}
        </Link>
      </nav>
    </header>
  );
}
