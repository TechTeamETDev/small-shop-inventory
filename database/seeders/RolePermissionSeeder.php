<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            // Route/page permissions
            'dashboard.view',
            'products.view',
            'categories.view',
            'sales.view',
            'purchases.view',
            'suppliers.view',
            'users.view',
            'analytics.view',
            'profit.view',
            'activitylogs.view',
            'stockadjustments.view',

            // UI permissions already used in your React files
            'create sales',
            'delete sales',

            'create products',
            'edit products',
            'delete products',

            'manage users',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }

        $admin = Role::firstOrCreate([
            'name' => 'Admin',
            'guard_name' => 'web',
        ]);

        $employee = Role::firstOrCreate([
            'name' => 'Employee',
            'guard_name' => 'web',
        ]);

        $admin->syncPermissions($permissions);

        $employee->syncPermissions([
            'dashboard.view',
            'products.view',
            'sales.view',

            // Employee can create sales, but cannot delete sales/products/users
            'create sales',
        ]);
    }
}