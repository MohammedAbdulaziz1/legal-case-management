<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CaseRegistration extends Model
{
    protected $table = 'case_registration';
    protected $primaryKey = 'assigned_case_registration_request_id';
    public $incrementing = true;

    protected $fillable = [
        'assigned_case_registration_request_id',
        'first_instance_judgment',
        'case_date',
        'case_number',
        'session_date',
        'court_number',
        'title',
        'client',
        'opponent',
        'judge',
        'next_session_date',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'case_date' => 'date',
            'session_date' => 'date',
            'next_session_date' => 'date',
        ];
    }

    /**
     * Get the appeals for the case registration.
     */
    public function appeals(): HasMany
    {
        return $this->hasMany(Appeal::class, 'assigned_case_registration_request_id');
    }
}
