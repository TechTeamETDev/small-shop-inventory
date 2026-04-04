<?php

namespace App\Http\Controllers;

use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseController extends Controller
{
    /**
     * Step 3: Filtering Logic
     * Returns products based on a selected category for the frontend dropdown.
     */
    public function getProductsByCategory($category_id)
    {
        $products = Product::where('category_id', $category_id)->get();
        return response()->json($products);
    }

    /**
     * Step 4: Storage & Inventory Logic
     * Saves the purchase and updates product stock if status is "Completed".
     */
    public function store(Request $request)
    {
        // Use a Transaction to ensure data integrity
        DB::transaction(function () use ($request) {
            
            // 1. Create the main Purchase record
            $purchase = Purchase::create([
                'user_id' => auth()->id(),
                'supplier_name' => $request->supplier_name,
                'total_cost' => $request->total_cost,
                'purchase_date' => $request->purchase_date,
                'status' => $request->status, // e.g., 'Pending' or 'Completed'
            ]);

            // 2. Loop through each item sent from the frontend
            foreach ($request->items as $item) {
                PurchaseItem::create([
                    'purchase_id' => $purchase->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_cost' => $item['unit_cost'],
                    'subtotal' => $item['quantity'] * $item['unit_cost'],
                ]);

                // 3. THE INVENTORY LOGIC: Update stock ONLY if status is "Completed"
                if ($request->status === 'Completed') {
                    $product = Product::find($item['product_id']);
                    if ($product) {
                       $product->increment('current_quantity', $item['quantity']);
                        // This adds the purchased amount to the current stock
                    }
                }
            }
        });

        return response()->json(['message' => 'Purchase recorded and inventory updated successfully!']);
    }
}