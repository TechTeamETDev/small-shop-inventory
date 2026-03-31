<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // Get the authenticated user and eager-load roles
        $user = $request->user()?->load('roles');

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user
                    ? [
                        'id' => $user->id,
                        'name' => $user->name,
                        'roles' => $user->roles->map(fn($role) => [
                            'id' => $role->id,
                            'name' => $role->name,
                        ]),
                        'permissions' => $user
                            ->getAllPermissions()
                            ->pluck('name'),
                    ]
                    : null,
            ],
        ]);
    }
}