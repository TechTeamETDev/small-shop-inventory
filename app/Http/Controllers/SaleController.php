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
    public function index()
    {
        $sales = Sale::with(['employee', 'items.product'])
            ->latest()
            ->paginate(15);

        return Inertia::render('Sale/Index', [
            'sales' => $sales,
        ]);
    }

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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'payment_method' => 'required|in:cash,cbe,other_bank,telebirr',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        try {
            // FIX: We must use $validated inside the transaction
            return DB::transaction(function () use ($validated) {
                // 1. Create the Sale
                $sale = Sale::create([
                    'user_id' => auth()->id(),
                    'customer_name' => $validated['customer_name'],
                    'customer_phone' => $validated['customer_phone'], // Corrected: using $validated
                    'payment_method' => $validated['payment_method'],
                    'status' => 'completed',
                    'total_amount' => 0, 
                ]);

                $total = 0;

                // 2. Process Items
                foreach ($validated['items'] as $item) {
                    $product = Product::findOrFail($item['product_id']);
                    
                    if ($product->current_quantity < $item['quantity']) {
                        throw new \Exception("Not enough stock for {$product->name}");
                    }

                    $subtotal = $item['quantity'] * $item['unit_price'];

                    // Create SaleItem
                    $sale->items()->create([
                        'product_id' => $product->id,
                        'quantity' => $item['quantity'],
                        'unit_price' => $item['unit_price'],
                        'subtotal' => $subtotal,
                        // Using unit_buy_price for forecasting
                        'profit' => $subtotal - ($product->unit_buy_price * $item['quantity']), 
                    ]);

                    // 3. Update Inventory
                    $product->decrement('current_quantity', $item['quantity']);
                    $total += $subtotal;
                }

                // 4. Finalize Sale
                $sale->update(['total_amount' => $total]);

                return redirect()->route('sales.index')->with('success', 'Sale saved successfully!');
            });

        } catch (\Exception $e) {
            return back()->withErrors(['general' => $e->getMessage()]);
        }
    }

    public function show(Sale $sale)
    {
        $sale->load(['employee', 'items.product']);
        return Inertia::render('Sale/Show', ['sale' => $sale]);
    }

    public function destroy(Sale $sale)
    {
        try {
            DB::transaction(function () use ($sale) {
                foreach ($sale->items as $item) {
                    $item->product->increment('current_quantity', $item->quantity);
                }
                $sale->update(['status' => 'cancelled']);
            });

            // FIX: Using redirect() instead of Inertia::location to avoid the method error
            return redirect()->route('sales.index')->with('success', 'Sale cancelled successfully!');

        } catch (\Exception $e) {
            return back()->withErrors(['general' => 'Failed to delete: ' . $e->getMessage()]);
        }
    }
}