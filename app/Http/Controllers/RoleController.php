<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{
    public function index()
    {
        $roles = Role::with('permissions')->get();

        $permissions = Permission::all();

        return Inertia::render('Roles/Index', [
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:roles,name',
            'description' => 'nullable|string',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $role = Role::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
        ]);

        $role->syncPermissions(
            $validated['permissions'] ?? []
        );

        return back()->with('success', 'Role created.');
    }

    public function update(Request $request, Role $role)
    {
        if ($role->name === 'Admin') {
            return back()->with('error', 'Admin role cannot be edited.');
        }

        $validated = $request->validate([
            'name' => 'required|string|unique:roles,name,' . $role->id,
            'description' => 'nullable|string',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $role->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
        ]);

        $role->syncPermissions(
            $validated['permissions'] ?? []
        );

        return back()->with('success', 'Role updated.');
    }

    public function destroy(Role $role)
    {
        if ($role->name === 'Admin') {
            return back()->with('error', 'Admin role cannot be deleted.');
        }

        $role->delete();

        return back()->with('success', 'Role deleted.');
    }
}