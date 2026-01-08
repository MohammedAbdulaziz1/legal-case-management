<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Permission extends Model
{
    protected $fillable = [
        'user_id',
        'module',
        'enabled',
        'view',
        'add',
        'edit',
        'delete',
    ];

    protected function casts(): array
    {
        return [
            'enabled' => 'boolean',
            'view' => 'boolean',
            'add' => 'boolean',
            'edit' => 'boolean',
            'delete' => 'boolean',
        ];
    }

    /**
     * Get the user that owns the permission.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
