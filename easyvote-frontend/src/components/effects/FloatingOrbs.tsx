import { motion } from "framer-motion"

export const FloatingOrbs = () => {
  const orbs = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    size: Math.random() * 120 + 40,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 10 + 15,
    delay: Math.random() * 5,
  }))

  return (
    <div className="fixed inset-0 -z-5 overflow-hidden pointer-events-none">
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            background: `radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)`,
            filter: "blur(40px)",
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            delay: orb.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}
