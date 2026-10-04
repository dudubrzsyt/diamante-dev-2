import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Camera, Check, Code2, Gem, MapPin, Globe, X } from "lucide-react";

/* Ponte entre /perfil e /comunidade: o perfil é a única fonte de dados. */
export const PROFILE_KEY = "nova-bill-profile"; // nome e foto (já existe no seu perfil)
export const PUBLIC_KEY = "nova-bill-public"; // bio, @, tipo, cidade, habilidades, capa
export const COMMUNITY_KEY = "diamante-community-v2";

export type Role = "dev" | "client";
export type Pub = { handle: string; role: Role; bio: string; city: string; site: string; skills: string[]; cover: number };
export const EMPTY_PUB: Pub = { handle: "", role: "client", bio: "", city: "", site: "", skills: [], cover: 215 };

export const LEVELS = [{ n: "Bruto", min: 0 }, { n: "Lapidado", min: 12 }, { n: "Brilhante", min: 35 }, { n: "Diamante", min: 90 }];
export const lv = (p: number) => { let i = 0; LEVELS.forEach((l, k) => { if (p >= l.min) i = k; }); return { cur: LEVELS[i], next: LEVELS[i + 1] }; };
export const slug = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9._]/g, "").slice(0, 20);
export const hueOf = (s: string) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;

export function readPub(): Pub {
  try { return { ...EMPTY_PUB, ...JSON.parse(localStorage.getItem(PUBLIC_KEY) || "{}") }; } catch { return EMPTY_PUB; }
}
export function readAccount(): { name: string; photo: string } | null {
  try { const p = JSON.parse(localStorage.getItem(PROFILE_KEY) || "null"); return p?.name ? { name: p.name, photo: p.photo || "" } : null; } catch { return null; }
}

type PostLike = { by: string; up: string[]; cmts: { by: string }[]; media?: unknown };
export type Stats = { posts: number; likes: number; replies: number; media: number; pts: number };
export const statsFor = (posts: PostLike[], id: string): Stats => {
  const mine = posts.filter((p) => p.by === id);
  const likes = mine.reduce((s, p) => s + p.up.length, 0);
  return { posts: mine.length, likes, replies: mine.reduce((s, p) => s + p.cmts.filter((c) => c.by !== id).length, 0), media: mine.filter((p) => p.media).length, pts: mine.length * 3 + likes * 2 };
};
export const BADGES: { id: string; e: string; n: string; d: string; ok: (s: Stats) => boolean }[] = [
  { id: "first", e: "✨", n: "Primeiro brilho", d: "Publicou o primeiro post", ok: (s) => s.posts >= 1 },
  { id: "like", e: "❤️", n: "Queridinho", d: "Recebeu 5 curtidas", ok: (s) => s.likes >= 5 },
  { id: "talk", e: "💬", n: "Papo bom", d: "Recebeu 5 respostas", ok: (s) => s.replies >= 5 },
  { id: "media", e: "🎬", n: "Mostra tudo", d: "Postou foto, vídeo ou áudio", ok: (s) => s.media >= 1 },
  { id: "gem", e: "💎", n: "Diamante", d: "Chegou a 90 pontos", ok: (s) => s.pts >= 90 },
];

const CARD = "rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 shadow-xl shadow-black/20";
const INP = "w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20";
const LAB = "mb-2 block text-xs font-black uppercase tracking-widest text-slate-300";
const COVERS = [215, 45, 270, 150, 340, 185];
export const coverBg = (h: number) => `linear-gradient(120deg,hsl(${h} 85% 46%),hsl(${(h + 60) % 360} 80% 22%))`;

export function PublicProfileTab({ name, photo, onPhoto }: { name: string; photo: string; onPhoto: (src: string) => void }) {
  const [p, setP] = useState<Pub>(EMPTY_PUB);
  const [skill, setSkill] = useState("");
  const [saved, setSaved] = useState(false);
  const [st, setSt] = useState<Stats>({ posts: 0, likes: 0, replies: 0, media: 0, pts: 0 });

  useEffect(() => {
    const s = readPub();
    setP({ ...s, handle: s.handle || slug(name) });
    try { setSt(statsFor(JSON.parse(localStorage.getItem(COMMUNITY_KEY) || "{}").posts || [], "me")); } catch {}
  }, [name]);

  /* salva na hora: a comunidade lê esses dados automaticamente */
  const set = (patch: Partial<Pub>) => {
    const n = { ...p, ...patch };
    setP(n);
    try { localStorage.setItem(PUBLIC_KEY, JSON.stringify(n)); setSaved(true); setTimeout(() => setSaved(false), 1600); } catch {}
  };
  const addSkill = () => {
    const s = skill.trim().slice(0, 20);
    if (s && p.skills.length < 6 && !p.skills.includes(s)) set({ skills: [...p.skills, s] });
    setSkill("");
  };
  function pick(f?: File) {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const i = new Image();
      i.onload = () => {
        const k = Math.min(1, 320 / Math.max(i.width, i.height)), c = document.createElement("canvas");
        c.width = i.width * k; c.height = i.height * k;
        c.getContext("2d")!.drawImage(i, 0, 0, c.width, c.height);
        const src = c.toDataURL("image/jpeg", 0.85);
        try { localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}"), photo: src })); } catch {}
        onPhoto(src); setSaved(true); setTimeout(() => setSaved(false), 1600);
      };
      i.src = String(r.result);
    };
    r.readAsDataURL(f);
  }

  const checks = [["Foto de perfil", !!photo], ["Nome de usuário", p.handle.length >= 3], ["Bio com 20+ letras", p.bio.trim().length >= 20], ["Cidade", !!p.city], ["Uma habilidade", p.skills.length > 0], ["Site ou rede social", !!p.site]] as const;
  const pct = Math.round((checks.filter((c) => c[1]).length / checks.length) * 100);
  const L = lv(st.pts), bar = L.next ? Math.min(100, ((st.pts - L.cur.min) / (L.next.min - L.cur.min)) * 100) : 100;
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* formulário */}
        <div className={`${CARD} space-y-6 p-6`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-white">Perfil público</h3>
              <p className="text-sm font-medium text-slate-400">É assim que as pessoas veem você na comunidade. Tudo é salvo sozinho.</p>
            </div>
            <span className={`inline-flex shrink-0 items-center gap-1 rounded-full bg-green-500/20 px-3 py-1 text-xs font-bold text-green-400 transition-opacity ${saved ? "opacity-100" : "opacity-0"}`}><Check size={13} /> Salvo</span>
          </div>

          <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-slate-600 bg-slate-900/50 p-4 transition hover:border-brand-yellow/60 focus-within:ring-2 focus-within:ring-brand-yellow/40">
            <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-slate-800 text-slate-400">{photo ? <img src={photo} alt="Sua foto" className="h-full w-full object-cover" /> : <Camera size={22} />}</span>
            <span><span className="block font-black text-white">{photo ? "Trocar foto de perfil" : "Adicionar foto de perfil"}</span><span className="text-xs font-medium text-slate-500">Ela aparece na hora em todos os seus posts da comunidade.</span></span>
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <div><label className={LAB} htmlFor="pp-handle">Nome de usuário</label><input id="pp-handle" value={p.handle} onChange={(e) => set({ handle: slug(e.target.value) })} placeholder="seu.usuario" className={INP} /></div>
            <div><label className={LAB} htmlFor="pp-city">Cidade</label><input id="pp-city" value={p.city} maxLength={40} onChange={(e) => set({ city: e.target.value })} placeholder="São Paulo, SP" className={INP} /></div>
          </div>

          <div>
            <span className={LAB}>Eu sou</span>
            <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Eu sou">
              {([["client", "Cliente", "Quero um site ou já tenho um", Gem], ["dev", "Programador(a)", "Crio sites e sistemas", Code2]] as const).map(([r, l, d, I]) => (
                <button key={r} type="button" role="radio" aria-checked={p.role === r} onClick={() => set({ role: r })} className={`rounded-xl border p-4 text-left transition ${p.role === r ? "border-brand-yellow bg-brand-yellow/10" : "border-slate-700 bg-slate-800/60 hover:border-slate-500"}`}>
                  <I size={18} className={p.role === r ? "text-brand-yellow" : "text-slate-400"} /><p className="mt-2 font-black text-white">{l}</p><p className="text-xs font-medium text-slate-400">{d}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={LAB} htmlFor="pp-bio">Biografia <span className="font-bold normal-case tracking-normal text-slate-500">({p.bio.length}/200)</span></label>
            <textarea id="pp-bio" rows={3} maxLength={200} value={p.bio} onChange={(e) => set({ bio: e.target.value })} placeholder="Quem é você, o que faz e o que procura na comunidade." className={`${INP} resize-none`} />
          </div>

          <div>
            <label className={LAB} htmlFor="pp-skill">Habilidades e interesses <span className="font-bold normal-case tracking-normal text-slate-500">(até 6)</span></label>
            <div className="flex gap-2">
              <input id="pp-skill" value={skill} onChange={(e) => setSkill(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} placeholder="React, SEO, Restaurante…" className={INP} />
              <button type="button" onClick={addSkill} className="shrink-0 rounded-lg border border-brand-yellow/50 bg-brand-yellow/10 px-4 font-black text-brand-yellow hover:bg-brand-yellow/20">Adicionar</button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {p.skills.map((s) => <span key={s} className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-200">{s}<button type="button" onClick={() => set({ skills: p.skills.filter((x) => x !== s) })} aria-label={`Remover ${s}`} className="text-slate-500 hover:text-red-400"><X size={12} /></button></span>)}
            </div>
          </div>

          <div><label className={LAB} htmlFor="pp-site">Site ou rede social</label><input id="pp-site" value={p.site} maxLength={80} onChange={(e) => set({ site: e.target.value })} placeholder="meusite.com.br" className={INP} /></div>

          <div>
            <span className={LAB}>Cor da capa</span>
            <div className="flex gap-3">{COVERS.map((h) => <button key={h} type="button" onClick={() => set({ cover: h })} aria-label={`Capa ${h}`} aria-pressed={p.cover === h} style={{ background: coverBg(h) }} className={`h-10 w-10 rounded-xl ring-offset-2 ring-offset-slate-900 transition ${p.cover === h ? "ring-2 ring-white" : "opacity-70 hover:opacity-100"}`} />)}</div>
          </div>
        </div>

        {/* pré-visualização + completude */}
        <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className={`${CARD} overflow-hidden`}>
            <div className="h-24" style={{ background: coverBg(p.cover) }} />
            <div className="px-5 pb-5">
              <span className={`-mt-9 grid h-[72px] w-[72px] place-items-center overflow-hidden rounded-xl text-xl font-black text-white ring-2 ${p.role === "dev" ? "ring-sky-400/70" : "ring-brand-yellow/80"}`} style={{ background: photo ? undefined : coverBg(p.cover) }}>
                {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : initials}
              </span>
              <p className="mt-3 text-lg font-black text-white">{name}</p>
              <p className="text-xs font-semibold text-slate-500">@{p.handle || "usuario"}</p>
              <p className="mt-3 text-sm font-medium text-slate-300">{p.bio || "Sua bio aparece aqui."}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">{p.skills.map((s) => <span key={s} className="rounded-full bg-brand-yellow/15 px-2.5 py-0.5 text-[11px] font-bold text-brand-yellow">{s}</span>)}</div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-slate-500">
                {p.city && <span className="inline-flex items-center gap-1"><MapPin size={12} />{p.city}</span>}
                {p.site && <span className="inline-flex items-center gap-1"><Globe size={12} />{p.site}</span>}
              </div>
            </div>
          </div>
          <div className={`${CARD} p-5`}>
            <div className="flex items-end justify-between"><p className="font-black text-white">Perfil {pct}% completo</p><p className="text-xs font-bold text-slate-500">perfis completos aparecem mais</p></div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-700"><div className="h-full rounded-full bg-brand-yellow transition-all duration-500" style={{ width: `${pct}%` }} /></div>
            <ul className="mt-4 space-y-1.5 text-sm font-semibold">{checks.map(([l, ok]) => <li key={l} className={`flex items-center gap-2 ${ok ? "text-green-400" : "text-slate-500"}`}><Check size={14} />{l}</li>)}</ul>
          </div>
        </div>
      </div>

      {/* atividade e conquistas */}
      <div className={`${CARD} p-6`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h3 className="text-lg font-black text-white">Sua lapidação</h3><p className="text-sm font-medium text-slate-400">Postar, receber curtidas e respostas faz o seu perfil brilhar.</p></div>
          <Link to="/comunidade" className="btn-hero btn-hero-hover !px-5 !py-2.5 text-sm">Abrir comunidade</Link>
        </div>
        <div className="mt-5">
          <div className="flex items-end justify-between text-sm font-black text-white"><span className="flex items-center gap-2"><Gem size={16} className="text-brand-yellow" />{L.cur.n}</span><span className="text-xs font-bold text-slate-400">{st.pts} pts{L.next ? ` · faltam ${L.next.min - st.pts} para ${L.next.n}` : ""}</span></div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-700"><div className="h-full rounded-full bg-brand-yellow transition-all duration-700" style={{ width: `${Math.max(5, bar)}%` }} /></div>
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[["Posts", st.posts], ["Curtidas", st.likes], ["Respostas", st.replies], ["Com mídia", st.media]].map(([l, n]) => <div key={l} className="rounded-xl bg-slate-900/70 py-3 text-center"><dd className="text-2xl font-black text-white">{n}</dd><dt className="text-xs font-bold text-slate-500">{l}</dt></div>)}
        </dl>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {BADGES.map((b) => { const ok = b.ok(st); return (
            <li key={b.id} className={`rounded-xl border p-4 text-center ${ok ? "border-brand-yellow/50 bg-brand-yellow/10" : "border-slate-700 bg-slate-800/40 opacity-60"}`}>
              <p className={`text-2xl ${ok ? "" : "grayscale"}`} aria-hidden>{b.e}</p><p className="mt-1 text-sm font-black text-white">{b.n}</p><p className="mt-0.5 text-xs font-medium text-slate-400">{ok ? b.d : `Falta: ${b.d.toLowerCase()}`}</p>
            </li>); })}
        </ul>
      </div>
    </div>
  );
}