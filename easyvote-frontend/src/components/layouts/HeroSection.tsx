// components/layouts/HeroSection.tsx
import { motion, Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Users, Award, Mic, Sparkles, CheckCircle, Fingerprint, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: "easeOut" } 
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1 } 
  }
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { 
    opacity: 1, 
    transition: { duration: 0.4 } 
  }
};

const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.4 }
  }
};

export default function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-purple-950/30" />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzI3QjAiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0di00aC0ydjRoLTR2MmI0djRoMnYtNGg0di0yaC00em0wLTMwVjBoLTJ2NGgtNHYyaDR2NGgyVjZoNFY0aC00ek02IDM0di00SDR2NGgtNHYyaDR2NGgyVi00aDR2LTJINnoiLz48L2c+PC9nPjwvc3ZnPg==')] bg-repeat" />
      </div>

      {/* Animated Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div variants={fadeIn} className="flex justify-center lg:justify-start mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 backdrop-blur-sm border border-pink-200/50 dark:border-pink-800/50">
                <Sparkles className="w-4 h-4 text-pink-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("hero.badge")}
                </span>
              </div>
            </motion.div>

            {/* Main Title */}
            <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tighter">
              <span className="bg-gradient-to-r from-gray-900 via-pink-600 to-purple-600 dark:from-white dark:via-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
                {t("hero.title_line1")}
              </span>
              <br />
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                {t("hero.title_line2")}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p variants={fadeUp} className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed">
              {t("hero.subtitle")}
            </motion.p>

            {/* Features List */}
            <motion.div variants={fadeUp} className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <CheckCircle className="w-5 h-5 text-pink-500" />
                <span>{t("hero.features.anonymous")}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <Fingerprint className="w-5 h-5 text-purple-500" />
                <span>{t("hero.features.authentication")}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <Clock className="w-5 h-5 text-indigo-500" />
                <span>{t("hero.features.realtime")}</span>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Link to="/register">
                <Button size="lg" className="group bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-6 text-lg font-semibold rounded-2xl shadow-xl shadow-pink-500/30 hover:shadow-pink-500/50 transition-all duration-300 w-full sm:w-auto">
                  {t("hero.cta_vote")}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/candidates">
                <Button size="lg" variant="outline" className="border-pink-300 dark:border-pink-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm hover:bg-pink-50 dark:hover:bg-pink-950/30 px-8 py-6 text-lg font-semibold rounded-2xl w-full sm:w-auto">
                  {t("hero.cta_candidates")}
                </Button>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-6 justify-center lg:justify-start">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-pink-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{t("hero.trust_indicators.secure")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{t("hero.trust_indicators.students")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{t("hero.trust_indicators.transparent")}</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Image/Illustration */}
          <motion.div
            variants={scaleUp}
            initial="hidden"
            animate="show"
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop"
                alt="Student voting illustration"
                className="w-full h-auto object-cover rounded-3xl"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              
              {/* Floating Cards */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="absolute top-8 right-8 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-xl p-3 shadow-lg border border-pink-200 dark:border-pink-800"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/50 flex items-center justify-center">
                    <Users className="w-4 h-4 text-pink-500" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t("common.participants")}</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">1,234</div>
                  </div>
                </div>
              </motion.div>

              {/* <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="absolute bottom-8 left-8 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-xl p-3 shadow-lg border border-purple-200 dark:border-purple-800"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-purple-500" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t("common.secure_vote")}</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">Blockchain</div>
                  </div>
                </div>
              </motion.div> */}
            </div>
          </motion.div>
        </div>

        {/* Delegate Quote */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-20 text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500/5 to-purple-500/5 backdrop-blur-sm border border-pink-200/30 dark:border-pink-800/30">
            <Mic className="w-4 h-4 text-pink-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400 italic">
              {t("hero.quote")}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">{t("common.discover")}</span>
          <div className="w-6 h-10 border-2 border-pink-300 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1 h-2 bg-pink-500 rounded-full mt-2"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}