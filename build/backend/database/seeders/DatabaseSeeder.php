<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\{Category,Product,Project,Post,Job,Setting};

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Company Settings
        Setting::updateOrCreate(['key' => 'company_name'], ['value' => 'Alkana Coating']);
        Setting::updateOrCreate(['key' => 'company_email'], ['value' => 'info@alkanacoating.com']);
        Setting::updateOrCreate(['key' => 'company_phone'], ['value' => '+84 28 3823 4567']);
        Setting::updateOrCreate(['key' => 'company_address'], ['value' => '123 Nguyễn Văn Linh, Quận 7, TP.HCM']);
        Setting::updateOrCreate(['key' => 'facebook_url'], ['value' => 'https://facebook.com/alkanacoating']);
        Setting::updateOrCreate(['key' => 'zalo_url'], ['value' => 'https://zalo.me/alkanacoating']);
        Setting::updateOrCreate(['key' => 'company_description'], ['value' => 'Alkana Coating - Chuyên gia hàng đầu về giải pháp sơn epoxy, chống ăn mòn và phủ bảo vệ công nghiệp tại Việt Nam']);
        
        // Categories with detailed descriptions
        $categories = [
            [
                'name' => 'Sơn Epoxy Sàn',
                'slug' => 'son-epoxy-san'
            ],
            [
                'name' => 'Sơn Chống Ăn Mòn',
                'slug' => 'son-chong-an-mon'
            ],
            [
                'name' => 'Phủ Polyurethane (PU)',
                'slug' => 'phu-polyurethane'
            ],
            [
                'name' => 'Sơn Công Nghiệp Đặc Biệt',
                'slug' => 'son-cong-nghiep-dac-biet'
            ]
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(['slug' => $cat['slug']], $cat);
        }

        // Build a mapping from the initial category positions (1..n) to actual IDs
        $initialCategorySlugs = array_column($categories, 'slug');
        $categoryMap = Category::whereIn('slug', $initialCategorySlugs)->get()->keyBy('slug')->map(function($c){ return $c->id; })->toArray();


        // Professional Products with detailed specs
        $products = [
            // Sơn Epoxy Sàn
            [
                'category_id' => 1,
                'name' => 'Alkana EpoFloor Pro 100',
                'slug' => 'alkana-epofloor-pro-100',
                'excerpt' => 'Sơn epoxy 2 thành phần không dung môi, độ bền cơ học cao, lý tưởng cho sàn nhà xưởng',
                'content' => 'Alkana EpoFloor Pro 100 là hệ thống sơn epoxy 2 thành phần không dung môi được phát triển đặc biệt cho sàn công nghiệp. Sản phẩm có độ bền cơ học cao, khả năng chống mài mòn tuyệt vời và dễ dàng vệ sinh. Thích hợp cho nhà xưởng sản xuất, kho bãi, garage ôtô.'
            ],
            [
                'category_id' => 1,
                'name' => 'Alkana EpoFloor Self-Leveling',
                'slug' => 'alkana-epofloor-self-leveling',
                'excerpt' => 'Sơn epoxy tự cân bằng tạo bề mặt phẳng mịn, độ dày 1-3mm, chống tĩnh điện',
                'content' => 'Hệ thống sơn epoxy tự cân bằng cao cấp tạo ra bề mặt hoàn toàn phẳng mịn với độ dày từ 1-3mm. Có thể bổ sung tính năng chống tĩnh điện cho phòng sạch, nhà xưởng điện tử. Màu sắc đa dạng, có thể tạo hiệu ứng 3D.'
            ],
            [
                'category_id' => 1,
                'name' => 'Alkana EpoFloor Heavy Duty',
                'slug' => 'alkana-epofloor-heavy-duty',
                'excerpt' => 'Sơn epoxy siêu bền cho khu vực chịu tải trọng nặng, xe nâng, máy móc',
                'content' => 'Được thiết kế đặc biệt cho các khu vực chịu tải trọng nặng như nhà xưởng có xe nâng, máy móc hạng nặng. Khả năng chống va đập và mài mòn vượt trội. Thời gian sử dụng lên đến 15-20 năm trong điều kiện bình thường.'
            ],
            
            // Sơn Chống Ăn Mòn
            [
                'category_id' => 2,
                'name' => 'Alkana Zinc Rich Primer',
                'slug' => 'alkana-zinc-rich-primer',
                'excerpt' => 'Sơn lót giàu kẽm cho bảo vệ âm cực thép trong môi trường ăn mòn cao',
                'content' => 'Sơn lót 2 thành phần với hàm lượng kẽm cao (>85%) cung cấp bảo vệ âm cực cho thép. Đặc biệt hiệu quả trong môi trường biển, hóa chất. Tuân thủ tiêu chuẩn quốc tế ISO 12944. Thích hợp cho cầu thép, tàu biển, nhà máy hóa chất.'
            ],
            [
                'category_id' => 2,
                'name' => 'Alkana MarineCote',
                'slug' => 'alkana-marinecote',
                'excerpt' => 'Hệ thống sơn chuyên dụng cho môi trường biển, chống muối mặn và UV',
                'content' => 'Hệ thống sơn 3 lớp được thiết kế riêng cho môi trường biển khắc nghiệt. Chống lại muối mặn, tia UV và thay đổi nhiệt độ. Sử dụng cho cảng biển, giàn khoan, tàu thuyền. Bảo hành 10 năm trong môi trường biển.'
            ],
            [
                'category_id' => 2,
                'name' => 'Alkana ChemResist Pro',
                'slug' => 'alkana-chemresist-pro',
                'excerpt' => 'Sơn chống hóa chất công nghiệp, acid, base mạnh',
                'content' => 'Lớp phủ đặc biệt chống lại hầu hết các hóa chất công nghiệp bao gồm acid mạnh, base, dung môi hữu cơ. Ứng dụng trong nhà máy hóa chất, xử lý nước thải, bể chứa hóa chất. Tuân thủ tiêu chuẩn an toàn thực phẩm FDA.'
            ],

            // Phủ Polyurethane
            [
                'category_id' => 3,
                'name' => 'Alkana PU TopCoat Premium',
                'slug' => 'alkana-pu-topcoat-premium',
                'excerpt' => 'Lớp phủ PU cao cấp chống UV, thời tiết cho kết cấu ngoài trời',
                'content' => 'Lớp phủ polyurethane 2 thành phần cao cấp với khả năng chống UV và thời tiết vượt trội. Giữ màu bền đẹp dưới ánh nắng mặt trời. Độ bóng có thể điều chỉnh từ mờ đến bóng cao. Thích hợp cho cầu thép, nhà xưởng, kết cấu ngoài trời.'
            ],
            [
                'category_id' => 3,
                'name' => 'Alkana PU Clear Coat',
                'slug' => 'alkana-pu-clear-coat',
                'excerpt' => 'Lớp phủ trong suốt bảo vệ bề mặt gỗ, kim loại khỏi trầy xước',
                'content' => 'Lớp phủ polyurethane trong suốt tạo màng bảo vệ chống trầy xước, hóa chất và nước. Không làm thay đổi màu sắc bề mặt gốc. Ứng dụng cho sàn gỗ, đồ nội thất, kim loại trang trí cao cấp.'
            ],
            [
                'category_id' => 3,
                'name' => 'Alkana PU FlexiCoat',
                'slug' => 'alkana-pu-flexicoat',
                'excerpt' => 'Sơn PU đàn hồi cho bề mặt có co giãn nhiệt, chống nứt',
                'content' => 'Lớp phủ PU đặc biệt có tính đàn hồi cao, chống nứt do co giãn nhiệt. Lý tưởng cho mái nhà, sàn có chuyển động cấu trúc. Khả năng chống thấm tuyệt vời. Tuổi thọ 12-15 năm.'
            ],

            // Sơn Công Nghiệp Đặc Biệt
            [
                'category_id' => 4,
                'name' => 'Alkana AeroSpace Grade',
                'slug' => 'alkana-aerospace-grade',
                'excerpt' => 'Sơn hàng không vũ trụ chịu nhiệt độ cực cao và môi trường khắc nghiệt',
                'content' => 'Hệ thống sơn đặc biệt đạt tiêu chuẩn hàng không vũ trụ, chịu nhiệt độ từ -70°C đến +200°C. Chống ăn mòn trong môi trường áp suất cao. Sử dụng cho máy bay, tên lửa, thiết bị vũ trụ. Được chứng nhận bởi các cơ quan hàng không quốc tế.'
            ],
            [
                'category_id' => 4,
                'name' => 'Alkana Food Grade Coating',
                'slug' => 'alkana-food-grade-coating',
                'excerpt' => 'Sơn an toàn thực phẩm cho thiết bị chế biến, bể chứa',
                'content' => 'Lớp phủ đặc biệt đạt tiêu chuẩn an toàn thực phẩm FDA, không độc hại, không mùi. Chống vi khuẩn và dễ vệ sinh. Ứng dụng trong nhà máy chế biến thực phẩm, bể chứa nước sạch, thiết bị y tế.'
            ],
            [
                'category_id' => 4,
                'name' => 'Alkana Fire Retardant',
                'slug' => 'alkana-fire-retardant',
                'excerpt' => 'Sơn chống cháy lan, chậm cháy cho kết cấu thép và gỗ',
                'content' => 'Hệ thống sơn chống cháy giúp chậm quá trình lan của lửa, bảo vệ kết cấu thép và gỗ. Khi gặp nhiệt độ cao sẽ tạo lớp cách nhiệt bảo vệ. Tuân thủ tiêu chuẩn PCCC quốc tế. Sử dụng trong trung tâm thương mại, nhà cao tầng.'
            ]
        ];

        // Normalize category_id in products: if it's a small integer placeholder (1..n), map it to the actual ID
        foreach ($products as $product) {
            if (isset($product['category_id']) && is_int($product['category_id'])) {
                $idx = $product['category_id'] - 1; // placeholder index
                if (isset($initialCategorySlugs[$idx])) {
                    $slug = $initialCategorySlugs[$idx];
                    $product['category_id'] = $categoryMap[$slug] ?? null;
                }
            }
            Product::updateOrCreate(['slug' => $product['slug']], $product);
        }

        // Real Projects Portfolio
        $projects = [
            [
                'title' => 'Nhà máy Samsung Display Việt Nam',
                'slug' => 'nha-may-samsung-display-viet-nam',
                'excerpt' => 'Thi công hệ thống sơn epoxy chống tĩnh điện cho nhà máy sản xuất màn hình LCD 50,000m²',
                'content' => 'Dự án thi công hệ thống sơn epoxy chống tĩnh điện cho toàn bộ sàn nhà máy Samsung Display tại Bắc Ninh. Diện tích 50,000m² với yêu cầu kỹ thuật cao về độ sạch và chống tĩnh điện. Hoàn thành trong 6 tháng với đội ngũ 100 kỹ thuật viên. Dự án trị giá 15 tỷ VNĐ.'
            ],
            [
                'title' => 'Cảng Cát Lái SAIGON PORT',
                'slug' => 'cang-cat-lai-saigon-port',
                'excerpt' => 'Bảo dưỡng và sơn chống ăn mòn cho hệ thống cần cẩu và kết cấu thép cảng biển',
                'content' => 'Dự án bảo dưỡng định kỳ hệ thống cần cẩu container và kết cấu thép tại Cảng Cát Lái. Sử dụng hệ thống sơn chống ăn mòn biển 3 lớp. Thi công ban đêm để không ảnh hưởng hoạt động cảng. Bảo hành 8 năm trong môi trường biển khắc nghiệt.'
            ],
            [
                'title' => 'Nhà máy Bia Heineken Tiền Giang',
                'slug' => 'nha-may-bia-heineken-tien-giang',
                'excerpt' => 'Thi công sơn an toàn thực phẩm cho dây chuyền sản xuất và kho lạnh',
                'content' => 'Thi công hệ thống sơn an toàn thực phẩm cho toàn bộ dây chuyền sản xuất bia và hệ thống kho lạnh. Tuân thủ nghiêm ngặt tiêu chuẩn vệ sinh an toàn thực phẩm. Hoàn thành trong thời gian ngừng sản xuất 2 tuần. Được Heineken Global chứng nhận đạt tiêu chuẩn quốc tế.'
            ],
            [
                'title' => 'Sân bay Tân Sơn Nhất - Nhà ga T3',
                'slug' => 'san-bay-tan-son-nhat-nha-ga-t3',
                'excerpt' => 'Sơn trang trí và bảo vệ cho kết cấu thép nhà ga T3 với diện tích 80,000m²',
                'content' => 'Dự án sơn trang trí và bảo vệ cho toàn bộ kết cấu thép nhà ga T3 sân bay Tân Sơn Nhất. Sử dụng hệ thống sơn chống cháy và chống ăn mòn. Thi công trong điều kiện hoạt động liên tục của sân bay. Phối hợp chặt chẽ với ban quản lý sân bay đảm bảo an toàn tuyệt đối.'
            ],
            [
                'title' => 'Tòa nhà Landmark 81 SkyDeck',
                'slug' => 'toa-nha-landmark-81-skydeck',
                'excerpt' => 'Sơn bảo vệ đặc biệt cho tầng quan sát cao nhất Việt Nam chịu gió mạnh',
                'content' => 'Thi công lớp sơn bảo vệ đặc biệt cho kết cấu thép tầng quan sát SkyDeck tại tòa nhà Landmark 81. Chịu được gió mạnh và điều kiện thời tiết khắc nghiệt ở độ cao 461m. Sử dụng công nghệ sơn cao cấp chống UV và ăn mòn không khí. Dự án biểu tượng của ngành coating Việt Nam.'
            ],
            [
                'title' => 'Nhà máy Formosa Hà Tĩnh',
                'slug' => 'nha-may-formosa-ha-tinh',
                'excerpt' => 'Sơn chống hóa chất cho thiết bị và đường ống trong môi trường sản xuất thép',
                'content' => 'Thi công hệ thống sơn chống hóa chất công nghiệp cho thiết bị và hệ thống đường ống tại nhà máy thép Formosa Hà Tĩnh. Chịu được acid mạnh, nhiệt độ cao và hơi độc. Dự án kéo dài 3 năm với giá trị 50 tỷ VNĐ. Đạt tiêu chuẩn môi trường nghiêm ngặt.'
            ]
        ];

        foreach ($projects as $project) {
            Project::updateOrCreate(['slug' => $project['slug']], $project);
        }

        // Technical Blog Posts
        $posts = [
            [
                'title' => 'Hướng dẫn chọn sơn epoxy sàn phù hợp cho từng ngành nghề',
                'slug' => 'huong-dan-chon-son-epoxy-san-phu-hop',
                'excerpt' => 'Những yếu tố quan trọng cần xem xét khi lựa chọn loại sơn epoxy sàn cho nhà xưởng, showroom, garage...',
                'content' => 'Việc lựa chọn đúng loại sơn epoxy sàn là yếu tố quyết định đến tuổi thọ và hiệu quả sử dụng. Bài viết này sẽ hướng dẫn chi tiết các yếu tố cần xem xét như: tải trọng sử dụng, loại hóa chất tiếp xúc, yêu cầu về màu sắc và độ bóng, ngân sách đầu tư. Đặc biệt phân tích so sánh giữa sơn epoxy 1 thành phần và 2 thành phần, ưu nhược điểm của từng loại.'
            ],
            [
                'title' => 'Quy trình chuẩn bị bề mặt cho sơn chống ăn mòn hiệu quả',
                'slug' => 'quy-trinh-chuan-bi-be-mat-son-chong-an-mon',
                'excerpt' => 'Chuẩn bị bề mặt đúng kỹ thuật là 80% thành công của dự án sơn chống ăn mòn...',
                'content' => 'Chuẩn bị bề mặt là công đoạn quan trọng nhất quyết định độ bám dính và tuổi thọ của lớp sơn. Bài viết chi tiết các phương pháp: phun cát khô, phun cát ướt, làm sạch hóa chất. Hướng dẫn đánh giá độ sạch theo tiêu chuẩn ISO 8501, độ nhám theo ISO 8503. Các lỗi thường gặp và cách khắc phục trong quá trình chuẩn bị bề mặt.'
            ],
            [
                'title' => 'Công nghệ sơn nướng vs sơn thường - So sánh ưu nhược điểm',
                'slug' => 'cong-nghe-son-nuong-vs-son-thuong',
                'excerpt' => 'Phân tích chi tiết sự khác biệt giữa công nghệ sơn nướng (powder coating) và sơn lỏng truyền thống...',
                'content' => 'Sơn nướng (powder coating) ngày càng phổ biến nhờ tính thân thiện môi trường và chất lượng cao. Bài viết so sánh về: quy trình thi công, thiết bị cần thiết, chi phí đầu tư, chất lượng bề mặt, tác động môi trường. Hướng dẫn lựa chọn công nghệ phù hợp cho từng loại sản phẩm và quy mô sản xuất.'
            ],
            [
                'title' => 'Tiêu chuẩn quốc tế về sơn chống cháy cho kết cấu thép',
                'slug' => 'tieu-chuan-quoc-te-son-chong-chay',
                'excerpt' => 'Tổng quan về các tiêu chuẩn quốc tế như ASTM, BS, UL và cách áp dụng tại Việt Nam...',
                'content' => 'Sơn chống cháy cho kết cấu thép phải tuân thủ nghiêm ngặt các tiêu chuẩn quốc tế. Bài viết giới thiệu chi tiết: tiêu chuẩn ASTM E119 (Mỹ), BS 476 (Anh), UL 263, và quy chuẩn QCVN 06:2010/BXD của Việt Nam. Hướng dẫn quy trình thử nghiệm, chứng nhận và giám sát chất lượng thi công.'
            ],
            [
                'title' => 'Xu hướng sơn thông minh và IoT trong ngành coating',
                'slug' => 'xu-huong-son-thong-minh-iot-coating',
                'excerpt' => 'Công nghệ sơn tích hợp cảm biến IoT để giám sát tình trạng kết cấu từ xa...',
                'content' => 'Ngành coating đang hướng tới các giải pháp thông minh với công nghệ IoT tích hợp. Sơn thông minh có thể: tự thay đổi màu khi phát hiện ăn mòn, gửi cảnh báo qua smartphone khi cần bảo dưỡng, đo nhiệt độ và độ ẩm môi trường. Bài viết giới thiệu các sản phẩm tiên phong và triển vọng ứng dụng tại Việt Nam.'
            ],
            [
                'title' => 'Bảo dưỡng định kỳ hệ thống sơn công nghiệp',
                'slug' => 'bao-duong-dinh-ky-he-thong-son-cong-nghiep',
                'excerpt' => 'Lập kế hoạch bảo dưỡng định kỳ giúp tối ưu chi phí và kéo dài tuổi thọ hệ thống sơn...',
                'content' => 'Bảo dưỡng định kỳ là chìa khóa kéo dài tuổi thọ hệ thống sơn và tiết kiệm chi phí. Bài viết hướng dẫn: lập lịch kiểm tra định kỳ, nhận biết dấu hiệu hư hỏng sớm, phương pháp sửa chữa cục bộ, khi nào cần sơn lại toàn bộ. Chia sẻ kinh nghiệm từ các dự án thực tế về tối ưu hóa chi phí bảo dưỡng.'
            ],
            [
                'title' => 'Giải pháp sơn xanh và thân thiện môi trường',
                'slug' => 'giai-phap-son-xanh-than-thien-moi-truong',
                'excerpt' => 'Các loại sơn low-VOC, water-based và sinh học đang dần thay thế sơn truyền thống...',
                'content' => 'Xu hướng sơn xanh đang mạnh mẽ phát triển với yêu cầu bảo vệ môi trường ngày càng cao. Bài viết giới thiệu: sơn gốc nước thay thế dung môi, sơn low-VOC và zero-VOC, sơn sinh học từ thực vật. So sánh hiệu quả, chi phí và khả năng ứng dụng. Dự báo xu hướng phát triển sơn xanh tại thị trường Việt Nam.'
            ],
            [
                'title' => 'Công nghệ nano trong sơn phủ hiện đại',
                'slug' => 'cong-nghe-nano-trong-son-phu-hien-dai',
                'excerpt' => 'Ứng dụng công nghệ nano mang lại những tính năng vượt trội cho sơn phủ...',
                'content' => 'Công nghệ nano đang cách mạng hóa ngành sơn phủ với những tính năng đột phá: tự làm sạch (self-cleaning), kháng khuẩn, chống đóng băng, dẫn điện. Bài viết phân tích cơ chế hoạt động của các hạt nano, ứng dụng thực tế trong xây dựng, ô tô, điện tử. Đánh giá triển vọng và thách thức khi áp dụng tại Việt Nam.'
            ],
            [
                'title' => 'Sơn chịu nhiệt cao cho ngành luyện kim và hóa chất',
                'slug' => 'son-chiu-nhiet-cao-luyen-kim-hoa-chat',
                'excerpt' => 'Giải pháp sơn chuyên dụng chịu nhiệt độ từ 200°C đến 1000°C cho thiết bị công nghiệp...',
                'content' => 'Ngành luyện kim và hóa chất đòi hỏi sơn phủ chịu nhiệt độ cực cao. Bài viết giới thiệu các loại sơn chịu nhiệt: silicone, ceramic, phenolic với khả năng chịu nhiệt từ 200°C đến 1000°C. Hướng dẫn lựa chọn sơn phù hợp cho từng thiết bị: ống khói, lò nung, thiết bị trao đổi nhiệt. Quy trình thi công và kiểm tra chất lượng.'
            ],
            [
                'title' => 'Quản lý chất lượng trong thi công sơn công nghiệp',
                'slug' => 'quan-ly-chat-luong-thi-cong-son-cong-nghiep',
                'excerpt' => 'Hệ thống quản lý chất lượng toàn diện từ khâu chuẩn bị đến nghiệm thu...',
                'content' => 'Quản lý chất lượng là yếu tố quyết định thành công của dự án sơn công nghiệp. Bài viết hướng dẫn: thiết lập quy trình kiểm soát chất lượng, các thiết bị đo kiểm cần thiết, cách lập hồ sơ theo dõi, xử lý sự cố chất lượng. Chia sẻ kinh nghiệm quản lý chất lượng từ các dự án lớn, các lỗi thường gặp và cách phòng tránh.'
            ]
        ];

        foreach ($posts as $post) {
            Post::updateOrCreate(['slug' => $post['slug']], $post);
        }

        // Job Opportunities
        $jobs = [
            [
                'title' => 'Kỹ sư Sơn Cao cấp',
                'slug' => 'ky-su-son-cao-cap',
                'location' => 'TP.HCM, Hà Nội',
                'type' => 'Toàn thời gian',
                'description' => 'Yêu cầu: Tốt nghiệp Đại học chuyên ngành Hóa học/Vật liệu, có 3+ năm kinh nghiệm trong ngành sơn coating. Thành thạo các tiêu chuẩn quốc tế ISO 12944, SSPC, NACE. Tiếng Anh giao tiếp tốt. Mức lương: 20-35 triệu VNĐ + thưởng dự án.'
            ],
            [
                'title' => 'Giám sát Thi công Sơn',
                'slug' => 'giam-sat-thi-cong-son',
                'location' => 'Bình Dương, Đồng Nai',
                'type' => 'Toàn thời gian',
                'description' => 'Yêu cầu: Kinh nghiệm 5+ năm giám sát thi công sơn công nghiệp. Có kiến thức về an toàn lao động, quy trình QA/QC. Sẵn sàng đi công tác dài ngày. Ưu tiên có chứng chỉ NACE CIP Level 2. Mức lương: 18-28 triệu VNĐ + phụ cấp công tác.'
            ],
            [
                'title' => 'Chuyên viên R&D Phát triển Sản phẩm',
                'slug' => 'chuyen-vien-rd-phat-trien-san-pham',
                'location' => 'TP.HCM',
                'type' => 'Toàn thời gian',
                'description' => 'Yêu cầu: Thạc sĩ Hóa học/Polymer, kinh nghiệm 2+ năm nghiên cứu phát triển sơn. Thành thạo thiết bị phân tích hiện đại, software mô phỏng. Khả năng làm việc độc lập và theo nhóm. Mức lương: 25-40 triệu VNĐ + bonus nghiên cứu.'
            ],
            [
                'title' => 'Kỹ thuật viên Phòng thí nghiệm',
                'slug' => 'ky-thuat-vien-phong-thi-nghiem',
                'location' => 'TP.HCM',
                'type' => 'Toàn thời gian',
                'description' => 'Yêu cầu: Cao đẳng/Đại học chuyên ngành Hóa, có 1+ năm kinh nghiệm lab testing. Thành thạo các thiết bị đo độ bám dính, độ dày, màu sắc, độ bóng. Tỉ mỉ, chính xác trong công việc. Mức lương: 12-18 triệu VNĐ.'
            ],
            [
                'title' => 'Sales Manager Khu vực Miền Nam',
                'slug' => 'sales-manager-khu-vuc-mien-nam',
                'location' => 'TP.HCM và các tỉnh phía Nam',
                'type' => 'Toàn thời gian',
                'description' => 'Yêu cầu: Đại học, có 5+ năm kinh nghiệm bán hàng B2B trong ngành xây dựng/công nghiệp. Mạng lưới khách hàng rộng, kỹ năng đàm phán tốt. Sẵn sàng đi công tác thường xuyên. Mức lương: 25-50 triệu VNĐ + hoa hồng không giới hạn.'
            ],
            [
                'title' => 'Chuyên viên Hỗ trợ Kỹ thuật',
                'slug' => 'chuyen-vien-ho-tro-ky-thuat',
                'location' => 'Hà Nội, Đà Nẵng',
                'type' => 'Toàn thời gian',
                'description' => 'Yêu cầu: Đại học kỹ thuật, kinh nghiệm 2+ năm tư vấn giải pháp sơn. Khả năng thuyết trình, đào tạo khách hàng. Am hiểu sâu về ứng dụng sơn trong các ngành nghề. Mức lương: 15-25 triệu VNĐ + thưởng KPI.'
            ],
            [
                'title' => 'Thực tập sinh Ngành Sơn',
                'slug' => 'thuc-tap-sinh-nganh-son',
                'location' => 'TP.HCM, Hà Nội',
                'type' => 'Thực tập',
                'description' => 'Yêu cầu: Sinh viên năm 3,4 chuyên ngành Hóa học, Vật liệu. Mong muốn tìm hiểu và phát triển sự nghiệp trong ngành coating. Thái độ học hỏi tích cực, có trách nhiệm. Thực tập có trả lương 5-8 triệu VNĐ, cơ hội việc làm full-time sau tốt nghiệp.'
            ],
            [
                'title' => 'Chuyên gia Tư vấn Quốc tế',
                'slug' => 'chuyen-gia-tu-van-quoc-te',
                'location' => 'TP.HCM + đi công tác nước ngoài',
                'type' => 'Toàn thời gian',
                'description' => 'Yêu cầu: Thạc sĩ trở lên, 10+ năm kinh nghiệm trong ngành coating. Tiếng Anh thành thạo, có kinh nghiệm làm việc với đối tác nước ngoài. Hiểu biết sâu về tiêu chuẩn quốc tế. Mức lương: 40-80 triệu VNĐ + package expat.'
            ]
        ];

        foreach ($jobs as $job) {
            Job::updateOrCreate(['slug' => $job['slug']], $job);
        }

        $this->call(\Database\Seeders\CategorySeeder::class);

    // Ensure an admin user exists. Credentials can be configured via
    // ADMIN_EMAIL and ADMIN_PASSWORD in your .env file for local dev.
    $this->call(\Database\Seeders\AdminUserSeeder::class);

    // Populate full set of mock data (products, projects, posts, jobs, sliders, menus...)
    $this->call(\Database\Seeders\FullMockDataSeeder::class);
    // Add richer mega menu samples
    $this->call(\Database\Seeders\MegaMenuSeeder::class);
    
    // Recruitment and Applications
    $this->call(\Database\Seeders\RecruitmentSeeder::class);
    $this->call(\Database\Seeders\ApplicationSeeder::class);
    }
