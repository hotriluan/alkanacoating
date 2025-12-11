<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Post;
use App\Models\PostCategory;
use App\Models\PostTag;
use App\Models\User;
use Illuminate\Support\Str;

class PostsWithDetailsSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('🎨 Seeding blog categories, tags, and posts...');

        // Disable FK checks
        \DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Create categories
        $categories = [
            [
                'name' => 'Kỹ thuật sơn',
                'slug' => 'ky-thuat-son',
                'description' => 'Hướng dẫn kỹ thuật, thi công và bảo dưỡng',
                'icon' => '🔧',
                'color' => '#3b82f6',
                'order' => 1,
            ],
            [
                'name' => 'Sản phẩm',
                'slug' => 'san-pham',
                'description' => 'Giới thiệu sản phẩm và ứng dụng',
                'icon' => '🎨',
                'color' => '#10b981',
                'order' => 2,
            ],
            [
                'name' => 'Tin tức',
                'slug' => 'tin-tuc',
                'description' => 'Tin tức ngành sơn và công nghệ mới',
                'icon' => '📰',
                'color' => '#f59e0b',
                'order' => 3,
            ],
            [
                'name' => 'Dự án',
                'slug' => 'du-an',
                'description' => 'Case study và dự án tiêu biểu',
                'icon' => '🏗️',
                'color' => '#8b5cf6',
                'order' => 4,
            ],
            [
                'name' => 'Hướng dẫn',
                'slug' => 'huong-dan',
                'description' => 'Hướng dẫn sử dụng và chọn sơn',
                'icon' => '📖',
                'color' => '#ef4444',
                'order' => 5,
            ],
        ];

        foreach ($categories as $catData) {
            PostCategory::updateOrCreate(
                ['slug' => $catData['slug']],
                $catData
            );
        }

        $this->command->info('✅ Created ' . count($categories) . ' categories');

        // Create tags
        $tags = [
            ['name' => 'Sơn epoxy', 'slug' => 'son-epoxy', 'color' => '#3b82f6'],
            ['name' => 'Sơn PU', 'slug' => 'son-pu', 'color' => '#10b981'],
            ['name' => 'Chống ăn mòn', 'slug' => 'chong-an-mon', 'color' => '#f59e0b'],
            ['name' => 'Sơn nước', 'slug' => 'son-nuoc', 'color' => '#06b6d4'],
            ['name' => 'Thi công', 'slug' => 'thi-cong', 'color' => '#8b5cf6'],
            ['name' => 'Bảo dưỡng', 'slug' => 'bao-duong', 'color' => '#ec4899'],
            ['name' => 'Công nghiệp', 'slug' => 'cong-nghiep', 'color' => '#6366f1'],
            ['name' => 'Dân dụng', 'slug' => 'dan-dung', 'color' => '#14b8a6'],
            ['name' => 'Xu hướng', 'slug' => 'xu-huong', 'color' => '#f97316'],
            ['name' => 'Mẹo hay', 'slug' => 'meo-hay', 'color' => '#84cc16'],
        ];

        foreach ($tags as $tagData) {
            PostTag::updateOrCreate(
                ['slug' => $tagData['slug']],
                $tagData
            );
        }

        $this->command->info('✅ Created ' . count($tags) . ' tags');

        // Get or create admin user
        $admin = User::where('is_admin', true)->first();
        if (!$admin) {
            $admin = User::first();
        }
        if (!$admin) {
            $admin = User::create([
                'name' => 'Admin',
                'email' => 'admin@alkanacoating.com',
                'password' => bcrypt('password'),
                'is_admin' => true,
            ]);
            $this->command->info('✅ Created admin user');
        }

        // Create posts
        $posts = [
            [
                'title' => 'Hướng dẫn chọn sơn epoxy cho sàn nhà xưởng',
                'slug' => 'huong-dan-chon-son-epoxy-cho-san-nha-xuong',
                'excerpt' => 'Những tiêu chí quan trọng khi lựa chọn sơn epoxy phù hợp cho sàn công nghiệp và nhà xưởng.',
                'content' => "Sơn epoxy là giải pháp phủ sàn phổ biến nhất cho các nhà xưởng, kho bãi và công trình công nghiệp. Tuy nhiên, để chọn được loại sơn epoxy phù hợp, bạn cần lưu ý các yếu tố sau:\n\n## 1. Đánh giá tải trọng và mục đích sử dụng\n\nTùy theo mục đích sử dụng mà bạn sẽ chọn độ dày và loại sơn epoxy khác nhau:\n- Khu vực đi lại nhẹ: 2-3mm\n- Khu vực có xe nâng: 3-5mm\n- Khu vực sản xuất nặng: 5-8mm\n\n## 2. Điều kiện môi trường\n\nCần xem xét các yếu tố:\n- Nhiệt độ làm việc\n- Độ ẩm\n- Tiếp xúc với hóa chất\n- Yêu cầu về chống trơn trượt\n\n## 3. Yêu cầu về thẩm mỹ\n\nSơn epoxy hiện đại có nhiều màu sắc và hiệu ứng:\n- Epoxy tự phẳng (self-leveling)\n- Epoxy có màu\n- Epoxy trong suốt\n- Epoxy 3D\n\n## 4. Ngân sách và chi phí bảo trì\n\nCân nhắc giữa chi phí ban đầu và tuổi thọ sản phẩm. Sơn epoxy chất lượng cao sẽ bền hơn và tiết kiệm chi phí bảo trì lâu dài.\n\n## Kết luận\n\nViệc chọn sơn epoxy phù hợp sẽ giúp bạn tối ưu chi phí và đảm bảo chất lượng công trình. Hãy tham khảo ý kiến chuyên gia để có được giải pháp tốt nhất.",
                'category_slug' => 'huong-dan',
                'tags_slugs' => ['son-epoxy', 'thi-cong', 'cong-nghiep'],
                'is_featured' => true,
            ],
            [
                'title' => 'Top 5 xu hướng màu sơn nội thất năm 2025',
                'slug' => 'top-5-xu-huong-mau-son-noi-that-nam-2025',
                'excerpt' => 'Khám phá những gam màu sơn đang được yêu thích nhất trong thiết kế nội thất hiện đại.',
                'content' => "Năm 2025 đánh dấu sự chuyển mình của ngành sơn với những xu hướng màu sắc mới mẻ, kết hợp giữa thẩm mỹ và tính bền vững.\n\n## 1. Màu xanh lá non (Sage Green)\n\nMàu xanh lá non mang lại cảm giác tươi mới, gần gũi với thiên nhiên. Đây là lựa chọn hoàn hảo cho không gian phòng ngủ và phòng khách.\n\n## 2. Màu be ấm (Warm Beige)\n\nKế thừa sự phổ biến của màu trung tính, màu be ấm tạo không gian sang trọng, dễ phối hợp với đồ nội thất.\n\n## 3. Màu xanh dương đậm (Navy Blue)\n\nMàu xanh dương đậm thể hiện sự thanh lịch và chuyên nghiệp, phù hợp với phòng làm việc và thư viện.\n\n## 4. Màu đất nung (Terracotta)\n\nMang đậm nét văn hóa Địa Trung Hải, màu đất nung tạo điểm nhấn ấn tượng cho tường nhà.\n\n## 5. Màu xám xanh (Blue Grey)\n\nSự kết hợp hoàn hảo giữa xám và xanh, tạo không gian hiện đại, thư giãn.\n\n## Lời khuyên khi chọn màu\n\n- Xem xét ánh sáng tự nhiên của phòng\n- Thử mẫu trên tường thực tế\n- Phối hợp với màu đồ nội thất\n- Chọn sơn chất lượng cao để màu bền đẹp\n\nHãy đến showroom Alkana Coating để được tư vấn chi tiết và xem trực tiếp bảng màu!",
                'category_slug' => 'san-pham',
                'tags_slugs' => ['son-nuoc', 'xu-huong', 'dan-dung'],
                'is_featured' => true,
            ],
            [
                'title' => '7 bước thi công sơn chống ăn mòn cho kết cấu thép',
                'slug' => '7-buoc-thi-cong-son-chong-an-mon-cho-ket-cau-thep',
                'excerpt' => 'Quy trình thi công sơn chống ăn mòn chuẩn kỹ thuật đảm bảo độ bền và hiệu quả bảo vệ tối đa.',
                'content' => "Thi công sơn chống ăn mòn đúng kỹ thuật là yếu tố quyết định tuổi thọ của kết cấu thép. Dưới đây là 7 bước chuẩn trong quy trình thi công:\n\n## Bước 1: Chuẩn bị bề mặt\n\nLàm sạch bề mặt kim loại bằng phương pháp:\n- Phun cát Sa2.5 (khuyến nghị)\n- Chà nhám cơ học St3\n- Tẩy gỉ hóa học (trường hợp đặc biệt)\n\n## Bước 2: Kiểm tra độ ẩm và nhiệt độ\n\n- Độ ẩm không khí: < 85%\n- Nhiệt độ bề mặt: > điểm sương + 3°C\n- Nhiệt độ môi trường: 5-35°C\n\n## Bước 3: Sơn lót chống ăn mòn\n\nÁp dụng 1-2 lớp sơn lót:\n- Epoxy zinc phosphate\n- Epoxy zinc rich primer (cho môi trường khắc nghiệt)\n\n## Bước 4: Kiểm tra độ dày lớp lót\n\nSử dụng máy đo độ dày DFT, đảm bảo đạt 80-100 micron/lớp.\n\n## Bước 5: Sơn lớp giữa\n\nÁp dụng epoxy high build hoặc polyurethane để tăng độ dày tổng thể.\n\n## Bước 6: Sơn phủ hoàn thiện\n\nChọn loại sơn phủ phù hợp:\n- PU cho môi trường công nghiệp\n- Acrylic cho ngoài trời\n- Epoxy cho môi trường hóa chất\n\n## Bước 7: Kiểm tra chất lượng\n\n- Đo độ dày tổng thể\n- Kiểm tra độ bám dính\n- Kiểm tra lỗ kim (holiday detector)\n\n## Lưu ý quan trọng\n\n- Tuân thủ khoảng thời gian phủ lại (overcoating interval)\n- Bảo quản sơn đúng nhiệt độ\n- Sử dụng dụng cụ thi công sạch\n\nLiên hệ Alkana Coating để được hỗ trợ thi công chuyên nghiệp!",
                'category_slug' => 'ky-thuat-son',
                'tags_slugs' => ['chong-an-mon', 'thi-cong', 'cong-nghiep'],
                'is_featured' => false,
            ],
            [
                'title' => 'So sánh sơn PU và sơn Epoxy: Nên chọn loại nào?',
                'slug' => 'so-sanh-son-pu-va-son-epoxy-nen-chon-loai-nao',
                'excerpt' => 'Phân tích ưu nhược điểm của sơn PU và Epoxy để bạn chọn được sản phẩm phù hợp.',
                'content' => "Sơn PU (Polyurethane) và sơn Epoxy là hai dòng sơn công nghiệp phổ biến nhất. Vậy nên chọn loại nào? Hãy cùng so sánh:\n\n## Sơn Epoxy\n\n### Ưu điểm:\n- Độ bám dính cực tốt\n- Chống hóa chất mạnh\n- Giá thành hợp lý\n- Độ cứng cao\n\n### Nhược điểm:\n- Dễ phai màu khi tiếp xúc UV\n- Cần thời gian khô lâu\n- Không bền với kiềm mạnh\n\n### Ứng dụng:\n- Sàn nhà xưởng\n- Bể chứa hóa chất\n- Kết cấu bên trong nhà\n\n## Sơn PU (Polyurethane)\n\n### Ưu điểm:\n- Bền màu ngoài trời\n- Chống UV xuất sắc\n- Độ bóng cao, đẹp lâu\n- Chống thấm tốt\n\n### Nhược điểm:\n- Giá thành cao hơn epoxy\n- Độ bám dính kém hơn epoxy\n- Nhạy cảm với độ ẩm khi thi công\n\n### Ứng dụng:\n- Sơn ngoài trời\n- Kết cấu thép\n- Sàn nhà để xe\n- Các bề mặt cần thẩm mỹ cao\n\n## Kết luận\n\n**Chọn Epoxy khi:**\n- Cần chống hóa chất\n- Bề mặt bên trong nhà\n- Ngân sách hạn chế\n\n**Chọn PU khi:**\n- Bề mặt ngoài trời\n- Cần độ bóng cao\n- Yêu cầu bền màu lâu dài\n\n**Giải pháp tối ưu:** Kết hợp cả hai - dùng Epoxy làm lót, PU làm phủ!\n\nLiên hệ Alkana Coating để được tư vấn giải pháp phù hợp nhất!",
                'category_slug' => 'san-pham',
                'tags_slugs' => ['son-epoxy', 'son-pu', 'ky-thuat-son'],
                'is_featured' => false,
            ],
            [
                'title' => 'Bảo dưỡng sàn epoxy: Những điều cần biết',
                'slug' => 'bao-duong-san-epoxy-nhung-dieu-can-biet',
                'excerpt' => 'Hướng dẫn bảo dưỡng sàn epoxy đúng cách để duy trì độ bền và thẩm mỹ lâu dài.',
                'content' => "Sàn epoxy tuy bền nhưng vẫn cần được bảo dưỡng định kỳ để duy trì chất lượng. Dưới đây là hướng dẫn chi tiết:\n\n## Vệ sinh hàng ngày\n\n### Công cụ cần thiết:\n- Chổi mềm hoặc máy hút bụi\n- Cây lau nhà với đầu microfiber\n- Nước sạch\n- Dung dịch tẩy rửa pH trung tính\n\n### Quy trình:\n1. Quét hoặc hút bụi, cát sạch\n2. Lau ướt bằng khăn microfiber\n3. Sử dụng nước sạch hoặc dung dịch tẩy nhẹ\n4. Lau khô hoặc để khô tự nhiên\n\n## Vệ sinh định kỳ (hàng tuần)\n\n- Lau chùi kỹ bằng dung dịch tẩy chuyên dụng\n- Chú ý các góc, khe hở\n- Kiểm tra và xử lý vết bẩn cứng đầu\n\n## Những việc KHÔNG nên làm\n\n❌ Dùng chất tẩy rửa có tính axit/kiềm mạnh\n❌ Sử dụng bàn chải cứng, cọ kim loại\n❌ Để nước đọng lâu trên bề mặt\n❌ Kéo lê vật nặng, sắc nhọn\n\n## Bảo dưỡng sâu (6 tháng/lần)\n\n1. **Đánh bóng bề mặt:**\n   - Sử dụng máy đánh bóng tốc độ thấp\n   - Dùng pad màu đỏ hoặc xanh\n\n2. **Waxing (tùy chọn):**\n   - Phủ lớp wax bảo vệ\n   - Tăng độ bóng và chống trơn\n\n3. **Sơn phủ lại (nếu cần):**\n   - Khi bề mặt bị mờ hoặc trầy xước nhiều\n   - Phủ 1 lớp topcoat mỏng\n\n## Xử lý vết bẩn đặc biệt\n\n- **Dầu mỡ:** Dùng dung dịch khử dầu chuyên dụng\n- **Vết lốp xe:** Tẩy bằng acetone (nhẹ nhàng)\n- **Vết hóa chất:** Lau ngay lập tức, rửa nhiều lần\n\n## Lưu ý quan trọng\n\n- Đặt thảm chùi chân ở lối vào\n- Dán miếng đệm dưới chân bàn ghế\n- Tránh để vật sắc nhọn rơi\n- Kiểm tra định kỳ để phát hiện hư hỏng sớm\n\n## Khi nào cần sơn lại?\n\nDấu hiệu cần sơn phủ lại:\n- Bề mặt bị mờ, xỉn màu\n- Có vết nứt, bong tróc\n- Mất độ bóng dù đã đánh bóng\n- Trầy xước sâu nhiều chỗ\n\nLiên hệ Alkana Coating để được tư vấn dịch vụ bảo dưỡng và sơn phủ lại chuyên nghiệp!",
                'category_slug' => 'huong-dan',
                'tags_slugs' => ['son-epoxy', 'bao-duong', 'meo-hay'],
                'is_featured' => false,
            ],
            [
                'title' => 'Dự án sơn nhà máy sản xuất thực phẩm - Case Study',
                'slug' => 'du-an-son-nha-may-san-xuat-thuc-pham-case-study',
                'excerpt' => 'Chia sẻ kinh nghiệm thi công sơn cho nhà máy thực phẩm đạt chuẩn FDA và GMP.',
                'content' => "Alkana Coating vừa hoàn thành dự án sơn cho nhà máy chế biến thực phẩm diện tích 5,000m². Đây là dự án đặc biệt với yêu cầu nghiêm ngặt về vệ sinh an toàn thực phẩm.\n\n## Thông tin dự án\n\n- **Khách hàng:** Công ty TNHH Thực phẩm ABC\n- **Địa điểm:** KCN Vsip Bình Dương\n- **Diện tích:** 5,000m² sàn + 3,000m² tường\n- **Thời gian:** 45 ngày\n- **Giá trị:** 2.5 tỷ VNĐ\n\n## Yêu cầu kỹ thuật\n\n### Tiêu chuẩn:\n- FDA (Cục quản lý Thực phẩm và Dược phẩm Hoa Kỳ)\n- GMP (Thực hành sản xuất tốt)\n- HACCP (Phân tích mối nguy và điểm kiểm soát tới hạn)\n\n### Đặc điểm:\n- Kháng khuẩn, chống nấm mốc\n- Dễ vệ sinh, không thấm\n- Không độc hại, không mùi\n- Chịu được rửa áp lực cao\n\n## Giải pháp sơn\n\n### Sàn:\n1. **Lớp lót:** Epoxy primer không dung môi\n2. **Lớp giữa:** Epoxy self-leveling kháng khuẩn\n3. **Lớp phủ:** PU topcoat chuẩn FDA\n4. **Độ dày tổng:** 3mm\n\n### Tường:\n1. **Lớp lót:** Acrylic primer chống kiềm\n2. **Lớp phủ:** Epoxy kháng khuẩn màu trắng (2 lớp)\n3. **Độ dày:** 200 micron\n\n## Quy trình thi công\n\n### Giai đoạn 1: Chuẩn bị (7 ngày)\n- Phun cát làm sạch sàn bê tông\n- Xử lý vết nứt, rỗ\n- Đánh bóng tường\n\n### Giai đoạn 2: Sơn sàn (20 ngày)\n- Sơn lót (2 ngày)\n- Sơn giữa (5 ngày x 2 đợt)\n- Sơn phủ (3 ngày)\n- Thời gian khô/bảo dưỡng (10 ngày)\n\n### Giai đoạn 3: Sơn tường (15 ngày)\n- Sơn lót (3 ngày)\n- Sơn phủ lớp 1 (4 ngày)\n- Sơn phủ lớp 2 (4 ngày)\n- Hoàn thiện (4 ngày)\n\n### Giai đoạn 4: Kiểm tra nghiệm thu (3 ngày)\n- Kiểm tra độ dày\n- Test độ bám dính\n- Test kháng khuẩn\n- Kiểm tra thẩm mỹ\n\n## Kết quả đạt được\n\n✅ Đạt 100% tiêu chuẩn FDA, GMP\n✅ Bề mặt láng mịn, dễ vệ sinh\n✅ Không phát sinh mùi trong quá trình sản xuất\n✅ Độ bền ước tính: 10-15 năm\n✅ Tiết kiệm 20% chi phí vệ sinh hàng năm\n\n## Phản hồi khách hàng\n\n> \"Alkana Coating đã thực hiện xuất sắc dự án sơn cho nhà máy của chúng tôi. Đội ngũ thi công chuyên nghiệp, đúng tiến độ và chất lượng vượt mong đợi. Đặc biệt, sàn và tường sau khi sơn rất dễ vệ sinh, đáp ứng hoàn hảo yêu cầu sản xuất thực phẩm.\"\n> \n> *- Ông Nguyễn Văn A, Giám đốc Nhà máy*\n\n## Bài học kinh nghiệm\n\n1. **Lựa chọn sản phẩm phù hợp:** Sơn phải có chứng nhận FDA/GMP\n2. **Chuẩn bị bề mặt kỹ:** Quyết định 70% chất lượng\n3. **Kiểm soát môi trường:** Nhiệt độ và độ ẩm ảnh hưởng lớn\n4. **Thời gian khô hóa:** Không vội vàng đưa vào sử dụng\n\nBạn có dự án tương tự? Liên hệ Alkana Coating để được tư vấn chi tiết!",
                'category_slug' => 'du-an',
                'tags_slugs' => ['son-epoxy', 'thi-cong', 'cong-nghiep'],
                'is_featured' => true,
            ],
        ];

        foreach ($posts as $index => $postData) {
            $category = PostCategory::where('slug', $postData['category_slug'])->first();
            
            $post = Post::updateOrCreate(
                ['slug' => $postData['slug']],
                [
                    'author_id' => $admin->id,
                    'title' => $postData['title'],
                    'slug' => $postData['slug'],
                    'excerpt' => $postData['excerpt'],
                    'content' => $postData['content'],
                    'category_id' => $category->id,
                    'is_published' => true,
                    'is_featured' => $postData['is_featured'],
                    'published_at' => now()->subDays(count($posts) - $index),
                    'view_count' => rand(50, 500),
                    'order' => $index,
                    'meta_title' => $postData['title'] . ' | Alkana Coating Blog',
                    'meta_description' => $postData['excerpt'],
                ]
            );

            // Calculate reading time
            $post->calculateReadingTime();

            // Attach tags
            $tagIds = [];
            foreach ($postData['tags_slugs'] as $tagSlug) {
                $tag = PostTag::where('slug', $tagSlug)->first();
                if ($tag) {
                    $tagIds[] = $tag->id;
                }
            }
            if (!empty($tagIds)) {
                $post->postTags()->sync($tagIds);
                
                // Update tag usage counts
                foreach ($tagIds as $tagId) {
                    $tag = PostTag::find($tagId);
                    $tag->syncUsageCount();
                }
            }
        }

        $this->command->info('✅ Created ' . count($posts) . ' posts');

        // Re-enable FK checks
        \DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $this->command->info('✅ Seeding completed successfully!');
        $this->command->info('📝 Created ' . count($categories) . ' categories, ' . count($tags) . ' tags, and ' . count($posts) . ' posts');
    }
}
