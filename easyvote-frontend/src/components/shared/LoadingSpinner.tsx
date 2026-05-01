import React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  className?: string
  size?: number
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className, size = 24 }) => {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Loader2 size={size} className="animate-spin text-primary" />
    </div>
  )
}
