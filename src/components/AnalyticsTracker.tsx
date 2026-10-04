import { useEffect, useState } from "react";

export interface AnalyticsEvent {
  id: string;
  type: "pageview" | "interaction" | "lead" | "profile" | "newsletter";
  path: string;
  action?: string;
  device: string;
  browser: string;
  visitorType: string;
  language: string;
  screen: string;
  timestamp: string;
  name?: string;
  email?: string;
}

const CONSENT_KEY = "nova-bill-analytics-consent";
const EVENTS_KEY = "nova-bill-analytics-events";

function getBrowser() {
  const userAgent = navigator.userAgent;
  if (/Edg\//.test(userAgent)) return "Edge";
  if (/Chrome\//.test(userAgent)) return "Chrome";
  if (/Firefox\//.test(userAgent)) return "Firefox";
  if (/Safari\//.test(userAgent)) return "Safari";
  return "Outro";
}

function getDevice() {
  if (/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) return "Celular/tablet";
  return "Desktop";
}

function getVisitorType() {
  const returning = localStorage.getItem("nova-bill-returning-visitor") === "true";
  localStorage.setItem("nova-bill-returning-visitor", "true");
  return returning ? "Visitante recorrente" : "Novo visitante";
}

export function recordAnalyticsEvent(type: AnalyticsEvent["type"], action?: string, details?: Pick<AnalyticsEvent, "name" | "email">) {
  if (typeof window === "undefined" || localStorage.getItem(CONSENT_KEY) !== "accepted") return;

  const events = JSON.parse(localStorage.getItem(EVENTS_KEY) || "[]") as AnalyticsEvent[];
  const event: AnalyticsEvent = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    path: window.location.pathname,
    action,
    device: getDevice(),
    browser: getBrowser(),
    visitorType: getVisitorType(),
    language: navigator.language,
    screen: `${window.innerWidth}x${window.innerHeight}`,
    timestamp: new Date().toISOString(),
    ...details,
  };

  localStorage.setItem(EVENTS_KEY, JSON.stringify([...events.slice(-499), event]));
}

export function AnalyticsTracker() {
  const [consent, setConsent] = useState<string | null>(null);

  useEffect(() => {
    setConsent(localStorage.getItem(CONSENT_KEY));
  }, []);

  useEffect(() => {
    if (consent !== "accepted") return;

    recordAnalyticsEvent("pageview");
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const element = target.closest("a,button");
      if (!element) return;
      const action = element.getAttribute("aria-label") || element.textContent?.trim().slice(0, 80) || "Elemento sem nome";
      recordAnalyticsEvent("interaction", action);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [consent]);

  if (consent) return null;

  return (
    <aside className="fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-xl rounded-2xl border border-brand-yellow/40 bg-black p-4 text-white shadow-deep sm:left-auto sm:right-6">
      <p className="text-sm font-bold leading-relaxed">Usamos dados anônimos de navegação para entender o desempenho do site e melhorar seu atendimento.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => { localStorage.setItem(CONSENT_KEY, "accepted"); setConsent("accepted"); }} className="rounded-lg bg-brand-yellow px-4 py-2 text-xs font-black uppercase tracking-wider text-brand-black">Aceitar</button>
        <button type="button" onClick={() => { localStorage.setItem(CONSENT_KEY, "denied"); setConsent("denied"); }} className="rounded-lg border border-white/30 px-4 py-2 text-xs font-black uppercase tracking-wider text-white">Agora não</button>
      </div>
    </aside>
  );
}
