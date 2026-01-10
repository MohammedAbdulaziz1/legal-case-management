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
            // Add missing columns for case registration
            $table->string('plaintiff')->nullable();
            $table->string('plaintiffLawyer')->nullable();
            $table->string('defendant')->nullable();
            $table->string('defendantLawyer')->nullable();
            $table->string('court')->nullable();
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
                'plaintiff',
                'plaintiffLawyer',
                'defendant',
                'defendantLawyer',
                'court',
                'judgementdate',
                'judgementrecivedate',
            ]);
        });
    }
};
