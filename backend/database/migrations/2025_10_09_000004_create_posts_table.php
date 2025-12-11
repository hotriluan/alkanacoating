<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('posts')) {
            Schema::create('posts', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->string('slug')->unique();
                $table->string('excerpt')->nullable();
                $table->longText('content')->nullable();
                $table->string('image')->nullable();
                $table->unsignedBigInteger('category_id')->nullable();
                $table->string('status')->default('published');
                $table->boolean('is_featured')->default(false);
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
