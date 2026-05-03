// components/home/LiveElections.tsx
import { motion } from "framer-motion"
import { Clock, TrendingUp, Users, Calendar } from "lucide-react"
import { useTranslation } from "@/i18n"

export default function LiveElections() {
  const { t } = useTranslation()

  const elections = [
    {
      title: t("elections.president_title"),
      deadline: "2024-12-15",
      participation: 68,
      candidates: 4,
      status: "active",
      color: "from-pink-500 to-rose-500"
    },
    {
      title: t("elections.council_title"),
      deadline: "2024-12-20",
      participation: 45,
      candidates: 8,
      status: "upcoming",
      color: "from-indigo-500 to-purple-500"
    }
  ]

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-semibold text-red-600 dark:text-red-400">
              {t("elections.live_now")}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            {t("elections.title")}
          </h2>
        </motion.div>

        <div className="space-y-6">
          {elections.map((election, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.01 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-800"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${election.color} flex items-center justify-center`}>
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {election.title}
                    </h3>
                    {election.status === "active" && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-semibold rounded-full">
                        {t("elections.active")}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t("elections.deadline")}: {election.deadline}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {election.candidates} {t("elections.candidates")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {election.participation}% {t("elections.participation")}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {election.status === "active" && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">{t("elections.participation_rate")}</span>
                        <span className="text-pink-600 dark:text-pink-400 font-semibold">{election.participation}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${election.participation}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className={`h-full bg-gradient-to-r ${election.color} rounded-full`}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  election.status === "active"
                    ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:shadow-lg"
                    : "bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                }`}>
                  {election.status === "active" ? t("elections.vote_now") : t("elections.coming_soon")}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}