import { Card } from '../../components/ui/Card'
import type { StudentGuardian } from '../../services/studentService'

type StudentGuardiansPanelProps = {
  guardians: StudentGuardian[]
}

export function StudentGuardiansPanel({ guardians }: StudentGuardiansPanelProps) {
  return (
    <Card>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-950">
          Guardians
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Family contacts linked to this student.
        </p>
      </div>

      {guardians.length === 0 ? (
        <p className="text-sm text-slate-600">No guardians linked yet.</p>
      ) : (
        <div className="space-y-3">
          {guardians.map((guardian) => (
            <div
              className="rounded-lg border border-slate-200 p-4"
              key={guardian.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-950">
                    {guardian.name}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {guardian.email}
                  </p>
                </div>

                {guardian.is_primary ? (
                  <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                    Primary
                  </span>
                ) : null}
              </div>

              <p className="mt-3 text-sm text-slate-600">
                Relationship: {guardian.relationship ?? 'Not set'}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Emergency priority: {guardian.emergency_contact_priority ?? 'Not set'}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}