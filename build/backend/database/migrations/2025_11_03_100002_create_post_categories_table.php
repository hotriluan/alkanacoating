<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('post_categories')) {
            Schema::create('post_categories', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug')->unique();
                $table->text('description')->nullable();
                $table->string('icon')->nullable();
                $table->string('color')->default('#3b82f6')->comment('Hex color code');
                $table->string('image')->nullable();
                $table->integer('order')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }
        
        // Add category_id as foreign key to posts if column exists
        if (Schema::hasColumn('posts', 'category_id')) {
            Schema::table('posts', function (Blueprint $table) {
                try {
                    $table->foreign('category_id')->references('id')->on('post_categories')->onDelete('set null');
                } catch (\Exception $e) {
                    // FK might already exist
                }
            });
        }
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
        });
        
        Schema::dropIfExists('post_categories');
    }
};
