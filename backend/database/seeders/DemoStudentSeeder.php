<?php

namespace Database\Seeders;

use App\Models\School;
use App\Models\SchoolClass;
use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class DemoStudentSeeder extends Seeder
{
    public function run(): void
    {
        Role::findOrCreate('student');
        Role::findOrCreate('parent');

        $school = School::query()
            ->where('slug', 'safe-school-demo')
            ->first();

        if (! $school) {
            return;
        }

        $student = User::firstOrCreate(
            ['email' => 'ada.student@example.com'],
            [
                'school_id' => $school->id,
                'name' => 'Ada Lovelace',
                'first_name' => 'Ada',
                'last_name' => 'Lovelace',
                'clerk_user_id' => 'demo_student_ada',
            ],
        );

        $student->assignRole('student');

        $parent = User::firstOrCreate(
            ['email' => 'parent.ada@example.com'],
            [
                'school_id' => $school->id,
                'name' => 'Mira Lovelace',
                'first_name' => 'Mira',
                'last_name' => 'Lovelace',
                'clerk_user_id' => 'demo_parent_mira',
            ],
        );

        $parent->assignRole('parent');

        $student->guardians()->syncWithoutDetaching([
            $parent->id => [
                'relationship' => 'mother',
                'is_primary' => true,
                'emergency_contact_priority' => 1,
            ],
        ]);

        $class = SchoolClass::query()
            ->where('school_id', $school->id)
            ->where('name', 'Grade 5A')
            ->first();

        if ($class) {
            $class->users()->syncWithoutDetaching([
                $student->id => ['role' => 'student'],
            ]);
        }
    }
}