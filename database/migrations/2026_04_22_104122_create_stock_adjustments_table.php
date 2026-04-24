<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('stock_adjustments', function (Blueprint $table) {
            $table->id();

            //  CATEGORY (NEW)
            $table->foreignId('category_id')
                ->constrained()
                ->cascadeOnDelete();

            //  PRODUCT
            $table->foreignId('product_id')
                ->constrained()
                ->cascadeOnDelete();

            //  TYPE
            $table->enum('type', ['increment', 'decrement']);

            //  QUANTITY
            $table->integer('quantity');

            // STOCK TRACKING (IMPORTANT)
            $table->integer('previous_stock');
            $table->integer('new_stock');

            //  NOTE
            $table->text('note')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_adjustments');
    }
};