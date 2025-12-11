<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class UpdateFeaturedDataSeeder extends Seeder
{
    public function run()
    {
        // Only attempt updates if the tables have the is_featured column
        if (Schema::hasColumn('projects', 'is_featured')) {
            DB::table('projects')
                ->whereIn('id', [7, 8, 9])
                ->update(['is_featured' => true]);
        }

        if (Schema::hasColumn('posts', 'is_featured')) {
            DB::table('posts')
                ->whereIn('id', [9, 10, 11])
                ->update(['is_featured' => true]);
        }
    }
}