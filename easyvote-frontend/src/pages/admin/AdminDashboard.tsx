import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"

import { useTranslation } from "@/i18n"
import { Sidebar } from "@/components/AdminSections/Sidebar"
import { MobileHeader } from "@/components/AdminSections/MobileHeader"
import { OverviewSection } from "@/components/AdminSections/OverviewSection"
import { DelegatesSection } from "@/components/AdminSections/DelegatesSection"
import { VotesSection } from "@/components/AdminSections/VotesSection"
import { StudentsSection } from "@/components/AdminSections/StudentsSection"
import { ResultsSection } from "@/components/AdminSections/ResultsSection"
import { SettingsSection } from "@/components/AdminSections/SettingsSection"
import { VotersSection } from "@/components/AdminSections/VotersSection"

type Section = "overview" | "votes" | "students" | "voters" | "delegates" | "results" | "settings"

const sectionComponents: Record<Section, React.ComponentType> = {
  overview: OverviewSection,
  votes: VotesSection,
  students: StudentsSection,
  voters: VotersSection,
  delegates: DelegatesSection,
  results: ResultsSection,
  settings: SettingsSection,
}

export default function AdminDashboard() {
  const { t } = useTranslation()
  const [activeSection, setActiveSection] = useState<Section>("overview")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark")
    setIsDark(isDarkMode)
  }, [])

  const ActiveComponent = sectionComponents[activeSection]

  const sectionTitles: Record<Section, string> = {
    overview: t("admin.overview"),
    votes: t("admin.votes_management"),
    students: t("admin.students_management"),
    voters: t("admin.voters_list"),
    delegates: t("admin.delegates_management"),
    results: t("admin.election_results"),
    settings: t("admin.settings"),
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <Sidebar 
        active={activeSection} 
        onActiveChange={setActiveSection}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileHeader 
          isOpen={isMobileMenuOpen}
          onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          title={sectionTitles[activeSection]}
        />

        <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
          <div className="p-4 sm:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ActiveComponent />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}