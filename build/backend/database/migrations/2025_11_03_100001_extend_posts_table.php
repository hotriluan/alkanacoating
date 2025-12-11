<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            // Author & Media
            if (!Schema::hasColumn('posts', 'author_id')) {
                $table->unsignedBigInteger('author_id')->nullable();
            }
            if (!Schema::hasColumn('posts', 'thumbnail')) {
                $table->string('thumbnail')->nullable();
            }
            if (!Schema::hasColumn('posts', 'featured_image')) {
                $table->string('featured_image')->nullable();
            }
            
            // Content metadata
            if (!Schema::hasColumn('posts', 'tags')) {
                $table->json('tags')->nullable();
            }
            if (!Schema::hasColumn('posts', 'reading_time')) {
                $table->integer('reading_time')->default(0)->comment('Minutes');
            }
            if (!Schema::hasColumn('posts', 'view_count')) {
                $table->unsignedInteger('view_count')->default(0);
            }
            
            // Publishing
            if (!Schema::hasColumn('posts', 'published_at')) {
                $table->timestamp('published_at')->nullable();
            }
            if (!Schema::hasColumn('posts', 'is_published')) {
                $table->boolean('is_published')->default(false);
            }
            if (!Schema::hasColumn('posts', 'order')) {
                $table->integer('order')->default(0);
            }
            
            // SEO
            if (!Schema::hasColumn('posts', 'meta_title')) {
                $table->string('meta_title')->nullable();
            }
            if (!Schema::hasColumn('posts', 'meta_description')) {
                $table->text('meta_description')->nullable();
            }
            if (!Schema::hasColumn('posts', 'meta_keywords')) {
                $table->string('meta_keywords')->nullable();
            }
        });
        
        // Add foreign key if column exists
        Schema::table('posts', function (Blueprint $table) {
            if (Schema::hasColumn('posts', 'author_id')) {
                try {
                    $table->foreign('author_id')->references('id')->on('users')->onDelete('set null');
                } catch (\Exception $e) {
                    // Foreign key might already exist
                }
            }
        });
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropForeign(['author_id']);
            $table->dropColumn([
                'author_id',
                'thumbnail',
                'featured_image',
                'tags',
                'reading_time',
                'view_count',
                'published_at',
                'is_published',
                'order',
                'meta_title',
                'meta_description',
                'meta_keywords'
            ]);
        });
    }
};
