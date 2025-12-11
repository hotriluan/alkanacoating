<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('project_testimonials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->string('client_name');
            $table->string('client_position')->nullable();
            $table->string('client_company')->nullable();
            $table->text('testimonial');
            $table->integer('rating')->default(5)->comment('1-5 star rating');
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_published')->default(true);
            $table->string('client_avatar')->nullable(); // Profile image
            $table->date('project_completion_date')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['project_id', 'is_published']);
            $table->index(['project_id', 'is_featured']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_testimonials');
    }
};