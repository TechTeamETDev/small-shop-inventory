<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class AiController extends Controller
{
    public function index()
    {
        // use explicit query() to help static analysis tools recognize the builder
        $lowStockProducts = Product::query()
            ->whereColumn('current_quantity', '<=', 'min_stock_level')
            ->with('category')
            ->get();

        return Inertia::render('AiInsights', [
            'lowStockProducts' => $lowStockProducts,
        ]);
    }

    public function product($id)
    {
        $base = env('AI_API_URL', 'http://127.0.0.1:5000');

        try {
            $resp = Http::timeout(10)->get($base . '/predict/' . $id);

            if ($resp->failed()) {
                return response()->json(['error' => 'AI service request failed'], 502);
            }

            return response()->json($resp->json());

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
