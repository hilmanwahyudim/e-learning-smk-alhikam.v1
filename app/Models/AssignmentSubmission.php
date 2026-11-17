<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Enums\SubmissionStatus;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssignmentSubmission extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'submitted_at' => 'datetime',
            'graded_at' => 'datetime',
            'is_late' => 'boolean',
            'score' => 'decimal:2',
        ];
    }

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(AssignmentGroup::class, 'group_id');
    }

    public function grader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'graded_by');
    }

    public function getStatusAttribute(): SubmissionStatus
    {
        return match (true) {
            $this->graded_at !== null => SubmissionStatus::Graded,
            $this->is_late => SubmissionStatus::Late,
            default => SubmissionStatus::Submitted,
        };
    }
}
