import { useState, type FormEvent } from "react";
import { Send, Check, AlertCircle } from "lucide-react";
import { whatsappLink } from "@/lib/whatsapp";
import { PHONE_NUMBER } from "@/lib/whatsapp";
import { recordAnalyticsEvent } from "@/components/AnalyticsTracker";

interface Props {
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

function buildWhatsAppLink(form: { nome: string; email: string; telefone: string; mensagem: string }) {
  const text = [
    `Olá! Meu nome é ${form.nome || "Cliente"}.`,
    `Email: ${form.email || "não informado"}`,
    `Telefone: ${form.telefone || "não informado"}`,
    `Mensagem: ${form.mensagem || "Nenhuma mensagem informada."}`,
  ].join("\n");

  return whatsappLink(text);
}

export function ContactForm({ title = "Fale com a gente", subtitle = "Resposta em até 24h úteis. Telefone: (11) 5522-9775 | WhatsApp: (11) 99217-9989", compact }: Props) {
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState<"success" | "error" | "">("");
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", mensagem: "" });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.nome || !form.email || !form.telefone) {
      setFeedbackType("error");
      setFeedback("Preencha nome, e-mail e telefone para continuar.");
      return;
    }

    setIsSubmitting(true);
    setFeedback("");
    setFeedbackType("");

    const payload = {
      ...form,
      mensagem: form.mensagem.trim() || "Nenhuma mensagem informada.",
    };
    const whatsappUrl = buildWhatsAppLink(payload);

    try {
      const response = await fetch("/api/contato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Sua mensagem não foi enviada por falta de confirmação.");
      }

      setSent(true);
      recordAnalyticsEvent("lead", "Formulário enviado", { name: payload.nome, email: payload.email });
      setFeedbackType("success");
      setFeedback(data.message || "Mensagem enviada com sucesso!");
      setForm({ nome: "", email: "", telefone: "", mensagem: "" });

      if (whatsappUrl) {
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      }

      window.setTimeout(() => {
        setSent(false);
        setFeedback("");
        setFeedbackType("");
      }, 4000);
    } catch (error) {
      setFeedbackType("error");
      setFeedback(error instanceof Error ? error.message : "Erro inesperado ao enviar o formulário.");

      if (whatsappUrl) {
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={`glass rounded-2xl ${compact ? "p-4 sm:p-5" : "p-5 md:p-6"}`}>
      <div className={compact ? "mb-4" : "mb-6"}>
        <h3 className={`font-black leading-none ${compact ? "text-2xl md:text-3xl" : "text-2xl md:text-3xl"}`}>{title}</h3>
        <p className="mt-2 text-sm font-bold text-muted-foreground">{subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-3">
        <div className="grid gap-3 md:grid-cols-2">
          <input
            required
            placeholder="Nome completo"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="input-dark"
            maxLength={100}
          />
          <input
            required
            type="tel"
            placeholder="Telefone"
            value={form.telefone}
            onChange={(e) => setForm({ ...form, telefone: e.target.value })}
            className="input-dark"
            maxLength={20}
          />
        </div>
        <input
          required
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="input-dark"
          maxLength={120}
        />
        <textarea
          placeholder="Sua mensagem"
          rows={compact ? 3 : 4}
          value={form.mensagem}
          onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
          className="input-dark resize-none"
          maxLength={1000}
        />

        {feedback ? (
          <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${feedbackType === "error" ? "border-red-400/40 bg-red-500/10 text-red-200" : "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"}`}>
            {feedbackType === "error" ? <AlertCircle size={16} /> : <Check size={16} />}
            <span>{feedback}</span>
          </div>
        ) : null}

        <div className="mt-1 flex flex-col gap-2 md:flex-row md:items-center">
          <a
            href={`tel:${PHONE_NUMBER}`}
            className="inline-flex w-full items-center justify-center rounded-md border border-brand-yellow/50 bg-transparent px-4 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-brand-yellow transition-all duration-300 hover:bg-brand-yellow/10 md:w-auto"
          >
            Ligar (11) 5522-9775
          </a>
          <button type="submit" disabled={isSubmitting} className="btn-hero btn-hero-hover flex w-full items-center justify-center gap-2 md:w-auto md:self-start">
            {isSubmitting ? (
              "Enviando..."
            ) : sent ? (
              <><Check size={18} /> Enviado</>
            ) : (
              <><Send size={18} /> Enviar mensagem</>
            )}
          </button>

          <a
            href={buildWhatsAppLink(form)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full items-center justify-center rounded-md border border-brand-yellow/50 bg-transparent px-4 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-brand-yellow transition-all duration-300 hover:bg-brand-yellow/10 md:w-auto"
          >
            Abrir WhatsApp
          </a>
        </div>
      </form>
    </div>
  );
}
