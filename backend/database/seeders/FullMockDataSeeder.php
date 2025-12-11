<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\{Category,Product,Project,Post,Job};

class FullMockDataSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure categories exist (these slugs will be used by products)
        $categories = [
            'son-epoxy-san' => 'Sơn Epoxy Sàn',
            'son-chong-an-mon' => 'Sơn Chống Ăn Mòn',
            'phu-polyurethane' => 'Phủ Polyurethane (PU)',
            'son-cong-nghiep-dac-biet' => 'Sơn Công Nghiệp Đặc Biệt',
        ];

        foreach ($categories as $slug => $name) {
            Category::updateOrCreate(['slug' => $slug], ['name' => $name]);
        }

        // Sample products
        $products = [
            [
                'category_slug' => 'son-epoxy-san',
                'name' => 'Alkana EpoFloor Pro 100',
                'slug' => 'alkana-epofloor-pro-100',
                'excerpt' => 'Sơn epoxy 2 thành phần không dung môi, độ bền cơ học cao',
                'content' => 'Sản phẩm hệ epoxy 2 thành phần, bền, chống mài mòn.'
            ],
            [
                'category_slug' => 'son-epoxy-san',
                'name' => 'Alkana EpoFloor Self-Leveling',
                'slug' => 'alkana-epofloor-self-leveling',
                'excerpt' => 'Sơn epoxy tự cân bằng tạo bề mặt phẳng mịn',
                'content' => 'Hệ thống tự cân bằng cho bề mặt mịn, thích hợp phòng sạch.'
            ],
            [
                'category_slug' => 'son-chong-an-mon',
                'name' => 'Alkana Zinc Rich Primer',
                'slug' => 'alkana-zinc-rich-primer',
                'excerpt' => 'Sơn lót giàu kẽm cho bảo vệ âm cực thép',
                'content' => 'Sơn lót kẽm cho môi trường ăn mòn cao.'
            ],
            [
                'category_slug' => 'phu-polyurethane',
                'name' => 'Alkana PU TopCoat Premium',
                'slug' => 'alkana-pu-topcoat-premium',
                'excerpt' => 'Lớp phủ PU chống UV, thời tiết cho kết cấu ngoài trời',
                'content' => 'Lớp phủ PU cao cấp bảo vệ khỏi UV và thời tiết.'
            ],
        ];

        foreach ($products as $p) {
            $category = Category::where('slug', $p['category_slug'])->first();
            $data = [
                'name' => $p['name'],
                'slug' => $p['slug'],
                'excerpt' => $p['excerpt'],
                'content' => $p['content'],
                'category_id' => $category ? $category->id : null,
            ];

            Product::updateOrCreate(['slug' => $p['slug']], $data);
        }

        // Sample projects
        $projects = [
            [
                'title' => 'Nhà máy Samsung Display Việt Nam',
                'slug' => 'nha-may-samsung-display-viet-nam',
                'excerpt' => 'Thi công hệ thống sơn epoxy chống tĩnh điện cho nhà máy 50,000m²',
                'content' => 'Dự án thi công hệ thống sơn cho nhà máy Samsung Display.'
            ],
        ];

        foreach ($projects as $proj) {
            Project::updateOrCreate(['slug' => $proj['slug']], $proj);
        }

        // Sample posts
        $posts = [
            [
                'title' => 'Hướng dẫn chọn sơn epoxy sàn phù hợp',
                'slug' => 'huong-dan-chon-son-epoxy-san-phu-hop',
                'excerpt' => 'Những yếu tố quan trọng khi lựa chọn sơn epoxy sàn',
                'content' => 'Bài viết hướng dẫn lựa chọn sơn epoxy phù hợp cho từng ngành nghề.'
            ],
        ];

        foreach ($posts as $post) {
            Post::updateOrCreate(['slug' => $post['slug']], $post);
        }

        // Sample jobs
        $jobs = [
            [
                'title' => 'Kỹ sư Sơn Cao cấp',
                'slug' => 'ky-su-son-cao-cap',
                'location' => 'TP.HCM',
                'type' => 'Toàn thời gian',
                'description' => 'Tốt nghiệp Đại học, có kinh nghiệm 3+ năm trong ngành sơn.'
            ],
        ];

        foreach ($jobs as $job) {
            Job::updateOrCreate(['slug' => $job['slug']], $job);
        }

        // Call existing small seeders for sliders/menus/recruitments and featured flags
        $this->call(TestDataSeeder::class);
        $this->call(UpdateFeaturedDataSeeder::class);
    }
}
