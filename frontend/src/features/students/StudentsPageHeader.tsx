import { GraduationCap } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { Badge } from '../../components/ui/Badge'

export function StudentsPageHeader() {
  return (
    <PageHeader
      action={
        <Badge variant="muted">
          <GraduationCap className="mr-1.5 h-3.5 w-3.5" aria-hidden={true} />
          Directory
        </Badge>
      }
      description="Review students scoped to your school. Guardian and class counts come from SafeSchool relationships, not Clerk identity data."
      eyebrow="School students"
      title="Students"
    />
  )
}