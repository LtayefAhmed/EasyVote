// pages/admin/components/StatCard.tsx
import { motion } from "framer-motion"
import { ReactNode } from "react"

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon?: ReactNode
  trend?: "up" | "down"
  trendValue?: string
  color?: string
}

export function StatCard({ label, value, sub, icon, trend, trendValue, color = "from-pink-500 to-purple-600" }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {sub && <p className={`text-xs mt-1 ${trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-gray-500"}`}>{sub}</p>}
          {trendValue && <p className="text-xs text-gray-400 mt-0.5">{trendValue}</p>}
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  )
}