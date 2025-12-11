<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('menus', function (Blueprint $table) {
            if (!Schema::hasColumn('menus', 'promo_title')) {
                $table->string('promo_title')->nullable()->after('image');
            }
            if (!Schema::hasColumn('menus', 'promo_cta')) {
                $table->string('promo_cta')->nullable()->after('promo_title');
            }
            if (!Schema::hasColumn('menus', 'promo_image')) {
                $table->string('promo_image')->nullable()->after('promo_cta');
            }
        });
    }

    public function down()
    {
        Schema::table('menus', function (Blueprint $table) {
            if (Schema::hasColumn('menus', 'promo_image')) {
                $table->dropColumn('promo_image');
            }
            if (Schema::hasColumn('menus', 'promo_cta')) {
                $table->dropColumn('promo_cta');
            }
            if (Schema::hasColumn('menus', 'promo_title')) {
                $table->dropColumn('promo_title');
            }
        });
    }
};
