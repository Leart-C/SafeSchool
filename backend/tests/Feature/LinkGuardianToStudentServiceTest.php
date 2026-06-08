<?php

namespace Tests\Feature;

use App\Models\School;
use App\Models\User;
use App\Services\Users\LinkGuardianToStudentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use InvalidArgumentException;
use Tests\TestCase;

class LinkGuardianToStudentServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_links_a_guardian_to_a_student_in_the_same_school(): void
    {
        $school = School::query()->create([
            'name' => 'SafeSchool Demo',
            'slug' => 'safe-school-demo',
            'timezone' => 'Europe/Tirane',
            'is_active' => true,
        ]);

        $guardian = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'guardian_123',
        ]);

        $student = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'student_123',
        ]);

        app(LinkGuardianToStudentService::class)->link(
            guardian: $guardian,
            student: $student,
            relationship: 'mother',
            isPrimary: true,
            emergencyContactPriority: 1,
        );

        $this->assertDatabaseHas('guardian_student', [
            'guardian_user_id' => $guardian->id,
            'student_user_id' => $student->id,
            'relationship' => 'mother',
            'is_primary' => true,
            'emergency_contact_priority' => 1,
        ]);

        $this->assertTrue($guardian->students()->whereKey($student->id)->exists());
        $this->assertTrue($student->guardians()->whereKey($guardian->id)->exists());
    }

    public function test_it_rejects_linking_users_from_different_schools(): void
    {
        $guardianSchool = School::query()->create([
            'name' => 'Guardian School',
            'slug' => 'guardian-school',
            'timezone' => 'Europe/Tirane',
            'is_active' => true,
        ]);

        $studentSchool = School::query()->create([
            'name' => 'Student School',
            'slug' => 'student-school',
            'timezone' => 'Europe/Tirane',
            'is_active' => true,
        ]);

        $guardian = User::factory()->create([
            'school_id' => $guardianSchool->id,
            'clerk_user_id' => 'guardian_123',
        ]);

        $student = User::factory()->create([
            'school_id' => $studentSchool->id,
            'clerk_user_id' => 'student_123',
        ]);

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Guardian and student must belong to the same school.');

        app(LinkGuardianToStudentService::class)->link($guardian, $student);
    }

    public function test_it_rejects_linking_users_without_school_scope(): void
    {
        $guardian = User::factory()->create([
            'school_id' => null,
            'clerk_user_id' => 'guardian_123',
        ]);

        $student = User::factory()->create([
            'school_id' => null,
            'clerk_user_id' => 'student_123',
        ]);

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Guardian and student must both belong to a school.');

        app(LinkGuardianToStudentService::class)->link($guardian, $student);
    }

    public function test_it_does_not_create_duplicate_guardian_student_links(): void
    {
        $school = School::query()->create([
            'name' => 'SafeSchool Demo',
            'slug' => 'safe-school-demo',
            'timezone' => 'Europe/Tirane',
            'is_active' => true,
        ]);

        $guardian = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'guardian_123',
        ]);

        $student = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'student_123',
        ]);

        $service = app(LinkGuardianToStudentService::class);

        $service->link($guardian, $student, 'mother');
        $service->link($guardian, $student, 'mother');

        $this->assertDatabaseCount('guardian_student', 1);
    }

    public function test_it_rejects_linking_a_user_to_themselves(): void
    {
        $school = School::query()->create([
            'name' => 'SafeSchool Demo',
            'slug' => 'safe-school-demo',
            'timezone' => 'Europe/Tirane',
            'is_active' => true,
        ]);

        $user = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'user_123',
        ]);

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('A user cannot be linked as their own guardian.');

        app(LinkGuardianToStudentService::class)->link($user, $user);
    }
}