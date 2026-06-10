export const queryKeys = {
  me: ['me'] as const,

  messages: ['messages'] as const,

  classes: ['classes'] as const,

  students: ['students'] as const,
  student: (studentId: string | undefined) => ['student', studentId] as const,

  attendanceRecords: ['attendance-records'] as const,
  attendanceRoster: (
    classId: number | null,
    date: string,
  ) => ['attendance-roster', classId, date] as const,
}