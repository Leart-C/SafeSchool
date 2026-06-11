<?php

namespace Tests\Feature;

use App\Enums\AttendanceStatus;
use App\Enums\MessageAudience;
use App\Models\AttendanceRecord;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Firebase\JWT\JWT;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DirectorRoleAccessTest extends TestCase
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

    public function test_director_can_view_school_attendance(): void
    {
        [$school, $class, $student] = $this->schoolClassAndStudent();

        $director = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'user_director',
            'name' => 'Director User',
        ]);
        $director->assignRole('director');

        AttendanceRecord::query()->create([
            'school_id' => $school->id,
            'school_class_id' => $class->id,
            'student_user_id' => $student->id,
            'recorded_by_user_id' => $director->id,
            'attendance_date' => '2026-06-10',
            'status' => AttendanceStatus::Present->value,
            'note' => 'On time.',
        ]);

        $this
            ->withToken($this->tokenFor($director->clerk_user_id))
            ->getJson('/api/attendance')
            ->assertOk()
            ->assertJson([
                'message' => 'Attendance records retrieved.',
            ]);
    }

    public function test_director_can_view_any_class_roster_in_their_school(): void
    {
        [$school, $class] = $this->schoolClassAndStudent();

        $director = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'user_director',
        ]);
        $director->assignRole('director');

        $this
            ->withToken($this->tokenFor($director->clerk_user_id))
            ->getJson("/api/classes/{$class->id}/attendance-roster?date=2026-06-10")
            ->assertOk()
            ->assertJson([
                'message' => 'Attendance roster retrieved.',
            ]);
    }

    public function test_director_can_store_attendance_for_any_class_in_their_school(): void
    {
        [$school, $class, $student] = $this->schoolClassAndStudent();

        $director = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'user_director',
        ]);
        $director->assignRole('director');

        $this
            ->withToken($this->tokenFor($director->clerk_user_id))
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

    public function test_director_can_create_school_message(): void
    {
        $school = School::query()->create([
            'name' => 'SafeSchool Demo',
            'slug' => 'safe-school-demo',
            'timezone' => 'Europe/Tirane',
            'is_active' => true,
        ]);

        $director = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'user_director',
            'name' => 'Director User',
        ]);
        $director->assignRole('director');

        $this
            ->withToken($this->tokenFor($director->clerk_user_id))
            ->postJson('/api/messages', [
                'audience' => MessageAudience::School->value,
                'title' => 'Director announcement',
                'body' => 'Please review the weekly update.',
                'publish_now' => true,
            ])
            ->assertCreated()
            ->assertJson([
                'message' => 'Message created.',
                'data' => [
                    'message' => [
                        'audience' => 'school',
                        'title' => 'Director announcement',
                        'body' => 'Please review the weekly update.',
                    ],
                ],
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
