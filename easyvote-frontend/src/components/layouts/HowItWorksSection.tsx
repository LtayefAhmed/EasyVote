// components/home/HowItWorksSection.tsx
import { motion } from "framer-motion"
import { UserPlus, ShieldCheck, Vote, BarChart3 } from "lucide-react"
import { useTranslation } from "@/i18n"

export default function HowItWorksSection() {
  const { t } = useTranslation()

  const steps = [
    {
      icon: UserPlus,
      number: "01",
      title: t("howitworks.step1.title"),
      description: t("howitworks.step1.description"),
      color: "from-indigo-500 to-blue-500"
    },
    {
      icon: ShieldCheck,
      number: "02",
      title: t("howitworks.step2.title"),
      description: t("howitworks.step2.description"),
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Vote,
      number: "03",
      title: t("howitworks.step3.title"),
      description: t("howitworks.step3.description"),
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: BarChart3,
      number: "04",
      title: t("howitworks.step4.title"),
      description: t("howitworks.step4.description"),
      color: "from-emerald-500 to-teal-500"
    }
  ]

  return (
    <section className="py-24 px-4 bg-gray-50 dark:bg-gray-900/50">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            {t("howitworks.title")}
            <span className="bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
              {" "}{t("howitworks.title_highlight")}
            </span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            {t("howitworks.subtitle")}
          </p>
        </motion.div>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 dark:from-indigo-800 dark:via-purple-800 dark:to-pink-800 hidden lg:block" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="relative group"
              >
                <div className="relative z-10 bg-white dark:bg-gray-900 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all">
                  <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-3 right-4 text-5xl font-black text-gray-200 dark:text-gray-800 opacity-50">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}