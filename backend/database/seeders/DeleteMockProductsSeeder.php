<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class DeleteMockProductsSeeder extends Seeder
{
    public function run(): void
    {
        // Xóa các sản phẩm mock tên bắt đầu bằng 'Sản phẩm'
        Product::where('name', 'like', 'Sản phẩm%')->delete();
    }
}
