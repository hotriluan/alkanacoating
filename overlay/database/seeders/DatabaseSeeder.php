<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\{Category,Product,Project,Post,Job,Setting};

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Settings
        $settings = [
            'company_name' => 'Alkana Coating',
            'company_email' => 'info@alkanacoating.com',
            'company_phone' => '0900 000 000',
            'facebook_url' => 'https://facebook.com',
            'zalo_url' => 'https://zalo.me'
        ];
        foreach ($settings as $k=>$v) {
            Setting::updateOrCreate(['key'=>$k], ['value'=>$v]);
        }

        // Categories and products
        $catNames = ['Sơn công nghiệp', 'Sơn epoxy', 'Chất phủ PU', 'Sơn chống ăn mòn'];
        $cats = collect($catNames)->map(function($n){
            return Category::firstOrCreate(['slug'=>Str::slug($n)], ['name'=>$n]);
        });

        foreach ($cats as $cat) {
            for ($i=1;$i<=6;$i++) {
                $name = $cat->name." mẫu $i";
                Product::updateOrCreate(
                    ['slug'=>Str::slug($name)],
                    [
                        'category_id'=>$cat->id,
                        'name'=>$name,
                        'thumbnail'=>null,
                        'excerpt'=>'Sản phẩm '.$name.' chất lượng cao.',
                        'content'=>'Nội dung chi tiết cho sản phẩm '.$name,
                        'specs'=>['mau_sac'=>'Đa dạng','dong_goi'=>'20kg']
                    ]
                );
            }
        }

        // Projects
        for ($i=1;$i<=6;$i++) {
            $title = "Dự án tiêu biểu $i";
            Project::updateOrCreate(['slug'=>Str::slug($title)], [
                'title'=>$title,
                'thumbnail'=>null,
                'excerpt'=>'Mô tả ngắn về dự án '.$i,
                'content'=>'Chi tiết dự án '.$i
            ]);
        }

        // Posts
        for ($i=1;$i<=6;$i++) {
            $title = "Bài viết chuyên ngành $i";
            Post::updateOrCreate(['slug'=>Str::slug($title)], [
                'title'=>$title,
                'thumbnail'=>null,
                'excerpt'=>'Tóm tắt nội dung bài viết '.$i,
                'content'=>'Nội dung chi tiết bài viết '.$i
            ]);
        }

        // Jobs
        for ($i=1;$i<=3;$i++) {
            $title = "Vị trí tuyển dụng $i";
            Job::updateOrCreate(['slug'=>Str::slug($title)], [
                'title'=>$title,
                'location'=>'Hồ Chí Minh',
                'type'=>'Toàn thời gian',
                'description'=>'Mô tả công việc '.$i
            ]);
        }
    }
}
<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\{Category, Product, Project, Post, Job, CompanySetting};
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        CompanySetting::updateOrCreate(['name'=>'company.name'], ['value'=>'Alkana Coating']);
        CompanySetting::updateOrCreate(['name'=>'company.email'], ['value'=>'info@alkanacoating.com']);
        CompanySetting::updateOrCreate(['name'=>'company.phone'], ['value'=>'0900 000 000']);
        CompanySetting::updateOrCreate(['name'=>'company.address'], ['value'=>'TP. Hồ Chí Minh, Việt Nam']);

        $cats = collect([
            ['name'=>'Sơn Epoxy','slug'=>'son-epoxy'],
            ['name'=>'Sơn PU','slug'=>'son-pu'],
            ['name'=>'Chống ăn mòn','slug'=>'chong-an-mon'],
        ])->map(fn($c)=>Category::firstOrCreate($c));

        $products = [
            ['category_id'=>$cats[0]->id,'name'=>'Epoxy Floor 100','slug'=>'epoxy-floor-100','summary'=>'Sơn epoxy sàn công nghiệp'],
            ['category_id'=>$cats[1]->id,'name'=>'PU Clear Pro','slug'=>'pu-clear-pro','summary'=>'Sơn PU phủ bóng'],
            ['category_id'=>$cats[2]->id,'name'=>'AntiCor 900','slug'=>'anticor-900','summary'=>'Sơn chống ăn mòn biển'],
        ];
        foreach ($products as $p) Product::firstOrCreate(['slug'=>$p['slug']], $p);

        $projects = [
            ['title'=>'Nhà xưởng A','slug'=>'nha-xuong-a','summary'=>'Thi công sơn epoxy sàn 5000m2'],
            ['title'=>'Bến cảng B','slug'=>'ben-cang-b','summary'=>'Chống ăn mòn kết cấu thép'],
        ];
        foreach ($projects as $p) Project::firstOrCreate(['slug'=>$p['slug']], $p);

        $posts = [
            ['title'=>'Chọn sơn epoxy cho sàn','slug'=>'chon-son-epoxy-cho-san','excerpt'=>'Những tiêu chí khi chọn sơn epoxy...'],
            ['title'=>'Quy trình chống ăn mòn','slug'=>'quy-trinh-chong-an-mon','excerpt'=>'Các bước chuẩn bị bề mặt và thi công...'],
        ];
        foreach ($posts as $p) Post::firstOrCreate(['slug'=>$p['slug']], $p);

        $jobs = [
            ['title'=>'Kỹ sư sơn','location'=>'HCM','type'=>'Full-time'],
            ['title'=>'Sales kỹ thuật','location'=>'HN','type'=>'Full-time'],
        ];
        foreach ($jobs as $j) Job::firstOrCreate(['title'=>$j['title']], $j);
    }
}
