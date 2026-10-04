import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  Camera,
  Check,
  Clock,
  Copy,
  Eye,
  EyeOff,
  FileText,
  Globe,
  LogOut,
  Lock,
  Mail,
  Phone,
  Smartphone,
  Trash2,
  User,
  Zap,
  Download,
  ChevronRight,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Loader,
  Send,
  X,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { PageShell } from "@/components/PageShell";
import { recordAnalyticsEvent } from "@/components/AnalyticsTracker";
import { absoluteUrl } from "@/lib/seo";

type ActiveTab = "overview" | "security" | "preferences" | "sessions";

interface Profile {
  name: string;
  email: string;
  phone: string;
  newsletter: boolean;
  photo: string;
  twoFactorEnabled: boolean;
  passwordLastChanged: string;
  createdAt: string;
}

interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  isCurrentSession: boolean;
}

interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
}

interface SecurityValidation {
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumbers: boolean;
  hasSpecialChar: boolean;
  minLength: boolean;
}

const PROFILE_KEY = "nova-bill-profile";
const NEWSLETTER_KEY = "nova-bill-newsletter";
const SESSIONS_KEY = "nova-bill-sessions";
const SECURITY_KEY = "nova-bill-security";

const EMPTY_PROFILE: Profile = {
  name: "",
  email: "",
  phone: "",
  newsletter: true,
  photo: "",
  twoFactorEnabled: false,
  passwordLastChanged: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Meu perfil — BLL do Brasil" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { name: "description", content: "Gerencie sua conta e preferências de segurança." },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/perfil") }],
  }),
  component: Perfil,
});

function Perfil() {
  // Estados principais
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [hasAccount, setHasAccount] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);

  // Estados de criação de conta
  const [createAccountData, setCreateAccountData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    phone: "",
    newsletter: true,
  });
  const [createError, setCreateError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: "",
    color: "",
  });

  // Estados de segurança
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Estados de 2FA
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [verifying2FA, setVerifying2FA] = useState(false);

  // Estados de preferências
  const [preferences, setPreferences] = useState({
    newsUpdates: true,
    promotions: true,
    weeklyReports: false,
    orderConfirmation: true,
  });

  useEffect(() => {
    const stored = localStorage.getItem(PROFILE_KEY);
    if (stored) {
      setProfile({ ...EMPTY_PROFILE, ...(JSON.parse(stored) as Partial<Profile>) });
      setHasAccount(true);
      loadSessions();
    }
  }, []);

  // Validação de força de senha
  function validatePasswordStrength(password: string): PasswordStrength {
    const validation: SecurityValidation = {
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      minLength: password.length >= 8,
    };

    const passCount = Object.values(validation).filter(Boolean).length;

    const scores: PasswordStrength[] = [
      { score: 0, label: "Muito fraca", color: "text-red-500" },
      { score: 1, label: "Fraca", color: "text-orange-500" },
      { score: 2, label: "Regular", color: "text-yellow-500" },
      { score: 3, label: "Forte", color: "text-lime-500" },
      { score: 4, label: "Muito forte", color: "text-green-500" },
    ];

    return scores[passCount] || scores[0];
  }

  // Criar conta
  function handleCreateAccount(e: FormEvent) {
    e.preventDefault();
    setCreateError("");

    // Validações
    if (!createAccountData.name.trim()) {
      setCreateError("Nome é obrigatório");
      return;
    }

    if (!createAccountData.email.includes("@")) {
      setCreateError("Email inválido");
      return;
    }

    if (createAccountData.password.length < 8) {
      setCreateError("Senha deve ter pelo menos 8 caracteres");
      return;
    }

    if (createAccountData.password !== createAccountData.passwordConfirm) {
      setCreateError("Senhas não coincidem");
      return;
    }

    if (validatePasswordStrength(createAccountData.password).score < 2) {
      setCreateError("Senha muito fraca. Use maiúsculas, minúsculas, números e caracteres especiais");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      try {
        const newProfile: Profile = {
          name: createAccountData.name,
          email: createAccountData.email,
          phone: createAccountData.phone,
          newsletter: createAccountData.newsletter,
          photo: "",
          twoFactorEnabled: false,
          passwordLastChanged: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };

        localStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
        localStorage.setItem(SECURITY_KEY, JSON.stringify({ password: createAccountData.password }));

        const profiles = JSON.parse(localStorage.getItem("nova-bill-profiles") || "[]") as Profile[];
        localStorage.setItem(
          "nova-bill-profiles",
          JSON.stringify([...profiles.filter((item) => item.email !== createAccountData.email), newProfile])
        );

        recordAnalyticsEvent("profile", "Conta criada", {
          name: newProfile.name,
          email: newProfile.email,
        });

        setProfile(newProfile);
        setHasAccount(true);
        setIsCreatingAccount(false);
        setCreateAccountData({ name: "", email: "", password: "", passwordConfirm: "", phone: "", newsletter: true });
        setSuccess("Conta criada com sucesso! 🎉");
        setTimeout(() => setSuccess(""), 3000);
        loadSessions();
      } catch (err) {
        setCreateError("Erro ao criar conta. Tente novamente");
      } finally {
        setLoading(false);
      }
    }, 800);
  }

  // Salvar perfil
  function saveProfile(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    setTimeout(() => {
      try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
        recordAnalyticsEvent("profile", "Perfil atualizado", {
          name: profile.name,
          email: profile.email,
        });

        setSaved(true);
        setSuccess("Perfil atualizado com sucesso!");
        setTimeout(() => {
          setSaved(false);
          setSuccess("");
        }, 2500);
      } catch (err) {
        setError("Erro ao salvar perfil");
      } finally {
        setLoading(false);
      }
    }, 600);
  }

  // Processar foto
  function handlePhoto(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProfile((current) => ({ ...current, photo: String(reader.result) }));
      setSuccess("Foto de perfil atualizada!");
      setTimeout(() => setSuccess(""), 2000);
    };
    reader.readAsDataURL(file);
  }

  // Mudar senha
  function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    setPasswordError("");

    if (!currentPassword) {
      setPasswordError("Senha atual é obrigatória");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Nova senha deve ter pelo menos 8 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Novas senhas não coincidem");
      return;
    }

    if (validatePasswordStrength(newPassword).score < 2) {
      setPasswordError("Senha fraca. Use maiúsculas, minúsculas, números e caracteres especiais");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const stored = localStorage.getItem(SECURITY_KEY);
      const security = stored ? JSON.parse(stored) : {};

      if (security.password !== currentPassword) {
        setPasswordError("Senha atual incorreta");
        setLoading(false);
        return;
      }

      localStorage.setItem(SECURITY_KEY, JSON.stringify({ password: newPassword }));
      setProfile((prev) => ({ ...prev, passwordLastChanged: new Date().toISOString() }));
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));

      recordAnalyticsEvent("profile", "Senha alterada");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordChange(false);
      setSuccess("Senha alterada com sucesso!");
      setTimeout(() => setSuccess(""), 3000);
      setLoading(false);
    }, 800);
  }

  // Ativar 2FA
  function handleEnable2FA() {
    setShow2FASetup(true);
  }

  // Verificar código 2FA
  function handleVerify2FA(e: FormEvent) {
    e.preventDefault();
    setVerifying2FA(true);

    setTimeout(() => {
      if (twoFactorCode.length === 6 && /^\d+$/.test(twoFactorCode)) {
        const updated = { ...profile, twoFactorEnabled: true };
        setProfile(updated);
        localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
        localStorage.setItem(SECURITY_KEY, JSON.stringify({ ...JSON.parse(localStorage.getItem(SECURITY_KEY) || "{}"), twoFactorSecret: "secret-" + Math.random() }));

        recordAnalyticsEvent("profile", "2FA ativado");

        setShow2FASetup(false);
        setTwoFactorCode("");
        setSuccess("Autenticação em duas etapas ativada com sucesso!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError("Código inválido. Digite 6 dígitos");
      }

      setVerifying2FA(false);
    }, 800);
  }

  // Desativar 2FA
  function handleDisable2FA() {
    if (!window.confirm("Tem certeza que deseja desativar a autenticação de duas etapas?")) return;

    const updated = { ...profile, twoFactorEnabled: false };
    setProfile(updated);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    recordAnalyticsEvent("profile", "2FA desativado");
    setSuccess("Autenticação em duas etapas desativada");
    setTimeout(() => setSuccess(""), 2000);
  }

  // Salvar preferências
  function savePreferences() {
    setLoading(true);

    setTimeout(() => {
      localStorage.setItem("nova-bill-preferences", JSON.stringify(preferences));
      recordAnalyticsEvent("profile", "Preferências atualizadas");
      setSuccess("Preferências salvas com sucesso!");
      setTimeout(() => setSuccess(""), 2000);
      setLoading(false);
    }, 600);
  }

  // Carregar sessões
  function loadSessions() {
    const mockSessions: Session[] = [
      {
        id: "current",
        device: "Seu navegador",
        browser: "Chrome no Windows",
        location: "São Paulo, SP",
        lastActive: new Date().toLocaleString(),
        isCurrentSession: true,
      },
      {
        id: "session-2",
        device: "iPhone",
        browser: "Safari no iOS",
        location: "São Paulo, SP",
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString(),
        isCurrentSession: false,
      },
    ];
    setSessions(mockSessions);
  }

  // Desconectar sessão
  function handleSessionLogout(sessionId: string) {
    setSessions(sessions.filter((s) => s.id !== sessionId));
    setSuccess("Sessão encerrada com sucesso");
    setTimeout(() => setSuccess(""), 2000);
  }

  // Exportar dados
  function exportUserData() {
    const data = {
      profile,
      sessions,
      exportedAt: new Date().toISOString(),
      preferences,
    };

    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dados-conta-${profile.email}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    recordAnalyticsEvent("profile", "Dados exportados");
    setSuccess("Dados exportados com sucesso!");
    setTimeout(() => setSuccess(""), 2000);
  }

  // Deletar conta
  function deleteAccount() {
    if (!window.confirm("Tem certeza? Esta ação não pode ser desfeita. Todos seus dados serão perdidos permanentemente.")) return;

    setLoading(true);

    setTimeout(() => {
      localStorage.removeItem(PROFILE_KEY);
      localStorage.removeItem("nova-bill-profiles");
      localStorage.removeItem(NEWSLETTER_KEY);
      localStorage.removeItem(SECURITY_KEY);
      localStorage.removeItem(SESSIONS_KEY);

      recordAnalyticsEvent("profile", "Conta excluída");

      setProfile(EMPTY_PROFILE);
      setHasAccount(false);
      setIsCreatingAccount(false);
      setActiveTab("overview");
      setSuccess("");
      setLoading(false);
    }, 800);
  }

  // ===== UI: SEM CONTA =====
  if (!hasAccount && !isCreatingAccount) {
    return (
      <PageShell
        eyebrow="Conta"
        title={
          <>
            Crie sua <span className="text-gradient-yellow">conta.</span>
          </>
        }
        description="Gerencie suas informações, segurança e preferências em um único lugar."
      >
        <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
          <div className="animate-fadeIn rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-8 sm:p-12 text-center shadow-2xl shadow-brand-yellow/5 transition-all duration-300">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-brand-yellow/20 animate-pulse">
              <User className="text-brand-yellow" size={32} />
            </div>
            <h2 className="mt-6 text-2xl font-black text-white">Sem conta ativa</h2>
            <p className="mt-3 text-slate-400">Crie sua conta para acompanhar relacionamento com a Nova Bll.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row justify-center">
              <button
                onClick={() => setIsCreatingAccount(true)}
                className="btn-hero transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-brand-yellow/20"
              >
                Criar conta
              </button>
              <a
                href="/"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-6 py-3 font-bold text-slate-300 hover:bg-slate-700 transition-all duration-300 hover:border-slate-600"
              >
                <ArrowLeft size={16} />
                Voltar
              </a>
            </div>
          </div>
        </section>
      </PageShell>
    );
  }

  // ===== UI: CRIANDO CONTA =====
  if (!hasAccount && isCreatingAccount) {
    return (
      <PageShell
        eyebrow="Conta"
        title={
          <>
            Vamos criar sua <span className="text-gradient-yellow">conta.</span>
          </>
        }
        description="Preencha os dados abaixo para começar."
      >
        <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
          <div className="animate-fadeIn rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-8 sm:p-12 shadow-2xl shadow-brand-yellow/5">
            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-500/50 bg-red-500/10 p-4 animate-slideDown">
                <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-bold text-red-500">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 flex items-start gap-3 rounded-lg border border-green-500/50 bg-green-500/10 p-4 animate-slideDown">
                <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-bold text-green-500">{success}</p>
              </div>
            )}

            <form onSubmit={handleCreateAccount} className="space-y-6">
              {/* Nome */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-300">
                  <User size={14} />
                  Nome completo
                </label>
                <input
                  type="text"
                  value={createAccountData.name}
                  onChange={(e) => setCreateAccountData({ ...createAccountData, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 transition-all duration-300"
                  placeholder="Seu nome"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-300">
                  <Mail size={14} />
                  Email
                </label>
                <input
                  type="email"
                  value={createAccountData.email}
                  onChange={(e) => setCreateAccountData({ ...createAccountData, email: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 transition-all duration-300"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              {/* Telefone */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-300">
                  <Phone size={14} />
                  Telefone (opcional)
                </label>
                <input
                  type="tel"
                  value={createAccountData.phone}
                  onChange={(e) => setCreateAccountData({ ...createAccountData, phone: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 transition-all duration-300"
                  placeholder="(11) 99999-9999"
                />
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-300">
                  <Lock size={14} />
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={createAccountData.password}
                    onChange={(e) => {
                      setCreateAccountData({ ...createAccountData, password: e.target.value });
                      setPasswordStrength(validatePasswordStrength(e.target.value));
                    }}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 pr-12 text-white placeholder:text-slate-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 transition-all duration-300"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Indicador de força */}
                {createAccountData.password && (
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            i < passwordStrength.score ? passwordStrength.color.replace("text-", "bg-") : "bg-slate-700"
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs font-bold ${passwordStrength.color}`}>{passwordStrength.label}</p>
                  </div>
                )}

                {/* Requisitos */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <p className={`text-xs flex items-center gap-1 ${createAccountData.password.length >= 8 ? "text-green-500" : "text-slate-500"}`}>
                    <Check size={12} /> Mín. 8 caracteres
                  </p>
                  <p className={`text-xs flex items-center gap-1 ${/[A-Z]/.test(createAccountData.password) ? "text-green-500" : "text-slate-500"}`}>
                    <Check size={12} /> Maiúscula
                  </p>
                  <p className={`text-xs flex items-center gap-1 ${/[a-z]/.test(createAccountData.password) ? "text-green-500" : "text-slate-500"}`}>
                    <Check size={12} /> Minúscula
                  </p>
                  <p className={`text-xs flex items-center gap-1 ${/\d/.test(createAccountData.password) ? "text-green-500" : "text-slate-500"}`}>
                    <Check size={12} /> Número
                  </p>
                  <p className={`text-xs flex items-center gap-1 ${/[!@#$%^&*(),.?":{}|<>]/.test(createAccountData.password) ? "text-green-500" : "text-slate-500"}`}>
                    <Check size={12} /> Caractere especial
                  </p>
                </div>
              </div>

              {/* Confirmar Senha */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-300">
                  <Lock size={14} />
                  Confirmar senha
                </label>
                <input
                  type="password"
                  value={createAccountData.passwordConfirm}
                  onChange={(e) => setCreateAccountData({ ...createAccountData, passwordConfirm: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 transition-all duration-300"
                  placeholder="••••••••"
                  required
                />
                {createAccountData.password && createAccountData.passwordConfirm && (
                  <p className={`text-xs flex items-center gap-1 ${createAccountData.password === createAccountData.passwordConfirm ? "text-green-500" : "text-red-500"}`}>
                    {createAccountData.password === createAccountData.passwordConfirm ? <Check size={12} /> : <X size={12} />}
                    {createAccountData.password === createAccountData.passwordConfirm ? "Senhas coincidem" : "Senhas não coincidem"}
                  </p>
                )}
              </div>

              {/* Newsletter */}
              <label className="flex items-start gap-3 rounded-lg border border-slate-700 bg-slate-800/50 p-4 cursor-pointer hover:bg-slate-800/70 transition-all duration-300">
                <input
                  type="checkbox"
                  checked={createAccountData.newsletter}
                  onChange={(e) => setCreateAccountData({ ...createAccountData, newsletter: e.target.checked })}
                  className="mt-1 h-4 w-4 accent-brand-yellow cursor-pointer"
                />
                <p className="text-sm font-semibold text-slate-400">Receber novidades, dicas e oportunidades da Nova Bll do Brasil por email.</p>
              </label>

              {/* Botões */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-hero flex-1 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:scale-100"
                >
                  {loading ? (
                    <>
                      <Loader size={18} className="animate-spin" /> Criando...
                    </>
                  ) : (
                    <>
                      <Check size={18} /> Criar conta
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingAccount(false)}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-6 py-3 font-bold text-slate-300 hover:bg-slate-700 transition-all duration-300"
                >
                  <ArrowLeft size={16} />
                  Voltar
                </button>
              </div>
            </form>
          </div>
        </section>
      </PageShell>
    );
  }

  // ===== UI: COM CONTA =====
  return (
    <PageShell
      eyebrow="Sua conta"
      title={
        <>
          Olá, <span className="text-gradient-yellow">{profile.name.split(" ")[0]}</span>
        </>
      }
      description="Gerencie suas informações pessoais, segurança e preferências."
    >
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Notificações */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-500/50 bg-red-500/10 p-4 animate-slideDown">
            <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-bold text-red-500">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-green-500/50 bg-green-500/10 p-4 animate-slideDown">
            <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-bold text-green-500">{success}</p>
          </div>
        )}

        {/* Card de Perfil */}
        <div className="animate-fadeIn rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-6 sm:p-10 mb-8 shadow-2xl shadow-brand-yellow/5 transition-all duration-300">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
              {/* Avatar */}
              <label className="group relative grid h-32 w-32 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-2xl border-4 border-brand-yellow bg-slate-900 text-white shadow-xl shadow-brand-yellow/20 transition-all duration-300 hover:scale-105">
                {profile.photo ? (
                  <img src={profile.photo} alt="Foto" className="h-full w-full object-cover" />
                ) : (
                  <User size={48} />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera size={28} />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => handlePhoto(e.target.files?.[0])}
                />
              </label>

              {/* Info */}
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-brand-yellow">Conta ativa</p>
                <h2 className="mt-2 text-3xl font-black text-white">{profile.name}</h2>
                <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-400">
                  <Mail size={16} className="text-brand-yellow" />
                  {profile.email}
                </p>
                {profile.phone && (
                  <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-400">
                    <Phone size={16} className="text-brand-yellow" />
                    {profile.phone}
                  </p>
                )}
                {profile.twoFactorEnabled && (
                  <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-green-500/20 px-3 py-1 text-xs font-bold text-green-500">
                    <Check size={14} />
                    2FA Ativado
                  </p>
                )}
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <button
                onClick={() => setActiveTab("security")}
                className="group flex items-center gap-2 rounded-lg border border-brand-yellow/30 bg-brand-yellow/10 px-4 py-3 text-sm font-bold text-brand-yellow transition-all duration-300 hover:border-brand-yellow/60 hover:bg-brand-yellow/20 hover:scale-105"
              >
                <Lock size={16} />
                <span className="hidden sm:inline">Segurança</span>
              </button>
              <button
                onClick={deleteAccount}
                disabled={loading}
                className="group grid h-11 w-11 place-items-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-500 transition-all duration-300 hover:bg-red-500/20 hover:scale-105 hover:border-red-500/60 disabled:opacity-50"
                title="Deletar conta"
              >
                {loading ? <Loader size={18} className="animate-spin" /> : <Trash2 size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Abas */}
        <div className="mb-8 border-b border-slate-700 overflow-x-auto">
          <div className="flex gap-1">
            {[
              { id: "overview", label: "Visão geral", icon: User },
              { id: "security", label: "Segurança", icon: Lock },
              { id: "preferences", label: "Preferências", icon: Zap },
              { id: "sessions", label: "Sessões", icon: Smartphone },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as ActiveTab)}
                className={`flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-black uppercase transition-all duration-300 whitespace-nowrap ${
                  activeTab === id
                    ? "border-brand-yellow text-brand-yellow"
                    : "border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-600"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="animate-fadeIn">
          {/* Aba: Visão Geral */}
          {activeTab === "overview" && (
            <form onSubmit={saveProfile} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Nome */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-300">
                    <User size={14} />
                    Nome
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 transition-all duration-300"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-300">
                    <Mail size={14} />
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 transition-all duration-300"
                    required
                  />
                </div>

                {/* Telefone */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-300">
                    <Phone size={14} />
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 transition-all duration-300"
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-300">
                    <Globe size={14} />
                    Status da conta
                  </label>
                  <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3">
                    <Check className="text-green-500 animate-pulse" size={18} />
                    <span className="font-bold text-white">Verificado</span>
                  </div>
                </div>
              </div>

              {/* Newsletter */}
              <label className="flex items-start gap-3 rounded-lg border border-slate-700 bg-slate-800/50 p-4 cursor-pointer hover:bg-slate-800/70 transition-all duration-300">
                <input
                  type="checkbox"
                  checked={profile.newsletter}
                  onChange={(e) => setProfile({ ...profile, newsletter: e.target.checked })}
                  className="mt-1 h-4 w-4 accent-brand-yellow cursor-pointer"
                />
                <p className="text-sm font-semibold text-slate-400">
                  Receber novidades, dicas e oportunidades da Nova Bll do Brasil por email.
                </p>
              </label>

              {/* Botão Salvar */}
              <button
                type="submit"
                disabled={loading}
                className="btn-hero w-full flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:scale-100"
              >
                {saved ? (
                  <>
                    <Check size={18} /> Salvo com sucesso
                  </>
                ) : loading ? (
                  <>
                    <Loader size={18} className="animate-spin" /> Salvando...
                  </>
                ) : (
                  <>
                    <Check size={18} /> Salvar alterações
                  </>
                )}
              </button>
            </form>
          )}

          {/* Aba: Segurança */}
          {activeTab === "security" && (
            <div className="space-y-6">
              {/* 2FA */}
              <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 transition-all duration-300 hover:border-slate-600">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="flex items-center gap-2 text-lg font-black text-white">
                      <Smartphone size={20} className="text-brand-yellow" />
                      Autenticação em duas etapas
                    </h3>
                    <p className="mt-2 text-sm text-slate-400">Adicione uma camada extra de segurança à sua conta.</p>
                  </div>
                  <div className={`flex items-center gap-2 rounded-lg px-3 py-1.5 ${profile.twoFactorEnabled ? "bg-green-500/20" : "bg-red-500/20"}`}>
                    <span className={`h-2 w-2 rounded-full ${profile.twoFactorEnabled ? "bg-green-500" : "bg-red-500"}`} />
                    <span className={`text-xs font-bold ${profile.twoFactorEnabled ? "text-green-500" : "text-red-500"}`}>
                      {profile.twoFactorEnabled ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </div>

                {!show2FASetup ? (
                  profile.twoFactorEnabled ? (
                    <button
                      onClick={handleDisable2FA}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-500/20 transition-all duration-300"
                    >
                      <Lock size={16} />
                      Desativar 2FA
                    </button>
                  ) : (
                    <button
                      onClick={handleEnable2FA}
                      className="inline-flex items-center gap-2 rounded-lg border border-brand-yellow/50 bg-brand-yellow/10 px-4 py-2 text-sm font-bold text-brand-yellow hover:bg-brand-yellow/20 transition-all duration-300 hover:scale-105"
                    >
                      <Lock size={16} />
                      Ativar 2FA
                    </button>
                  )
                ) : (
                  <div className="space-y-4 animate-slideDown">
                    <p className="text-sm text-slate-400">
                      Escaneie este código QR com seu app autenticador ou insira o código manualmente:
                    </p>
                    <div className="bg-white p-4 rounded-lg w-fit mx-auto">
                      <div className="w-32 h-32 bg-slate-300 flex items-center justify-center rounded">
                        <span className="text-xs text-slate-600">QR Code</span>
                      </div>
                    </div>
                    <form onSubmit={handleVerify2FA} className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-400 block mb-2">Digite o código de 6 dígitos:</label>
                        <input
                          type="text"
                          maxLength={6}
                          value={twoFactorCode}
                          onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ""))}
                          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white text-center text-2xl tracking-widest focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20"
                          placeholder="000000"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={verifying2FA}
                          className="btn-hero flex-1 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 disabled:opacity-50"
                        >
                          {verifying2FA ? (
                            <>
                              <Loader size={16} className="animate-spin" /> Verificando...
                            </>
                          ) : (
                            <>
                              <Check size={16} /> Ativar
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShow2FASetup(false);
                            setTwoFactorCode("");
                          }}
                          className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 font-bold text-slate-300 hover:bg-slate-700 transition-all duration-300"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* Mudar Senha */}
              <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 transition-all duration-300 hover:border-slate-600">
                <h3 className="flex items-center gap-2 text-lg font-black text-white mb-6">
                  <Lock size={20} className="text-brand-yellow" />
                  Mudar senha
                </h3>

                {!showPasswordChange ? (
                  <button
                    onClick={() => setShowPasswordChange(true)}
                    className="inline-flex items-center gap-2 rounded-lg border border-brand-yellow/50 bg-brand-yellow/10 px-4 py-2 text-sm font-bold text-brand-yellow hover:bg-brand-yellow/20 transition-all duration-300 hover:scale-105"
                  >
                    <Lock size={16} />
                    Alterar senha
                  </button>
                ) : (
                  <form onSubmit={handleChangePassword} className="space-y-4 animate-slideDown">
                    {passwordError && (
                      <div className="flex items-start gap-3 rounded-lg border border-red-500/50 bg-red-500/10 p-3">
                        <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-bold text-red-500">{passwordError}</p>
                      </div>
                    )}

                    {/* Senha Atual */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-slate-400">Senha atual</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 pr-12 text-white focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 transition-all duration-300"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* Nova Senha */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-slate-400">Nova senha</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setPasswordStrength(validatePasswordStrength(e.target.value));
                        }}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 transition-all duration-300"
                        placeholder="••••••••"
                      />
                      {newPassword && (
                        <div className="space-y-2">
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                  i < passwordStrength.score ? passwordStrength.color.replace("text-", "bg-") : "bg-slate-700"
                                }`}
                              />
                            ))}
                          </div>
                          <p className={`text-xs font-bold ${passwordStrength.color}`}>{passwordStrength.label}</p>
                        </div>
                      )}
                    </div>

                    {/* Confirmar Senha */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-slate-400">Confirmar nova senha</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 transition-all duration-300"
                        placeholder="••••••••"
                      />
                    </div>

                    {/* Botões */}
                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-hero flex-1 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <Loader size={16} className="animate-spin" /> Atualizando...
                          </>
                        ) : (
                          <>
                            <Check size={16} /> Atualizar
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordChange(false);
                          setCurrentPassword("");
                          setNewPassword("");
                          setConfirmPassword("");
                          setPasswordError("");
                        }}
                        className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 font-bold text-slate-300 hover:bg-slate-700 transition-all duration-300"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Info de Segurança */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 transition-all duration-300 hover:border-slate-600">
                  <p className="text-xs font-bold uppercase text-slate-400">Última alteração de senha</p>
                  <p className="mt-2 text-lg font-black text-white">
                    {profile.passwordLastChanged
                      ? new Date(profile.passwordLastChanged).toLocaleDateString("pt-BR")
                      : "Nunca"}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 transition-all duration-300 hover:border-slate-600">
                  <p className="text-xs font-bold uppercase text-slate-400">Status de segurança</p>
                  <p className="mt-2 text-lg font-black text-green-500 flex items-center gap-2">
                    <Check size={18} /> Seguro
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Aba: Preferências */}
          {activeTab === "preferences" && (
            <div className="space-y-6">
              <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 transition-all duration-300 hover:border-slate-600">
                <h3 className="text-lg font-black text-white mb-6">Notificações por email</h3>
                <div className="space-y-4">
                  {[
                    { key: "newsUpdates", label: "Novidades e atualizações", description: "Receba as últimas notícias" },
                    { key: "promotions", label: "Ofertas e promoções", description: "Aproveite descontos exclusivos" },
                    { key: "weeklyReports", label: "Relatórios semanais", description: "Resuma semanal de atividades" },
                    { key: "orderConfirmation", label: "Confirmação de pedidos", description: "Notificações de pedidos importantes" },
                  ].map((item) => (
                    <label key={item.key} className="flex items-start gap-3 rounded-lg border border-slate-700 bg-slate-800/50 p-4 cursor-pointer hover:bg-slate-800 transition-all duration-300">
                      <input
                        type="checkbox"
                        checked={preferences[item.key as keyof typeof preferences]}
                        onChange={(e) => setPreferences({ ...preferences, [item.key]: e.target.checked })}
                        className="mt-1 h-4 w-4 accent-brand-yellow cursor-pointer"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-slate-300">{item.label}</p>
                        <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <button
                  onClick={savePreferences}
                  disabled={loading}
                  className="btn-hero mt-6 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader size={16} className="animate-spin" /> Salvando...
                    </>
                  ) : (
                    <>
                      <Check size={16} /> Salvar preferências
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Aba: Sessões */}
          {activeTab === "sessions" && (
            <div className="space-y-4">
              {sessions.length > 0 ? (
                sessions.map((session) => (
                  <div key={session.id} className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 transition-all duration-300 hover:border-slate-600 hover:shadow-lg hover:shadow-brand-yellow/5 animate-fadeIn">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4 flex-1">
                        <div className="grid h-12 w-12 place-items-center rounded-lg bg-slate-700 flex-shrink-0">
                          <Smartphone size={20} className="text-brand-yellow" />
                        </div>
                        <div>
                          <p className="font-bold text-white">{session.device}</p>
                          <p className="text-xs text-slate-400">{session.browser}</p>
                          <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                            <Globe size={12} />
                            {session.location}
                          </p>
                          <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                            <Clock size={12} />
                            Ativo: {session.lastActive}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {session.isCurrentSession ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-500/20 px-3 py-1.5 text-xs font-bold text-green-500 animate-pulse">
                            <Check size={14} />
                            Sessão atual
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSessionLogout(session.id)}
                            className="text-xs font-bold text-red-500 hover:text-red-400 transition-colors flex items-center gap-1 hover:bg-red-500/10 px-3 py-1.5 rounded-lg"
                          >
                            <LogOut size={14} /> Desconectar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-8 text-center">
                  <Smartphone size={32} className="text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Nenhuma sessão ativa</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Exportar Dados */}
        <div className="mt-12 rounded-lg border border-slate-700 bg-slate-800/50 p-6 transition-all duration-300 hover:border-slate-600">
          <h3 className="flex items-center gap-2 text-lg font-black text-white mb-2">
            <Download size={20} className="text-brand-yellow" />
            Dados da sua conta
          </h3>
          <p className="mt-2 text-sm text-slate-400 mb-6">Baixe uma cópia de todos seus dados pessoais em formato JSON para arquivo pessoal ou portabilidade.</p>
          <button
            onClick={exportUserData}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-sm font-bold text-slate-300 hover:bg-slate-800 hover:border-slate-500 transition-all duration-300 hover:scale-105"
          >
            <Download size={16} />
            Exportar dados
          </button>
        </div>
      </section>

      {/* Estilos de Animação */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </PageShell>
  );
}