<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class PurchaseController extends Controller
{
    // Step 51: View all purchases
   public function index()
{
    // Fetch purchases from database [cite: 36]
    $purchases = Purchase::with('user')->latest()->get(); 
    
    // Render the React component using Inertia
    return inertia('Purchases/Index', [
        'purchases' => $purchases
    ]);
}

    // Step 6: Show the "Add Purchase" form
   // app/Http/Controllers/PurchaseController.php

public function create()
{
    return inertia('Purchases/Create', [
        'categories' => Category::all()
    ]);
}

public function getProductsByCategory($categoryId)
{
    $products = Product::where('category_id', $categoryId)
                       ->where('is_active', true)
                       ->get();
    return response()->json($products);
}
public function store(Request $request)
{
    // Validate the incoming data from your React form
    $request->validate([
        'supplier_name' => 'required|string',
        'purchase_date' => 'required|date',
        'status' => 'required|in:Pending,Completed',
        'items' => 'required|array|min:1',
        'items.*.product_id' => 'required|exists:products,id',
        'items.*.quantity' => 'required|integer|min:1',
        'items.*.unit_cost' => 'required|numeric|min:0',
    ]);

    try {
        DB::beginTransaction();

        // 1. Create the Purchase (Step 5)
        $purchase = Purchase::create([
            'user_id' => Auth::id(),
            'supplier_name' => $request->supplier_name,
            'purchase_date' => $request->purchase_date,
            'status' => $request->status,
            'total_cost' => 0, // We will update this after calculating subtotals
        ]);

        $totalPurchaseCost = 0;

        foreach ($request->items as $item) {
            $subtotal = $item['quantity'] * $item['unit_cost']; // Step 29
            $totalPurchaseCost += $subtotal;

            // 2. Save each item (Step 5)
            PurchaseItem::create([
                'purchase_id' => $purchase->id,
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'unit_cost' => $item['unit_cost'],
                'subtotal' => $subtotal,
            ]);

            // 3. Update Inventory ONLY if status is Completed (Step 6)
            if ($request->status === 'Completed') {
                $product = Product::find($item['product_id']);
                // new_quantity = current_quantity + purchased_quantity
                $product->increment('current_quantity', $item['quantity']); //
            }
        }

        // Update the final total cost (Step 33)
        $purchase->update(['total_cost' => $totalPurchaseCost]);

        DB::commit();

        return redirect()->route('purchases.index')
            ->with('success', 'Purchase recorded successfully.');

    } catch (\Exception $e) {
        DB::rollback();
        return back()->with('error', 'Something went wrong: ' . $e->getMessage());
    }
}
public function show($id)
{
    // Fetch the purchase along with its items and the related products
    $purchase = Purchase::with(['user', 'items.product'])->findOrFail($id);

    return inertia('Purchases/Show', [
        'purchase' => $purchase
    ]);
}
public function edit(Purchase $purchase)
{
    // Load categories for the dropdown and items for the table
    return inertia('Purchases/Edit', [
        'purchase' => $purchase->load('items.product'),
        'categories' => Category::all(),
    ]);
}

public function update(Request $request, Purchase $purchase)
{
    $request->validate([
        'supplier_name' => 'required',
        'purchase_date' => 'required',
        'status' => 'required',
        'items' => 'required|array',
    ]);

    // Update main purchase info
    $purchase->update($request->only('supplier_name', 'purchase_date', 'status'));

    // Sync items: Delete old ones and re-add (simplest for demos)
    $purchase->items()->delete();
    foreach ($request->items as $item) {
        $purchase->items()->create($item);
    }

    return redirect()->route('purchases.index');
}
}