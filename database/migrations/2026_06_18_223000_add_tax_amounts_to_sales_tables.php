<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->decimal('total_tax_amount', 15, 2)->default(0)->after('total_amount');
        });

        Schema::table('sale_items', function (Blueprint $table) {
            $table->decimal('tax_rate', 5, 2)->default(0)->after('unit_cost');
            $table->decimal('tax_amount', 10, 2)->default(0)->after('subtotal');
        });
    }

    public function down(): void
    {
        Schema::table('sale_items', function (Blueprint $table) {
            $table->dropColumn(['tax_rate', 'tax_amount']);
        });

        Schema::table('sales', function (Blueprint $table) {
            $table->dropColumn('total_tax_amount');
        });
    }
};
