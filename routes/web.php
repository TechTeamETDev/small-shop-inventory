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
    // Everyone sees the Welcome page, even if logged in
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

// --- Authenticated routes ---
Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Profile routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

  

// User Management - Admin only
Route::middleware(['auth', 'permission:manage users'])->group(function () {
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
});



Route::middleware(['auth'])->group(function () {
// Categories
    Route::resource('categories', CategoryController::class)
        ->except(['create', 'edit', 'show']);
  // Products
    Route::resource('products', ProductController::class)
        ->except(['create', 'edit', 'show']);
});
  
   
    // Sales
    Route::middleware(['permission:create sales'])->group(function () {
        Route::resource('sales', SaleController::class);
    });

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
});

require __DIR__.'/auth.php';