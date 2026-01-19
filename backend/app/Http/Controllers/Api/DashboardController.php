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
     * Judgment type for Primary: only الغاء القرار, رفض الدعوة, تاجيل (matches PrimaryCases.jsx).
     */
    private function getJudgmentTypePrimary(?string $text): string
    {
        if ($text === null || $text === '') {
            return 'PENDING';
        }
        $j = mb_strtolower((string) $text, 'UTF-8');
        if (str_contains($j, 'الغاء القرار')) {
            return 'CANCELED';
        }
        if (str_contains($j, 'رفض الدعوة')) {
            return 'REJECTED';
        }
        if (str_contains($j, 'تاجيل')) {
            return 'POSTPONED';
        }
        return 'PENDING';
    }

    /**
     * Outcome for Primary: 1=win, 2=loss, 0=loading. Null/empty judgment → 0.
     */
    private function getOutcomePrimary(?string $judgment): int
    {
        $t = $this->getJudgmentTypePrimary($judgment);
        if ($t === 'CANCELED') {
            return 1;
        }
        if ($t === 'REJECTED') {
            return 2;
        }
        return 0;
    }

    /**
     * Judgment type for Appeal/Supreme (matches AppealCases / SupremeCourtCases).
     */
    private function getJudgmentTypeAppealSupreme(?string $text): string
    {
        if ($text === null || $text === '') {
            return 'PENDING';
        }
        $j = mb_strtolower((string) $text, 'UTF-8');
        if (str_contains($j, 'الغاء') || str_contains($j, 'الغاء الحكم') || str_contains($j, 'الغاء القرار')) {
            return 'CANCELED';
        }
        if (str_contains($j, 'رفض الدعوة')) {
            return 'REJECTED';
        }
        if (str_contains($j, 'بتأييد الحكم')) {
            return 'ACCEPTED';
        }
        if (str_contains($j, 'تاجيل') || str_contains($j, 'تأجيل')) {
            return 'POSTPONED';
        }
        return 'PENDING';
    }

    /**
     * Party from appealed_by: company, tga, or null.
     */
    private function getAppealedParty(?string $text): ?string
    {
        if ($text === null || $text === '') {
            return null;
        }
        $v = (string) $text;
        if (str_contains($v, 'الشركة') || str_contains($v, 'شركة')) {
            return 'company';
        }
        if (str_contains($v, 'هيئة') || str_contains($v, 'النقل')) {
            return 'tga';
        }
        return null;
    }

    /**
     * Outcome for Appeal/Supreme: 1=win, 2=loss, 0=loading. Null/empty judgment → 0. Null party → 2.
     */
    private function getOutcomeAppealSupreme(?string $judgment, ?string $appealedBy): int
    {
        $t = $this->getJudgmentTypeAppealSupreme($judgment);
        if ($t === 'PENDING' || $t === 'POSTPONED') {
            return 0;
        }
        $party = $this->getAppealedParty($appealedBy);
        $isWin = ($party === 'company' && $t === 'CANCELED')
            || ($party === 'tga' && $t === 'ACCEPTED');
        return $isWin ? 1 : 2;
    }

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

        $wins = 0;
        $losses = 0;
        $loadingCases = 0;

        foreach (CaseRegistration::all() as $c) {
            $o = $this->getOutcomePrimary($c->first_instance_judgment);
            if ($o === 1) {
                $wins++;
            } elseif ($o === 2) {
                $losses++;
            } else {
                $loadingCases++;
            }
        }
        foreach (Appeal::all() as $a) {
            $o = $this->getOutcomeAppealSupreme($a->appeal_judgment, $a->appealed_by);
            if ($o === 1) {
                $wins++;
            } elseif ($o === 2) {
                $losses++;
            } else {
                $loadingCases++;
            }
        }
        foreach (SupremeCourt::all() as $s) {
            $o = $this->getOutcomeAppealSupreme($s->supremeCourtJudgment, $s->appealed_by);
            if ($o === 1) {
                $wins++;
            } elseif ($o === 2) {
                $losses++;
            } else {
                $loadingCases++;
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'primaryCases' => $primaryCases,
                'appealCases' => $appealCases,
                'supremeCases' => $supremeCases,
                'pendingCases' => $pendingCases,
                'wins' => $wins,
                'losses' => $losses,
                'loadingCases' => $loadingCases,
            ],
        ]);
    }
}
