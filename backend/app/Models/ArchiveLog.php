<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ArchiveLog extends Model
{
    protected $fillable = [
        'case_type',
        'case_id',
        'action',
        'old_data',
        'new_data',
        'user_id',
    ];

    protected function casts(): array
    {
        return [
            'old_data' => 'array',
            'new_data' => 'array',
        ];
    }

    /**
     * Get the user that created the archive log.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
