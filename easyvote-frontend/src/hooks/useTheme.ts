import { useEffect, useState } from "react"

export function useTheme() {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("easyvote-theme")
    return (saved as "dark" | "light") || "dark"
  })
  
  useEffect(() => {
    const root = document.documentElement
    if (theme === "dark") {
      root.classList.add("dark")
      root.classList.remove("light")
    } else {
      root.classList.remove("dark")
      root.classList.add("light")
    }
    localStorage.setItem("easyvote-theme", theme)
  }, [theme])
  
  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark")
  }
  
  return { theme, toggleTheme, setTheme }
}
