import type { ReactNode } from 'react'
import { GraduationCap } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { Badge } from '../../components/ui/Badge'

type StudentsPageHeaderProps = {
  action?: ReactNode
}

export function StudentsPageHeader({ action }: StudentsPageHeaderProps) {
  return (
    <PageHeader
      action={
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="muted">
            <GraduationCap className="mr-1.5 h-3.5 w-3.5" aria-hidden={true} />
            Directory
          </Badge>
          {action}
        </div>
      }
      description="Review students scoped to your school. Student codes and profile details help identify the correct child when names are similar."
      eyebrow="School students"
      title="Students"
    />
  )
}
