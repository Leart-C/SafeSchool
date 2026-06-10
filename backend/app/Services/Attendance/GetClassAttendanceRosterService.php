<?php

namespace App\Services\Attendance;

use App\Models\AttendanceRecord;
use App\Models\SchoolClass;
use Illuminate\Support\Collection;

class GetClassAttendanceRosterService
{
    /**
     * @return array<string, mixed>|null
     */
    public function forSchool(SchoolClass $schoolClass, int $schoolId, string $date): ?array
    {
        if ($schoolClass->school_id !== $schoolId) {
            return null;
        }

        $students = $schoolClass->students()
            ->select([
                'users.id',
                'users.name',
                'users.email',
                'users.first_name',
                'users.last_name',
            ])
            ->orderBy('users.last_name')
            ->orderBy('users.first_name')
            ->get();

        $records = AttendanceRecord::query()
            ->where('school_class_id', $schoolClass->id)
            ->whereDate('attendance_date', $date)
            ->get()
            ->keyBy('student_user_id');

        return [
            'class' => [
                'id' => $schoolClass->id,
                'name' => $schoolClass->name,
                'grade_level' => $schoolClass->grade_level,
                'section' => $schoolClass->section,
                'academic_year' => $schoolClass->academic_year,
                'is_active' => $schoolClass->is_active,
            ],
            'attendance_date' => $date,
            'students' => $students->map(fn ($student): array => [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'first_name' => $student->first_name,
                'last_name' => $student->last_name,
                'attendance' => $this->attendanceForStudent($records, $student->id),
            ])->values(),
        ];
    }

    /**
     * @param  Collection<int, AttendanceRecord>  $records
     * @return array<string, mixed>|null
     */
    private function attendanceForStudent(Collection $records, int $studentId): ?array
    {
        $record = $records->get($studentId);

        if (! $record) {
            return null;
        }

        return [
            'id' => $record->id,
            'status' => $record->status,
            'note' => $record->note,
        ];
    }
}
