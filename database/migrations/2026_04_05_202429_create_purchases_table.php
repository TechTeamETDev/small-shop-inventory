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
    Schema::create('purchases', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Belongs to user [cite: 63]
        $table->string('supplier_name'); // Step 1: Manual entry [cite: 8]
        $table->timestamp('purchase_date'); // Step 1 [cite: 9]
        $table->decimal('total_cost', 15, 2)->default(0); // Step 4 [cite: 33]
        $table->string('status')->default('Pending'); // Step 1 (Pending/Completed) [cite: 10]
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchases');
    }
};
