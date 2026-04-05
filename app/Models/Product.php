<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'sku',
        'current_quantity',
        'unit_buy_price',
        'unit_sell_price',
        'min_stock_level',
        'is_active',
    ];

   // Add this inside your Product class
public function purchaseItems(): \Illuminate\Database\Eloquent\Relations\HasMany
{
    return $this->hasMany(PurchaseItem::class);
}

public function category(): \Illuminate\Database\Eloquent\Relations\BelongsTo
{
    return $this->belongsTo(Category::class);
}
}