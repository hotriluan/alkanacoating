<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Slider;

class SliderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $sliders = [
            [
                'title' => 'Sơn Công Nghiệp Alkana',
                'subtitle' => 'Chất lượng quốc tế - Bảo vệ công trình Việt',
                'description' => 'Giải pháp sơn chuyên nghiệp cho mọi loại bề mặt với công nghệ tiên tiến từ Châu Âu',
                'button_text' => 'Khám phá ngay',
                'button_style' => 'primary',
                'text_position' => 'left',
                'overlay_opacity' => 60,
                'media_type' => 'image',
                'video_url' => null,
                'image' => '/assets/hero1.jpg',
                'link' => null,
                'category_id' => 4, // Sơn công nghiệp
                'order' => 0,
                'is_active' => true,
            ],
            [
                'title' => 'Sơn Epoxy Chống Hóa Chất',
                'subtitle' => 'Bảo vệ vượt trội cho nhà máy & kho xưởng',
                'description' => 'Độ bền cao, chống ăn mòn hóa chất, dầu mỡ - Lý tưởng cho sàn công nghiệp',
                'button_text' => 'Xem sản phẩm',
                'button_style' => 'secondary',
                'text_position' => 'center',
                'overlay_opacity' => 50,
                'media_type' => 'image',
                'video_url' => null,
                'image' => '/assets/hero2.jpg',
                'link' => null,
                'category_id' => 6, // Sơn Epoxy
                'order' => 1,
                'is_active' => true,
            ],
            [
                'title' => 'Sơn Chống Rỉ Kim Loại',
                'subtitle' => 'Công nghệ Zinc Phosphate tiên tiến',
                'description' => 'Bảo vệ toàn diện kết cấu thép, thiết bị ngoài trời khỏi gỉ sét và thời tiết khắc nghiệt',
                'button_text' => 'Tư vấn miễn phí',
                'button_style' => 'outline',
                'text_position' => 'right',
                'overlay_opacity' => 70,
                'media_type' => 'image',
                'video_url' => null,
                'image' => '/assets/hero3.jpg',
                'link' => '/lien-he',
                'category_id' => null, // Link tới liên hệ thay vì category
                'order' => 2,
                'is_active' => true,
            ],
            [
                'title' => 'Sơn PU Cao Cấp',
                'subtitle' => 'Độ bóng hoàn hảo - Độ bền vượt trội',
                'description' => 'Phủ Polyurethane chuyên dụng cho gỗ, kim loại và bê tông với khả năng chống chịu tuyệt vời',
                'button_text' => 'Khám phá dòng PU',
                'button_style' => 'primary',
                'text_position' => 'left',
                'overlay_opacity' => 55,
                'media_type' => 'image',
                'video_url' => null,
                'image' => '/assets/promotion.jpg',
                'link' => null,
                'category_id' => 8, // Sơn PU
                'order' => 3,
                'is_active' => true,
            ],
        ];

        foreach ($sliders as $slider) {
            Slider::updateOrCreate(
                ['title' => $slider['title']],
                $slider
            );
        }

        $this->command->info('✅ Đã seed ' . count($sliders) . ' sliders thành công!');
    }
}

