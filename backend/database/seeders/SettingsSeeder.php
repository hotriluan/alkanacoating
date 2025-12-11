<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $settings = [
            // ABOUT - Giới thiệu
            [
                'key' => 'about_title',
                'value' => 'Về Chúng Tôi - Alkana Coating',
                'type' => 'text',
                'group' => 'about',
                'label' => 'Tiêu đề trang',
                'description' => 'Tiêu đề hiển thị trên trang Giới thiệu',
                'order' => 1,
            ],
            [
                'key' => 'about_hero_image',
                'value' => '/assets/about-hero.jpg',
                'type' => 'image',
                'group' => 'about',
                'label' => 'Ảnh banner',
                'description' => 'Ảnh lớn hiển thị trên đầu trang',
                'order' => 2,
            ],
            [
                'key' => 'about_intro',
                'value' => 'Alkana Coating là đơn vị tiên phong trong lĩnh vực sản xuất và phân phối sơn công nghiệp chất lượng cao tại Việt Nam. Với hơn 15 năm kinh nghiệm, chúng tôi tự hào là đối tác đáng tin cậy của hàng ngàn doanh nghiệp trong và ngoài nước.',
                'type' => 'textarea',
                'group' => 'about',
                'label' => 'Giới thiệu ngắn',
                'description' => 'Đoạn text giới thiệu ngắn gọn',
                'order' => 3,
            ],
            [
                'key' => 'about_content',
                'value' => '<h2>Sứ Mệnh</h2><p>Cung cấp giải pháp sơn chuyên nghiệp, bảo vệ và làm đẹp mọi công trình, góp phần xây dựng Việt Nam phát triển bền vững.</p><h2>Tầm Nhìn</h2><p>Trở thành nhà cung cấp sơn công nghiệp hàng đầu khu vực Đông Nam Á, với công nghệ tiên tiến và dịch vụ xuất sắc.</p><h2>Giá Trị Cốt Lõi</h2><ul><li><strong>Chất lượng:</strong> Cam kết 100% sản phẩm đạt chuẩn quốc tế</li><li><strong>Uy tín:</strong> Minh bạch, trung thực trong mọi giao dịch</li><li><strong>Sáng tạo:</strong> Không ngừng nghiên cứu, cải tiến</li><li><strong>Trách nhiệm:</strong> Với khách hàng, đối tác và cộng đồng</li></ul>',
                'type' => 'wysiwyg',
                'group' => 'about',
                'label' => 'Nội dung chi tiết',
                'description' => 'Nội dung HTML đầy đủ của trang giới thiệu',
                'order' => 4,
            ],
            [
                'key' => 'about_stats',
                'value' => json_encode([
                    ['label' => 'Năm kinh nghiệm', 'value' => '15+', 'icon' => '📅'],
                    ['label' => 'Dự án hoàn thành', 'value' => '500+', 'icon' => '🏗️'],
                    ['label' => 'Khách hàng tin dùng', 'value' => '1000+', 'icon' => '🤝'],
                    ['label' => 'Sản phẩm đa dạng', 'value' => '200+', 'icon' => '🎨'],
                ]),
                'type' => 'json',
                'group' => 'about',
                'label' => 'Thống kê',
                'description' => 'Các con số thống kê nổi bật',
                'order' => 5,
            ],
            [
                'key' => 'about_values',
                'value' => json_encode([
                    [
                        'icon' => '🎯',
                        'title' => 'Chất lượng hàng đầu',
                        'description' => 'Cam kết cung cấp sản phẩm chất lượng cao, đạt tiêu chuẩn quốc tế'
                    ],
                    [
                        'icon' => '🌱',
                        'title' => 'Thân thiện môi trường',
                        'description' => 'Ưu tiên các giải pháp bền vững, giảm thiểu tác động đến môi trường'
                    ],
                    [
                        'icon' => '🤝',
                        'title' => 'Đối tác tin cậy',
                        'description' => 'Luôn đồng hành cùng khách hàng trong mọi dự án'
                    ],
                ]),
                'type' => 'json',
                'group' => 'about',
                'label' => 'Giá trị cốt lõi',
                'description' => 'Các giá trị cốt lõi của công ty (icon, title, description)',
                'order' => 6,
            ],

            // CONTACT - Liên hệ
            [
                'key' => 'contact_title',
                'value' => 'Liên Hệ - Alkana Coating',
                'type' => 'text',
                'group' => 'contact',
                'label' => 'Tiêu đề trang',
                'description' => 'Tiêu đề hiển thị trên trang Liên hệ',
                'order' => 1,
            ],
            [
                'key' => 'contact_address',
                'value' => '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM',
                'type' => 'text',
                'group' => 'contact',
                'label' => 'Địa chỉ',
                'description' => 'Địa chỉ công ty',
                'order' => 2,
            ],
            [
                'key' => 'contact_phone',
                'value' => '0123-456-789',
                'type' => 'text',
                'group' => 'contact',
                'label' => 'Số điện thoại',
                'description' => 'Hotline chính',
                'order' => 3,
            ],
            [
                'key' => 'contact_email',
                'value' => 'info@alkanacoating.com',
                'type' => 'text',
                'group' => 'contact',
                'label' => 'Email',
                'description' => 'Email liên hệ',
                'order' => 4,
            ],
            [
                'key' => 'contact_working_hours',
                'value' => 'Thứ 2 - Thứ 6: 8:00 - 17:00\nThứ 7: 8:00 - 12:00\nChủ nhật: Nghỉ',
                'type' => 'textarea',
                'group' => 'contact',
                'label' => 'Giờ làm việc',
                'description' => 'Thời gian làm việc',
                'order' => 5,
            ],
            [
                'key' => 'contact_map_embed',
                'value' => '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.3219277103863!2d106.69746!3d10.779006!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQ2JzQ0LjQiTiAxMDbCsDQxJzUwLjkiRQ!5e0!3m2!1sen!2s!4v1234567890" width="100%" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
                'type' => 'textarea',
                'group' => 'contact',
                'label' => 'Google Maps Embed',
                'description' => 'Mã nhúng Google Maps',
                'order' => 6,
            ],

            // FOOTER
            [
                'key' => 'footer_about',
                'value' => 'Alkana Coating - Giải pháp sơn công nghiệp hàng đầu Việt Nam. Chất lượng quốc tế, bảo vệ công trình Việt.',
                'type' => 'textarea',
                'group' => 'footer',
                'label' => 'Giới thiệu ngắn Footer',
                'description' => 'Text giới thiệu ngắn trong footer',
                'order' => 1,
            ],
            [
                'key' => 'footer_columns',
                'value' => json_encode([
                    [
                        'title' => 'Sản phẩm',
                        'links' => [
                            ['label' => 'Sơn Epoxy', 'url' => '/san-pham?category=6'],
                            ['label' => 'Sơn PU', 'url' => '/san-pham?category=8'],
                            ['label' => 'Sơn công nghiệp', 'url' => '/san-pham?category=4'],
                            ['label' => 'Sơn chống ăn mòn', 'url' => '/san-pham?category=1'],
                        ]
                    ],
                    [
                        'title' => 'Dịch vụ',
                        'links' => [
                            ['label' => 'Tư vấn kỹ thuật', 'url' => '/lien-he'],
                            ['label' => 'Thi công sơn', 'url' => '/lien-he'],
                            ['label' => 'Bảo hành', 'url' => '/lien-he'],
                            ['label' => 'Đào tạo', 'url' => '/lien-he'],
                        ]
                    ],
                    [
                        'title' => 'Công ty',
                        'links' => [
                            ['label' => 'Giới thiệu', 'url' => '/gioi-thieu'],
                            ['label' => 'Dự án', 'url' => '/du-an'],
                            ['label' => 'Tin tức', 'url' => '/tin-tuc'],
                            ['label' => 'Tuyển dụng', 'url' => '/tuyen-dung'],
                        ]
                    ],
                ]),
                'type' => 'json',
                'group' => 'footer',
                'label' => 'Cột footer',
                'description' => 'Các cột link trong footer',
                'order' => 2,
            ],
            [
                'key' => 'footer_copyright',
                'value' => '© 2025 Alkana Coating. All rights reserved.',
                'type' => 'text',
                'group' => 'footer',
                'label' => 'Copyright',
                'description' => 'Text copyright ở cuối footer',
                'order' => 3,
            ],

            // SOCIAL MEDIA
            [
                'key' => 'social_facebook',
                'value' => 'https://facebook.com/alkanacoating',
                'type' => 'text',
                'group' => 'social',
                'label' => 'Facebook URL',
                'description' => 'Link trang Facebook',
                'order' => 1,
            ],
            [
                'key' => 'social_zalo',
                'value' => 'https://zalo.me/alkanacoating',
                'type' => 'text',
                'group' => 'social',
                'label' => 'Zalo URL',
                'description' => 'Link Zalo OA hoặc số điện thoại',
                'order' => 2,
            ],
            [
                'key' => 'social_youtube',
                'value' => 'https://youtube.com/@alkanacoating',
                'type' => 'text',
                'group' => 'social',
                'label' => 'YouTube URL',
                'description' => 'Link kênh YouTube',
                'order' => 3,
            ],
            [
                'key' => 'social_linkedin',
                'value' => 'https://linkedin.com/company/alkanacoating',
                'type' => 'text',
                'group' => 'social',
                'label' => 'LinkedIn URL',
                'description' => 'Link LinkedIn',
                'order' => 4,
            ],
            [
                'key' => 'social_instagram',
                'value' => 'https://instagram.com/alkanacoating',
                'type' => 'text',
                'group' => 'social',
                'label' => 'Instagram URL',
                'description' => 'Link Instagram',
                'order' => 5,
            ],

            // CAREERS PAGE
            [
                'key' => 'careers_hero_title',
                'value' => 'Cơ Hội Nghề Nghiệp',
                'type' => 'text',
                'group' => 'careers',
                'label' => 'Tiêu đề Hero',
                'description' => 'Tiêu đề chính trang tuyển dụng',
                'order' => 1,
            ],
            [
                'key' => 'careers_hero_subtitle',
                'value' => 'Tham gia đội ngũ chuyên gia hàng đầu trong ngành sơn công nghiệp tại Việt Nam',
                'type' => 'textarea',
                'group' => 'careers',
                'label' => 'Mô tả Hero',
                'description' => 'Mô tả phụ dưới tiêu đề',
                'order' => 2,
            ],
            [
                'key' => 'careers_stat_positions',
                'value' => '10+',
                'type' => 'text',
                'group' => 'careers',
                'label' => 'Số vị trí tuyển dụng',
                'description' => 'Số lượng vị trí đang tuyển',
                'order' => 3,
            ],
            [
                'key' => 'careers_stat_positions_label',
                'value' => 'Vị trí tuyển dụng',
                'type' => 'text',
                'group' => 'careers',
                'label' => 'Nhãn vị trí tuyển dụng',
                'description' => 'Text hiển thị dưới số vị trí',
                'order' => 4,
            ],
            [
                'key' => 'careers_stat_experience',
                'value' => '15+',
                'type' => 'text',
                'group' => 'careers',
                'label' => 'Năm kinh nghiệm',
                'description' => 'Số năm kinh nghiệm của công ty',
                'order' => 5,
            ],
            [
                'key' => 'careers_stat_experience_label',
                'value' => 'Năm kinh nghiệm',
                'type' => 'text',
                'group' => 'careers',
                'label' => 'Nhãn năm kinh nghiệm',
                'description' => 'Text hiển thị dưới số năm',
                'order' => 6,
            ],
            [
                'key' => 'careers_stat_employees',
                'value' => '500+',
                'type' => 'text',
                'group' => 'careers',
                'label' => 'Số nhân viên',
                'description' => 'Số lượng nhân viên',
                'order' => 7,
            ],
            [
                'key' => 'careers_stat_employees_label',
                'value' => 'Nhân viên',
                'type' => 'text',
                'group' => 'careers',
                'label' => 'Nhãn nhân viên',
                'description' => 'Text hiển thị dưới số nhân viên',
                'order' => 8,
            ],
            [
                'key' => 'careers_why_title',
                'value' => 'Tại sao chọn Alkana Coating?',
                'type' => 'text',
                'group' => 'careers',
                'label' => 'Tiêu đề phần Tại sao',
                'description' => 'Tiêu đề của phần lợi ích',
                'order' => 9,
            ],
            [
                'key' => 'careers_benefits',
                'value' => json_encode([
                    [
                        'icon' => '⚡',
                        'title' => 'Môi trường năng động',
                        'description' => 'Làm việc với công nghệ hiện đại và đội ngũ chuyên nghiệp'
                    ],
                    [
                        'icon' => '📚',
                        'title' => 'Đào tạo chuyên sâu',
                        'description' => 'Chương trình đào tạo nội bộ và quốc tế thường xuyên'
                    ],
                    [
                        'icon' => '📈',
                        'title' => 'Thăng tiến rõ ràng',
                        'description' => 'Lộ trình phát triển sự nghiệp minh bạch'
                    ],
                    [
                        'icon' => '💰',
                        'title' => 'Thu nhập hấp dẫn',
                        'description' => 'Lương thưởng cạnh tranh và phúc lợi toàn diện'
                    ],
                ]),
                'type' => 'json',
                'group' => 'careers',
                'label' => 'Danh sách lợi ích',
                'description' => 'Các lợi ích khi làm việc tại Alkana',
                'order' => 10,
            ],

            // GOOGLE ANALYTICS
            [
                'key' => 'ga_property_id',
                'value' => '',
                'type' => 'text',
                'group' => 'analytics',
                'label' => 'Google Analytics Property ID',
                'description' => 'Nhập Property ID của bạn (VD: 1234567890). Cần cho việc lấy dữ liệu từ API.',
                'order' => 1,
            ],
            [
                'key' => 'google_analytics_script',
                'value' => '',
                'type' => 'textarea',
                'group' => 'analytics',
                'label' => 'Mã Google Analytics (gtag.js)',
                'description' => 'Dán toàn bộ mã <script>...</script> của Google Analytics vào đây.',
                'order' => 2,
            ],
            [
                'key' => 'ga_service_account_credentials_json',
                'value' => '',
                'type' => 'textarea',
                'group' => 'analytics',
                'label' => 'Google Service Account Credentials (JSON)',
                'description' => 'Dán nội dung file JSON credentials của Service Account vào đây.',
                'order' => 3,
            ],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }

        $this->command->info('✅ Đã seed ' . count($settings) . ' settings thành công!');
    }
}

