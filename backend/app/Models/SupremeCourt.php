<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class SupremeCourt extends Model
{
    protected $table = 'supreme_court';
    protected $primaryKey = 'supreme_request_id';
    public $incrementing = true;

    protected $fillable = [
        'supreme_request_id',
        'supreme_date',
        'supreme_case_number',
        'appeal_request_id',
        'appealed_by',
        'supremeCourtJudgment',
        'judgementdate',
        'judgementrecivedate',
        'status',
        'priority',
        'notes',
        'court',
        'judge',
        'plaintiff',
        'plaintiff_lawyer',
        'defendant',
        'defendant_lawyer',
        'subject',
    ];

    protected function casts(): array
    {
        return [
            'supreme_date' => 'date',
            'judgementdate' => 'date',
            'judgementrecivedate' => 'date',
        ];
    }

    /**
     * Get the appeal that the supreme court case belongs to.
     */
    public function appeal(): BelongsTo
    {
        return $this->belongsTo(Appeal::class, 'appeal_request_id');
    }

    /**
     * Get all documents for this supreme court case.
     */
    public function documents(): MorphMany
    {
        return $this->morphMany(Document::class, 'documentable');
    }
}
