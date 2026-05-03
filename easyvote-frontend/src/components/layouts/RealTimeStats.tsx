// components/home/RealTimeStats.tsx
import { motion, useInView } from "framer-motion"
import { Users, Vote, Clock, Shield } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useTranslation } from "@/i18n"

export default function RealTimeStats() {
  const { t } = useTranslation()
  const [ref, setRef] = useState<HTMLDivElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (ref) {
      observer.observe(ref)
    }

    return () => observer.disconnect()
  }, [ref])

  const stats = [
    { 
      icon: Users, 
      value: 15234, 
      label: t("realtimestats.voters"), 
      suffix: "+", 
      color: "from-indigo-500 to-blue-500" 
    },
    { 
      icon: Vote, 
      value: 89, 
      label: t("realtimestats.participation_rate"), 
      suffix: "%", 
      color: "from-purple-500 to-pink-500" 
    },
    { 
      icon: Clock, 
      value: 24, 
      label: t("realtimestats.hours_left"), 
      suffix: "h", 
      color: "from-pink-500 to-rose-500" 
    },
    { 
      icon: Shield, 
      value: 100, 
      label: t("realtimestats.verified_votes"), 
      suffix: "%", 
      color: "from-emerald-500 to-teal-500" 
    }
  ]

  const AnimatedCounter = ({ value, suffix }: { value: number; suffix: string }) => {
    const [count, setCount] = useState(0)

    useEffect(() => {
      if (isVisible) {
        let start = 0
        const duration = 2000
        const increment = value / (duration / 16)
        
        const timer = setInterval(() => {
          start += increment
          if (start >= value) {
            setCount(value)
            clearInterval(timer)
          } else {
            setCount(Math.floor(start))
          }
        }, 16)

        return () => clearInterval(timer)
      }
    }, [isVisible, value])

    return <>{count}{suffix}</>
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 text-white">
      <div className="container mx-auto max-w-7xl">
        <div ref={setRef} className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={isVisible ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-lg`}>
                <stat.icon className="w-8 h-8" />
              </div>
              <div className="text-4xl md:text-5xl font-black mb-2">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm opacity-90">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}