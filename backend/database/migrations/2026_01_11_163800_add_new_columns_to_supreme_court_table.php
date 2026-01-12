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
            $table->date('sessionDate')->nullable();
            $table->string('supremeCourtJudgment')->nullable();
            $table->date('judgementdate')->nullable();
            $table->date('judgementrecivedate')->nullable();
            $table->string('priority')->default('normal');

            $table->string('court')->nullable();
            $table->string('judge')->nullable();
            $table->string('plaintiff')->nullable();
            $table->string('plaintiff_lawyer')->nullable();
            $table->string('defendant')->nullable();
            $table->string('defendant_lawyer')->nullable();
            $table->string('subject')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('supreme_court', function (Blueprint $table) {
            $table->dropColumn([
                'sessionDate',
                'supremeCourtJudgment',
                'judgementdate',
                'judgementrecivedate',
                'priority',
                'court',
                'judge',
                'plaintiff',
                'plaintiff_lawyer',
                'defendant',
                'defendant_lawyer',
                'subject',
            ]);
        });
    }
};
