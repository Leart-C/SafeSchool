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

class ClassAttendanceRosterTest extends TestCase
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

    public function test_it_returns_class_roster_with_existing_attendance_for_date(): void
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
            'name' => 'Ada Lovelace',
            'first_name' => 'Ada',
            'last_name' => 'Lovelace',
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

        $record = AttendanceRecord::query()->create([
            'school_id' => $school->id,
            'school_class_id' => $class->id,
            'student_user_id' => $student->id,
            'recorded_by_user_id' => $admin->id,
            'attendance_date' => '2026-06-09',
            'status' => AttendanceStatus::Present->value,
            'note' => 'On time.',
        ]);

        $this
            ->withToken($this->tokenFor($admin->clerk_user_id))
            ->getJson("/api/classes/{$class->id}/attendance-roster?date=2026-06-09")
            ->assertOk()
            ->assertJson([
                'message' => 'Attendance roster retrieved.',
                'data' => [
                    'roster' => [
                        'class' => [
                            'id' => $class->id,
                            'name' => 'Grade 5A',
                        ],
                        'attendance_date' => '2026-06-09',
                        'students' => [
                            [
                                'id' => $student->id,
                                'name' => 'Ada Lovelace',
                                'attendance' => [
                                    'id' => $record->id,
                                    'status' => 'present',
                                    'note' => 'On time.',
                                ],
                            ],
                        ],
                    ],
                ],
            ]);
    }

    public function test_it_rejects_classes_from_another_school(): void
    {
        $school = School::query()->create([
            'name' => 'SafeSchool Demo',
            'slug' => 'safe-school-demo',
            'timezone' => 'Europe/Tirane',
            'is_active' => true,
        ]);

        $otherSchool = School::query()->create([
            'name' => 'Other School',
            'slug' => 'other-school',
            'timezone' => 'Europe/Tirane',
            'is_active' => true,
        ]);

        $admin = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'user_123',
        ]);
        $admin->assignRole('admin');

        $class = SchoolClass::query()->create([
            'school_id' => $otherSchool->id,
            'name' => 'Hidden Class',
            'grade_level' => '6',
            'section' => 'B',
            'academic_year' => '2026-2027',
            'is_active' => true,
        ]);

        $this
            ->withToken($this->tokenFor($admin->clerk_user_id))
            ->getJson("/api/classes/{$class->id}/attendance-roster?date=2026-06-09")
            ->assertNotFound()
            ->assertJson([
                'message' => 'Class was not found for this school.',
            ]);
    }

    public function test_it_validates_date(): void
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
            ->getJson("/api/classes/{$class->id}/attendance-roster")
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['date']);
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
