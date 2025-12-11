<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddMegaFieldsToMenusTable extends Migration
{
    /**
     * Run the migrations.
     * Adds: type (string), payload (json nullable), icon (string nullable), image (string nullable)
     * These fields allow building a database-backed mega menu where 'payload' stores columns/blocks.
     */
    public function up()
    {
        if (Schema::hasTable('menus')) {
            Schema::table('menus', function (Blueprint $table) {
                if (!Schema::hasColumn('menus', 'type')) {
                    $table->string('type')->default('default')->after('url');
                }
                if (!Schema::hasColumn('menus', 'payload')) {
                    $table->json('payload')->nullable()->after('type');
                }
                if (!Schema::hasColumn('menus', 'icon')) {
                    $table->string('icon')->nullable()->after('payload');
                }
                if (!Schema::hasColumn('menus', 'image')) {
                    $table->string('image')->nullable()->after('icon');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        if (Schema::hasTable('menus')) {
            Schema::table('menus', function (Blueprint $table) {
                if (Schema::hasColumn('menus', 'image')) $table->dropColumn('image');
                if (Schema::hasColumn('menus', 'icon')) $table->dropColumn('icon');
                if (Schema::hasColumn('menus', 'payload')) $table->dropColumn('payload');
                if (Schema::hasColumn('menus', 'type')) $table->dropColumn('type');
            });
        }
    }
}
