<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Slider;
use App\Models\Menu;
use App\Models\Recruitment;

class TestDataSeeder extends Seeder
{
    public function run()
    {
        // Create or update sample sliders (idempotent)
        Slider::updateOrCreate([
            'title' => 'Sơn Công Nghiệp Alkana'
        ],[
            'subtitle' => 'Chất lượng quốc tế, bảo vệ công trình Việt',
            'image' => '/assets/hero1.jpg',
            'link' => '/san-pham',
            'order' => 1,
            'is_active' => true
        ]);

        Slider::updateOrCreate([
            'title' => 'Giải pháp sơn sàn Epoxy'
        ],[
            'subtitle' => 'Bền bỉ, thẩm mỹ, an toàn cho nhà xưởng',
            'image' => '/assets/hero2.jpg',
            'link' => '/san-pham?category=epoxy',
            'order' => 2,
            'is_active' => true
        ]);

        Slider::updateOrCreate([
            'title' => 'Sơn PU & Chống Ăn Mòn'
        ],[
            'subtitle' => 'Bảo vệ tối ưu cho kết cấu thép & bê tông',
            'image' => '/assets/hero3.jpg',
            'link' => '/san-pham?category=pu',
            'order' => 3,
            'is_active' => true
        ]);

        // Create or update sample menus (idempotent, keyed by url)
        Menu::updateOrCreate(['url' => '/'], [
            'name' => 'Trang chủ',
            'parent_id' => null,
            'order' => 1,
            'is_active' => true
        ]);

        Menu::updateOrCreate(['url' => '/gioi-thieu'], [
            'name' => 'Giới thiệu',
            'parent_id' => null,
            'order' => 2,
            'is_active' => true
        ]);

        Menu::updateOrCreate(['url' => '/san-pham'], [
            'name' => 'Sản phẩm',
            'parent_id' => null,
            'order' => 3,
            'is_active' => true
        ]);

        Menu::updateOrCreate(['url' => '/du-an'], [
            'name' => 'Dự án',
            'parent_id' => null,
            'order' => 4,
            'is_active' => true
        ]);

        Menu::updateOrCreate(['url' => '/bai-viet'], [
            'name' => 'Bài viết',
            'parent_id' => null,
            'order' => 5,
            'is_active' => true
        ]);

        Menu::updateOrCreate(['url' => '/tuyen-dung'], [
            'name' => 'Tuyển dụng',
            'parent_id' => null,
            'order' => 6,
            'is_active' => true
        ]);

        Menu::updateOrCreate(['url' => '/lien-he'], [
            'name' => 'Liên hệ',
            'parent_id' => null,
            'order' => 7,
            'is_active' => true
        ]);

        // Create or update recruitments (idempotent, keyed by slug)
        Recruitment::updateOrCreate([
            'slug' => 'ky-su-ung-dung-son'
        ],[
            'title' => 'Kỹ sư Ứng dụng Sơn',
            'description' => 'Tư vấn kỹ thuật sơn cho khách hàng, hỗ trợ giải quyết vấn đề kỹ thuật tại công trình.',
            'requirements' => 'Tốt nghiệp Đại học chuyên ngành Hóa học, Vật liệu, Kinh nghiệm 2+ năm về sơn công nghiệp, Kỹ năng giao tiếp tốt',
            'location' => 'TP. Hồ Chí Minh',
            'salary' => '15-25 triệu',
            'deadline' => '2025-12-31',
            'status' => 'open'
        ]);

        Recruitment::updateOrCreate([
            'slug' => 'tho-son-chuyen-nghiep'
        ],[
            'title' => 'Thợ Sơn Chuyên Nghiệp',
            'description' => 'Thực hiện thi công sơn theo quy trình kỹ thuật, đảm bảo chất lượng và tiến độ công việc.',
            'requirements' => 'Kinh nghiệm 3+ năm thi công sơn công nghiệp, Thành thạo các kỹ thuật phun sơn, Có bằng lái xe máy',
            'location' => 'Bình Dương, Đồng Nai',
            'salary' => '12-18 triệu',
            'deadline' => '2025-11-30',
            'status' => 'open'
        ]);

        Recruitment::updateOrCreate([
            'slug' => 'nhan-vien-kinh-doanh-b2b'
        ],[
            'title' => 'Nhân viên Kinh doanh B2B',
            'description' => 'Phát triển thị trường khách hàng doanh nghiệp, tư vấn giải pháp sơn phù hợp.',
            'requirements' => 'Tốt nghiệp Đại học, Kinh nghiệm bán hàng B2B 1+ năm, Kỹ năng đàm phán tốt, Thành thạo tin học văn phòng',
            'location' => 'Hà Nội, TP.HCM',
            'salary' => 'Cơ bản + Hoa hồng',
            'deadline' => '2025-12-15',
            'status' => 'open'
        ]);
    }
}