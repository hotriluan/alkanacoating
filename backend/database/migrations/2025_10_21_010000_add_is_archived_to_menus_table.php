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
		if (Schema::hasTable('menus')) {
			Schema::table('menus', function (Blueprint $table) {
				if (!Schema::hasColumn('menus', 'is_archived')) {
					$table->boolean('is_archived')->default(false)->after('is_active');
				}
			});
		}
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		if (Schema::hasTable('menus')) {
			Schema::table('menus', function (Blueprint $table) {
				if (Schema::hasColumn('menus', 'is_archived')) {
					$table->dropColumn('is_archived');
				}
			});
		}
	}
};

