import React from "react"
import { cn } from "@/lib/utils"

interface ResponsiveTableProps {
  children: React.ReactNode
  className?: string
  minWidth?: string
}

export const ResponsiveTable = ({ 
  children, 
  className,
  minWidth = "600px" 
}: ResponsiveTableProps) => {
  return (
    <div className={cn(
      "w-full overflow-x-auto rounded-md border bg-background",
      "scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100",
      "dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800",
      className
    )}>
      <div style={{ minWidth }} className="relative">
        {children}
      </div>
    </div>
  )
}

interface MobileTableCardProps {
  children: React.ReactNode
  className?: string
}

export const MobileTableCard = ({ children, className }: MobileTableCardProps) => {
  return (
    <div className={cn(
      "block md:hidden p-4 mb-3 rounded-lg border bg-card",
      "shadow-sm hover:shadow-md transition-shadow",
      className
    )}>
      {children}
    </div>
  )
}

interface TableField {
  label: string
  value: React.ReactNode
  className?: string
}

interface MobileTableRowProps {
  fields: TableField[]
  actions?: React.ReactNode
  className?: string
}

export const MobileTableRow = ({ fields, actions, className }: MobileTableRowProps) => {
  return (
    <MobileTableCard className={className}>
      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={index} className="flex justify-between items-start">
            <span className="text-sm font-medium text-muted-foreground min-w-0 flex-1 pr-2">
              {field.label}:
            </span>
            <div className={cn("text-sm font-medium text-right", field.className)}>
              {field.value}
            </div>
          </div>
        ))}
        {actions && (
          <div className="pt-3 border-t flex justify-end gap-2">
            {actions}
          </div>
        )}
      </div>
    </MobileTableCard>
  )
}