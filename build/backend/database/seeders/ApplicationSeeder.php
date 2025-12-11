<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Application;
use App\Models\Recruitment;

class ApplicationSeeder extends Seeder
{
    public function run(): void
    {
        $recruitments = Recruitment::all();
        
        if ($recruitments->isEmpty()) {
            $this->command->warn('No recruitments found. Please run RecruitmentSeeder first.');
            return;
        }

        $applications = [
            [
                'name' => 'Nguyễn Văn An',
                'email' => 'nguyenvanan@example.com',
                'phone' => '0901234567',
                'cover_letter' => 'Kính gửi Ban Tuyển dụng, tôi rất quan tâm đến vị trí này và tin rằng với kinh nghiệm của mình, tôi sẽ đóng góp tích cực cho công ty.',
                'status' => 'new'
            ],
            [
                'name' => 'Trần Thị Bình',
                'email' => 'tranthibinh@example.com',
                'phone' => '0912345678',
                'cover_letter' => 'Tôi có 3 năm kinh nghiệm trong lĩnh vực hóa chất và rất mong muốn được làm việc tại Alkana Coating.',
                'status' => 'reviewing'
            ],
            [
                'name' => 'Lê Hoàng Cường',
                'email' => 'lehoangcuong@example.com',
                'phone' => '0923456789',
                'cover_letter' => 'Với nền tảng vững chắc về công nghệ sơn, tôi tự tin có thể hoàn thành tốt công việc.',
                'status' => 'shortlisted'
            ],
            [
                'name' => 'Phạm Minh Đức',
                'email' => 'phamminhduc@example.com',
                'phone' => '0934567890',
                'cover_letter' => 'Tôi đã theo dõi công ty từ lâu và rất ấn tượng với các sản phẩm chất lượng cao của Alkana.',
                'status' => 'new'
            ],
            [
                'name' => 'Hoàng Thị Em',
                'email' => 'hoangthiem@example.com',
                'phone' => '0945678901',
                'cover_letter' => 'Với kỹ năng marketing và đam mê về ngành sơn, tôi tin mình phù hợp với vị trí này.',
                'status' => 'reviewing'
            ],
            [
                'name' => 'Đỗ Văn Phúc',
                'email' => 'dovanphuc@example.com',
                'phone' => '0956789012',
                'cover_letter' => 'Tôi mong muốn được đóng góp sức trẻ và nhiệt huyết của mình cho sự phát triển của công ty.',
                'status' => 'rejected'
            ],
            [
                'name' => 'Vũ Thị Giang',
                'email' => 'vuthigiang@example.com',
                'phone' => '0967890123',
                'cover_letter' => 'Kinh nghiệm 5 năm trong ngành kế toán giúp tôi tự tin ứng tuyển vào vị trí này.',
                'status' => 'accepted'
            ],
            [
                'name' => 'Bùi Minh Hải',
                'email' => 'buiminhhai@example.com',
                'phone' => '0978901234',
                'cover_letter' => 'Tôi đã làm việc tại nhiều nhà máy sơn và có kinh nghiệm phong phú về quy trình sản xuất.',
                'status' => 'new'
            ],
            [
                'name' => 'Ngô Thị Lan',
                'email' => 'ngothilan@example.com',
                'phone' => '0989012345',
                'cover_letter' => 'Tôi rất hứng thú với công nghệ sơn hiện đại và mong được học hỏi thêm tại Alkana.',
                'status' => 'reviewing'
            ],
            [
                'name' => 'Đinh Văn Khoa',
                'email' => 'dinhvankhoa@example.com',
                'phone' => '0990123456',
                'cover_letter' => 'Với bằng Thạc sĩ Hóa học và 4 năm kinh nghiệm R&D, tôi tin mình sẽ phù hợp với công ty.',
                'status' => 'shortlisted'
            ]
        ];

        // Distribute applications across recruitments
        foreach ($recruitments as $index => $recruitment) {
            // Create 1-3 applications per recruitment
            $numApplications = rand(1, 3);
            
            for ($i = 0; $i < $numApplications && !empty($applications); $i++) {
                $appData = array_shift($applications);
                
                Application::create([
                    'recruitment_id' => $recruitment->id,
                    'name' => $appData['name'],
                    'email' => $appData['email'],
                    'phone' => $appData['phone'],
                    'cover_letter' => $appData['cover_letter'],
                    'status' => $appData['status'],
                    'cv_file' => null // In real scenario, this would be a file path
                ]);
            }
        }
    }
}
