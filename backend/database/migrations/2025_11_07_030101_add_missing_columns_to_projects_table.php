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
        Schema::table('projects', function (Blueprint $table) {
            // Add status column
            $table->string('status')->default('published')->after('is_published');
            // Add is_featured column
            $table->boolean('is_featured')->default(false)->after('is_published');
            // Add order column
            $table->integer('order')->default(0)->after('is_featured');
            // Add image column (alias for thumbnail)
            if (!Schema::hasColumn('projects', 'image')) {
                $table->string('image')->nullable()->after('thumbnail');
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['status', 'is_featured', 'order']);
            if (Schema::hasColumn('projects', 'image')) {
                $table->dropColumn('image');
            }
        });
    }
};
