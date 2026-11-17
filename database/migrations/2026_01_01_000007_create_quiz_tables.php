<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Bank soal: milik mapel, dibuat oleh guru.
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->foreignId('teacher_id')->constrained()->cascadeOnDelete();
            $table->string('type', 20); // multiple_choice | true_false | short_answer | essay
            $table->text('body');
            $table->string('answer_key')->nullable(); // kunci isian singkat
            $table->unsignedSmallInteger('default_points')->default(1);
            $table->text('explanation')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['subject_id', 'type']);
        });

        Schema::create('question_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained()->cascadeOnDelete();
            $table->string('label', 5)->nullable();
            $table->text('body');
            $table->boolean('is_correct')->default(false);
            $table->timestamps();
        });

        Schema::create('quizzes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_subject_id')->constrained()->cascadeOnDelete();
            $table->string('type', 10)->default('quiz'); // quiz | exam
            $table->string('title');
            $table->text('instructions')->nullable();
            $table->timestamp('start_at')->nullable();
            $table->timestamp('end_at')->nullable();
            $table->unsignedSmallInteger('duration_minutes')->default(60);
            $table->boolean('shuffle_questions')->default(false);
            $table->boolean('shuffle_options')->default(false);
            $table->unsignedTinyInteger('max_attempts')->default(1);
            $table->boolean('show_result')->default(true);
            $table->boolean('is_published')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['teacher_subject_id', 'start_at']);
        });

        Schema::create('quiz_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained()->cascadeOnDelete();
            $table->foreignId('question_id')->constrained()->cascadeOnDelete();
            $table->decimal('points', 5, 2)->default(1);
            $table->unsignedInteger('sort_order')->default(0);

            $table->unique(['quiz_id', 'question_id']);
        });

        Schema::create('quiz_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->dateTime('started_at');
            $table->timestamp('finished_at')->nullable();
            $table->string('status', 20)->default('in_progress'); // in_progress | submitted | graded
            $table->json('question_order')->nullable(); // urutan acak yang dilihat siswa
            $table->decimal('auto_score', 6, 2)->default(0);
            $table->decimal('manual_score', 6, 2)->default(0);
            $table->decimal('total_score', 6, 2)->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();

            $table->index(['quiz_id', 'student_id']);
        });

        Schema::create('quiz_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_attempt_id')->constrained()->cascadeOnDelete();
            $table->foreignId('question_id')->constrained()->cascadeOnDelete();
            $table->foreignId('option_id')->nullable()->constrained('question_options')->nullOnDelete();
            $table->text('answer_text')->nullable();
            $table->boolean('is_correct')->nullable();
            $table->decimal('score', 5, 2)->nullable();
            $table->text('feedback')->nullable();
            $table->timestamps();

            $table->unique(['quiz_attempt_id', 'question_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_answers');
        Schema::dropIfExists('quiz_attempts');
        Schema::dropIfExists('quiz_questions');
        Schema::dropIfExists('quizzes');
        Schema::dropIfExists('question_options');
        Schema::dropIfExists('questions');
    }
};
