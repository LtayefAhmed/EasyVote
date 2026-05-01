import { motion, Variants } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight, Sparkles, Shield, Vote, Users, Bot, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FloatingOrbs } from "@/components/effects/FloatingOrbs"

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
}

const stagger: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
}

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <FloatingOrbs />

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/40 border-b border-white/5">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="text-2xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              EasyVote
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="text-foreground/80 hover:text-foreground">
                Se connecter
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg shadow-purple-500/30 text-white">
                Créer un compte
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="container mx-auto text-center max-w-5xl"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-foreground/80">Le futur des élections universitaires</span>
          </motion.div>

          {/* Title EasyVote */}
          <motion.h1
            variants={fadeUp}
            className="text-7xl md:text-9xl font-black tracking-tighter mb-6 leading-none"
          >
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(168,85,247,0.3)]">
              EasyVote
            </span>
          </motion.h1>

          {/* Tagline Comptez. Croyez. */}
          <motion.div variants={fadeUp} className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">
            <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
              Votez. Comptez.{" "}
            </span>
            <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              Croyez.
            </span>
          </motion.div>

          {/* Description */}
          <motion.p variants={fadeUp} className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto mb-12 leading-relaxed">
            Une plateforme électorale sécurisée, anonyme et transparente pour les universités modernes.
            Découvrez une nouvelle façon de participer à la vie étudiante.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-4 mb-20">
            <Link to="/register">
              <Button size="lg" className="group bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-8 py-6 text-base font-semibold shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all">
                Démarrer maintenant
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 px-8 py-6 text-base font-semibold">
                J'ai déjà un compte
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* STATS SECTION */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={stagger}
          className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mb-20"
        >
          {[
            { icon: Users, value: "10K+", label: "Étudiants connectés", color: "from-indigo-500 to-blue-500" },
            { icon: Shield, value: "100%", label: "Anonymat garanti", color: "from-purple-500 to-pink-500" },
            { icon: Bot, value: "24/7", label: "Assistance IA", color: "from-pink-500 to-rose-500" },
          ].map((stat, i) => (
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

        {/* FEATURES SECTION */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={stagger}
          className="container mx-auto max-w-6xl"
        >
          <motion.div variants={fadeUp} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-white to-foreground/60 bg-clip-text text-transparent">
                Une expérience
              </span>{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
                réinventée
              </span>
            </h2>
            <p className="text-foreground/60 text-lg max-w-2xl mx-auto">
              Trois piliers pour transformer votre démocratie étudiante
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Vote,
                title: "Vote sécurisé",
                description: "Cryptographie token-based pour un anonymat total. Vos votes restent privés, le résultat est public.",
                gradient: "from-indigo-500 to-blue-500"
              },
              {
                icon: BarChart3,
                title: "Analytics live",
                description: "Tableaux de bord temps réel pour suivre la participation et l'engagement de la communauté étudiante.",
                gradient: "from-purple-500 to-pink-500"
              },
              {
                icon: Bot,
                title: "Assistant IA",
                description: "Un chatbot intelligent disponible 24/7 pour répondre à vos questions et vous orienter dans le processus.",
                gradient: "from-pink-500 to-rose-500"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ y: -8 }}
                className="group relative p-8 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-sm hover:border-white/20 transition-all"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-6 shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">
                  {feature.title}
                </h3>
                <p className="text-foreground/60 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FOOTER MINIMAL */}
        <div className="container mx-auto mt-32 pt-8 pb-12 border-t border-white/5">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-foreground/50">
            <div>© 2026 EasyVote. Tous droits réservés.</div>
            <div className="flex gap-6 mt-4 md:mt-0">
              <span>Génie Logiciel · Spring Boot · React</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
