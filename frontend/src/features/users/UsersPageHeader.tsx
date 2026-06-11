import { UsersRound } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { Badge } from '../../components/ui/Badge'

export function UsersPageHeader() {
  return (
    <PageHeader
      action={
        <Badge variant="muted">
          <UsersRound className="mr-1.5 h-3.5 w-3.5" aria-hidden={true} />
          Admin
        </Badge>
      }
      description="Review school users, roles, and SafeSchool relationship counts. Identity is managed by Clerk; this screen manages app-side access."
      eyebrow="User management"
      title="Users"
    />
  )
}