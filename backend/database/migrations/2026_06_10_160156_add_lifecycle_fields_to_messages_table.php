<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table): void {
            $table->timestamp('edited_at')->nullable()->after('published_at');
            $table->timestamp('archived_at')->nullable()->after('edited_at');

            $table->index([
                'school_id',
                'archived_at',
                'published_at',
            ], 'messages_school_archive_published_index');
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table): void {
            $table->dropIndex('messages_school_archive_published_index');

            $table->dropColumn([
                'edited_at',
                'archived_at',
            ]);
        });
    }
};