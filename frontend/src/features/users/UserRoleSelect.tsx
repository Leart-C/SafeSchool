import { Select } from '../../components/ui/Select'

export type UserRoleOption = 'admin' | 'director' | 'teacher' | 'parent' | 'student'

type UserRoleSelectProps = {
  disabled?: boolean
  value: UserRoleOption
  onChange: (role: UserRoleOption) => void
}

const roleOptions: Array<{
  value: UserRoleOption
  label: string
}> = [
  { value: 'admin', label: 'Admin' },
  { value: 'director', label: 'Director' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'parent', label: 'Parent' },
  { value: 'student', label: 'Student' },
]

export function UserRoleSelect({
  disabled = false,
  value,
  onChange,
}: UserRoleSelectProps) {
  return (
    <Select
      disabled={disabled}
      onChange={(event) => onChange(event.target.value as UserRoleOption)}
      value={value}
    >
      {roleOptions.map((role) => (
        <option key={role.value} value={role.value}>
          {role.label}
        </option>
      ))}
    </Select>
  )
}