<?php

namespace Tests\Feature;

use App\Models\School;
use App\Models\SchoolClass;
use App\Models\User;
use App\Services\Classes\AssignUserToClassService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use InvalidArgumentException;
use Tests\TestCase;

class AssignUserToClassServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_assigns_a_teacher_to_a_class_in_the_same_school(): void
    {
        $school = $this->school();
        $class = $this->schoolClass($school);
        $teacher = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'teacher_123',
        ]);

        app(AssignUserToClassService::class)->assign($teacher, $class, 'teacher');

        $this->assertDatabaseHas('class_user', [
            'school_class_id' => $class->id,
            'user_id' => $teacher->id,
            'role' => 'teacher',
        ]);

        $this->assertTrue($teacher->teachingClasses()->whereKey($class->id)->exists());
        $this->assertTrue($class->teachers()->whereKey($teacher->id)->exists());
    }

    public function test_it_assigns_a_student_to_a_class_in_the_same_school(): void
    {
        $school = $this->school();
        $class = $this->schoolClass($school);
        $student = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'student_123',
        ]);

        app(AssignUserToClassService::class)->assign($student, $class, 'student');

        $this->assertDatabaseHas('class_user', [
            'school_class_id' => $class->id,
            'user_id' => $student->id,
            'role' => 'student',
        ]);

        $this->assertTrue($student->enrolledClasses()->whereKey($class->id)->exists());
        $this->assertTrue($class->students()->whereKey($student->id)->exists());
    }

    public function test_it_rejects_assigning_a_user_from_another_school(): void
    {
        $classSchool = $this->school('Class School', 'class-school');
        $userSchool = $this->school('User School', 'user-school');

        $class = $this->schoolClass($classSchool);
        $user = User::factory()->create([
            'school_id' => $userSchool->id,
            'clerk_user_id' => 'teacher_123',
        ]);

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('User and class must belong to the same school.');

        app(AssignUserToClassService::class)->assign($user, $class, 'teacher');
    }

    public function test_it_rejects_assigning_users_or_classes_without_school_scope(): void
    {
        $school = $this->school();
        $class = $this->schoolClass($school);
        $user = User::factory()->create([
            'school_id' => null,
            'clerk_user_id' => 'teacher_123',
        ]);

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('User and class must both belong to a school.');

        app(AssignUserToClassService::class)->assign($user, $class, 'teacher');
    }

    public function test_it_rejects_unsupported_class_roles(): void
    {
        $school = $this->school();
        $class = $this->schoolClass($school);
        $user = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'user_123',
        ]);

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Class role is not supported.');

        app(AssignUserToClassService::class)->assign($user, $class, 'principal');
    }

    public function test_it_does_not_create_duplicate_class_assignments(): void
    {
        $school = $this->school();
        $class = $this->schoolClass($school);
        $teacher = User::factory()->create([
            'school_id' => $school->id,
            'clerk_user_id' => 'teacher_123',
        ]);

        $service = app(AssignUserToClassService::class);

        $service->assign($teacher, $class, 'teacher');
        $service->assign($teacher, $class, 'teacher');

        $this->assertDatabaseCount('class_user', 1);
    }

    private function school(string $name = 'SafeSchool Demo', string $slug = 'safe-school-demo'): School
    {
        return School::query()->create([
            'name' => $name,
            'slug' => $slug,
            'timezone' => 'Europe/Tirane',
            'is_active' => true,
        ]);
    }

    private function schoolClass(School $school): SchoolClass
    {
        return SchoolClass::query()->create([
            'school_id' => $school->id,
            'name' => 'Grade 5A',
            'grade_level' => '5',
            'section' => 'A',
            'academic_year' => '2026-2027',
            'is_active' => true,
        ]);
    }
}
