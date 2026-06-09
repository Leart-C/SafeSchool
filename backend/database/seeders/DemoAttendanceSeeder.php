<?php

namespace Database\Seeders;

use App\Enums\AttendanceStatus;
use App\Models\AttendanceRecord;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoAttendanceSeeder extends Seeder
{
    public function run(): void
    {
        $school = School::query()
            ->where('slug', 'safe-school-demo')
            ->first();

        if (! $school) {
            return;
        }

        $student = User::query()
            ->where('school_id', $school->id)
            ->where('email', 'ada.student@example.com')
            ->first();

        $class = SchoolClass::query()
            ->where('school_id', $school->id)
            ->where('name', 'Grade 5A')
            ->first();

        $recordedBy = User::query()
            ->where('school_id', $school->id)
            ->where('email', 'bajramileart6@gmail.com')
            ->first();

        if (! $student || ! $class) {
            return;
        }

        AttendanceRecord::updateOrCreate(
            [
                'school_class_id' => $class->id,
                'student_user_id' => $student->id,
                'attendance_date' => now()->toDateString(),
            ],
            [
                'school_id' => $school->id,
                'recorded_by_user_id' => $recordedBy?->id,
                'status' => AttendanceStatus::Present->value,
                'note' => 'Arrived on time.',
            ],
        );

        AttendanceRecord::updateOrCreate(
            [
                'school_class_id' => $class->id,
                'student_user_id' => $student->id,
                'attendance_date' => now()->subDay()->toDateString(),
            ],
            [
                'school_id' => $school->id,
                'recorded_by_user_id' => $recordedBy?->id,
                'status' => AttendanceStatus::Late->value,
                'note' => 'Arrived 10 minutes late.',
            ],
        );
    }
}