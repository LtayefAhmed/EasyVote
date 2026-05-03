// pages/admin/components/SectionHeader.tsx
import { Button } from "@/components/ui/button"
import { Plus, Download } from "lucide-react"
import { useTranslation } from "@/i18n"

interface SectionHeaderProps {
  title: string
  subtitle?: string
  onAdd?: () => void
  onExport?: () => void
  addButtonLabel?: string
  showAddButton?: boolean
  showExportButton?: boolean
  extra?: React.ReactNode
}

export function SectionHeader({ 
  title, subtitle, onAdd, onExport, addButtonLabel, 
  showAddButton = false, showExportButton = false, extra 
}: SectionHeaderProps) {
  const { t } = useTranslation()
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        {showExportButton && (
          <Button size="sm" variant="outline" onClick={onExport}>
            <Download className="w-4 h-4 mr-1" /> {t("admin.export")}
          </Button>
        )}
        {showAddButton && (
          <Button size="sm" className="bg-gradient-to-r from-pink-500 to-purple-600 text-white border-0" onClick={onAdd}>
            <Plus className="w-4 h-4 mr-1" /> {addButtonLabel || t("admin.add")}
          </Button>
        )}
        {extra}
      </div>
    </div>
  )
}