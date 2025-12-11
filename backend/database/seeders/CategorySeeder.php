<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Chống ăn mòn',
            'Phủ Polyurethane (PU)',
            'Sơn Chống Ăn Mòn',
            'Sơn công nghiệp',
            'Sơn Công Nghiệp Đặc Biệt',
            'Sơn Epoxy',
            'Sơn Epoxy Sàn',
            'Sơn PU',
        ];

        foreach ($categories as $name) {
            Category::firstOrCreate([
                'slug' => Str::slug($name)
            ], [
                'name' => $name,
            ]);
        }
    }
}
