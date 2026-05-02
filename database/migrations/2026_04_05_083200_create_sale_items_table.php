<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sale_items', function (Blueprint $table) {
            $table->id();

            // 🔗 Relations
            $table->foreignId('sale_id')
                ->constrained()
                ->onDelete('cascade');

            $table->foreignId('product_id')
                ->constrained()
                ->onDelete('restrict');

            // 📦 Sale details
            $table->integer('quantity')->default(1);

            // 💰 Pricing
            $table->decimal('unit_price', 10, 2);
            $table->decimal('unit_cost', 10, 2)->default(0);

            // 📊 Calculations
            $table->decimal('subtotal', 10, 2);
            $table->decimal('cost_total', 10, 2)->default(0);
            $table->decimal('profit', 10, 2)->default(0);

            // 📉 Inventory tracking
            $table->integer('stock_after_sale')->nullable();

            // 🕒 System fields
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sale_items');
    }
};