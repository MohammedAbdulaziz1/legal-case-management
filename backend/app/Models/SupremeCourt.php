<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'supreme_date' => 'date',
        ];
    }

    /**
     * Get the appeal that the supreme court case belongs to.
     */
    public function appeal(): BelongsTo
    {
        return $this->belongsTo(Appeal::class, 'appeal_request_id');
    }
}
