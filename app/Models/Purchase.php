<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Purchase extends Model
{
 protected $fillable = [
        'user_id', 
        'supplier_id', 
        'purchase_date', 
        'total_cost', // This MUST be here to allow updates
        'status'
    ];

    // ADD THIS RELATIONSHIP
   public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function items()
    {
        return $this->hasMany(PurchaseItem::class);
    }

    // A purchase belongs to the user (Admin) who created it [cite: 63]
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}