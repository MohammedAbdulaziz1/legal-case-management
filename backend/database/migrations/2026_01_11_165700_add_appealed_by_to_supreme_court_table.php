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
        Schema::table('supreme_court', function (Blueprint $table) {
            $table->string('appealed_by')->nullable()->after('appeal_request_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('supreme_court', function (Blueprint $table) {
            $table->dropColumn('appealed_by');
        });
    }
};
