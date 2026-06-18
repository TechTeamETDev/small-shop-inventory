<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SaleItem extends Model
{
    use HasFactory;

  protected $fillable = [
    'sale_id',
    'product_id',
    'quantity',
    'unit_price',
    'unit_cost',
    'tax_rate',
    'tax_amount',
    'subtotal',
    'cost_total',
    'profit',
    'stock_after_sale',
];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'unit_cost' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'cost_total' => 'decimal:2',
        'profit' => 'decimal:2',
        'stock_after_sale' => 'integer',
    ];

    // A sale item belongs to a sale
    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    // A sale item belongs to a product
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
