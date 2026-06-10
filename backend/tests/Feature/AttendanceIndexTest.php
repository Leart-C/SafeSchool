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

class AttendanceIndexTest extends TestCase
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

    public function test_it_lists_attendance_records_for_the_authenticated_users_school(): void
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
            'name' => 'Admin User',
        ]);
        $admin->assignRole('admin');

        $student = User::factory()->create([
            'school_id' => $school->id,
            'name' => 'Ada Lovelace',
            'first_name' => 'Ada',
            'last_name' => 'Lovelace',
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

        $record = AttendanceRecord::query()->create([
            'school_id' => $school->id,
            'school_class_id' => $class->id,
            'student_user_id' => $student->id,
            'recorded_by_user_id' => $admin->id,
            'attendance_date' => '2026-06-09',
            'status' => AttendanceStatus::Present->value,
            'note' => 'On time.',
        ]);

        $otherStudent = User::factory()->create([
            'school_id' => $otherSchool->id,
            'name' => 'Hidden Student',
        ]);

        $otherClass = SchoolClass::query()->create([
            'school_id' => $otherSchool->id,
            'name' => 'Hidden Class',
            'grade_level' => '6',
            'section' => 'B',
            'academic_year' => '2026-2027',
            'is_active' => true,
        ]);

        AttendanceRecord::query()->create([
            'school_id' => $otherSchool->id,
            'school_class_id' => $otherClass->id,
            'student_user_id' => $otherStudent->id,
            'recorded_by_user_id' => null,
            'attendance_date' => '2026-06-09',
            'status' => AttendanceStatus::Absent->value,
            'note' => 'Hidden.',
        ]);

        $this
            ->withToken($this->tokenFor($admin->clerk_user_id))
            ->getJson('/api/attendance')
            ->assertOk()
            ->assertJson([
                'message' => 'Attendance records retrieved.',
                'data' => [
                    'attendance_records' => [
                        [
                            'id' => $record->id,
                            'attendance_date' => '2026-06-09',
                            'status' => 'present',
                            'note' => 'On time.',
                            'class' => [
                                'id' => $class->id,
                                'name' => 'Grade 5A',
                                'grade_level' => '5',
                                'section' => 'A',
                            ],
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
            ])
            ->assertJsonMissing([
                'name' => 'Hidden Student',
            ])
            ->assertJsonMissing([
                'name' => 'Hidden Class',
            ]);
    }

    public function test_it_rejects_users_without_school_scope(): void
    {
        $admin = User::factory()->create([
            'school_id' => null,
            'clerk_user_id' => 'user_123',
        ]);
        $admin->assignRole('admin');

        $this
            ->withToken($this->tokenFor($admin->clerk_user_id))
            ->getJson('/api/attendance')
            ->assertForbidden()
            ->assertJson([
                'message' => 'Authenticated user is not assigned to a school.',
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
