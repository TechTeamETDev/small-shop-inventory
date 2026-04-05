<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Purchase extends Model
{
    protected $fillable = [
        'user_id',
        'supplier_name',
        'purchase_date',
        'total_cost',
        'status'
    ];

    // One purchase has many items [cite: 60]
    public function items(): HasMany
    {
        return $this->hasMany(PurchaseItem::class);
    }

    // A purchase belongs to the user (Admin) who created it [cite: 63]
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}