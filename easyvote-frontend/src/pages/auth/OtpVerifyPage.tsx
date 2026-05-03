import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  ArrowLeft,
  CheckCircle,
  Loader2,
  RefreshCw,
  Clock,
  Lock,
  Send,
  AtSign,
} from "lucide-react";

/**
 * OtpVerificationPage — EasyVote
 * ------------------------------------------------------------------
 * Page de vérification du code OTP à 6 chiffres reçu par email
 * après l'inscription d'un utilisateur sur la plateforme.
 *
 * Design system cohérent avec LoginPage / RegisterPage :
 *  - Split screen (formulaire à gauche, visuel animé à droite)
 *  - Glassmorphism + gradients indigo → violet → pink
 *  - Dark mode natif
 *  - Animations Framer Motion + CSS 3D pour l'enveloppe
 * ------------------------------------------------------------------
 */

// Récupération de l'email depuis location.state (React Router) ou URL params
// Fallback : "votre email" si absent
const getUserEmail = (): string => {
  if (typeof window === "undefined") return "votre email";
  try {
    // 1. Tentative via URL search params (?email=...)
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("email");
    if (fromUrl) return decodeURIComponent(fromUrl);
    // 2. Tentative via history.state (React Router style location.state)
    const state = (window.history.state && window.history.state.usr) || null;
    if (state && state.email) return state.email;
  } catch {
    /* noop */
  }
  return "votre email";
};

// Formatage mm:ss à partir d'un nombre de secondes
const formatTime = (totalSeconds: number): string => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const OTP_LENGTH = 6;
const OTP_EXPIRATION_SECONDS = 600; // 10 minutes
const RESEND_COOLDOWN_SECONDS = 60; // 1 minute
// Code "magique" pour simuler un succès (en prod : appel API)
const MOCK_VALID_CODE = "123456";

const OtpVerificationPage: React.FC = () => {
  // ---------- États ----------
  const [code, setCode] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [timeLeft, setTimeLeft] = useState<number>(OTP_EXPIRATION_SECONDS);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);

  const userEmail = useRef<string>(getUserEmail());
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  // ---------- Effets : timers ----------
  // Décrément du code OTP chaque seconde (10 min)
  useEffect(() => {
    if (timeLeft <= 0 || success) return;
    const id = window.setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [timeLeft, success]);

  // Décrément du cooldown de renvoi
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = window.setInterval(() => {
      setResendCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [resendCooldown]);

  // Auto-focus du premier input à l'ouverture
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  // ---------- Handlers ----------
  // Saisie d'un chiffre dans une case
  const handleChange = useCallback(
    (index: number, value: string) => {
      // Sanitize : on ne garde que les chiffres et on prend le DERNIER tapé
      const digit = value.replace(/\D/g, "").slice(-1);

      setCode((prev) => {
        const next = [...prev];
        next[index] = digit;
        return next;
      });

      // Reset erreur dès qu'on tape
      if (error) setError(null);

      // Auto-focus next si chiffre saisi
      if (digit && index < OTP_LENGTH - 1) {
        inputsRef.current[index + 1]?.focus();
      }
    },
    [error]
  );

  // Gestion clavier : Backspace, flèches
  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace") {
        // Si la case est vide, on remonte sur la précédente
        if (!code[index] && index > 0) {
          inputsRef.current[index - 1]?.focus();
        }
      } else if (e.key === "ArrowLeft" && index > 0) {
        e.preventDefault();
        inputsRef.current[index - 1]?.focus();
      } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
        e.preventDefault();
        inputsRef.current[index + 1]?.focus();
      }
    },
    [code]
  );

  // Collage : on distribue les chiffres dans toutes les cases
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, OTP_LENGTH);
      if (!pasted) return;

      const next = Array(OTP_LENGTH).fill("");
      for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
      setCode(next);

      // Focus la prochaine case vide ou la dernière
      const nextEmpty = next.findIndex((c) => !c);
      const focusIndex = nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty;
      inputsRef.current[focusIndex]?.focus();
    },
    []
  );

  // Animation shake en cas d'erreur
  const triggerShake = useCallback(() => {
    setShake(true);
    window.setTimeout(() => setShake(false), 400);
  }, []);

  // Soumission du code
  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      const fullCode = code.join("");
      if (fullCode.length !== OTP_LENGTH) return;
      if (timeLeft <= 0) {
        setError("Le code a expiré. Demande un nouveau code.");
        triggerShake();
        return;
      }

      setIsLoading(true);
      setError(null);

      // Simulation d'un appel API (1.5s)
      window.setTimeout(() => {
        setIsLoading(false);
        if (fullCode === MOCK_VALID_CODE) {
          // ✅ Succès
          setSuccess(true);
          // eslint-disable-next-line no-console
          console.log("[OTP] Code vérifié avec succès :", fullCode);
        } else {
          // ❌ Échec : shake + message
          setError("Code incorrect. Vérifie et réessaie.");
          triggerShake();
          setCode(Array(OTP_LENGTH).fill(""));
          inputsRef.current[0]?.focus();
        }
      }, 1500);
    },
    [code, timeLeft, triggerShake]
  );

  // Renvoi du code
  const handleResend = useCallback(() => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setError(null);

    window.setTimeout(() => {
      setIsResending(false);
      setTimeLeft(OTP_EXPIRATION_SECONDS);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setCode(Array(OTP_LENGTH).fill(""));
      inputsRef.current[0]?.focus();
      // eslint-disable-next-line no-console
      console.log("[OTP] Nouveau code envoyé à", userEmail.current);
    }, 800);
  }, [resendCooldown, isResending]);

  // Auto-submit dès que les 6 cases sont remplies (UX fluide)
  useEffect(() => {
    const filled = code.every((c) => c !== "");
    if (filled && !isLoading && !success) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // ---------- Dérivés ----------
  const fullCode = code.join("");
  const isComplete = fullCode.length === OTP_LENGTH;
  const isExpired = timeLeft <= 0;
  const isUrgent = timeLeft > 0 && timeLeft < 60;
  const canResend = resendCooldown <= 0 && !isResending;

  // ---------- Render ----------
  return (
    <div className="min-h-screen w-full bg-[#0a0a0f] text-white overflow-hidden relative font-sans">
      {/* Halos d'ambiance globaux */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 -left-40 w-[36rem] h-[36rem] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[36rem] h-[36rem] rounded-full bg-pink-600/20 blur-[120px]" />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* =============================================================
            CÔTÉ GAUCHE — FORMULAIRE
        ============================================================== */}
        <section className="flex flex-col px-6 sm:px-12 lg:px-20 py-10">
          {/* Header : logo + retour */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-12"
          >
            <a
              href="#"
              className="text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent"
            >
              EasyVote
            </a>
            <a
              href="#"
              className="group inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Retour
            </a>
          </motion.div>

          {/* Bloc principal centré verticalement */}
          <div className="flex-1 flex items-center">
            <div className="w-full max-w-md mx-auto">
              {/* Headline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mb-8"
              >
                <h1 className="font-black text-5xl sm:text-6xl tracking-tight leading-[1.05] mb-4">
                  Vérification{" "}
                  <span className="inline-block">📧</span>
                </h1>
                <p className="text-white/60 text-base">
                  Un code à 6 chiffres a été envoyé à
                </p>
                <p className="mt-1 font-semibold text-lg bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent break-all">
                  {userEmail.current}
                </p>
              </motion.div>

              {/* Card glassmorphism */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-[0_8px_60px_-12px_rgba(124,58,237,0.35)] p-7 sm:p-8 overflow-hidden"
              >
                {/* Liseré gradient en haut de la card */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent" />

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Bloc des 6 inputs OTP */}
                  <div>
                    <label className="block text-xs uppercase tracking-[0.18em] text-white/50 mb-3">
                      Code de vérification
                    </label>

                    <motion.div
                      animate={
                        shake
                          ? { x: [-10, 10, -10, 10, 0] }
                          : { x: 0 }
                      }
                      transition={{ duration: 0.4 }}
                      className="flex items-center justify-between gap-2 sm:gap-3"
                    >
                      {code.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => {
                            inputsRef.current[idx] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          pattern="\d*"
                          maxLength={1}
                          value={digit}
                          onChange={(e) =>
                            handleChange(idx, e.target.value)
                          }
                          onKeyDown={(e) => handleKeyDown(idx, e)}
                          onPaste={handlePaste}
                          disabled={isLoading || success || isExpired}
                          aria-label={`Chiffre ${idx + 1} sur ${OTP_LENGTH}`}
                          className={`
                            w-11 h-12 sm:w-14 sm:h-14
                            rounded-xl text-center
                            font-black text-2xl sm:text-3xl
                            bg-white/[0.04] text-white
                            border-2
                            ${error
                              ? "border-pink-500/60"
                              : digit
                                ? "border-violet-500/70"
                                : "border-white/10"
                            }
                            focus:outline-none
                            focus:border-violet-400
                            focus:bg-white/[0.07]
                            focus:shadow-[0_0_0_4px_rgba(139,92,246,0.18),0_0_30px_-2px_rgba(139,92,246,0.55)]
                            transition-all duration-200
                            disabled:opacity-60 disabled:cursor-not-allowed
                            caret-violet-400
                          `}
                        />
                      ))}
                    </motion.div>
                  </div>

                  {/* Compte à rebours */}
                  <div className="flex items-center gap-2 text-sm">
                    <Clock
                      className={`w-4 h-4 ${isExpired
                          ? "text-pink-400"
                          : isUrgent
                            ? "text-pink-400"
                            : "text-white/50"
                        }`}
                    />
                    {isExpired ? (
                      <span className="text-pink-400 font-medium">
                        Code expiré, demande un renvoi
                      </span>
                    ) : (
                      <span
                        className={
                          isUrgent
                            ? "text-pink-400 font-medium"
                            : "text-white/60"
                        }
                      >
                        Le code expire dans{" "}
                        <span className="font-mono font-semibold">
                          {formatTime(timeLeft)}
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Message d'erreur */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -5, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -5, height: 0 }}
                        className="flex items-center gap-2 text-sm text-pink-400 bg-pink-500/10 border border-pink-500/30 rounded-xl px-3 py-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Bouton Vérifier */}
                  <button
                    type="submit"
                    disabled={!isComplete || isLoading || success || isExpired}
                    className="
                      relative w-full overflow-hidden
                      rounded-xl py-3.5 px-5
                      font-semibold text-white
                      bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500
                      shadow-[0_10px_40px_-10px_rgba(139,92,246,0.7)]
                      hover:shadow-[0_15px_50px_-10px_rgba(236,72,153,0.7)]
                      transition-all duration-300
                      disabled:opacity-50 disabled:cursor-not-allowed
                      disabled:hover:shadow-[0_10px_40px_-10px_rgba(139,92,246,0.4)]
                      group
                    "
                  >
                    {/* Effet shine au survol */}
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <span className="relative inline-flex items-center justify-center gap-2">
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Vérification...
                        </>
                      ) : (
                        <>
                          Vérifier le code
                          <CheckCircle className="w-5 h-5" />
                        </>
                      )}
                    </span>
                  </button>

                  {/* Lien Renvoyer */}
                  <div className="text-center text-sm text-white/50 pt-1">
                    Pas reçu de code ?{" "}
                    {canResend ? (
                      <button
                        type="button"
                        onClick={handleResend}
                        className="inline-flex items-center gap-1.5 font-medium text-indigo-400 hover:text-indigo-300 hover:underline underline-offset-4 decoration-indigo-400/50 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Renvoyer le code
                      </button>
                    ) : isResending ? (
                      <span className="inline-flex items-center gap-1.5 text-white/40">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Envoi...
                      </span>
                    ) : (
                      <span className="text-white/40 font-mono">
                        Renvoyer dans {formatTime(resendCooldown)}
                      </span>
                    )}
                  </div>
                </form>
              </motion.div>

              {/* Note sécurité en bas */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 text-center text-xs text-white/40"
              >
                Vérifie tes spams si l'email tarde à arriver.
              </motion.p>
            </div>
          </div>
        </section>

        {/* =============================================================
            CÔTÉ DROIT — VISUEL
        ============================================================== */}
        <aside className="hidden lg:flex relative items-center justify-center overflow-hidden">
          {/* Background mesh aurora animé */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-violet-950/30 to-pink-950/40" />
            <div className="aurora-blob aurora-blob-1" />
            <div className="aurora-blob aurora-blob-2" />
            <div className="aurora-blob aurora-blob-3" />
            {/* Grille subtile */}
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
              }}
            />
          </div>

          {/* Scène centrale : enveloppe 3D + particules */}
          <div className="relative z-10 flex flex-col items-center justify-center px-12 w-full">
            {/* Cercle de chiffres flottants en arrière-plan */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="floating-digits">
                {["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].map(
                  (d, i) => (
                    <span
                      key={i}
                      className="floating-digit"
                      style={
                        {
                          "--i": i,
                          "--total": 10,
                        } as React.CSSProperties
                      }
                    >
                      {d}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Enveloppe 3D isométrique */}
            <div className="envelope-scene mb-14">
              <div className="envelope-wrap">
                <div className="envelope">
                  {/* Corps de l'enveloppe */}
                  <div className="envelope-back" />
                  <div className="envelope-body" />
                  {/* Lettre qui sort */}
                  <div className="envelope-letter">
                    <div className="letter-line" />
                    <div className="letter-line short" />
                    <div className="letter-line" />
                    <div className="letter-line short" />
                    <div className="letter-seal">
                      <AtSign className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                  {/* Rabat avant */}
                  <div className="envelope-flap" />
                </div>

                {/* Halo lumineux derrière */}
                <div className="envelope-glow" />

                {/* Particules d'envoi */}
                {[...Array(12)].map((_, i) => (
                  <span
                    key={i}
                    className="send-particle"
                    style={
                      {
                        "--i": i,
                        "--delay": `${i * 0.25}s`,
                      } as React.CSSProperties
                    }
                  />
                ))}
              </div>
            </div>

            {/* Texte central */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-center relative z-10"
            >
              <h2 className="text-3xl font-black tracking-tight mb-2">
                Un email vient d'arriver
              </h2>
              <p className="text-white/60 text-base mb-10">
                Vérifie ta boîte de réception
              </p>

              {/* 3 indicateurs */}
              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                {[
                  { icon: Lock, label: "Code unique", emoji: "🔒" },
                  { icon: Clock, label: "Valide 10 min", emoji: "⏱️" },
                  { icon: Send, label: "Mailtrap secured", emoji: "✉️" },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                    className="flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-md"
                  >
                    <span className="text-xl" aria-hidden>
                      {item.emoji}
                    </span>
                    <span className="text-[11px] font-medium text-white/70 text-center leading-tight">
                      {item.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </aside>
      </div>

      {/* =================================================================
          OVERLAY SUCCÈS — checkmark géant
      ================================================================== */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 18,
              }}
              className="relative"
            >
              {/* Anneaux pulsants */}
              <span className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping" />
              <span
                className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping"
                style={{ animationDelay: "0.3s" }}
              />
              <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-[0_0_80px_-5px_rgba(52,211,153,0.8)] flex items-center justify-center">
                <CheckCircle
                  className="w-20 h-20 text-white"
                  strokeWidth={2.5}
                />
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="absolute top-full left-1/2 -translate-x-1/2 mt-8 text-center whitespace-nowrap"
              >
                <p className="text-3xl font-black bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                  Compte activé !
                </p>
                <p className="text-white/60 mt-1">Bienvenue sur EasyVote</p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =================================================================
          STYLES INLINE — animations 3D & aurora
      ================================================================== */}
      <style>{`
        /* ---------- Aurora blobs ---------- */
        .aurora-blob {
          position: absolute;
          border-radius: 9999px;
          filter: blur(80px);
          opacity: 0.55;
          mix-blend-mode: screen;
          animation: aurora-float 18s ease-in-out infinite;
        }
        .aurora-blob-1 {
          top: 10%;
          left: 15%;
          width: 28rem;
          height: 28rem;
          background: radial-gradient(circle, rgba(99,102,241,0.7), transparent 70%);
        }
        .aurora-blob-2 {
          bottom: 5%;
          right: 10%;
          width: 32rem;
          height: 32rem;
          background: radial-gradient(circle, rgba(236,72,153,0.55), transparent 70%);
          animation-delay: -6s;
        }
        .aurora-blob-3 {
          top: 50%;
          left: 50%;
          width: 24rem;
          height: 24rem;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, rgba(139,92,246,0.55), transparent 70%);
          animation-delay: -12s;
        }
        @keyframes aurora-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -30px) scale(1.08); }
          66% { transform: translate(-30px, 30px) scale(0.95); }
        }

        /* ---------- Chiffres flottants en cercle ---------- */
        .floating-digits {
          position: relative;
          width: 520px;
          height: 520px;
          animation: spin-slow 40s linear infinite;
        }
        .floating-digit {
          position: absolute;
          top: 50%;
          left: 50%;
          font-family: ui-monospace, "SF Mono", Menlo, monospace;
          font-weight: 900;
          font-size: 1.5rem;
          color: rgba(255, 255, 255, 0.18);
          transform:
            translate(-50%, -50%)
            rotate(calc(var(--i) * (360deg / var(--total))))
            translateY(-240px)
            rotate(calc(var(--i) * (-360deg / var(--total))));
          animation: digit-pulse 3s ease-in-out infinite;
          animation-delay: calc(var(--i) * 0.2s);
        }
        @keyframes spin-slow {
          to { transform: rotate(360deg); }
        }
        @keyframes digit-pulse {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.45; }
        }

        /* ---------- Scène enveloppe 3D ---------- */
        .envelope-scene {
          perspective: 1200px;
          width: 280px;
          height: 200px;
          position: relative;
        }
        .envelope-wrap {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          animation: envelope-float 5s ease-in-out infinite;
        }
        .envelope-glow {
          position: absolute;
          inset: -30px;
          background: radial-gradient(
            circle at center,
            rgba(139, 92, 246, 0.45),
            transparent 65%
          );
          filter: blur(20px);
          z-index: -1;
          animation: envelope-glow-pulse 3s ease-in-out infinite;
        }
        .envelope {
          position: relative;
          width: 100%;
          height: 100%;
          transform: rotateX(15deg) rotateY(-12deg);
          transform-style: preserve-3d;
        }
        .envelope-back {
          position: absolute;
          inset: 0;
          border-radius: 8px;
          background: linear-gradient(135deg, #1e1b4b, #312e81);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.1),
            0 20px 50px -10px rgba(0,0,0,0.6);
        }
        .envelope-body {
          position: absolute;
          inset: 0;
          border-radius: 8px;
          background:
            linear-gradient(135deg, rgba(99,102,241,0.4), rgba(139,92,246,0.3) 50%, rgba(236,72,153,0.4)),
            linear-gradient(180deg, #312e81, #1e1b4b);
          clip-path: polygon(0 100%, 100% 100%, 100% 35%, 50% 65%, 0 35%);
          border: 1px solid rgba(255,255,255,0.1);
          z-index: 3;
          box-shadow: inset 0 -1px 0 rgba(255,255,255,0.08);
        }
        .envelope-flap {
          position: absolute;
          inset: 0;
          border-radius: 8px 8px 0 0;
          background: linear-gradient(180deg, #4c1d95, #2e1065);
          clip-path: polygon(0 0, 100% 0, 50% 60%);
          z-index: 4;
          opacity: 0.85;
          transform-origin: top;
          animation: flap-open 5s ease-in-out infinite;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .envelope-letter {
          position: absolute;
          left: 12%;
          right: 12%;
          top: 18%;
          height: 60%;
          background: linear-gradient(180deg, #fafaf5, #e7e5e4);
          border-radius: 4px;
          padding: 14px 12px;
          z-index: 2;
          box-shadow:
            0 5px 15px -3px rgba(0,0,0,0.4),
            inset 0 1px 0 rgba(255,255,255,0.6);
          animation: letter-rise 5s ease-in-out infinite;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .letter-line {
          height: 4px;
          background: linear-gradient(90deg, #c7d2fe, #a5b4fc);
          border-radius: 2px;
          opacity: 0.7;
        }
        .letter-line.short { width: 60%; }
        .letter-seal {
          position: absolute;
          right: 10px;
          bottom: 10px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #ec4899);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow:
            0 4px 12px rgba(139,92,246,0.5),
            inset 0 1px 0 rgba(255,255,255,0.3);
          animation: seal-pulse 2.5s ease-in-out infinite;
        }
        @keyframes envelope-float {
          0%, 100% { transform: translateY(0) rotateZ(0deg); }
          50% { transform: translateY(-12px) rotateZ(1.5deg); }
        }
        @keyframes envelope-glow-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @keyframes flap-open {
          0%, 100% { transform: rotateX(0deg); }
          50% { transform: rotateX(-160deg); }
        }
        @keyframes letter-rise {
          0%, 100% { transform: translateY(0) translateZ(20px); }
          50% { transform: translateY(-25px) translateZ(40px); }
        }
        @keyframes seal-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 4px 12px rgba(139,92,246,0.5); }
          50% { transform: scale(1.1); box-shadow: 0 4px 20px rgba(236,72,153,0.7); }
        }

        /* ---------- Particules d'envoi ---------- */
        .send-particle {
          position: absolute;
          left: 50%;
          top: 30%;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a5b4fc, #f9a8d4);
          box-shadow: 0 0 10px rgba(165,180,252,0.8);
          animation: particle-fly 3s ease-out infinite;
          animation-delay: var(--delay);
          opacity: 0;
        }
        @keyframes particle-fly {
          0% {
            transform:
              translate(-50%, 0)
              rotate(calc(var(--i) * 30deg))
              translateY(0)
              scale(0.5);
            opacity: 0;
          }
          15% { opacity: 1; }
          100% {
            transform:
              translate(-50%, 0)
              rotate(calc(var(--i) * 30deg))
              translateY(-180px)
              scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default OtpVerificationPage;