<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Material extends Model
{
    use SoftDeletes;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'archived_at' => 'datetime',
        ];
    }

    public function teacherSubject(): BelongsTo
    {
        return $this->belongsTo(TeacherSubject::class);
    }

    public function files(): HasMany
    {
        return $this->hasMany(MaterialFile::class);
    }

    public function progress(): HasMany
    {
        return $this->hasMany(MaterialProgress::class);
    }

    public function scopeNotArchived($query)
    {
        return $query->whereNull('archived_at');
    }
}
