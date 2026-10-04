import { Instagram, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { whatsappLink } from "@/lib/whatsapp";

const INSTAGRAM_URL = (import.meta.env.VITE_INSTAGRAM_URL || "https://www.instagram.com/novablldobrasil/?hl=en").trim();

export function FloatingBubbles() {
  const [monochrome, setMonochrome] = useState(false);

  useEffect(() => {
    const savedPreference = window.localStorage.getItem("nova-bill-monochrome") === "true";
    setMonochrome(savedPreference);
    document.documentElement.classList.toggle("site-monochrome", savedPreference);
  }, []);

  function toggleMonochrome() {
    setMonochrome((current) => {
      const nextValue = !current;
      document.documentElement.classList.toggle("site-monochrome", nextValue);
      window.localStorage.setItem("nova-bill-monochrome", String(nextValue));
      return nextValue;
    });
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-3">
      <button
        type="button"
        aria-label={monochrome ? "Desativar fundo preto" : "Ativar fundo preto"}
        aria-pressed={monochrome}
        title={monochrome ? "Desativar fundo preto" : "Ativar fundo preto"}
        onClick={toggleMonochrome}
        className="-translate-y-1 grid h-14 w-14 place-items-center rounded-full border border-black/10 bg-white text-black shadow-deep transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow"
      >
        <Moon size={23} strokeWidth={2.5} />
      </button>
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        className="group animate-float-social grid h-14 w-14 place-items-center rounded-full text-white shadow-deep transition-transform hover:scale-110"
        style={{
          background:
            "linear-gradient(135deg, #833AB4 0%, #E1306C 48%, #F77737 100%)",
        }}
      >
        <Instagram size={24} strokeWidth={2.5} />
      </a>
      <a
        href={whatsappLink("Olá! Quero falar com a Nova Bll do Brasil sobre minha obra.")}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-deep transition-transform animate-float-social hover:scale-110"
        style={{ animationDelay: "0.45s" }}
      >
        <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden>
          <path d="M20.52 3.48A11.78 11.78 0 0 0 12.06 0C5.5 0 .17 5.33.17 11.9c0 2.1.55 4.14 1.6 5.95L0 24l6.32-1.66a11.86 11.86 0 0 0 5.73 1.46h.01c6.56 0 11.89-5.33 11.89-11.9 0-3.18-1.24-6.17-3.43-8.42ZM12.06 21.5h-.01a9.6 9.6 0 0 1-4.9-1.35l-.35-.21-3.75.98 1-3.65-.23-.37a9.62 9.62 0 1 1 17.84-5.07 9.6 9.6 0 0 1-9.6 9.67Zm5.49-7.2c-.3-.15-1.78-.88-2.05-.98-.27-.1-.47-.15-.67.15-.2.3-.78.98-.95 1.18-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.49-.89-.79-1.5-1.77-1.67-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.78-.73 2.04-1.43.25-.7.25-1.3.17-1.43-.07-.13-.27-.2-.57-.35Z"/>
        </svg>
      </a>
    </div>
  );
}
