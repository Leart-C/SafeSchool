<?php

use App\Models\School;
use App\Models\SchoolClass;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance_records', function (Blueprint $table): void {
            $table->id();
            $table->foreignIdFor(School::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(SchoolClass::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(User::class, 'student_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignIdFor(User::class, 'recorded_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->date('attendance_date');
            $table->string('status', 20);
            $table->text('note')->nullable();
            $table->timestamps();

            $table->unique([
                'school_class_id',
                'student_user_id',
                'attendance_date',
            ], 'attendance_unique_student_class_date');

            $table->index([
                'school_id',
                'attendance_date',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_records');
    }
};
