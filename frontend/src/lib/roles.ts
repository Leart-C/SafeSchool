export function hasAnyRole(userRoles: string[], allowedRoles: string[]): boolean {
  return allowedRoles.some((role) => userRoles.includes(role))
}

export function canManageAttendance(userRoles: string[]): boolean {
  return hasAnyRole(userRoles, ['admin', 'director', 'teacher'])
}

export function canCreateMessages(userRoles: string[]): boolean {
  return hasAnyRole(userRoles, ['admin', 'director', 'teacher'])
}