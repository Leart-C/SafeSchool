import type { FormEventHandler } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
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
      <form className="grid gap-4 lg:grid-cols-6" onSubmit={handleSubmit}>
        <div className="lg:col-span-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="class-name">
            Class name
          </label>
          <input
            className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            id="class-name"
            onChange={(event) => onChange({ ...form, name: event.target.value })}
            placeholder="Grade 8A"
            required
            value={form.name}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="grade-level">
            Grade
          </label>
          <input
            className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            id="grade-level"
            onChange={(event) => onChange({ ...form, grade_level: event.target.value })}
            placeholder="8"
            required
            value={form.grade_level}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="section">
            Section
          </label>
          <input
            className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            id="section"
            onChange={(event) => onChange({ ...form, section: event.target.value })}
            placeholder="A"
            value={form.section}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="academic-year">
            Academic year
          </label>
          <input
            className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            id="academic-year"
            onChange={(event) => onChange({ ...form, academic_year: event.target.value })}
            placeholder="2026-2027"
            required
            value={form.academic_year}
          />
        </div>

        <div className="flex items-end">
          <label className="flex h-10 items-center gap-2 text-sm font-medium text-slate-700">
            <input
              checked={form.is_active}
              className="h-4 w-4 rounded border-slate-300"
              onChange={(event) => onChange({ ...form, is_active: event.target.checked })}
              type="checkbox"
            />
            Active
          </label>
        </div>

        {error ? (
          <p className="text-sm font-medium text-red-700 lg:col-span-6">
            {error}
          </p>
        ) : null}

        <div className="flex gap-3 lg:col-span-6">
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Saving...' : submitLabel}
          </Button>

          <Button
            disabled={isSubmitting}
            onClick={onCancel}
            type="button"
            variant="secondary"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}