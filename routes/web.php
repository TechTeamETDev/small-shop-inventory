<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\StockAdjustmentController;
use App\Http\Controllers\AIDashboardController;
use App\Http\Controllers\RoleController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::post('/logout', function () {
    Auth::logout();

    request()->session()->invalidate();
    request()->session()->regenerateToken();

    return redirect('/');
})->name('logout');

/*
|--------------------------------------------------------------------------
| AUTH ROUTES
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {

    /*
    |--------------------------------------------------------------------------
    | DASHBOARD
    |--------------------------------------------------------------------------
    */

    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->middleware('permission:dashboard.view')
        ->name('dashboard');

    /*
    |--------------------------------------------------------------------------
    | PROFILE
    |--------------------------------------------------------------------------
    */

    Route::get('/profile', [ProfileController::class, 'edit'])
        ->name('profile.edit');

    Route::patch('/profile', [ProfileController::class, 'update'])
        ->name('profile.update');

    Route::delete('/profile', [ProfileController::class, 'destroy'])
        ->name('profile.destroy');

    /*
    |--------------------------------------------------------------------------
    | PRODUCTS
    |--------------------------------------------------------------------------
    */

    Route::middleware(['permission:products.view'])->group(function () {

        Route::resource('products', ProductController::class)
            ->except(['create', 'edit', 'show']);
    });

    /*
    |--------------------------------------------------------------------------
    | CATEGORIES
    |--------------------------------------------------------------------------
    */

    Route::middleware(['permission:categories.manage'])->group(function () {

        Route::resource('categories', CategoryController::class)
            ->except(['create', 'edit', 'show']);
    });

    /*
    |--------------------------------------------------------------------------
    | SALES
    |--------------------------------------------------------------------------
    */

    Route::middleware(['permission:sales.view'])->group(function () {

        Route::resource('sales', SaleController::class);
    });

    /*
    |--------------------------------------------------------------------------
    | PURCHASES
    |--------------------------------------------------------------------------
    */

    Route::middleware(['permission:purchases.view'])->group(function () {

        Route::get('/purchases', [PurchaseController::class, 'index'])
            ->name('purchases.index');

        Route::get('/purchases/create', [PurchaseController::class, 'create'])
            ->name('purchases.create');

        Route::post('/purchases', [PurchaseController::class, 'store'])
            ->name('purchases.store');

        Route::post('/purchases/{id}/update-payment', [PurchaseController::class, 'updatePaymentStatus'])
            ->name('purchases.updatePayment');

        Route::get('/purchases/get-products/{categoryId}', [PurchaseController::class, 'getProductsByCategory'])
            ->name('purchases.getProducts');

        Route::resource('purchases', PurchaseController::class)
            ->except(['index', 'create', 'store']);
    });

    /*
    |--------------------------------------------------------------------------
    | USERS
    |--------------------------------------------------------------------------
    */

    Route::middleware(['permission:users.view'])->group(function () {

        Route::get('/users', [UserController::class, 'index'])
            ->name('users.index');

        Route::post('/users', [UserController::class, 'store'])
            ->middleware('permission:users.create')
            ->name('users.store');

        Route::put('/users/{user}', [UserController::class, 'update'])
            ->middleware('permission:users.edit')
            ->name('users.update');

        Route::delete('/users/{user}', [UserController::class, 'destroy'])
            ->middleware('permission:users.delete')
            ->name('users.destroy');
    });

    /*
    |--------------------------------------------------------------------------
    | SUPPLIERS
    |--------------------------------------------------------------------------
    */

    Route::middleware(['permission:suppliers.manage'])->group(function () {

        Route::resource('suppliers', SupplierController::class);
    });

    /*
    |--------------------------------------------------------------------------
    | STOCK ADJUSTMENTS
    |--------------------------------------------------------------------------
    */

    Route::middleware(['permission:stock.manage'])->group(function () {

        Route::get('/stock-adjustments/create', [StockAdjustmentController::class, 'create']);

        Route::post('/stock-adjustments', [StockAdjustmentController::class, 'store']);

        Route::put('/stock-adjustments/{id}', [StockAdjustmentController::class, 'update']);

        Route::delete('/stock-adjustments/{id}', [StockAdjustmentController::class, 'destroy']);
    });

    /*
    |--------------------------------------------------------------------------
    | AI
    |--------------------------------------------------------------------------
    */

    Route::post('/ai/run/{productId}', [DashboardController::class, 'runAiManually']);

    Route::post('/ai/run-all', [DashboardController::class, 'runAllAi']);

    /*
    |--------------------------------------------------------------------------
    | ANALYTICS
    |--------------------------------------------------------------------------
    */

    Route::middleware(['permission:analytics.view'])->group(function () {

        Route::get('/ai/dashboard', [AIDashboardController::class, 'dashboard']);

        Route::get('/analytics', [AIDashboardController::class, 'dashboard'])
            ->name('analytics.index');
    });

    
Route::middleware(['permission:users.view'])->group(function () {

    Route::resource('roles', RoleController::class);

});

    /*
    |--------------------------------------------------------------------------
    | PROFIT REPORTS
    |--------------------------------------------------------------------------
    */

    Route::middleware(['permission:reports.profit.view'])->group(function () {

        Route::get('/profit', [ReportController::class, 'index'])
            ->name('profit.index');

        Route::get('/reports/profit-summary', [ReportController::class, 'getProfitSummary']);
    });
});

require __DIR__.'/auth.php';