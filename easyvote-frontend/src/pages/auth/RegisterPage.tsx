import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  IdCard,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Loader2,
  Sun,
  Moon,
  ArrowRight,
  Check,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/services/authService";

/**
 * RegisterPage — EasyVote
 * Page d'inscription avec exactement le même design system que la LoginPage :
 * - Split screen 50/50 (formulaire à gauche, visuel 3D à droite)
 * - Logo EasyVote en gradient indigo→violet→pink
 * - Glassmorphism, aurora animée, dark mode, Framer Motion
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface FormData {
  fullName: string;
  email: string;
  studentId: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  studentId?: string;
  password?: string;
  confirmPassword?: string;
  acceptTerms?: string;
}

type FieldStatus = "idle" | "valid" | "invalid";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers de validation
// ─────────────────────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STUDENT_ID_REGEX = /^STU\d+$/;

/** Calcule la force du mot de passe sur 4 niveaux (0 = vide, 4 = très fort) */
function getPasswordStrength(pwd: string): number {
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return Math.min(score, 4);
}

const STRENGTH_LABELS = ["", "Faible", "Moyen", "Fort", "Très fort"];
const STRENGTH_COLORS = [
  "bg-zinc-300 dark:bg-zinc-700",
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-emerald-500",
];

// ─────────────────────────────────────────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  // ─── State ──────────────────────────────────────────────────────────────
  const [isDark, setIsDark] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<keyof FormData, boolean>>({
    fullName: false,
    email: false,
    studentId: false,
    password: false,
    confirmPassword: false,
    acceptTerms: false,
  });

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    studentId: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  // ─── Validation live ────────────────────────────────────────────────────
  const errors: FormErrors = useMemo(() => {
    const e: FormErrors = {};

    if (formData.fullName.trim().length > 0 && formData.fullName.trim().length < 2) {
      e.fullName = "Au moins 2 caractères";
    }
    if (formData.email.length > 0 && !EMAIL_REGEX.test(formData.email)) {
      e.email = "Format email invalide";
    }
    if (formData.studentId.length > 0 && !STUDENT_ID_REGEX.test(formData.studentId)) {
      e.studentId = "Format attendu : STU suivi de chiffres";
    }
    if (formData.password.length > 0 && formData.password.length < 8) {
      e.password = "Au moins 8 caractères";
    }
    if (
      formData.confirmPassword.length > 0 &&
      formData.confirmPassword !== formData.password
    ) {
      e.confirmPassword = "Les mots de passe ne correspondent pas";
    }
    return e;
  }, [formData]);

  /** Renvoie le statut visuel d'un champ (idle / valid / invalid) */
  const getStatus = (field: keyof FormData): FieldStatus => {
    const value = formData[field];
    if (typeof value === "boolean") return value ? "valid" : "idle";
    if (!value) return "idle";
    if (errors[field as keyof FormErrors]) return "invalid";
    if (field === "studentId" && !value) return "idle";
    return "valid";
  };

  // Le formulaire est valide si tous les champs requis sont remplis et sans erreur
  const isFormValid = useMemo(() => {
    const requiredFilled =
      formData.fullName.trim().length >= 2 &&
      EMAIL_REGEX.test(formData.email) &&
      formData.password.length >= 8 &&
      formData.confirmPassword === formData.password &&
      formData.acceptTerms;
    const studentIdOk =
      formData.studentId.length === 0 || STUDENT_ID_REGEX.test(formData.studentId);
    return requiredFilled && studentIdOk;
  }, [formData]);

  // ─── Force du mot de passe ──────────────────────────────────────────────
  const pwdStrength = getPasswordStrength(formData.password);

  // ─── Dark mode toggle ───────────────────────────────────────────────────
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // ─── Handlers ───────────────────────────────────────────────────────────
  const handleChange = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await authService.register({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        studentId: formData.studentId || undefined,
      });
      toast.success(response.message || "Compte créé ! Vérifie ton email pour le code OTP.");
      // Redirect to OTP verification page with email in state
      navigate("/verify-otp", { state: { email: formData.email } });
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        "Erreur lors de l'inscription. Réessaye.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Animations Framer Motion (stagger) ─────────────────────────────────
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-full bg-white dark:bg-[#0a0613] text-zinc-900 dark:text-zinc-100 transition-colors duration-500 font-sans antialiased overflow-hidden relative">
      {/* ═══ AURORA BACKGROUND ═══ */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-500/30 dark:bg-indigo-600/30 blur-[120px] animate-aurora-1" />
        <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-violet-500/30 dark:bg-violet-600/30 blur-[120px] animate-aurora-2" />
        <div className="absolute -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full bg-pink-500/25 dark:bg-pink-600/25 blur-[120px] animate-aurora-3" />
      </div>

      {/* ═══ TOGGLE LIGHT/DARK ═══ */}
      <button
        onClick={() => setIsDark(!isDark)}
        className="fixed top-6 right-6 z-50 h-11 w-11 rounded-full bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-zinc-200/60 dark:border-white/10 flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-lg shadow-zinc-900/5"
        aria-label="Basculer le thème"
      >
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.div
              key="sun"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Sun className="h-5 w-5 text-amber-400" />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Moon className="h-5 w-5 text-indigo-600" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* ═══ SPLIT 50/50 ═══ */}
      <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* ─────────────── LEFT : FORMULAIRE ─────────────── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex items-center justify-center px-6 py-12 lg:px-16"
        >
          <div className="w-full max-w-md">
            {/* Logo */}
            <motion.div variants={itemVariants} className="mb-10 flex items-center gap-2.5">
              <div className="relative">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 shadow-lg shadow-violet-500/30" />
                <div className="absolute inset-0 h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 blur-md opacity-60" />
              </div>
              <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">
                EasyVote
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl lg:text-5xl font-bold tracking-tight mb-3"
            >
              Rejoins-nous <span className="inline-block">🚀</span>
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-zinc-600 dark:text-zinc-400 text-base mb-8"
            >
              Crée ton compte et participe à la démocratie universitaire
            </motion.p>

            {/* ═══ CARD GLASSMORPHISM ═══ */}
            <motion.form
              variants={itemVariants}
              onSubmit={handleSubmit}
              noValidate
              className="rounded-2xl border border-zinc-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-2xl p-6 lg:p-7 shadow-xl shadow-zinc-900/5 dark:shadow-black/40 space-y-4"
            >
              {/* Nom complet */}
              <Field
                label="Nom complet"
                icon={<User className="h-4 w-4" />}
                status={touched.fullName ? getStatus("fullName") : "idle"}
                error={touched.fullName ? errors.fullName : undefined}
              >
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  onBlur={() => handleBlur("fullName")}
                  placeholder="Yasmine Ben Ali"
                  className="w-full bg-transparent outline-none text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                  autoComplete="name"
                />
              </Field>

              {/* Email universitaire */}
              <Field
                label="Email universitaire"
                icon={<Mail className="h-4 w-4" />}
                status={touched.email ? getStatus("email") : "idle"}
                error={touched.email ? errors.email : undefined}
              >
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  placeholder="prenom.nom@univ.tn"
                  className="w-full bg-transparent outline-none text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                  autoComplete="email"
                />
              </Field>

              {/* Numéro étudiant (optionnel) */}
              <Field
                label="Numéro étudiant"
                optional
                icon={<IdCard className="h-4 w-4" />}
                status={touched.studentId ? getStatus("studentId") : "idle"}
                error={touched.studentId ? errors.studentId : undefined}
              >
                <input
                  type="text"
                  value={formData.studentId}
                  onChange={(e) => handleChange("studentId", e.target.value.toUpperCase())}
                  onBlur={() => handleBlur("studentId")}
                  placeholder="STU123456"
                  className="w-full bg-transparent outline-none text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-500 uppercase"
                />
              </Field>

              {/* Mot de passe */}
              <div>
                <Field
                  label="Mot de passe"
                  icon={<Lock className="h-4 w-4" />}
                  status={touched.password ? getStatus("password") : "idle"}
                  error={touched.password ? errors.password : undefined}
                  trailing={
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? "Masquer" : "Afficher"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                >
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    onBlur={() => handleBlur("password")}
                    placeholder="••••••••"
                    className="w-full bg-transparent outline-none text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                    autoComplete="new-password"
                  />
                </Field>

                {/* Indicateur de force du mot de passe */}
                <AnimatePresence>
                  {formData.password.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2.5 overflow-hidden"
                    >
                      <div className="flex gap-1.5 mb-1.5">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= pwdStrength
                                ? STRENGTH_COLORS[pwdStrength]
                                : "bg-zinc-200 dark:bg-zinc-800"
                              }`}
                          />
                        ))}
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Force :{" "}
                        <span
                          className={`font-medium ${pwdStrength === 1
                              ? "text-red-500"
                              : pwdStrength === 2
                                ? "text-orange-500"
                                : pwdStrength === 3
                                  ? "text-yellow-600 dark:text-yellow-500"
                                  : pwdStrength === 4
                                    ? "text-emerald-500"
                                    : ""
                            }`}
                        >
                          {STRENGTH_LABELS[pwdStrength] || "—"}
                        </span>
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Confirmation mot de passe */}
              <Field
                label="Confirmer le mot de passe"
                icon={<Lock className="h-4 w-4" />}
                status={touched.confirmPassword ? getStatus("confirmPassword") : "idle"}
                error={touched.confirmPassword ? errors.confirmPassword : undefined}
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                    tabIndex={-1}
                    aria-label={showConfirm ? "Masquer" : "Afficher"}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              >
                <input
                  type={showConfirm ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  onBlur={() => handleBlur("confirmPassword")}
                  placeholder="••••••••"
                  className="w-full bg-transparent outline-none text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                  autoComplete="new-password"
                />
              </Field>

              {/* Checkbox conditions */}
              <label className="flex items-start gap-2.5 cursor-pointer pt-1 group">
                <span className="relative mt-0.5 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={formData.acceptTerms}
                    onChange={(e) => handleChange("acceptTerms", e.target.checked)}
                    className="peer sr-only"
                  />
                  <span className="block h-4 w-4 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-white/5 peer-checked:bg-gradient-to-br peer-checked:from-indigo-500 peer-checked:via-violet-500 peer-checked:to-pink-500 peer-checked:border-transparent transition-all duration-200" />
                  <Check
                    className={`absolute left-0.5 top-0.5 h-3 w-3 text-white transition-opacity duration-200 ${formData.acceptTerms ? "opacity-100" : "opacity-0"
                      }`}
                    strokeWidth={3}
                  />
                </span>
                <span className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed select-none">
                  J'accepte les{" "}
                  <a href="#" className="text-violet-600 dark:text-violet-400 hover:underline font-medium">
                    conditions d'utilisation
                  </a>{" "}
                  et la politique de confidentialité
                </span>
              </label>

              {/* Bouton submit */}
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="group relative w-full mt-2 h-11 rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
              >
                {/* Shine effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Création en cours...</span>
                  </>
                ) : (
                  <>
                    <span>Créer mon compte</span>
                    <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                  </>
                )}
              </button>
            </motion.form>

            {/* Lien connexion */}
            <motion.p
              variants={itemVariants}
              className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400"
            >
              Déjà un compte ?{" "}
              <Link
                to="/login"
                className="text-violet-600 dark:text-violet-400 font-medium hover:gap-2 inline-flex items-center gap-1 transition-all"
              >
                Se connecter <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.p>
          </div>
        </motion.div>

        {/* ─────────────── RIGHT : VISUEL 3D ─────────────── */}
        <div className="hidden lg:flex relative items-center justify-center overflow-hidden">
          {/* Grille subtile en background */}
          <div className="absolute inset-0 bg-grid opacity-[0.15] dark:opacity-[0.08]" />

          {/* ═══ ORBE PULSANTE + ATOME ═══ */}
          <div className="relative w-[440px] h-[440px] flex items-center justify-center">
            {/* Halo externe */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/20 via-violet-500/20 to-pink-500/20 blur-3xl animate-pulse-slow" />

            {/* Orbe centrale */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-56 w-56 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 shadow-2xl shadow-violet-500/50 animate-orb-pulse"
            >
              {/* Highlight intérieur */}
              <div className="absolute top-6 left-8 h-20 w-20 rounded-full bg-white/40 blur-xl" />
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white/10 to-transparent" />
            </motion.div>

            {/* ═══ 3 CUBES ORBITANTS (effet atome) ═══ */}
            {/* Orbite 1 — horizontale */}
            <div className="absolute inset-0 animate-orbit-1">
              <div className="absolute top-1/2 left-0 -translate-y-1/2 h-7 w-7 rounded-md bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-lg shadow-indigo-500/50 rotate-12 animate-cube-spin" />
            </div>

            {/* Orbite 2 — inclinée */}
            <div className="absolute inset-0 animate-orbit-2">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-6 rounded-md bg-gradient-to-br from-pink-400 to-pink-600 shadow-lg shadow-pink-500/50 -rotate-12 animate-cube-spin-reverse" />
            </div>

            {/* Orbite 3 — autre angle */}
            <div className="absolute inset-0 animate-orbit-3">
              <div className="absolute bottom-0 right-1/4 h-5 w-5 rounded-md bg-gradient-to-br from-violet-400 to-violet-600 shadow-lg shadow-violet-500/50 rotate-45 animate-cube-spin" />
            </div>

            {/* Anneaux orbitaux décoratifs */}
            <div className="absolute inset-0 rounded-full border border-white/10 dark:border-white/10 animate-spin-slow" />
            <div className="absolute inset-8 rounded-full border border-white/5 dark:border-white/5 animate-spin-reverse" />
          </div>

          {/* Texte sous le visuel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="absolute bottom-20 left-0 right-0 text-center px-12"
          >
            <p className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent mb-2">
              Rejoins 10K+ étudiants
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              La démocratie commence ici
            </p>
          </motion.div>
        </div>
      </div>

      {/* ═══ STYLES ═══ */}
      <style>{`
        /* Aurora flottante */
        @keyframes aurora-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(80px, 60px) scale(1.1); }
        }
        @keyframes aurora-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-60px, 80px) scale(1.15); }
        }
        @keyframes aurora-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, -50px) scale(1.1); }
        }
        .animate-aurora-1 { animation: aurora-1 14s ease-in-out infinite; }
        .animate-aurora-2 { animation: aurora-2 16s ease-in-out infinite; }
        .animate-aurora-3 { animation: aurora-3 18s ease-in-out infinite; }

        /* Pulse de l'orbe centrale */
        @keyframes orb-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 25px 60px -10px rgba(139, 92, 246, 0.5); }
          50% { transform: scale(1.04); box-shadow: 0 30px 80px -10px rgba(139, 92, 246, 0.7); }
        }
        .animate-orb-pulse { animation: orb-pulse 4s ease-in-out infinite; }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        .animate-pulse-slow { animation: pulse-slow 5s ease-in-out infinite; }

        /* Orbites des cubes (effet atome) */
        @keyframes orbit-1 {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orbit-2 {
          from { transform: rotate(0deg) rotateX(60deg); }
          to { transform: rotate(360deg) rotateX(60deg); }
        }
        @keyframes orbit-3 {
          from { transform: rotate(0deg) rotateX(-45deg) rotateY(30deg); }
          to { transform: rotate(360deg) rotateX(-45deg) rotateY(30deg); }
        }
        .animate-orbit-1 { animation: orbit-1 8s linear infinite; }
        .animate-orbit-2 { animation: orbit-2 11s linear infinite reverse; }
        .animate-orbit-3 { animation: orbit-3 14s linear infinite; }

        /* Rotation propre des cubes */
        @keyframes cube-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-cube-spin { animation: cube-spin 4s linear infinite; }
        .animate-cube-spin-reverse { animation: cube-spin 5s linear infinite reverse; }

        /* Anneaux décoratifs */
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 30s linear infinite; }
        .animate-spin-reverse { animation: spin-slow 22s linear infinite reverse; }

        /* Grille subtile */
        .bg-grid {
          background-image:
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px);
          background-size: 48px 48px;
          color: rgb(99 102 241);
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sous-composant : Field (input field avec label, icône, statut visuel)
// ─────────────────────────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  icon: React.ReactNode;
  status: FieldStatus;
  error?: string;
  optional?: boolean;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}

function Field({ label, icon, status, error, optional, trailing, children }: FieldProps) {
  // Couleurs de bordure selon le statut
  const borderColor =
    status === "valid"
      ? "border-emerald-400/60 dark:border-emerald-500/50 ring-emerald-400/20"
      : status === "invalid"
        ? "border-red-400/70 dark:border-red-500/60 ring-red-400/20"
        : "border-zinc-200 dark:border-white/10 focus-within:border-violet-400 dark:focus-within:border-violet-500/60 focus-within:ring-violet-400/20";

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
          {label}
          {optional && (
            <span className="ml-1.5 text-[10px] text-zinc-400 dark:text-zinc-500 font-normal">
              (optionnel)
            </span>
          )}
        </label>
        {/* Indicateur de statut */}
        {status === "valid" && (
          <Check className="h-3.5 w-3.5 text-emerald-500" strokeWidth={3} />
        )}
        {status === "invalid" && (
          <AlertCircle className="h-3.5 w-3.5 text-red-500" />
        )}
      </div>

      <div
        className={`flex items-center gap-2.5 px-3.5 h-11 rounded-xl border bg-white/50 dark:bg-white/[0.03] transition-all duration-200 ring-2 ring-transparent focus-within:ring-2 ${borderColor}`}
      >
        <span
          className={`flex-shrink-0 transition-colors ${status === "valid"
              ? "text-emerald-500"
              : status === "invalid"
                ? "text-red-500"
                : "text-zinc-400 dark:text-zinc-500"
            }`}
        >
          {icon}
        </span>
        <div className="flex-1 min-w-0">{children}</div>
        {trailing && <span className="flex-shrink-0">{trailing}</span>}
      </div>

      {/* Message d'erreur animé */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            className="mt-1 text-[11px] text-red-500 dark:text-red-400 overflow-hidden"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}