export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-pretty text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="no-print flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function Section({
  title,
  description,
  children,
  id,
}: {
  title: string
  description?: React.ReactNode
  children: React.ReactNode
  id?: string
}) {
  return (
    <section id={id} className="scroll-mt-20 space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  )
}
