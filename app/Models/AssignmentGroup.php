<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class AssignmentGroup extends Model
{
    protected $guarded = [];

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class);
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(Student::class, 'assignment_group_members', 'assignment_group_id', 'student_id');
    }
}
