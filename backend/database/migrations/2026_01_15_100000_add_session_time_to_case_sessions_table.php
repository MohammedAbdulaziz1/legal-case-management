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
        Schema::table('case_sessions', function (Blueprint $table) {
            $table->time('session_time')->nullable()->after('session_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('case_sessions', function (Blueprint $table) {
            $table->dropColumn('session_time');
        });
    }
};
