<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('applications')) {
            Schema::create('applications', function (Blueprint $table) {
                $table->id();
                $table->foreignId('recruitment_id')->constrained('recruitments')->onDelete('cascade');
                $table->string('name');
                $table->string('email');
                $table->string('phone')->nullable();
                $table->string('cv_file')->nullable(); // Path to uploaded CV
                $table->text('cover_letter')->nullable();
                $table->enum('status', ['new', 'reviewing', 'shortlisted', 'rejected', 'accepted'])->default('new');
                $table->text('admin_notes')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
