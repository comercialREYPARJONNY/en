"use client"

import { MessageSquarePlus, X } from "lucide-react"
import { useId, useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { COMMENT_MAX_LENGTH } from "@/lib/survey/submission-schema"

type Props = {
  value: string | undefined
  onChange: (value: string) => void
}

export function CommentField({ value, onChange }: Props) {
  const [open, setOpen] = useState(Boolean(value))
  const id = useId()

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <MessageSquarePlus className="size-4" />
        Agregar comentario
      </button>
    )
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm text-muted-foreground">
          Comentario (opcional)
        </label>
        <button
          type="button"
          onClick={() => {
            onChange("")
            setOpen(false)
          }}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          aria-label="Quitar comentario"
        >
          <X className="size-3.5" />
          Quitar
        </button>
      </div>
      <Textarea
        id={id}
        autoFocus={!value}
        value={value ?? ""}
        maxLength={COMMENT_MAX_LENGTH}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Si quiere, dé contexto a su respuesta."
        className="min-h-20 resize-y bg-muted/40 text-base md:text-sm"
      />
    </div>
  )
}
