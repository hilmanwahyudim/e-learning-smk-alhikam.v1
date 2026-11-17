<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('classes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('department_id')->constrained()->restrictOnDelete();
            $table->foreignId('academic_year_id')->constrained()->restrictOnDelete();
            $table->foreignId('homeroom_teacher_id')->nullable()->constrained('teachers')->nullOnDelete();
            $table->string('name', 50);
            $table->string('grade_level', 5); // X | XI | XII
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['academic_year_id', 'name']);
        });

        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete(); // null = mapel umum
            $table->string('code', 20)->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
            $table->foreignId('academic_year_id')->constrained()->cascadeOnDelete();
            $table->string('status', 20)->default('active');
            $table->timestamps();

            $table->unique(['student_id', 'academic_year_id']);
        });

        // Satu baris = satu guru mengampu satu mapel di satu kelas pada satu semester.
        Schema::create('teacher_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
            $table->foreignId('semester_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['subject_id', 'class_id', 'semester_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teacher_subjects');
        Schema::dropIfExists('enrollments');
        Schema::dropIfExists('subjects');
        Schema::dropIfExists('classes');
    }
};
