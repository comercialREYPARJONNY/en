"use client"

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ArrowDown, ArrowUp, CheckCircle2, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PRIORITY_DIMENSIONS } from "@/lib/survey/questions"
import type { PriorityDimension, SurveyQuestion } from "@/lib/survey/types"
import { cn } from "@/lib/utils"
import { QuestionCard } from "./question-card"

type Props = {
  question: SurveyQuestion
  order: PriorityDimension[]
  confirmed: boolean
  error?: string
  onChange: (order: PriorityDimension[], confirmed: boolean) => void
}

const labelOf = (id: PriorityDimension) => PRIORITY_DIMENSIONS.find((d) => d.id === id)?.label ?? id

/** PR1: ordenar 5 aspectos (1 = más importante). Arrastrar o usar flechas; nunca hay posiciones repetidas. */
export function RankingQuestion({ question, order, confirmed, error, onChange }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length) return
    onChange(arrayMove(order, from, to), true)
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    move(order.indexOf(active.id as PriorityDimension), order.indexOf(over.id as PriorityDimension))
  }

  return (
    <QuestionCard id={question.id} text={question.text} error={error}>
      <p className="-mt-2 text-sm text-muted-foreground">
        Arrastre los aspectos o use las flechas. Arriba el más importante (1), abajo el menos importante (5).
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <ol className="space-y-2">
            {order.map((id, index) => (
              <SortableItem
                key={id}
                id={id}
                position={index + 1}
                isFirst={index === 0}
                isLast={index === order.length - 1}
                onUp={() => move(index, index - 1)}
                onDown={() => move(index, index + 1)}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
      {confirmed ? (
        <p className="flex items-center gap-1.5 text-sm text-strength">
          <CheckCircle2 className="size-4" />
          Orden registrado. Puede seguir ajustándolo.
        </p>
      ) : (
        <Button type="button" variant="outline" className="h-10" onClick={() => onChange(order, true)}>
          <CheckCircle2 />
          Este orden es correcto
        </Button>
      )}
    </QuestionCard>
  )
}

type ItemProps = {
  id: PriorityDimension
  position: number
  isFirst: boolean
  isLast: boolean
  onUp: () => void
  onDown: () => void
}

function SortableItem({ id, position, isFirst, isLast, onUp, onDown }: ItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const label = labelOf(id)

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-2 rounded-xl border bg-card p-2 pr-1.5 transition-shadow",
        isDragging ? "z-10 border-primary shadow-lg" : "border-border",
      )}
    >
      <button
        type="button"
        className="flex h-10 w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground hover:bg-muted active:cursor-grabbing"
        aria-label={`Arrastrar ${label}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums",
          position <= 2 ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
        )}
        aria-hidden
      >
        {position}
      </span>
      <span className="min-w-0 flex-1 text-base sm:text-sm">
        <span className="sr-only">Posición {position}: </span>
        {label}
      </span>
      <div className="flex shrink-0 gap-0.5">
        <Button type="button" variant="ghost" size="icon" className="size-9" onClick={onUp} disabled={isFirst} aria-label={`Subir ${label}`}>
          <ArrowUp />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="size-9" onClick={onDown} disabled={isLast} aria-label={`Bajar ${label}`}>
          <ArrowDown />
        </Button>
      </div>
    </li>
  )
}
