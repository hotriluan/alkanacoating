<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // Create archive table if not exists
        if (!Schema::hasTable('archived_menus')) {
            Schema::create('archived_menus', function ($table) {
                $table->bigIncrements('id');
                $table->unsignedBigInteger('original_id')->nullable();
                $table->string('name');
                $table->string('url');
                $table->unsignedBigInteger('parent_id')->nullable();
                $table->integer('order')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // Move duplicates into archive and delete them from menus
        $driver = DB::getDriverName();

        if ($driver === 'sqlite') {
            $duplicates = DB::table('menus as m')
                ->select('m.*')
                ->leftJoin(DB::raw('(select url, min(id) as keep_id from menus where parent_id is null group by url) k'), function($join){
                    $join->on('m.url', '=', 'k.url');
                })
                ->whereNull('m.parent_id')
                ->whereRaw('m.id != k.keep_id')
                ->get();

            foreach ($duplicates as $row) {
                DB::table('archived_menus')->insert([
                    'original_id' => $row->id,
                    'name' => $row->name,
                    'url' => $row->url,
                    'parent_id' => $row->parent_id,
                    'order' => $row->order,
                    'is_active' => $row->is_active,
                    'created_at' => $row->created_at,
                    'updated_at' => $row->updated_at,
                ]);

                DB::table('menus')->where('id', $row->id)->delete();
            }
        } else {
            // For MySQL/Postgres: insert duplicates into archive then delete
            DB::statement("INSERT INTO archived_menus (original_id, name, url, parent_id, `order`, is_active, created_at, updated_at) SELECT id, name, url, parent_id, `order`, is_active, created_at, updated_at FROM menus WHERE parent_id IS NULL AND id NOT IN (SELECT MIN(id) FROM menus WHERE parent_id IS NULL GROUP BY url)");
            DB::statement("DELETE FROM menus WHERE parent_id IS NULL AND id NOT IN (SELECT keep_id FROM (SELECT MIN(id) AS keep_id FROM menus WHERE parent_id IS NULL GROUP BY url) AS t)");
        }
    }

    public function down()
    {
        // Move archived menus back to menus and clear archive
        if (Schema::hasTable('archived_menus')) {
            $archived = DB::table('archived_menus')->get();
            foreach ($archived as $row) {
                DB::table('menus')->insert([
                    'id' => $row->original_id ?? null,
                    'name' => $row->name,
                    'url' => $row->url,
                    'parent_id' => $row->parent_id,
                    'order' => $row->order,
                    'is_active' => $row->is_active,
                    'created_at' => $row->created_at,
                    'updated_at' => $row->updated_at,
                ]);
            }
            DB::table('archived_menus')->truncate();
        }
    }
};
