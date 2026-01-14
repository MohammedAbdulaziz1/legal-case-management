<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Appeal extends Model
{
    protected $table = 'appeal';
    protected $primaryKey = 'appeal_request_id';
    public $incrementing = true;

    protected $fillable = [
        'appeal_request_id',
        'appeal_number',
        'appeal_date',
        'appeal_court_number',
        'appeal_judgment',
        'appealed_by',
        'judgementdate',
        'judgementrecivedate',
        'assigned_case_registration_request_id',
        'status',
        'priority',
        'notes',
        'plaintiff',
        'plaintiff_lawyer',
        'defendant',
        'defendant_lawyer',
        'subject',
        'judge',
    ];

    protected function casts(): array
    {
        return [
            'appeal_date' => 'date',
            'judgementdate' => 'date',
            'judgementrecivedate' => 'date',
            'judgementrecivedate' => 'date',
        ];
    }

    /**
     * Get the case registration that the appeal belongs to.
     */
    public function caseRegistration(): BelongsTo
    {
        return $this->belongsTo(CaseRegistration::class, 'assigned_case_registration_request_id');
    }

    /**
     * Get the supreme court cases for the appeal.
     */
    public function supremeCourtCases(): HasMany
    {
        return $this->hasMany(SupremeCourt::class, 'appeal_request_id');
    }
}
