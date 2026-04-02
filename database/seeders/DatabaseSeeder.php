<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1️ First seed roles and permissions (from laravel-migration)
        $this->call(RolePermissionSeeder::class);

        // 2️ Then seed users (Admin & Employee) (from laravel-migration)
        $this->call(UsersSeeder::class);

        // 3️ Optional: create a single test user (from HEAD)
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
    }
}