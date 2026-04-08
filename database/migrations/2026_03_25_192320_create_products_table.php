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
        Schema::create('products', function (Blueprint $table) {
            $table->id();

            // Category relation
            $table->foreignId('category_id')
                  ->nullable()
                  ->constrained()
                  ->nullOnDelete();

            $table->string('name');
            $table->string('sku')->unique();

            $table->integer('current_quantity')->default(0);

            $table->decimal('unit_buy_price', 10, 2);
            $table->decimal('unit_sell_price', 10, 2);

            $table->integer('min_stock_level')->default(0);
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            // Soft deletes column
            $table->softDeletes(); // Adds nullable 'deleted_at' column
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};