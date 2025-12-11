<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('menus', function (Blueprint $table) {
            $table->boolean('has_mega_menu')->default(false)->after('is_active');
            $table->json('mega_menu_config')->nullable()->after('has_mega_menu');
        });
    }

    public function down()
    {
        Schema::table('menus', function (Blueprint $table) {
            $table->dropColumn(['has_mega_menu', 'mega_menu_config']);
        });
    }
};
