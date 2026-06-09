import { Card } from '../../components/ui/Card'
import type { StudentClass } from '../../services/studentService'

type StudentClassesPanelProps = {
  classes: StudentClass[]
}

export function StudentClassesPanel({ classes }: StudentClassesPanelProps) {
  return (
    <Card>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-950">
          Classes
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Classes this student is enrolled in.
        </p>
      </div>

      {classes.length === 0 ? (
        <p className="text-sm text-slate-600">No classes linked yet.</p>
      ) : (
        <div className="space-y-3">
          {classes.map((schoolClass) => (
            <div
              className="rounded-lg border border-slate-200 p-4"
              key={schoolClass.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-950">
                    {schoolClass.name}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Grade {schoolClass.grade_level}
                    {schoolClass.section ? ` · Section ${schoolClass.section}` : ''}
                  </p>
                </div>

                <span
                  className={`rounded-md px-2 py-1 text-xs font-medium ${
                    schoolClass.is_active
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {schoolClass.is_active ? 'Active' : 'Archived'}
                </span>
              </div>

              <p className="mt-3 text-sm text-slate-600">
                Academic year: {schoolClass.academic_year}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}