import {
  Mail,
  Trash2,
  Users,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import type { ClassMember } from '../../services/classService'

type ClassMembersPanelProps = {
  description: string
  isRemovingUserId: number | null
  members: ClassMember[]
  onRemove: (member: ClassMember) => void
  title: string
}

export function ClassMembersPanel({
  description,
  isRemovingUserId,
  members,
  onRemove,
  title,
}: ClassMembersPanelProps) {
  return (
    <Card className="h-full">
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-500" aria-hidden={true} />
          <h3 className="text-lg font-semibold text-slate-950">
            {title}
          </h3>
        </div>

        <p className="mt-1 text-sm text-slate-600">
          {description}
        </p>
      </div>

      {members.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-medium text-slate-700">
            No members assigned yet.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Add members below to build the class roster.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((member) => (
            <div
              className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
              key={member.id}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-sm font-semibold text-slate-700">
                  {member.first_name?.[0] ?? member.name[0] ?? 'U'}
                </div>

                <div>
                  <p className="font-medium text-slate-950">
                    {member.name}
                  </p>
                  <a
                    className="mt-1 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-950"
                    href={`mailto:${member.email}`}
                  >
                    <Mail className="h-4 w-4 text-slate-400" aria-hidden={true} />
                    {member.email}
                  </a>
                </div>
              </div>

              <Button
                disabled={isRemovingUserId === member.id}
                icon={<Trash2 className="h-4 w-4" aria-hidden={true} />}
                onClick={() => onRemove(member)}
                size="sm"
                type="button"
                variant="ghost"
              >
                {isRemovingUserId === member.id ? 'Removing...' : 'Remove'}
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
