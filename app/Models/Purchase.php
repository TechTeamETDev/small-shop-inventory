<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Purchase extends Model
{

    protected $fillable = ['user_id', 'supplier_name', 'total_cost', 'purchase_date', 'status'];

    public function items()
    {
        return $this->hasMany(PurchaseItem::class);
    }
}