// pages/admin/components/ProgressBar.tsx
import { motion } from "framer-motion"

interface ProgressBarProps {
  percentage: number
  color?: string
  label?: string
  value?: number
  showLabel?: boolean
}

export function ProgressBar({ percentage, color = "bg-pink-500", label, value, showLabel = true }: ProgressBarProps) {
  return (
    <div>
      {showLabel && label && (
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-700 dark:text-gray-300">{label}</span>
          {value !== undefined && <span className="text-gray-500">{value} votes ({percentage}%)</span>}
        </div>
      )}
      <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  )
}