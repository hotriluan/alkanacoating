<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * This migration will remove duplicate root-level menu entries that share the same URL,
     * preserving the earliest (lowest id) entry for each URL.
     *
     * @return void
     */
    public function up()
    {
        // This uses raw SQL to find duplicate root menus (parent_id IS NULL) grouped by url
        // and deletes rows with id not in the MIN(id) for that url.
        $driver = DB::getDriverName();

        if ($driver === 'sqlite') {
            // SQLite doesn't support subquery deletes in the same way; use a two-step approach
            $duplicates = DB::table('menus as m')
                ->select('m.id')
                ->leftJoin(DB::raw('(select url, min(id) as keep_id from menus where parent_id is null group by url) k'), function($join){
                    $join->on('m.url', '=', 'k.url');
                })
                ->whereNull('m.parent_id')
                ->whereRaw('m.id != k.keep_id')
                ->pluck('m.id')
                ->toArray();

            if (!empty($duplicates)) {
                DB::table('menus')->whereIn('id', $duplicates)->delete();
            }
        } else {
            // For MySQL/Postgres: delete rows where id NOT IN the min(id) per url
            $sql = "DELETE FROM menus WHERE parent_id IS NULL AND id NOT IN (SELECT keep_id FROM (SELECT MIN(id) AS keep_id FROM menus WHERE parent_id IS NULL GROUP BY url) AS t)";
            DB::statement($sql);
        }
    }

    /**
     * Reverse the migrations.
     * There's no easy undo for deleted rows; this migration is irreversible.
     * We leave the down empty to avoid accidental data resurrection.
     *
     * @return void
     */
    public function down()
    {
        // irreversible
    }
};