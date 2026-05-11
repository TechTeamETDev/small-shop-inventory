<?php

namespace App\Http\Controllers;

use App\Models\AIPrediction;
use App\Models\AIInsight;
use App\Models\AIAlert;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AnalysisController extends Controller
{
    /**
     * Display AI analysis dashboard for admin
     */
    public function index()
    {
        // ===================================
        // PREDICTIONS - Latest for each product
        // ===================================
        $predictions = AIPrediction::query()
            ->select(DB::raw('MAX(id) as id'), 'product_id')
            ->groupBy('product_id')
            ->pluck('id')
            ->toArray();

        $latestPredictions = AIPrediction::whereIn('id', $predictions)
            ->with('product')
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($pred) {
                return [
                    'id' => $pred->id,
                    'product_id' => $pred->product_id,
                    'product_name' => $pred->product_name,
                    'predicted_demand' => $pred->predicted_demand,
                    'avg_daily_demand' => $pred->avg_daily_demand,
                    'current_quantity' => $pred->current_quantity,
                    'confidence_score' => $pred->confidence_score,
                    'trend' => $pred->trend,
                    'recommended_action' => $pred->recommended_action,
                    'risk_score' => $pred->risk_score,
                    'forecast_start' => $pred->forecast_start,
                    'forecast_end' => $pred->forecast_end,
                    'created_at' => $pred->created_at,
                ];
            });

        // ===================================
        // INSIGHTS - Latest insights
        // ===================================
        $insights = AIInsight::query()
            ->orderByDesc('created_at')
            ->limit(20)
            ->get()
            ->map(function ($insight) {
                return [
                    'id' => $insight->id,
                    'product_id' => $insight->product_id,
                    'product_name' => $insight->product_name,
                    'insight_type' => $insight->insight_type,
                    'severity' => $insight->severity,
                    'message' => $insight->message,
                    'reason_summary' => $insight->reason_summary,
                    'created_at' => $insight->created_at,
                ];
            });

        // ===================================
        // ALERTS - Unresolved and recent
        // ===================================
        $alerts = AIAlert::query()
            ->orderByDesc('created_at')
            ->where('is_resolved', false)
            ->limit(6)
            ->get()
            ->map(function ($alert) {
                return [
                    'id' => $alert->id,
                    'product_id' => $alert->product_id,
                    'product_name' => $alert->product_name,
                    'alert_type' => $alert->alert_type,
                    'alert_message' => $alert->alert_message,
                    'priority' => $alert->priority,
                    'is_resolved' => $alert->is_resolved,
                    'created_at' => $alert->created_at,
                ];
            });

        // ===================================
        // STATISTICS
        // ===================================
        $stats = [
            'total_predictions' => AIPrediction::count(),
            'critical_alerts' => AIAlert::where('priority', 'critical')
                ->where('is_resolved', false)
                ->count(),
            'high_risk_products' => AIPrediction::where('risk_score', '>=', 7)
                ->distinct('product_id')
                ->count(),
            'high_severity_insights' => AIInsight::where('severity', 'high')->count(),
        ];

        return Inertia::render('Analysis/Index', [
            'predictions' => $latestPredictions,
            'insights' => $insights,
            'alerts' => $alerts,
            'stats' => $stats,
        ]);
    }

    /**
     * Get predictions for a specific product
     */
    public function productPredictions($productId)
    {
        $predictions = AIPrediction::where('product_id', $productId)
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        return response()->json($predictions);
    }

    /**
     * Get alerts for a specific product
     */
    public function productAlerts($productId)
    {
        $alerts = AIAlert::where('product_id', $productId)
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        return response()->json($alerts);
    }

    /**
     * Resolve an alert
     */
    public function resolveAlert($alertId)
    {
        $alert = AIAlert::findOrFail($alertId);
        $alert->update(['is_resolved' => true]);

        return response()->json(['success' => true, 'message' => 'Alert resolved']);
    }

    /**
     * Get prediction trend for product
     */
    public function predictionTrend($productId)
    {
        $predictions = AIPrediction::where('product_id', $productId)
            ->orderBy('created_at')
            ->get();

        return response()->json($predictions);
    }

    /**
     * Show all alerts (paginated)
     */
    public function allAlerts()
    {
        $alerts = AIAlert::query()
            ->orderByDesc('created_at')
            ->paginate(50);

        return Inertia::render('Analysis/Alerts', [
            'alerts' => $alerts,
        ]);
    }
}
