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
        Schema::table('settings', function (Blueprint $table) {
            $table->string('type')->default('text')->after('value');
            $table->string('group')->default('general')->after('type');
            $table->string('label')->nullable()->after('group');
            $table->text('description')->nullable()->after('label');
            $table->integer('order')->default(0)->after('description');
            
            $table->index('group');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->dropIndex(['group']);
            $table->dropColumn(['type', 'group', 'label', 'description', 'order']);
        });
    }
};
