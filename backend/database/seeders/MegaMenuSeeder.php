<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Menu;

class MegaMenuSeeder extends Seeder
{
    public function run()
    {
        // Remove any existing menus that might conflict with our sample
        // We'll create a set of root menus, some with mega payloads

        Menu::updateOrCreate(['url' => '/'], [
            'name' => 'Trang chủ',
            'url' => '/',
            'order' => 1,
            'is_active' => true,
        ]);

        Menu::updateOrCreate(['url' => '/san-pham'], [
            'name' => 'Sản phẩm',
            'url' => '/san-pham',
            'order' => 2,
            'is_active' => true,
            'type' => 'mega',
            'payload' => [
                [
                    'title' => 'Hệ sơn cho sàn',
                    'links' => [
                        ['name' => 'Epoxy sàn', 'url' => '/san-pham/epoxy-san'],
                        ['name' => 'Self-leveling', 'url' => '/san-pham/self-leveling'],
                        ['name' => 'Sơn chống tĩnh điện', 'url' => '/san-pham/anti-static'],
                    ]
                ],
                [
                    'title' => 'Hệ sơn bảo vệ',
                    'links' => [
                        ['name' => 'Sơn chống ăn mòn', 'url' => '/san-pham/anti-corrosion'],
                        ['name' => 'Sơn chịu nhiệt', 'url' => '/san-pham/high-temp'],
                        ['name' => 'Sơn hàng hải', 'url' => '/san-pham/marine'],
                    ]
                ],
                [
                    'title' => 'Phụ kiện & Dịch vụ',
                    'links' => [
                        ['name' => 'Dịch vụ thi công', 'url' => '/dich-vu/thi-cong'],
                        ['name' => 'Tư vấn kỹ thuật', 'url' => '/dich-vu/tu-van'],
                        ['name' => 'Tài liệu kỹ thuật', 'url' => '/tai-lieu'],
                    ]
                ],
            ],
        ]);

        Menu::updateOrCreate(['url' => '/du-an'], [
            'name' => 'Dự án',
            'url' => '/du-an',
            'order' => 3,
            'is_active' => true,
        ]);

        Menu::updateOrCreate(['url' => '/bai-viet'], [
            'name' => 'Bài viết',
            'url' => '/bai-viet',
            'order' => 4,
            'is_active' => true,
        ]);

        Menu::updateOrCreate(['url' => '/tuyen-dung'], [
            'name' => 'Tuyển dụng',
            'url' => '/tuyen-dung',
            'order' => 5,
            'is_active' => true,
        ]);

        Menu::updateOrCreate(['url' => '/lien-he'], [
            'name' => 'Liên hệ',
            'url' => '/lien-he',
            'order' => 6,
            'is_active' => true,
        ]);
    }
}
