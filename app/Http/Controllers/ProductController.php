<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        return Inertia::render('Products/Index', [
            'products' => Product::with('category')->latest()->get(),
            'categories' => Category::all(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'sku' => 'required|unique:products',
            'unit_buy_price' => 'required|numeric',
            'unit_sell_price' => 'required|numeric',
        ]);

        Product::create($request->all());

        return back();
    }

    public function update(Request $request, Product $product)
    {
        $product->update($request->all());

        return back();
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return back();
    }
}
