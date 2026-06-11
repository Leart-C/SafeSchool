import {
  BadgeCheck,
  CalendarDays,
  FileText,
  GraduationCap,
} from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { formatDisplayDate } from '../../lib/date'
import type { StudentOfficialProfile } from '../../services/studentService'

type StudentOfficialProfilePanelProps = {
  profile: StudentOfficialProfile | null
}

export function StudentOfficialProfilePanel({
  profile,
}: StudentOfficialProfilePanelProps) {
  return (
    <Card>
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <BadgeCheck className="h-4 w-4 text-slate-500" aria-hidden={true} />
          <h3 className="text-lg font-semibold text-slate-950">
            Official student record
          </h3>
        </div>

        <p className="mt-1 text-sm text-slate-600">
          School-owned identification details used for parent linking, class
          assignment, and attendance records.
        </p>
      </div>

      {!profile ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-medium text-slate-700">
            No official profile yet.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Register the student profile to assign a student code and grade level.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Student code
            </p>
            <div className="mt-2">
              <Badge variant="default">{profile.student_code}</Badge>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Grade level
            </p>
            <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <GraduationCap className="h-4 w-4 text-slate-400" aria-hidden={true} />
              {profile.grade_level ?? 'Not set'}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Date of birth
            </p>
            <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <CalendarDays className="h-4 w-4 text-slate-400" aria-hidden={true} />
              {profile.date_of_birth ? formatDisplayDate(profile.date_of_birth) : 'Not set'}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Status
            </p>
            <div className="mt-2">
              <Badge variant={profile.enrollment_status === 'active' ? 'success' : 'muted'}>
                {profile.enrollment_status}
              </Badge>
            </div>
          </div>

          {profile.notes ? (
            <div className="lg:col-span-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Notes
              </p>
              <p className="mt-2 flex gap-2 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden={true} />
                {profile.notes}
              </p>
            </div>
          ) : null}
        </div>
      )}
    </Card>
  )
}