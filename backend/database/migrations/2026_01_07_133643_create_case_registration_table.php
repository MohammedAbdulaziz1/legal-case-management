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
        Schema::create('case_registration', function (Blueprint $table) {
            $table->id('assigned_case_registration_request_id');
            $table->string('first_instance_judgment');
            $table->date('case_date');
            $table->integer('case_number');
            $table->date('session_date');
            $table->integer('court_number');
            // Extended fields
            $table->string('title')->nullable();
            $table->string('client')->nullable();
            $table->string('opponent')->nullable();
            $table->string('judge')->nullable();
            $table->date('next_session_date')->nullable();
            $table->string('status')->default('active'); // active, pending, judgment, closed, postponed
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('case_registration');
    }
};
