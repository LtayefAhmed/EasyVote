import { useState, FormEvent, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Shield,
  Users,
  Zap,
  Sun,
  Moon,
  Crown,
  UserCheck,
  GraduationCap,
  Globe,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { LanguageContext, useTranslation } from "@/i18n";
import { useTheme } from "next-themes";

// Comptes de test
const TEST_ACCOUNTS = {
  admin: {
    email: "admin@easyvote.com",
    password: "admin123",
    role: "ADMIN" as const,
    name: "Admin System",
    studentId: null,
    icon: Crown,
    color: "from-red-500 to-rose-500",
  },
  candidate: {
    email: "ahmed@univ.tn",
    password: "candidate123",
    role: "CANDIDATE" as const,
    name: "Ahmed Ltayef",
    studentId: null,
    icon: UserCheck,
    color: "from-indigo-500 to-purple-600",
  },
  student: {
    email: "student@univ.tn",
    password: "student123",
    role: "STUDENT" as const,
    name: "Student User",
    studentId: "STU001",
    icon: GraduationCap,
    color: "from-emerald-500 to-teal-600",
  },
};

export default function LoginPage() {
  const { t, language } = useTranslation();
  const { language: currentLanguage, setLanguage } = useContext(LanguageContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { theme, setTheme } = useTheme();
  const [touched, setTouched] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedTestAccount, setSelectedTestAccount] = useState<string | null>(null);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const navigate = useNavigate();

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

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const showEmailError = touched && email.length > 0 && !isValidEmail;
  const isDark = theme === "dark";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!isValidEmail || password.length < 1) {
      toast.error(t("login.validation_error"));
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));


    if (email === TEST_ACCOUNTS.admin.email && password === TEST_ACCOUNTS.admin.password) {

      toast.success(t("login.welcome") + " " + TEST_ACCOUNTS.admin.name);

      navigate("/admin");
    } else if (email === TEST_ACCOUNTS.candidate.email && password === TEST_ACCOUNTS.candidate.password) {


      navigate("/candidate");
    } else if (email === TEST_ACCOUNTS.student.email && password === TEST_ACCOUNTS.student.password) {

      toast.success(t("login.welcome") + " " + TEST_ACCOUNTS.student.name);

      navigate("/dashboard");
    } else {
      toast.error(t("login.invalid_credentials"));
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
  };

  const fillTestAccount = (accountType: keyof typeof TEST_ACCOUNTS) => {
    const account = TEST_ACCOUNTS[accountType];
    if (account) {
      setEmail(account.email);
      setPassword(account.password);
      setSelectedTestAccount(accountType);
      toast.info(t("login.account_selected"), {
        description: `${account.email}`,
      });
    }
  };

  const languages = [
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "en", label: "English", flag: "🇺🇸" },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };
  const item = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  const themeTokens = isDark
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
      className={`min-h-screen w-full ${themeTokens.text} font-[Inter,ui-sans-serif,system-ui] antialiased overflow-hidden relative transition-colors duration-700`}
      style={{ backgroundColor: themeTokens.bg }}
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

      <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Left Side - Form */}
        <motion.section
          variants={container}
          initial="hidden"
          animate="show"
          className="relative flex flex-col justify-between px-6 py-10 sm:px-12 sm:py-16"
        >
          <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-violet-600/25 blur-[120px]" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-pink-600/15 blur-[100px]" />

          <motion.div variants={item} className="relative z-10">
            <motion.h1
              initial={{ filter: "blur(8px)", opacity: 0 }}
              animate={{ filter: "blur(0px)", opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-3xl font-black tracking-tight bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent inline-block"
            >
              EasyVote
            </motion.h1>
            <motion.div variants={item}>
              <Link
                to="/"
                className={`mt-3 inline-flex items-center gap-1.5 text-sm ${themeTokens.textFaint} ${isDark ? "hover:text-white/70" : "hover:text-slate-700"
                  } transition-colors group`}
              >
                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                {t("login.back_to_home")}
              </Link>
            </motion.div>
          </motion.div>

          <div className="relative z-10 flex flex-col justify-center max-w-md mx-auto w-full py-12">
            <motion.div variants={item} className="mb-10">
              <h2 className={`text-4xl sm:text-5xl font-black tracking-tight leading-[1.05] ${themeTokens.text}`}>
                {t("login.welcome_back")} <span className="inline-block">👋</span>
              </h2>
              <p className={`mt-3 text-base ${themeTokens.textMuted}`}>
                {t("login.subtitle")}
              </p>
            </motion.div>

            {/* Test Accounts */}
            <motion.div variants={item} className="mb-6">
              <p className={`text-xs ${themeTokens.textMuted} mb-3 text-center`}>
                🔐 {t("login.test_accounts")}
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                {Object.entries(TEST_ACCOUNTS).map(([key, account]) => (
                  <button
                    key={key}
                    onClick={() => fillTestAccount(key as keyof typeof TEST_ACCOUNTS)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedTestAccount === key
                      ? `bg-gradient-to-r ${account.color} text-white`
                      : `${themeTokens.chipBg} ${themeTokens.chipBorder} ${themeTokens.chipText} ${themeTokens.chipHoverText} ${themeTokens.chipHoverBorder}`
                      }`}
                  >
                    <account.icon className="w-3.5 h-3.5" />
                    {t(`login.${key}`)}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Form with glow effect */}
            <motion.div variants={item} className="relative">
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
                className={`relative rounded-2xl border ${themeTokens.cardBorder} ${themeTokens.cardBg} backdrop-blur-md p-7 sm:p-8 transition-shadow duration-500`}
                style={{
                  boxShadow: isFocused
                    ? "0 12px 48px -8px rgba(168,85,247,0.55)"
                    : "0 8px 32px -8px rgba(168,85,247,0.2)",
                }}
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/40 to-transparent" />

                {/* Email */}
                <div className="mb-5">
                  <label className={`block text-xs font-medium ${themeTokens.textMuted} mb-2`}>
                    {t("login.email")}
                  </label>
                  <div className="group relative">
                    <Mail className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${themeTokens.textFaint} group-focus-within:text-violet-400 transition-colors`} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setTouched(true)}
                      placeholder={t("login.email_placeholder")}
                      className={`w-full rounded-xl ${themeTokens.inputBg} border ${showEmailError
                        ? "border-red-500/60 focus:ring-red-500/30"
                        : `${themeTokens.inputBorder} focus:ring-violet-500/40 focus:border-violet-500/60`
                        } pl-10 pr-4 py-3 text-sm ${themeTokens.text} ${themeTokens.inputPlaceholder} outline-none focus:ring-2 transition-all`}
                    />
                  </div>
                  <AnimatePresence>
                    {showEmailError && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="mt-1.5 text-xs text-red-400"
                      >
                        {t("login.invalid_email")}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Password */}
                <div className="mb-2">
                  <label className={`block text-xs font-medium ${themeTokens.textMuted} mb-2`}>
                    {t("login.password")}
                  </label>
                  <div className="group relative">
                    <Lock className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${themeTokens.textFaint} group-focus-within:text-violet-400 transition-colors`} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full rounded-xl ${themeTokens.inputBg} border ${themeTokens.inputBorder} pl-10 pr-11 py-3 text-sm ${themeTokens.text} ${themeTokens.inputPlaceholder} outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/60 transition-all`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md ${themeTokens.textFaint} hover:text-violet-400 transition-colors`}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Forgot password */}
                <div className="flex justify-end mb-6">
                  <a href="#" className={`text-xs ${themeTokens.textMuted} hover:text-violet-400 transition-colors`}>
                    {t("login.forgot_password")}
                  </a>
                </div>

                {/* Submit button */}
                <motion.button
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  type="submit"
                  disabled={isLoading}
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
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t("login.logging_in")}
                      </>
                    ) : (
                      <>
                        {t("login.login_button")}
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </>
                    )}
                  </span>
                </motion.button>

                {/* Separator */}
                <div className="my-6 flex items-center gap-3">
                  <div className={`h-px flex-1 bg-gradient-to-r ${themeTokens.divider}`} />
                  <span className={`text-xs ${themeTokens.textGhost} uppercase tracking-wider`}>
                    {t("login.or")}
                  </span>
                  <div className={`h-px flex-1 bg-gradient-to-l ${themeTokens.divider}`} />
                </div>

                {/* Register link */}
                <p className={`text-center text-sm ${themeTokens.textMuted}`}>
                  {t("login.no_account")}{" "}
                  <Link to="/register" className="text-violet-400 hover:text-fuchsia-400 font-medium transition-colors">
                    {t("login.create_account")}
                  </Link>
                </p>
              </form>
            </motion.div>
          </div>

          <motion.div variants={item} className={`relative z-10 text-xs ${themeTokens.textGhost}`}>
            © 2026 EasyVote · {t("login.copyright")}
          </motion.div>
        </motion.section>

        {/* Right Side - Visual */}
        <motion.section
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className={`relative hidden lg:flex flex-col items-center justify-center overflow-hidden border-l ${themeTokens.sectionBorder}`}
          style={{ backgroundColor: themeTokens.bgSecondary }}
        >
          <Aurora isDark={isDark} />

          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(${themeTokens.gridLines} 1px, transparent 1px), linear-gradient(90deg, ${themeTokens.gridLines} 1px, transparent 1px)`,
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
                {t("login.right_title")}{" "}
                <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                  {t("login.right_title_highlight")}
                </span>{" "}
                {t("login.right_title_end")}
              </h3>
              <p className={`mt-2 text-sm ${themeTokens.textMuted}`}>
                {t("login.right_subtitle")}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="flex flex-wrap justify-center gap-2.5"
            >
              <TrustChip icon={<Shield className="h-3.5 w-3.5" />} label={t("login.secure_vote")} t={themeTokens} />
              <TrustChip icon={<Users className="h-3.5 w-3.5" />} label={t("login.students")} t={themeTokens} />
              <TrustChip icon={<Zap className="h-3.5 w-3.5" />} label={t("login.certified")} t={themeTokens} />
            </motion.div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
/* ════════════════════════════════════════════════════════════════
   ThemeToggle
   ════════════════════════════════════════════════════════════════ */
function ThemeToggle({
  theme,
  setTheme,
}: {
  theme: "dark" | "light";
  setTheme: (t: "dark" | "light") => void;
}) {
  const isDark = theme === "dark";
  return (
    <motion.button
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`fixed top-6 right-6 z-50 flex items-center gap-2 rounded-full backdrop-blur-md border px-3 py-2 text-xs font-medium transition-colors ${isDark
        ? "bg-white/[0.04] border-white/10 text-white/70 hover:text-white hover:border-white/20"
        : "bg-white/70 border-violet-200/60 text-slate-700 hover:text-slate-900 hover:border-violet-300"
        }`}
      aria-label="Changer de thème"
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-2"
      >
        {isDark ? (
          <>
            <Sun className="h-3.5 w-3.5 text-amber-300" />
            <span>Light</span>
          </>
        ) : (
          <>
            <Moon className="h-3.5 w-3.5 text-violet-500" />
            <span>Dark</span>
          </>
        )}
      </motion.div>
    </motion.button>
  );
}

/* ════════════════════════════════════════════════════════════════
   Aurora — violet / fuchsia / pink (indigo retiré)
   ════════════════════════════════════════════════════════════════ */
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

/* ════════════════════════════════════════════════════════════════
   GlobalParticles — 30 particules violettes/roses sur tout le fond
   ════════════════════════════════════════════════════════════════ */
function GlobalParticles({ isDark }: { isDark: boolean }) {
  const particles = Array.from({ length: 30 }).map((_, i) => {
    const seed = (i * 9301 + 49297) % 233280;
    const rand = seed / 233280;
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
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
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

/* ════════════════════════════════════════════════════════════════
   PulsingOrb — orbe lumineuse pulsante avec halos multi-couches
   ════════════════════════════════════════════════════════════════ */
function PulsingOrb() {
  return (
    <div className="relative h-[340px] w-[340px] flex items-center justify-center">
      {/* Halo le plus large */}
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute h-[340px] w-[340px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(168,85,247,0.5) 0%, rgba(168,85,247,0.15) 40%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Halo moyen décalé */}
      <motion.div
        animate={{ scale: [1.05, 1.2, 1.05], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        className="absolute h-[240px] w-[240px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(217,70,239,0.7) 0%, rgba(168,85,247,0.3) 50%, transparent 80%)",
          filter: "blur(28px)",
        }}
      />

      {/* Anneau orbital */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute h-[200px] w-[200px] rounded-full border border-violet-300/30"
        style={{
          boxShadow: "inset 0 0 20px rgba(168,85,247,0.3), 0 0 20px rgba(168,85,247,0.2)",
        }}
      />

      {/* Anneau secondaire dashed */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute h-[260px] w-[260px] rounded-full border border-pink-300/20"
        style={{ borderStyle: "dashed" }}
      />

      {/* Orbe principale */}
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
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.6) 0%, transparent 30%)",
          }}
        />
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 70% 75%, rgba(236,72,153,0.4) 0%, transparent 25%)",
          }}
        />
      </motion.div>

      {/* Particules orbitales */}
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
              transition={{
                duration: 2 + (i % 3),
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3,
              }}
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

/* ════════════════════════════════════════════════════════════════
   TrustChip
   ════════════════════════════════════════════════════════════════ */
function TrustChip({
  icon,
  label,
  t,
}: {
  icon: React.ReactNode;
  label: string;
  t: {
    chipBg: string;
    chipBorder: string;
    chipText: string;
    chipHoverText: string;
    chipHoverBorder: string;
  };
}) {
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