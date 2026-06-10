import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/ui/Button'
import type { StudentProfile } from '../../services/studentService'

type StudentProfileHeaderProps = {
  student: StudentProfile
}

export function StudentProfileHeader({ student }: StudentProfileHeaderProps) {
  return (
    <PageHeader
      action={
        <Button
          as={Link}
          icon={<ArrowLeft className="h-4 w-4" aria-hidden={true} />}
          to="/app/students"
          variant="secondary"
        >
          Back to students
        </Button>
      }
      description={student.email}
      eyebrow="Student profile"
      title={student.name}
    />
  )
}
