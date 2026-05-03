import { useState, FormEvent, useEffect, useMemo, useContext } from "react";
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
  Shield,
  Users,
  Zap,
  Globe,
} from "lucide-react";
import { toast } from "sonner";

import { LanguageContext, useTranslation } from "@/i18n";
import { useTheme } from "next-themes";

// Types
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

// Validation helpers
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STUDENT_ID_REGEX = /^STU\d+$/i;

function getPasswordStrength(pwd: string): number {
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return Math.min(score, 4);
}

const STRENGTH_LABELS = ["", "Weak", "Medium", "Strong", "Very Strong"];
const STRENGTH_COLORS = [
  "bg-zinc-300 dark:bg-zinc-700",
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-emerald-500",
];

export default function RegisterPage() {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const { language: currentLanguage, setLanguage } = useContext(LanguageContext);
  const { theme, setTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
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

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light";
    if (savedTheme) setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const isDark = theme === "dark";

  // Validation
  const errors: FormErrors = useMemo(() => {
    const e: FormErrors = {};

    if (formData.fullName.trim().length > 0 && formData.fullName.trim().length < 2) {
      e.fullName = t("register.name_too_short");
    }
    if (formData.email.length > 0 && !EMAIL_REGEX.test(formData.email)) {
      e.email = t("register.invalid_email");
    }
    if (formData.studentId.length > 0 && !STUDENT_ID_REGEX.test(formData.studentId)) {
      e.studentId = t("register.invalid_student_id");
    }
    if (formData.password.length > 0 && formData.password.length < 8) {
      e.password = t("register.password_too_short");
    }
    if (formData.confirmPassword.length > 0 && formData.confirmPassword !== formData.password) {
      e.confirmPassword = t("register.password_mismatch");
    }
    return e;
  }, [formData, t]);

  const getStatus = (field: keyof FormData): FieldStatus => {
    const value = formData[field];
    if (typeof value === "boolean") return value ? "valid" : "idle";
    if (!value) return "idle";
    if (errors[field as keyof FormErrors]) return "invalid";
    return "valid";
  };

  const isFormValid = useMemo(() => {
    const requiredFilled =
      formData.fullName.trim().length >= 2 &&
      EMAIL_REGEX.test(formData.email) &&
      formData.password.length >= 8 &&
      formData.confirmPassword === formData.password &&
      formData.acceptTerms;
    const studentIdOk = formData.studentId.length === 0 || STUDENT_ID_REGEX.test(formData.studentId);
    return requiredFilled && studentIdOk;
  }, [formData]);

  const pwdStrength = getPasswordStrength(formData.password);

  // Handlers
  const handleChange = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;
    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      // Mock registration - simulate API call
      toast.success(t("register.success_message"));
      navigate("/login");
    } catch (error: any) {
      toast.error(t("register.error_message"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Languages
  const languages = [
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "en", label: "English", flag: "🇺🇸" },
  ];

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }
    },
  };

  // Theme tokens
  const tTokens = isDark
    ? {
      bg: "#0a0612",
      bgSecondary: "#0f0a1f",
      text: "text-white",
      textMuted: "text-white/50",
      textFaint: "text-white/40",
      textGhost: "text-white/25",
      cardBg: "bg-white/[0.03]",
      cardBorder: "border-white/10",
      inputBg: "bg-white/[0.04]",
      inputBorder: "border-white/10",
      inputPlaceholder: "placeholder:text-white/25",
      divider: "from-transparent to-white/10",
      chipBg: "bg-white/[0.04]",
      chipBorder: "border-white/10",
      chipText: "text-white/70",
      chipHoverText: "hover:text-white",
      chipHoverBorder: "hover:border-white/20",
      gridLines: "rgba(255,255,255,0.06)",
      sectionBorder: "border-white/5",
    }
    : {
      bg: "#faf8ff",
      bgSecondary: "#f3eeff",
      text: "text-slate-900",
      textMuted: "text-slate-600",
      textFaint: "text-slate-500",
      textGhost: "text-slate-400",
      cardBg: "bg-white/60",
      cardBorder: "border-violet-200/60",
      inputBg: "bg-white/80",
      inputBorder: "border-violet-200/70",
      inputPlaceholder: "placeholder:text-slate-400",
      divider: "from-transparent to-violet-300/40",
      chipBg: "bg-white/70",
      chipBorder: "border-violet-200/60",
      chipText: "text-slate-700",
      chipHoverText: "hover:text-slate-900",
      chipHoverBorder: "hover:border-violet-300",
      gridLines: "rgba(139,92,246,0.08)",
      sectionBorder: "border-violet-200/40",
    };

  return (
    <div
      className={`min-h-screen w-full ${tTokens.text} font-[Inter,ui-sans-serif,system-ui] antialiased overflow-hidden relative transition-colors duration-700`}
      style={{ backgroundColor: tTokens.bg }}
    >
      {/* Grain overlay */}
      <div
        className={`pointer-events-none fixed inset-0 z-50 ${isDark ? "opacity-[0.025]" : "opacity-[0.035]"
          } mix-blend-overlay`}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      <GlobalParticles isDark={isDark} />

      {/* Top Right Actions */}
      <div className="fixed top-6 right-6 z-50 flex gap-2">
        {/* Language Switcher */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className={`flex items-center gap-2 rounded-full backdrop-blur-md border px-3 py-2 text-xs font-medium transition-colors ${isDark
              ? "bg-white/[0.04] border-white/10 text-white/70 hover:text-white hover:border-white/20"
              : "bg-white/70 border-violet-200/60 text-slate-700 hover:text-slate-900 hover:border-violet-300"
              }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>{language === "fr" ? "FR" : "EN"}</span>
          </motion.button>

          <AnimatePresence>
            {showLanguageMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`absolute right-0 mt-2 w-36 rounded-xl backdrop-blur-md border overflow-hidden ${isDark
                  ? "bg-gray-900/95 border-white/10"
                  : "bg-white/95 border-violet-200/60 shadow-lg"
                  }`}
              >
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code as "fr" | "en");
                      setShowLanguageMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${language === lang.code
                      ? isDark
                        ? "bg-violet-500/20 text-violet-400"
                        : "bg-violet-100 text-violet-700"
                      : isDark
                        ? "text-white/70 hover:bg-white/10"
                        : "text-slate-700 hover:bg-violet-50"
                      }`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="flex-1 text-left">{lang.label}</span>
                    {language === lang.code && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className={`flex items-center gap-2 rounded-full backdrop-blur-md border px-3 py-2 text-xs font-medium transition-colors ${isDark
            ? "bg-white/[0.04] border-white/10 text-white/70 hover:text-white hover:border-white/20"
            : "bg-white/70 border-violet-200/60 text-slate-700 hover:text-slate-900 hover:border-violet-300"
            }`}
        >
          {isDark ? <Sun className="h-3.5 w-3.5 text-amber-300" /> : <Moon className="h-3.5 w-3.5 text-violet-500" />}
          <span>{isDark ? "Light" : "Dark"}</span>
        </motion.button>
      </div>

      {/* Split Screen */}
      <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Left Side - Form */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative flex items-center justify-center px-6 py-12 lg:px-16"
        >
          <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-violet-600/25 blur-[120px]" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-pink-600/15 blur-[100px]" />

          <div className="w-full max-w-md">
            {/* Logo */}
            <motion.div variants={itemVariants} className="mb-10">
              <motion.h1
                initial={{ filter: "blur(8px)", opacity: 0 }}
                animate={{ filter: "blur(0px)", opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-3xl font-black tracking-tight bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent inline-block"
              >
                EasyVote
              </motion.h1>
              <motion.div variants={itemVariants}>
                <Link
                  to="/"
                  className={`mt-3 inline-flex items-center gap-1.5 text-sm ${tTokens.textFaint} ${isDark ? "hover:text-white/70" : "hover:text-slate-700"
                    } transition-colors group`}
                >
                  <ArrowRight className="h-3.5 w-3.5 rotate-180 transition-transform group-hover:-translate-x-0.5" />
                  {t("register.back_to_home")}
                </Link>
              </motion.div>
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={itemVariants} className="text-4xl lg:text-5xl font-bold tracking-tight mb-3">
              {t("register.title")} <span className="inline-block">🚀</span>
            </motion.h1>
            <motion.p variants={itemVariants} className={`text-base mb-8 ${tTokens.textMuted}`}>
              {t("register.subtitle")}
            </motion.p>

            {/* Form with glow effect */}
            <motion.div variants={itemVariants} className="relative">
              <AnimatePresence>
                {isFocused && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className="pointer-events-none absolute -inset-2 rounded-2xl"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(168,85,247,0.55), rgba(236,72,153,0.45), rgba(168,85,247,0.55))",
                      filter: "blur(24px)",
                    }}
                  />
                )}
              </AnimatePresence>

              <form
                onSubmit={handleSubmit}
                onFocus={() => setIsFocused(true)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setIsFocused(false);
                  }
                }}
                className={`relative rounded-2xl border ${tTokens.cardBorder} ${tTokens.cardBg} backdrop-blur-md p-7 sm:p-8 transition-shadow duration-500 space-y-4`}
                style={{
                  boxShadow: isFocused
                    ? "0 12px 48px -8px rgba(168,85,247,0.55)"
                    : "0 8px 32px -8px rgba(168,85,247,0.2)",
                }}
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/40 to-transparent" />

                {/* Full Name */}
                <Field
                  label={t("register.full_name")}
                  icon={<User className="h-4 w-4" />}
                  status={touched.fullName ? getStatus("fullName") : "idle"}
                  error={touched.fullName ? errors.fullName : undefined}

                >
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    onBlur={() => handleBlur("fullName")}
                    placeholder={t("register.name_placeholder")}
                    className="w-full bg-transparent outline-none text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                    autoComplete="name"
                  />
                </Field>

                {/* Email */}
                <Field
                  label={t("register.email")}
                  icon={<Mail className="h-4 w-4" />}
                  status={touched.email ? getStatus("email") : "idle"}
                  error={touched.email ? errors.email : undefined}

                >
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    onBlur={() => handleBlur("email")}
                    placeholder={t("register.email_placeholder")}
                    className="w-full bg-transparent outline-none text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                    autoComplete="email"
                  />
                </Field>

                {/* Student ID (optional) */}
                <Field
                  label={t("register.student_id")}
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
                    placeholder={t("register.student_id_placeholder")}
                    className="w-full bg-transparent outline-none text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-500 uppercase"
                  />
                </Field>

                {/* Password */}
                <div>
                  <Field
                    label={t("register.password")}
                    icon={<Lock className="h-4 w-4" />}
                    status={touched.password ? getStatus("password") : "idle"}
                    error={touched.password ? errors.password : undefined}
                    trailing={
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
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
                      className="w-full bg-transparent outline-none text-sm"
                      autoComplete="new-password"
                    />
                  </Field>

                  {/* Password strength indicator */}
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
                              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= pwdStrength ? STRENGTH_COLORS[pwdStrength] : "bg-zinc-200 dark:bg-zinc-800"
                                }`}
                            />
                          ))}
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {t("register.password_strength")}:{" "}
                          <span className="font-medium">
                            {STRENGTH_LABELS[pwdStrength]}
                          </span>
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Confirm Password */}
                <Field
                  label={t("register.confirm_password")}
                  icon={<Lock className="h-4 w-4" />}
                  status={touched.confirmPassword ? getStatus("confirmPassword") : "idle"}
                  error={touched.confirmPassword ? errors.confirmPassword : undefined}
                  trailing={
                    <button
                      type="button"
                      onClick={() => setShowConfirm((s) => !s)}
                      className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
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
                    className="w-full bg-transparent outline-none text-sm"
                    autoComplete="new-password"
                  />
                </Field>

                {/* Terms Checkbox */}
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
                    {t("register.accept_terms")}{" "}
                    <a href="#" className="text-violet-600 dark:text-violet-400 hover:underline font-medium">
                      {t("register.terms_link")}
                    </a>
                  </span>
                </label>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className="group relative w-full rounded-xl py-3 px-5 font-semibold text-sm text-white overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed
                             bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500
                             shadow-[0_8px_24px_-6px_rgba(168,85,247,0.55)]
                             hover:shadow-[0_14px_36px_-4px_rgba(168,85,247,0.75)]
                             transition-shadow duration-300"
                >
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)",
                    }}
                    animate={{ x: ["-120%", "120%"] }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      repeatDelay: 0.8,
                    }}
                  />
                  <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                  <span className="relative flex items-center justify-center gap-2">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t("register.creating")}
                      </>
                    ) : (
                      <>
                        {t("register.create_button")}
                        <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                      </>
                    )}
                  </span>
                </motion.button>

                {/* Separator */}
                <div className="my-4 flex items-center gap-3">
                  <div className={`h-px flex-1 bg-gradient-to-r ${tTokens.divider}`} />
                  <span className={`text-xs ${tTokens.textGhost} uppercase tracking-wider`}>
                    {t("register.or")}
                  </span>
                  <div className={`h-px flex-1 bg-gradient-to-l ${tTokens.divider}`} />
                </div>

                {/* Login Link */}
                <p className={`text-center text-sm ${tTokens.textMuted}`}>
                  {t("register.have_account")}{" "}
                  <Link
                    to="/login"
                    className="text-violet-400 hover:text-fuchsia-400 font-medium transition-colors inline-flex items-center gap-1 group"
                  >
                    {t("register.login_link")}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </p>
              </form>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Visual */}
        <motion.section
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className={`relative hidden lg:flex flex-col items-center justify-center overflow-hidden border-l ${tTokens.sectionBorder}`}
          style={{ backgroundColor: tTokens.bgSecondary }}
        >
          <Aurora isDark={isDark} />

          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(${tTokens.gridLines} 1px, transparent 1px), linear-gradient(90deg, ${tTokens.gridLines} 1px, transparent 1px)`,
              backgroundSize: "56px 56px",
              maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
              WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
            }}
          />

          <div className="relative z-10 flex flex-col items-center gap-16 px-12">
            <PulsingOrb />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
              className="text-center max-w-sm"
            >
              <h3 className={`text-2xl font-bold ${isDark ? "text-white/90" : "text-slate-800"} leading-tight`}>
                {t("register.right_title")}{" "}
                <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                  {t("register.right_title_highlight")}
                </span>
              </h3>
              <p className={`mt-2 text-sm ${tTokens.textMuted}`}>
                {t("register.right_subtitle")}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="flex flex-wrap justify-center gap-2.5"
            >
              <TrustChip icon={<Shield className="h-3.5 w-3.5" />} label={t("register.secure_vote")} t={tTokens} />
              <TrustChip icon={<Users className="h-3.5 w-3.5" />} label={t("register.students")} t={tTokens} />
              <TrustChip icon={<Zap className="h-3.5 w-3.5" />} label={t("register.certified")} t={tTokens} />
            </motion.div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}



// Helper Components (same as LoginPage)
function GlobalParticles({ isDark }: { isDark: boolean }) {
  const particles = Array.from({ length: 30 }).map((_, i) => {
    const rand = ((i * 9301 + 49297) % 233280) / 233280;
    const rand2 = ((i * 1103 + 12345) % 100) / 100;
    const rand3 = ((i * 7919 + 6543) % 100) / 100;
    return {
      x: `${rand * 100}%`,
      y: `${rand2 * 100}%`,
      size: 1 + rand3 * 3,
      delay: rand * 5,
      duration: 8 + rand2 * 8,
      drift: 20 + rand3 * 40,
      hue: rand > 0.5 ? "168,85,247" : rand > 0.25 ? "236,72,153" : "217,70,239",
    };
  });

  return (
    <div className="pointer-events-none fixed inset-0 z-[5]">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, isDark ? 0.7 : 0.4, 0],
            y: [0, -p.drift, 0],
            x: [0, (i % 2 === 0 ? 1 : -1) * (p.drift / 3), 0],
          }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            boxShadow: `0 0 ${p.size * 4}px ${p.size}px rgba(${p.hue}, ${isDark ? 0.6 : 0.4})`,
            backgroundColor: `rgba(${p.hue}, 1)`,
          }}
          className="absolute rounded-full"
        />
      ))}
    </div>
  );
}

function Aurora({ isDark }: { isDark: boolean }) {
  const opacity = isDark ? 0.45 : 0.3;
  return (
    <div className="pointer-events-none absolute inset-0">
      <motion.div
        animate={{ x: [0, 60, -30, 0], y: [0, -40, 30, 0], scale: [1, 1.1, 0.95, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 h-[420px] w-[420px] rounded-full blur-[120px]"
        style={{ backgroundColor: `rgba(168,85,247,${opacity})` }}
      />
      <motion.div
        animate={{ x: [0, -50, 40, 0], y: [0, 50, -20, 0], scale: [1, 0.9, 1.15, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 right-1/4 h-[380px] w-[380px] rounded-full blur-[120px]"
        style={{ backgroundColor: `rgba(217,70,239,${opacity})` }}
      />
      <motion.div
        animate={{ x: [0, 30, -40, 0], y: [0, -30, 40, 0], scale: [1, 1.05, 0.95, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 left-1/3 h-[340px] w-[340px] rounded-full blur-[120px]"
        style={{ backgroundColor: `rgba(236,72,153,${opacity * 0.8})` }}
      />
    </div>
  );
}

function PulsingOrb() {
  return (
    <div className="relative h-[340px] w-[340px] flex items-center justify-center">
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute h-[340px] w-[340px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(168,85,247,0.5) 0%, rgba(168,85,247,0.15) 40%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <motion.div
        animate={{ scale: [1.05, 1.2, 1.05], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        className="absolute h-[240px] w-[240px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(217,70,239,0.7) 0%, rgba(168,85,247,0.3) 50%, transparent 80%)",
          filter: "blur(28px)",
        }}
      />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute h-[200px] w-[200px] rounded-full border border-violet-300/30"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute h-[260px] w-[260px] rounded-full border border-pink-300/20"
        style={{ borderStyle: "dashed" }}
      />
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="relative h-[160px] w-[160px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, #ffffff 0%, #e9d5ff 15%, #c084fc 35%, #a855f7 60%, #7e22ce 85%, #581c87 100%)",
          boxShadow:
            "0 0 60px 10px rgba(168,85,247,0.6), 0 0 120px 20px rgba(168,85,247,0.4), inset -10px -10px 30px rgba(88,28,135,0.6), inset 10px 10px 30px rgba(255,255,255,0.4)",
        }}
      />
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <motion.div
            key={i}
            animate={{ rotate: 360 }}
            transition={{ duration: 10 + i * 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute h-full w-full"
          >
            <motion.div
              animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2 + (i % 3), repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
              className="absolute h-2 w-2 rounded-full bg-fuchsia-300"
              style={{
                left: `calc(50% + ${Math.cos(angle) * 130}px - 4px)`,
                top: `calc(50% + ${Math.sin(angle) * 130}px - 4px)`,
                boxShadow: "0 0 12px 3px rgba(217,70,239,0.8)",
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}

function TrustChip({ icon, label, t }: { icon: React.ReactNode; label: string; t: any }) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      className={`flex items-center gap-2 rounded-full border ${t.chipBorder} ${t.chipBg} backdrop-blur-md px-3.5 py-1.5 text-xs ${t.chipText} ${t.chipHoverText} ${t.chipHoverBorder} transition-colors`}
    >
      <span className="text-fuchsia-400">{icon}</span>
      {label}
    </motion.div>
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