<?php

namespace App\Services\Attendance;

use App\Models\AttendanceRecord;
use Illuminate\Support\Collection;

class ListAttendanceRecordsService
{
    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function forSchool(int $schoolId): Collection
    {
        return AttendanceRecord::query()
            ->where('school_id', $schoolId)
            ->with([
                'schoolClass:id,name,grade_level,section',
                'student:id,name,email,first_name,last_name',
                'recordedBy:id,name,email',
            ])
            ->latest('attendance_date')
            ->latest('id')
            ->limit(50)
            ->get()
            ->map(fn (AttendanceRecord $record): array => [
                'id' => $record->id,
                'attendance_date' => $record->attendance_date->toDateString(),
                'status' => $record->status,
                'note' => $record->note,
                'class' => [
                    'id' => $record->schoolClass->id,
                    'name' => $record->schoolClass->name,
                    'grade_level' => $record->schoolClass->grade_level,
                    'section' => $record->schoolClass->section,
                ],
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
            ])
            ->values();
    }
}