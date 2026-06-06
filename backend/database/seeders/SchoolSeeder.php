<?php

namespace Database\Seeders;

use App\Models\School;
use Illuminate\Database\Seeder;

class SchoolSeeder extends Seeder
{
    public function run(): void
    {
        School::firstOrCreate(
            ['slug' => 'safe-school-demo'],
            [
                'name' => 'SafeSchool Demo',
                'timezone' => 'Europe/Tirane',
                'is_active' => true,
            ]
        );
    }
}