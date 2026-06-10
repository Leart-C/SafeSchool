<?php

namespace Database\Seeders;

use App\Models\School;
use App\Models\SchoolClass;
use Illuminate\Database\Seeder;

class DemoClassSeeder extends Seeder
{
    public function run(): void
    {
        $school = School::query()
            ->where('slug', 'safe-school-demo')
            ->first();

        if (! $school) {
            return;
        }

        SchoolClass::firstOrCreate(
            [
                'school_id' => $school->id,
                'name' => 'Grade 5A',
                'academic_year' => '2026-2027',
            ],
            [
                'grade_level' => '5',
                'section' => 'A',
                'is_active' => true,
            ],
        );

        SchoolClass::firstOrCreate(
            [
                'school_id' => $school->id,
                'name' => 'Grade 6B',
                'academic_year' => '2026-2027',
            ],
            [
                'grade_level' => '6',
                'section' => 'B',
                'is_active' => true,
            ],
        );

        SchoolClass::firstOrCreate(
            [
                'school_id' => $school->id,
                'name' => 'Grade 7C',
                'academic_year' => '2026-2027',
            ],
            [
                'grade_level' => '7',
                'section' => 'C',
                'is_active' => false,
            ],
        );
    }
}
