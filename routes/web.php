<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\ProfitController;

use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// --- Welcome page (public) ---
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Logout route
Route::post('/logout', function () {
    Auth::logout();
    request()->session()->invalidate();
    request()->session()->regenerateToken();
    return redirect('/');
})->name('logout');

// --- Authenticated routes ---
Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Profile routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // User Management - Admin only
    Route::middleware(['permission:manage users'])->group(function () {
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    });

    // Categories & Products
    Route::middleware(['auth'])->group(function () {
        Route::resource('categories', CategoryController::class)
            ->except(['create', 'edit', 'show']);
        Route::resource('products', ProductController::class)
            ->except(['create', 'edit', 'show']);
    });

    // ✅ Sales Routes - Explicit, clean, inside main auth group
    Route::get('/sales', [SaleController::class, 'index'])->name('sales.index');
    Route::get('/sales/create', [SaleController::class, 'create'])->name('sales.create');
    Route::post('/sales', [SaleController::class, 'store'])->name('sales.store');
    Route::get('/sales/{sale}', [SaleController::class, 'show'])->name('sales.show');
    Route::get('/sales/{sale}/edit', [SaleController::class, 'edit'])->name('sales.edit');
    Route::put('/sales/{sale}', [SaleController::class, 'update'])->name('sales.update');
    Route::delete('/sales/{sale}', [SaleController::class, 'destroy'])->name('sales.destroy');

    // Purchases
    Route::middleware(['permission:create purchases'])->group(function () {
        Route::resource('purchases', PurchaseController::class);
    });

    // Analytics
    Route::middleware(['permission:view analytics'])->group(function () {
        Route::get('/analytics', [AnalyticsController::class, 'index'])->name('analytics.index');
    });

    // Profit reports
    Route::middleware(['permission:view profit reports'])->group(function () {
        Route::get('/profit', [ProfitController::class, 'index'])->name('profit.index');
    });

}); // ← ✅ Main auth group closes HERE

// Debug route (optional, remove for production)
Route::get('/api/debug-db', function () {
    return [
        'database' => config('database.connections.mysql.database'),
        'host' => config('database.connections.mysql.host'),
        'sales_count' => \App\Models\Sale::count(),
        'products_count' => \App\Models\Product::count(),
    ];
})->middleware(['auth']);


// 🔍 TEST: Direct sale creation via URL
Route::get('/test-sale-direct', function () {
    try {
        $sale = \App\Models\Sale::create([
            'user_id' => auth()->id(),
            'customer_name' => 'Direct Test',
            'payment_method' => 'cash',
            'status' => 'completed',
            'total_amount' => 25.00,
        ]);
        
        $sale->items()->create([
            'sale_id' => $sale->id,
            'product_id' => 1,
            'quantity' => 1,
            'unit_price' => 25.00,
            'subtotal' => 25.00,
        ]);
        
        \App\Models\Product::where('id', 1)->decrement('current_quantity', 1);
        
        return redirect()->route('sales.index')->with('success', '✅ Direct test sale created!');
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
})->middleware(['auth']);

require __DIR__.'/auth.php';