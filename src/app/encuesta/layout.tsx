export default function SurveyLayout({ children }: LayoutProps<"/encuesta">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-border/60 bg-card">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-2.5 px-4 sm:px-6">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
            R
          </span>
          <span className="text-sm font-medium">Reypar</span>
          <span className="text-sm text-muted-foreground">· Diagnóstico de liderazgo</span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 sm:px-6">{children}</main>
    </div>
  )
}
