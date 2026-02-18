use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
| Only admin can access product management & predictions
*/
Route::middleware(['auth', 'role:admin'])->group(function () {

    Route::get('/admin/dashboard', function () {
        return view('admin.dashboard');
    });

    // Product management routes (placeholder)
    Route::get('/admin/products', function () {
        return "Manage Products";
    });

    // Prediction management routes (placeholder)
    Route::get('/admin/predictions', function () {
        return "Manage Predictions";
    });
});

/*
|--------------------------------------------------------------------------
| Employee Routes
|--------------------------------------------------------------------------
| Employees log sales and view stock
*/
Route::middleware(['auth', 'role:employee'])->group(function () {

    Route::get('/employee/dashboard', function () {
        return view('employee.dashboard');
    });

    Route::get('/sales', function () {
        return "Log Sales";
    });

    Route::get('/stock', function () {
        return "View Stock";
    });
});
