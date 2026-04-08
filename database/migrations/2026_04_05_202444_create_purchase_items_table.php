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
    Schema::create('purchase_items', function (Blueprint $table) {
        $table->id();
        $table->foreignId('purchase_id')->constrained()->onDelete('cascade'); // One purchase -> many items [cite: 60]
        $table->foreignId('product_id')->constrained(); // Item belongs to product [cite: 61]
        $table->integer('quantity'); // Step 3 [cite: 26]
        $table->decimal('unit_cost', 15, 2); // Step 3 [cite: 27]
        $table->decimal('subtotal', 15, 2); // Step 3: quantity x unit_cost [cite: 29]
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_items');
    }
};
