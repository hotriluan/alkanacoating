<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Project;
use App\Models\ProjectImage;
use App\Models\ProjectTestimonial;

class ProjectsWithDetailsSeeder extends Seeder
{
    public function run()
    {
        // Clear existing data
        \DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        ProjectTestimonial::truncate();
        ProjectImage::truncate();
        Project::truncate();
        \DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Project 1
        $p1 = Project::create([
            'title' => 'Dự án phủ epoxy nhà máy sản xuất thép Hòa Phát',
            'slug' => 'du-an-phu-epoxy-nha-may-san-xuat-thep-hoa-phat',
            'thumbnail' => 'projects/hoa-phat-main.jpg',
            'excerpt' => 'Thi công hệ thống sơn epoxy chống ăn mòn cho nhà máy sản xuất thép quy mô lớn',
            'content' => "Dự án thi công hệ thống phủ epoxy chống ăn mòn cho Nhà máy sản xuất thép Hòa Phát tại Dung Quất, Quảng Ngãi.\n\nCông trình bao gồm:\n- Phủ epoxy cho kết cấu thép chịu lực diện tích 15.000m²\n- Sơn chống ăn mòn cho thiết bị và đường ống\n- Hệ thống sơn chịu nhiệt độ cao cho khu vực lò\n- Phủ sàn epoxy tự phẳng cho nhà xưởng\n\nĐội ngũ kỹ thuật viên chuyên nghiệp với hơn 50 người thi công đồng thời, đảm bảo tiến độ và chất lượng theo đúng yêu cầu kỹ thuật quốc tế.",
            'client' => 'Tập đoàn Hòa Phát',
            'location' => 'KCN Dung Quất, Quảng Ngãi',
            'start_date' => '2024-01-15',
            'end_date' => '2024-06-30',
            'budget_range' => '15-20 tỷ VNĐ',
            'project_type' => 'công nghiệp',
            'progress_percentage' => 100,
            'short_description' => 'Thi công hệ thống phủ epoxy chống ăn mòn cho nhà máy sản xuất thép quy mô 15.000m² với đội ngũ kỹ thuật chuyên nghiệp',
            'features' => json_encode(['Hệ thống epoxy chống ăn mòn cao cấp', 'Sơn chịu nhiệt độ cao đến 400°C', 'Phủ sàn tự phẳng công nghệ Đức', 'Bảo hành 10 năm', 'Đạt tiêu chuẩn ISO 9001:2015']),
            'is_published' => true,
            'view_count' => 1247
        ]);

        ProjectImage::insert([
            ['project_id' => $p1->id, 'image_url' => 'projects/hoa-phat-1.jpg', 'caption' => 'Toàn cảnh nhà máy trước khi thi công', 'image_type' => 'before', 'sort_order' => 1, 'is_featured' => false, 'alt_text' => null, 'created_at' => now(), 'updated_at' => now()],
            ['project_id' => $p1->id, 'image_url' => 'projects/hoa-phat-2.jpg', 'caption' => 'Quá trình xử lý bề mặt thép', 'image_type' => 'progress', 'sort_order' => 2, 'is_featured' => false, 'alt_text' => null, 'created_at' => now(), 'updated_at' => now()],
            ['project_id' => $p1->id, 'image_url' => 'projects/hoa-phat-3.jpg', 'caption' => 'Thi công lớp epoxy chống ăn mòn', 'image_type' => 'progress', 'sort_order' => 3, 'is_featured' => false, 'alt_text' => null, 'created_at' => now(), 'updated_at' => now()],
            ['project_id' => $p1->id, 'image_url' => 'projects/hoa-phat-final.jpg', 'caption' => 'Công trình hoàn thành', 'image_type' => 'after', 'sort_order' => 4, 'is_featured' => false, 'alt_text' => null, 'created_at' => now(), 'updated_at' => now()],
        ]);

        ProjectTestimonial::create([
            'project_id' => $p1->id,
            'client_name' => 'Nguyễn Văn Minh',
            'client_position' => 'Giám đốc Dự án',
            'client_company' => 'Tập đoàn Hòa Phát',
            'testimonial' => 'Alkana Coating đã thực hiện dự án với chất lượng vượt mong đợi. Đội ngũ kỹ thuật chuyên nghiệp, tiến độ đúng cam kết. Chúng tôi rất hài lòng và sẽ tiếp tục hợp tác trong các dự án tương lai.',
            'rating' => 5
        ]);

        // Project 2
        $p2 = Project::create([
            'title' => 'Sơn nội thất cao cấp Trung tâm thương mại Vincom Mega Mall',
            'slug' => 'son-noi-that-cao-cap-vincom-mega-mall',
            'thumbnail' => 'projects/vincom-main.jpg',
            'excerpt' => 'Thi công sơn nội thất và hệ thống phủ sàn cho TTTM quy mô 8 tầng',
            'content' => "Dự án thi công sơn nội thất và hệ thống phủ sàn epoxy cho Trung tâm thương mại Vincom Mega Mall tại TP.HCM.\n\nPhạm vi công việc:\n- Sơn tường nội thất toàn bộ 8 tầng\n- Phủ sàn epoxy khu vực bãi đỗ xe 3.000m²\n- Sơn kết cấu thép mái che\n- Phủ chống thấm sân thượng\n\nSử dụng sản phẩm cao cấp nhập khẩu từ Châu Âu, thân thiện môi trường, không mùi, phù hợp với không gian thương mại đông người.",
            'client' => 'Vingroup',
            'location' => 'Quận 2, TP. Hồ Chí Minh',
            'start_date' => '2024-03-01',
            'end_date' => '2024-08-15',
            'budget_range' => '8-12 tỷ VNĐ',
            'project_type' => 'thương mại',
            'progress_percentage' => 100,
            'short_description' => 'Thi công sơn nội thất 8 tầng và phủ sàn epoxy cho trung tâm thương mại với sản phẩm thân thiện môi trường',
            'features' => json_encode(['Sơn cao cấp nhập khẩu Châu Âu', 'Không mùi, thân thiện môi trường', 'Màu sắc đa dạng theo thiết kế', 'Độ bền cao, dễ vệ sinh', 'Thi công nhanh, không ảnh hưởng hoạt động']),
            'is_published' => true,
            'view_count' => 892
        ]);

        ProjectImage::insert([
            ['project_id' => $p2->id, 'image_url' => 'projects/vincom-1.jpg', 'caption' => 'Khu vực trước khi thi công', 'image_type' => 'before', 'sort_order' => 1, 'is_featured' => false, 'alt_text' => null, 'created_at' => now(), 'updated_at' => now()],
            ['project_id' => $p2->id, 'image_url' => 'projects/vincom-2.jpg', 'caption' => 'Nội thất sau khi hoàn thành', 'image_type' => 'after', 'sort_order' => 2, 'is_featured' => false, 'alt_text' => null, 'created_at' => now(), 'updated_at' => now()],
            ['project_id' => $p2->id, 'image_url' => 'projects/vincom-3.jpg', 'caption' => 'Bãi đỗ xe với sàn epoxy', 'image_type' => 'gallery', 'sort_order' => 3, 'is_featured' => false, 'alt_text' => null, 'created_at' => now(), 'updated_at' => now()],
        ]);

        ProjectTestimonial::create([
            'project_id' => $p2->id,
            'client_name' => 'Trần Thị Lan Anh',
            'client_position' => 'Quản lý Dự án',
            'client_company' => 'Vingroup',
            'testimonial' => 'Chất lượng thi công rất tốt, sản phẩm không mùi nên không ảnh hưởng đến hoạt động kinh doanh. Đội ngũ làm việc chuyên nghiệp và đúng tiến độ.',
            'rating' => 5
        ]);

        // Project 3
        $p3 = Project::create([
            'title' => 'Sơn chống ăn mòn cầu vượt Thủ Thiêm',
            'slug' => 'son-chong-an-mon-cau-vuot-thu-thiem',
            'thumbnail' => 'projects/bridge-main.jpg',
            'excerpt' => 'Thi công hệ thống sơn chống ăn mòn cho cầu vượt dài 1.2km',
            'content' => "Dự án bảo dưỡng và sơn chống ăn mòn cho Cầu vượt Thủ Thiêm, TP.HCM.\n\nCông việc thực hiện:\n- Tẩy rỉ sét, làm sạch bề mặt thép\n- Phủ lớp sơn chống rỉ Zinc-rich primer\n- Sơn lớp trung gian epoxy\n- Sơn hoàn thiện polyurethane chịu thời tiết\n\nDự án được thực hiện vào ban đêm để không ảnh hưởng đến giao thông, với hệ thống chiếu sáng và an toàn lao động đạt chuẩn.",
            'client' => 'Sở Giao thông Vận tải TP.HCM',
            'location' => 'Quận 2, TP. Hồ Chí Minh',
            'start_date' => '2024-02-10',
            'end_date' => '2024-05-20',
            'budget_range' => '5-8 tỷ VNĐ',
            'project_type' => 'hạ tầng',
            'progress_percentage' => 100,
            'short_description' => 'Bảo dưỡng và sơn chống ăn mòn cầu vượt dài 1.2km với hệ thống sơn 3 lớp chuyên dụng',
            'features' => json_encode(['Hệ thống sơn 3 lớp chuyên dụng', 'Chống ăn mòn trong môi trường ven biển', 'Thi công ban đêm, không ảnh hưởng giao thông', 'Bảo hành 7 năm', 'Đạt tiêu chuẩn giao thông Việt Nam']),
            'is_published' => true,
            'view_count' => 654
        ]);

        ProjectImage::insert([
            ['project_id' => $p3->id, 'image_url' => 'projects/bridge-before.jpg', 'caption' => 'Tình trạng cầu trước bảo dưỡng', 'image_type' => 'before', 'sort_order' => 1, 'is_featured' => false, 'alt_text' => null, 'created_at' => now(), 'updated_at' => now()],
            ['project_id' => $p3->id, 'image_url' => 'projects/bridge-progress.jpg', 'caption' => 'Quá trình thi công ban đêm', 'image_type' => 'progress', 'sort_order' => 2, 'is_featured' => false, 'alt_text' => null, 'created_at' => now(), 'updated_at' => now()],
            ['project_id' => $p3->id, 'image_url' => 'projects/bridge-after.jpg', 'caption' => 'Cầu sau khi hoàn thành', 'image_type' => 'after', 'sort_order' => 3, 'is_featured' => false, 'alt_text' => null, 'created_at' => now(), 'updated_at' => now()],
        ]);

        ProjectTestimonial::create([
            'project_id' => $p3->id,
            'client_name' => 'Lê Quang Dũng',
            'client_position' => 'Phó Giám đốc',
            'client_company' => 'Sở GTVT TP.HCM',
            'testimonial' => 'Công ty đã thực hiện dự án rất chuyên nghiệp, thi công ban đêm đúng kế hoạch, không gây ảnh hưởng đến giao thông. Chất lượng sơn tốt, đảm bảo yêu cầu kỹ thuật.',
            'rating' => 5
        ]);

        $this->command->info('✅ Đã seed 3 dự án với đầy đủ thông tin, hình ảnh và đánh giá!');
    }
}
