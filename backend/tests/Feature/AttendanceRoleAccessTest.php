<?php

namespace Tests\Feature;

use App\Enums\AttendanceStatus;
use App\Models\AttendanceRecord;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Firebase\JWT\JWT;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AttendanceRoleAccessTest extends TestCase
{
    use RefreshDatabase;

    private string $privateKey;

    private string $publicKey;

    protected function setUp(): void
    {
        parent::setUp();

        $keyPair = openssl_pkey_new([
            'digest_alg' => 'sha256',
            'private_key_bits' => 2048,
            'private_key_type' => OPENSSL_KEYTYPE_RSA,
        ]);

        $privateKey = '';
        openssl_pkey_export($keyPair, $privateKey);
        $this->privateKey = $privateKey;

        $details = openssl_pkey_get_details($keyPair);
        $this->publicKey = $details['key'];

        config([
            'clerk.jwt_key' => $this->publicKey,
            'clerk.secret_key' => null,
            'clerk.jwt_audience' => 'safeschool-api',
            'clerk.jwt_authorized_parties' => ['http://localhost:5173'],
        ]);

        $this->seed(RoleSeeder::class);
    }

    public function test_admin_can_view_school_attendance(): void
    {
        [$school, $class, $student] = $this->schoolClassAndStudent();

        $admin = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'user_admin',
        ]);
        $admin->assignRole('admin');

        AttendanceRecord::query()->create([
            'school_id' => $school->id,
            'school_class_id' => $class->id,
            'student_user_id' => $student->id,
            'recorded_by_user_id' => $admin->id,
            'attendance_date' => '2026-06-10',
            'status' => AttendanceStatus::Present->value,
            'note' => 'On time.',
        ]);

        $this
            ->withToken($this->tokenFor($admin->clerk_user_id))
            ->getJson('/api/attendance')
            ->assertOk()
            ->assertJson([
                'message' => 'Attendance records retrieved.',
            ]);
    }

    public function test_parent_cannot_view_school_attendance_management(): void
    {
        $school = School::query()->create([
            'name' => 'SafeSchool Demo',
            'slug' => 'safe-school-demo',
            'timezone' => 'Europe/Tirane',
            'is_active' => true,
        ]);

        $parent = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'user_parent',
        ]);
        $parent->assignRole('parent');

        $this
            ->withToken($this->tokenFor($parent->clerk_user_id))
            ->getJson('/api/attendance')
            ->assertForbidden()
            ->assertJson([
                'message' => 'You are not allowed to view school attendance.',
            ]);
    }

    public function test_teacher_can_view_roster_for_assigned_class(): void
    {
        [$school, $class] = $this->schoolClassAndStudent();

        $teacher = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'user_teacher',
        ]);
        $teacher->assignRole('teacher');

        $class->users()->attach($teacher->id, ['role' => 'teacher']);

        $this
            ->withToken($this->tokenFor($teacher->clerk_user_id))
            ->getJson("/api/classes/{$class->id}/attendance-roster?date=2026-06-10")
            ->assertOk()
            ->assertJson([
                'message' => 'Attendance roster retrieved.',
            ]);
    }

    public function test_teacher_cannot_view_roster_for_unassigned_class(): void
    {
        [$school, $class] = $this->schoolClassAndStudent();

        $teacher = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'user_teacher',
        ]);
        $teacher->assignRole('teacher');

        $this
            ->withToken($this->tokenFor($teacher->clerk_user_id))
            ->getJson("/api/classes/{$class->id}/attendance-roster?date=2026-06-10")
            ->assertForbidden()
            ->assertJson([
                'message' => 'You are not allowed to view this attendance roster.',
            ]);
    }

    public function test_teacher_can_store_attendance_for_assigned_class(): void
    {
        [$school, $class, $student] = $this->schoolClassAndStudent();

        $teacher = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'user_teacher',
        ]);
        $teacher->assignRole('teacher');

        $class->users()->attach($teacher->id, ['role' => 'teacher']);

        $this
            ->withToken($this->tokenFor($teacher->clerk_user_id))
            ->postJson("/api/classes/{$class->id}/attendance-records", [
                'attendance_date' => '2026-06-10',
                'records' => [
                    [
                        'student_user_id' => $student->id,
                        'status' => AttendanceStatus::Present->value,
                        'note' => null,
                    ],
                ],
            ])
            ->assertOk()
            ->assertJson([
                'message' => 'Attendance recorded.',
            ]);
    }

    public function test_teacher_cannot_store_attendance_for_unassigned_class(): void
    {
        [$school, $class, $student] = $this->schoolClassAndStudent();

        $teacher = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'user_teacher',
        ]);
        $teacher->assignRole('teacher');

        $this
            ->withToken($this->tokenFor($teacher->clerk_user_id))
            ->postJson("/api/classes/{$class->id}/attendance-records", [
                'attendance_date' => '2026-06-10',
                'records' => [
                    [
                        'student_user_id' => $student->id,
                        'status' => AttendanceStatus::Present->value,
                    ],
                ],
            ])
            ->assertForbidden()
            ->assertJson([
                'message' => 'You are not allowed to manage attendance for this class.',
            ]);
    }

    public function test_student_cannot_store_attendance(): void
    {
        [$school, $class, $student] = $this->schoolClassAndStudent();

        $student->update([
            'clerk_user_id' => 'user_student',
        ]);
        $student->assignRole('student');

        $this
            ->withToken($this->tokenFor($student->clerk_user_id))
            ->postJson("/api/classes/{$class->id}/attendance-records", [
                'attendance_date' => '2026-06-10',
                'records' => [
                    [
                        'student_user_id' => $student->id,
                        'status' => AttendanceStatus::Present->value,
                    ],
                ],
            ])
            ->assertForbidden()
            ->assertJson([
                'message' => 'You are not allowed to manage attendance for this class.',
            ]);
    }

    /**
     * @return array{0: School, 1: SchoolClass, 2: User}
     */
    private function schoolClassAndStudent(): array
    {
        $school = School::query()->create([
            'name' => 'SafeSchool Demo',
            'slug' => 'safe-school-demo',
            'timezone' => 'Europe/Tirane',
            'is_active' => true,
        ]);

        $student = User::factory()->create([
            'school_id' => $school->id,
            'name' => 'Ada Lovelace',
            'email' => 'ada.student@example.com',
        ]);

        $class = SchoolClass::query()->create([
            'school_id' => $school->id,
            'name' => 'Grade 5A',
            'grade_level' => '5',
            'section' => 'A',
            'academic_year' => '2026-2027',
            'is_active' => true,
        ]);

        $class->users()->attach($student->id, ['role' => 'student']);

        return [$school, $class, $student];
    }

    private function tokenFor(string $clerkUserId): string
    {
        return JWT::encode([
            'azp' => 'http://localhost:5173',
            'aud' => 'safeschool-api',
            'exp' => now()->addMinutes(10)->timestamp,
            'iat' => now()->timestamp,
            'iss' => 'https://clerk.safeschool.test',
            'nbf' => now()->subMinute()->timestamp,
            'sid' => 'sess_test_123',
            'sub' => $clerkUserId,
            'v' => 2,
        ], $this->privateKey, 'RS256');
    }
}
