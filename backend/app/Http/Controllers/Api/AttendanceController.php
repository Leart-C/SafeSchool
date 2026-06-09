<?php

namespace App\Http\Controllers\Api;

use App\Services\Attendance\ListAttendanceRecordsService;
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
}