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
        Schema::table('case_registration', function (Blueprint $table) {
            $table->dropColumn(['session_date', 'next_session_date']);
        });

        Schema::table('appeal', function (Blueprint $table) {
            $table->dropColumn(['sessionDate']);
        });

        Schema::table('supreme_court', function (Blueprint $table) {
            $table->dropColumn(['sessionDate']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('case_registration', function (Blueprint $table) {
            $table->date('session_date');
            $table->date('next_session_date')->nullable();
        });

        Schema::table('appeal', function (Blueprint $table) {
            $table->date('sessionDate')->nullable();
        });

        Schema::table('supreme_court', function (Blueprint $table) {
            $table->date('sessionDate')->nullable();
        });
    }
};
