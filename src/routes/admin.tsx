import { createFileRoute } from "@tanstack/react-router";
import { Activity, BarChart3, Check, KeyRound, LockKeyhole, LogOut, Mail as MailIcon, RefreshCw, ShieldAlert, ShieldCheck, Users } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import type { AnalyticsEvent } from "@/components/AnalyticsTracker";

const EVENTS_KEY = "nova-bill-analytics-events";
const SESSION_KEY = "nova-bill-admin-session";
const ATTEMPTS_KEY = "nova-bill-admin-attempts";
const LOCK_KEY = "nova-bill-admin-lock-until";
const BAN_KEY = "nova-bill-admin-bans";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "X7!pRz@9qL#vT2w$eM^4nB&y";
const SESSION_DURATION = 30 * 60 * 1000;
const BACKOFFS = [0, 0, 0, 0, 60_000, 60_000, 300_000, 300_000, 300_000, 900_000];

type Profile = { name: string; email: string; photo: string };

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Painel administrativo - Nova Bll do Brasil" }, { name: "robots", content: "noindex, nofollow, noarchive" }] }),
  component: Admin,
});

function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [lockUntil, setLockUntil] = useState(0);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [bans, setBans] = useState<string[]>([]);
  const [pendingBan, setPendingBan] = useState<string | null>(null);
  const [unlockRequested, setUnlockRequested] = useState(false);

  function loadData() {
    const storedEvents = JSON.parse(localStorage.getItem(EVENTS_KEY) || "[]") as AnalyticsEvent[];
    setEvents(storedEvents);
    setProfiles(JSON.parse(localStorage.getItem("nova-bill-profiles") || "[]") as Profile[]);
    setBans(JSON.parse(localStorage.getItem(BAN_KEY) || "[]") as string[]);
  }

  useEffect(() => {
    setLockUntil(Number(localStorage.getItem(LOCK_KEY) || 0));
    const unlockToken = new URLSearchParams(window.location.search).get("unlock");
    if (unlockToken) {
      fetch(`/api/admin/unlock?token=${encodeURIComponent(unlockToken)}`)
        .then((response) => {
          if (!response.ok) throw new Error("Link inválido");
          localStorage.removeItem(ATTEMPTS_KEY);
          localStorage.removeItem(LOCK_KEY);
          window.history.replaceState({}, "", "/admin");
          setLockUntil(0);
          setError("Conta desbloqueada. Você pode tentar novamente.");
        })
        .catch(() => setError("O link de desbloqueio é inválido ou expirou."));
    }
    const expires = Number(sessionStorage.getItem(SESSION_KEY) || 0);
    if (expires > Date.now()) {
      setAuthenticated(true);
      loadData();
    }
  }, []);

  async function login(event: FormEvent) {
    event.preventDefault();
    const currentLock = Number(localStorage.getItem(LOCK_KEY) || 0);
    if (currentLock > Date.now()) {
      setLockUntil(currentLock);
      setError(`Acesso bloqueado. Tente novamente em ${Math.ceil((currentLock - Date.now()) / 60000)} min.`);
      return;
    }
    const attempts = Number(localStorage.getItem(ATTEMPTS_KEY) || 0);
    if (password !== ADMIN_PASSWORD) {
      const nextAttempts = attempts + 1;
      const backoff = BACKOFFS[Math.min(nextAttempts, BACKOFFS.length - 1)];
      if (backoff > 0) {
        const nextLock = Date.now() + backoff;
        localStorage.setItem(LOCK_KEY, String(nextLock));
        localStorage.setItem(ATTEMPTS_KEY, String(nextAttempts));
        setLockUntil(nextLock);
        setError(`Acesso bloqueado por ${formatDuration(backoff)} após ${nextAttempts} erros.`);
      } else {
        localStorage.setItem(ATTEMPTS_KEY, String(nextAttempts));
        setError(`Senha incorreta. Tentativa ${nextAttempts}.`);
      }
      return;
    }
    localStorage.removeItem(ATTEMPTS_KEY);
    localStorage.removeItem(LOCK_KEY);
    sessionStorage.setItem(SESSION_KEY, String(Date.now() + SESSION_DURATION));
    setAuthenticated(true);
    setError("");
    loadData();
  }

  async function requestUnlock() {
    setUnlockRequested(true);
    try {
      await fetch("/api/admin/unlock-request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: import.meta.env.VITE_ADMIN_EMAIL || "" }) });
    } catch {
      // A resposta permanece genérica para não revelar se o e-mail existe.
    }
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthenticated(false);
  }

  function banProfile(identifier: string) {
    if (pendingBan !== identifier) {
      setPendingBan(identifier);
      return;
    }
    const nextBans = [...new Set([...bans, identifier])];
    localStorage.setItem(BAN_KEY, JSON.stringify(nextBans));
    setBans(nextBans);
    setPendingBan(null);
  }

  if (!authenticated) return <Login password={password} error={error} locked={lockUntil > Date.now()} unlockRequested={unlockRequested} onUnlock={requestUnlock} onPasswordChange={setPassword} onSubmit={login} />;

  const pageviews = events.filter((event) => event.type === "pageview");
  const interactions = events.filter((event) => event.type === "interaction");
  const leads = events.filter((event) => event.type === "lead");
  const profileEvents = events.filter((event) => event.type === "profile");
  const newsletterEvents = events.filter((event) => event.type === "newsletter");
  const socialClicks = interactions.filter((event) => /instagram|whatsapp/i.test(event.action || ""));
  const consent = localStorage.getItem("nova-bill-analytics-consent") === "accepted";

  return (
    <main className="min-h-screen bg-background px-4 pb-16 pt-28 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div><p className="text-xs font-black uppercase tracking-[0.25em] text-brand-yellow">Área reservada</p><h1 className="mt-2 text-4xl font-black">Painel de controle</h1><p className="mt-2 text-sm font-bold text-muted-foreground">Dados locais e anônimos coletados somente após consentimento.</p></div>
          <div className="flex gap-2"><button type="button" onClick={loadData} className="grid h-11 w-11 place-items-center rounded-xl border border-black/10 bg-white" aria-label="Atualizar dados" title="Atualizar dados"><RefreshCw size={18} /></button><button type="button" onClick={logout} className="grid h-11 w-11 place-items-center rounded-xl border border-black/10 bg-white" aria-label="Sair" title="Sair"><LogOut size={18} /></button></div>
        </header>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-7"><Metric icon={Users} label="Eventos" value={events.length} /><Metric icon={BarChart3} label="Visualizações" value={pageviews.length} /><Metric icon={RefreshCw} label="Interações" value={interactions.length} /><Metric icon={ShieldAlert} label="Formulários" value={leads.length} /><Metric icon={Users} label="Perfis" value={profileEvents.length} /><Metric icon={MailIcon} label="Newsletter" value={newsletterEvents.length} /><Metric icon={Check} label="Consentimento" value={consent ? "Aceito" : "Não"} /></section>
        <section className="mt-6 grid gap-6 lg:grid-cols-2"><Chart title="Dispositivos" values={countBy(events, "device")} /><Chart title="Navegadores" values={countBy(events, "browser")} /><Chart title="Páginas visitadas" values={countBy(events, "path")} /><Chart title="Cliques sociais" values={countBy(socialClicks, "action")} /></section>

        <section className="mt-6 glass rounded-2xl p-5 sm:p-7"><h2 className="text-xl font-black">Leads dos formulários</h2><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[46rem] text-left text-sm"><thead className="border-b border-black/10 text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="p-3">Nome</th><th className="p-3">E-mail</th><th className="p-3">Página</th><th className="p-3">Ação</th></tr></thead><tbody>{leads.slice(-30).reverse().map((lead) => <tr key={lead.id} className="border-b border-black/5"><td className="p-3 font-bold">{lead.name || "Não informado"}</td><td className="p-3">{lead.email || "Não informado"}</td><td className="p-3">{lead.path}</td><td className="p-3"><BanButton id={lead.email || lead.id} pending={pendingBan} banned={bans.includes(lead.email || lead.id)} onBan={banProfile} /></td></tr>)}</tbody></table>{!leads.length && <p className="mt-4 text-sm font-bold text-muted-foreground">Nenhum formulário registrado ainda.</p>}</div></section>
        <section className="mt-6 glass rounded-2xl p-5 sm:p-7"><h2 className="text-xl font-black">Perfis criados</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{profiles.map((profile) => <div key={profile.email} className="flex items-center gap-3 rounded-xl border border-black/10 p-3"><div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-black text-white">{profile.photo ? <img src={profile.photo} alt="" className="h-full w-full object-cover" /> : <Users size={18} />}</div><div className="min-w-0"><p className="truncate font-black">{profile.name}</p><p className="truncate text-xs font-bold text-muted-foreground">{profile.email}</p></div><BanButton id={profile.email} pending={pendingBan} banned={bans.includes(profile.email)} onBan={banProfile} /></div>)}</div></section>
        <section className="mt-6 glass rounded-2xl p-5 sm:p-7"><h2 className="text-xl font-black">Perfis criados</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{profiles.map((profile) => <div key={profile.email} className="flex items-center gap-3 rounded-xl border border-black/10 p-3"><div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-black text-white">{profile.photo ? <img src={profile.photo} alt="" className="h-full w-full object-cover" /> : <Users size={18} />}</div><div className="min-w-0"><p className="truncate font-black">{profile.name}</p><p className="truncate text-xs font-bold text-muted-foreground">{profile.email}</p></div><BanButton id={profile.email} pending={pendingBan} banned={bans.includes(profile.email)} onBan={banProfile} /></div>)}</div></section>
        <NewsletterList />
      </div>
    </main>
  );
}

function NewsletterList() {
  const subscribers = JSON.parse(typeof window === "undefined" ? "[]" : localStorage.getItem("nova-bill-newsletter") || "[]") as Array<{ name: string; email: string }>;
  return <section className="mt-6 glass rounded-2xl p-5 sm:p-7"><h2 className="text-xl font-black">Inscritos na newsletter</h2><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{subscribers.map((subscriber) => <div key={subscriber.email} className="rounded-xl border border-black/10 p-3"><p className="font-black">{subscriber.name}</p><p className="text-sm font-bold text-muted-foreground">{subscriber.email}</p></div>)}</div>{!subscribers.length && <p className="mt-4 text-sm font-bold text-muted-foreground">Nenhum inscrito ainda.</p>}</section>;
}

function Login({ password, error, locked, unlockRequested, onUnlock, onPasswordChange, onSubmit }: { password: string; error: string; locked: boolean; unlockRequested: boolean; onUnlock: () => void; onPasswordChange: (value: string) => void; onSubmit: (event: FormEvent) => void }) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-brand-yellow/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-1/4 h-96 w-96 rounded-full bg-brand-gray/15 blur-[140px]" />
      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-black/10 bg-white/80 shadow-2xl backdrop-blur-xl md:grid-cols-[0.9fr_1.1fr]">
        <section className="relative hidden overflow-hidden bg-black p-10 text-white md:flex md:flex-col md:justify-between">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full border border-brand-yellow/30 bg-brand-yellow/10 blur-2xl" />
          <div className="relative">
            <div className="grid h-14 w-14 place-items-center rounded-2xl border border-brand-yellow/50 bg-brand-yellow/15 text-brand-yellow"><ShieldCheck size={28} /></div>
            <p className="mt-8 text-xs font-black uppercase tracking-[0.3em] text-brand-yellow">Nova Bll do Brasil · Controle</p>
            <h1 className="mt-4 text-4xl font-black leading-tight">Gestão clara para decisões mais rápidas.</h1>
            <p className="mt-5 max-w-sm text-sm font-semibold leading-relaxed text-white/65">Acompanhe visitantes, leads, perfis e sinais de interesse em um só lugar.</p>
          </div>
          <div className="relative grid gap-3 text-xs font-bold text-white/75"><p className="flex items-center gap-3"><Activity size={16} className="text-brand-yellow" /> Monitoramento consentido</p><p className="flex items-center gap-3"><LockKeyhole size={16} className="text-brand-yellow" /> Sessão administrativa protegida</p><p className="flex items-center gap-3"><BarChart3 size={16} className="text-brand-yellow" /> Indicadores em tempo real local</p></div>
        </section>
        <form onSubmit={onSubmit} className="p-6 sm:p-10 lg:p-14">
          <div className="flex items-center gap-3 text-brand-yellow md:hidden"><ShieldCheck size={25} /><span className="text-xs font-black uppercase tracking-[0.25em]">Nova Bll do Brasil · Admin</span></div>
          <div className="mt-6 grid h-14 w-14 place-items-center rounded-2xl bg-brand-yellow text-brand-black shadow-yellow"><LockKeyhole size={27} /></div>
          <p className="mt-7 text-xs font-black uppercase tracking-[0.25em] text-brand-yellow">Área reservada</p>
          <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">Bem-vindo ao painel.</h2>
          <p className="mt-3 max-w-md text-sm font-bold leading-relaxed text-muted-foreground">Entre para consultar os dados de navegação e acompanhar as oportunidades da Nova Bll do Brasil.</p>
          <label className="mt-8 grid gap-2 text-xs font-black uppercase tracking-wider text-muted-foreground"><span className="flex items-center gap-2"><KeyRound size={14} /> Senha de acesso</span><input autoFocus required disabled={locked} type="password" value={password} onChange={(event) => onPasswordChange(event.target.value)} className="input-dark" placeholder="Digite sua senha" /></label>
          {error && <p role="alert" className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm font-bold leading-relaxed text-red-700">{error}</p>}
          {locked && <button type="button" onClick={onUnlock} disabled={unlockRequested} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand-yellow/60 px-4 py-3 text-xs font-black uppercase tracking-wider text-brand-yellow transition-colors hover:bg-brand-yellow/10">{unlockRequested ? <><Check size={16} /> Solicitação enviada</> : <><KeyRound size={16} /> Desbloquear minha conta</>}</button>}
          <button disabled={locked} type="submit" className="btn-hero btn-hero-hover mt-5 w-full py-3.5 disabled:cursor-not-allowed disabled:opacity-50">{locked ? "Acesso bloqueado" : "Entrar no painel"}</button>
          <p className="mt-5 text-center text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">Acesso restrito · Nova Bll do Brasil</p>
        </form>
      </div>
    </main>
  );
}

function formatDuration(milliseconds: number) { const minutes = Math.ceil(milliseconds / 60000); return minutes === 1 ? "1 minuto" : `${minutes} minutos`; }

function Metric({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number | string }) { return <div className="glass rounded-2xl p-4"><Icon className="text-brand-yellow" size={21} /><p className="mt-3 text-2xl font-black">{value}</p><p className="mt-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground">{label}</p></div>; }

function Chart({ title, values }: { title: string; values: Record<string, number> }) { const rows = Object.entries(values).sort((a, b) => b[1] - a[1]).slice(0, 6); const max = rows[0]?.[1] || 1; return <div className="glass rounded-2xl p-5 sm:p-7"><h2 className="text-xl font-black">{title}</h2><div className="mt-5 grid gap-3">{rows.length ? rows.map(([label, value]) => <div key={label}><div className="flex justify-between gap-3 text-sm font-bold"><span className="truncate">{label}</span><span>{value}</span></div><div className="mt-1 h-2 overflow-hidden rounded-full bg-black/10"><div className="h-full rounded-full bg-brand-yellow transition-all" style={{ width: `${(value / max) * 100}%` }} /></div></div>) : <p className="text-sm font-bold text-muted-foreground">Ainda não há dados.</p>}</div></div>; }

function BanButton({ id, pending, banned, onBan }: { id: string; pending: string | null; banned: boolean; onBan: (id: string) => void }) { return <button type="button" disabled={banned} onClick={() => onBan(id)} className={`rounded-lg px-3 py-2 text-xs font-black uppercase ${pending === id ? "bg-red-600 text-white" : banned ? "bg-black/10 text-muted-foreground" : "border border-red-500/40 text-red-600"}`}>{pending === id ? "Confirmar" : banned ? "Banido" : "Banir"}</button>; }

function countBy(events: AnalyticsEvent[], key: keyof AnalyticsEvent) { return events.reduce<Record<string, number>>((result, event) => { const value = String(event[key] || "Não informado"); result[value] = (result[value] || 0) + 1; return result; }, {}); }
