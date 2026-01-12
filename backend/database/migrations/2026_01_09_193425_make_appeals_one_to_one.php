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
        $table->unique('assigned_case_registration_request_id');
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appeal', function (Blueprint $table) {
        $table->dropUnique(['assigned_case_registration_request_id']);
        });
    }
};
