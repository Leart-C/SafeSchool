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
        Schema::create('messages', function (Blueprint $table): void {
            $table->id();
            $table->foreignIdFor(School::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(User::class, 'sender_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignIdFor(SchoolClass::class)->nullable()->constrained()->nullOnDelete();
            $table->string('audience', 30);
            $table->string('title');
            $table->text('body');
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->index([
                'school_id',
                'audience',
                'published_at',
            ]);

            $table->index([
                'school_id',
                'school_class_id',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
