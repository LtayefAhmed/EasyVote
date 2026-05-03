// pages/admin/components/MobileHeader.tsx
import { Menu, X, Vote } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface MobileHeaderProps {
  isOpen: boolean
  onToggle: () => void
  title: string
}

export function MobileHeader({ isOpen, onToggle, title }: MobileHeaderProps) {
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
            <Vote className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            EasyVote
          </span>
        </div>
        <button onClick={onToggle} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800"
          >
            <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}