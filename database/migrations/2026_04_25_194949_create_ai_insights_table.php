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
    Schema::create('ai_insights', function (Blueprint $table) {
        $table->id();

        $table->foreignId('product_id')
              ->nullable()
              ->constrained()
              ->nullOnDelete();

        $table->enum('type', ['spike', 'drop', 'warning', 'opportunity']);

        $table->text('message');

        $table->enum('severity', ['low', 'medium', 'high'])->default('low');

        $table->timestamps();
    });
}

public function down(): void
{
    Schema::dropIfExists('ai_insights');
}
};
