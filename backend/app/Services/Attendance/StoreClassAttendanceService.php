<?php

namespace App\Services\Attendance;

use App\Models\AttendanceRecord;
use App\Models\SchoolClass;
use Illuminate\Support\Facades\DB;

class StoreClassAttendanceService
{
    /**
     * @param  array<int, array<string, mixed>>  $records
     * @return array<string, mixed>|null
     */
    public function forSchool(
        SchoolClass $schoolClass,
        int $schoolId,
        int $recordedByUserId,
        string $attendanceDate,
        array $records
    ): ?array {
        if ($schoolClass->school_id !== $schoolId) {
            return null;
        }

        $studentIds = collect($records)
            ->pluck('student_user_id')
            ->unique()
            ->values();

        $validStudentIds = $schoolClass->students()
            ->whereIn('users.id', $studentIds)
            ->pluck('users.id');

        if ($validStudentIds->count() !== $studentIds->count()) {
            return null;
        }

        DB::transaction(function () use (
            $attendanceDate,
            $records,
            $recordedByUserId,
            $schoolClass,
            $schoolId
        ): void {
            foreach ($records as $record) {
                $this->storeRecord(
                    $schoolClass,
                    $schoolId,
                    $recordedByUserId,
                    $attendanceDate,
                    $record,
                );
            }
        });

        return $this->summary($schoolClass, $attendanceDate);
    }

    /**
     * @param  array<string, mixed>  $record
     */
    private function storeRecord(
        SchoolClass $schoolClass,
        int $schoolId,
        int $recordedByUserId,
        string $attendanceDate,
        array $record
    ): void {
        $attendanceRecord = AttendanceRecord::query()
            ->where('school_class_id', $schoolClass->id)
            ->where('student_user_id', $record['student_user_id'])
            ->whereDate('attendance_date', $attendanceDate)
            ->first();

        $values = [
            'school_id' => $schoolId,
            'school_class_id' => $schoolClass->id,
            'student_user_id' => $record['student_user_id'],
            'recorded_by_user_id' => $recordedByUserId,
            'attendance_date' => $attendanceDate,
            'status' => $record['status'],
            'note' => $record['note'] ?? null,
        ];

        if ($attendanceRecord) {
            $attendanceRecord->update($values);

            return;
        }

        AttendanceRecord::query()->create($values);
    }

    /**
     * @return array<string, mixed>
     */
    private function summary(SchoolClass $schoolClass, string $attendanceDate): array
    {
        $storedRecords = AttendanceRecord::query()
            ->where('school_class_id', $schoolClass->id)
            ->whereDate('attendance_date', $attendanceDate)
            ->with([
                'student:id,name,email,first_name,last_name',
                'recordedBy:id,name,email',
            ])
            ->orderBy('id')
            ->get();

        return [
            'class' => [
                'id' => $schoolClass->id,
                'name' => $schoolClass->name,
                'grade_level' => $schoolClass->grade_level,
                'section' => $schoolClass->section,
            ],
            'attendance_date' => $attendanceDate,
            'records' => $storedRecords->map(fn (AttendanceRecord $record): array => [
                'id' => $record->id,
                'status' => $record->status,
                'note' => $record->note,
                'student' => [
                    'id' => $record->student->id,
                    'name' => $record->student->name,
                    'email' => $record->student->email,
                    'first_name' => $record->student->first_name,
                    'last_name' => $record->student->last_name,
                ],
                'recorded_by' => $record->recordedBy ? [
                    'id' => $record->recordedBy->id,
                    'name' => $record->recordedBy->name,
                    'email' => $record->recordedBy->email,
                ] : null,
            ])->values(),
        ];
    }
}