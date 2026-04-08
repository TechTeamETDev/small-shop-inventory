<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SaleController extends Controller
{
    /**
     * Display a listing of sales.
     */
    public function index()
    {
        $sales = Sale::with(['employee', 'items.product'])
            ->latest()
            ->paginate(15);

        return Inertia::render('Sale/Index', [
            'sales' => $sales,
        ]);
    }

    /**
     * Show the form for creating a new sale.
     */
    public function create()
    {
        $products = Product::where('current_quantity', '>', 0)
            ->where('is_active', true)
            ->select('id', 'name', 'unit_sell_price', 'current_quantity')
            ->get();

        return Inertia::render('Sale/Create', [
            'products' => $products
        ]);
    }

    /**
     * Store a newly created sale in storage.
     */
    public function store(Request $request)
    {
        \Log::info('=== SALE STORE STARTED ===');
        \Log::info('User ID: ' . auth()->id());
        \Log::info('Request data:', $request->all());

        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'payment_method' => 'required|in:cash,cbe,other_bank,telebirr',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        \Log::info('Validation passed');

        try {
            DB::transaction(function () use ($validated, &$sale) {
                // Create sale
                $sale = Sale::create([
                    'user_id' => auth()->id(),
                    'customer_name' => $validated['customer_name'],
                    'payment_method' => $validated['payment_method'],
                    'status' => 'completed',
                    'total_amount' => 0,
                ]);

                $total = 0;

                foreach ($validated['items'] as $item) {
                    \Log::info('Processing item:', $item);

                    $product = Product::findOrFail($item['product_id']);
                    if ($product->current_quantity < $item['quantity']) {
                        throw new \Exception("Not enough stock for {$product->name}");
                    }

                    $subtotal = $item['quantity'] * $item['unit_price'];

                    SaleItem::create([
                        'sale_id' => $sale->id,
                        'product_id' => $product->id,
                        'quantity' => $item['quantity'],
                        'unit_price' => $item['unit_price'],
                        'subtotal' => $subtotal,
                    ]);

                    $product->decrement('current_quantity', $item['quantity']);
                    $total += $subtotal;

                    \Log::info("Item processed. Subtotal: {$subtotal}");
                }

                // Update total
                $sale->update(['total_amount' => $total]);
                \Log::info("Sale completed successfully. Total: {$total}");
            });

            // SPA-compatible redirect with flash message
            return redirect()->route('sales.index')
                ->with('success', 'Sale completed successfully!');

        } catch (\Exception $e) {
            \Log::error('=== SALE STORE FAILED ===');
            \Log::error('Exception: ' . $e->getMessage());
            \Log::error('Trace: ' . $e->getTraceAsString());

            return back()->withErrors(['general' => 'Sale failed: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified sale.
     */
    public function show(Sale $sale)
    {
        $sale->load(['employee', 'items.product']);
        return Inertia::render('Sale/Show', ['sale' => $sale]);
    }

    /**
     * Cancel/delete the specified sale (restores stock).
     */
    public function destroy(Sale $sale)
    {
        try {
            DB::transaction(function () use ($sale) {
                foreach ($sale->items as $item) {
                    $item->product->increment('current_quantity', $item->quantity);
                    \Log::info("Restored {$item->quantity} units of product {$item->product->name}");
                }

                $sale->update(['status' => 'cancelled']);
                \Log::info("Sale #{$sale->id} marked as cancelled");
            });

            // SPA-compatible redirect with flash message
            return redirect()->route('sales.index')
                ->with('success', 'Sale cancelled and stock restored successfully!');

        } catch (\Exception $e) {
            \Log::error('Failed to delete sale: ' . $e->getMessage());
            return back()->withErrors(['general' => 'Failed to delete sale: ' . $e->getMessage()]);
        }
    }
}