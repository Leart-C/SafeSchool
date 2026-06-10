import {
  PhoneCall,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import type { StudentGuardian } from '../../services/studentService'

type StudentGuardiansPanelProps = {
  guardians: StudentGuardian[]
}

export function StudentGuardiansPanel({ guardians }: StudentGuardiansPanelProps) {
  return (
    <Card className="h-full">
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-slate-500" aria-hidden={true} />
          <h3 className="text-lg font-semibold text-slate-950">
            Guardians
          </h3>
        </div>

        <p className="mt-1 text-sm text-slate-600">
          Family contacts linked to this student.
        </p>
      </div>

      {guardians.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-medium text-slate-700">
            No guardians linked yet.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Guardian links will appear here when they are added by the school.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {guardians.map((guardian) => (
            <div
              className="rounded-lg border border-slate-200 bg-white p-4 transition hover:bg-slate-50"
              key={guardian.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                    <UserRound className="h-4 w-4" aria-hidden={true} />
                  </div>

                  <div>
                    <p className="font-medium text-slate-950">
                      {guardian.name}
                    </p>
                    <a
                      className="mt-1 block text-sm text-slate-600 hover:text-slate-950"
                      href={`mailto:${guardian.email}`}
                    >
                      {guardian.email}
                    </a>
                  </div>
                </div>

                {guardian.is_primary ? (
                  <Badge variant="success">Primary</Badge>
                ) : null}
              </div>

              <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Relationship
                  </p>
                  <p className="mt-1 text-slate-700">
                    {guardian.relationship ?? 'Not set'}
                  </p>
                </div>

                <div>
                  <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                    <PhoneCall className="h-3.5 w-3.5" aria-hidden={true} />
                    Emergency priority
                  </p>
                  <p className="mt-1 text-slate-700">
                    {guardian.emergency_contact_priority ?? 'Not set'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
