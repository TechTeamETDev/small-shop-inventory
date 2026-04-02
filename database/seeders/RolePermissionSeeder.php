<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    public function run()
    {
        // Clear cached permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Define all permissions
        $permissions = [
            'view products',
            'create products',
            'edit products',
            'delete products',
            'create purchases',
            'view purchases',
            'create sales',
            'view sales',
            'view analytics',
            'view profit reports',
            'manage categories',
            'manage users'
        ];

        // Create permissions
        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web', // must match your auth guard
            ]);
        }

        // Create roles
        $admin = Role::firstOrCreate([
            'name' => 'Admin',
            'guard_name' => 'web',
        ]);

        $employee = Role::firstOrCreate([
            'name' => 'Employee',
            'guard_name' => 'web',
        ]);

        // Assign all permissions to Admin
        $admin->syncPermissions(Permission::all());

        // Assign limited permissions to Employee
        $employee->syncPermissions(Permission::whereIn('name', [
            'view products',
            'create sales',
            'view sales'
        ])->get());
    }
}