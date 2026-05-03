// pages/admin/components/StatusBadge.tsx
export type Status = "valid" | "suspect" | "invalid" | "approved" | "pending" | "rejected" | "active" | "closed"

interface StatusBadgeProps {
  status: Status
  label?: string
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = {
    valid:     { color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", defaultLabel: "Valide" },
    approved:  { color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", defaultLabel: "Approuvé" },
    suspect:   { color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", defaultLabel: "Suspect" },
    pending:   { color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", defaultLabel: "En attente" },
    invalid:   { color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", defaultLabel: "Invalidé" },
    rejected:  { color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", defaultLabel: "Rejeté" },
    active:    { color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", defaultLabel: "Active" },
    closed:    { color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400", defaultLabel: "Clôturée" },
  }

  const { color: bgColor, defaultLabel } = config[status]
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${bgColor}`}>
      {label || defaultLabel}
    </span>
  )
}