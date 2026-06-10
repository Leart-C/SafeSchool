import {
  BookOpen,
  CalendarDays,
} from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import type { StudentClass } from '../../services/studentService'

type StudentClassesPanelProps = {
  classes: StudentClass[]
}

export function StudentClassesPanel({ classes }: StudentClassesPanelProps) {
  return (
    <Card className="h-full">
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-slate-500" aria-hidden={true} />
          <h3 className="text-lg font-semibold text-slate-950">
            Classes
          </h3>
        </div>

        <p className="mt-1 text-sm text-slate-600">
          Classes this student is enrolled in.
        </p>
      </div>

      {classes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-medium text-slate-700">
            No classes linked yet.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Class enrollment will appear here when the student is assigned.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {classes.map((schoolClass) => (
            <div
              className="rounded-lg border border-slate-200 bg-white p-4 transition hover:bg-slate-50"
              key={schoolClass.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-sm font-semibold text-slate-700">
                    {schoolClass.grade_level}
                  </div>

                  <div>
                    <p className="font-medium text-slate-950">
                      {schoolClass.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Grade {schoolClass.grade_level}
                      {schoolClass.section ? ` · Section ${schoolClass.section}` : ''}
                    </p>
                  </div>
                </div>

                <Badge variant={schoolClass.is_active ? 'success' : 'muted'}>
                  {schoolClass.is_active ? 'Active' : 'Archived'}
                </Badge>
              </div>

              <p className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                <CalendarDays className="h-4 w-4 text-slate-400" aria-hidden={true} />
                Academic year: {schoolClass.academic_year}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
