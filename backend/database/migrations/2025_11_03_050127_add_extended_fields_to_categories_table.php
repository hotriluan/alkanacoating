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
        Schema::table('categories', function (Blueprint $table) {
            // Description field
            $table->text('description')->nullable()->after('name');
            
            // Icon/emoji field
            $table->string('icon', 10)->nullable()->after('description');
            
            // Color field (hex code)
            $table->string('color', 7)->nullable()->after('icon');
            
            // Parent category for hierarchy
            $table->unsignedBigInteger('parent_id')->nullable()->after('color');
            $table->foreign('parent_id')->references('id')->on('categories')->onDelete('set null');
            
            // Display order
            $table->integer('order')->default(0)->after('parent_id');
            
            // SEO fields
            $table->string('meta_title')->nullable()->after('order');
            $table->text('meta_description')->nullable()->after('meta_title');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('categories', function (Blueprint $table) {
            // Drop foreign key first
            $table->dropForeign(['parent_id']);
            
            // Drop all added columns
            $table->dropColumn([
                'description',
                'icon',
                'color',
                'parent_id',
                'order',
                'meta_title',
                'meta_description'
            ]);
        });
    }
};
