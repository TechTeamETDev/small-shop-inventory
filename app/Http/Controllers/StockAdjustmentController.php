<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StockAdjustment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StockAdjustmentController extends Controller
{
    public function create()
    {
        return Inertia::render('StockAdjustments/Create', [
            'categories' => \App\Models\Category::select('id', 'name')->get(),
            'products' => \App\Models\Product::select('id','name','current_quantity','category_id')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'type' => 'required|in:increment,decrement',
            'quantity' => 'required|integer|min:1',
            'note' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
        ]);

        $product = Product::findOrFail($validated['product_id']);

        // IMPORTANT: save previous stock BEFORE update
        $previousStock = $product->current_quantity;

        // update stock
        if ($validated['type'] === 'increment') {
            $product->current_quantity += $validated['quantity'];
        } else {
            if ($product->current_quantity < $validated['quantity']) {
                return back()->withErrors([
                    'quantity' => 'Not enough stock available'
                ]);
            }

            $product->current_quantity -= $validated['quantity'];
        }

        $product->save();

        // create stock adjustment log (FIXED)
        StockAdjustment::create([
            'product_id' => $product->id,
            'category_id' => $product->category_id, // ALWAYS from product
            'type' => $validated['type'],
            'quantity' => $validated['quantity'],
            'previous_stock' => $previousStock,
            'new_stock' => $product->current_quantity,
            'note' => $validated['note'] ?? null,
        ]);

        return redirect()->route('products.index')
            ->with('success', 'Stock updated successfully');
    }
}