import { useState } from "react"
import { Save, Shield, UserCog, Database, Globe, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTranslation } from "@/i18n"
import { SectionHeader } from "./SectionHeader"


function Toggle({ enabled, onChange, label }: { enabled: boolean; onChange: () => void; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <button
        onClick={onChange}
        className={`w-10 h-6 rounded-full transition-colors relative ${enabled ? "bg-pink-500" : "bg-gray-300 dark:bg-gray-700"}`}
      >
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${enabled ? "translate-x-5" : "translate-x-1"}`} />
      </button>
    </div>
  )
}

export function SettingsSection() {
  const { t } = useTranslation()
  const [electionName, setElectionName] = useState("Élections des Délégués 2025")
  const [startDate, setStartDate] = useState("2025-04-01")
  const [endDate, setEndDate] = useState("2025-04-15")
  const [anonymousVote, setAnonymousVote] = useState(true)
  const [realtimeResults, setRealtimeResults] = useState(true)
  const [twoFA, setTwoFA] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)

  return (
    <div>
      <SectionHeader title={t("admin.settings")} subtitle={t("admin.settings_subtitle")} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Election Configuration */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <Database className="w-4 h-4" /> {t("admin.election_configuration")}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{t("admin.election_name")}</label>
              <Input value={electionName} onChange={(e) => setElectionName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">{t("admin.start_date")}</label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">{t("admin.end_date")}</label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
            <Toggle enabled={anonymousVote} onChange={() => setAnonymousVote(!anonymousVote)} label={t("admin.anonymous_voting")} />
            <Toggle enabled={realtimeResults} onChange={() => setRealtimeResults(!realtimeResults)} label={t("admin.realtime_results")} />
            <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white border-0 mt-2">
              <Save className="w-4 h-4 mr-1" /> {t("admin.save_changes")}
            </Button>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4" /> {t("admin.security")}
          </h3>
          <div className="space-y-4">
            <Toggle enabled={twoFA} onChange={() => setTwoFA(!twoFA)} label={t("admin.two_factor_auth")} />
            <Toggle enabled={emailNotifications} onChange={() => setEmailNotifications(!emailNotifications)} label={t("admin.email_notifications")} />
            <div className="pt-2">
              <label className="text-xs text-gray-500 mb-1 block">{t("admin.allowed_ips")}</label>
              <Input placeholder="192.168.1.0/24, 10.0.0.0/8" />
              <p className="text-xs text-gray-400 mt-1">{t("admin.ip_whitelist_desc")}</p>
            </div>
          </div>
        </div>

        {/* Admin Users */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <UserCog className="w-4 h-4" /> {t("admin.administrators")}
          </h3>
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">AP</div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Admin Principal</p>
                  <p className="text-xs text-gray-500">admin@easyvote.com</p>
                </div>
              </div>
              <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-0.5 rounded-full">Super Admin</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">MN</div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Marie Nguyen</p>
                  <p className="text-xs text-gray-500">m.nguyen@univ.fr</p>
                </div>
              </div>
              <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full">Moderator</span>
            </div>
          </div>
          <Button variant="outline" className="w-full">
            <UserCog className="w-4 h-4 mr-1" /> {t("admin.add_administrator")}
          </Button>
        </div>

        {/* Contact Information */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4" /> {t("admin.contact_information")}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1"><Mail className="w-3 h-3" /> {t("admin.support_email")}</label>
              <Input defaultValue="support@easyvote.com" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1"><Phone className="w-3 h-3" /> {t("admin.support_phone")}</label>
              <Input defaultValue="+33 1 23 45 67 89" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1"><MapPin className="w-3 h-3" /> {t("admin.address")}</label>
              <Input defaultValue="123 Avenue de l'Université, Campus Centre" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}