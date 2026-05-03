// components/home/StatsSection.tsx
import { motion, Variants } from "framer-motion"
import { Users, Shield, Bot } from "lucide-react"

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
}

const stagger: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
}

export default function StatsSection() {
  const stats = [
    { icon: Users, value: "10K+", label: "Étudiants connectés", color: "from-indigo-500 to-blue-500" },
    { icon: Shield, value: "100%", label: "Anonymat garanti", color: "from-purple-500 to-pink-500" },
    { icon: Bot, value: "24/7", label: "Assistance IA", color: "from-pink-500 to-rose-500" },
  ]

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      variants={stagger}
      className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mb-20"
    >
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          variants={fadeUp}
          whileHover={{ y: -5, scale: 1.02 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br opacity-20 rounded-2xl blur-xl group-hover:opacity-40 transition-opacity"
            style={{ backgroundImage: `linear-gradient(to bottom right, ${stat.color})` }}
          />
          <div className="relative p-8 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm hover:border-white/20 transition-all">
            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.color} mb-4`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div className="text-4xl font-black mb-2 bg-gradient-to-r from-white to-foreground/60 bg-clip-text text-transparent">
              {stat.value}
            </div>
            <div className="text-sm text-foreground/60 font-medium">{stat.label}</div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}