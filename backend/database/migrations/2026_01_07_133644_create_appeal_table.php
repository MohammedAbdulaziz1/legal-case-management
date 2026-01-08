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
        Schema::create('appeal', function (Blueprint $table) {
            $table->id('appeal_request_id');
            $table->integer('appeal_number');
            $table->date('appeal_date');
            $table->integer('appeal_court_number');
            $table->string('appeal_judgment');
            $table->string('appealed_by');
            $table->unsignedBigInteger('assigned_case_registration_request_id');
            // Extended fields
            $table->string('status')->default('active');
            $table->string('priority')->default('normal'); // normal, urgent
            $table->text('notes')->nullable();
            $table->string('plaintiff')->nullable();
            $table->string('plaintiff_lawyer')->nullable();
            $table->string('defendant')->nullable();
            $table->string('defendant_lawyer')->nullable();
            $table->string('subject')->nullable();
            $table->string('judge')->nullable();
            $table->timestamps();
            
            $table->foreign('assigned_case_registration_request_id')
                  ->references('assigned_case_registration_request_id')
                  ->on('case_registration')
                  ->onDelete('cascade')
                  ->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appeal');
    }
};
