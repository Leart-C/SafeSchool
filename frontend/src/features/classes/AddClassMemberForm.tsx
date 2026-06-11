import type { FormEventHandler } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Select } from '../../components/ui/Select'
import type { ClassMemberRole } from '../../services/classService'
import type { ManagedUser } from '../../services/userService'

type AddClassMemberFormProps = {
  candidateUsers: ManagedUser[]
  isSubmitting: boolean
  role: ClassMemberRole
  selectedUserId: string
  onRoleChange: (role: ClassMemberRole) => void
  onSelectedUserChange: (userId: string) => void
  onSubmit: () => void
}

const classRoles: Array<{
  value: ClassMemberRole
  label: string
}> = [
  { value: 'teacher', label: 'Teacher' },
  { value: 'student', label: 'Student' },
  { value: 'assistant', label: 'Assistant' },
]

export function AddClassMemberForm({
  candidateUsers,
  isSubmitting,
  role,
  selectedUserId,
  onRoleChange,
  onSelectedUserChange,
  onSubmit,
}: AddClassMemberFormProps) {
  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <Card>
      <form className="grid gap-4 lg:grid-cols-[1fr_220px_auto] lg:items-end" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="class-member-user">
            User
          </label>

          <Select
            className="mt-2"
            id="class-member-user"
            onChange={(event) => onSelectedUserChange(event.target.value)}
            required
            value={selectedUserId}
          >
            <option value="">Select a user</option>
            {candidateUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} · {user.email}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="class-member-role">
            Class role
          </label>

          <Select
            className="mt-2"
            id="class-member-role"
            onChange={(event) => onRoleChange(event.target.value as ClassMemberRole)}
            value={role}
          >
            {classRoles.map((classRole) => (
              <option key={classRole.value} value={classRole.value}>
                {classRole.label}
              </option>
            ))}
          </Select>
        </div>

        <Button
          disabled={isSubmitting || !selectedUserId}
          icon={<Plus className="h-4 w-4" aria-hidden={true} />}
          type="submit"
        >
          {isSubmitting ? 'Adding...' : 'Add member'}
        </Button>
      </form>
    </Card>
  )
}
