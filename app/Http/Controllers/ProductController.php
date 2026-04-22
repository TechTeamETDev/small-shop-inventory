<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {
        return Inertia::render('Products/Index', [
            'products' => Product::with('category')->latest()->get(),
            'categories' => Category::all(),
            'totalProducts' => Product::count(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'sku' => 'required|string|unique:products,sku',
            'unit_buy_price' => 'required|numeric|min:0',
            'unit_sell_price' => 'required|numeric|min:0|gt:unit_buy_price',
        ]);

        Product::create($validated);

        return back();
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'sku' => 'required|string|unique:products,sku,' . $product->id,
            'unit_buy_price' => 'required|numeric|min:0',
            'unit_sell_price' => 'required|numeric|min:0|gt:unit_buy_price',
        ]);

        $product->update($validated);

        return back();
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return back();
    }
}