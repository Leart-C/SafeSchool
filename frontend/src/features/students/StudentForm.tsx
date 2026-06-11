import type { FormEventHandler } from 'react'
import { UserPlus } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import type { CreateStudentPayload } from '../../services/studentService'

type StudentFormProps = {
  error: string | null
  form: CreateStudentPayload
  isSubmitting: boolean
  onCancel: () => void
  onChange: (form: CreateStudentPayload) => void
  onSubmit: () => void
}

export function StudentForm({
  error,
  form,
  isSubmitting,
  onCancel,
  onChange,
  onSubmit,
}: StudentFormProps) {
  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <Card>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <h3 className="text-base font-semibold text-slate-950">
            Register student
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Create the official school-owned student record used for guardians,
            classes, and attendance.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="student-first-name">
              First name
            </label>
            <Input
              className="mt-2"
              id="student-first-name"
              onChange={(event) => onChange({ ...form, first_name: event.target.value })}
              required
              value={form.first_name}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="student-last-name">
              Last name
            </label>
            <Input
              className="mt-2"
              id="student-last-name"
              onChange={(event) => onChange({ ...form, last_name: event.target.value })}
              required
              value={form.last_name}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="student-email">
              Email optional
            </label>
            <Input
              className="mt-2"
              id="student-email"
              onChange={(event) => onChange({ ...form, email: event.target.value })}
              placeholder="student@example.com"
              type="email"
              value={form.email ?? ''}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="student-code">
              Student code optional
            </label>
            <Input
              className="mt-2"
              id="student-code"
              onChange={(event) => onChange({ ...form, student_code: event.target.value })}
              placeholder="SS-2026-000421"
              value={form.student_code ?? ''}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="student-dob">
              Date of birth optional
            </label>
            <Input
              className="mt-2"
              id="student-dob"
              onChange={(event) => onChange({ ...form, date_of_birth: event.target.value })}
              type="date"
              value={form.date_of_birth ?? ''}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="student-grade">
              Grade level
            </label>
            <Input
              className="mt-2"
              id="student-grade"
              onChange={(event) => onChange({ ...form, grade_level: event.target.value })}
              placeholder="6"
              required
              value={form.grade_level}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="student-notes">
            Notes optional
          </label>
          <Textarea
            className="mt-2"
            id="student-notes"
            onChange={(event) => onChange({ ...form, notes: event.target.value })}
            placeholder="Enrollment notes, transfer context, or internal details."
            value={form.notes ?? ''}
          />
        </div>

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

          <Button
            disabled={isSubmitting}
            icon={<UserPlus className="h-4 w-4" aria-hidden={true} />}
            type="submit"
          >
            {isSubmitting ? 'Registering...' : 'Register student'}
          </Button>
        </div>
      </form>
    </Card>
  )
}