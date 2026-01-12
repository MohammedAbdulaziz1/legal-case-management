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
        Schema::table('appeal', function (Blueprint $table) {
            // Add missing columns for case registration
            $table->date('sessionDate')->nullable();
            $table->date('judgementdate')->nullable();
            $table->date('judgementrecivedate')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('case_registration', function (Blueprint $table) {
            $table->dropColumn([
                'sessionDate',
                'judgementdate',
                'judgementrecivedate',
            ]);
        });
    }
};
