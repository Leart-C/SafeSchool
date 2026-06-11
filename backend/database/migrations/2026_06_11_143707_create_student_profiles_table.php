<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_profiles', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->foreignIdFor(User::class, 'user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('student_code');
            $table->date('date_of_birth')->nullable();
            $table->string('grade_level')->nullable();
            $table->string('enrollment_status')->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['school_id', 'student_code']);
            $table->index(['school_id', 'grade_level']);
            $table->index(['school_id', 'enrollment_status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_profiles');
    }
};