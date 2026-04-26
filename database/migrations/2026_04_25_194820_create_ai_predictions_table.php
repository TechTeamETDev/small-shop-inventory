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
    Schema::create('ai_predictions', function (Blueprint $table) {
        $table->id();

        $table->foreignId('product_id')
              ->constrained()
              ->cascadeOnDelete();

        $table->enum('forecast_type', ['7d', '30d', '90d']);

        $table->integer('predicted_demand');
        $table->decimal('confidence_score', 5, 2)->nullable();

        $table->text('recommended_action')->nullable();

        $table->date('forecast_start');
        $table->date('forecast_end');

        $table->timestamps();
    });
}

public function down(): void
{
    Schema::dropIfExists('ai_predictions');
}
};
