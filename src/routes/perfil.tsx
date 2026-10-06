import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, Camera, Check, CheckCircle, Clock, Copy, Download, Eye, EyeOff, Globe, KeyRound, Loader, Lock, LogOut, Mail, Phone, ShieldCheck, Smartphone, Trash2, User, X, Zap, type LucideIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent as ReactKey, type ReactNode } from "react";
import { PageShell } from "@/components/PageShell";
import { recordAnalyticsEvent } from "@/components/AnalyticsTracker";
import { absoluteUrl } from "@/lib/seo";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Meu perfil — Diamante Dev" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { name: "referrer", content: "no-referrer" },
      { name: "description", content: "Gerencie sua conta e preferências de segurança." },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/perfil") }],
  }),
  component: Perfil,
});

/* ================= Tipos ================= */
type Tab = "overview" | "security" | "preferences" | "sessions";
type Notify = (t: "ok" | "err", m: string) => void;
interface Login { at: string; device: string }
interface Account { id: string; name: string; email: string; phone: string; photo: string; createdAt: string; pwChangedAt: string; salt: string; hash: string; totp?: string; logins: Login[] }
interface Prefs { newsletter: boolean; newsUpdates: boolean; promotions: boolean; weeklyReports: boolean; orderConfirmation: boolean }
interface TabProps { a: Account; commit: (n: Account) => void; notify: Notify }

/* ================= Cofre (encapsulado): storage, criptografia, bloqueio ================= */
const K = { vault: "nb2-vault", sess: "nb2-session", lock: "nb2-lock", prefs: "nb2-prefs-" };
const ITER = 310_000;
const IDLE = 15 * 60_000;
const DEF: Prefs = { newsletter: true, newsUpdates: true, promotions: true, weeklyReports: false, orderConfirmation: true };
const NAME = /^[\p{L}][\p{L}\p{M} '.-]{1,59}$/u;
const EMAIL = /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/;
const COMMON = ["12345678", "123456789", "password", "senha123", "qwerty", "abc123", "iloveyou", "admin123"];
const enc = new TextEncoder();
const uid = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), (x) => x.toString(16).padStart(2, "0")).join("");
const secureOk = () => typeof crypto !== "undefined" && !!crypto.subtle;
const syncPhoto = (photo: string) => window.dispatchEvent(new CustomEvent("nova-bill-profile-updated", { detail: { photo } }));
const b64 = (u: Uint8Array) => btoa(String.fromCharCode(...u));
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—");
const days = (iso: string) => Math.floor((Date.now() - new Date(iso).getTime()) / 864e5);
const clean = (s: string, max: number) => s.replace(/[\u0000-\u001F\u007F<>]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
const normEmail = (s: string) => s.trim().toLowerCase().slice(0, 120);
const maskPhone = (s: string) => {
  const d = s.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  return d.length <= 10 ? `(${d.slice(0, 2)}) ${d.slice(2, 6)}${d.length > 6 ? "-" + d.slice(6) : ""}` : `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};
const device = () => {
  const u = navigator.userAgent;
  const b = /Edg\//.test(u) ? "Edge" : /Chrome\//.test(u) ? "Chrome" : /Firefox\//.test(u) ? "Firefox" : /Safari\//.test(u) ? "Safari" : "Navegador";
  const o = /Windows/.test(u) ? "Windows" : /Android/.test(u) ? "Android" : /iPhone|iPad/.test(u) ? "iOS" : /Mac/.test(u) ? "macOS" : /Linux/.test(u) ? "Linux" : "outro sistema";
  return `${b} no ${o}`;
};

const store = {
  read<T>(area: Storage, key: string, fb: T): T {
    try { const v = area.getItem(key); return v ? (JSON.parse(v) as T) : fb; } catch { return fb; }
  },
  write(area: Storage, key: string, v: unknown) {
    try { area.setItem(key, JSON.stringify(v)); return true; } catch { return false; }
  },
};
const db = {
  all: () => store.read<Account[]>(localStorage, K.vault, []).filter((x) => x && typeof x.email === "string" && typeof x.hash === "string" && Array.isArray(x.logins)),
  save: (l: Account[]) => store.write(localStorage, K.vault, l),
};

async function derive(pw: string, salt: Uint8Array) {
  const key = await crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: ITER }, key, 256));
}
const safeEq = (a: Uint8Array, b: Uint8Array) => {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a[i] ^ b[i];
  return d === 0;
};
async function hashPw(pw: string) {
  const s = crypto.getRandomValues(new Uint8Array(16));
  return { salt: b64(s), hash: b64(await derive(pw, s)) };
}
const checkPw = async (a: Account, pw: string) => safeEq(await derive(pw, unb64(a.salt)), unb64(a.hash));

/* TOTP (RFC 6238) — compatível com Google Authenticator, Microsoft Authenticator, Authy */
const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function newSecret() {
  let bits = "", s = "";
  crypto.getRandomValues(new Uint8Array(20)).forEach((x) => (bits += x.toString(2).padStart(8, "0")));
  for (let i = 0; i < 160; i += 5) s += B32[parseInt(bits.slice(i, i + 5), 2)];
  return s;
}
function fromB32(s: string) {
  let bits = "";
  for (const c of s) bits += B32.indexOf(c).toString(2).padStart(5, "0");
  const out = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < out.length; i++) out[i] = parseInt(bits.slice(i * 8, i * 8 + 8), 2);
  return out;
}
async function totp(secret: string, step: number) {
  const key = await crypto.subtle.importKey("raw", fromB32(secret), { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const msg = new Uint8Array(8);
  new DataView(msg.buffer).setUint32(4, step);
  const h = new Uint8Array(await crypto.subtle.sign("HMAC", key, msg));
  const o = h[19] & 15;
  return String((((h[o] & 127) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3]) % 1_000_000).padStart(6, "0");
}
async function verifyTotp(secret: string, code: string) {
  if (!/^\d{6}$/.test(code)) return false;
  const t = Math.floor(Date.now() / 30000);
  for (const d of [-1, 0, 1]) if ((await totp(secret, t + d)) === code) return true;
  return false;
}

/* Bloqueio progressivo contra força bruta */
type Locks = Record<string, { n: number; until: number }>;
const lock = {
  get: (e: string) => store.read<Locks>(localStorage, K.lock, {})[e] ?? { n: 0, until: 0 },
  fail(e: string) {
    const m = store.read<Locks>(localStorage, K.lock, {});
    const n = (m[e]?.n ?? 0) + 1;
    m[e] = { n, until: n >= 5 ? Date.now() + Math.min(900, 30 * 2 ** (n - 5)) * 1000 : 0 };
    store.write(localStorage, K.lock, m);
  },
  clear(e: string) {
    const m = store.read<Locks>(localStorage, K.lock, {});
    delete m[e];
    store.write(localStorage, K.lock, m);
  },
  wait(e: string) {
    const s = Math.ceil((lock.get(e).until - Date.now()) / 1000);
    if (s > 0) throw new Error(`Muitas tentativas. Aguarde ${s}s e tente novamente.`);
  },
};

const auth = {
  async register(d: { name: string; email: string; phone: string; password: string }) {
    const list = db.all();
    if (list.some((x) => x.email === d.email)) throw new Error("Este e-mail já tem conta. Use a aba Entrar.");
    const now = new Date().toISOString();
    const a: Account = { id: uid(), name: d.name, email: d.email, phone: d.phone, photo: "", createdAt: now, pwChangedAt: now, ...(await hashPw(d.password)), logins: [] };
    if (!db.save([...list, a])) throw new Error("Armazenamento do navegador indisponível.");
    return a;
  },
  async login(raw: string, pw: string) {
    const email = normEmail(raw);
    lock.wait(email);
    const a = db.all().find((x) => x.email === email);
    const ok = a ? await checkPw(a, pw) : (await derive(pw, new Uint8Array(16)), false);
    if (!a || !ok) { lock.fail(email); throw new Error("E-mail ou senha incorretos."); }
    return a;
  },
};

function strength(pw: string, hints: string[] = []) {
  const checks = [pw.length >= 10, /[A-Z]/.test(pw), /[a-z]/.test(pw), /\d/.test(pw), /[^A-Za-z0-9]/.test(pw)];
  const low = pw.toLowerCase();
  const bad = COMMON.some((x) => low.includes(x)) || /(.)\1{3,}/.test(pw) || hints.some((h) => h.length > 2 && low.includes(h.toLowerCase()));
  const score = bad ? Math.min(checks.filter(Boolean).length, 1) : checks.filter(Boolean).length;
  return { score, checks, bad, ok: !bad && checks[0] && checks.slice(1).filter(Boolean).length >= 3 };
}
const LV: [string, string][] = [["Muito fraca", "#dc2626"], ["Fraca", "#ea580c"], ["Razoável", "#d97706"], ["Boa", "#65a30d"], ["Forte", "#16a34a"], ["Excelente", "#0972d3"]];

async function toAvatar(file: File) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 3_000_000) throw new Error("Use JPG, PNG ou WebP de até 3 MB.");
  const bmp = await createImageBitmap(file).catch(() => { throw new Error("Imagem inválida."); });
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const m = Math.min(bmp.width, bmp.height);
  c.getContext("2d")!.drawImage(bmp, (bmp.width - m) / 2, (bmp.height - m) / 2, m, m, 0, 0, 256, 256);
  return c.toDataURL("image/jpeg", 0.85); // reencodar remove metadados e conteúdo embutido
}

/* ================= Estilos (escopo .pf) ================= */
const CSS = `
@property --a{syntax:"<angle>";inherits:false;initial-value:0deg}
.pf{--bg:#f3f6fb;--card:#fff;--ink:#161d26;--mut:#4b5a6b;--line:#d5dbdb;--blue:#0972d3;--tint:#e6f2fc;--ok:#16a34a;--bad:#dc2626;font-family:"Amazon Ember","Helvetica Neue",Roboto,Arial,sans-serif;color:var(--ink);background:var(--bg);-webkit-font-smoothing:antialiased;overflow-x:clip;padding:clamp(20px,4vw,48px) 0 calc(110px + env(safe-area-inset-bottom,0px));transition:background .4s,color .4s}
:is(.dark,[data-theme=dark],[data-mode=dark]) .pf{--bg:#04060b;--card:#0b111c;--ink:#f3f6fb;--mut:#a9b6c9;--line:#1f2b3d;--blue:#62adff;--tint:#10243d}
.pf *{box-sizing:border-box}
.pf h2,.pf h3,.pf p,.pf ul{margin:0}.pf ul{padding:0;list-style:none}
.pf small{display:block;color:var(--mut);font-size:.84rem;line-height:1.45}
.pf-w{max-width:1120px;margin:0 auto;padding:0 clamp(16px,4vw,40px)}
.pf-in{animation:pfin .6s cubic-bezier(.2,.8,.2,1) both}
@keyframes pfin{from{opacity:0;transform:translateY(22px) scale(.98);filter:blur(6px)}}
.pf-card{position:relative;background:var(--card);border:1px solid var(--line);border-radius:20px;padding:clamp(20px,3vw,34px);box-shadow:0 24px 60px -38px rgba(9,30,66,.55);transition:transform .3s,box-shadow .3s,border-color .3s}
.pf-card.hv:hover{transform:translateY(-4px);border-color:var(--blue);box-shadow:0 28px 60px -26px rgba(76,125,255,.55)}
.pf-glow::before{content:"";position:absolute;inset:-2px;border-radius:inherit;padding:2px;pointer-events:none;background:conic-gradient(from var(--a),#3f73e0,#a855f7,#22d3ee,#f472b6,#3f73e0);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;animation:pfa 4s linear infinite;opacity:.7}
@keyframes pfa{to{--a:360deg}}
.pf-hero{position:relative;overflow:hidden;isolation:isolate;border-radius:22px;padding:clamp(24px,4vw,44px);color:#fff;background:linear-gradient(125deg,#143d99,#3f73e0 45%,#7c6fe8);background-size:220% 220%;animation:pfin .6s both,pfg 16s ease-in-out infinite}
@keyframes pfg{50%{background-position:100% 100%}}
.pf-hero>i{position:absolute;z-index:-1;border-radius:50%;filter:blur(70px);opacity:.55;pointer-events:none}
.pf-b1{width:320px;height:320px;left:-80px;top:-120px;background:#22d3ee;animation:pfm 11s ease-in-out infinite alternate}
.pf-b2{width:280px;height:280px;right:-60px;bottom:-110px;background:#f472b6;animation:pfm 13s ease-in-out infinite alternate-reverse}
@keyframes pfm{to{transform:translate(60px,40px) scale(1.25)}}
.pf-h{font-size:clamp(1.7rem,3.4vw,2.6rem);font-weight:500;line-height:1.12;letter-spacing:-.02em;margin:10px 0 24px}
.pf-hero small{color:rgba(255,255,255,.85)}
.pf-eb{font-weight:700;opacity:.9}
.pf-auth{display:grid;gap:14px;width:min(100%,560px);margin:0 auto}
.pf-trust{display:flex;flex-wrap:wrap;align-items:center;gap:6px 14px;padding:12px 18px;border-radius:16px;color:#fff;font-size:.8rem;font-weight:600;background:linear-gradient(120deg,#143d99,#3f73e0 55%,#7c6fe8);background-size:200% 200%;animation:pfin .6s .15s both,pfg 14s ease-in-out infinite}
.pf-trust-t{display:flex;align-items:center;gap:7px;font-weight:700;font-size:.9rem}
.pf-trust ul{display:flex;flex-wrap:wrap;gap:4px 12px}.pf-trust li{display:flex;align-items:center;gap:4px;opacity:.92}
.pf-seg{display:grid;grid-template-columns:1fr 1fr;gap:4px;padding:4px;margin-bottom:26px;border-radius:99px;background:var(--tint)}
.pf-seg button{padding:11px;border-radius:99px;font-weight:600;color:var(--mut);transition:background .25s,color .25s}
.pf-seg button[aria-selected=true]{background:var(--card);color:var(--ink);box-shadow:0 4px 14px -6px rgba(0,0,0,.4)}
.pf-form{display:grid;gap:18px}.pf-form h3{font-size:1.5rem;font-weight:500}
.pf-form>*{animation:pfin .5s cubic-bezier(.2,.8,.2,1) both}
.pf-form>:nth-child(2){animation-delay:.05s}.pf-form>:nth-child(3){animation-delay:.1s}.pf-form>:nth-child(4){animation-delay:.15s}.pf-form>:nth-child(5){animation-delay:.2s}.pf-form>:nth-child(6){animation-delay:.25s}.pf-form>:nth-child(n+7){animation-delay:.3s}
.pf-f{display:grid;gap:8px}
.pf-lb{display:flex;align-items:center;gap:8px;font-size:.9rem;font-weight:600;color:var(--mut)}
.pf-input{width:100%;padding:13px 16px;border-radius:12px;border:1px solid var(--line);background:var(--bg);color:var(--ink);font:inherit;font-size:1rem;transition:border-color .2s,box-shadow .2s}
.pf-input:focus{outline:none;border-color:var(--blue);box-shadow:0 0 0 4px color-mix(in srgb,var(--blue) 22%,transparent)}
.pf-input[readonly]{opacity:.7;cursor:not-allowed}
.pf-code{text-align:center;font-size:1.8rem;letter-spacing:.5em;padding-left:.5em}
.pf-pw{position:relative}.pf-pw .pf-input{padding-right:48px}
.pf-pw button{position:absolute;right:6px;top:50%;transform:translateY(-50%);display:grid;place-items:center;width:38px;height:38px;border-radius:10px;color:var(--mut)}
.pf-pw button:hover{background:var(--tint);color:var(--ink)}
.pf-meter{display:grid;gap:8px}.pf-bars{display:flex;gap:5px}.pf-bars span{flex:1;height:6px;border-radius:9px;background:var(--line);transition:background .3s}
.pf-rules{display:flex;flex-wrap:wrap;gap:6px 14px}.pf-rules li{display:flex;align-items:center;gap:5px;font-size:.78rem;color:var(--mut)}.pf-rules li.ok{color:var(--ok)}
.pf-alert{display:flex;gap:10px;align-items:flex-start;padding:12px 14px;border-radius:12px;border:1px solid color-mix(in srgb,var(--bad) 45%,transparent);background:color-mix(in srgb,var(--bad) 10%,transparent);color:var(--bad);font-weight:600;font-size:.92rem;animation:pfin .3s both}
.pf-alert svg{flex:none;margin-top:2px}
.pf-chk{display:flex;gap:12px;align-items:flex-start;color:var(--mut);font-size:.92rem;cursor:pointer}.pf-chk input{margin-top:3px;width:18px;height:18px;accent-color:var(--blue)}
.pf-btn,.pf-btn-o,.pf-btn-w,.pf-btn-d{position:relative;isolation:isolate;display:inline-flex;align-items:center;justify-content:center;gap:10px;border-radius:99px;font-weight:700;font-size:1rem;padding:14px 28px;cursor:pointer;transition:transform .25s,background .25s,color .25s,opacity .25s}
.pf-btn{background:var(--ink);color:var(--bg)}
.pf-btn-o{box-shadow:inset 0 0 0 2px var(--ink);color:var(--ink)}.pf-btn-o:hover{background:var(--ink);color:var(--bg)}
.pf-btn-w{background:#fff;color:#161d26}
.pf-btn-d{background:var(--bad);color:#fff}
.pf-btn::before,.pf-btn-w::before{content:"";position:absolute;inset:-4px;z-index:-1;border-radius:inherit;background:conic-gradient(from var(--a),#3f73e0,#a855f7,#22d3ee,#f472b6,#3f73e0);filter:blur(9px);opacity:.4;transition:opacity .3s;animation:pfa 3s linear infinite}
.pf-btn:hover:not(:disabled),.pf-btn-w:hover,.pf-btn-o:hover,.pf-btn-d:hover:not(:disabled){transform:translateY(-2px) scale(1.02)}
.pf-btn:hover::before,.pf-btn-w:hover::before{opacity:.9}
.pf button:disabled{opacity:.5;cursor:not-allowed}
.pf :is(a,button,input,summary,label):focus-visible{outline:3px solid var(--blue);outline-offset:3px}
.pf-spin{animation:pfs 1s linear infinite}@keyframes pfs{to{transform:rotate(360deg)}}
.pf-head{display:flex;flex-wrap:wrap;align-items:center;gap:clamp(18px,3vw,32px)}
.pf-head>div:nth-child(2){flex:1 1 260px;min-width:0}
.pf-head h2{font-size:clamp(1.6rem,3vw,2.3rem);font-weight:500;letter-spacing:-.02em;overflow-wrap:anywhere}
.pf-head p{display:flex;align-items:center;gap:8px;margin-top:6px;font-weight:500;overflow-wrap:anywhere}
.pf-av{position:relative;display:grid;place-items:center;flex:none;width:112px;height:112px;border-radius:28px;overflow:hidden;cursor:pointer;background:rgba(255,255,255,.15);border:3px solid rgba(255,255,255,.85);transition:transform .3s}
.pf-av:hover{transform:scale(1.05) rotate(-2deg)}.pf-av:focus-within{outline:3px solid #fff;outline-offset:3px}
.pf-av img{width:100%;height:100%;object-fit:cover}
.pf-av span{position:absolute;inset:0;display:grid;place-items:center;background:rgba(10,20,40,.55);opacity:0;transition:opacity .25s}.pf-av:hover span,.pf-av:focus-within span{opacity:1}
.pf-pill{display:inline-flex;align-items:center;gap:6px;margin-top:12px;padding:5px 12px;border-radius:99px;font-size:.82rem;font-weight:700;background:rgba(255,255,255,.2)}
.pf-pill.ok{background:color-mix(in srgb,var(--ok) 18%,transparent);color:var(--ok);margin:0}
.pf-stats{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));margin:20px 0}
.pf-stat{display:flex;gap:14px;align-items:center;padding:18px 20px}.pf-stat b{display:block;font-size:1.15rem;font-weight:600}
.pf-ico{display:grid;place-items:center;flex:none;width:48px;height:48px;border-radius:99px;background:var(--tint);color:var(--blue);transition:transform .35s,background .35s,color .35s}
.pf-card:hover>.pf-ico,.pf-stat:hover .pf-ico{transform:rotate(-10deg) scale(1.1);background:linear-gradient(135deg,#3f73e0,#a855f7);color:#fff}
.pf-tabs{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;margin:28px 0 22px;padding:5px;border-radius:99px;background:var(--card);border:1px solid var(--line)}
.pf-tabs button{display:flex;align-items:center;gap:8px;flex:1 0 auto;justify-content:center;padding:12px 20px;border-radius:99px;font-weight:600;color:var(--mut);white-space:nowrap;transition:background .25s,color .25s}
.pf-tabs button:hover{color:var(--ink)}.pf-tabs button[aria-selected=true]{background:var(--ink);color:var(--bg)}
.pf-grid{display:grid;gap:20px;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr))}
.pf-sw{position:relative;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 18px;border:1px solid var(--line);border-radius:14px;cursor:pointer;transition:background .2s}
.pf-sw:hover{background:var(--tint)}.pf-sw input{position:absolute;opacity:0;pointer-events:none}.pf-sw b{font-weight:600}
.pf-sw i{flex:none;width:46px;height:26px;border-radius:99px;background:#94a3b8;position:relative;transition:background .25s}
.pf-sw i::after{content:"";position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:transform .25s cubic-bezier(.3,1.4,.5,1)}
.pf-sw input:checked+i{background:var(--blue)}.pf-sw input:checked+i::after{transform:translateX(20px)}.pf-sw input:focus-visible+i{outline:3px solid var(--blue);outline-offset:3px}
.pf-meterbar{height:10px;border-radius:99px;background:var(--line);overflow:hidden;margin-top:12px}.pf-meterbar span{display:block;height:100%;border-radius:inherit;transition:width .8s cubic-bezier(.2,.8,.2,1)}
.pf-card h3{font-size:1.2rem;font-weight:600;display:flex;align-items:center;gap:10px;margin-bottom:6px}
.pf-key{display:block;padding:14px;border-radius:12px;background:var(--bg);border:1px dashed var(--line);font:600 1.05rem ui-monospace,Menlo,monospace;letter-spacing:.12em;text-align:center;overflow-wrap:anywhere;user-select:all}
.pf-row{display:flex;gap:12px;flex-wrap:wrap}.pf-row>*{flex:1 1 140px}
.pf-hist li{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:12px 0;border-top:1px solid var(--line)}
.pf-toast{position:fixed;left:50%;bottom:calc(88px + env(safe-area-inset-bottom,0px));z-index:90;transform:translateX(-50%);display:flex;align-items:center;gap:10px;max-width:calc(100vw - 32px);padding:13px 16px;border-radius:14px;background:#161d26;color:#fff;font-weight:600;box-shadow:0 20px 50px -12px rgba(0,0,0,.6);animation:pft .35s cubic-bezier(.2,.9,.3,1.3) both}
.pf-toast.ok svg:first-child{color:#4ade80}.pf-toast.err svg:first-child{color:#f87171}
@keyframes pft{from{opacity:0;transform:translate(-50%,24px) scale(.94)}}
.pf-ov{position:fixed;inset:0;z-index:80;display:grid;place-items:center;padding:16px;background:rgba(4,8,16,.6);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);animation:pfo .25s both}
@keyframes pfo{from{opacity:0}}
.pf-modal{width:min(440px,100%);max-height:calc(100dvh - 32px);overflow:auto}
@media(max-width:560px){.pf-av{width:88px;height:88px;border-radius:22px}.pf-tabs button{padding:11px 14px}.pf-btn,.pf-btn-o,.pf-btn-d,.pf-btn-w{width:100%}.pf-head{flex-direction:column;align-items:flex-start}.pf-head>div:nth-child(2){flex-basis:auto;width:100%}.pf-hist li{flex-direction:column;gap:2px}}
@media(min-width:1280px){.pf-toast{bottom:24px}}
.pf-av::after{content:"";position:absolute;inset:0;border-radius:inherit;border:2px solid #fff;pointer-events:none;animation:pfr 2.6s ease-in-out infinite}
@keyframes pfr{0%,100%{opacity:0}50%{opacity:.55}}
.pf-meterbar span{animation:pfw 1.1s cubic-bezier(.2,.8,.2,1) both}@keyframes pfw{from{width:0}}
.pf-tabs button[aria-selected=true] svg{animation:pfpop .45s cubic-bezier(.3,1.6,.5,1)}@keyframes pfpop{from{transform:scale(.4) rotate(-30deg)}}
@media(prefers-reduced-motion:reduce){.pf *,.pf *::before,.pf *::after{animation:none!important;transition:none!important}}
`;

/* ================= Componentes de UI ================= */
const Blobs = () => (<><i className="pf-b1" /><i className="pf-b2" /></>);
const Alert = ({ children }: { children: ReactNode }) => (<div className="pf-alert" role="alert"><AlertCircle size={18} /><p>{children}</p></div>);
const Field = ({ label, icon: Icon, children }: { label: string; icon: LucideIcon; children: ReactNode }) => (<label className="pf-f"><span className="pf-lb"><Icon size={15} />{label}</span>{children}</label>);
const Spin = ({ t }: { t: string }) => (<><Loader size={18} className="pf-spin" />{t}</>);

function PwInput({ value, onChange, auto }: { value: string; onChange: (v: string) => void; auto: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="pf-pw">
      <input className="pf-input" type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={auto} maxLength={128} placeholder="••••••••••" />
      <button type="button" aria-label={show ? "Ocultar senha" : "Mostrar senha"} onClick={() => setShow(!show)}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
    </div>
  );
}

function Meter({ pw, hints }: { pw: string; hints: string[] }) {
  if (!pw) return null;
  const s = strength(pw, hints);
  const [t, c] = LV[s.score];
  return (
    <div className="pf-meter" aria-live="polite">
      <div className="pf-bars">{[0, 1, 2, 3, 4].map((i) => <span key={i} style={i < s.score ? { background: c } : undefined} />)}</div>
      <small style={{ color: c, fontWeight: 700 }}>{t}{s.bad ? " · evite sequências, senhas comuns e seu nome/e-mail" : ""}</small>
      <ul className="pf-rules">{["10+ caracteres", "Maiúscula", "Minúscula", "Número", "Símbolo"].map((r, i) => <li key={r} className={s.checks[i] ? "ok" : ""}><Check size={12} />{r}</li>)}</ul>
    </div>
  );
}

/* Reautenticação para ações sensíveis */
function Reauth({ a, title, text, cta, danger, onOk, onClose }: { a: Account; title: string; text: string; cta: string; danger?: boolean; onOk: () => void; onClose: () => void }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && close.current();
    addEventListener("keydown", k);
    const o = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { removeEventListener("keydown", k); document.body.style.overflow = o; };
  }, []);
  async function go(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setErr("");
    try {
      lock.wait(a.email);
      if (!(await checkPw(a, pw))) { lock.fail(a.email); throw new Error("Senha incorreta."); }
      onOk();
    } catch (x) { setErr(x instanceof Error ? x.message : "Erro inesperado."); setBusy(false); }
  }
  return (
    <div className="pf-ov" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="pf-card pf-modal pf-form" role="dialog" aria-modal="true" aria-label={title} onSubmit={go}>
        <h3 style={{ fontSize: "1.4rem" }}>{title}</h3>
        <small>{text}</small>
        {err && <Alert>{err}</Alert>}
        <Field label="Confirme sua senha" icon={Lock}><PwInput value={pw} onChange={setPw} auto="current-password" /></Field>
        <div className="pf-row">
          <button type="button" className="pf-btn-o" onClick={onClose}>Cancelar</button>
          <button type="submit" className={danger ? "pf-btn-d" : "pf-btn"} disabled={busy || !pw}>{busy ? <Spin t="Verificando…" /> : cta}</button>
        </div>
      </form>
    </div>
  );
}

/* ================= Login / Cadastro ================= */
function AuthView({ onDone }: { onDone: (a: Account) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [f, setF] = useState({ name: "", email: "", phone: "", pw: "", pw2: "", terms: false });
  const [code, setCode] = useState("");
  const [pend, setPend] = useState<Account | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const up = (p: Partial<typeof f>) => setF((s) => ({ ...s, ...p }));
  const swap = (m: "login" | "register") => { setMode(m); setErr(""); up({ pw: "", pw2: "" }); };

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setErr(""); setBusy(true);
    try {
      if (!secureOk()) throw new Error("O navegador bloqueou a criptografia. Abra o site por HTTPS (https://) para entrar ou criar conta.");
      if (pend) {
        lock.wait(pend.email);
        if (!(await verifyTotp(pend.totp!, code))) { lock.fail(pend.email); throw new Error("Código inválido ou expirado."); }
        return onDone(pend);
      }
      if (mode === "login") {
        const a = await auth.login(f.email, f.pw);
        if (a.totp) { setPend(a); setCode(""); up({ pw: "" }); return; }
        return onDone(a);
      }
      const name = clean(f.name, 60), email = normEmail(f.email), ph = f.phone.replace(/\D/g, "");
      if (!NAME.test(name)) throw new Error("Informe seu nome completo, usando apenas letras.");
      if (!EMAIL.test(email)) throw new Error("Informe um e-mail válido.");
      if (ph && ![10, 11].includes(ph.length)) throw new Error("Informe o telefone com DDD.");
      if (!strength(f.pw, [email.split("@")[0], name.split(" ")[0]]).ok) throw new Error("Senha fraca: use 10+ caracteres misturando 3 tipos (maiúscula, minúscula, número, símbolo) e evite nome, e-mail ou sequências.");
      if (f.pw !== f.pw2) throw new Error("As senhas não coincidem.");
      if (!f.terms) throw new Error("Aceite os termos de uso e a política de privacidade.");
      onDone(await auth.register({ name, email, phone: maskPhone(ph), password: f.pw }));
    } catch (x) { setErr(x instanceof Error ? x.message : "Erro inesperado."); } finally { setBusy(false); }
  }

  const reg = mode === "register";
  const errRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (err) errRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); }, [err]);
  return (
    <div className="pf-auth">
      <div className="pf-card pf-glow pf-in">
        {!pend && (
          <div className="pf-seg" role="tablist" aria-label="Acesso">
            <button type="button" role="tab" aria-selected={!reg} onClick={() => swap("login")}>Entrar</button>
            <button type="button" role="tab" aria-selected={reg} onClick={() => swap("register")}>Criar conta</button>
          </div>
        )}
        <form className="pf-form" onSubmit={submit} noValidate>
          <h3 style={{ fontSize: "1.6rem" }}>{pend ? "Verificação em duas etapas" : reg ? "Crie sua conta" : "Acesse sua conta"}</h3>
          {pend ? (
            <Field label="Código do aplicativo autenticador" icon={KeyRound}>
              <input className="pf-input pf-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} autoFocus value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="000000" />
            </Field>
          ) : (
            <>
              {reg && <Field label="Nome completo" icon={User}><input className="pf-input" value={f.name} onChange={(e) => up({ name: e.target.value })} autoComplete="name" maxLength={60} placeholder="Seu nome" /></Field>}
              <Field label="E-mail" icon={Mail}><input className="pf-input" type="email" inputMode="email" autoCapitalize="none" spellCheck={false} value={f.email} onChange={(e) => up({ email: e.target.value })} autoComplete="username" maxLength={120} placeholder="seu@email.com" /></Field>
              {reg && <Field label="Telefone (opcional)" icon={Phone}><input className="pf-input" type="tel" inputMode="tel" value={f.phone} onChange={(e) => up({ phone: maskPhone(e.target.value) })} autoComplete="tel" placeholder="(11) 99999-9999" /></Field>}
              <Field label="Senha" icon={Lock}><PwInput value={f.pw} onChange={(v) => up({ pw: v })} auto={reg ? "new-password" : "current-password"} /></Field>
              {reg && <Meter pw={f.pw} hints={[f.email.split("@")[0], f.name.split(" ")[0]]} />}
              {reg && <Field label="Confirmar senha" icon={Lock}><PwInput value={f.pw2} onChange={(v) => up({ pw2: v })} auto="new-password" /></Field>}
              {reg && <label className="pf-chk"><input type="checkbox" checked={f.terms} onChange={(e) => up({ terms: e.target.checked })} />Li e aceito os termos de uso e a política de privacidade da Diamante Dev.</label>}
            </>
          )}
          <div ref={errRef}>{err && <Alert>{err}</Alert>}</div>
          <button type="submit" className="pf-btn" disabled={busy}>{busy ? <Spin t="Aguarde…" /> : pend ? "Verificar e entrar" : reg ? "Criar conta" : "Entrar"}</button>
          {pend && <button type="button" className="pf-btn-o" onClick={() => { setPend(null); setErr(""); }}>Voltar</button>}
        </form>
      </div>
      <aside className="pf-trust" aria-label="Segurança da conta">
        <span className="pf-trust-t"><ShieldCheck size={16} />Diamante Dev · conta protegida</span>
        <ul>{["Senha criptografada", "Verificação em 2 etapas", "Anti-invasão", "Sessão com prazo"].map((t) => <li key={t}><Check size={12} strokeWidth={3} />{t}</li>)}</ul>
      </aside>
    </div>
  );
}

/* ================= Abas do painel ================= */
function OverviewTab({ a, commit, notify }: TabProps) {
  const [name, setName] = useState(a.name);
  const [phone, setPhone] = useState(a.phone);
  const [err, setErr] = useState("");
  const dirty = name !== a.name || phone !== a.phone;
  function save(e: FormEvent) {
    e.preventDefault();
    const n = clean(name, 60), p = phone.replace(/\D/g, "");
    if (!NAME.test(n)) return setErr("Informe um nome válido, usando apenas letras.");
    if (p && ![10, 11].includes(p.length)) return setErr("Informe o telefone com DDD.");
    setErr("");
    commit({ ...a, name: n, phone: maskPhone(p) });
    setName(n); setPhone(maskPhone(p));
    recordAnalyticsEvent("profile", "Perfil atualizado");
    notify("ok", "Perfil atualizado.");
  }
  return (
    <form className="pf-card pf-form" onSubmit={save} noValidate>
      <h3>Dados pessoais</h3>
      {err && <Alert>{err}</Alert>}
      <div className="pf-grid">
        <Field label="Nome" icon={User}><input className="pf-input" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoComplete="name" /></Field>
        <Field label="E-mail (não editável)" icon={Mail}><input className="pf-input" value={a.email} readOnly /></Field>
        <Field label="Telefone" icon={Phone}><input className="pf-input" type="tel" value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} autoComplete="tel" placeholder="(11) 99999-9999" /></Field>
      </div>
      <button type="submit" className="pf-btn" disabled={!dirty}><Check size={18} />Salvar alterações</button>
    </form>
  );
}

function SecurityTab({ a, commit, notify }: TabProps) {
  const [cur, setCur] = useState(""); const [nw, setNw] = useState(""); const [cf, setCf] = useState("");
  const [err, setErr] = useState(""); const [err2, setErr2] = useState("");
  const [busy, setBusy] = useState(false);
  const [secret, setSecret] = useState(""); const [code, setCode] = useState(""); const [off, setOff] = useState(false);
  const score = 40 + (a.totp ? 40 : 0) + (days(a.pwChangedAt) < 180 ? 20 : 0);
  const sc = score >= 100 ? "#16a34a" : score >= 80 ? "#0972d3" : "#d97706";
  const uri = `otpauth://totp/${encodeURIComponent("Diamante Dev:" + a.email)}?secret=${secret}&issuer=${encodeURIComponent("Diamante Dev")}`;
  const copy = async (t: string) => { try { await navigator.clipboard.writeText(t); notify("ok", "Copiado."); } catch { notify("err", "Não foi possível copiar."); } };

  async function changePw(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setErr(""); setBusy(true);
    try {
      lock.wait(a.email);
      if (!(await checkPw(a, cur))) { lock.fail(a.email); throw new Error("Senha atual incorreta."); }
      if (nw === cur) throw new Error("A nova senha deve ser diferente da atual.");
      if (!strength(nw, [a.email.split("@")[0], a.name.split(" ")[0]]).ok) throw new Error("Senha fraca: use 10+ caracteres misturando 3 tipos (maiúscula, minúscula, número, símbolo) e evite nome, e-mail ou sequências.");
      if (nw !== cf) throw new Error("As senhas não coincidem.");
      commit({ ...a, ...(await hashPw(nw)), pwChangedAt: new Date().toISOString() });
      setCur(""); setNw(""); setCf("");
      recordAnalyticsEvent("profile", "Senha alterada");
      notify("ok", "Senha alterada com sucesso.");
    } catch (x) { setErr(x instanceof Error ? x.message : "Erro inesperado."); } finally { setBusy(false); }
  }
  async function enable(e: FormEvent) {
    e.preventDefault();
    if (!(await verifyTotp(secret, code))) return setErr2("Código inválido. Confira o horário do aparelho.");
    commit({ ...a, totp: secret });
    setSecret(""); setCode(""); setErr2("");
    recordAnalyticsEvent("profile", "2FA ativado");
    notify("ok", "Verificação em duas etapas ativada.");
  }

  return (
    <div className="pf-grid">
      <div className="pf-card" style={{ gridColumn: "1/-1" }}>
        <h3><ShieldCheck size={20} />Nível de segurança: {score}%</h3>
        <small>Ative a verificação em duas etapas e renove a senha a cada 6 meses para chegar a 100%.</small>
        <div className="pf-meterbar" role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${score}%`, background: sc }} /></div>
      </div>

      <form className="pf-card pf-form" onSubmit={changePw} noValidate>
        <h3><Lock size={20} />Alterar senha</h3>
        {err && <Alert>{err}</Alert>}
        <Field label="Senha atual" icon={Lock}><PwInput value={cur} onChange={setCur} auto="current-password" /></Field>
        <Field label="Nova senha" icon={Lock}><PwInput value={nw} onChange={setNw} auto="new-password" /></Field>
        <Meter pw={nw} hints={[a.email.split("@")[0], a.name.split(" ")[0]]} />
        <Field label="Confirmar nova senha" icon={Lock}><PwInput value={cf} onChange={setCf} auto="new-password" /></Field>
        <button type="submit" className="pf-btn" disabled={busy || !cur || !nw || !cf}>{busy ? <Spin t="Atualizando…" /> : "Atualizar senha"}</button>
        <small>Última alteração: {fmt(a.pwChangedAt)}</small>
      </form>

      <div className="pf-card pf-form" style={{ alignContent: "start" }}>
        <h3><KeyRound size={20} />Verificação em duas etapas</h3>
        <span className={`pf-pill ok`} style={a.totp ? undefined : { background: "color-mix(in srgb,var(--bad) 14%,transparent)", color: "var(--bad)" }}>{a.totp ? "Ativa" : "Inativa"}</span>
        {a.totp ? (
          <>
            <small>Seu login exige um código de 6 dígitos do aplicativo autenticador.</small>
            <button type="button" className="pf-btn-d" onClick={() => setOff(true)}>Desativar</button>
          </>
        ) : !secret ? (
          <>
            <small>Adicione uma segunda camada: mesmo com sua senha, ninguém entra sem o seu celular.</small>
            <button type="button" className="pf-btn" onClick={() => setSecret(newSecret())}>Configurar agora</button>
          </>
        ) : (
          <form className="pf-form" onSubmit={enable} noValidate>
            <small>No aplicativo autenticador, escolha “adicionar conta” → “inserir chave” e digite:</small>
            <code className="pf-key">{secret.match(/.{4}/g)?.join(" ")}</code>
            <button type="button" className="pf-btn-o" onClick={() => copy(uri)}><Copy size={16} />Copiar link do autenticador</button>
            {err2 && <Alert>{err2}</Alert>}
            <input className="pf-input pf-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="000000" aria-label="Código de 6 dígitos" />
            <div className="pf-row">
              <button type="button" className="pf-btn-o" onClick={() => { setSecret(""); setCode(""); setErr2(""); }}>Cancelar</button>
              <button type="submit" className="pf-btn" disabled={code.length !== 6}>Ativar</button>
            </div>
          </form>
        )}
      </div>
      {off && <Reauth a={a} title="Desativar verificação em duas etapas" text="Sua conta ficará protegida apenas pela senha. Confirme sua senha para continuar." cta="Desativar" danger onClose={() => setOff(false)} onOk={() => { commit({ ...a, totp: undefined }); setOff(false); recordAnalyticsEvent("profile", "2FA desativado"); notify("ok", "Verificação em duas etapas desativada."); }} />}
    </div>
  );
}

const ITEMS: [keyof Prefs, string, string][] = [
  ["newsletter", "Newsletter da Diamante Dev", "Novidades, dicas e oportunidades por e-mail."],
  ["newsUpdates", "Novidades e atualizações", "Receba as últimas notícias."],
  ["promotions", "Ofertas e promoções", "Descontos exclusivos."],
  ["weeklyReports", "Relatórios semanais", "Resumo semanal das suas atividades."],
  ["orderConfirmation", "Confirmação de pedidos", "Avisos sobre pedidos importantes."],
];
function PrefsTab({ a, notify }: { a: Account; notify: Notify }) {
  const key = K.prefs + a.id;
  const [saved, setSaved] = useState<Prefs>(() => ({ ...DEF, ...store.read<Partial<Prefs>>(localStorage, key, {}) }));
  const [p, setP] = useState(saved);
  const dirty = JSON.stringify(p) !== JSON.stringify(saved);
  function save() {
    if (!store.write(localStorage, key, p)) return notify("err", "Não foi possível salvar as preferências.");
    setSaved(p);
    recordAnalyticsEvent("profile", "Preferências atualizadas");
    notify("ok", "Preferências salvas.");
  }
  return (
    <div className="pf-card pf-form">
      <h3><Zap size={20} />Notificações por e-mail</h3>
      {ITEMS.map(([k, t, d]) => (
        <label key={k} className="pf-sw"><span><b>{t}</b><small>{d}</small></span><input type="checkbox" checked={p[k]} onChange={(e) => setP({ ...p, [k]: e.target.checked })} /><i /></label>
      ))}
      <button type="button" className="pf-btn" disabled={!dirty} onClick={save}><Check size={18} />Salvar preferências</button>
    </div>
  );
}

function SessionsTab({ a, onLogout }: { a: Account; onLogout: () => void }) {
  return (
    <div className="pf-grid">
      <div className="pf-card pf-form">
        <h3><Smartphone size={20} />Sessão atual</h3>
        <span className="pf-pill ok">Ativa agora</span>
        <p style={{ fontWeight: 600 }}>{device()}</p>
        <small><Globe size={12} style={{ display: "inline", marginRight: 6 }} />Este navegador</small>
        <small><Clock size={12} style={{ display: "inline", marginRight: 6 }} />Encerra sozinha após 15 min sem uso</small>
        <button type="button" className="pf-btn-o" onClick={onLogout}><LogOut size={18} />Encerrar sessão</button>
      </div>
      <div className="pf-card">
        <h3>Histórico de acessos</h3>
        <small>Últimos acessos feitos neste navegador. Não reconhece algum? Troque sua senha.</small>
        <ul className="pf-hist" style={{ marginTop: 12 }}>{a.logins.map((l, i) => <li key={l.at + i}><b style={{ fontWeight: 600 }}>{l.device}</b><small>{fmt(l.at)}</small></li>)}</ul>
      </div>
    </div>
  );
}

/* ================= Painel ================= */
const TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Visão geral", icon: User },
  { id: "security", label: "Segurança", icon: Lock },
  { id: "preferences", label: "Preferências", icon: Zap },
  { id: "sessions", label: "Sessões", icon: Smartphone },
];

function Dashboard({ a, commit, notify, onLogout, onDelete }: TabProps & { onLogout: () => void; onDelete: () => void }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [del, setDel] = useState(false);
  async function photo(f?: File) {
    if (!f) return;
    try { commit({ ...a, photo: await toAvatar(f) }); notify("ok", "Foto atualizada."); } catch (x) { notify("err", x instanceof Error ? x.message : "Imagem inválida."); }
  }
  function onKey(e: ReactKey) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const i = TABS.findIndex((t) => t.id === tab);
    const n = TABS[(i + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length].id;
    setTab(n);
    document.getElementById("pf-t-" + n)?.focus();
  }
  function exportData() {
    const pub: Partial<Account> = { ...a };
    for (const k of ["salt", "hash", "totp", "photo"] as const) delete pub[k];
    const blob = new Blob([JSON.stringify({ ...pub, preferencias: { ...DEF, ...store.read<Partial<Prefs>>(localStorage, K.prefs + a.id, {}) }, exportadoEm: new Date().toISOString() }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const l = document.createElement("a");
    l.href = url; l.download = `dados-conta-${a.id.slice(0, 8)}.json`;
    document.body.appendChild(l); l.click(); l.remove();
    URL.revokeObjectURL(url);
    recordAnalyticsEvent("profile", "Dados exportados");
    notify("ok", "Dados exportados (sem senha nem chaves).");
  }
  const stats: [LucideIcon, string, string][] = [
    [Clock, "Membro desde", new Date(a.createdAt).toLocaleDateString("pt-BR")],
    [Globe, "Acesso atual", fmt(a.logins[0]?.at)],
    [Lock, "Senha alterada há", `${days(a.pwChangedAt)} dia(s)`],
    [ShieldCheck, "Verificação em 2 etapas", a.totp ? "Ativa" : "Inativa"],
  ];
  return (
    <>
      <header className="pf-hero">
        <Blobs />
        <div className="pf-head">
          <label className="pf-av" title="Alterar foto">
            {a.photo ? <img src={a.photo} alt="Sua foto de perfil" /> : <User size={44} />}
            <span><Camera size={26} /></span>
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="Alterar foto de perfil" onChange={(e) => { photo(e.target.files?.[0]); e.target.value = ""; }} />
          </label>
          <div>
            <p className="pf-eb">Conta corporativa</p>
            <h2>{a.name}</h2>
            <p><Mail size={16} />{a.email}</p>
            {a.phone && <p><Phone size={16} />{a.phone}</p>}
            <span className="pf-pill"><ShieldCheck size={14} />{a.totp ? "2FA ativo" : "2FA desativado"}</span>
          </div>
          <button type="button" className="pf-btn-w" onClick={onLogout}><LogOut size={18} />Sair</button>
        </div>
      </header>

      <div className="pf-stats">
        {stats.map(([Icon, l, v], i) => (
          <div key={l} className="pf-card pf-stat pf-in" style={{ animationDelay: `${i * 70}ms` }}>
            <span className="pf-ico"><Icon size={22} /></span><span><small>{l}</small><b>{v}</b></span>
          </div>
        ))}
      </div>

      <div className="pf-tabs" role="tablist" aria-label="Seções da conta" onKeyDown={onKey}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} id={"pf-t-" + id} type="button" role="tab" aria-selected={tab === id} aria-controls="pf-panel" tabIndex={tab === id ? 0 : -1} onClick={() => setTab(id)}><Icon size={17} />{label}</button>
        ))}
      </div>

      <section id="pf-panel" role="tabpanel" aria-labelledby={"pf-t-" + tab} className="pf-in" key={tab}>
        {tab === "overview" && <OverviewTab a={a} commit={commit} notify={notify} />}
        {tab === "security" && <SecurityTab a={a} commit={commit} notify={notify} />}
        {tab === "preferences" && <PrefsTab a={a} notify={notify} />}
        {tab === "sessions" && <SessionsTab a={a} onLogout={onLogout} />}
      </section>

      <div className="pf-card pf-grid" style={{ marginTop: 28 }}>
        <div>
          <h3><Download size={20} />Seus dados</h3>
          <small>Baixe uma cópia dos seus dados pessoais em JSON. Senha e chaves de segurança nunca são incluídas.</small>
          <button type="button" className="pf-btn-o" style={{ marginTop: 16 }} onClick={exportData}><Download size={18} />Exportar dados</button>
        </div>
        <div>
          <h3 style={{ color: "var(--bad)" }}><Trash2 size={20} />Excluir conta</h3>
          <small>Remove permanentemente seu perfil, preferências e histórico deste navegador. Pedimos sua senha para confirmar.</small>
          <button type="button" className="pf-btn-d" style={{ marginTop: 16 }} onClick={() => setDel(true)}><Trash2 size={18} />Excluir conta</button>
        </div>
      </div>
      {del && <Reauth a={a} title="Excluir conta definitivamente" text="Esta ação não pode ser desfeita. Todos os seus dados serão apagados." cta="Excluir definitivamente" danger onClose={() => setDel(false)} onOk={onDelete} />}
    </>
  );
}

/* ================= Página ================= */
function Perfil() {
  const [acct, setAcct] = useState<Account | null>(null);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<{ t: "ok" | "err"; m: string } | null>(null);
  const tm = useRef<number | undefined>(undefined);
  const last = useRef(Date.now());
  const notify: Notify = useCallback((t, m) => {
    setToast({ t, m });
    clearTimeout(tm.current);
    tm.current = window.setTimeout(() => setToast(null), 3800);
  }, []);

  /* Restaura sessão e migra contas antigas (senha em texto puro -> hash) */
  useEffect(() => {
    (async () => {
      try {
        const old = store.read<Partial<Account> | null>(localStorage, "nova-bill-profile", null);
        const sec = store.read<{ password?: string }>(localStorage, "nova-bill-security", {});
        const em = old?.email ? normEmail(old.email) : "";
        if (old && em && sec.password && !db.all().some((x) => x.email === em)) {
          const now = new Date().toISOString();
          db.save([...db.all(), { id: uid(), name: clean(old.name ?? "", 60) || "Cliente", email: em, phone: old.phone ?? "", photo: "", createdAt: old.createdAt ?? now, pwChangedAt: now, ...(await hashPw(sec.password)), logins: [] }]);
        }
        localStorage.removeItem("nova-bill-security"); // remove a senha em texto puro
      } catch { /* ignora */ }
      const s = store.read<{ id: string; last: number } | null>(sessionStorage, K.sess, null);
      if (s && Date.now() - s.last < IDLE) {
        const a = db.all().find((x) => x.id === s.id);
        if (a) { setAcct(a); syncPhoto(a.photo); }
      }
      setReady(true);
    })();
  }, []);

  const logout = useCallback((msg = "Você saiu da conta.") => {
    sessionStorage.removeItem(K.sess);
    setAcct(null);
    syncPhoto("");
    notify("ok", msg);
  }, [notify]);

  /* Expira a sessão por inatividade */
  useEffect(() => {
    if (!acct) return;
    const id = acct.id;
    const mark = () => {
      const n = Date.now();
      if (n - last.current > 15000) store.write(sessionStorage, K.sess, { id, last: n });
      last.current = n;
    };
    last.current = Date.now();
    const evs = ["click", "keydown", "pointerdown", "scroll"] as const;
    evs.forEach((e) => addEventListener(e, mark, { passive: true }));
    const iv = setInterval(() => { if (Date.now() - last.current > IDLE) logout("Sessão encerrada por inatividade."); }, 20000);
    return () => { evs.forEach((e) => removeEventListener(e, mark)); clearInterval(iv); };
  }, [acct?.id, logout]);

  const enter = (a: Account) => {
    lock.clear(a.email);
    const n: Account = { ...a, logins: [{ at: new Date().toISOString(), device: device() }, ...a.logins].slice(0, 8) };
    db.save(db.all().map((x) => (x.id === n.id ? n : x)));
    store.write(sessionStorage, K.sess, { id: n.id, last: Date.now() });
    setAcct(n);
    syncPhoto(n.photo);
    recordAnalyticsEvent("profile", "Login");
    notify("ok", `Bem-vindo, ${n.name.split(" ")[0]}!`);
  };
  const commit = useCallback((n: Account) => {
    if (!db.save(db.all().map((x) => (x.id === n.id ? n : x)))) notify("err", "Não foi possível salvar. Verifique o armazenamento do navegador.");
    setAcct(n);
    syncPhoto(n.photo);
  }, [notify]);
  const remove = () => {
    if (!acct) return;
    db.save(db.all().filter((x) => x.id !== acct.id));
    localStorage.removeItem(K.prefs + acct.id);
    recordAnalyticsEvent("profile", "Conta excluída");
    logout("Conta excluída.");
  };

  return (
    <PageShell
      eyebrow={acct ? "Sua conta" : "Conta"}
      title={acct ? <>Olá, <span className="text-gradient-yellow">{acct.name.split(" ")[0]}</span></> : <>Acesse sua <span className="text-gradient-yellow">conta.</span></>}
      description="Gerencie suas informações pessoais, segurança e preferências."
    >
      <style>{CSS}</style>
      <div className="pf">
        <div className="pf-w">
          {ready && (acct ? <Dashboard a={acct} commit={commit} notify={notify} onLogout={() => logout()} onDelete={remove} /> : <AuthView onDone={enter} />)}
        </div>
        {toast && (
          <div className={`pf-toast ${toast.t}`} role="status" aria-live="polite">
            {toast.t === "ok" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{toast.m}</span>
            <button type="button" aria-label="Fechar aviso" onClick={() => setToast(null)} style={{ color: "#fff" }}><X size={16} /></button>
          </div>
        )}
      </div>
    </PageShell>
  );
}