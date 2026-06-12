import type { ReactNode } from 'react'
import {
  Pencil,
  PhoneCall,
  ShieldCheck,
  Trash2,
  UserRound,
} from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import type { StudentGuardian } from '../../services/studentService'

type StudentGuardiansPanelProps = {
  action?: ReactNode
  guardians: StudentGuardian[]
  isMutatingGuardianId?: number | null
  onEdit?: (guardian: StudentGuardian) => void
  onUnlink?: (guardian: StudentGuardian) => void
}

export function StudentGuardiansPanel({
  action,
  guardians,
  isMutatingGuardianId = null,
  onEdit,
  onUnlink,
}: StudentGuardiansPanelProps) {
  return (
    <Card className="h-full">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
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

        {action}
      </div>

      {guardians.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-medium text-slate-700">
            No guardians linked yet.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Add a guardian so parents can be connected to attendance updates and school communication.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {guardians.map((guardian) => (
            <div
              className="rounded-lg border border-slate-200 bg-white p-4 transition hover:bg-slate-50"
              key={guardian.id}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                    <UserRound className="h-4 w-4" aria-hidden={true} />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-slate-950">
                        {guardian.name}
                      </p>

                      {guardian.is_primary ? (
                        <Badge variant="success">Primary</Badge>
                      ) : null}
                    </div>

                    <a
                      className="mt-1 block text-sm text-slate-600 hover:text-slate-950"
                      href={`mailto:${guardian.email}`}
                    >
                      {guardian.email}
                    </a>

                    {guardian.phone ? (
                      <a
                        className="mt-1 block text-sm text-slate-600 hover:text-slate-950"
                        href={`tel:${guardian.phone}`}
                      >
                        {guardian.phone}
                      </a>
                    ) : null}
                  </div>
                </div>

                <div className="flex gap-2">
                  {onEdit ? (
                    <Button
                      disabled={isMutatingGuardianId === guardian.id}
                      onClick={() => onEdit(guardian)}
                      size="sm"
                      type="button"
                      variant="secondary"
                    >
                      <Pencil className="h-4 w-4" aria-hidden={true} />
                      Edit
                    </Button>
                  ) : null}

                  {onUnlink ? (
                    <Button
                      disabled={isMutatingGuardianId === guardian.id}
                      onClick={() => onUnlink(guardian)}
                      size="sm"
                      type="button"
                      variant="danger"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden={true} />
                      Unlink
                    </Button>
                  ) : null}
                </div>
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