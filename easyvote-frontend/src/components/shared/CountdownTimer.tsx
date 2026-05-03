import { useEffect, useState } from "react"

interface CountdownTimerProps {
  targetDate: Date
  onExpire?: () => void
  variant?: "block" | "inline"
}

export function CountdownTimer({ targetDate, onExpire, variant = "block" }: CountdownTimerProps) {
  const calculateTimeLeft = () => {
    const diff = targetDate.getTime() - Date.now()
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    }
  }

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  useEffect(() => {
    const interval = setInterval(() => {
      const t = calculateTimeLeft()
      setTimeLeft(t)
      if (t.days === 0 && t.hours === 0 && t.minutes === 0 && t.seconds === 0) {
        onExpire?.()
        clearInterval(interval)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  if (variant === "inline") {
    return (
      <span className="text-foreground font-bold">
        {timeLeft.days > 0 ? `${timeLeft.days}j ` : ""}
        {timeLeft.hours}h {timeLeft.minutes}m
      </span>
    )
  }

  const Cell = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center justify-center bg-foreground/5 border border-foreground/10 rounded-xl px-3 py-3 min-w-[64px] backdrop-blur-sm">
      <div className="text-2xl md:text-3xl font-black text-foreground tabular-nums leading-none">
        {String(value).padStart(2, "0")}
      </div>
      <div className="text-[10px] uppercase tracking-widest text-foreground/50 mt-1.5 font-semibold">
        {label}
      </div>
    </div>
  )

  return (
    <div className="grid grid-cols-4 gap-2">
      <Cell value={timeLeft.days} label="Jours" />
      <Cell value={timeLeft.hours} label="Heures" />
      <Cell value={timeLeft.minutes} label="Min" />
      <Cell value={timeLeft.seconds} label="Sec" />
    </div>
  )
}
