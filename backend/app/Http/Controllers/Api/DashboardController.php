<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appeal;
use App\Models\CaseRegistration;
use App\Models\SupremeCourt;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function stats(): JsonResponse
    {
        $primaryCases = CaseRegistration::count();
        $appealCases = Appeal::count();
        $supremeCases = SupremeCourt::count();
        $pendingCases = CaseRegistration::where('status', 'pending')
            ->orWhere('status', 'postponed')
            ->count() + Appeal::where('status', 'pending')
            ->orWhere('status', 'postponed')
            ->count() + SupremeCourt::where('status', 'pending')
            ->orWhere('status', 'postponed')
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'primaryCases' => $primaryCases,
                'appealCases' => $appealCases,
                'supremeCases' => $supremeCases,
                'pendingCases' => $pendingCases,
            ],
        ]);
    }
}
