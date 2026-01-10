<?php

use App\Http\Controllers\Api\AppealController;
use App\Http\Controllers\Api\ArchiveController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CaseRegistrationController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\SupremeCourtController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Authentication
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);

    // Primary Cases
    Route::get('/cases/primary/export', [CaseRegistrationController::class, 'export']);
    Route::apiResource('cases/primary', CaseRegistrationController::class);

    // Appeal Cases
    Route::apiResource('cases/appeal', AppealController::class);

    // Supreme Court Cases
    Route::apiResource('cases/supreme', SupremeCourtController::class);

    // Users
    Route::apiResource('users', UserController::class);
    Route::get('/users/{user}/permissions', [UserController::class, 'permissions']);
    Route::put('/users/{user}/permissions', [UserController::class, 'updatePermissions']);

    // Archive
    Route::get('/archive', [ArchiveController::class, 'index']);
    Route::get('/archive/{archive}', [ArchiveController::class, 'show']);
    Route::get('/archive/case/{caseType}/{caseId}', [ArchiveController::class, 'caseHistory']);
    Route::get('/archive/export', [ArchiveController::class, 'export']);

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // Documents
    Route::apiResource('documents', DocumentController::class);
    Route::get('/documents/{document}/download', [DocumentController::class, 'download']);
});
