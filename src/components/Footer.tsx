import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowUp,
  Check,
  ChevronDown,
  Clock,
  Facebook,
  Globe,
  Instagram,
  Mail,
  MessageCircle,
} from "lucide-react";
import logoImg from "@/assets/logo.jpeg";
import { PHONE_NUMBER } from "@/lib/whatsapp";
import { LANGS, LOGIN, ROUTES, SIGNUP, useLang } from "@/components/Header";

const EMAIL = "igordiamantedev.com.br@gmail.com";
const WHATSAPP_LABEL = "(11) 99004-7011";
const WHATSAPP_URL = `https://wa.me/5511990047011?text=${encodeURIComponent("Olá! Vim pelo site e gostaria de um orçamento.")}`;
const MAP_LINK = "https://www.google.com/maps/search/?api=1&query=S%C3%A3o+Paulo%2C+SP";

const F = {
  pt: {
    signup: "Criar conta",
    discover: "Descubra",
    products: "Produtos e serviços",
    solutions: "Soluções",
    help: "Ajuda",
    plans: "Planos e valores",
    faq: "Perguntas frequentes",
    contact: "Entre em contato conosco",
    account: "Meu perfil",
    login: "Fazer login",
    loc: "São Paulo – SP · atendemos todo o Brasil",
    reply: "Resposta em até 24 horas úteis",
    rights: "Todos os direitos reservados.",
    tagline: "Sites para resultados reais.",
    credit: "Design feito por",
    top: "Voltar ao topo",
    lang: "Idioma",
  },
  en: {
    signup: "Create account",
    discover: "Discover",
    products: "Products and services",
    solutions: "Solutions",
    help: "Help",
    plans: "Plans and pricing",
    faq: "FAQ",
    contact: "Contact us",
    account: "My profile",
    login: "Sign in",
    loc: "São Paulo – SP · we serve all of Brazil",
    reply: "Reply within 24 business hours",
    rights: "All rights reserved.",
    tagline: "Websites for real results.",
    credit: "Design by",
    top: "Back to top",
    lang: "Language",
  },
  es: {
    signup: "Crear cuenta",
    discover: "Descubre",
    products: "Productos y servicios",
    solutions: "Soluciones",
    help: "Ayuda",
    plans: "Planes y precios",
    faq: "Preguntas frecuentes",
    contact: "Contáctenos",
    account: "Mi perfil",
    login: "Iniciar sesión",
    loc: "São Paulo – SP · atendemos todo Brasil",
    reply: "Respuesta en hasta 24 horas hábiles",
    rights: "Todos los derechos reservados.",
    tagline: "Sitios web para resultados reales.",
    credit: "Diseño por",
    top: "Volver arriba",
    lang: "Idioma",
  },
};

/* CORES FIXAS (hex): o modo escuro do site não consegue inverter nem sumir com o texto.
   Branco: #fff · 80% #ffffffcc · 60% #ffffff99 · 15% #ffffff26 · 10% #ffffff1a */
const CSS = `
@property --a{syntax:"<angle>";inherits:false;initial-value:0deg}
.df{position:relative;overflow:hidden;isolation:isolate;margin-top:clamp(40px,6vw,88px);color:#ffffff;font-family:"Amazon Ember","Helvetica Neue",Roboto,Arial,sans-serif;background:linear-gradient(160deg,#0b1424 0%,#10192b 55%,#0a101c 100%);border:1px solid #ffffff1f;border-bottom:0;border-radius:clamp(48px,8vw,128px) clamp(48px,8vw,128px) 0 0;-webkit-font-smoothing:antialiased}
.df *{box-sizing:border-box}
.df::before{content:"";position:absolute;inset:0 0 auto 0;height:3px;background:linear-gradient(90deg,#3f73e0,#a855f7,#22d3ee,#f472b6,#fbbf24,#3f73e0);background-size:300% 100%;animation:dffl 7s linear infinite}
@keyframes dffl{to{background-position:300% 0}}
.df>i{position:absolute;z-index:-1;border-radius:50%;filter:blur(90px);pointer-events:none}
.df .b1{left:-8vw;top:-6vw;width:34vw;height:34vw;background:#3f73e0;opacity:.3;animation:dfm1 12s ease-in-out infinite alternate}
.df .b2{right:-8vw;bottom:-10vw;width:36vw;height:36vw;background:#a855f7;opacity:.26;animation:dfm2 14s ease-in-out infinite alternate}
.df .b3{left:42%;top:28%;width:22vw;height:22vw;background:#22d3ee;opacity:.14;animation:dfm1 16s ease-in-out infinite alternate-reverse}
@keyframes dfm1{to{transform:translate(12vw,8vw) scale(1.25)}}
@keyframes dfm2{to{transform:translate(-14vw,-6vw) scale(1.2)}}
.df-w{max-width:1440px;margin:0 auto;padding:0 clamp(20px,5vw,100px)}
.df-top{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;padding-top:clamp(44px,6vw,80px)}
.df-pill{position:relative;isolation:isolate;display:inline-flex;align-items:center;justify-content:center;gap:10px;border-radius:999px;font-weight:700;font-size:1.1rem;padding:15px 34px;cursor:pointer;white-space:nowrap;transition:transform .25s,background .25s}
.df-white{background:#ffffff;color:#161d26}
.df-white::before{content:"";position:absolute;inset:-4px;z-index:-1;border-radius:inherit;background:conic-gradient(from var(--a),#3f73e0,#a855f7,#22d3ee,#f472b6,#3f73e0);filter:blur(10px);opacity:.55;animation:dfa 3s linear infinite;transition:opacity .3s}
@keyframes dfa{to{--a:360deg}}
.df-white:hover{transform:translateY(-3px) scale(1.04)}
.df-white:hover::before{opacity:1}
.df-lang{background:transparent;color:#ffffff;box-shadow:inset 0 0 0 2px #ffffff}
.df-lang:hover{background:#ffffff1f;transform:translateY(-2px)}
.df-lw{position:relative}
.df-pop{position:absolute;right:0;top:calc(100% + 10px);z-index:5;min-width:230px;padding:8px;border-radius:16px;background:#0f1a2c;border:1px solid #ffffff26;box-shadow:0 24px 60px -16px #000000b3;animation:dfp .25s cubic-bezier(.2,.9,.3,1.25)}
@keyframes dfp{from{opacity:0;transform:translateY(10px) scale(.95)}}
.df-opt{display:flex;width:100%;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-radius:12px;color:#ffffff;font-weight:600;text-align:left;transition:background .15s}
.df-opt:hover{background:#ffffff1f}
.df-rot{transform:rotate(180deg)}
.df-cols{display:grid;gap:44px 32px;grid-template-columns:1fr;padding:clamp(48px,6vw,88px) 0 8px}
@media(min-width:560px){.df-cols{grid-template-columns:repeat(2,1fr)}}
@media(min-width:1024px){.df-cols{grid-template-columns:repeat(4,1fr)}}
.df-h{margin-bottom:18px;font-size:1.45rem;font-weight:600;letter-spacing:-.01em;color:#ffffff}
.df-ul{list-style:none;margin:0;padding:0;display:grid;gap:4px}
.df-l{position:relative;display:inline-block;padding:5px 0;font-size:1.05rem;line-height:1.4;color:#d5dbdb;overflow-wrap:anywhere;transition:color .2s,transform .25s}
.df-l::after{content:"";position:absolute;left:0;bottom:1px;height:2px;width:100%;border-radius:2px;background:linear-gradient(90deg,#3f73e0,#a855f7,#22d3ee);transform:scaleX(0);transform-origin:left;transition:transform .3s}
.df-l:hover{color:#ffffff;transform:translateX(5px)}
.df-l:hover::after{transform:scaleX(1)}
.df-note{display:flex;align-items:center;gap:8px;margin-top:14px;font-size:.92rem;color:#ffffff99}
.df-bot{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:22px;margin-top:clamp(40px,5vw,72px);padding:28px 0 36px;border-top:1px solid #ffffff26}
.df-brand{display:flex;align-items:center;gap:14px}
.df-logo{display:grid;place-items:center;width:52px;height:52px;border-radius:15px;padding:2px;background:conic-gradient(from var(--a),#3f73e0,#a855f7,#22d3ee,#f472b6,#3f73e0);animation:dfa 4s linear infinite}
.df-logo img{width:100%;height:100%;border-radius:13px;object-fit:cover}
.df-name{font-size:1.2rem;font-weight:700;color:#ffffff;line-height:1.1}
.df-sub{margin-top:4px;font-size:.88rem;color:#ffffffa6}
.df-copy{font-size:.92rem;color:#ffffff99}
.df-end{display:flex;flex-wrap:wrap;align-items:center;gap:12px}
.df-so{display:grid;place-items:center;width:46px;height:46px;border-radius:999px;color:#ffffff;background:#ffffff1a;border:1px solid #ffffff26;transition:transform .25s,background .25s,border-color .25s}
.df-so:hover{transform:translateY(-4px) rotate(-6deg);background:linear-gradient(135deg,#3f73e0,#a855f7);border-color:#ffffff59}
.df-cr{display:inline-flex;align-items:center;gap:6px;padding:11px 18px;border-radius:999px;font-size:.85rem;font-weight:700;color:#ffffff;border:1px solid #ffffff40;background:#ffffff14;transition:transform .25s,background .25s}
.df-cr:hover{transform:translateY(-3px);background:#ffffff26}
.df-rv{opacity:0;transform:translateY(40px);filter:blur(6px);transition:opacity .7s cubic-bezier(.2,.8,.2,1),transform .7s cubic-bezier(.2,.8,.2,1),filter .7s}
.df-rv.in{opacity:1;transform:none;filter:none}
.df :is(a,button):focus-visible{outline:3px solid #62adff;outline-offset:3px}
@media(prefers-reduced-motion:reduce){.df *,.df *::before,.df::before{animation:none!important;transition:none!important}.df-rv{opacity:1;transform:none;filter:none}}
`;

function A({ h, children, className }: { h: string; children: ReactNode; className?: string }) {
  if (h.startsWith("/#"))
    return (
      <Link to="/" hash={h.slice(2)} className={className}>
        {children}
      </Link>
    );
  if (ROUTES.includes(h))
    return (
      <Link to={h as "/"} className={className}>
        {children}
      </Link>
    );
  const ext = h.startsWith("http");
  return (
    <a
      href={h}
      className={className}
      {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

function Reveal({
  children,
  d = 0,
  className = "",
}: {
  children: ReactNode;
  d?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setS(2);
      return;
    }
    setS(1);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setS(2);
          io.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px 12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${d}ms` }}
      className={`${s ? "df-rv" : ""} ${s === 2 ? "in" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

function LangPill({
  lang,
  setLang,
  label,
}: {
  lang: keyof typeof F;
  setLang: (l: keyof typeof F) => void;
  label: string;
}) {
  const [o, setO] = useState(false);
  const r = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const f = (e: MouseEvent) => {
      if (r.current && !r.current.contains(e.target as Node)) setO(false);
    };
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") setO(false);
    };
    document.addEventListener("mousedown", f);
    window.addEventListener("keydown", k);
    return () => {
      document.removeEventListener("mousedown", f);
      window.removeEventListener("keydown", k);
    };
  }, []);
  return (
    <div ref={r} className="df-lw">
      <button
        type="button"
        className="df-pill df-lang"
        aria-haspopup="listbox"
        aria-expanded={o}
        aria-label={label}
        onClick={() => setO((v) => !v)}
      >
        <Globe size={20} />
        {LANGS.find(([k]) => k === lang)![1]}
        <ChevronDown size={20} className={o ? "df-rot" : ""} />
      </button>
      {o && (
        <div className="df-pop" role="listbox">
          {LANGS.map(([k, n]) => (
            <button
              key={k}
              type="button"
              role="option"
              aria-selected={k === lang}
              className="df-opt"
              onClick={() => {
                setLang(k);
                setO(false);
              }}
            >
              {n}
              {k === lang && <Check size={17} color="#62adff" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Footer() {
  const [lang, setLang] = useLang();
  const f = F[lang];
  const cols: { h: string; items: [string, string][] }[] = [
    {
      h: f.discover,
      items: [
        ["/", "Início"],
        ["/sobre", "Sobre"],
        ["/comunidade", "Comunidade"],
        ["/#planos", f.plans],
        ["/#faq", f.faq],
        ["/contato", "Contato"],
      ],
    },
    {
      h: f.products,
      items: [
        ["/produtos", "Produtos"],
        ["/servicos", "Serviços"],
        ["/corte-e-dobra", "Corte e dobra"],
        ["/armaduras-prontas", "Armaduras prontas"],
        ["/vergalhao-ca-50", "Vergalhão CA-50"],
      ],
    },
    {
      h: f.solutions,
      items: [
        ["/solucoes-para-construtoras", "Para construtoras"],
        ["/entrega-de-aco", "Entrega de aço"],
        ["/consultoria-tecnica", "Consultoria"],
        ["/orcamento-de-aco", "Orçamento"],
      ],
    },
    {
      h: f.help,
      items: [
        ["/contato", f.contact],
        [WHATSAPP_URL, `WhatsApp · ${WHATSAPP_LABEL}`],
        [`mailto:${EMAIL}`, EMAIL],
        [`tel:${PHONE_NUMBER}`, "(11) 5522-9775"],
        ["/perfil", f.account],
        [LOGIN, f.login],
        [MAP_LINK, f.loc],
      ],
    },
  ];
  return (
    /* div (e não <footer>) para não herdar regras antigas do CSS global que deixavam a footer alta */
    <div role="contentinfo" className="df" style={{ height: "auto", minHeight: 0 }}>
      <style>{CSS}</style>
      <i className="b1" />
      <i className="b2" />
      <i className="b3" />
      <div className="df-w">
        <Reveal className="df-top">
          <A h={SIGNUP} className="df-pill df-white">
            {f.signup}
          </A>
          <LangPill lang={lang} setLang={setLang} label={f.lang} />
        </Reveal>

        <div className="df-cols">
          {cols.map((c, k) => (
            <Reveal key={c.h} d={k * 90}>
              <p className="df-h">{c.h}</p>
              <ul className="df-ul">
                {c.items.map(([h, n]) => (
                  <li key={h + n}>
                    <A h={h} className="df-l">
                      {n}
                    </A>
                  </li>
                ))}
              </ul>
              {k === cols.length - 1 && (
                <p className="df-note">
                  <Clock size={15} color="#62adff" />
                  {f.reply}
                </p>
              )}
            </Reveal>
          ))}
        </div>

        <Reveal className="df-bot">
          <div className="df-brand">
            <span className="df-logo">
              <img src={logoImg} alt="Logo Diamante Dev" />
            </span>
            <div>
              <p className="df-name">Diamante Dev</p>
              <p className="df-sub">{f.tagline}</p>
            </div>
          </div>
          <p className="df-copy">
            © {new Date().getFullYear()} Diamante Dev. {f.rights}
          </p>
          <div className="df-end">
            <a
              className="df-so"
              href="https://www.instagram.com/novablldobrasil/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              title="Instagram"
            >
              <Instagram size={19} />
            </a>
            <a
              className="df-so"
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              title="Facebook"
            >
              <Facebook size={19} />
            </a>
            <a
              className="df-so"
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              title="WhatsApp"
            >
              <MessageCircle size={19} />
            </a>
            <a className="df-so" href={`mailto:${EMAIL}`} aria-label="E-mail" title="E-mail">
              <Mail size={19} />
            </a>
            <a
              className="df-cr"
              href="https://www.instagram.com/igoreduardo.dev/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
            >
              {f.credit} Igor Eduardo
            </a>
            <button
              type="button"
              className="df-so"
              aria-label={f.top}
              title={f.top}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <ArrowUp size={19} />
            </button>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
