<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AIPrediction extends Model
{
    protected $table = 'ai_predictions';

    protected $fillable = [
        'product_id',
        'product_name',
        'predicted_demand',
        'avg_daily_demand',
        'current_quantity',
        'confidence_score',
        'trend',
        'recommended_action',
        'risk_score',
        'forecast_start',
        'forecast_end',
    ];

    protected $casts = [
        'predicted_demand' => 'integer',
        'current_quantity' => 'integer',
        'avg_daily_demand' => 'float',
        'confidence_score' => 'float',
        'risk_score' => 'float',
        'forecast_start' => 'date',
        'forecast_end' => 'date',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
