<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * This seeder is idempotent: it will create or update an admin user using
     * updateOrCreate. It reads ADMIN_EMAIL and ADMIN_PASSWORD from environment
     * variables so you can customize credentials in local .env without editing
     * the seeder.
     *
     * @return void
     */
    public function run()
    {
        $email = env('ADMIN_EMAIL', 'admin@alkanacoating.com');
        $password = env('ADMIN_PASSWORD', 'ChangeMe123!');

        $defaults = [
            'name' => 'Administrator',
            'email_verified_at' => now(),
            'is_admin' => true,
        ];

        $user = User::updateOrCreate(
            ['email' => $email],
            array_merge($defaults, ['password' => Hash::make($password)])
        );

        // Ensure is_admin is set even if the user existed before
        if (!$user->is_admin) {
            $user->is_admin = true;
            $user->save();
        }
    }
}
