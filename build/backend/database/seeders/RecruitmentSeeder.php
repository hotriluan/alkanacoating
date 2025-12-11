<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Recruitment;
use Carbon\Carbon;

class RecruitmentSeeder extends Seeder
{
    public function run(): void
    {
        $recruitments = [
            [
                'title' => 'Kỹ sư Công nghệ Sơn',
                'slug' => 'ky-su-cong-nghe-son',
                'description' => '<h3>Mô tả công việc</h3>
<ul>
<li>Nghiên cứu và phát triển các công thức sơn mới phù hợp với nhu cầu thị trường</li>
<li>Kiểm tra chất lượng nguyên liệu và sản phẩm sơn</li>
<li>Tư vấn kỹ thuật cho khách hàng về ứng dụng sơn</li>
<li>Giải quyết các vấn đề kỹ thuật phát sinh trong quá trình sản xuất</li>
<li>Cải tiến quy trình sản xuất để tối ưu hiệu quả</li>
</ul>',
                'requirements' => '<h3>Yêu cầu ứng viên</h3>
<ul>
<li>Tốt nghiệp Đại học chuyên ngành Hóa học, Công nghệ Hóa học hoặc liên quan</li>
<li>Có ít nhất 2 năm kinh nghiệm trong lĩnh vực sơn, hóa chất</li>
<li>Hiểu biết sâu về công nghệ sơn, phối trộn màu</li>
<li>Kỹ năng phân tích và giải quyết vấn đề tốt</li>
<li>Có khả năng làm việc độc lập và theo nhóm</li>
<li>Tiếng Anh giao tiếp tốt là một lợi thế</li>
</ul>',
                'location' => 'Hà Nội',
                'salary' => '15-25 triệu VNĐ',
                'deadline' => Carbon::now()->addMonths(2)->toDateString(),
                'status' => 'open'
            ],
            [
                'title' => 'Nhân viên Kinh doanh Khu vực',
                'slug' => 'nhan-vien-kinh-doanh-khu-vuc',
                'description' => '<h3>Mô tả công việc</h3>
<ul>
<li>Tìm kiếm và phát triển khách hàng mới trong khu vực được phân công</li>
<li>Chăm sóc và duy trì mối quan hệ với khách hàng hiện tại</li>
<li>Tư vấn giải pháp sơn phù hợp cho từng dự án của khách hàng</li>
<li>Lập báo cáo kinh doanh định kỳ</li>
<li>Phối hợp với bộ phận kỹ thuật để hỗ trợ khách hàng</li>
<li>Tham gia các hoạt động marketing, sự kiện của công ty</li>
</ul>',
                'requirements' => '<h3>Yêu cầu ứng viên</h3>
<ul>
<li>Tốt nghiệp Cao đẳng/Đại học các ngành liên quan</li>
<li>Ưu tiên có kinh nghiệm bán hàng trong lĩnh vực vật liệu xây dựng, sơn</li>
<li>Kỹ năng giao tiếp, thương thuyết tốt</li>
<li>Năng động, chủ động trong công việc</li>
<li>Có xe máy/ô tô và bằng lái xe</li>
<li>Chấp nhận đi công tác trong khu vực</li>
</ul>',
                'location' => 'TP. Hồ Chí Minh',
                'salary' => '10-20 triệu VNĐ + Thưởng doanh số',
                'deadline' => Carbon::now()->addMonths(1)->toDateString(),
                'status' => 'open'
            ],
            [
                'title' => 'Kỹ thuật viên Phối màu',
                'slug' => 'ky-thuat-vien-phoi-mau',
                'description' => '<h3>Mô tả công việc</h3>
<ul>
<li>Thực hiện phối màu theo yêu cầu của khách hàng</li>
<li>Kiểm tra và đảm bảo độ chính xác của màu sắc</li>
<li>Lưu trữ và quản lý công thức phối màu</li>
<li>Tư vấn màu sắc cho khách hàng</li>
<li>Vận hành và bảo dưỡng thiết bị phối màu</li>
</ul>',
                'requirements' => '<h3>Yêu cầu ứng viên</h3>
<ul>
<li>Tốt nghiệp Trung cấp/Cao đẳng trở lên</li>
<li>Có kinh nghiệm về phối màu sơn là lợi thế</li>
<li>Khả năng phân biệt màu sắc tốt</li>
<li>Tỉ mỉ, cẩn thận trong công việc</li>
<li>Sẵn sàng học hỏi và phát triển kỹ năng</li>
</ul>',
                'location' => 'Hà Nội',
                'salary' => '8-12 triệu VNĐ',
                'deadline' => Carbon::now()->addDays(45)->toDateString(),
                'status' => 'open'
            ],
            [
                'title' => 'Trưởng phòng Marketing',
                'slug' => 'truong-phong-marketing',
                'description' => '<h3>Mô tả công việc</h3>
<ul>
<li>Xây dựng và triển khai chiến lược marketing tổng thể</li>
<li>Quản lý ngân sách marketing và đo lường hiệu quả</li>
<li>Phát triển thương hiệu và hình ảnh công ty</li>
<li>Quản lý các kênh truyền thông online và offline</li>
<li>Tổ chức các sự kiện, hội thảo, triển lãm</li>
<li>Quản lý và phát triển đội ngũ marketing</li>
<li>Phối hợp với bộ phận kinh doanh để tạo ra leads chất lượng</li>
</ul>',
                'requirements' => '<h3>Yêu cầu ứng viên</h3>
<ul>
<li>Tốt nghiệp Đại học chuyên ngành Marketing, Kinh doanh</li>
<li>Có ít nhất 5 năm kinh nghiệm trong lĩnh vực marketing, trong đó 2 năm ở vị trí quản lý</li>
<li>Ưu tiên có kinh nghiệm trong ngành sơn, vật liệu xây dựng</li>
<li>Kỹ năng lập kế hoạch chiến lược tốt</li>
<li>Thành thạo digital marketing (SEO, SEM, Social Media, Email Marketing)</li>
<li>Kỹ năng quản lý đội nhóm, giao tiếp và thuyết trình xuất sắc</li>
<li>Tiếng Anh giao tiếp và đọc hiểu tốt</li>
</ul>',
                'location' => 'Hà Nội',
                'salary' => 'Thỏa thuận (trên 20 triệu VNĐ)',
                'deadline' => Carbon::now()->addMonths(2)->toDateString(),
                'status' => 'open'
            ],
            [
                'title' => 'Nhân viên Kế toán',
                'slug' => 'nhan-vien-ke-toan',
                'description' => '<h3>Mô tả công việc</h3>
<ul>
<li>Theo dõi và ghi chép các giao dịch tài chính hàng ngày</li>
<li>Kiểm tra và đối chiếu chứng từ kế toán</li>
<li>Lập báo cáo tài chính định kỳ</li>
<li>Quản lý công nợ phải thu, phải trả</li>
<li>Thực hiện thanh toán cho nhà cung cấp và nhân viên</li>
<li>Hỗ trợ kế toán trưởng trong công tác quyết toán thuế</li>
</ul>',
                'requirements' => '<h3>Yêu cầu ứng viên</h3>
<ul>
<li>Tốt nghiệp Cao đẳng/Đại học chuyên ngành Kế toán</li>
<li>Có ít nhất 1 năm kinh nghiệm làm kế toán</li>
<li>Nắm vững các chuẩn mực kế toán Việt Nam</li>
<li>Thành thạo Excel, phần mềm kế toán</li>
<li>Cẩn thận, tỉ mỉ, trung thực</li>
<li>Có chứng chỉ kế toán là một lợi thế</li>
</ul>',
                'location' => 'Hà Nội',
                'salary' => '9-14 triệu VNĐ',
                'deadline' => Carbon::now()->addDays(30)->toDateString(),
                'status' => 'open'
            ],
            [
                'title' => 'Nhân viên Kho',
                'slug' => 'nhan-vien-kho',
                'description' => '<h3>Mô tả công việc</h3>
<ul>
<li>Tiếp nhận, kiểm tra và nhập kho hàng hóa</li>
<li>Sắp xếp, bảo quản hàng hóa trong kho đúng quy định</li>
<li>Xuất kho và giao hàng cho khách hàng</li>
<li>Kiểm kê định kỳ và báo cáo tồn kho</li>
<li>Vệ sinh và đảm bảo an toàn kho hàng</li>
</ul>',
                'requirements' => '<h3>Yêu cầu ứng viên</h3>
<ul>
<li>Tốt nghiệp THPT trở lên</li>
<li>Ưu tiên có kinh nghiệm làm việc trong kho</li>
<li>Khỏe mạnh, chịu được áp lực công việc</li>
<li>Trung thực, cẩn thận, có trách nhiệm</li>
<li>Có thể làm việc ca kíp nếu cần</li>
</ul>',
                'location' => 'Hà Nội',
                'salary' => '7-10 triệu VNĐ',
                'deadline' => Carbon::now()->addDays(60)->toDateString(),
                'status' => 'open'
            ],
            [
                'title' => 'Chuyên viên Nghiên cứu & Phát triển (R&D)',
                'slug' => 'chuyen-vien-nghien-cuu-phat-trien',
                'description' => '<h3>Mô tả công việc</h3>
<ul>
<li>Nghiên cứu xu hướng công nghệ sơn trên thế giới</li>
<li>Phát triển sản phẩm sơn mới theo định hướng công ty</li>
<li>Thử nghiệm và đánh giá tính năng sản phẩm</li>
<li>Tối ưu hóa công thức sản xuất để giảm chi phí</li>
<li>Lập báo cáo kỹ thuật và tài liệu sản phẩm</li>
<li>Phối hợp với bộ phận kinh doanh để phát triển sản phẩm theo nhu cầu thị trường</li>
</ul>',
                'requirements' => '<h3>Yêu cầu ứng viên</h3>
<ul>
<li>Tốt nghiệp Đại học/Thạc sĩ chuyên ngành Hóa học, Công nghệ Hóa học</li>
<li>Có ít nhất 3 năm kinh nghiệm trong R&D ngành sơn hoặc hóa chất</li>
<li>Kiến thức sâu về hóa học polymer, công nghệ pha chế sơn</li>
<li>Kỹ năng nghiên cứu khoa học và phân tích dữ liệu</li>
<li>Tiếng Anh chuyên ngành tốt để đọc tài liệu kỹ thuật</li>
<li>Tư duy sáng tạo, tinh thần cầu tiến</li>
</ul>',
                'location' => 'Hà Nội',
                'salary' => '18-28 triệu VNĐ',
                'deadline' => Carbon::now()->addMonths(3)->toDateString(),
                'status' => 'open'
            ]
        ];

        foreach ($recruitments as $recruitment) {
            Recruitment::updateOrCreate(
                ['slug' => $recruitment['slug']],
                $recruitment
            );
        }
    }
}
