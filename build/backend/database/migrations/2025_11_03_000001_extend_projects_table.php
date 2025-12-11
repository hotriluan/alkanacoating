<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            // Client and project details
            $table->string('client')->nullable()->after('content');
            $table->string('location')->nullable()->after('client');
            $table->date('start_date')->nullable()->after('location');
            $table->date('end_date')->nullable()->after('start_date');
            $table->string('budget_range')->nullable()->after('end_date');
            $table->string('project_type')->nullable()->after('budget_range');
            
            // Progress tracking
            $table->integer('progress_percentage')->default(0)->after('project_type');
            
            // SEO and meta
            $table->string('meta_title')->nullable()->after('progress_percentage');
            $table->text('meta_description')->nullable()->after('meta_title');
            $table->text('short_description')->nullable()->after('meta_description');
            
            // Additional info
            $table->json('features')->nullable()->after('short_description'); // Store project features as JSON
            $table->string('video_url')->nullable()->after('features'); // YouTube/Vimeo embed
            $table->boolean('is_published')->default(true)->after('video_url');
            
            // View tracking
            $table->integer('view_count')->default(0)->after('is_published');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn([
                'client',
                'location', 
                'start_date',
                'end_date',
                'budget_range',
                'project_type',
                'progress_percentage',
                'meta_title',
                'meta_description',
                'short_description',
                'features',
                'video_url',
                'is_published',
                'view_count'
            ]);
        });
    }
};