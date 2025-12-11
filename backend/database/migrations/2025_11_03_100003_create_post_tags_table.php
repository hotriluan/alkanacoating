<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('post_tags', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('color')->default('#6b7280')->comment('Hex color code');
            $table->integer('usage_count')->default(0);
            $table->timestamps();
        });
        
        // Pivot table for many-to-many relationship
        Schema::create('post_post_tag', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('post_id');
            $table->unsignedBigInteger('post_tag_id');
            $table->timestamps();
            
            $table->foreign('post_id')->references('id')->on('posts')->onDelete('cascade');
            $table->foreign('post_tag_id')->references('id')->on('post_tags')->onDelete('cascade');
            
            $table->unique(['post_id', 'post_tag_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('post_post_tag');
        Schema::dropIfExists('post_tags');
    }
};
