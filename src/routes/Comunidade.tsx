import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bookmark,
  Briefcase,
  Camera,
  Code2,
  Flame,
  Hash,
  Home,
  Image as ImageIcon,
  MessageCircle,
  Mic,
  Music,
  PlusSquare,
  Search,
  Share2,
  Square,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  Users,
  Video,
  X,
} from "lucide-react";
import { hueOf, lv, readAccount, readPub, slug, statsFor } from "@/components/PublicProfile";
import { recordAnalyticsEvent } from "@/components/AnalyticsTracker";
import { absoluteUrl } from "@/lib/seo";

export const Route = createFileRoute("/Comunidade")({
  head: () => ({
    meta: [
      { title: "Comunidade — Diamante Dev" },
      {
        name: "description",
        content:
          "Converse com programadores e clientes, mostre projetos, tire dúvidas e siga perfis na comunidade da Diamante Dev.",
      },
      { property: "og:title", content: "Comunidade — Diamante Dev" },
      { property: "og:description", content: "Onde quem faz e quem contrata sites se encontra." },
      { property: "og:url", content: absoluteUrl("/comunidade") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/comunidade") }],
  }),
  component: Comunidade,
});

type Role = "dev" | "client";
type Kind = "image" | "video" | "audio";
type Media = { kind: Kind; src: string };
type Member = {
  id: string;
  name: string;
  handle: string;
  role: Role;
  bio: string;
  hue: number;
  photo?: string;
};
type Cmt = { id: string; by: string; text: string; at: number };
type Post = {
  id: string;
  by: string;
  text: string;
  tag: string;
  media?: Media;
  at: number;
  up: string[];
  down: string[];
  cmts: Cmt[];
};
type Ov = { role?: Role; bio?: string; photo?: string };

/* Online: defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY e rode comunidade.sql. Sem isso a página funciona só neste navegador. */
const SB = import.meta.env.VITE_SUPABASE_URL as string | undefined,
  SK = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const ONLINE = !!(SB && SK);
const LIM = ONLINE ? 50e6 : 3e6;
const hdr = (x: Record<string, string> = {}) => ({
  apikey: SK!,
  Authorization: `Bearer ${SK}`,
  ...x,
});
const api = async (path: string, method = "GET", body?: unknown, prefer = "return=minimal") => {
  const r = await fetch(`${SB}/rest/v1/${path}`, {
    method,
    headers: hdr({ "Content-Type": "application/json", Prefer: prefer }),
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!r.ok) throw new Error(String(r.status));
  return method === "GET" ? r.json() : null;
};
const upload = async (b: Blob, name: string) => {
  const r = await fetch(`${SB}/storage/v1/object/media/${name}`, {
    method: "POST",
    headers: hdr({ "Content-Type": b.type }),
    body: b,
  });
  if (!r.ok) throw new Error("upload");
  return `${SB}/storage/v1/object/public/media/${name}`;
};
const split = ({ id, at, ...data }: Post) => ({ id, at, data });

const KEY = "diamante-community-v2";
const TAGS = [
  "Dúvida",
  "Projeto",
  "Dica",
  "Vaga",
  "Elogio",
  "Design",
  "SEO",
  "Pagamentos",
  "Hospedagem",
  "Mobile",
  "Freela",
  "Orçamento",
  "Novidade",
  "Bastidores",
];
const TABS = [
  ["all", "Início", Home],
  ["following", "Seguindo", Users],
  ["dev", "Programadores", Code2],
  ["client", "Clientes", Briefcase],
  ["saved", "Salvos", Bookmark],
] as const;
const HT = /#[\p{L}\p{N}_]+/gu;
const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
const H = 3600e3;

/* ⚠️ Perfis e posts de exemplo (fotos de banco de imagens randomuser.me): apague SEED_MEMBERS e seedPosts() antes de publicar. */
const ph = (g: "men" | "women", n: number) => `https://randomuser.me/api/portraits/${g}/${n}.jpg`;
const SEED_MEMBERS: Member[] = [
  {
    id: "m1",
    name: "Marina Costa",
    handle: "marina.dev",
    role: "dev",
    hue: 215,
    photo: ph("women", 44),
    bio: "Front-end sênior em React. Deixo sites rápidos, acessíveis e prontos para o Google.",
  },
  {
    id: "m2",
    name: "Rafael Lima",
    handle: "rafa.clinica",
    role: "client",
    hue: 205,
    photo: ph("men", 32),
    bio: "Dono de clínica odontológica em Campinas. Quero agendamento online e mais pacientes.",
  },
  {
    id: "m3",
    name: "Thiago Alves",
    handle: "thiago.code",
    role: "dev",
    hue: 225,
    photo: ph("men", 75),
    bio: "Full-stack e SEO técnico. Node, TypeScript e bancos de dados sem complicação.",
  },
  {
    id: "m4",
    name: "Camila Duarte",
    handle: "cami.cafe",
    role: "client",
    hue: 210,
    photo: ph("women", 65),
    bio: "Cafeteria em Pinheiros. Cardápio digital e pedidos pelo WhatsApp.",
  },
  {
    id: "m5",
    name: "Bruno Nakamura",
    handle: "bruno.ui",
    role: "dev",
    hue: 220,
    photo: ph("men", 46),
    bio: "UI, UX e animações 3D. Interfaces leves que encantam em qualquer celular.",
  },
  {
    id: "m6",
    name: "Larissa Mendes",
    handle: "lari.pilates",
    role: "client",
    hue: 208,
    photo: ph("women", 12),
    bio: "Estúdio de pilates em Curitiba. Busco um site calmo, claro e fácil de usar.",
  },
  {
    id: "m7",
    name: "Diego Ferreira",
    handle: "diego.back",
    role: "dev",
    hue: 228,
    photo: ph("men", 52),
    bio: "Back-end e pagamentos. Pix, boleto e cartão integrados com segurança.",
  },
  {
    id: "m8",
    name: "Patrícia Souza",
    handle: "pat.advocacia",
    role: "client",
    hue: 212,
    photo: ph("women", 68),
    bio: "Advogada trabalhista. Site institucional, blog e contato direto com clientes.",
  },
  {
    id: "m9",
    name: "Lucas Ribeiro",
    handle: "lucas.mobile",
    role: "dev",
    hue: 218,
    photo: ph("men", 22),
    bio: "Sites responsivos e PWA. Transformo o seu site em app que abre em um toque.",
  },
  {
    id: "m10",
    name: "Fernanda Rocha",
    handle: "fe.moda",
    role: "client",
    hue: 206,
    photo: ph("women", 33),
    bio: "Loja de moda feminina online. Catálogo, estoque e frete em um só lugar.",
  },
  {
    id: "m11",
    name: "André Barros",
    handle: "andre.infra",
    role: "dev",
    hue: 222,
    photo: ph("men", 85),
    bio: "Hospedagem, domínio e segurança. Seu site no ar, com backup e sem dor de cabeça.",
  },
  {
    id: "m12",
    name: "Juliana Prado",
    handle: "ju.design",
    role: "dev",
    hue: 214,
    photo: ph("women", 90),
    bio: "Designer e front-end. Identidade visual e landing pages que convertem.",
  },
  {
    id: "m13",
    name: "Gabriel Moreira",
    handle: "gabi.bots",
    role: "dev",
    hue: 216,
    photo: ph("men", 14),
    bio: "Automação e chatbots para WhatsApp. Atendimento 24 horas sem perder o toque humano.",
  },
  {
    id: "m14",
    name: "Beatriz Lima",
    handle: "bia.flores",
    role: "client",
    hue: 209,
    photo: ph("women", 26),
    bio: "Floricultura em Belo Horizonte. Quero vender buquês online com entrega no mesmo dia.",
  },
  {
    id: "m15",
    name: "Rodrigo Teixeira",
    handle: "rod.oficina",
    role: "client",
    hue: 204,
    photo: ph("men", 61),
    bio: "Oficina mecânica. Preciso de orçamento online e avisos de revisão para os clientes.",
  },
  {
    id: "m16",
    name: "Carolina Vieira",
    handle: "carol.ecom",
    role: "dev",
    hue: 226,
    photo: ph("women", 55),
    bio: "E-commerce e conversão. Loja rápida, checkout simples e mais vendas.",
  },
];
const seedPosts = (): Post[] => {
  const n = Date.now();
  return [
    {
      id: "p1",
      by: "m1",
      tag: "Dica",
      at: n - 2 * H,
      text: "Site lento? Comprima as imagens antes de subir. Uma foto de 4 MB no celular derruba a velocidade e o Google percebe. #SEO #Mobile",
      up: ["m2", "m4", "m5", "m9"],
      down: [],
      cmts: [
        {
          id: "c1",
          by: "m4",
          text: "Fiz isso na cafeteria e o site abriu muito mais rápido. Obrigada!",
          at: n - H,
        },
      ],
    },
    {
      id: "p2",
      by: "m2",
      tag: "Dúvida",
      at: n - 5 * H,
      text: "Vale colocar agendamento online no site da clínica ou o botão de WhatsApp já resolve? #Orçamento",
      up: ["m1"],
      down: [],
      cmts: [
        {
          id: "c2",
          by: "m3",
          text: "Com muitos pedidos por semana, o agendamento alivia a recepção. Com poucos, o WhatsApp resolve bem.",
          at: n - 4 * H,
        },
      ],
    },
    {
      id: "p5",
      by: "m7",
      tag: "Pagamentos",
      at: n - 9 * H,
      text: "Aceitar Pix no site reduz carrinho abandonado. Gere o QR Code na hora do pedido e confirme o pagamento automaticamente.",
      up: ["m10", "m4", "m1", "m9", "m16"],
      down: [],
      cmts: [],
    },
    {
      id: "p6",
      by: "m6",
      tag: "Dúvida",
      at: n - 14 * H,
      text: "No estúdio de pilates, vale ter blog no site ou só as aulas e o botão de WhatsApp? #SEO",
      up: ["m8"],
      down: [],
      cmts: [
        {
          id: "c3",
          by: "m12",
          text: "Um blog curto com dicas de postura ajuda no Google e passa confiança. Duas publicações por mês bastam.",
          at: n - 13 * H,
        },
      ],
    },
    {
      id: "p9",
      by: "m13",
      tag: "Novidade",
      at: n - 18 * H,
      text: "Liberei um chatbot que responde horários, preços e agenda direto no WhatsApp. Quem quiser testar com o próprio negócio, me chama! #Freela",
      up: ["m2", "m15", "m14"],
      down: [],
      cmts: [],
    },
    {
      id: "p3",
      by: "m5",
      tag: "Projeto",
      at: n - 26 * H,
      text: "Terminei a animação 3D da home de um projeto Premium. Leve e roda bem até em celular antigo. Em breve mostro aqui. #Design",
      up: ["m1", "m3", "m2", "m12"],
      down: [],
      cmts: [],
    },
    {
      id: "p7",
      by: "m11",
      tag: "Hospedagem",
      at: n - 32 * H,
      text: "Ative HTTPS e backup automático desde o primeiro dia. Se o site cair de madrugada, você volta ao ar em minutos.",
      up: ["m3", "m7"],
      down: [],
      cmts: [],
    },
    {
      id: "p10",
      by: "m16",
      tag: "Dica",
      at: n - 36 * H,
      text: "Checkout em uma página só converte mais. Tire campos que ninguém precisa e mostre o frete antes do pagamento. #Pagamentos",
      up: ["m10", "m14", "m7"],
      down: [],
      cmts: [],
    },
    {
      id: "p8",
      by: "m8",
      tag: "Vaga",
      at: n - 40 * H,
      text: "Procuro programador para atualizar o blog do meu escritório e melhorar o SEO. Quem topa conversar? #Freela",
      up: ["m3"],
      down: [],
      cmts: [
        {
          id: "c4",
          by: "m3",
          text: "Posso ajudar, Patrícia. Te chamo pelo perfil.",
          at: n - 39 * H,
        },
      ],
    },
    {
      id: "p4",
      by: "m4",
      tag: "Elogio",
      at: n - 50 * H,
      text: "Meu site novo ficou lindo e os primeiros pedidos já chegaram pelo WhatsApp. Valeu, equipe! #Bastidores",
      up: ["m2", "m1", "m3", "m5", "m15"],
      down: [],
      cmts: [],
    },
  ];
};

const uid = () => Math.random().toString(36).slice(2, 9);
const ago = (t: number) => {
  const m = (Date.now() - t) / 6e4;
  return m < 1
    ? "agora"
    : m < 60
      ? `há ${m | 0} min`
      : m < 1440
        ? `há ${(m / 60) | 0} h`
        : `há ${(m / 1440) | 0} d`;
};
const toData = (b: Blob) =>
  new Promise<string>((ok, no) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result));
    r.onerror = no;
    r.readAsDataURL(b);
  });
/* fotos de qualquer tamanho: reduz no próprio navegador (sq = recorte quadrado para perfil) */
const shrink = (src: string, max = 1600, sq = false) =>
  new Promise<string>((ok) => {
    const i = new Image();
    i.onload = () => {
      const c = document.createElement("canvas"),
        g = c.getContext("2d")!;
      if (sq) {
        const s = Math.min(i.width, i.height),
          o = Math.min(max, s);
        c.width = c.height = o;
        g.fillStyle = "#fff";
        g.fillRect(0, 0, o, o);
        g.drawImage(i, (i.width - s) / 2, (i.height - s) / 2, s, s, 0, 0, o, o);
      } else {
        const k = Math.min(1, max / Math.max(i.width, i.height));
        c.width = i.width * k;
        c.height = i.height * k;
        g.fillStyle = "#fff";
        g.fillRect(0, 0, c.width, c.height);
        g.drawImage(i, 0, 0, c.width, c.height);
      }
      ok(c.toDataURL("image/jpeg", 0.86));
    };
    i.onerror = () => ok(src);
    i.src = src;
  });
/* acompanha o botão de tema do próprio site (classe, atributo ou cor de fundo) */
const siteDark = () => {
  const els = [document.documentElement, document.body];
  if (
    els.some(
      (e) =>
        e.classList.contains("dark") || e.dataset.theme === "dark" || e.dataset.mode === "dark",
    )
  )
    return true;
  if (els.some((e) => e.classList.contains("light") || e.dataset.theme === "light")) return false;
  for (const e of [...els].reverse()) {
    const c = getComputedStyle(e).backgroundColor.match(/[\d.]+/g);
    if (c && (c[3] === undefined || +c[3] > 0.5))
      return (+c[0] * 299 + +c[1] * 587 + +c[2] * 114) / 1000 < 128;
  }
  return false;
};

const CSS = `
.cm{--bg:#fff;--tx:#1a1a1a;--mt:#5f6673;--bd:#dbdbdb;--pr:#0b63ce;--pt:#fff;--sf:#f2f4f7;--nv:#232f3e;background:var(--bg);color:var(--tx);font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",sans-serif;-webkit-font-smoothing:antialiased}
.cm[data-t=dark]{--bg:#000;--tx:#f5f5f5;--mt:#a5adba;--bd:#2c3138;--pr:#4da3ff;--pt:#00172e;--sf:#16191d;--nv:#10161d}
.cm *,.cm ::before{box-sizing:border-box;border-color:var(--bd)}
.cm-m{color:var(--mt)}.cm-p{color:var(--pr)}
.cm-btn{background:var(--pr);color:var(--pt);font-weight:600;font-size:.875rem;border-radius:10px;min-height:2.5rem;padding:0 1.1rem;display:inline-flex;align-items:center;justify-content:center;gap:.45rem;transition:filter .15s,transform .15s}
.cm-btn:hover{filter:brightness(1.1)}.cm-btn:active{transform:scale(.96)}.cm-btn:disabled{opacity:.5}.cm-sec{background:var(--sf);color:var(--tx)}
.cm-ic{position:relative;display:grid;place-items:center;width:2.75rem;height:2.75rem;border-radius:99px;transition:background .15s,transform .15s}
.cm-ic:hover{background:var(--sf)}.cm-ic:active{transform:scale(.85)}
.cm-link{color:var(--pr);font-weight:600;font-size:.875rem}.cm-link:disabled{opacity:.4}
.cm-nav{display:flex;width:100%;align-items:center;gap:1rem;border-radius:12px;padding:.8rem 1rem;font-size:1rem;transition:background .15s,transform .15s}
.cm-nav:hover{background:var(--sf);transform:translateX(3px)}.cm-nav[aria-current=true]{font-weight:700;background:var(--sf)}
.cm-chip{flex-shrink:0;border-radius:99px;background:var(--sf);padding:.5rem .95rem;font-size:.875rem;font-weight:600;transition:transform .15s,background .15s}
.cm-chip:hover{transform:translateY(-2px)}.cm-chip:active{transform:scale(.95)}.cm-chip[aria-pressed=true],.cm-chip[aria-selected=true]{background:var(--tx);color:var(--bg)}
.cm-pill{display:inline-flex;align-items:center;border-radius:99px;background:var(--sf);padding:.12rem .65rem;font-size:12px;font-weight:700}
.cm-fld{width:100%;min-width:0;background:var(--sf);color:var(--tx);border-radius:12px;padding:.8rem 1rem;font-size:1rem;border:1px solid transparent}
.cm-fld::placeholder{color:var(--mt)}.cm-fld:focus{border-color:var(--pr);outline:0}
.cm :is(button,a,label,input,textarea):focus-visible{outline:2px solid var(--pr);outline-offset:2px}
.cm-ring{background:conic-gradient(from 210deg,#0b63ce,#6cb8ff,#0a2f6b,#0b63ce);padding:3px;border-radius:99px;transition:transform .25s;box-shadow:0 4px 14px rgba(11,99,206,.28)}
.cm-ring:hover{transform:scale(1.07) rotate(6deg)}
.cm-card{background:var(--bg);border:1px solid var(--bd);border-radius:18px}
.cm-lift{transition:transform .25s,box-shadow .25s}.cm-lift:hover{transform:translateY(-4px);box-shadow:0 12px 30px rgba(11,99,206,.16)}
.cm-clamp{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.cm-hs{scrollbar-width:none}.cm-hs::-webkit-scrollbar{display:none}
.cm-snap{scroll-snap-type:x proximity}.cm-snap>*{scroll-snap-align:start}
@keyframes cmUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
.cm-up{animation:cmUp .5s cubic-bezier(.2,.8,.2,1) both}
@keyframes cmSheet{from{opacity:0;transform:translateY(40px) scale(.98)}to{opacity:1;transform:none}}
.cm-sheet{animation:cmSheet .3s cubic-bezier(.2,.8,.2,1) both}
@keyframes cmPop{40%{transform:scale(1.4)}}
.cm-pop{animation:cmPop .35s}
@keyframes cmPing{from{opacity:.7;transform:scale(.6)}to{opacity:0;transform:scale(2.2)}}
.cm-ping{position:absolute;left:50%;top:50%;width:28px;height:28px;margin:-14px 0 0 -14px;border-radius:99px;border:2px solid currentColor;animation:cmPing .55s ease-out forwards;pointer-events:none}
@keyframes cmBurst{0%{opacity:0;transform:scale(.4)}25%{opacity:1;transform:scale(1.15)}100%{opacity:0;transform:scale(1.3)}}
.cm-burst{animation:cmBurst .8s ease-out forwards;pointer-events:none}
@keyframes cmRec{to{box-shadow:0 0 0 10px transparent}}
.cm-rec{box-shadow:0 0 0 0 #ef4444;animation:cmRec 1s infinite}
@keyframes cmLive{to{box-shadow:0 0 0 8px transparent}}
.cm-live{box-shadow:0 0 0 0 var(--pr);animation:cmLive 1.6s infinite}
@keyframes cmFloat{50%{transform:translateY(-5px)}}
.cm-float{animation:cmFloat 5s ease-in-out infinite}
@media(prefers-reduced-motion:reduce){.cm *{animation:none!important;transition:none!important}}
`;

function Avatar({ m, s = 40 }: { m: Member; s?: number }) {
  const [bad, setBad] = useState(false);
  useEffect(() => setBad(false), [m.photo]);
  if (m.photo && !bad)
    return (
      <img
        src={m.photo}
        alt={m.name}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setBad(true)}
        style={{ width: s, height: s }}
        className="shrink-0 rounded-full bg-[var(--sf)] object-cover"
      />
    );
  return (
    <span
      aria-hidden
      style={{
        width: s,
        height: s,
        fontSize: s * 0.38,
        background: `linear-gradient(135deg,hsl(${205 + (m.hue % 30)} 80% 48%),hsl(${215 + (m.hue % 25)} 85% 28%))`,
      }}
      className="grid shrink-0 place-items-center rounded-full font-bold text-white"
    >
      {m.name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()}
    </span>
  );
}
const Ring = ({ m, s, on, fn }: { m: Member; s: number; on?: boolean; fn: () => void }) => (
  <button
    onClick={fn}
    aria-label={`Ver perfil de ${m.name}`}
    className="cm-ring shrink-0"
    style={on ? { background: "var(--tx)" } : undefined}
  >
    <span className="block rounded-full border-[3px]" style={{ borderColor: "var(--bg)" }}>
      <Avatar m={m} s={s} />
    </span>
  </button>
);

function Comunidade() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [follows, setFollows] = useState<string[]>(["m1"]);
  const [saved, setSaved] = useState<string[]>([]);
  const [remote, setRemote] = useState<Member[]>([]);
  const [base, setBase] = useState<Member | null>(null);
  const [ov, setOv] = useState<Ov>({});
  const [ready, setReady] = useState(false);
  const [offline, setOffline] = useState(false);
  const [dark, setDark] = useState(false);
  const [toast, setToast] = useState("");
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [tagF, setTagF] = useState("");
  const [author, setAuthor] = useState("");
  const [compose, setCompose] = useState(false);
  const [editing, setEditing] = useState(false);
  const [pe, setPe] = useState<{ role: Role; bio: string; photo?: string }>({
    role: "client",
    bio: "",
  });
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState("");
  const [tag, setTag] = useState("Dúvida");
  const [media, setMedia] = useState<Media | null>(null);
  const [rec, setRec] = useState(0);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [cd, setCd] = useState<Record<string, string>>({});
  const [burst, setBurst] = useState("");
  const mr = useRef<MediaRecorder | null>(null),
    tick = useRef(0),
    tt = useRef(0),
    lastDark = useRef(false),
    asked = useRef(false),
    jumped = useRef(false);

  const say = (m: string) => {
    setToast(m);
    clearTimeout(tt.current);
    tt.current = window.setTimeout(() => setToast(""), 2800);
  };
  const prof = useMemo<Member | null>(
    () =>
      base
        ? {
            ...base,
            role: ov.role ?? base.role,
            bio: ov.bio ?? base.bio,
            photo: ov.photo ?? base.photo,
          }
        : null,
    [base, ov],
  );

  const load = useCallback(async () => {
    try {
      const [pm, pp] = await Promise.all([
        api("cm_members?select=id,data"),
        api("cm_posts?select=id,at,data&order=at.desc&limit=150"),
      ]);
      let rows = pp;
      if (!rows.length) {
        rows = seedPosts().map(split);
        await api(
          "cm_posts?on_conflict=id",
          "POST",
          rows,
          "resolution=merge-duplicates,return=minimal",
        ).catch(() => {});
      }
      setRemote(pm.map((r: any) => ({ id: r.id, ...r.data })));
      setPosts(rows.map((r: any) => ({ id: r.id, at: r.at, ...r.data })));
      setOffline(false);
    } catch {
      setOffline(true);
    }
  }, []);

  useEffect(() => {
    const get = (k: string, d: any) => {
      try {
        return JSON.parse(localStorage.getItem(k) || "") ?? d;
      } catch {
        return d;
      }
    };
    setFollows(get("cm-follows", ["m1"]));
    setSaved(get("cm-saved", []));
    setOv(get("cm-prof", {}));
    if (!ONLINE) {
      const s = get(KEY, null);
      setPosts(s?.posts || seedPosts());
    }
    /* o perfil da conta (nome, foto, bio…) entra aqui sozinho e se atualiza sempre que muda */
    const sync = () => {
      const a = readAccount();
      if (!a) return setBase(null);
      const x = readPub();
      let id = "me";
      if (ONLINE) {
        id = localStorage.getItem("cm-uid") || uid() + uid();
        localStorage.setItem("cm-uid", id);
      }
      setBase({
        id,
        name: a.name,
        photo: a.photo || undefined,
        handle: x.handle || slug(a.name) || "membro",
        role: x.role,
        bio: x.bio || (x.role === "dev" ? "Programador(a) na comunidade" : "Cliente na comunidade"),
        hue: hueOf(a.name),
      });
    };
    sync();
    setReady(true);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && (setCompose(false), setEditing(false));
    const theme = () => {
      const v = siteDark();
      if (v !== lastDark.current) {
        lastDark.current = v;
        setDark(v);
      }
    };
    lastDark.current = siteDark();
    setDark(lastDark.current);
    const mo = new MutationObserver(theme),
      tc = () => setTimeout(theme, 120),
      ti = window.setInterval(theme, 800);
    for (const e of [document.documentElement, document.body]) mo.observe(e, { attributes: true });
    addEventListener("storage", sync);
    addEventListener("focus", sync);
    addEventListener("keydown", esc);
    addEventListener("click", tc);
    let poll = 0;
    if (ONLINE) {
      load();
      poll = window.setInterval(load, 8000);
      addEventListener("focus", load);
    }
    return () => {
      mo.disconnect();
      clearInterval(poll);
      clearInterval(ti);
      removeEventListener("storage", sync);
      removeEventListener("focus", sync);
      removeEventListener("keydown", esc);
      removeEventListener("click", tc);
      removeEventListener("focus", load);
    };
  }, [load]);
  useEffect(() => {
    if (ready) {
      localStorage.setItem("cm-follows", JSON.stringify(follows));
      localStorage.setItem("cm-saved", JSON.stringify(saved));
    }
  }, [follows, saved, ready]);
  useEffect(() => {
    if (!ready || ONLINE) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ posts }));
    } catch {
      say("Armazenamento cheio. Exclua posts com vídeo ou áudio pesado.");
    }
  }, [posts, ready]);
  /* envia o perfil para o servidor: a foto vai para o armazenamento e só o link fica no cadastro */
  useEffect(() => {
    if (!ONLINE || !prof) return;
    (async () => {
      let photo = prof.photo;
      try {
        if (photo?.startsWith("data:")) {
          const sig = photo.length + photo.slice(-24);
          if (localStorage.getItem("cm-ph-sig") === sig)
            photo = localStorage.getItem("cm-ph-url") || undefined;
          else {
            photo = await upload(
              await (await fetch(photo)).blob(),
              `avatar-${prof.id}-${Date.now()}.jpg`,
            );
            localStorage.setItem("cm-ph-sig", sig);
            localStorage.setItem("cm-ph-url", photo);
          }
        }
        await api(
          "cm_members?on_conflict=id",
          "POST",
          [
            {
              id: prof.id,
              data: {
                name: prof.name,
                handle: prof.handle,
                role: prof.role,
                bio: prof.bio,
                hue: prof.hue,
                photo,
              },
            },
          ],
          "resolution=merge-duplicates,return=minimal",
        );
      } catch {
        /* tenta de novo na próxima mudança */
      }
    })();
  }, [prof?.id, prof?.name, prof?.handle, prof?.role, prof?.bio, prof?.photo]);
  /* primeira visita com conta: pergunta se é cliente ou programador */
  useEffect(() => {
    if (!ready || !base || asked.current || localStorage.getItem("cm-prof")) return;
    asked.current = true;
    setPe({ role: base.role, bio: base.bio, photo: base.photo });
    setEditing(true);
  }, [ready, base]);
  /* link compartilhado (#p-id) rola até o post */
  useEffect(() => {
    if (jumped.current || !posts.length || !location.hash.startsWith("#p-")) return;
    jumped.current = true;
    setTimeout(
      () =>
        document
          .getElementById(location.hash.slice(1))
          ?.scrollIntoView({ behavior: "smooth", block: "center" }),
      400,
    );
  }, [posts]);

  const members = useMemo(
    () => [...SEED_MEMBERS, ...remote.filter((m) => m.id !== prof?.id), ...(prof ? [prof] : [])],
    [remote, prof],
  );
  const byId = useMemo(() => new Map(members.map((m) => [m.id, m])), [members]);
  const me = prof,
    myId = prof?.id ?? "";
  const pts = (id: string) => statsFor(posts, id).pts;
  const need = () => {
    if (me) return true;
    say("Crie sua conta em Meu perfil para participar");
    return false;
  };
  const openCompose = () => {
    if (need()) setCompose(true);
  };
  const openEdit = () => {
    if (!me || !need()) return;
    setPe({ role: me.role, bio: me.bio, photo: me.photo });
    setEditing(true);
  };
  const closeEdit = () => {
    if (!localStorage.getItem("cm-prof")) localStorage.setItem("cm-prof", "{}");
    setEditing(false);
  };
  const saveProfile = () => {
    const o: Ov = { role: pe.role, bio: pe.bio.trim().slice(0, 160) || undefined, photo: pe.photo };
    setOv(o);
    localStorage.setItem("cm-prof", JSON.stringify(o));
    setEditing(false);
    say("Perfil atualizado");
  };
  const role = (r: Role) => (r === "dev" ? "Programador" : "Cliente");

  /* altera um post na hora na tela e, se estiver online, no servidor */
  const edit = async (id: string, fn: (p: Post) => Post) => {
    setPosts((l) => l.map((p) => (p.id === id ? fn(p) : p)));
    if (!ONLINE) return;
    try {
      const [r] = await api(`cm_posts?id=eq.${id}&select=id,at,data`);
      if (r)
        await api(`cm_posts?id=eq.${id}`, "PATCH", {
          data: split(fn({ id: r.id, at: r.at, ...r.data })).data,
        });
    } catch {
      say("Sem conexão. Tente de novo.");
    }
  };
  const follow = (id: string) => {
    if (!need()) return;
    const on = follows.includes(id);
    setFollows((f) => (on ? f.filter((x) => x !== id) : [...f, id]));
    say(on ? "Você deixou de seguir" : `Agora você segue ${byId.get(id)?.name.split(" ")[0]}`);
  };
  const save = (id: string) => {
    const on = saved.includes(id);
    setSaved((s) => (on ? s.filter((x) => x !== id) : [...s, id]));
    say(on ? "Removido dos salvos" : "Post salvo");
  };
  const share = async (p: Post) => {
    const url = `${location.origin}${location.pathname}#p-${p.id}`;
    try {
      if (navigator.share) await navigator.share({ title: "Diamante Dev Comunidade", url });
      else {
        await navigator.clipboard.writeText(url);
        say("Link copiado");
      }
    } catch {
      /* cancelado */
    }
  };
  async function attach(f: File | undefined, kind: Kind) {
    if (!f) return;
    if (kind !== "image" && f.size > LIM)
      return say(`Arquivo grande demais. O limite é ${LIM / 1e6} MB.`);
    const raw = await toData(f);
    setMedia({ kind, src: kind === "image" ? await shrink(raw) : raw });
  }
  async function pickPhoto(f?: File) {
    if (f) {
      const src = await shrink(await toData(f), 480, true);
      setPe((x) => ({ ...x, photo: src }));
    }
  }
  async function toggleRec() {
    if (rec) return mr.current?.stop();
    try {
      const st = await navigator.mediaDevices.getUserMedia({ audio: true }),
        r = new MediaRecorder(st),
        ch: Blob[] = [];
      r.ondataavailable = (e) => ch.push(e.data);
      r.onstop = async () => {
        st.getTracks().forEach((t) => t.stop());
        clearInterval(tick.current);
        setRec(0);
        const b = new Blob(ch, { type: r.mimeType });
        if (b.size > LIM) return say("Áudio longo demais. Grave até 60 segundos.");
        setMedia({ kind: "audio", src: await toData(b) });
      };
      r.start();
      mr.current = r;
      setRec(1);
      let n = 0;
      tick.current = window.setInterval(() => {
        setRec(++n + 1);
        if (n >= 60) r.stop();
      }, 1000);
    } catch {
      say("Não consegui acessar o microfone. Libere a permissão no navegador.");
    }
  }
  async function publish() {
    if (!need() || busy) return;
    const text = draft.trim();
    if (!text && !media) return say("Escreva algo ou anexe uma mídia");
    setBusy(true);
    try {
      let m = media;
      if (m && ONLINE) {
        const b = await (await fetch(m.src)).blob();
        m = {
          kind: m.kind,
          src: await upload(
            b,
            `${myId}-${Date.now()}.${(b.type.split("/")[1] || "bin").split(";")[0]}`,
          ),
        };
      }
      const p: Post = {
        id: uid() + uid(),
        by: myId,
        text,
        tag,
        media: m ?? undefined,
        at: Date.now(),
        up: [],
        down: [],
        cmts: [],
      };
      if (ONLINE)
        await api(
          "cm_posts?on_conflict=id",
          "POST",
          [split(p)],
          "resolution=merge-duplicates,return=minimal",
        );
      setPosts((l) => [p, ...l]);
      setDraft("");
      setMedia(null);
      setCompose(false);
      setTab("all");
      setAuthor("");
      setTagF("");
      scrollTo({ top: 0, behavior: "smooth" });
      recordAnalyticsEvent("community" as never, "Post publicado", {});
      say(ONLINE ? "Publicado para todos" : "Publicado");
    } catch {
      say("Não foi possível publicar. Confira a conexão e tente de novo.");
    }
    setBusy(false);
  }
  const delPost = async (id: string) => {
    if (!confirm("Excluir este post?")) return;
    setPosts((l) => l.filter((p) => p.id !== id));
    if (ONLINE)
      await api(`cm_posts?id=eq.${id}`, "DELETE").catch(() => say("Sem conexão. Tente de novo."));
    say("Post excluído");
  };
  const react = (id: string, kind: "up" | "down") => {
    if (!need()) return;
    const other = kind === "up" ? "down" : "up";
    edit(id, (p) => ({
      ...p,
      [kind]: p[kind].includes(myId) ? p[kind].filter((x) => x !== myId) : [...p[kind], myId],
      [other]: p[other].filter((x) => x !== myId),
    }));
  };
  const likeMedia = (p: Post) => {
    if (!p.up.includes(myId)) react(p.id, "up");
    setBurst(p.id);
    setTimeout(() => setBurst(""), 800);
  };
  const addCmt = (id: string) => {
    if (!need()) return;
    const t = (cd[id] || "").trim();
    if (!t) return;
    const c: Cmt = { id: uid(), by: myId, text: t, at: Date.now() };
    edit(id, (p) => ({ ...p, cmts: [...p.cmts, c] }));
    setCd((x) => ({ ...x, [id]: "" }));
    setOpen((o) => ({ ...o, [id]: true }));
  };
  const delCmt = (pid: string, cid: string) =>
    edit(pid, (p) => ({ ...p, cmts: p.cmts.filter((c) => c.id !== cid) }));

  /* hashtags: a do assunto + as digitadas no texto; todas filtram o feed */
  const tagsOf = (p: Post) =>
    new Set([norm(p.tag), ...(p.text.match(HT) || []).map((h) => norm(h.slice(1)))]);
  const tagStats = useMemo(() => {
    const c = new Map<string, { k: string; l: string; n: number }>();
    TAGS.forEach((t) => c.set(norm(t), { k: norm(t), l: t, n: 0 }));
    posts.forEach((p) => {
      const seen = new Set<string>();
      [p.tag, ...(p.text.match(HT) || []).map((h) => h.slice(1))].forEach((l) => {
        const k = norm(l);
        if (!k || seen.has(k)) return;
        seen.add(k);
        const e = c.get(k);
        e ? e.n++ : c.set(k, { k, l, n: 1 });
      });
    });
    return [...c.values()];
  }, [posts]);
  const trending = [...tagStats]
    .filter((t) => t.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, 8);
  const pickTag = (k: string) => {
    setTagF(tagF === k ? "" : k);
    setAuthor("");
  };
  const rich = (t: string) =>
    t.split(/(#[\p{L}\p{N}_]+)/u).map((s, i) =>
      i % 2 ? (
        <button
          key={i}
          onClick={() => pickTag(norm(s.slice(1)))}
          className="cm-p font-semibold hover:underline"
        >
          {s}
        </button>
      ) : (
        s
      ),
    );

  const feed = posts.filter((p) => {
    const m = byId.get(p.by);
    if (!m) return false;
    if (tab === "following" && !follows.includes(p.by) && p.by !== myId) return false;
    if ((tab === "dev" || tab === "client") && m.role !== tab) return false;
    if (tab === "saved" && !saved.includes(p.id)) return false;
    if (tagF && !tagsOf(p).has(tagF)) return false;
    if (author && p.by !== author) return false;
    const s = q.trim().toLowerCase();
    return !s || (p.text + p.tag + m.name + m.handle + m.bio).toLowerCase().includes(s);
  });
  const others = members.filter((m) => m.id !== myId);
  const suggest = [...others]
    .sort((a, b) => +follows.includes(a.id) - +follows.includes(b.id))
    .slice(0, 6);
  const rank = [...members].sort((a, b) => pts(b.id) - pts(a.id)).slice(0, 6);
  const P = pts(myId),
    L = lv(P),
    pct = L.next ? Math.min(100, ((P - L.cur.min) / (L.next.min - L.cur.min)) * 100) : 100;
  const authorM = author ? byId.get(author) : undefined;
  const top = posts.reduce<Post | null>((b, p) => (!b || p.up.length > b.up.length ? p : b), null);
  const hot = top && top.up.length >= 3 ? top.id : "";

  const followTxt = (id: string) => {
    const on = follows.includes(id);
    return (
      <button
        onClick={() => follow(id)}
        aria-pressed={on}
        className={on ? "cm-m text-sm font-semibold" : "cm-link"}
      >
        {on ? "Seguindo" : "Seguir"}
      </button>
    );
  };
  const followBtn = (id: string, cls = "") => {
    const on = follows.includes(id);
    return (
      <button
        onClick={() => follow(id)}
        aria-pressed={on}
        className={`cm-btn ${on ? "cm-sec" : ""} ${cls}`}
      >
        {on ? "Seguindo" : "Seguir"}
      </button>
    );
  };
  const mediaEl = (m: Media) =>
    m.kind === "image" ? (
      <img
        src={m.src}
        alt="Imagem do post"
        loading="lazy"
        className="max-h-[80vh] w-full object-cover"
      />
    ) : m.kind === "video" ? (
      <video src={m.src} controls playsInline className="max-h-[80vh] w-full bg-black" />
    ) : (
      <div className="p-3">
        <audio src={m.src} controls className="h-11 w-full min-w-0" />
      </div>
    );

  const profileCard = (compact: boolean) => {
    if (!me)
      return (
        <div className="cm-card cm-up mx-3 p-5 text-center sm:mx-0">
          <p className="text-lg font-bold">Participe com a sua conta</p>
          <p className="cm-m mt-1 text-sm">Foto, nome e bio entram aqui automaticamente.</p>
          <Link to="/perfil" className="cm-btn mt-4 w-full">
            Criar meu perfil
          </Link>
        </div>
      );
    if (compact)
      return (
        <div className="cm-card cm-up mx-3 flex items-center gap-3 p-3 sm:mx-0">
          <Ring m={me} s={52} fn={() => setAuthor(myId)} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold">{me.name}</p>
            <p className="cm-m truncate text-sm">
              @{me.handle} · {role(me.role)}
            </p>
          </div>
          <button onClick={openEdit} className="cm-btn cm-sec">
            Editar perfil
          </button>
        </div>
      );
    return (
      <div className="cm-card cm-up overflow-hidden">
        <div
          className="h-20"
          style={{
            background: `linear-gradient(120deg,hsl(${205 + (me.hue % 30)} 85% 42%),hsl(${220 + (me.hue % 20)} 80% 20%))`,
          }}
        />
        <div className="px-5 pb-5">
          <div className="-mt-11 w-fit">
            <Ring m={me} s={84} fn={() => setAuthor(myId)} />
          </div>
          <p className="mt-3 truncate text-xl font-extrabold">{me.name}</p>
          <p className="cm-m flex items-center gap-2 text-sm">
            <span className="truncate">@{me.handle}</span>
            <span className={`cm-pill ${me.role === "dev" ? "cm-p" : ""}`}>{role(me.role)}</span>
          </p>
          <p className="mt-3 text-sm leading-relaxed [overflow-wrap:anywhere]">{me.bio}</p>
          <div className="mt-4 flex items-end justify-between text-xs font-semibold">
            <span>{L.cur.n}</span>
            <span className="cm-m">
              {L.next ? `${L.next.min - P} pts para ${L.next.n}` : "Nível máximo"}
            </span>
          </div>
          <div
            className="mt-1.5 h-2 overflow-hidden rounded-full"
            style={{ background: "var(--sf)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.max(5, pct)}%`, background: "var(--pr)" }}
            />
          </div>
          <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[
              ["Posts", posts.filter((p) => p.by === myId).length],
              ["Seguindo", follows.length],
              ["Pontos", P],
            ].map(([l, n]) => (
              <div key={l} className="min-w-0 rounded-xl py-2" style={{ background: "var(--sf)" }}>
                <dd className="text-lg font-black">{n}</dd>
                <dt className="cm-m truncate text-[11px] font-bold">{l}</dt>
              </div>
            ))}
          </dl>
          <button onClick={openEdit} className="cm-btn cm-sec mt-4 w-full">
            <Camera size={16} /> Editar perfil
          </button>
        </div>
      </div>
    );
  };

  const card = (p: Post, i: number) => {
    const m = byId.get(p.by)!,
      mine = p.by === myId,
      iUp = p.up.includes(myId),
      iDown = p.down.includes(myId),
      n = p.cmts.length,
      sv = saved.includes(p.id);
    return (
      <article
        key={p.id}
        id={`p-${p.id}`}
        style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }}
        className="cm-up scroll-mt-36 overflow-hidden border-b pb-4 sm:cm-card sm:border"
      >
        <header className="flex items-center gap-3 px-3 py-3 sm:px-4">
          <Ring m={m} s={44} fn={() => setAuthor(p.by)} />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="flex flex-wrap items-center gap-x-1.5 text-[15px]">
              <button
                onClick={() => setAuthor(p.by)}
                className="max-w-full truncate font-bold hover:underline"
              >
                {m.handle}
              </button>
              <span className="cm-m">· {ago(p.at)}</span>
              {!mine && (
                <>
                  <span className="cm-m">·</span>
                  {followTxt(p.by)}
                </>
              )}
              {p.id === hot && (
                <span className="cm-p inline-flex items-center gap-0.5 text-xs font-semibold">
                  <Flame size={14} /> Em alta
                </span>
              )}
            </p>
            <p className="cm-m truncate text-sm">
              {m.name} · {role(m.role)}
            </p>
          </div>
          {mine && (
            <button
              onClick={() => delPost(p.id)}
              aria-label="Excluir post"
              title="Excluir post"
              className="cm-ic"
            >
              <Trash2 size={19} />
            </button>
          )}
        </header>
        {p.media && (
          <div
            className="relative overflow-hidden border-y"
            style={{ background: "var(--sf)" }}
            onDoubleClick={() => likeMedia(p)}
          >
            {mediaEl(p.media)}
            {burst === p.id && (
              <span className="cm-burst absolute inset-0 grid place-items-center text-white drop-shadow-xl">
                <ThumbsUp size={96} fill="currentColor" />
              </span>
            )}
          </div>
        )}
        <div className="flex items-center px-1.5 pt-1.5 sm:px-2.5">
          <button
            onClick={() => react(p.id, "up")}
            aria-pressed={iUp}
            aria-label="Curtir"
            className={`cm-ic ${iUp ? "cm-p" : ""}`}
          >
            <ThumbsUp
              size={25}
              fill={iUp ? "currentColor" : "none"}
              className={iUp ? "cm-pop" : ""}
            />
            {iUp && <span className="cm-ping" />}
          </button>
          <button
            onClick={() => react(p.id, "down")}
            aria-pressed={iDown}
            aria-label="Não curtir"
            className={`cm-ic ${iDown ? "cm-p" : ""}`}
          >
            <ThumbsDown
              size={25}
              fill={iDown ? "currentColor" : "none"}
              className={iDown ? "cm-pop" : ""}
            />
            {iDown && <span className="cm-ping" />}
          </button>
          <button
            onClick={() => setOpen((o) => ({ ...o, [p.id]: !o[p.id] }))}
            aria-label="Comentários"
            aria-expanded={!!open[p.id]}
            className="cm-ic"
          >
            <MessageCircle size={25} />
          </button>
          <button onClick={() => share(p)} aria-label="Compartilhar" className="cm-ic">
            <Share2 size={23} />
          </button>
          <button
            onClick={() => save(p.id)}
            aria-pressed={sv}
            aria-label={sv ? "Remover dos salvos" : "Salvar"}
            className={`cm-ic ml-auto ${sv ? "cm-p" : ""}`}
          >
            <Bookmark
              size={25}
              fill={sv ? "currentColor" : "none"}
              className={sv ? "cm-pop" : ""}
            />
          </button>
        </div>
        <div className="space-y-2 px-3 text-base sm:px-4">
          <p className="font-bold">
            {p.up.length} {p.up.length === 1 ? "curtida" : "curtidas"}
            {p.down.length > 0 && (
              <span className="cm-m font-medium">
                {" "}
                · {p.down.length} {p.down.length === 1 ? "não curtida" : "não curtidas"}
              </span>
            )}
          </p>
          <p className="whitespace-pre-wrap leading-relaxed [overflow-wrap:anywhere]">
            <b>{m.handle}</b> {rich(p.text)}{" "}
            <button
              onClick={() => pickTag(norm(p.tag))}
              className="cm-p font-semibold hover:underline"
            >
              #{p.tag}
            </button>
          </p>
          <button
            onClick={() => setOpen((o) => ({ ...o, [p.id]: !o[p.id] }))}
            className="cm-m block text-sm"
          >
            {open[p.id]
              ? "Ocultar comentários"
              : n
                ? `Ver ${n === 1 ? "o comentário" : `todos os ${n} comentários`}`
                : "Seja a primeira pessoa a comentar"}
          </button>
          {open[p.id] &&
            p.cmts.map((c) => {
              const cm = byId.get(c.by);
              return (
                cm && (
                  <div key={c.id} className="cm-up flex items-start gap-2.5">
                    <Avatar m={cm} s={30} />
                    <p className="min-w-0 flex-1 text-[15px] [overflow-wrap:anywhere]">
                      <b>{cm.handle}</b> {c.text} <span className="cm-m text-xs">{ago(c.at)}</span>
                    </p>
                    {(c.by === myId || mine) && (
                      <button
                        onClick={() => delCmt(p.id, c.id)}
                        aria-label="Excluir comentário"
                        className="cm-m shrink-0 p-1 hover:text-red-500"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>
                )
              );
            })}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addCmt(p.id);
            }}
            className="flex items-center gap-2 border-t pt-2"
          >
            <input
              value={cd[p.id] || ""}
              onChange={(e) => setCd((x) => ({ ...x, [p.id]: e.target.value }))}
              maxLength={300}
              placeholder="Adicione um comentário…"
              aria-label="Comentário"
              className="min-w-0 flex-1 bg-transparent py-2 text-[15px] outline-none placeholder:text-[var(--mt)]"
            />
            <button type="submit" disabled={!(cd[p.id] || "").trim()} className="cm-link">
              Publicar
            </button>
          </form>
        </div>
      </article>
    );
  };

  const rankItem = (m: Member, i: number) => (
    <button
      key={m.id}
      onClick={() => {
        setAuthor(m.id);
        scrollTo({ top: 0, behavior: "smooth" });
      }}
      className="flex min-w-0 items-center gap-3 text-left"
    >
      <span className="cm-p w-4 shrink-0 text-center text-sm font-bold">{i + 1}</span>
      <Avatar m={m} s={36} />
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block truncate text-sm font-bold">{m.name}</span>
        <span className="cm-m text-xs">
          {pts(m.id)} pts · {lv(pts(m.id)).cur.n}
        </span>
      </span>
    </button>
  );

  return (
    <div className="cm min-h-dvh overflow-x-clip pt-28 sm:pt-32" data-t={dark ? "dark" : "light"}>
      <style>{CSS}</style>
      <div className="mx-auto grid w-full max-w-[2200px] grid-cols-1 gap-6 pb-24 sm:px-5 lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[270px_minmax(0,1fr)_340px] xl:gap-8 2xl:px-10">
        <aside className="cm-hs sticky top-32 hidden max-h-[calc(100dvh-9rem)] space-y-5 self-start overflow-y-auto lg:block">
          <nav aria-label="Menu da comunidade" className="space-y-1">
            {TABS.map(([id, l, I]) => (
              <button
                key={id}
                onClick={() => {
                  setTab(id);
                  setAuthor("");
                }}
                aria-current={tab === id}
                className="cm-nav"
              >
                <I size={25} strokeWidth={tab === id ? 2.6 : 2} className="shrink-0" />
                {l}
              </button>
            ))}
            <button onClick={openCompose} className="cm-btn mt-3 w-full !min-h-12 !text-base">
              <PlusSquare size={20} /> Criar publicação
            </button>
          </nav>
          {profileCard(false)}
          <section className="cm-card p-4">
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold">
              <Hash size={16} className="cm-p" /> Assuntos do momento
            </h2>
            <ul className="space-y-1">
              {trending.map((t) => (
                <li key={t.k}>
                  <button
                    onClick={() => pickTag(t.k)}
                    aria-pressed={tagF === t.k}
                    className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm transition hover:bg-[var(--sf)] aria-pressed:bg-[var(--sf)] aria-pressed:font-bold"
                  >
                    <span className="cm-p font-semibold">#{t.l}</span>
                    <span className="cm-m text-xs">
                      {t.n} {t.n === 1 ? "post" : "posts"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </aside>

        <main className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3 px-3 sm:px-0">
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">Comunidade</h1>
              <p className="cm-m text-base">
                Quem faz e quem contrata sites, na mesma conversa. {members.length} membros ·{" "}
                {posts.length} posts
              </p>
            </div>
            <span
              className="cm-pill !py-1.5"
              title={
                ONLINE
                  ? "Posts compartilhados com todos os aparelhos"
                  : "Sem banco de dados configurado: os posts ficam só neste navegador"
              }
            >
              <span
                className={`mr-2 h-2 w-2 rounded-full ${ONLINE && !offline ? "cm-live" : ""}`}
                style={{ background: ONLINE && !offline ? "var(--pr)" : "var(--mt)" }}
              />
              {!ONLINE ? "Modo local" : offline ? "Reconectando…" : "Ao vivo"}
            </span>
            <div className="relative w-full">
              <Search
                size={18}
                className="cm-m pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
              />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por assunto, #hashtag, pessoa ou biografia"
                aria-label="Buscar"
                className="cm-fld !pl-11"
              />
            </div>
          </div>

          <div className="lg:hidden">{profileCard(true)}</div>
          <button
            onClick={openCompose}
            className="cm-card cm-lift mx-3 flex w-[calc(100%-1.5rem)] items-center gap-3 p-3.5 text-left sm:mx-0 sm:w-full"
          >
            {me ? (
              <Avatar m={me} s={44} />
            ) : (
              <span
                className="h-11 w-11 shrink-0 rounded-full"
                style={{ background: "var(--sf)" }}
              />
            )}
            <span className="cm-m min-w-0 flex-1 truncate">
              Compartilhe um projeto, uma dúvida ou uma dica…
            </span>
            <ImageIcon size={22} className="cm-p shrink-0" />
            <Video size={22} className="cm-p hidden shrink-0 sm:block" />
            <Mic size={22} className="cm-p hidden shrink-0 sm:block" />
          </button>

          <section aria-label="Membros">
            <h2 className="px-3 pb-2 text-lg font-bold sm:px-0">Conheça a comunidade</h2>
            <ul className="cm-hs cm-snap flex gap-3 overflow-x-auto px-3 pb-3 pt-1 sm:px-0">
              {others.map((m, i) => (
                <li
                  key={m.id}
                  style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
                  className="cm-up cm-card cm-lift flex w-[12.5rem] shrink-0 flex-col items-center p-4 text-center sm:w-[14rem]"
                >
                  <Ring
                    m={m}
                    s={92}
                    on={author === m.id}
                    fn={() => setAuthor(author === m.id ? "" : m.id)}
                  />
                  <p className="mt-3 w-full truncate font-bold">{m.name}</p>
                  <p className="cm-p w-full truncate text-sm font-semibold">@{m.handle}</p>
                  <span className={`cm-pill mt-1.5 ${m.role === "dev" ? "cm-p" : ""}`}>
                    {role(m.role)}
                  </span>
                  <p className="cm-m cm-clamp mt-2 min-h-[4.5rem] text-sm leading-6">{m.bio}</p>
                  {followBtn(m.id, "mt-3 w-full")}
                </li>
              ))}
            </ul>
          </section>

          <div className="cm-hs flex gap-2 overflow-x-auto px-3 pb-1 sm:px-0" role="tablist">
            {TABS.map(([id, l]) => (
              <button
                key={id}
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className="cm-chip lg:hidden"
              >
                {l}
              </button>
            ))}
          </div>
          <div
            className="cm-hs flex gap-2 overflow-x-auto border-b px-3 pb-3 sm:px-0"
            aria-label="Hashtags"
          >
            {tagStats.map((t) => (
              <button
                key={t.k}
                aria-pressed={tagF === t.k}
                onClick={() => pickTag(t.k)}
                className="cm-chip"
              >
                #{t.l} <span className="opacity-60">{t.n}</span>
              </button>
            ))}
          </div>

          {authorM && (
            <section className="cm-up cm-card mx-3 flex items-start gap-4 p-4 sm:mx-0 sm:gap-5 sm:p-5">
              <Ring m={authorM} s={96} fn={() => setAuthor("")} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <h2 className="truncate text-xl font-bold">{authorM.handle}</h2>
                  {authorM.id !== myId && followBtn(authorM.id)}
                  <button onClick={() => setAuthor("")} className="cm-btn cm-sec">
                    Ver todos
                  </button>
                </div>
                <p className="mt-2 font-bold">
                  {authorM.name} <span className="cm-m font-medium">· {role(authorM.role)}</span>
                </p>
                <p className="mt-1 leading-relaxed [overflow-wrap:anywhere]">{authorM.bio}</p>
                <p className="cm-m mt-2 text-sm font-semibold">
                  {posts.filter((p) => p.by === author).length} posts · {pts(author)} pontos ·{" "}
                  {lv(pts(author)).cur.n}
                </p>
              </div>
            </section>
          )}
          {tagF && (
            <p className="cm-m px-3 text-sm font-semibold sm:px-0">
              Mostrando posts com{" "}
              <span className="cm-p">#{tagStats.find((t) => t.k === tagF)?.l ?? tagF}</span> ·{" "}
              <button onClick={() => setTagF("")} className="cm-link">
                limpar
              </button>
            </p>
          )}

          <div className="grid items-start gap-0 sm:gap-5 2xl:grid-cols-2 min-[2300px]:grid-cols-3">
            {feed.map(card)}
          </div>
          {ready && !feed.length && (
            <div className="cm-up px-6 py-20 text-center">
              <p className="text-lg font-bold">Nada por aqui ainda</p>
              <p className="cm-m mt-1">
                {tab === "saved"
                  ? "Toque no marcador de um post para guardar aqui."
                  : tab === "following"
                    ? "Siga alguns perfis para ver os posts deles aqui."
                    : "Mude o filtro ou publique o primeiro post sobre esse assunto."}
              </p>
            </div>
          )}

          <section aria-label="Mais ativos" className="xl:hidden">
            <h2 className="px-3 pb-2 pt-4 text-lg font-bold sm:px-0">Mais ativos</h2>
            <div className="cm-hs flex gap-3 overflow-x-auto px-3 pb-2 sm:px-0">
              {rank.map((m, i) => (
                <div key={m.id} className="cm-card w-56 shrink-0 p-3">
                  {rankItem(m, i)}
                </div>
              ))}
            </div>
          </section>
        </main>

        <aside className="cm-hs sticky top-32 hidden max-h-[calc(100dvh-9rem)] space-y-5 self-start overflow-y-auto xl:block">
          <section className="cm-card p-4">
            <h2 className="mb-3 text-base font-bold">Sugestões para você</h2>
            <ul className="space-y-3.5">
              {suggest.map((m) => (
                <li key={m.id} className="flex items-center gap-3">
                  <Ring m={m} s={44} fn={() => setAuthor(m.id)} />
                  <div className="min-w-0 flex-1 leading-tight">
                    <p className="truncate font-bold">{m.handle}</p>
                    <p className="cm-m truncate text-xs">
                      {role(m.role)} · {m.bio}
                    </p>
                  </div>
                  {followTxt(m.id)}
                </li>
              ))}
            </ul>
          </section>
          <section className="cm-card p-4">
            <h2 className="mb-3 text-base font-bold">Mais ativos</h2>
            <ol className="space-y-3">
              {rank.map((m, i) => (
                <li key={m.id}>{rankItem(m, i)}</li>
              ))}
            </ol>
          </section>
          <p className="cm-m px-1 text-xs leading-relaxed">
            Respeite quem pergunta, seja claro ao responder e não divulgue dados pessoais. Fotos de
            qualquer tamanho; vídeos e áudios até {LIM / 1e6} MB.
          </p>
        </aside>
      </div>

      {compose && me && (
        <div
          className="fixed inset-0 z-[9999] grid place-items-end bg-black/60 sm:place-items-center sm:p-4"
          onClick={() => setCompose(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Criar publicação"
        >
          <div
            className="cm-sheet max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border sm:max-w-xl sm:rounded-2xl"
            style={{ background: "var(--bg)", color: "var(--tx)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="sticky top-0 z-10 flex items-center justify-between border-b px-2 py-2"
              style={{ background: "var(--bg)" }}
            >
              <button onClick={() => setCompose(false)} aria-label="Fechar" className="cm-ic">
                <X size={22} />
              </button>
              <h2 className="text-lg font-bold">Criar publicação</h2>
              <button onClick={publish} disabled={busy} className="cm-link !px-3 !text-base">
                {busy ? "Enviando…" : "Publicar"}
              </button>
            </div>
            <div className="space-y-3 p-4">
              <div className="flex items-center gap-3">
                <Avatar m={me} s={46} />
                <div className="min-w-0">
                  <p className="truncate font-bold">{me.handle}</p>
                  <p className="cm-m truncate text-sm">{role(me.role)}</p>
                </div>
              </div>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={500}
                rows={4}
                autoFocus
                aria-label="Novo post"
                placeholder="Compartilhe um projeto, uma dúvida ou uma dica. Use # para criar hashtags."
                className="cm-fld min-h-32 resize-none"
              />
              {media && (
                <div className="cm-up relative overflow-hidden rounded-xl border">
                  {mediaEl(media)}
                  <button
                    onClick={() => setMedia(null)}
                    aria-label="Remover anexo"
                    className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-black/70 text-white"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
              {!!rec && (
                <p className="flex items-center gap-2 font-bold text-red-500">
                  <span className="cm-rec h-3 w-3 rounded-full bg-red-500" /> Gravando… {rec - 1}s
                  (máx. 60s)
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2">
                {(
                  [
                    ["image", "Foto", "image/*", ImageIcon],
                    ["video", "Vídeo", "video/*", Video],
                    ["audio", "Áudio", "audio/*", Music],
                  ] as const
                ).map(([k, l, a, I]) => (
                  <label
                    key={k}
                    className="cm-chip inline-flex cursor-pointer items-center gap-1.5"
                  >
                    <I size={17} />
                    {l}
                    <input
                      type="file"
                      accept={a}
                      className="sr-only"
                      onChange={(e) => {
                        attach(e.target.files?.[0], k);
                        e.target.value = "";
                      }}
                    />
                  </label>
                ))}
                <button
                  type="button"
                  onClick={toggleRec}
                  className="cm-chip inline-flex items-center gap-1.5"
                  aria-pressed={!!rec}
                >
                  {rec ? (
                    <>
                      <Square size={15} /> Parar
                    </>
                  ) : (
                    <>
                      <Mic size={17} /> Voz
                    </>
                  )}
                </button>
                <span className="cm-m ml-auto text-sm font-semibold">{draft.length}/500</span>
              </div>
              <div
                className="flex flex-wrap gap-1.5 border-t pt-3"
                role="radiogroup"
                aria-label="Assunto"
              >
                {TAGS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={tag === t}
                    aria-pressed={tag === t}
                    onClick={() => setTag(t)}
                    className="cm-chip"
                  >
                    #{t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div
          className="fixed inset-0 z-[9999] grid place-items-end bg-black/60 sm:place-items-center sm:p-4"
          onClick={closeEdit}
          role="dialog"
          aria-modal="true"
          aria-label="Editar perfil"
        >
          <div
            className="cm-sheet max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border sm:max-w-lg sm:rounded-2xl"
            style={{ background: "var(--bg)", color: "var(--tx)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="sticky top-0 z-10 flex items-center justify-between border-b px-2 py-2"
              style={{ background: "var(--bg)" }}
            >
              <button onClick={closeEdit} aria-label="Fechar" className="cm-ic">
                <X size={22} />
              </button>
              <h2 className="text-lg font-bold">Seu perfil na comunidade</h2>
              <button onClick={saveProfile} className="cm-link !px-3 !text-base">
                Salvar
              </button>
            </div>
            <div className="space-y-5 p-5">
              <div className="flex flex-col items-center gap-3">
                <label className="cm-ring cm-float relative cursor-pointer" title="Trocar foto">
                  <span
                    className="block rounded-full border-[4px]"
                    style={{ borderColor: "var(--bg)" }}
                  >
                    <Avatar
                      m={{
                        ...(me ??
                          base ?? {
                            id: "x",
                            name: "?",
                            handle: "",
                            role: "client",
                            bio: "",
                            hue: 210,
                          }),
                        photo: pe.photo,
                      }}
                      s={120}
                    />
                  </span>
                  <span
                    className="absolute bottom-1 right-1 grid h-9 w-9 place-items-center rounded-full"
                    style={{ background: "var(--pr)", color: "var(--pt)" }}
                  >
                    <Camera size={18} />
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      pickPhoto(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
                <p className="cm-m text-sm">
                  Toque na foto para trocar. Aceita fotos de qualquer tamanho.
                </p>
              </div>
              <div>
                <p className="mb-2 font-bold">Você é</p>
                <div
                  className="grid grid-cols-2 gap-3"
                  role="radiogroup"
                  aria-label="Tipo de conta"
                >
                  {(
                    [
                      ["client", "Cliente", "Quero um site ou contratar", Briefcase],
                      ["dev", "Programador(a)", "Crio sites e sistemas", Code2],
                    ] as const
                  ).map(([r, l, d, I]) => (
                    <button
                      key={r}
                      role="radio"
                      aria-checked={pe.role === r}
                      onClick={() => setPe((x) => ({ ...x, role: r }))}
                      className="cm-card flex flex-col items-center gap-1 p-4 text-center transition active:scale-95"
                      style={
                        pe.role === r
                          ? {
                              borderColor: "var(--pr)",
                              background: "var(--sf)",
                              boxShadow: "0 0 0 2px var(--pr)",
                            }
                          : undefined
                      }
                    >
                      <I size={26} className={pe.role === r ? "cm-p" : "cm-m"} />
                      <span className="font-bold">{l}</span>
                      <span className="cm-m text-xs">{d}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="cm-bio" className="mb-2 block font-bold">
                  Biografia
                </label>
                <textarea
                  id="cm-bio"
                  value={pe.bio}
                  onChange={(e) => setPe((x) => ({ ...x, bio: e.target.value }))}
                  maxLength={160}
                  rows={3}
                  placeholder="Conte em poucas palavras o que você faz ou procura"
                  className="cm-fld resize-none"
                />
                <p className="cm-m mt-1 text-right text-xs font-semibold">{pe.bio.length}/160</p>
              </div>
              <button onClick={saveProfile} className="cm-btn w-full !min-h-12 !text-base">
                Salvar perfil
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed inset-x-3 bottom-6 z-[10000] mx-auto w-fit max-w-[calc(100vw-1.5rem)] rounded-xl px-5 py-3 text-center font-semibold shadow-xl transition-all duration-300 ${toast ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
        style={{ background: "var(--nv)", color: "#fff" }}
      >
        {toast}
      </div>
    </div>
  );
}
