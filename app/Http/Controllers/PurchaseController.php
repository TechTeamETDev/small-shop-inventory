<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Product;
use App\Models\Supplier; 
use App\Models\Category;
use Inertia\Inertia;

class PurchaseController extends Controller
{
    public function index()
    {
        // Fetching with supplier to show names in the management list
        $purchases = Purchase::with('supplier')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Purchases/Index', [
            'purchases' => $purchases
        ]);
    }

    public function create()
    {
        return Inertia::render('Purchases/Create', [
            'products' => Product::all(),
            'suppliers' => Supplier::all(),
            'categories' => Category::all() 
        ]);
    }

    public function getProductsByCategory($categoryId)
    {
        $products = Product::where('category_id', $categoryId)->get();
        return response()->json($products);
    }

    public function store(Request $request)
    {
       $validated = $request->validate([
            'supplier_id'   => 'required|exists:suppliers,id',
            'purchase_date' => 'required|date',
            'status'        => 'required|in:Pending,Completed',
            'items'         => 'required|array|min:1',
            'items.*.id'    => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        try {
            DB::beginTransaction();

            $supplier = Supplier::find($request->supplier_id);

            $purchase = Purchase::create([
                'user_id'       => Auth::id(),
                'supplier_id'   => $request->supplier_id,
                'supplier_name' => $supplier->name ?? 'Unknown Supplier', 
                'purchase_date' => $request->purchase_date,
                'status'        => $request->status,
                'total_cost'    => 0, 
            ]);

            $totalPurchaseCost = 0;

            foreach ($request->items as $item) {
                $product = Product::find($item['id']);
                $unitCost = $item['unit_cost'] ?? $product->unit_buy_price ?? 0;
                
                $subtotal = $item['quantity'] * $unitCost;
                $totalPurchaseCost += $subtotal;

                PurchaseItem::create([
                    'purchase_id' => $purchase->id,
                    'product_id'  => $item['id'],
                    'quantity'    => $item['quantity'],
                    'unit_cost'   => $unitCost,
                    'subtotal'    => $subtotal,
                ]);

                if ($request->status === 'Completed') {
                    $product->increment('current_quantity', $item['quantity']);
                }
            }

            $purchase->update(['total_cost' => $totalPurchaseCost]);

            DB::commit();
            return redirect()->route('purchases.index')->with('success', 'Purchase recorded successfully.');

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Purchase Store Error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to save purchase: ' . $e->getMessage()]);
        }
    }

    public function edit(Purchase $purchase)
    {
        $purchase->load(['items.product' => function ($query) {
            $query->withTrashed();
        }, 'supplier']);

        return Inertia::render('Purchases/Edit', [ 
            'purchase'   => $purchase,
            'products'   => Product::all(), 
            'suppliers'  => Supplier::all(),
            'categories' => Category::all()
        ]);
    }

    public function show(Purchase $purchase)
    {
        $purchase->load(['items.product', 'supplier']); 

        return Inertia::render('Purchases/Show', [
            'purchase' => $purchase
        ]);
    }

 public function update(Request $request, Purchase $purchase)
{
    // 1. Validate using the correct field name 'supplier_id'
    $request->validate([
        'supplier_id'   => 'required',
        'purchase_date' => 'required',
        'status'        => 'required',
        'items'         => 'required|array|min:1',
    ]);

    try {
        DB::beginTransaction();

        // --- STEP A: REVERSE OLD STOCK ---
        // Before deleting the old items, subtract their quantities from the products
        foreach ($purchase->items as $oldItem) {
            $product = \App\Models\Product::find($oldItem->product_id);
            if ($product) {
                $product->decrement('current_quantity', $oldItem->quantity);
            }
        }

        $calculatedTotal = 0;

        // 2. Clear old items and recreate new ones
        $purchase->items()->delete();

        foreach ($request->items as $item) {
            $qty = (int)$item['quantity'];
            $cost = (float)($item['unit_cost'] ?? 0);
            $subtotal = $qty * $cost;
            $calculatedTotal += $subtotal;

            $productId = $item['id'] ?? $item['product_id'];

            $purchase->items()->create([
                'product_id' => $productId,
                'quantity'   => $qty,
                'unit_cost'  => $cost,
                'subtotal'   => $subtotal,
            ]);

            // --- STEP B: APPLY NEW STOCK ---
            // Add the new quantities to the products
            $product = \App\Models\Product::find($productId);
            if ($product) {
                $product->increment('current_quantity', $qty);
            }
        }

        // 3. THE FORCE SAVE LOGIC
        $purchase->supplier_id   = $request->supplier_id;
        $purchase->purchase_date = $request->purchase_date;
        $purchase->status        = $request->status;
        $purchase->total_cost    = $calculatedTotal; 

        $purchase->save(); 

        DB::commit();

        return redirect()->route('purchases.index')
            ->with('success', 'Purchase updated to ETB ' . number_format($calculatedTotal, 2));

    } catch (\Exception $e) {
        DB::rollback();
        \Log::error('Purchase Update Failed: ' . $e->getMessage());
        return back()->withErrors(['error' => 'Database error: ' . $e->getMessage()]);
    }
}
public function destroy(Purchase $purchase)
{
    try {
        DB::beginTransaction();

        // 1. Delete all associated items first to maintain integrity
        $purchase->items()->delete();

        // 2. Delete the main purchase record
        $purchase->delete();

        DB::commit();

        return redirect()->route('purchases.index')->with('success', 'Purchase deleted successfully.');
    } catch (\Exception $e) {
        DB::rollback();
        \Log::error('Purchase Delete Error: ' . $e->getMessage());
        return back()->withErrors(['error' => 'Failed to delete purchase.']);
    }
}
}