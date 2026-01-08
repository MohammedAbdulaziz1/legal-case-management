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
        Schema::create('supreme_court', function (Blueprint $table) {
            $table->id('supreme_request_id');
            $table->date('supreme_date');
            $table->integer('supreme_case_number');
            $table->unsignedBigInteger('appeal_request_id');
            // Extended fields
            $table->string('status')->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->foreign('appeal_request_id')
                  ->references('appeal_request_id')
                  ->on('appeal')
                  ->onDelete('cascade')
                  ->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('supreme_court');
    }
};
