<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

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
        'court_number',
        'title',
        'client',
        'opponent',
        'plaintiff',
        'plaintiffLawyer',
        'defendant',
        'defendantLawyer',
        'court',
        'judge',
        'judgementdate',
        'judgementrecivedate',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'case_date' => 'date',
            'judgementrecivedate'  => 'date',
            'judgementdate'  => 'date',
        ];
    }

    /**
     * Get the appeals for the case registration.
     */
        public function appeal(): HasOne
        {
            return $this->hasOne(
                Appeal::class,
                'assigned_case_registration_request_id'
            );
        }
}
