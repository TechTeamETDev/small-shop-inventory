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
    Schema::table('products', function (Blueprint $table) {
        $table->timestamp('last_sold_at')->nullable();
        $table->integer('total_sold_quantity')->default(0);
    });
}

public function down(): void
{
    Schema::table('products', function (Blueprint $table) {
        $table->dropColumn(['last_sold_at', 'total_sold_quantity']);
    });
}
};
