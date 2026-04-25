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
    Schema::create('ai_snapshots', function (Blueprint $table) {
        $table->id();

        $table->date('snapshot_date');

        $table->decimal('total_sales', 12, 2)->default(0);
        $table->decimal('total_profit', 12, 2)->default(0);

        $table->foreignId('top_product_id')
              ->nullable()
              ->constrained('products')
              ->nullOnDelete();

        $table->integer('low_stock_count')->default(0);

        $table->enum('sales_trend', ['up', 'down', 'stable'])->nullable();

        $table->timestamps();
    });
}

public function down(): void
{
    Schema::dropIfExists('ai_snapshots');
}
};
