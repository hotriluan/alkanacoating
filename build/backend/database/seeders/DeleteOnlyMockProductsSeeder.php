<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class DeleteOnlyMockProductsSeeder extends Seeder
{
    public function run(): void
    {
        // Xóa các sản phẩm mock: tên bắt đầu bằng 'Sản phẩm' và slug bắt đầu bằng 'san-pham-'
        Product::where('name', 'like', 'Sản phẩm%')
            ->where('slug', 'like', 'san-pham-%')
            ->delete();
    }
}
