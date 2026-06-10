import { MessageSquareText } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { Badge } from '../../components/ui/Badge'

export function MessagesPageHeader() {
  return (
    <PageHeader
      action={
        <Badge variant="muted">
          <MessageSquareText className="mr-1.5 h-3.5 w-3.5" aria-hidden={true} />
          Announcements
        </Badge>
      }
      description="Share school announcements and class updates. Messages stay available in SafeSchool even when future email or push delivery is added."
      eyebrow="Communication"
      title="Messages"
    />
  )
}
