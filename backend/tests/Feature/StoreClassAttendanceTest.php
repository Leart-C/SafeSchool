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

class StoreClassAttendanceTest extends TestCase
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

    public function test_it_records_attendance_for_a_class_roster(): void
    {
        $school = School::query()->create([
            'name' => 'SafeSchool Demo',
            'slug' => 'safe-school-demo',
            'timezone' => 'Europe/Tirane',
            'is_active' => true,
        ]);

        $admin = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'user_123',
            'name' => 'Admin User',
        ]);
        $admin->assignRole('admin');

        $student = User::factory()->create([
            'school_id' => $school->id,
            'name' => 'Ada Lovelace',
            'email' => 'ada.student@example.com',
        ]);
        $student->assignRole('student');

        $class = SchoolClass::query()->create([
            'school_id' => $school->id,
            'name' => 'Grade 5A',
            'grade_level' => '5',
            'section' => 'A',
            'academic_year' => '2026-2027',
            'is_active' => true,
        ]);
        $class->users()->attach($student->id, ['role' => 'student']);

        $this
            ->withToken($this->tokenFor($admin->clerk_user_id))
            ->postJson("/api/classes/{$class->id}/attendance-records", [
                'attendance_date' => '2026-06-09',
                'records' => [
                    [
                        'student_user_id' => $student->id,
                        'status' => AttendanceStatus::Present->value,
                        'note' => 'On time.',
                    ],
                ],
            ])
            ->assertOk()
            ->assertJson([
                'message' => 'Attendance recorded.',
                'data' => [
                    'attendance' => [
                        'class' => [
                            'id' => $class->id,
                            'name' => 'Grade 5A',
                        ],
                        'attendance_date' => '2026-06-09',
                        'records' => [
                            [
                                'status' => 'present',
                                'note' => 'On time.',
                                'student' => [
                                    'id' => $student->id,
                                    'name' => 'Ada Lovelace',
                                    'email' => 'ada.student@example.com',
                                ],
                                'recorded_by' => [
                                    'id' => $admin->id,
                                    'name' => 'Admin User',
                                ],
                            ],
                        ],
                    ],
                ],
            ]);

        $this->assertTrue(
            AttendanceRecord::query()
                ->where('school_id', $school->id)
                ->where('school_class_id', $class->id)
                ->where('student_user_id', $student->id)
                ->where('recorded_by_user_id', $admin->id)
                ->whereDate('attendance_date', '2026-06-09')
                ->where('status', 'present')
                ->where('note', 'On time.')
                ->exists()
        );
    }

    public function test_it_updates_existing_attendance_for_same_student_class_and_date(): void
    {
        $school = School::query()->create([
            'name' => 'SafeSchool Demo',
            'slug' => 'safe-school-demo',
            'timezone' => 'Europe/Tirane',
            'is_active' => true,
        ]);

        $admin = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'user_123',
        ]);
        $admin->assignRole('admin');

        $student = User::factory()->create([
            'school_id' => $school->id,
        ]);
        $student->assignRole('student');

        $class = SchoolClass::query()->create([
            'school_id' => $school->id,
            'name' => 'Grade 5A',
            'grade_level' => '5',
            'section' => 'A',
            'academic_year' => '2026-2027',
            'is_active' => true,
        ]);
        $class->users()->attach($student->id, ['role' => 'student']);

        AttendanceRecord::query()->create([
            'school_id' => $school->id,
            'school_class_id' => $class->id,
            'student_user_id' => $student->id,
            'recorded_by_user_id' => $admin->id,
            'attendance_date' => '2026-06-09',
            'status' => AttendanceStatus::Absent->value,
            'note' => 'Original.',
        ]);

        $this
            ->withToken($this->tokenFor($admin->clerk_user_id))
            ->postJson("/api/classes/{$class->id}/attendance-records", [
                'attendance_date' => '2026-06-09',
                'records' => [
                    [
                        'student_user_id' => $student->id,
                        'status' => AttendanceStatus::Late->value,
                        'note' => 'Arrived late.',
                    ],
                ],
            ])
            ->assertOk();

        $this->assertDatabaseCount('attendance_records', 1);

        $this->assertTrue(
            AttendanceRecord::query()
                ->where('student_user_id', $student->id)
                ->whereDate('attendance_date', '2026-06-09')
                ->where('status', 'late')
                ->where('note', 'Arrived late.')
                ->exists()
        );
    }

    public function test_it_rejects_students_not_enrolled_in_the_class(): void
    {
        $school = School::query()->create([
            'name' => 'SafeSchool Demo',
            'slug' => 'safe-school-demo',
            'timezone' => 'Europe/Tirane',
            'is_active' => true,
        ]);

        $admin = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'user_123',
        ]);
        $admin->assignRole('admin');

        $student = User::factory()->create([
            'school_id' => $school->id,
        ]);
        $student->assignRole('student');

        $class = SchoolClass::query()->create([
            'school_id' => $school->id,
            'name' => 'Grade 5A',
            'grade_level' => '5',
            'section' => 'A',
            'academic_year' => '2026-2027',
            'is_active' => true,
        ]);

        $this
            ->withToken($this->tokenFor($admin->clerk_user_id))
            ->postJson("/api/classes/{$class->id}/attendance-records", [
                'attendance_date' => '2026-06-09',
                'records' => [
                    [
                        'student_user_id' => $student->id,
                        'status' => AttendanceStatus::Present->value,
                    ],
                ],
            ])
            ->assertNotFound()
            ->assertJson([
                'message' => 'Attendance could not be recorded for this class roster.',
            ]);
    }

    public function test_it_validates_payload(): void
    {
        $school = School::query()->create([
            'name' => 'SafeSchool Demo',
            'slug' => 'safe-school-demo',
            'timezone' => 'Europe/Tirane',
            'is_active' => true,
        ]);

        $admin = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'user_123',
        ]);
        $admin->assignRole('admin');

        $class = SchoolClass::query()->create([
            'school_id' => $school->id,
            'name' => 'Grade 5A',
            'grade_level' => '5',
            'section' => 'A',
            'academic_year' => '2026-2027',
            'is_active' => true,
        ]);

        $this
            ->withToken($this->tokenFor($admin->clerk_user_id))
            ->postJson("/api/classes/{$class->id}/attendance-records", [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'attendance_date',
                'records',
            ]);
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
