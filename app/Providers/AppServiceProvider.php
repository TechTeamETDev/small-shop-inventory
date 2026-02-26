<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // RBAC Gates
        Gate::define('isAdmin', fn($user) => $user->role === 'admin');
        Gate::define('isEmployee', fn($user) => $user->role === 'employee');
    }
}