"use client"

type Item = { label: string; value: string; color?: string }

export function TooltipBox({ title, items }: { title?: string; items: Item[] }) {
  return (
    <div className="max-w-64 rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      {title && <p className="mb-1 font-medium text-foreground">{title}</p>}
      <div className="grid gap-0.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              {item.color && <span className="size-2 rounded-full" style={{ background: item.color }} />}
              {item.label}
            </span>
            <span className="font-medium text-foreground tabular-nums">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm" style={{ background: item.color }} />
          {item.label}
        </li>
      ))}
    </ul>
  )
}

export function ChartCard({ title, description, children, footer }: { title: string; description?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col rounded-2xl border bg-card p-4 sm:p-5">
      <p className="font-medium">{title}</p>
      {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      <div className="mt-4 min-w-0 flex-1">{children}</div>
      {footer && <div className="mt-3">{footer}</div>}
    </div>
  )
}
