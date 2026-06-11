import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import type { ClassProfile } from '../../services/classService'

type ClassProfileHeaderProps = {
  schoolClass: ClassProfile
}

export function ClassProfileHeader({ schoolClass }: ClassProfileHeaderProps) {
  return (
    <PageHeader
      action={
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={schoolClass.is_active ? 'success' : 'muted'}>
            {schoolClass.is_active ? 'Active' : 'Archived'}
          </Badge>

          <Button
            as={Link}
            icon={<ArrowLeft className="h-4 w-4" aria-hidden={true} />}
            to="/app/classes"
            variant="secondary"
          >
            Back to classes
          </Button>
        </div>
      }
      description={`Grade ${schoolClass.grade_level}${
        schoolClass.section ? ` · Section ${schoolClass.section}` : ''
      } · ${schoolClass.academic_year}`}
      eyebrow="Class profile"
      title={schoolClass.name}
    />
  )
}
