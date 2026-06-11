import type { FormEventHandler } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import type { CreateStudentGuardianPayload } from '../../services/studentService'

type StudentGuardianFormProps = {
  form: CreateStudentGuardianPayload
  isSubmitting: boolean
  onCancel: () => void
  onChange: (form: CreateStudentGuardianPayload) => void
  onSubmit: () => void
}

const relationships = [
  { label: 'Mother', value: 'mother' },
  { label: 'Father', value: 'father' },
  { label: 'Guardian', value: 'guardian' },
  { label: 'Grandparent', value: 'grandparent' },
  { label: 'Aunt', value: 'aunt' },
  { label: 'Uncle', value: 'uncle' },
  { label: 'Other', value: 'other' },
]

export function StudentGuardianForm({
  form,
  isSubmitting,
  onCancel,
  onChange,
  onSubmit,
}: StudentGuardianFormProps) {
  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <Card>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <h3 className="text-lg font-semibold text-slate-950">
            Link guardian
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Create or reuse a parent account and link it to this student.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">First name</span>
            <Input
              onChange={(event) =>
                onChange({ ...form, first_name: event.target.value })
              }
              placeholder="Mira"
              required
              value={form.first_name}
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Last name</span>
            <Input
              onChange={(event) =>
                onChange({ ...form, last_name: event.target.value })
              }
              placeholder="Lovelace"
              required
              value={form.last_name}
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <Input
              onChange={(event) =>
                onChange({ ...form, email: event.target.value })
              }
              placeholder="parent@example.com"
              required
              type="email"
              value={form.email}
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Phone</span>
            <Input
                onChange={(event) =>
                onChange({ ...form, phone: event.target.value })
                }
                placeholder="+355 69 000 0000"
                type="tel"
                value={form.phone ?? ''}
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Relationship</span>
            <Select
              onChange={(event) =>
                onChange({ ...form, relationship: event.target.value })
              }
              required
              value={form.relationship}
            >
              {relationships.map((relationship) => (
                <option key={relationship.value} value={relationship.value}>
                  {relationship.label}
                </option>
              ))}
            </Select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Emergency priority
            </span>
            <Input
              max={10}
              min={1}
              onChange={(event) =>
                onChange({
                  ...form,
                  emergency_contact_priority: event.target.value
                    ? Number(event.target.value)
                    : null,
                })
              }
              placeholder="1"
              type="number"
              value={form.emergency_contact_priority ?? ''}
            />
          </label>

          <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700">
            <input
              checked={form.is_primary ?? false}
              className="h-4 w-4 rounded border-slate-300"
              onChange={(event) =>
                onChange({ ...form, is_primary: event.target.checked })
              }
              type="checkbox"
            />
            Primary guardian
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Linking...' : 'Link guardian'}
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