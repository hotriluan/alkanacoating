<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('menus', function (Blueprint $table) {
            // Menu type and style
            $table->enum('menu_type', ['simple', 'dropdown', 'mega'])->default('simple')->after('url');
            $table->string('style_preset')->default('modern')->after('menu_type'); // modern, classic, minimal, cards
            
            // Layout configuration
            $table->integer('layout_columns')->default(3)->after('style_preset'); // For mega menu: 2, 3, 4 columns
            $table->string('max_width')->default('1200px')->after('layout_columns'); // Container max width
            
            // Display options
            $table->boolean('show_icon')->default(true)->after('max_width');
            $table->boolean('show_image')->default(false)->after('show_icon');
            $table->boolean('show_description')->default(false)->after('show_image');
            $table->text('description')->nullable()->after('show_description');
            
            // Badge and highlight
            $table->string('badge_text')->nullable()->after('description');
            $table->string('badge_color')->default('blue')->after('badge_text'); // blue, red, green, yellow, purple
            $table->boolean('is_highlighted')->default(false)->after('badge_color');
            
            // Custom styling
            $table->string('custom_class')->nullable()->after('is_highlighted');
            $table->text('custom_styles')->nullable()->after('custom_class'); // JSON for custom CSS
            
            // Mega menu specific
            $table->boolean('show_categories')->default(true)->after('custom_styles');
            $table->boolean('show_featured_items')->default(false)->after('show_categories');
            $table->integer('featured_items_count')->default(4)->after('show_featured_items');
            
            // Animation and effects
            $table->string('animation_type')->default('fade')->after('featured_items_count'); // fade, slide, scale
            $table->integer('animation_duration')->default(200)->after('animation_type'); // milliseconds
            
            // Mobile specific
            $table->boolean('mobile_collapsible')->default(true)->after('animation_duration');
            $table->string('mobile_icon')->nullable()->after('mobile_collapsible');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('menus', function (Blueprint $table) {
            $table->dropColumn([
                'menu_type',
                'style_preset',
                'layout_columns',
                'max_width',
                'show_icon',
                'show_image',
                'show_description',
                'description',
                'badge_text',
                'badge_color',
                'is_highlighted',
                'custom_class',
                'custom_styles',
                'show_categories',
                'show_featured_items',
                'featured_items_count',
                'animation_type',
                'animation_duration',
                'mobile_collapsible',
                'mobile_icon',
            ]);
        });
    }
};
