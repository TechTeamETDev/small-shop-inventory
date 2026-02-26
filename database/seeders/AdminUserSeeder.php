<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create default admin if not exists
        User::firstOrCreate(
            ['email' => 'admin@example.com'], // default email
            [
                'name' => 'Admin',
                'password' => Hash::make('password123'), // default password
                'role' => 'admin',
            ]
        );
    }
}