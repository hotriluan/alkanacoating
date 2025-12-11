<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('project_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->string('image_url', 500);
            $table->string('caption')->nullable();
            $table->enum('image_type', ['main', 'gallery', 'before', 'after', 'progress', 'thumbnail'])->default('gallery');
            $table->integer('sort_order')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->string('alt_text')->nullable(); // For SEO
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['project_id', 'image_type']);
            $table->index(['project_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_images');
    }
};