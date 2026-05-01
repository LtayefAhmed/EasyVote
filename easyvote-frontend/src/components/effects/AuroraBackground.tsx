import { motion } from "framer-motion"

export const AuroraBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
      {/* Blob 1 - indigo */}
      <motion.div
        className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)" }}
        animate={{ x: [0, 100, 0], y: [0, 50, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Blob 2 - violet */}
      <motion.div
        className="absolute top-[40%] right-[-15%] w-[55vw] h-[55vw] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(168,85,247,0.35) 0%, transparent 70%)" }}
        animate={{ x: [0, -100, 0], y: [0, 80, 0], scale: [1, 1.3, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Blob 3 - rose */}
      <motion.div
        className="absolute bottom-[-15%] left-[20%] w-[50vw] h-[50vw] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)" }}
        animate={{ x: [0, 80, 0], y: [0, -60, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Grain texture overlay subtle */}
      <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><filter id='noise'><feTurbulence baseFrequency='0.9' numOctaves='3'/></filter><rect width='100%25' height='100%25' filter='url(%23noise)'/></svg>\")"
        }}
      />
    </div>
  )
}
