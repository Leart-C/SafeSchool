<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\ClassAttendanceRosterRequest;
use App\Http\Requests\StoreClassAttendanceRequest;
use App\Models\SchoolClass;
use App\Services\Attendance\GetClassAttendanceRosterService;
use App\Services\Attendance\ListAttendanceRecordsService;
use App\Services\Attendance\StoreClassAttendanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends ApiController
{
    public function index(
        Request $request,
        ListAttendanceRecordsService $attendanceRecords
    ): JsonResponse {
        $user = $request->user();

        if (! $user->school_id) {
            return $this->error(
                'Authenticated user is not assigned to a school.',
                status: 403,
            );
        }

        return $this->success([
            'attendance_records' => $attendanceRecords->forSchool($user->school_id),
        ], 'Attendance records retrieved.');
    }

    public function roster(
        ClassAttendanceRosterRequest $request,
        SchoolClass $class,
        GetClassAttendanceRosterService $attendanceRoster
    ): JsonResponse {
        $user = $request->user();

        if (! $user->school_id) {
            return $this->error(
                'Authenticated user is not assigned to a school.',
                status: 403,
            );
        }

        $roster = $attendanceRoster->forSchool(
            $class,
            $user->school_id,
            $request->string('date')->toString(),
        );

        if (! $roster) {
            return $this->error(
                'Class was not found for this school.',
                status: 404,
            );
        }

        return $this->success([
            'roster' => $roster,
        ], 'Attendance roster retrieved.');
    }

    public function storeClassAttendance(
        StoreClassAttendanceRequest $request,
        SchoolClass $class,
        StoreClassAttendanceService $attendance
    ): JsonResponse {
        $user = $request->user();

        if (! $user->school_id) {
            return $this->error(
                'Authenticated user is not assigned to a school.',
                status: 403,
            );
        }

        $summary = $attendance->forSchool(
            $class,
            $user->school_id,
            $user->id,
            $request->string('attendance_date')->toString(),
            $request->validated('records'),
        );

        if (! $summary) {
            return $this->error(
                'Attendance could not be recorded for this class roster.',
                status: 404,
            );
        }

        return $this->success([
            'attendance' => $summary,
        ], 'Attendance recorded.');
    }
}
