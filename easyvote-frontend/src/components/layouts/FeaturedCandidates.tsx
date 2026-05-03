// components/home/FeaturedCandidates.tsx
import { motion } from "framer-motion"
import { Users, Award, Heart, MessageCircle } from "lucide-react"
import { useTranslation } from "@/i18n"

export default function FeaturedCandidates() {
  const { t } = useTranslation()

  const candidates = [
    {
      name: "Emma Laurent",
      role: t("candidates.role.president"),
      program: t("candidates.program1"),
      votes: 1247,
      image: "https://randomuser.me/api/portraits/women/1.jpg",
      color: "from-pink-500 to-rose-500"
    },
    {
      name: "Thomas Dubois",
      role: t("candidates.role.vice_president"),
      program: t("candidates.program2"),
      votes: 1132,
      image: "https://randomuser.me/api/portraits/men/2.jpg",
      color: "from-indigo-500 to-purple-500"
    },
    {
      name: "Sarah Benali",
      role: t("candidates.role.secretary"),
      program: t("candidates.program3"),
      votes: 985,
      image: "https://randomuser.me/api/portraits/women/3.jpg",
      color: "from-emerald-500 to-teal-500"
    }
  ]

  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            {t("candidates.title")}
            <span className="bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
              {" "}{t("candidates.title_highlight")}
            </span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t("candidates.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {candidates.map((candidate, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={candidate.image} 
                    alt={candidate.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${candidate.color} opacity-60`} />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 text-white">
                      <Award className="w-4 h-4" />
                      <span className="text-sm font-semibold">{candidate.votes} votes</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1 text-gray-900 dark:text-white">
                    {candidate.name}
                  </h3>
                  <p className="text-pink-600 dark:text-pink-400 text-sm font-semibold mb-3">
                    {candidate.role}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {candidate.program}
                  </p>
                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition">
                      {t("candidates.vote")}
                    </button>
                    <button className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      <MessageCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div className="text-center mt-12">
          <button className="px-8 py-3 border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition">
            {t("candidates.view_all")}
          </button>
        </motion.div>
      </div>
    </section>
  )
}