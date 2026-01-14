<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CaseSession extends Model
{
    protected $table = 'case_sessions';

    protected $fillable = [
        'case_type',
        'case_number',
        'session_date',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'session_date' => 'date',
        ];
    }
}
