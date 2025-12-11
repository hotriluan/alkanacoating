<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('sliders', function (Blueprint $table) {
            $table->text('description')->nullable()->after('subtitle');
            $table->string('button_text')->default('Khám phá ngay')->after('description');
            $table->enum('button_style', ['primary', 'secondary', 'outline'])->default('primary')->after('button_text');
            $table->enum('text_position', ['left', 'center', 'right'])->default('left')->after('button_style');
            $table->integer('overlay_opacity')->default(60)->after('text_position'); // 0-100
            $table->string('video_url')->nullable()->after('overlay_opacity');
            $table->enum('media_type', ['image', 'video'])->default('image')->after('video_url');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('sliders', function (Blueprint $table) {
            $table->dropColumn([
                'description',
                'button_text',
                'button_style',
                'text_position',
                'overlay_opacity',
                'video_url',
                'media_type'
            ]);
        });
    }
};
