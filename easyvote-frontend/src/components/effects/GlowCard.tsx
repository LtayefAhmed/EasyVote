import React from "react"
import { cn } from "@/lib/utils"

interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const GlowCard: React.FC<GlowCardProps> = ({ children, className, ...props }) => {
  return (
    <div className={cn("relative group rounded-xl", className)} {...props}>
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-xl blur opacity-20 group-hover:opacity-75 transition duration-500"></div>
      <div className="relative bg-card rounded-xl p-6 ring-1 ring-white/10">
        {children}
      </div>
    </div>
  )
}
