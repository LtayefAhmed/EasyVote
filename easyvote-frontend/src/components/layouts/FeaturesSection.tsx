// components/home/FeaturesSection.tsx
import { motion, Variants } from "framer-motion"
import { Vote, BarChart3, Bot, Shield, Zap, Clock, Users, Lock, Database, Globe, Smartphone, TrendingUp } from "lucide-react"
import { useTranslation } from "@/i18n"

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

const stagger: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const scaleOnHover = {
  whileHover: { y: -8, scale: 1.02 },
  transition: { duration: 0.2 }
}

export default function FeaturesSection() {
  const { t } = useTranslation()

  const features = [
    {
      icon: Shield,
      title: t("features.secure_vote.title"),
      description: t("features.secure_vote.description"),
      gradient: "from-indigo-500 to-blue-500",
      lightGradient: "from-indigo-50 to-blue-50",
      iconGradient: "from-indigo-600 to-blue-600",
      stats: "99.9%",
      statLabel: "Sécurité",
      delay: 0
    },
    {
      icon: TrendingUp,
      title: t("features.live_analytics.title"),
      description: t("features.live_analytics.description"),
      gradient: "from-purple-500 to-pink-500",
      lightGradient: "from-purple-50 to-pink-50",
      iconGradient: "from-purple-600 to-pink-600",
      stats: "24/7",
      statLabel: "Temps réel",
      delay: 0.1
    },
    {
      icon: Bot,
      title: t("features.ai_assistant.title"),
      description: t("features.ai_assistant.description"),
      gradient: "from-pink-500 to-rose-500",
      lightGradient: "from-pink-50 to-rose-50",
      iconGradient: "from-pink-600 to-rose-600",
      stats: "100%",
      statLabel: "Disponible",
      delay: 0.2
    }
  ]

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent" />
      
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
        className="container mx-auto max-w-7xl relative z-10"
      >
        {/* Section Header */}
        <motion.div variants={fadeUp} className="text-center mb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-pink-500/10 dark:from-indigo-500/20 dark:to-pink-500/20 backdrop-blur-sm border border-indigo-200/30 dark:border-indigo-800/30 mb-6">
            <Zap className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("features.platform_features")}
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight">
            <span className="text-gray-900 dark:text-white">
              {t("features.title")}
            </span>{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              {t("features.title_highlight")}
            </span>
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            {t("features.subtitle")}
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={fadeUp}
              {...scaleOnHover}
              custom={feature.delay}
              className="group relative"
            >
              {/* Animated border gradient */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300 blur" />
              
              {/* Card content */}
              <div className="relative h-full p-8 rounded-2xl bg-white dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                
                {/* Icon with animated background */}
                <div className="relative mb-6">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.lightGradient} dark:bg-opacity-10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className={`relative inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                  {feature.description}
                </p>

                {/* Stats Badge */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${feature.iconGradient} bg-opacity-10 flex items-center justify-center`}>
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${feature.gradient} animate-pulse`} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {feature.stats}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {feature.statLabel}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div variants={fadeUp} className="mt-16">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-center">
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                {t("features.cta.title")}
              </h3>
              <p className="text-white/90 mb-6 max-w-md mx-auto">
                {t("features.cta.subtitle")}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                {t("features.cta.button")}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}