import type { FormEventHandler } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import type { CreateClassPayload } from '../../services/classService'

type ClassFormProps = {
  form: CreateClassPayload
  error: string | null
  isSubmitting: boolean
  submitLabel: string
  onCancel: () => void
  onChange: (form: CreateClassPayload) => void
  onSubmit: () => void
}

export function ClassForm({
  form,
  error,
  isSubmitting,
  submitLabel,
  onCancel,
  onChange,
  onSubmit,
}: ClassFormProps) {
  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <Card>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <h3 className="text-base font-semibold text-slate-950">
            Class details
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Keep class names clear and consistent across the school year.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="class-name"
            >
              Class name
            </label>
            <Input
              id="class-name"
              onChange={(event) => onChange({ ...form, name: event.target.value })}
              placeholder="Grade 8A"
              required
              value={form.name}
            />
          </div>

          <div>
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="grade-level"
            >
              Grade
            </label>
            <Input
              id="grade-level"
              onChange={(event) => onChange({ ...form, grade_level: event.target.value })}
              placeholder="8"
              required
              value={form.grade_level}
            />
          </div>

          <div>
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="section"
            >
              Section
            </label>
            <Input
              id="section"
              onChange={(event) => onChange({ ...form, section: event.target.value })}
              placeholder="A"
              value={form.section}
            />
          </div>

          <div className="lg:col-span-2">
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="academic-year"
            >
              Academic year
            </label>
            <Input
              id="academic-year"
              onChange={(event) => onChange({ ...form, academic_year: event.target.value })}
              placeholder="2026-2027"
              required
              value={form.academic_year}
            />
          </div>
        </div>

        <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <input
            checked={form.is_active}
            className="mt-1 h-4 w-4 rounded border-slate-300"
            onChange={(event) => onChange({ ...form, is_active: event.target.checked })}
            type="checkbox"
          />

          <span>
            <span className="flex items-center gap-2 text-sm font-medium text-slate-900">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden={true} />
              Active class
            </span>

            <span className="mt-1 block text-sm leading-6 text-slate-500">
              Active classes appear in daily workflows. Archived classes stay
              available for history and reporting.
            </span>
          </span>
        </label>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            disabled={isSubmitting}
            onClick={onCancel}
            type="button"
            variant="secondary"
          >
            Cancel
          </Button>

          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Saving...' : submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  )
}