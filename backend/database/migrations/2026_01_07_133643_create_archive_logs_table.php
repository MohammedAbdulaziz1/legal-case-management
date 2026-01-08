<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('archive_logs', function (Blueprint $table) {
            $table->id();
            $table->string('case_type'); // primary, appeal, supreme
            $table->unsignedBigInteger('case_id');
            $table->string('action'); // created, updated, deleted
            $table->json('old_data')->nullable();
            $table->json('new_data')->nullable();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            
            $table->index(['case_type', 'case_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('archive_logs');
    }
};
